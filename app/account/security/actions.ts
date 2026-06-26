'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Set (or change) the signed-in user's password.
 *
 * Lets an existing magic-link user add a password so they can sign in instantly
 * next time — no waiting for an email. Runs against the authenticated session
 * (this route is gated by middleware), so Supabase `updateUser` is authorised
 * by the user's own cookies.
 *
 * The password value is typed by the user in the browser and posted here — it
 * is never generated or logged.
 */
export type SetPasswordResult = { ok: true } | { ok: false; error: string };

const MIN_LENGTH = 8;

export async function setPasswordAction(
  _prev: SetPasswordResult | null,
  formData: FormData,
): Promise<SetPasswordResult> {
  const password = formData.get('password');
  const confirm = formData.get('confirm');

  if (typeof password !== 'string' || password.length === 0) {
    return { ok: false, error: 'Enter a password.' };
  }
  if (password.length < MIN_LENGTH) {
    return { ok: false, error: `Use at least ${MIN_LENGTH} characters.` };
  }
  if (password !== confirm) {
    return { ok: false, error: 'The two passwords do not match.' };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Your session has expired. Sign in again, then set your password.' };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
