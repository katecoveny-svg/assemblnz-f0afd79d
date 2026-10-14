import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { privateDoHeaders as headers, sameDoOrigin } from '@/apps/do/services/owner';
import { readDoJson, admitDoRequest } from '@/apps/do/shared/http';
import { chatClientIp } from '@/lib/agents/chat-rate-limit';
const input = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(200) }).strict();
export async function POST(req: Request) {
  if (!sameDoOrigin(req)) return Response.json({ message: 'Open DO to sign in.' }, { status: 403, headers });
  if (!admitDoRequest(chatClientIp(req.headers))) return Response.json({ message: 'Please wait before trying again.' }, { status: 429, headers });
  const parsed = input.safeParse(await readDoJson(req).catch(() => null));
  if (!parsed.success) return Response.json({ message: 'Enter your account email and password.' }, { status: 400, headers });
  try {
    const db = await createClient();
    const { error } = await db.auth.signInWithPassword(parsed.data);
    if (error) return Response.json({ message: 'The email or password did not match.' }, { status: 401, headers });
    return Response.json({ signedIn: true }, { headers });
  } catch { return Response.json({ message: 'Sign-in is unavailable. Try again later.' }, { status: 503, headers }); }
}
export async function DELETE(req: Request) {
  if (!sameDoOrigin(req)) return Response.json({ message: 'Open DO to sign out.' }, { status: 403, headers });
  try { const db = await createClient(); const { error } = await db.auth.signOut({ scope: 'local' }); if (error) throw error; return Response.json({ signedOut: true }, { headers }); }
  catch { return Response.json({ message: 'Sign-out could not finish. Try again.' }, { status: 503, headers }); }
}


/** Identity-only verification must not depend on optional personal-storage tables. */
export async function GET() {
  try {
    const db = await createClient();
    const { data, error } = await db.auth.getUser();
    if (error && error.name !== 'AuthSessionMissingError' && error.status !== 401 && error.status !== 403) {
      return Response.json({ message: 'Identity is unavailable. Reconnect and retry.' }, { status: 503, headers });
    }
    const owner = !error && data.user && !data.user.is_anonymous ? data.user.id : 'guest';
    return Response.json({ workspaceKey: owner }, { headers });
  } catch { return Response.json({ message: 'Identity is unavailable. Reconnect and retry.' }, { status: 503, headers }); }
}
