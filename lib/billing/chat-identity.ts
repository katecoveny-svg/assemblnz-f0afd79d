/**
 * Resolve who is chatting: a signed-in Supabase user, or an anonymous visitor
 * tracked by a long-lived device cookie. The anon cookie lets the 3 free
 * messages per agent work before sign-up; once signed in, the user_id takes
 * over so the free allowance follows the account.
 *
 * Server-only — used by the agent chat + entitlement route handlers.
 */
import 'server-only';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import type { ChatIdentity } from './agent-entitlement';

export const ANON_COOKIE = 'assembl_aid';
const ANON_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/** Cookie attributes for the anon device id. */
export function anonCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: ANON_MAX_AGE,
    path: '/',
  };
}

/**
 * Resolve the chat identity for the current request.
 *
 * Returns the identity plus, when a fresh anonymous id had to be minted, the
 * `setAnonId` value the caller must write back as a cookie on the response (the
 * GET entitlement route does this; the streamed chat route reads the cookie the
 * GET already set).
 */
export async function resolveChatIdentity(): Promise<{
  identity: ChatIdentity;
  setAnonId: string | null;
}> {
  // Signed-in user wins.
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return { identity: { userId: user.id }, setAnonId: null };
  } catch {
    // Supabase env not configured locally — fall through to anonymous.
  }

  const store = await cookies();
  const existing = store.get(ANON_COOKIE)?.value;
  if (existing) return { identity: { anonId: existing }, setAnonId: null };

  const fresh = crypto.randomUUID();
  return { identity: { anonId: fresh }, setAnonId: fresh };
}
