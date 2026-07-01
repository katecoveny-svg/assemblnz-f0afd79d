'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { GATE_COOKIE, accessToken, expectedPassword } from './access';

export async function unlockAironaut(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const entered = String(formData.get('password') ?? '').trim();
  if (entered !== expectedPassword()) {
    return { error: 'That password is not right. Try again, or ask Kate.' };
  }
  const store = await cookies();
  store.set(GATE_COOKIE, accessToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/customers/aeronaut',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  redirect('/customers/aeronaut/pikau');
}
