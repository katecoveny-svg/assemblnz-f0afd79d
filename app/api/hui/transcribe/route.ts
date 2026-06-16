import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/hui/transcribe  (multipart/form-data, field "audio")
 * Turn an uploaded/recorded audio file into a transcript.
 *
 * Provider: Deepgram (nova, en-NZ). The key lives in DEEPGRAM_API_KEY.
 * If no key is configured, the endpoint reports unconfigured and the UI shows
 * a "coming online soon" state — the paste-transcript path stays fully live.
 *
 * Feature flag: HUI_TRANSCRIPTION_PROVIDER_CONFIGURED. Set to "false" to force
 * the unconfigured state even if a key is present (e.g. during rollout).
 */

const MAX_BYTES = 40 * 1024 * 1024; // 40MB

function providerConfigured() {
  if (process.env.HUI_TRANSCRIPTION_PROVIDER_CONFIGURED === "false") return false;
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
          "Audio transcription is coming online shortly. For now, paste a transcript or rough notes and Hui will structure them.",
      },
      { status: 503 },
    );
  }

  const form = await req.formData().catch(() => null);
  const audio = form?.get("audio");
  if (!(audio instanceof Blob)) {
    return NextResponse.json({ error: "Attach an audio file." }, { status: 400 });
  }
  if (audio.size > MAX_BYTES) {
    return NextResponse.json({ error: "Audio file must be under 40MB." }, { status: 400 });
  }

  const language = String(form?.get("language") ?? "en-NZ");
  if (language === "mi") {
    return NextResponse.json(
      { error: "Te reo Māori transcription lands in the next phase, with human verification. Use en-NZ for now." },
      { status: 400 },
    );
  }

  try {
    const bytes = Buffer.from(await audio.arrayBuffer());
    const params = new URLSearchParams({
      model: "nova-2",
      language: "en-NZ",
      smart_format: "true",
      punctuate: "true",
      diarize: "true",
    });
    const response = await fetch(`https://api.deepgram.com/v1/listen?${params.toString()}`, {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": audio.type || "audio/wav",
      },
      body: bytes,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("[hui/transcribe] deepgram error", response.status, detail.slice(0, 400));
      return NextResponse.json({ error: "Transcription failed. Try again, or paste the notes." }, { status: 502 });
    }

    const data = (await response.json()) as {
      results?: { channels?: Array<{ alternatives?: Array<{ transcript?: string }> }> };
    };
    const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ?? "";
    if (!transcript) {
      return NextResponse.json({ error: "No speech detected in that audio." }, { status: 422 });
    }
    return NextResponse.json({ configured: true, transcript });
  } catch (error) {
    console.error("[hui/transcribe] failed", error);
    return NextResponse.json({ error: "Transcription failed. Try again, or paste the notes." }, { status: 500 });
  }
}
