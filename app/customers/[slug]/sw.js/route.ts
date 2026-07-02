import { NextResponse } from 'next/server';
import { PWA_TENANTS } from '@/lib/pwa/tenants';
import { tenantServiceWorkerSource } from '@/lib/pwa/sw-template';

/**
 * Tenant-scoped service worker script.
 *
 * Served from INSIDE the workspace path so its default scope is the
 * workspace directory on whichever host it was fetched from:
 *   demo.assembl.co.nz/aironaut/sw.js         → scope /aironaut/
 *   www …/customers/aironaut/sw.js            → scope /customers/aironaut/
 *
 * Never behind a pilot gate (installs would break), and never at "/" —
 * see public/sw.js + PR #431 for why a root-scope worker is banned.
 */

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!PWA_TENANTS[slug]) {
    return new NextResponse('// not found', { status: 404, headers: { 'Content-Type': 'application/javascript' } });
  }

  return new NextResponse(tenantServiceWorkerSource(slug), {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      // Belt-and-braces: allow exactly the directory scope we register with.
      'Service-Worker-Allowed': './',
      // Let the browser re-check promptly so SW updates roll out fast.
      'Cache-Control': 'no-cache',
    },
  });
}
