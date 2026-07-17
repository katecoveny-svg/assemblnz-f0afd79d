import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { TENANT_SLUGS } from '@/lib/customers/tenants';
import {
  INVITE_COOKIE,
  buildInviteCookieValue,
  getInviteSecret,
  verifyInviteCookieValue,
  verifyInviteSlug,
} from '@/lib/demo-invites/crypto';
import { HUB_DEMO_MARKER, verifyHubToken } from '@/lib/demo-invites/gate';

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

// ---------------------------------------------------------------------------
// Coming-soon splash gate (live domain only).
//
// The fresh marketing site is being built in its own repo/project at
// staging.assembl.co.nz. Until it cuts over, the live domain shows ONLY the
// coming-soon splash (app/page.tsx). The splash used to render at `/` alone,
// so every other route (/login, /agents, …) fell through to the old app —
// which is how prospects saw the deprecated canary UI. This gate rewrites any
// non-exempt request on the live host to the splash so nothing else leaks.
//
// Exempt (must keep working while the domain is "closed"):
//   - /api/*            webhooks + Brevo inbound
//   - /for/*            per-prospect magic links (handled before this anyway)
//   - /customers/*      hosted pilots (own demo basic-auth + invite cookies)
//   - static + Next internals (/_next, /brand, favicon, robots, sitemap, …)
//
// Redirected (not rewritten — kills stale bookmarks/caches with a real 302):
//   - /login*           → / (the splash). The old app's sign-in form is gone
//                         from the live domain; nobody should ever see it.
//   - /admin*           → demo.assembl.co.nz/admin — the operator hub lives on
//                         the demo host now, where Supabase Auth is wired up.
// ---------------------------------------------------------------------------
const SPLASH_HOSTS = new Set(['assembl.co.nz', 'www.assembl.co.nz']);
const ADMIN_HOME = 'https://demo.assembl.co.nz';
const SPLASH_EXEMPT_PREFIXES = [
  '/api/',
  '/for/',
  '/customers',
  '/_next/',
  '/brand/',
  '/.well-known',
  '/assets/',
  // 3D assets (tui gaussian splat etc.) — .splat/.ply aren't in the static
  // extension regex, so without this the fetch gets the splash HTML back.
  '/3d/',
  // Living Site funnel — public marketing surfaces linked from the homepage.
  '/living-site',
  '/install',
  '/os',
  '/genome',
  '/pilot-sprint',
  '/health',
  // The marketing site proper (wiring audit 2026-07-10): the homepage IS the
  // real front door now, and it links to these — every path the nav, footers
  // and sitemap promise must actually serve on the apex. Anything NOT listed
  // (old app surfaces: /workflows, /kete, /operator, /dev, /internal, /app…)
  // still falls through to the splash rewrite.
  '/about',
  '/agents',
  '/pricing',
  '/how-it-works',
  '/trust',
  '/contact',
  '/mana-receipts',
  '/te-tiriti',
  '/legal',
  '/bundles',
  '/bills',
  '/faq',
  '/ai-use',
  '/data',
  '/hui',
  '/insurance',
  '/press',
  '/public-assembly',
  '/toro',
  '/assembling',
  '/hapai',
  '/free-tools',
  '/pattern-studio',
  '/ad-studio',
  // "Build an agent" — the Pilot flow is public (the homepage + /genome CTA
  // target it). Kept; the retired kete pricing pages (/industry-pack, /start,
  // /platform) are removed from the public surface.
  '/pilot',
  // Legacy /privacy path — exempt so the next.config redirect to
  // /legal/privacy fires instead of the splash rewrite shadowing it.
  '/privacy',
];
const SPLASH_EXEMPT_EXACT = new Set([
  '/robots.txt',
  '/sitemap.xml',
  '/favicon.ico',
  '/favicon.png',
  '/icon.png',
  '/apple-icon.png',
  '/manifest.json',
  '/manifest.webmanifest',
  '/widget.js',
]);
const SPLASH_STATIC_FILE =
  /\.(?:png|jpe?g|gif|webp|avif|svg|ico|mp4|webm|txt|xml|json|pdf|woff2?|ttf|otf|css|js|map|webmanifest|splat|ply|glb|gltf)$/i;

