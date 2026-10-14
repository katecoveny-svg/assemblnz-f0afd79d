import { NextResponse } from 'next/server';
/** Auth outcomes and session mutations must never be shared through a cache. */
export function privateAuthRedirect(url: URL, status = 307) {
  const response = NextResponse.redirect(url, { status });
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}
