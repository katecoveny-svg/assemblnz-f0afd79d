import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { TENANT_SLUGS } from '@/lib/customers/tenants';

const SPA_ORIGIN = 'https://assembl-app.vercel.app';

/**
 * Hosts we recognise as the "demo hub" subdomain. On these hosts the whole
 * site is rewritten under `/customers/*` so pilots resolve at the short
 * path (e.g. `demo.assembl.co.nz/happy-tails` → `/customers/happy-tails`).
 */
const DEMO_HOSTS = new Set(['demo.assembl.co.nz']);

const PUBLIC_KETE_ROOTS = [
  'manaaki',
  'waihanga',
  'pikau',
  'arataki',
  'auaha',
  'ako',
  'hoko',
  'matauranga',
];

const SPA_PUBLIC_PREFIXES = [
  '/demos',
  '/aaaip',
  '/embed',
  '/verify',
];

const matchesPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

// Legacy bare kete slugs (/manaaki, /arataki, …) are pre-pivot surfaces. They
// now redirect straight to the /agents marketplace that replaced the kete packs
// (the old behaviour rewrote them to /kete/<root>, which itself now 301s to
// /agents — short-circuit that here so it's a single hop).
const legacyKeteRedirect = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  const [, root] = pathname.split('/');
  if (!PUBLIC_KETE_ROOTS.includes(root)) return null;

  const url = request.nextUrl.clone();
  url.pathname = '/agents';
  url.search = '';
  return NextResponse.redirect(url, 308);
};

const productRedirect = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  const url = request.nextUrl.clone();

  if (matchesPrefix(pathname, '/toro/route')) {
    url.pathname = '/app/voyage/italy';
    return NextResponse.redirect(url, 307);
  }

  if (matchesPrefix(pathname, '/toro/school-survival')) {
    url.pathname = '/hapai/9am-brief';
    return NextResponse.redirect(url, 307);
  }

  if (matchesPrefix(pathname, '/free-tools')) {
    url.pathname = '/hapai';
    return NextResponse.redirect(url, 307);
  }

  return null;
};

/**
 * Rewrite the demo subdomain so pilots resolve at their short slug.
 *
 * On demo.assembl.co.nz:
 *   `/`               → `/customers` (the hub)
 *   `/<known-slug>`   → `/customers/<known-slug>` (that pilot)
 *   `/<known-slug>/*` → `/customers/<known-slug>/*` (ops sub-routes)
 *
 * Everything else on the demo host (assets, API routes, existing
 * /customers/* paths, next.js internals) passes through untouched.
 */
const demoHostRewrite = (request: NextRequest) => {
  const host = (request.headers.get('host') ?? '').toLowerCase();
  if (!DEMO_HOSTS.has(host)) return null;

  const { pathname, search } = request.nextUrl;

  // Root ('/') should show the hub on the demo host.
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/customers';
    return NextResponse.rewrite(url);
  }

  // Never rewrite reserved / already-scoped paths.
  if (
    pathname.startsWith('/customers') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/.well-known') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/favicon.ico'
  ) {
    return null;
  }

  // First path segment must look like a known tenant slug before we rewrite.
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  if (!firstSegment || !TENANT_SLUGS.includes(firstSegment)) return null;

  const url = request.nextUrl.clone();
  url.pathname = `/customers${pathname}`;
  url.search = search;
  return NextResponse.rewrite(url);
};

const shouldProxyToSpa = (pathname: string) => {
  if (SPA_PUBLIC_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))) {
    return true;
  }

  if (pathname.startsWith('/assets/')) return true;
  if (pathname === '/widget.js') return true;
  if (pathname === '/manifest.json') return true;
  if (/^\/manifest-[^/]+\.json$/.test(pathname)) return true;
  if (pathname === '/favicon.png') return true;

  return false;
};

export async function middleware(request: NextRequest) {
  // demo.assembl.co.nz rewrites happen first so short-slug URLs work before
  // any product redirect or SPA proxy fires.
  const demoRewrite = demoHostRewrite(request);
  if (demoRewrite) return demoRewrite;

  const redirect = productRedirect(request);
  if (redirect) return redirect;

  const keteRedirect = legacyKeteRedirect(request);
  if (keteRedirect) return keteRedirect;

  if (shouldProxyToSpa(request.nextUrl.pathname)) {
    return NextResponse.rewrite(
      new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, SPA_ORIGIN),
    );
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - marketing favicon/OG/image public files
     * - dashboard/vessel-studio (uses its own legacy founder-gate cookie;
     *   not yet migrated to Supabase auth — out of scope for this PR)
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|images|videos|video|img|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$|dashboard/vessel-studio).*)',
    // Vite emits root-relative SPA assets with many extensions. The broad
    // matcher above intentionally skips public image files, so explicitly run
    // middleware for the SPA-owned asset namespace and manifest/widget files.
    '/assets/:path*',
    '/widget.js',
    '/manifest.json',
    '/manifest-:path*.json',
    '/favicon.png',
  ],
};