const splashGate = (request: NextRequest): NextResponse | null => {
  const host = (request.headers.get('host') ?? '').toLowerCase();
  if (!SPLASH_HOSTS.has(host)) return null; // only the live apex/www domain

  const { pathname } = request.nextUrl;
  if (pathname === '/') return null; // the splash already renders here

  // Stale sign-in URLs get a hard 302 home, not a rewrite — the redirect
  // shows in the URL bar and replaces any cached copy of the old form.
  if (matchesPrefix(pathname, '/login')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url, 302);
  }

  // The operator hub moved to the demo host (Supabase Auth lives there);
  // preserve the subpath + query so deep links keep working.
  if (matchesPrefix(pathname, '/admin')) {
    return NextResponse.redirect(
      `${ADMIN_HOME}${pathname}${request.nextUrl.search}`,
      302,
    );
  }

  // Emailed auth links belong on the demo host too — the session cookies must
  // be written there for the operator hub to see them. Magic-link emails sent
  // before 2026-07-05 point at this host (the old template used SiteURL);
  // forward them with the token intact instead of splashing them.
  if (matchesPrefix(pathname, '/auth')) {
    return NextResponse.redirect(
      `${ADMIN_HOME}${pathname}${request.nextUrl.search}`,
      302,
    );
  }

  if (SPLASH_EXEMPT_EXACT.has(pathname)) return null;
  if (SPLASH_EXEMPT_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))) return null;
  if (SPLASH_STATIC_FILE.test(pathname)) return null;

  // Everything else on the live domain → the coming-soon splash (URL bar
  // keeps the original path; the visitor just sees the quiet card).
  const url = request.nextUrl.clone();
  url.pathname = '/';
  url.search = '';
  return NextResponse.rewrite(url);
};

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
  // The operator hub carries its own (stronger) gate — ensureAdmin() over
  // Supabase Auth — and /auth/* is where its magic-link round-trip lands.
  // Basic auth in front of either would 401 the emailed sign-in link.
  '/admin',
  '/auth/',
  // /login on the demo host immediately 302s to /admin/login (see
  // demoHostRewrite) — exempt it so the redirect fires instead of the 401.
  '/login',
  // Living Site funnel — public everywhere, including the demo host.
  '/living-site',
  '/install',
  // Public Pattern Studio tool — reachable on the demo host too.
  '/pattern-studio',
  // Public Ad Studio — genome-driven ad generator, reachable on the demo host.
  '/ad-studio',
  // Public "build an agent" flow, reachable on the demo host too.
  '/pilot',
];
const DEMO_AUTH_STATIC_FILE =
  /\.(?:png|jpe?g|gif|webp|avif|svg|ico|mp4|webm|txt|xml|json|pdf|woff2?|ttf|otf|css|js|map|webmanifest|splat|ply|glb|gltf)$/i;

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
  .wm span { color: #b8964f; }
  p { font-size: 0.95rem; letter-spacing: 0.04em; color: rgba(245,241,232,.75);
      margin: 1.25rem 2rem 0; line-height: 1.7; }
  a { color: #b8964f; text-decoration: none; }
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

/** True when the request carries valid demo basic-auth credentials. */
const basicAuthOk = async (request: NextRequest): Promise<boolean> => {
  const expectedUser = process.env.DEMO_BASIC_AUTH_USER;
  const expectedPassword = process.env.DEMO_BASIC_AUTH_PASSWORD;
  // Fail closed: no configured credentials means nobody gets in this way.
  if (!expectedUser || !expectedPassword) return false;

  const header = request.headers.get('authorization') ?? '';
  if (!header.startsWith('Basic ')) return false;

  let decoded = '';
  try {
    decoded = atob(header.slice(6).trim());
  } catch {
    return false;
  }
  const sep = decoded.indexOf(':');
  if (sep < 0) return false;

  const [gotUser, wantUser, gotPass, wantPass] = await Promise.all([
    sha256(decoded.slice(0, sep)),
    sha256(expectedUser),
    sha256(decoded.slice(sep + 1)),
    sha256(expectedPassword),
  ]);

  // Single combined check — no early exit on username mismatch.
  const userOk = timingSafeEqual(gotUser, wantUser);
  const passOk = timingSafeEqual(gotPass, wantPass);
  return userOk && passOk;
};

/**
 * Returns a 401 response when the request needs (and lacks) demo auth, else null.
 *
 * Two grant paths, checked in order:
 *   1. the shared basic-auth credential (Kate + anyone she's told) — full access;
 *   2. a signed demo-invite cookie (magic link at /for/[slug]) — scoped to the
 *      ONE demo the invite was minted for, revocable per-row in demo_invites.
 * The basic-auth gate is untouched by the invite layer; invites are additive.
 */
const requireDemoAuth = async (request: NextRequest): Promise<NextResponse | null> => {
  if (!needsDemoAuth(request)) return null;

  if (await basicAuthOk(request)) return null;
  if (await inviteCookieAllows(request)) return null;

  return demoUnauthorized();
};

// ---------------------------------------------------------------------------
// Demo magic links (/for/[slug]) — signed, per-prospect, revocable.
//
// A link like /for/happy-tails-liana-a3f9b2 carries its own HMAC token as the
// final slug segment. The middleware verifies the HMAC BEFORE any DB lookup
// (constant-time — bad links never reach the invite table), then atomically
// records the open via the touch_demo_invite RPC, binds the browser to the
// demo with a signed httpOnly cookie, and rewrites into the pilot workspace.
// Revocation is live: every subsequent gated request re-checks revoked_at,
// so killing a row in /admin/invites locks the browser out immediately.
// ---------------------------------------------------------------------------

const INVITE_PATH = /^\/for\/([a-z0-9-]+)\/?$/;
const INVITE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const INVITE_INACTIVE_HTML = DEMO_401_HTML.replace(
  'sign in to view the demo',
  'this link isn&rsquo;t active anymore',
);

/** Branded "link retired" page — deliberately NO WWW-Authenticate header, so
 *  prospects see the page, never a browser credentials popup. */
const inviteInactive = () =>
  new NextResponse(INVITE_INACTIVE_HTML, {
    status: 401,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

type SupabaseRestConfig = { url: string; key: string };

const supabaseRestConfig = (): SupabaseRestConfig | null => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
};

type TouchedInvite = {
  demo: string;
  recipient_name: string;
  recipient_company: string;
  greeting_mode: string;
  revoked: boolean;
};

/** Validate + record an open in one round trip (service-role RPC). */
const touchInvite = async (slug: string): Promise<TouchedInvite | null> => {
  const cfg = supabaseRestConfig();
  if (!cfg) return null;
  try {
    const res = await fetch(`${cfg.url}/rest/v1/rpc/touch_demo_invite`, {
      method: 'POST',
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_slug: slug }),
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as TouchedInvite[];
    return rows?.[0] ?? null;
  } catch {
    return null;
  }
};

/** Live revocation check for cookie-holders. Fail closed on any error. */
const inviteStillActive = async (slug: string): Promise<boolean> => {
  const cfg = supabaseRestConfig();
  if (!cfg) return false;
  try {
    const res = await fetch(
      `${cfg.url}/rest/v1/demo_invites?slug=eq.${encodeURIComponent(slug)}&select=revoked_at`,
      { headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` } },
    );
    if (!res.ok) return false;
    const rows = (await res.json()) as Array<{ revoked_at: string | null }>;
    return rows.length === 1 && rows[0].revoked_at === null;
  } catch {
    return false;
  }
};

/** Which tenant a gated request is scoped to (`/customers/<t>/…` on any host,
 *  or `/<t>/…` on the demo host — mirroring demoHostRewrite). */
const requestTenantScope = (request: NextRequest): string | null => {
  const pathname = request.nextUrl.pathname;
  if (matchesPrefix(pathname, '/customers')) {
    return pathname.split('/').filter(Boolean)[1] ?? null;
  }
  const host = (request.headers.get('host') ?? '').toLowerCase();
  if (DEMO_HOSTS.has(host)) {
    return pathname.split('/').filter(Boolean)[0] ?? null;
  }
  return null;
};

/**
 * Second grant path: a valid, unrevoked invite cookie scoped to the demo the
 * request is asking for. The signature check is local (no DB); the revocation
 * check is a live read so revokes take effect on the very next request.
 */
const inviteCookieAllows = async (request: NextRequest): Promise<boolean> => {
  const secret = getInviteSecret();
  if (!secret) return false;

  const payload = await verifyInviteCookieValue(
    request.cookies.get(INVITE_COOKIE)?.value,
    secret,
  );
  if (!payload) return false;

  // The hub pass (`/demo-pass/<token>`) grants the whole demo host — no tenant
  // scope check, no per-invite DB row to revoke against.
  if (payload.demo === HUB_DEMO_MARKER) return true;

  const scope = requestTenantScope(request);
  if (!scope || scope !== payload.demo) return false;

  return inviteStillActive(payload.slug);
};

/**
 * Hub-wide access pass: `/demo-pass/<token>` on the demo host. Verifies the
 * signed token (constant-time), sets the hub-marked invite cookie, and lands
 * the visitor on the pilot hub. Unlike /for/[slug] this grants EVERY tenant,
 * so it's the single no-password way onto the whole demo.
 */
const HUB_PASS_PATH = /^\/demo-pass\/([a-f0-9]{16,})\/?$/;

const handleHubEntry = async (request: NextRequest): Promise<NextResponse | null> => {
  const match = HUB_PASS_PATH.exec(request.nextUrl.pathname);
  if (!match) return null;

  const secret = getInviteSecret();
  if (!secret) return null;
  if (!(await verifyHubToken(match[1]))) return null;

  const url = request.nextUrl.clone();
  url.pathname = '/customers';
  url.search = '';
  const response = NextResponse.redirect(url, 302);
  response.cookies.set({
    name: INVITE_COOKIE,
    value: await buildInviteCookieValue(HUB_DEMO_MARKER, 'hub', secret),
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
};

/**
 * Entry point for /for/[slug]: verify the HMAC token embedded in the slug,
 * record the open, set the signed session cookie, and rewrite straight into
 * the branded pilot (the URL bar keeps the personal /for link).
 */
const handleInviteEntry = async (request: NextRequest): Promise<NextResponse | null> => {
  const match = INVITE_PATH.exec(request.nextUrl.pathname);
  if (!match) return null;

  const slug = match[1];
  const secret = getInviteSecret();
  // Fail closed: an unconfigured secret means no magic links, anywhere.
  if (!secret) return inviteInactive();

  if (!(await verifyInviteSlug(slug, secret))) return inviteInactive();

  const invite = await touchInvite(slug);
  if (!invite || invite.revoked) return inviteInactive();
  if (!TENANT_SLUGS.includes(invite.demo)) return inviteInactive();

  const url = request.nextUrl.clone();
  url.pathname = `/customers/${invite.demo}/ops`;
  url.search = '';

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-invite-slug', slug);

  const response = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  response.cookies.set({
    name: INVITE_COOKIE,
    value: await buildInviteCookieValue(invite.demo, slug, secret),
    maxAge: INVITE_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
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
  // Straight to the living site — /agents itself now 308s there too.
  url.pathname = '/living-site';
  url.search = '';
  return NextResponse.redirect(url, 308);
};

const productRedirect = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  const url = request.nextUrl.clone();

  // The flagship sample site briefly shipped at /living-site/fred; the demo
  // cast is fictional now and the page lives at its industry slug.
  if (matchesPrefix(pathname, '/living-site/fred')) {
    url.pathname = '/living-site/dog-training';
    url.search = '';
    return NextResponse.redirect(url, 308);
  }

  // The agent marketplace is not the story (Living Business OS direction,
  // chrome sweep 2026-07-11): old /agents and /bundles URLs land on the
  // living site instead. /agents/pick stays — the fleet browser is used
  // behind the gates. /agents/mine stays too — saved Pilot builds run there
  // (the ship screen links straight to it).
  if (
    (pathname === '/agents' || pathname.startsWith('/agents/')) &&
    pathname !== '/agents/pick' &&
    pathname !== '/agents/mine' &&
    !pathname.startsWith('/agents/mine/')
  ) {
    url.pathname = '/living-site';
    url.search = '';
    return NextResponse.redirect(url, 308);
  }
  if (pathname === '/bundles' || pathname.startsWith('/bundles/')) {
    url.pathname = '/pricing';
    url.search = '';
    return NextResponse.redirect(url, 308);
  }

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

  // The only sign-in on this host is the operator hub's. /auth/confirm sends
  // its error path to /login, which here would dead-end at the pilot
  // basic-auth wall — land it on the operator form instead.
  if (matchesPrefix(pathname, '/login')) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url, 302);
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
  // Magic-link entry (/for/[slug]) resolves before the gate — a valid signed
  // link IS the credential. Invalid or revoked links get the branded page.
  const inviteEntry = await handleInviteEntry(request);
  if (inviteEntry) return inviteEntry;

  // Hub-wide pass (/demo-pass/<token>) resolves before the gate too — a valid
  // signed token IS the credential for the whole demo host.
  const hubEntry = await handleHubEntry(request);
  if (hubEntry) return hubEntry;

  // Live domain is behind the coming-soon splash while the fresh site is built
  // at staging. Runs after the invite entry (so /for links resolve) and before
  // everything else; exempts /api, /admin, /customers and static assets.
  const splash = splashGate(request);
  if (splash) return splash;

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
