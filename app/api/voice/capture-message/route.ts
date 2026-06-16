/**
 * POST /api/voice/capture-message — ElevenLabs server tool / voicemail fallback.
 * Body: { call_sid, message, caller_number? }. Writes the message to the
 * session and marks it voicemail (message-only retention class).
 */
import { NextResponse } from 'next/server';
import { captureMessage } from '@/lib/voice/tools/capture_message';
import { appendToolCall } from '@/lib/voice/clients/supabase';
import { checkWebhookSecret, unauthorized } from '@/lib/voice/api-auth';

import { isVoiceAgentEnabled, voiceDisabledResponse } from '@/lib/voice/flags';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!isVoiceAgentEnabled()) return voiceDisabledResponse();
  if (!checkWebhookSecret(req).ok) return unauthorized();

  const body = (await req.json()) as {
    call_sid?: string;
    message?: string;
    caller_number?: string;
  };
  if (!body.call_sid || !body.message) {
    return NextResponse.json({ error: 'call_sid and message required' }, { status: 400 });
  }

  try {
    await appendToolCall(body.call_sid, {
      tool: 'capture_message',
      args: { length: body.message.length },
      result_summary: 'message captured',
      ok: true,
      ts: new Date().toISOString(),
    });
    await captureMessage({
      call_sid: body.call_sid,
      message: body.message,
      caller_number: body.caller_number,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
