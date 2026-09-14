import { NextResponse } from 'next/server';
import { SURFACES } from '@/apps/do/shared/surfaces';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    honesty:
      'Surface ≠ agent. Chrome + /do are live; WhatsApp / SMS / Messenger are stubs.',
    spine: 'context + intent → AgentSpec → tools → permissions → outcome',
    surfaces: SURFACES.map((s) => ({
      surface: s.surface,
      status: s.status,
      description: s.description,
    })),
  });
}
