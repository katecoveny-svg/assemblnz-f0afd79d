import { doServiceWorkerSource } from '@/lib/do/do-service-worker';

/** DO-scoped PWA worker — registered at scope `/do/` only. */
export async function GET() {
  return new Response(doServiceWorkerSource(), {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Service-Worker-Allowed': '/do/',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
