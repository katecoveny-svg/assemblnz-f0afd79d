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

/**
 * Demo pilot basic-auth gate.
 *
 * Every hosted customer pilot workspace (`/customers/*` on any host, and the
 * whole demo.assembl.co.nz subdomain) sits behind one shared HTTP basic-auth
 * credential so pilots are never publicly crawlable. Credentials come from
 * env (DEMO_BASIC_AUTH_USER / DEMO_BASIC_AUTH_PASSWORD) and are compared
 * constant-time over SHA-256 digests (Web Crypto — edge-safe), so neither
 * length nor prefix leaks. Fails CLOSED if the env vars are missing.
 *
 * Deliberately public: static assets (incl. /brand/* fonts + patterns — CDN
 * caching matters more than hiding them), API routes, and Next internals.
 * The marketing site and splash never enter this gate — only /customers/*
 * and the demo host do.
 */
const DEMO_AUTH_EXEMPT_PREFIXES = [
  '/api/',
  '/_next/',
  '/.well-known',
  '/brand/',
  '/robots.txt',
  '/sitemap.xml',
  '/favicon',
];
const DEMO_AUTH_STATIC_FILE =
  /\.(?:png|jpe?g|gif|webp|avif|svg|ico|mp4|webm|txt|xml|json|woff2?|ttf|otf|css|js|map|webmanifest)$/i;

const needsDemoAuth = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  if (DEMO_AUTH_EXEMPT_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))) {
    return false;
  }
  if (DEMO_AUTH_STATIC_FILE.test(pathname)) return false;
  if (matchesPrefix(pathname, '/customers')) return true;

  const host = (request.headers.get('host') ?? '').toLowerCase();
  return DEMO_HOSTS.has(host);
};

async function sha256(input: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return new Uint8Array(digest);
}

/** Constant-time equality over equal-length digests. */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

const DEMO_401_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex, nofollow"/>
<title>assembl · demo</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Lato:wght@300;400&display=swap" rel="stylesheet"/>
<style>
  body { margin: 0; min-height: 100vh; display: grid; place-items: center;
         background: #101014; color: #f5f1e8; text-align: center;
         font-family: 'Lato', sans-serif; font-weight: 300; }
  .wm { font-family: 'Cormorant Garamond', serif; font-weight: 500;
        font-size: clamp(3rem, 8vw, 4.5rem); letter-spacing: 0.02em;
        text-transform: lowercase; margin: 0; }
  .wm span { color: #BFA37A; }
  p { font-size: 0.95rem; letter-spacing: 0.04em; color: rgba(245,241,232,.75);
      margin: 1.25rem 2rem 0; line-height: 1.7; }
  a { color: #BFA37A; text-decoration: none; }
</style>
</head>
<body>
<main>
  <h1 class="wm">assembl<span>.</span></h1>
  <p>sign in to view the demo · <a href="mailto:assembl@assembl.co.nz">assembl@assembl.co.nz</a> for access</p>
</main>
</body>
</html>`;

const demoUnauthorized = () =>
  new NextResponse(DEMO_401_HTML, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="assembl demo", charset="UTF-8"',
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

/** Returns a 401 response when the request needs (and lacks) demo auth, else null. */
const requireDemoAuth = async (request: NextRequest): Promise<NextResponse | null> => {
  if (!needsDemoAuth(request)) return null;

  const expectedUser = process.env.DEMO_BASIC_AUTH_USER;
  const expectedPassword = process.env.DEMO_BASIC_AUTH_PASSWORD;
  // Fail closed: no configured credentials means nobody gets in.
  if (!expectedUser || !expectedPassword) return demoUnauthorized();

  const header = request.headers.get('authorization') ?? '';
  if (!header.startsWith('Basic ')) return demoUnauthorized();

  let decoded = '';
  try {
    decoded = atob(header.slice(6).trim());
  } catch {
    return demoUnauthorized();
  }
  const sep = decoded.indexOf(':');
  if (sep < 0) return demoUnauthorized();

  const [gotUser, wantUser, gotPass, wantPass] = await Promise.all([
    sha256(decoded.slice(0, sep)),
    sha256(expectedUser),
    sha256(decoded.slice(sep + 1)),
    sha256(expectedPassword),
  ]);

  // Single combined check — no early exit on username mismatch.
  const userOk = timingSafeEqual(gotUser, wantUser);
  const passOk = timingSafeEqual(gotPass, wantPass);
  if (!(userOk && passOk)) return demoUnauthorized();

  return null;
};

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
  // Pilot workspaces are gated before anything else — including the demo-host
  // rewrite, which would otherwise return early and skip the check.
  const demoAuth = await requireDemoAuth(request);
  if (demoAuth) return demoAuth;

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
