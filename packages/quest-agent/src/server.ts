import http from 'node:http';
import url from 'node:url';
import type { ChildProcess } from 'node:child_process';
import { WebSocketServer, type WebSocket } from 'ws';
import { startHealthServer } from './health.js';
import { ensureSandboxDir, listAvailableTools, checkCliAvailable } from './security.js';
import { getOrCreateToken, verifyToken } from './auth.js';
import { executeCommand } from './executor.js';
import type { AgentMessage, AgentRequest, AgentCancelRequest, AgentPongEvent, AgentErrorEvent, AgentProgressEvent } from './types.js';

const log = (...args: unknown[]): void => {
  const line = ['[quest-agent]', ...args].join(' ');
  process.stderr.write(line + '\n');
};

export interface ServerOptions {
  port: number;
  version: string;
  auth: boolean;
}

export interface RunningServer {
  close: () => Promise<void>;
  getAvailableTools: () => string[];
}

export function createServer(opts: ServerOptions): RunningServer {
  const startedAt = Date.now();
  const running = new Map<string, ChildProcess>();
  const availableBase = ['claude', 'codex', 'gemini'];
  const currentAvailable = (): string[] => listAvailableTools(availableBase);

  const httpServer = startHealthServer({
    port: opts.port,
    version: opts.version,
    getAvailableTools: currentAvailable,
    startedAt,
  });

  const token = opts.auth ? getOrCreateToken() : '';

  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    try {
      const parsed = new url.URL(request.url || '/', `http://localhost:${opts.port}`);
      if (opts.auth) {
        const provided = parsed.searchParams.get('token');
        const ok = verifyToken(provided, token);
        if (!ok) {
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
          return;
        }
      }
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } catch {
      socket.destroy();
    }
  });

  const sendError = (ws: WebSocket, request_id: string, message: string, retryable = false): void => {
    const ev: AgentErrorEvent = { type: 'error', request_id, message, retryable };
    ws.send(JSON.stringify(ev));
  };

  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (raw) => {
      let msg: AgentMessage;
      try {
        msg = JSON.parse(String(raw));
      } catch (e) {
        // cannot parse, drop
        return;
      }

      if (msg.type === 'ping') {
        const pong: AgentPongEvent = {
          type: 'pong',
          request_id: msg.id,
          available_tools: currentAvailable(),
          version: opts.version,
        };
        ws.send(JSON.stringify(pong));
        return;
      }

      if (msg.type === 'cancel') {
        const m = msg as AgentCancelRequest;
        const child = running.get(m.payload.request_id);
        if (child) {
          try {
            child.kill('SIGTERM');
            setTimeout(() => child.kill('SIGKILL'), 2000);
            const ev: AgentProgressEvent = {
              type: 'progress',
              request_id: m.payload.request_id,
              message: `Cancellation requested for ${m.payload.request_id}`,
            };
            ws.send(JSON.stringify(ev));
          } catch (e) {
            sendError(ws, m.payload.request_id, `Failed to cancel: ${String(e)}`);
          }
        } else {
          sendError(ws, m.payload.request_id, 'No running process for request');
        }
        return;
      }

      if (msg.type === 'execute') {
        const req = msg as AgentRequest;
        const tool = req.payload.cli_tool;
        if (!checkCliAvailable(tool)) {
          sendError(ws, req.id, `CLI not found: ${tool}`, true);
          return;
        }
        let cwd: string;
        const wd = req.payload.working_directory;
        if (!wd || wd === 'sandbox') {
          cwd = ensureSandboxDir();
        } else {
          cwd = wd;
        }

        const timeoutSec = req.payload.max_execution_time && req.payload.max_execution_time > 0 ? req.payload.max_execution_time : 120;

        try {
          executeCommand(ws, req, running, { cwd, timeoutSec });
        } catch (e) {
          sendError(ws, req.id, `Execution rejected: ${String(e)}`);
        }
        return;
      }
    });
  });

  const close = async (): Promise<void> => {
    for (const [, child] of Array.from(running.entries())) {
      try {
        child.kill('SIGTERM');
        setTimeout(() => child.kill('SIGKILL'), 1000);
      } catch {
        // ignore
      }
    }
    await new Promise<void>((resolve) => wss.close(() => resolve()));
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  };

  return { close, getAvailableTools: currentAvailable };
}
