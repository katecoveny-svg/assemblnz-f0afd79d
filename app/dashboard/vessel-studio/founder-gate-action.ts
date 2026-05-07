'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  buildFounderCookieAttributes,
  FOUNDER_COOKIE,
  getFounderSecret,
} from '@/lib/vessel-studio/founderAuth';

export type GateState =
  | { status: 'idle' }
  | { status: 'error'; message: string };

function timingSafeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function submitFounderGate(
  _prev: GateState,
  formData: FormData
): Promise<GateState> {
  const expected = getFounderSecret();
  if (!expected) {
    return {
      status: 'error',
      message:
        'FOUNDER_GATE_SECRET is not set on the server. Add it to your env to enable the founder gate.',
    };
  }
  const supplied = String(formData.get('passphrase') ?? '');
  if (!supplied || !timingSafeStringEqual(supplied, expected)) {
    return { status: 'error', message: 'incorrect passphrase' };
  }
  const c = await cookies();
  c.set(buildFounderCookieAttributes());
  redirect('/dashboard/vessel-studio');
}

export async function clearFounderGate(): Promise<void> {
  const c = await cookies();
  c.delete(FOUNDER_COOKIE);
  redirect('/dashboard/vessel-studio');
}
