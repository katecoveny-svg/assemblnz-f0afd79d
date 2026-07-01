'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  buildPilotCookieAttributes,
  getPilotSecret,
} from '@/lib/customers/access';

// Where the shared /customers gate drops you for this tenant once the code
// checks out (the shared access lib stays tenant-neutral).
const PILOT_DEFAULT_NEXT = '/customers/lula-inn/hospo/today';

export type PilotGateState =
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

export async function submitPilotGate(
  _prev: PilotGateState,
  formData: FormData
): Promise<PilotGateState> {
  const expected = getPilotSecret();
  const supplied = String(formData.get('passphrase') ?? '').trim();
  if (!supplied || !timingSafeStringEqual(supplied, expected)) {
    return { status: 'error', message: 'That access code is not right.' };
  }
  const c = await cookies();
  c.set(buildPilotCookieAttributes());
  const next = String(formData.get('next') ?? PILOT_DEFAULT_NEXT);
  redirect(next.startsWith('/customers/') ? next : PILOT_DEFAULT_NEXT);
}
