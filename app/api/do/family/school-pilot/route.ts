import { doOwner, privateDoHeaders, sameDoOrigin } from '@/apps/do/services/owner';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/** Closed boundary: deliberately does not parse private content or instantiate ports. */
export async function POST(request: Request) {
  const json = (message: string, status: number) => Response.json({ message, enabled: false, stored: false, externalActions: false }, { status, headers: { ...privateDoHeaders, Vary: 'Cookie, Origin, X-DO-Workspace' } });
  if (!sameDoOrigin(request)) return json('Open DO to prepare school work.', 403);
  const owner = await doOwner();
  if (!owner) return json('Sign in to DO.', 401);
  if (request.headers.get('x-do-workspace') !== owner.id) return json('Your account changed. Refresh DO.', 409);
  return json('Private pilot closed: verified read scopes, exact processing consent and an isolated school-history adapter are required.', 423);
}
