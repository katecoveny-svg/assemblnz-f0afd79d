/**
 * POST /api/voice/check-availability — ElevenLabs server tool.
 * Body: { call_sid, date, party_size }. Returns slots for the agent to offer.
 */
import { NextResponse } from 'next/server';
import { checkAvailability } from '@/lib/voice/tools/check_availability';
import { appendToolCall } from '@/lib/voice/clients/supabase';
import { checkWebhookSecret, unauthorized } from '@/lib/voice/api-auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!checkWebhookSecret(req).ok) return unauthorized();

  const body = (await req.json()) as { call_sid?: string; date?: string; party_size?: number };
  if (!body.date || !body.party_size) {
    return NextResponse.json({ error: 'date and party_size required' }, { status: 400 });
  }

  try {
    const result = await checkAvailability({ date: body.date, party_size: body.party_size });
    if (body.call_sid) {
      await appendToolCall(body.call_sid, {
        tool: 'check_availability',
        args: { date: body.date, party_size: body.party_size },
        result_summary: `${result.slots.length} slots${result.reason ? ` (${result.reason})` : ''}`,
        ok: true,
        ts: new Date().toISOString(),
      });
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
