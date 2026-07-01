/**
 * Password gate for the Aironaut pilot workspace.
 *
 * Simple shared-secret cookie gate — this is an internal pilot Kate shares
 * directly with her dad, not a public product. The secret is read from
 * AERONAUT_PILOT_PASSWORD (set in Vercel) with a pilot default so it works
 * out of the box before that env is configured.
 */
import 'server-only';
import { cookies } from 'next/headers';

export const GATE_COOKIE = 'aironaut_pilot_access';

export function expectedPassword(): string {
  return process.env.AERONAUT_PILOT_PASSWORD || 'parnell156';
}

/** Deterministic access token stamped into the cookie once unlocked. */
export function accessToken(): string {
  // Not a security boundary — just a marker tied to the current secret so
  // rotating the password invalidates old cookies.
  return `ok:${expectedPassword().length}:${expectedPassword().slice(0, 2)}`;
}

export async function hasAccess(): Promise<boolean> {
  const store = await cookies();
  return store.get(GATE_COOKIE)?.value === accessToken();
}
