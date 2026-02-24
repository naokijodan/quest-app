#!/usr/bin/env node
import { createServer } from './server.js';
import { listAvailableTools } from './security.js';

const log = (...args: unknown[]): void => {
  const line = ['[quest-agent]', ...args].join(' ');
  process.stderr.write(line + '\n');
};

const VERSION = '0.1.0';

function parseArgs(argv: string[]): { port: number; auth: boolean } {
  const envPort = process.env.QUEST_AGENT_PORT ? Number(process.env.QUEST_AGENT_PORT) : undefined;
  let port = envPort && !Number.isNaN(envPort) ? envPort : 3939;
  let auth = true;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--port' && i + 1 < argv.length) {
      const v = Number(argv[i + 1]);
      if (!Number.isNaN(v)) port = v;
      i++;
      continue;
    }
    if (a === '--no-auth') {
      auth = false;
      continue;
    }
  }
  return { port, auth };
}

async function main(): Promise<void> {
  const { port, auth } = parseArgs(process.argv.slice(2));
  const server = createServer({ port, version: VERSION, auth });
  const avail = listAvailableTools(['claude', 'codex', 'gemini']);
  log(`Quest Agent ${VERSION} listening on ws://localhost:${port}`);
  log(`Auth: ${auth ? 'enabled' : 'disabled'}`);
  log(`Available CLI tools: ${avail.join(', ') || 'none'}`);

  const shutdown = async (sig: string): Promise<void> => {
    log(`Received ${sig}, shutting down...`);
    await server.close();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();

