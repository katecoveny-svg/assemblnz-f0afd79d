import { createClient } from '@/lib/supabase/server';
import { doOwner, privateDoHeaders } from '@/apps/do/services/owner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Identity metadata only. Cookies remain in the page's WebKit session. */
export async function GET(request: Request) {
  const json = (body: unknown, status = 200) => Response.json(body, { status, headers: privateDoHeaders });
  const url = new URL(request.url);
  if (url.search || request.headers.get('sec-fetch-site') === 'cross-site') return json({ error: 'invalid_recipient_lookup' }, 400);
  try {
    const db = await createClient();
    const { data, error } = await db.auth.getUser();
    if (error) return json({ error: error.status === 401 || error.status === 403 || error.name === 'AuthSessionMissingError' ? 'sign_in_required' : 'recipient_unavailable' }, error.status === 401 || error.status === 403 || error.name === 'AuthSessionMissingError' ? 401 : 503);
    if (!data.user || data.user.is_anonymous) return json({ error: 'sign_in_required' }, 401);
    const owner = await doOwner();
    if (!owner || owner.id !== data.user.id) return json({ error: 'recipient_unavailable' }, 503);
    // Display metadata only; fresh server-verified IDs remain the identity boundary.
    const email = data.user.email;
    const label = email && email.length <= 90 && /^[\x20-\x7e]+$/.test(email) ? email : `Account ${owner.id}`;
    return json({ version: 1, owner: owner.id, scope: 'Personal', label });
  } catch { return json({ error: 'recipient_unavailable' }, 503); }
}
