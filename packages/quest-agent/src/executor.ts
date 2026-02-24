import { spawn, type ChildProcess } from 'node:child_process';
import type WebSocket from 'ws';
import { validateAllowedCommands } from './security.js';
import type { AgentRequest, AgentStartEvent, AgentStdoutEvent, AgentStderrEvent, AgentCompleteEvent, AgentErrorEvent, AgentProgressEvent } from './types.js';

const log = (...args: unknown[]): void => {
  const line = ['[quest-agent]', ...args].join(' ');
  process.stderr.write(line + '\n');
};

export interface ExecuteRuntime {
  cwd: string;
  timeoutSec: number;
}

export function mapCliCommand(cli: 'claude' | 'codex' | 'gemini', prompt: string): { command: string; args: string[] } {
  switch (cli) {
    case 'claude':
      return { command: 'claude', args: ['--print', prompt] };
    case 'codex':
      return { command: 'codex', args: ['exec', prompt, '--full-auto'] };
    case 'gemini':
      return { command: 'gemini', args: [prompt] };
    default:
      // exhaustive guard
      return { command: cli, args: [prompt] };
  }
}

export function executeCommand(
  ws: WebSocket,
  req: AgentRequest,
  running: Map<string, ChildProcess>,
  runtime: ExecuteRuntime
): ChildProcess {
  const { id, payload } = req;

  const validation = validateAllowedCommands(payload.prompt, payload.allowed_commands);
  if (!validation.ok) {
    const ev: AgentErrorEvent = {
      type: 'error',
      request_id: id,
      message: `Disallowed commands detected: ${(validation.disallowed || []).join(', ')}`,
      retryable: false,
    };
    ws.send(JSON.stringify(ev));
    throw new Error('disallowed commands');
  }

  const { command, args } = mapCliCommand(payload.cli_tool, payload.prompt);
  const child = spawn(command, args, {
    cwd: runtime.cwd,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  });

  running.set(id, child);

  const startEvent: AgentStartEvent = {
    type: 'start',
    request_id: id,
    cli_tool: payload.cli_tool,
    pid: child.pid ?? -1,
  };
  ws.send(JSON.stringify(startEvent));

  let output = '';
  let timeoutHandle: NodeJS.Timeout | null = null;

  const timeoutMs = Math.max(1, runtime.timeoutSec) * 1000;
  timeoutHandle = setTimeout(() => {
    try {
      const ev: AgentProgressEvent = {
        type: 'progress',
        request_id: id,
        message: `Timeout exceeded (${runtime.timeoutSec}s). Killing process...`,
      };
      ws.send(JSON.stringify(ev));
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 2000);
    } catch (e) {
      // ignore
    }
  }, timeoutMs);

  child.stdout?.on('data', (chunk: Buffer) => {
    const text = chunk.toString('utf8');
    output += text;
    const ev: AgentStdoutEvent = { type: 'stdout', request_id: id, content: text };
    ws.send(JSON.stringify(ev));
  });

  child.stderr?.on('data', (chunk: Buffer) => {
    const text = chunk.toString('utf8');
    const ev: AgentStderrEvent = { type: 'stderr', request_id: id, content: text };
    ws.send(JSON.stringify(ev));
  });

  child.on('error', (err) => {
    const ev: AgentErrorEvent = {
      type: 'error',
      request_id: id,
      message: `Failed to start process: ${String(err)}`,
      retryable: true,
    };
    ws.send(JSON.stringify(ev));
  });

  child.on('close', (code: number | null) => {
    if (timeoutHandle) clearTimeout(timeoutHandle);
    running.delete(id);
    const exitCode = code ?? -1;
    const ev: AgentCompleteEvent = {
      type: 'complete',
      request_id: id,
      exit_code: exitCode,
      output,
    };
    ws.send(JSON.stringify(ev));
  });

  return child;
}

