import http, { IncomingMessage, ServerResponse } from 'node:http';

const log = (...args: unknown[]): void => {
  const line = ['[quest-agent]', ...args].join(' ');
  process.stderr.write(line + '\n');
};

export interface HealthOptions {
  port: number;
  version: string;
  getAvailableTools: () => string[];
  startedAt: number;
}

export function startHealthServer(opts: HealthOptions): http.Server {
  const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    try {
      if (!req.url) {
        res.statusCode = 400;
        res.end('Bad Request');
        return;
      }
      const url = new URL(req.url, `http://localhost:${opts.port}`);
      // CORS for PWA (localhost:3000 → Agent localhost:3939)
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }

      if (req.method === 'GET' && url.pathname === '/health') {
        const body = {
          status: 'ok',
          version: opts.version,
          available_tools: opts.getAvailableTools(),
          uptime: Math.floor((Date.now() - opts.startedAt) / 1000),
        };
        const json = JSON.stringify(body);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Length', Buffer.byteLength(json));
        res.end(json);
        return;
      }
      res.statusCode = 404;
      res.end('Not Found');
    } catch (e) {
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  server.on('clientError', (err, socket) => {
    log('client error:', String(err));
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  });

  server.listen(opts.port);
  return server;
}

