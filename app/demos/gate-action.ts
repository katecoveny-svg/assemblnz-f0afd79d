'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * /demos gate — Kate, 1 Aug 2026: "make the demo concepts on the home page not
 * accessible to anyone but me … just use Assembl as a password protector."
 *
 * The fleet index carries wedges, cautions and superseded-link notes — outreach
 * ammunition, not client material. The concept links themselves stay open (a
 * client's link must just work); only this index goes behind the word.
 *
 * Soft gate by design: it keeps leads and crawlers out of the playbook, it is
 * not a vault. Password is deliberately the studio name; DEMOS_GATE_CODE can
 * override it in Vercel without a deploy.
 */

import { DEMOS_COOKIE, type DemosGateState } from './gate-shared';

function timingSafeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export async function submitDemosGate(
  _prev: DemosGateState,
  formData: FormData
): Promise<DemosGateState> {
  const expected = (process.env.DEMOS_GATE_CODE ?? 'assembl').toLowerCase();
  const supplied = String(formData.get('passphrase') ?? '').trim().toLowerCase();
  if (!supplied || !timingSafeStringEqual(supplied, expected)) {
    return { status: 'error', message: 'That is not the word.' };
  }
  const c = await cookies();
  c.set({
    name: DEMOS_COOKIE,
    value: '1',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/demos',
    maxAge: 60 * 60 * 24 * 90, // 90 days — Kate's own device stays open
  });
  redirect('/demos');
}
