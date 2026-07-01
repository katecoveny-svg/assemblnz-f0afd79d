import { NextResponse, type NextRequest } from 'next/server';
import { UNLOCK_COOKIE } from '@/app/customers/auckland-zoo/keeper/_components/constants';

export const dynamic = 'force-dynamic';

const KEEPER = '/customers/auckland-zoo/keeper';
const GATE = '/customers/auckland-zoo/unlock';

/** Demo password. Overridable via env for the deployed demo.assembl.co.nz host;
 *  falls back to a shared default so the workspace is never publicly wide-open
 *  but is trivially shareable for a cold-outreach walkthrough. Concept · pending
 *  demo — this is a soft gate, not a secret store. */
function demoPassword(): string {
  return process.env.AUCKLAND_ZOO_DEMO_PASSWORD || 'te-wao-nui';
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const attempt = String(form.get('password') ?? '').trim();

  if (attempt !== demoPassword()) {
    return NextResponse.redirect(new URL(`${GATE}?error=1`, request.url), { status: 303 });
  }

  const res = NextResponse.redirect(new URL(KEEPER, request.url), { status: 303 });
  res.cookies.set(UNLOCK_COOKIE, '1', {
    httpOnly: true,

    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/customers/auckland-zoo',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
