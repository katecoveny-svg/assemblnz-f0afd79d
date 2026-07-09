// AUAHA generation core — server-only. Real providers, honest fallbacks.
// Image  : Google Imagen 4.0  → Fal Flux Pro
// Video  : Fal Kling/Luma     → Google Veo 3.1
// Copy   : Gemini 2.5 Flash (streamed)
// Podcast: ElevenLabs         → Gemini (Google) TTS
// A missing key never throws a 500 — it returns a typed NotConfigured so the UI can
// render an honest panel naming the exact env var.

import "server-only";

// ── key resolution ───────────────────────────────────────────────────────────
export const keys = {
  gemini: () =>
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    "",
  fal: () => process.env.FAL_KEY || process.env.FAL_API_KEY || "",
  eleven: () => process.env.ELEVENLABS_API_KEY || "",
  elevenVoice: () => process.env.ELEVENLABS_VOICE_ID || "Xb7hH8MSUJpSbSDYk0k2", // Alice — warm adult
};

export class NotConfigured extends Error {
  constructor(public envVar: string, public detail: string) {
    super(`${envVar} not configured`);
    this.name = "NotConfigured";
  }
}
export function isNotConfigured(e: unknown): e is NotConfigured {
  return e instanceof NotConfigured;
}

const GLB = "https://generativelanguage.googleapis.com/v1beta";
const dataUrl = (mime: string, b64: string) => `data:${mime};base64,${b64}`;

async function bufToB64(res: Response): Promise<string> {
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.toString("base64");
}

// ── IMAGE ─────────────────────────────────────────────────────────────────────
export interface ImageResult {
  provider: "imagen" | "fal";
  model: string;
  images: string[]; // data URLs
  aspectRatio: string;
}

export async function generateImages(
  brief: string,
  opts: { count?: number; aspectRatio?: string; referenceDataUrl?: string } = {},
): Promise<ImageResult> {
  const count = Math.min(Math.max(opts.count ?? 4, 1), 4);
  const aspectRatio = opts.aspectRatio ?? "1:1";
  const prompt = opts.referenceDataUrl
    ? `${brief}\n\nUse the uploaded reference as subject/mood guidance. Keep it on-brand and original — do not reproduce watermarks or logos.`
    : brief;
  const g = keys.gemini();
  if (g) {
    const model = "imagen-4.0-generate-001";
    const res = await fetch(`${GLB}/models/${model}:predict?key=${g}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: count, aspectRatio, personGeneration: "allow_adult" },
      }),
    });
    if (res.ok) {
      const d = (await res.json()) as { predictions?: Array<{ bytesBase64Encoded?: string }> };
      const images = (d.predictions ?? [])
        .map((p) => p.bytesBase64Encoded)
        .filter(Boolean)
        .map((b) => dataUrl("image/png", b as string));
      if (images.length) return { provider: "imagen", model, images, aspectRatio };
    }
    // fall through to Fal on non-200 or empty
  }
  const f = keys.fal();
  if (f) {
    const images = await falFlux(prompt, count, f);
    return { provider: "fal", model: "fal-ai/flux-pro/v1.1", images, aspectRatio };
  }
  // No local provider key — route through the deployed `generate-image` edge
  // function, which holds its own FAL_API_KEY in Supabase secrets. This is the
  // same path the live Auaha agent chat uses (lib/agents/creative.ts), so the
  // social studios generate real stills wherever the platform secrets live.
  const edge = await edgeGenerateImage(prompt);
  if (edge) return { provider: "fal", model: "generate-image edge · flux", images: [edge], aspectRatio };
  throw new NotConfigured(
    "GEMINI_API_KEY",
    "Image generation needs GEMINI_API_KEY (Imagen), FAL_KEY (Flux), or the generate-image edge function (Supabase env). None responded.",
  );
}

/** Fal Flux via the deployed Supabase edge function (its own FAL_API_KEY). */
async function edgeGenerateImage(prompt: string): Promise<string | null> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!base || !key) return null;
  try {
    const res = await fetch(`${base}/functions/v1/generate-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, provider: "fal", style: "photorealistic" }),
    });
    if (!res.ok) return null;
    const d = (await res.json()) as { imageUrl?: string };
    if (!d.imageUrl) return null;
    // Hosted Fal URLs get inlined so galleries stay self-contained; data URLs pass through.
    if (d.imageUrl.startsWith("data:")) return d.imageUrl;
    const r = await fetch(d.imageUrl);
    if (!r.ok) return d.imageUrl;
    return dataUrl(r.headers.get("content-type") || "image/jpeg", await bufToB64(r));
  } catch {
    return null;
  }
}

