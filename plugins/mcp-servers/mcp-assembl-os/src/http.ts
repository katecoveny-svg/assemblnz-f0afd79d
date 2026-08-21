import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { createAssemblMcpServer } from './server.js';
import { withMcpRequestContext } from './request-context.js';

const handler = createMcpHandler(() => createAssemblMcpServer(), { responseMode: 'json' });

function safeEqual(actual: string, expected: string): boolean {
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function bearer(req: IncomingMessage): string | null {
  const header = req.headers.authorization ?? '';
  return header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : null;
}

function authMode(): 'oauth' | 'dev-token' {
  return process.env.ASSEMBL_MCP_AUTH_MODE === 'dev-token' ? 'dev-token' : 'oauth';
}

function accessTokenForRequest(req: IncomingMessage): string | null {
  const token = bearer(req);
  if (!token) return null;
  if (authMode() === 'dev-token') {
    const expected = process.env.ASSEMBL_MCP_CLIENT_TOKEN;
    if (!expected || !safeEqual(token, expected)) return null;
    return process.env.ASSEMBL_MCP_BRIDGE_TOKEN ?? null;
  }
  return token;
}

function publicUrl(req?: IncomingMessage): string {
  const configured = process.env.ASSEMBL_MCP_PUBLIC_URL?.replace(/\/$/, '');
  if (configured) return configured;
  if (!req) return 'http://127.0.0.1:8787';
  const protoHeader = req.headers['x-forwarded-proto'];
  const protocol = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader ?? 'http';
  return `${protocol}://${req.headers.host ?? '127.0.0.1:8787'}`;
}

function authServer(): string {
  const explicit = process.env.ASSEMBL_MCP_AUTHORIZATION_SERVER?.replace(/\/$/, '');
  if (explicit) return explicit;
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  return supabase ? `${supabase}/auth/v1` : '';
}

function resourceMetadata(req: IncomingMessage) {
  const authorizationServer = authServer();
  return {
    resource: publicUrl(req),
    ...(authorizationServer ? { authorization_servers: [authorizationServer] } : {}),
    // We only need an authenticated Supabase access token, not an OIDC ID token.
    // Avoiding `openid` keeps this compatible before a project migrates from a
    // symmetric JWT signing key. Business permissions are still Assembl-owned.
    scopes_supported: ['email', 'profile'],
    bearer_methods_supported: ['header'],
    resource_documentation: `${process.env.ASSEMBL_BASE_URL?.replace(/\/$/, '') ?? 'https://assembl.co.nz'}/docs/mcp`,
  };
}

function challenge(req: IncomingMessage, error?: string): string {
  const suffix = error ? `, error="invalid_token", error_description="${error.replace(/["\\]/g, '')}"` : '';
  return `Bearer resource_metadata="${publicUrl(req)}/.well-known/oauth-protected-resource", scope="email profile"${suffix}`;
}

async function preflightOAuth(accessToken: string): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (authMode() === 'dev-token') return { ok: true };
  const baseUrl = process.env.ASSEMBL_BASE_URL?.replace(/\/$/, '');
  if (!baseUrl) return { ok: false, status: 503, error: 'ASSEMBL_BASE_URL is not configured' };
  try {
    const response = await fetch(`${baseUrl}/api/mcp-auth`, {
      headers: { authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (response.ok) return { ok: true };
    const body = await response.json().catch(() => ({})) as { error?: string };
    return { ok: false, status: response.status, error: body.error ?? `auth_preflight_${response.status}` };
  } catch {
    return { ok: false, status: 503, error: 'auth_preflight_unavailable' };
  }
}

function allowedHost(req: IncomingMessage): boolean {
  const configured = (process.env.ASSEMBL_MCP_ALLOWED_HOSTS ?? '').split(',').map((v) => v.trim().toLowerCase()).filter(Boolean);
  if (configured.length === 0) return true;
  const host = (req.headers.host ?? '').split(':')[0]?.toLowerCase() ?? '';
  return configured.includes(host);
}

function allowedOrigin(req: IncomingMessage): boolean {
  const origin = req.headers.origin;
  if (!origin) return true;
  const configured = (process.env.ASSEMBL_MCP_ALLOWED_ORIGINS ?? '').split(',').map((v) => v.trim()).filter(Boolean);
  if (configured.length === 0) return false;
  return configured.includes(origin);
}

async function readBody(req: IncomingMessage): Promise<Buffer | undefined> {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE') return undefined;
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const item = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += item.length;
    if (size > 1_000_000) throw new Error('request body too large');
    chunks.push(item);
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
  res.end(Buffer.from(await response.arrayBuffer()));
}

const server = createServer(async (req, res) => {
  try {
    const url = requestUrl(req);

    if (url.pathname === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true, service: 'assembl-mcp-os', version: '0.2.0', auth: authMode() }));
      return;
    }

    if (url.pathname === '/.well-known/oauth-protected-resource' || url.pathname === '/.well-known/oauth-protected-resource/mcp') {
      res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' });
      res.end(JSON.stringify(resourceMetadata(req)));
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

    const accessToken = accessTokenForRequest(req);
    if (!accessToken) {
      res.writeHead(401, { 'content-type': 'application/json', 'www-authenticate': challenge(req) });
      res.end(JSON.stringify({ error: 'unauthorised' }));
      return;
    }

    const auth = await preflightOAuth(accessToken);
    if (!auth.ok) {
      const status = auth.status === 401 ? 401 : auth.status === 403 || auth.status === 409 ? auth.status : 503;
      res.writeHead(status, {
        'content-type': 'application/json',
        ...(status === 401 ? { 'www-authenticate': challenge(req, auth.error) } : {}),
      });
      res.end(JSON.stringify({ error: auth.error }));
      return;
    }

    const body = await readBody(req);
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) value.forEach((item) => headers.append(key, item));
      else if (value !== undefined) headers.set(key, value);
    }

    const request = new Request(url, { method: req.method, headers, ...(body ? { body } : {}) });
    const response = await withMcpRequestContext({ accessToken }, () => handler.fetch(request));
    await writeResponse(response, res);
  } catch (error) {
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'mcp_server_error', message: error instanceof Error ? error.message : 'unknown error' }));
  }
});

const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? '127.0.0.1';
server.listen(port, host, () => console.log(`[assembl-mcp-os] listening on http://${host}:${port}/mcp`));

async function shutdown() {
  await handler.close();
  server.close(() => process.exit(0));
}
process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());
