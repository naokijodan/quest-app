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

// Create a per-request sandbox subdirectory
export function createRequestSandbox(requestId: string): string {
  const sanitized = requestId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dir = path.join(SANDBOX_DIR, sanitized);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// List files in a sandbox directory (non-recursive, top-level only)
export function listSandboxFiles(sandboxPath: string): string[] {
  try {
    return fs.readdirSync(sandboxPath);
  } catch {
    return [];
  }
}

// Remove old sandbox directories, keeping the most recent `keepCount`
export function cleanupOldSandboxes(keepCount: number = 20): void {
  try {
    const entries = fs.readdirSync(SANDBOX_DIR, { withFileTypes: true });
    const dirs = entries
      .filter(e => e.isDirectory())
      .map(e => ({
        name: e.name,
        fullPath: path.join(SANDBOX_DIR, e.name),
        mtime: fs.statSync(path.join(SANDBOX_DIR, e.name)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    const toRemove = dirs.slice(keepCount);
    for (const dir of toRemove) {
      fs.rmSync(dir.fullPath, { recursive: true, force: true });
    }
  } catch {
    // ignore cleanup errors
  }
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
