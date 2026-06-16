/**
 * POST /api/voice/twilio-inbound — TwiML for an incoming call.
 *
 * Only needed for the custom Media Streams path (bridging the call into
 * ElevenLabs over a websocket). Phase 1 prefers ElevenLabs' native Twilio
 * number-import, in which case Twilio is configured by ElevenLabs and this
 * route is unused — it exists so we can fall back to the explicit
 * <Connect><Stream> wiring if we need per-call personalisation.
 *
 * Twilio POSTs application/x-www-form-urlencoded (CallSid, From, To, ...).
 */
import { inboundTwiml } from '@/lib/voice/clients/twilio';
import { upsertSession } from '@/lib/voice/clients/supabase';
import { AGENT_ID, CUSTOMER_ID } from '@/lib/voice/config';

export const runtime = 'nodejs';

function streamUrl(): string {
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  if (!agentId) throw new Error('ELEVENLABS_AGENT_ID must be set');
  // ElevenLabs Agents websocket endpoint for the Media Streams bridge.
  return `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}`;
}

export async function POST(req: Request) {
  const form = await req.formData();
  const callSid = String(form.get('CallSid') ?? '');
  const from = String(form.get('From') ?? '');

  if (callSid) {
    await upsertSession({
      call_sid: callSid,
      agent_id: AGENT_ID,
      customer_id: CUSTOMER_ID,
      caller_number: from || null,
      status: 'in_progress',
    });
  }

  return new Response(inboundTwiml(streamUrl()), {
    headers: { 'Content-Type': 'text/xml' },
  });
}
