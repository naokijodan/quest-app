import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const log = (...args: unknown[]): void => {
  const line = ['[quest-agent]', ...args].join(' ');
  process.stderr.write(line + '\n');
};

export const SANDBOX_DIR = path.join(os.homedir(), '.quest-app', 'sandbox');

export function ensureSandboxDir(): string {
  try {
    fs.mkdirSync(SANDBOX_DIR, { recursive: true });
  } catch (e) {
    log('failed to ensure sandbox dir:', String(e));
    throw e;
  }
  return SANDBOX_DIR;
}

export function which(cmd: string): string | null {
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [cmd], {
    stdio: 'pipe',
    encoding: 'utf8',
  });
  if (r.status === 0 && r.stdout) {
    const p = r.stdout.split(/\r?\n/).find(Boolean);
    return p || null;
  }
  return null;
}

export function checkCliAvailable(tool: string): boolean {
  const found = which(tool);
  return !!found;
}

export function listAvailableTools(tools: string[]): string[] {
  return tools.filter((t) => checkCliAvailable(t));
}

// Basic heuristic to detect disallowed commands in a prompt.
const KNOWN_SHELL_COMMANDS = [
  'rm',
  'mv',
  'cp',
  'curl',
  'wget',
  'ssh',
  'git',
  'npm',
  'yarn',
  'pnpm',
  'pip',
  'python',
  'node',
  'bash',
  'sh',
  'zsh',
  'make',
  'docker',
  'kubectl',
  'systemctl',
  'kill',
  'chmod',
  'chown',
  'ln',
  'sed',
  'awk',
  'find',
  'xargs',
];

export function validateAllowedCommands(
  prompt: string,
  allowed?: string[]
): { ok: boolean; disallowed?: string[] } {
  if (!allowed || allowed.length === 0) {
    return { ok: true };
  }
  const found = new Set<string>();
  for (const cmd of KNOWN_SHELL_COMMANDS) {
    const re = new RegExp(`(?:^|[\n\r\s\$;|&])${cmd}(?=\s|$)`, 'i');
    if (re.test(prompt)) {
      found.add(cmd);
    }
  }
  const disallowed = Array.from(found).filter(
    (c) => !allowed.map((x) => x.toLowerCase()).includes(c.toLowerCase())
  );
  if (disallowed.length > 0) {
    return { ok: false, disallowed };
  }
  return { ok: true };
}

