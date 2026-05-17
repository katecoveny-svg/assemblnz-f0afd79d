import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const SPA_ORIGIN = 'https://assembl-app.vercel.app';

const SPA_PUBLIC_PREFIXES = [
  '/manaaki',
  '/waihanga',
  '/pikau',
  '/arataki',
  '/auaha',
  '/ako',
  '/hoko',
  '/toro',
  '/toroa',
  '/matauranga',
  '/demos',
  '/aaaip',
  '/embed',
  '/verify',
];

const matchesPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

const shouldProxyToSpa = (pathname: string) => {
  if (matchesPrefix(pathname, '/toro/school-survival')) {
    return false;
  }

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