async function falFlux(prompt: string, count: number, key: string): Promise<string[]> {
  const res = await fetch("https://fal.run/fal-ai/flux-pro/v1.1", {
    method: "POST",
    headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, num_images: count, image_size: "square_hd" }),
  });
  if (!res.ok) throw new Error(`Fal Flux ${res.status}`);
  const d = (await res.json()) as { images?: Array<{ url: string }> };
  // Fal returns hosted URLs — fetch and inline so the workspace gallery is self-contained.
  const out: string[] = [];
  for (const img of d.images ?? []) {
    try {
      const r = await fetch(img.url);
      out.push(dataUrl(r.headers.get("content-type") || "image/jpeg", await bufToB64(r)));
    } catch {
      out.push(img.url);
    }
  }
  return out;
}

// ── VIDEO ───────────────────────────────────────────────────────────────────
// Fal Kling is (relatively) synchronous; Veo is long-running so we start-then-poll.
export type VideoStart =
  | { provider: "fal"; model: string; done: true; video: string } // data URL
  | { provider: "veo"; model: string; done: false; operation: string };

export async function startVideo(
  brief: string,
  opts: { aspectRatio?: string; referenceDataUrl?: string } = {},
): Promise<VideoStart> {
  const aspectRatio = opts.aspectRatio ?? "16:9";
  const f = keys.fal();
  if (f) {
    // Prefer image-to-video when a still/frame is provided.
    if (opts.referenceDataUrl?.startsWith("data:image/")) {
      const i2v = "fal-ai/kling-video/v2/master/image-to-video";
      const res = await fetch(`https://fal.run/${i2v}`, {
        method: "POST",
        headers: { Authorization: `Key ${f}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: brief,
          image_url: opts.referenceDataUrl,
          duration: "5",
          aspect_ratio: aspectRatio,
        }),
      });
      if (res.ok) {
        const d = (await res.json()) as { video?: { url: string } };
        if (d.video?.url) {
          const r = await fetch(d.video.url);
          return { provider: "fal", model: i2v, done: true, video: dataUrl("video/mp4", await bufToB64(r)) };
        }
      }
      // fall through to text-to-video if i2v fails
    }
    const model = "fal-ai/kling-video/v2/master/text-to-video";
    const res = await fetch(`https://fal.run/${model}`, {
      method: "POST",
      headers: { Authorization: `Key ${f}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: opts.referenceDataUrl
          ? `${brief}\n\n(Reference media provided by the user — match mood, subject, and palette.)`
          : brief,
        duration: "5",
        aspect_ratio: aspectRatio,
      }),
    });
    if (res.ok) {
      const d = (await res.json()) as { video?: { url: string } };
      if (d.video?.url) {
        const r = await fetch(d.video.url);
        return { provider: "fal", model, done: true, video: dataUrl("video/mp4", await bufToB64(r)) };
      }
    }
  }
  const g = keys.gemini();
  if (g) {
    const model = "veo-3.1-fast-generate-preview";
    const res = await fetch(`${GLB}/models/${model}:predictLongRunning?key=${g}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [
          {
            prompt: opts.referenceDataUrl
              ? `${brief}\n\n(User supplied reference media — honour subject and mood.)`
              : brief,
          },
        ],
        parameters: { aspectRatio },
      }),
    });
    if (res.ok) {
      const d = (await res.json()) as { name?: string };
      if (d.name) return { provider: "veo", model, done: false, operation: d.name };
    }
    const body = await res.text();
    throw new Error(`Veo start ${res.status}: ${body.slice(0, 160)}`);
  }
  throw new NotConfigured(
    "FAL_KEY",
    "Video needs FAL_KEY (Kling/Luma) or GEMINI_API_KEY (Veo). Neither is set.",
  );
}

export async function pollVideo(operation: string): Promise<{ done: boolean; video?: string }> {
  const g = keys.gemini();
  if (!g) throw new NotConfigured("GEMINI_API_KEY", "Cannot poll Veo without GEMINI_API_KEY.");
  const res = await fetch(`${GLB}/${operation}?key=${g}`);
  if (!res.ok) throw new Error(`Veo poll ${res.status}`);
  const d = (await res.json()) as {
    done?: boolean;
    response?: {
      generateVideoResponse?: { generatedSamples?: Array<{ video?: { uri?: string } }> };
    };
  };
  if (!d.done) return { done: false };
  const uri = d.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
  if (!uri) return { done: true };
  // Download the finished clip server-side (URI is key-scoped) and inline it.
  const vr = await fetch(uri.includes("key=") ? uri : `${uri}${uri.includes("?") ? "&" : "?"}key=${g}`);
  return { done: true, video: dataUrl("video/mp4", await bufToB64(vr)) };
}

// ── COPY (streamed) ────────────────────────────────────────────────────────────
export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export function geminiTextStream(system: string, turns: ChatTurn[]): ReadableStream<Uint8Array> {
  const g = keys.gemini();
  if (!g) throw new NotConfigured("GEMINI_API_KEY", "Copy generation needs GEMINI_API_KEY.");
  const contents = turns.map((t) => ({
    role: t.role === "assistant" ? "model" : "user",
    parts: [{ text: t.content }],
  }));
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const res = await fetch(
          `${GLB}/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${g}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: system }] },
              contents,
              generationConfig: { temperature: 0.9, maxOutputTokens: 2048 },
            }),
          },
        );
        if (!res.ok || !res.body) {
          controller.enqueue(encoder.encode(`\n[copy generation unavailable: ${res.status}]`));
          controller.close();
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            const t = line.trim();
            if (!t.startsWith("data:")) continue;
            const payload = t.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const j = JSON.parse(payload);
              const text = j?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
              if (text) controller.enqueue(encoder.encode(text));
            } catch {
              /* partial JSON across chunk boundary — ignore */
            }
          }
        }
        controller.close();
      } catch (e) {
        controller.enqueue(encoder.encode(`\n[copy generation error: ${(e as Error).message}]`));
        controller.close();
      }
    },
  });
}

/** Non-streamed Gemini call — used to draft podcast scripts and orchestrate. */
export async function geminiText(system: string, userText: string, temperature = 0.85): Promise<string> {
  const g = keys.gemini();
  if (!g) throw new NotConfigured("GEMINI_API_KEY", "Needs GEMINI_API_KEY.");
  const res = await fetch(`${GLB}/models/gemini-2.5-flash:generateContent?key=${g}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: userText }] }],
      generationConfig: { temperature, maxOutputTokens: 2048 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const d = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  return d.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
}

