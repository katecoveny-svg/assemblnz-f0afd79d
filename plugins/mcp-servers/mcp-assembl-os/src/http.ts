import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { createAssemblMcpServer } from './server.js';

const handler = createMcpHandler(() => createAssemblMcpServer(), { responseMode: 'json' });

function safeEqual(actual: string, expected: string): boolean {
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function clientAuthorised(req: IncomingMessage): boolean {
  const expected = process.env.ASSEMBL_MCP_CLIENT_TOKEN;
  const allowAnonymous = process.env.ASSEMBL_MCP_ALLOW_ANONYMOUS === 'true';
  if (!expected) return allowAnonymous;
  const header = req.headers.authorization ?? '';
  return header.startsWith('Bearer ') && safeEqual(header.slice('Bearer '.length), expected);
}

function allowedHost(req: IncomingMessage): boolean {
  const configured = (process.env.ASSEMBL_MCP_ALLOWED_HOSTS ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  if (configured.length === 0) return true;
  const host = (req.headers.host ?? '').split(':')[0]?.toLowerCase() ?? '';
  return configured.includes(host);
}

function allowedOrigin(req: IncomingMessage): boolean {
  const origin = req.headers.origin;
  if (!origin) return true;
  const configured = (process.env.ASSEMBL_MCP_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  if (configured.length === 0) return false;
  return configured.includes(origin);
}

async function readBody(req: IncomingMessage): Promise<Buffer | undefined> {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE') return undefined;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    const size = chunks.reduce((sum, item) => sum + item.length, 0);
    if (size > 1_000_000) throw new Error('request body too large');
  }
  return chunks.length > 0 ? Buffer.concat(chunks) : undefined;
}

function requestUrl(req: IncomingMessage): URL {
  const protoHeader = req.headers['x-forwarded-proto'];
  const protocol = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader ?? 'http';
  const host = req.headers.host ?? '127.0.0.1';
  return new URL(req.url ?? '/', `${protocol}://${host}`);
}

async function writeResponse(response: Response, res: ServerResponse): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  const body = Buffer.from(await response.arrayBuffer());
  res.end(body);
}

const server = createServer(async (req, res) => {
  try {
    const url = requestUrl(req);

    if (url.pathname === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true, service: 'assembl-mcp-os', version: '0.1.0' }));
      return;
    }

    if (url.pathname !== '/mcp') {
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'not_found' }));
      return;
    }

    if (!allowedHost(req) || !allowedOrigin(req)) {
      res.writeHead(403, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'forbidden_origin' }));
      return;
    }

    if (!clientAuthorised(req)) {
      res.writeHead(401, {
        'content-type': 'application/json',
        'www-authenticate': 'Bearer realm="assembl-mcp"',
      });
      res.end(JSON.stringify({ error: 'unauthorised' }));
      return;
    }

    const body = await readBody(req);
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) value.forEach((item) => headers.append(key, item));
      else if (value !== undefined) headers.set(key, value);
    }

    const request = new Request(url, {
      method: req.method,
      headers,
      ...(body ? { body } : {}),
    });
    const response = await handler.fetch(request);
    await writeResponse(response, res);
  } catch (error) {
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({
      error: 'mcp_server_error',
      message: error instanceof Error ? error.message : 'unknown error',
    }));
  }
});

const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? '127.0.0.1';

server.listen(port, host, () => {
  console.log(`[assembl-mcp-os] listening on http://${host}:${port}/mcp`);
});

async function shutdown() {
  await handler.close();
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());
