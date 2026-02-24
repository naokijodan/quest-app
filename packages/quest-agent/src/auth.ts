import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

const log = (...args: unknown[]): void => {
  const line = ['[quest-agent]', ...args].join(' ');
  process.stderr.write(line + '\n');
};

export function tokenFilePath(): string {
  const dir = path.join(os.homedir(), '.quest-app');
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    // ignore
  }
  return path.join(dir, 'agent-token.json');
}

export function loadToken(): string | null {
  const file = tokenFilePath();
  if (!fs.existsSync(file)) return null;
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const obj = JSON.parse(raw);
    return typeof obj.token === 'string' ? obj.token : null;
  } catch (e) {
    log('failed to read token file:', String(e));
    return null;
  }
}

export function saveToken(token: string): void {
  const file = tokenFilePath();
  const payload = { token, created_at: new Date().toISOString() };
  try {
    fs.writeFileSync(file, JSON.stringify(payload, null, 2), { encoding: 'utf8', mode: 0o600 });
  } catch (e) {
    log('failed to write token file:', String(e));
    throw e;
  }
}

export function getOrCreateToken(): string {
  const existing = loadToken();
  if (existing) return existing;
  const token = crypto.randomUUID();
  saveToken(token);
  return token;
}

export function verifyToken(provided: string | null | undefined, expected: string): boolean {
  if (!provided) return false;
  // timing-safe compare
  try {
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

