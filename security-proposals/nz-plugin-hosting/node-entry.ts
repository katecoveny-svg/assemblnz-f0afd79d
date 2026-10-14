import type { IncomingMessage, ServerResponse } from 'node:http';
import { closedFreightEntry } from './freight-entry';
/** Separate-project closed entry only; no request body read, tool, app auth or env lookup. */
export default async function closedNodeEntry(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('cache-control', 'no-store'); res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('connection', 'close');
  try {
    const host = req.headers.host;
    if (!host || (req.url?.length ?? 0) > 2048 || Object.keys(req.headers).length > 64) { res.statusCode = 404; res.end(); return; }
    const headers = new Headers();
    let headerBytes = 0;
    for (const [name, value] of Object.entries(req.headers)) {
      const text = Array.isArray(value) ? value.join(',') : value ?? '';
      headerBytes += Buffer.byteLength(name) + Buffer.byteLength(text);
      if (headerBytes > 16384) { res.statusCode = 404; res.end(); return; }
      headers.set(name, text);
    }
    const response = await closedFreightEntry(new Request(new URL(req.url ?? '/', 'https://' + host), { method: req.method ?? 'GET', headers }));
    res.statusCode = response.status; response.headers.forEach((value, name) => res.setHeader(name, value)); res.end();
  } catch { res.statusCode = 404; res.end(); }
}
