/**
 * POST /api/voice/post-call — ElevenLabs post-call webhook.
 *
 * ElevenLabs fires two payload types after a call:
 *   - post_call_transcription: transcript turns + metadata (incl. the Twilio
 *     call_sid for native-import calls) + analysis.
 *   - post_call_audio: { conversation_id, full_audio } where full_audio is a
 *     base64 MP3 of the whole call (NOT a hosted URL) — we decode + store it.
 *
 * On transcription we finalise the session, build the Mana Receipt (hash
 * chain), render the evidence-pack artifact, and write pdf_uri. On audio we
 * store the recording and link it to the session.
 */
import { NextResponse } from 'next/server';
import { checkWebhookSecret, unauthorized } from '@/lib/voice/api-auth';
import { upsertSession, voiceDb } from '@/lib/voice/clients/supabase';
import { decodeCallAudio } from '@/lib/voice/clients/elevenlabs';
import { finalizeReceipt } from '@/lib/voice/receipts/mana-receipt';
import { storeReceiptArtifact } from '@/lib/voice/receipts/receipt-pdf';
import { CUSTOMER_ID } from '@/lib/voice/config';

export const runtime = 'nodejs';

interface ElevenLabsPostCall {
  type?: string;
  data?: {
    conversation_id?: string;
    transcript?: unknown;
    full_audio?: string;
    metadata?: {
      phone_call?: { call_sid?: string };
      start_time_unix_secs?: number;
    };
  };
  // Some payload shapes flatten these to the top level.
  conversation_id?: string;
  full_audio?: string;
  call_sid?: string;
}

/** Best-effort extraction of the Twilio call_sid from either payload shape. */
function resolveCallSid(body: ElevenLabsPostCall): string | null {
  return (
    body.call_sid ??
    body.data?.metadata?.phone_call?.call_sid ??
    body.data?.conversation_id ??
    body.conversation_id ??
    null
  );
}

export async function POST(req: Request) {
  if (!checkWebhookSecret(req).ok) return unauthorized();

  const body = (await req.json()) as ElevenLabsPostCall;
  const type = body.type ?? (body.full_audio || body.data?.full_audio ? 'post_call_audio' : 'post_call_transcription');
  const callSid = resolveCallSid(body);
  if (!callSid) {
    return NextResponse.json({ error: 'could not resolve call_sid' }, { status: 400 });
  }

  try {
    if (type === 'post_call_audio') {
      const b64 = body.full_audio ?? body.data?.full_audio;
      let recordingUri: string | null = null;
      if (b64) {
        const bytes = decodeCallAudio(b64);
        const path = `${CUSTOMER_ID}/${callSid}.mp3`;
        const { error } = await voiceDb()
          .storage.from('mana-receipts')
          .upload(path, new Blob([new Uint8Array(bytes)], { type: 'audio/mpeg' }), {
            upsert: true,
          });
        if (error) throw new Error(error.message);
        recordingUri = `mana-receipts/${path}`;
      }
      await upsertSession({ call_sid: callSid, recording_uri: recordingUri });
      return NextResponse.json({ ok: true, stored: Boolean(recordingUri) });
    }

    // post_call_transcription → finalise + build receipt.
    const conversationId = body.data?.conversation_id ?? body.conversation_id ?? null;
    await upsertSession({
      call_sid: callSid,
      status: 'completed',
      ended_at: new Date().toISOString(),
      transcript_uri: conversationId ? `elevenlabs:${conversationId}` : null,
    });

    const receipt = await finalizeReceipt(callSid);
    const pdfUri = await storeReceiptArtifact(receipt);

    // Backfill the pdf_uri now the artifact exists.
    await voiceDb().from('mana_receipt').update({ pdf_uri: pdfUri }).eq('call_sid', callSid);

    return NextResponse.json({
      ok: true,
      receipt: { sha256: receipt.sha256, chain_hash: receipt.chain_hash, pdf_uri: pdfUri },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
