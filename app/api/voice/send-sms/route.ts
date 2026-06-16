/**
 * POST /api/voice/send-sms — ElevenLabs server tool.
 * Body: { call_sid, to, name, date, time, party_size }. Sends the booking
 * confirmation text to the caller's mobile.
 */
import { NextResponse } from 'next/server';
import { sendConfirmationSms } from '@/lib/voice/tools/send_sms';
import { appendToolCall } from '@/lib/voice/clients/supabase';
import { checkWebhookSecret, unauthorized } from '@/lib/voice/api-auth';

import { isVoiceAgentEnabled, voiceDisabledResponse } from '@/lib/voice/flags';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!isVoiceAgentEnabled()) return voiceDisabledResponse();
  if (!checkWebhookSecret(req).ok) return unauthorized();

  const body = (await req.json()) as {
    call_sid?: string;
    to?: string;
    name?: string;
    date?: string;
    time?: string;
    party_size?: number;
  };
  if (!body.to || !body.name || !body.date || !body.time || !body.party_size) {
    return NextResponse.json({ error: 'to, name, date, time, party_size required' }, { status: 400 });
  }

  try {
    const result = await sendConfirmationSms(body.to, {
      name: body.name,
      date: body.date,
      time: body.time,
      party_size: Number(body.party_size),
    });
    if (body.call_sid) {
      await appendToolCall(body.call_sid, {
        tool: 'send_sms',
        args: { to_masked: `***${body.to.slice(-3)}` },
        result_summary: `sms ${result.sid}`,
        ok: true,
        ts: new Date().toISOString(),
      });
    }
    return NextResponse.json({ sid: result.sid });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
