import 'server-only';
import { createClient } from '@/lib/supabase/server';
export const privateDoHeaders = { 'Cache-Control': 'private, no-store', Vary: 'Cookie', 'X-Content-Type-Options': 'nosniff' };
export async function doOwner() {
  try {
    const db = await createClient();
    const { data, error } = await db.auth.getUser();
    return !error && data.user && !data.user.is_anonymous ? { id: data.user.id, externalId: `do:user:${data.user.id}` } : null;
  } catch { return null; }
}
export const sameDoOrigin = (req: Request) => req.headers.get('origin') === new URL(req.url).origin;
