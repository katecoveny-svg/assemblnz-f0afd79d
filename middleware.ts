import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const SPA_ORIGIN = 'https://assembl-app.vercel.app';

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

const legacyKeteRedirect = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  const [, root, ...rest] = pathname.split('/');
  if (!PUBLIC_KETE_ROOTS.includes(root)) return null;

  const url = request.nextUrl.clone();
  url.pathname = `/kete/${root}${rest.length ? `/${rest.join('/')}` : ''}`;
  return NextResponse.redirect(url, 308);
};

const productRedirect = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  const url = request.nextUrl.clone();

  if (matchesPrefix(pathname, '/toro/route')) {
    url.pathname = '/hapai/voyage-italy';
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
