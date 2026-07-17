import { NextResponse } from 'next/server';
import { checkChatRateLimit, chatClientIp } from '@/lib/agents/chat-rate-limit';
import { gate, gateBlockedResponse, gateHeaders } from '@/lib/gating/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * POST /api/a/transcribe  (multipart/form-data, field "audio")
 * Turn a recorded/uploaded meeting audio file into a transcript for the
 * community chief-of-staff chat (/a/[slug]) — the transcript lands in the
 * message input so the visitor can send it for a meeting write-up.
 *
 * Modelled on /api/hui/transcribe: Deepgram (nova-2, en-NZ, diarize), 40MB
 * cap, key in DEEPGRAM_API_KEY, HUI_TRANSCRIPTION_PROVIDER_CONFIGURED=false
 * forces the unconfigured state. When unconfigured, POST reports 503 and the
 * paste-transcript path (the normal chat input) stays fully live; GET returns
 * { configured } so the client only mounts the recorder when it will work.
 *
 * Farming control, both checked BEFORE any Deepgram spend:
 *   1. per-IP flood control (checkChatRateLimit, shared with agent chat);
 *   2. the shared email-capture gate (kind 'agent', key 'transcribe') — the
 *      402 body drives the same capture modal as chat.
 *
 * Audio is transcribed and then discarded — never stored.
 */

const MAX_BYTES = 40 * 1024 * 1024; // 40MB

function providerConfigured() {
  if (process.env.HUI_TRANSCRIPTION_PROVIDER_CONFIGURED === 'false') return false;
  return Boolean(process.env.DEEPGRAM_API_KEY);
}

export async function GET() {
  return NextResponse.json({ configured: providerConfigured() });
}

export async function POST(req: Request) {
  if (!providerConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        // NEW STRING (flagged for Kate): the approved hui line minus its
        // "and Hui will structure them" clause — Hui isn't on this surface.
        error:
          'Audio transcription is coming online shortly. For now, paste a transcript or rough notes.',
      },
      { status: 503 },
    );
  }

  const rate = await checkChatRateLimit(chatClientIp(req.headers), 'a:transcribe');
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'rate_limited', message: 'Too many messages right now — give it a few minutes.' },
      { status: 429 },
    );
  }

  const verdict = await gate(req, 'agent', 'transcribe');
  if (!verdict.allowed) return gateBlockedResponse(verdict);

  const form = await req.formData().catch(() => null);
  const audio = form?.get('audio');
  if (!(audio instanceof Blob)) {
    return NextResponse.json(
      { error: 'Attach an audio file.' },
      { status: 400, headers: gateHeaders(verdict) },
    );
  }
  if (audio.size > MAX_BYTES) {
    return NextResponse.json(
      { error: 'Audio file must be under 40MB.' },
      { status: 400, headers: gateHeaders(verdict) },
    );
  }

  try {
    const bytes = Buffer.from(await audio.arrayBuffer());
    const params = new URLSearchParams({
      model: 'nova-2',
      language: 'en-NZ',
      smart_format: 'true',
      punctuate: 'true',
      diarize: 'true',
    });
    const response = await fetch(`https://api.deepgram.com/v1/listen?${params.toString()}`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': audio.type || 'audio/wav',
      },
      body: bytes,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('[a/transcribe] deepgram error', response.status, detail.slice(0, 400));
      return NextResponse.json(
        { error: 'Transcription failed. Try again, or paste the notes.' },
        { status: 502, headers: gateHeaders(verdict) },
      );
    }

    const data = (await response.json()) as {
      results?: { channels?: Array<{ alternatives?: Array<{ transcript?: string }> }> };
    };
    const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ?? '';
    if (!transcript) {
      return NextResponse.json(
        { error: 'No speech detected in that audio.' },
        { status: 422, headers: gateHeaders(verdict) },
      );
    }
    return NextResponse.json({ configured: true, transcript }, { headers: gateHeaders(verdict) });
  } catch (error) {
    console.error('[a/transcribe] failed', error);
    return NextResponse.json(
      { error: 'Transcription failed. Try again, or paste the notes.' },
      { status: 500, headers: gateHeaders(verdict) },
    );
  }
}
