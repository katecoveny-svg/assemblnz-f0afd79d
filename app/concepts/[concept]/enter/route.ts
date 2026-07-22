import { NextResponse, type NextRequest } from 'next/server';
import { getConcept } from '@/lib/concepts/registry';
import { verifyConceptAccess, CONCEPT_COOKIE } from '@/lib/concepts/access';

/**
 * Magic-link entry. `/concepts/<slug>/enter?k=<token>` verifies the token
 * server-side and, on success, sets an httpOnly access cookie and redirects to
 * the concept. On failure it redirects to the concept page, which shows the
 * private gate (never the content). Keeps the raw token out of the address bar
 * after entry.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ concept: string }> },
) {
  const { concept } = await params;
  const cfg = getConcept(concept);
  const base = new URL(`/concepts/${concept}`, request.url);

  if (!cfg) return NextResponse.redirect(new URL('/', request.url));

  const key = request.nextUrl.searchParams.get('k') ?? undefined;
  const verdict = verifyConceptAccess(concept, key);
  const res = NextResponse.redirect(base);
  if (verdict.ok && key) {
    res.cookies.set(CONCEPT_COOKIE, key, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: `/concepts/${concept}`,
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return res;
}
