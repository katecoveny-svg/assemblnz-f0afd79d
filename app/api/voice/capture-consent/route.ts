/**
 * POST /api/voice/capture-consent — ElevenLabs server tool.
 * Body: { call_sid, prompt_text, verbatim_response, captured_method? }.
 * Logs the verbatim consent exchange (IPP 3). Ambiguous → re-ask, no record.
 */
import { NextResponse } from 'next/server';
import { captureConsent } from '@/lib/voice/tools/capture_consent';
import { appendToolCall } from '@/lib/voice/clients/supabase';
import { checkWebhookSecret, unauthorized } from '@/lib/voice/api-auth';
import type { ConsentMethod } from '@/lib/voice/types';

import { isVoiceAgentEnabled, voiceDisabledResponse } from '@/lib/voice/flags';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!isVoiceAgentEnabled()) return voiceDisabledResponse();
  if (!checkWebhookSecret(req).ok) return unauthorized();

  const body = (await req.json()) as {
    call_sid?: string;
    prompt_text?: string;
    verbatim_response?: string;
    captured_method?: ConsentMethod;
  };
  if (!body.call_sid || !body.prompt_text || body.verbatim_response === undefined) {
    return NextResponse.json(
      { error: 'call_sid, prompt_text, verbatim_response required' },
      { status: 400 },
    );
  }

  try {
    const result = await captureConsent({
      call_sid: body.call_sid,
      prompt_text: body.prompt_text,
      verbatim_response: body.verbatim_response,
      captured_method: body.captured_method,
    });
    await appendToolCall(body.call_sid, {
      tool: 'capture_consent',
      args: { verdict: result.verdict },
      result_summary: result.needs_clarification
        ? 'ambiguous — re-asking'
        : result.consent_granted
          ? 'consent granted'
          : 'consent declined',
      ok: true,
      ts: new Date().toISOString(),
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