// ── PODCAST ─────────────────────────────────────────────────────────────────
export interface PodcastResult {
  provider: "elevenlabs" | "google-tts";
  model: string;
  audio: string; // data URL (mp3 / wav)
  script: string;
  chars: number;
}

export async function generatePodcast(script: string): Promise<PodcastResult> {
  const el = keys.eleven();
  if (el) {
    const voice = keys.elevenVoice();
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": el, "Content-Type": "application/json" },
        body: JSON.stringify({
          text: script,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.15 },
        }),
      },
    );
    if (res.ok) {
      return {
        provider: "elevenlabs",
        model: `eleven_multilingual_v2 · ${voice}`,
        audio: dataUrl("audio/mpeg", await bufToB64(res)),
        script,
        chars: script.length,
      };
    }
  }
  // Google (Gemini) TTS fallback
  const g = keys.gemini();
  if (g) {
    const res = await fetch(`${GLB}/models/gemini-2.5-flash-preview-tts:generateContent?key=${g}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: script }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } },
        },
      }),
    });
    if (res.ok) {
      const d = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> } }>;
      };
      const inline = d.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData;
      if (inline?.data) {
        return {
          provider: "google-tts",
          model: "gemini-2.5-flash-preview-tts · Aoede",
          audio: dataUrl(inline.mimeType || "audio/wav", inline.data),
          script,
          chars: script.length,
        };
      }
    }
  }
  throw new NotConfigured(
    "ELEVENLABS_API_KEY",
    "Podcast voice needs ELEVENLABS_API_KEY (or GEMINI_API_KEY for the Google TTS fallback).",
  );
}
