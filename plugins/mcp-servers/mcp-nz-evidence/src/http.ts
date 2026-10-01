import { createMcpHandler } from '@modelcontextprotocol/server';
import { createSpecialistServer } from './server';
/** Unmounted transport factory. Deployment/host-level quotas/HTTPS require separate release approval. */
export function createSpecialistHttp(domain: 'freight' | 'architecture', origin: string) {
    const base = new URL(origin);
    if (base.protocol !== 'https:' && base.hostname !== '127.0.0.1')
        throw new Error('HTTPS required');
    const handler = createMcpHandler(() => createSpecialistServer(domain), { legacy: 'stateless', responseMode: 'json', maxSubscriptions: 0, onerror: () => { } });
    let active = 0, windowStart = Date.now(), count = 0;
    return { async fetch(request: Request) {
            const url = new URL(request.url);
            if (url.origin !== base.origin || url.pathname !== '/mcp')
                return new Response(null, { status: 404 });
            if (request.headers.has('origin') && request.headers.get('origin') !== base.origin)
                return new Response(null, { status: 403 });
            if (request.method !== 'POST')
                return new Response(null, { status: 405, headers: { Allow: 'POST' } });
            if (!request.headers.get('content-type')?.startsWith('application/json'))
                return new Response(null, { status: 415 });
            if (active >= 4)
                return new Response(null, { status: 429 });
            if (Date.now() - windowStart >= 60000) {
                windowStart = Date.now();
                count = 0;
            }
            if (++count > 60)
                return new Response(null, { status: 429 });
            const controller = new AbortController();
            const deadline = new Promise<never>((_, reject) => controller.signal.addEventListener('abort', () => reject(new Error()), { once: true }));
            const timer = setTimeout(() => controller.abort(), 10000);
            active++;
            try {
                const reader = request.body?.getReader();
                if (!reader)
                    return new Response(null, { status: 400 });
                const chunks: Uint8Array[] = [];
                let bytes = 0;
                try {
                    while (true) {
                        if (controller.signal.aborted)
                            throw new Error();
                        const { done, value } = await Promise.race([reader.read(), deadline]);
                        if (done)
                            break;
                        bytes += value.length;
                        if (bytes > 1024 * 1024) {
                            void reader.cancel().catch(() => { });
                            return new Response(null, { status: 413 });
                        }
                        chunks.push(value);
                    }
                }
                finally {
                    if (controller.signal.aborted)
                        void reader.cancel().catch(() => { });
                    reader.releaseLock();
                }
                const body = new Uint8Array(bytes);
                let offset = 0;
                for (const c of chunks) {
                    body.set(c, offset);
                    offset += c.length;
                }
                const response = await Promise.race([handler.fetch(new Request(request.url, { method: 'POST', headers: request.headers, body, signal: controller.signal })), deadline]);
                response.headers.set('Cache-Control', 'no-store');
                response.headers.set('X-Content-Type-Options', 'nosniff');
                return response;
            }
            catch {
                return new Response(null, { status: controller.signal.aborted ? 408 : 400, headers: { 'Cache-Control': 'no-store' } });
            }
            finally {
                clearTimeout(timer);
                active--;
            }
        }, close: () => handler.close() };
}
