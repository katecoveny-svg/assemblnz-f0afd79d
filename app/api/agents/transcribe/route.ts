import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/agents/transcribe  (multipart/form-data, field "audio")
 * Consult-grade transcription for Care Scribe (and any consult-capture agent).
 *
 * Provider: Deepgram (nova-2, en-NZ, diarised + smart formatting). The key lives
 * in DEEPGRAM_API_KEY — the same key Hui uses. Diarisation matters here: it
 * separates speakers so the note can keep the whānau voice straight from the
 * patient's self-report (Whānau mode).
 *
 * Health information is processed under the Privacy Act 2020 and the Health
 * Information Privacy Code 2020. We send the audio to Deepgram for the single
 * purpose of transcription and keep nothing here — the transcript returns to the
 * clinician's browser for review before it is ever sent to the agent.
 *
 * If no key is configured, the endpoint reports unconfigured (503) and the UI
 * falls back to "paste the transcript", which is always live.
 */

const MAX_BYTES = 60 * 1024 * 1024; // 60MB — a long consult at a sane bitrate

function providerConfigured() {
  if (process.env.AGENT_TRANSCRIPTION_PROVIDER_CONFIGURED === 'false') return false;
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
        error:
          'Recording is coming online shortly. For now, paste the consult transcript or your notes and Care Scribe will structure them.',
      },
      { status: 503 },
    );
  }

  const form = await req.formData().catch(() => null);
  const audio = form?.get('audio');
  if (!(audio instanceof Blob)) {
    return NextResponse.json({ error: 'Attach an audio recording.' }, { status: 400 });
  }
  if (audio.size === 0) {
    return NextResponse.json({ error: 'The recording was empty — nothing was captured.' }, { status: 400 });
  }
  if (audio.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Recording must be under 60MB. Split a long consult into parts.' }, { status: 400 });
  }

  try {
    const bytes = Buffer.from(await audio.arrayBuffer());
    const params = new URLSearchParams({
      model: 'nova-2',
      language: 'en-NZ',
      smart_format: 'true',
      punctuate: 'true',
      diarize: 'true',
      paragraphs: 'true',
    });
    const response = await fetch(`https://api.deepgram.com/v1/listen?${params.toString()}`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': audio.type || 'audio/webm',
      },
      body: bytes,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('[agents/transcribe] deepgram error', response.status, detail.slice(0, 400));
      return NextResponse.json({ error: 'Transcription failed. Try again, or paste the notes.' }, { status: 502 });
    }

    const data = (await response.json()) as {
      results?: { channels?: Array<{ alternatives?: Array<{ transcript?: string }> }> };
    };
    const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ?? '';
    if (!transcript) {
      return NextResponse.json({ error: 'No speech detected in that recording.' }, { status: 422 });
    }
    return NextResponse.json({ configured: true, transcript });
  } catch (error) {
    console.error('[agents/transcribe] failed', error);
    return NextResponse.json({ error: 'Transcription failed. Try again, or paste the notes.' }, { status: 500 });
  }
}
