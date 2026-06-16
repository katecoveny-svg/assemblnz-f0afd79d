/**
 * POST /api/voice/warm-transfer — ElevenLabs server tool / Twilio TwiML.
 * Returns TwiML that <Dial>s the human handoff number and marks the session
 * transferred. Twilio expects text/xml back.
 */
import { warmTransfer } from '@/lib/voice/tools/warm_transfer';
import { appendToolCall, upsertSession } from '@/lib/voice/clients/supabase';
import { checkWebhookSecret, unauthorized } from '@/lib/voice/api-auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!checkWebhookSecret(req).ok) return unauthorized();

  let callSid: string | undefined;
  try {
    const body = (await req.json()) as { call_sid?: string };
    callSid = body.call_sid;
  } catch {
    // Twilio may POST form-encoded; fall back to query param.
    callSid = new URL(req.url).searchParams.get('call_sid') ?? undefined;
  }

  const { twiml, transfer_to } = warmTransfer();

  if (callSid) {
    await upsertSession({ call_sid: callSid, status: 'transferred' });
    await appendToolCall(callSid, {
      tool: 'warm_transfer',
      args: { transfer_to_masked: `***${transfer_to.slice(-3)}` },
      result_summary: 'transferred to human',
      ok: true,
      ts: new Date().toISOString(),
    });
  }

  return new Response(twiml, { headers: { 'Content-Type': 'text/xml' } });
}
