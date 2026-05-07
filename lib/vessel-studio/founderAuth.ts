import { cookies } from 'next/headers';

// Founder gate. The apex Next.js site has no auth system — auth lives in the
// legacy Vite app at app.assembl.co.nz. For this founder-only tool we use a
// signed-cookie gate against an env-bound passphrase. When customer-facing
// versions land in the Auaha kete, they will switch to real Supabase auth.

export const FOUNDER_COOKIE = 'assembl_founder';
export const FOUNDER_COOKIE_VALUE = '1';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function isFounderAuthed(): Promise<boolean> {
  const c = await cookies();
  return c.get(FOUNDER_COOKIE)?.value === FOUNDER_COOKIE_VALUE;
}

export function getFounderSecret(): string | null {
  const v = process.env.FOUNDER_GATE_SECRET;
  return v && v.trim().length > 0 ? v.trim() : null;
}

export function isFounderConfigured(): boolean {
  return getFounderSecret() !== null;
}

export function buildFounderCookieAttributes(): {
  name: string;
  value: string;
  maxAge: number;
  httpOnly: boolean;
  sameSite: 'lax';
  path: string;
  secure: boolean;
} {
  return {
    name: FOUNDER_COOKIE,
    value: FOUNDER_COOKIE_VALUE,
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  };
}
