'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { buildPilotCookieAttributes, getPilotSecret } from '@/lib/customers/access';

export type PilotGateState = { status: 'idle' } | { status: 'error'; message: string };

function timingSafeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function submitPilotGate(
  _prev: PilotGateState,
  formData: FormData,
): Promise<PilotGateState> {
  const expected = getPilotSecret();
  const supplied = String(formData.get('passphrase') ?? '').trim();
  if (!supplied || !timingSafeStringEqual(supplied, expected)) {
    return { status: 'error', message: 'That access code is not right.' };
  }
  const c = await cookies();
  c.set(buildPilotCookieAttributes());
  const next = String(formData.get('next') ?? '/customers/auckland-zoo/keeper');
  redirect(next.startsWith('/customers/') ? next : '/customers/auckland-zoo/keeper');
}
