// Cost estimates + Mana Receipt for AUAHA generations.
// Estimates are indicative NZD, rounded up — enough for an honest per-gen figure on the
// receipt, not billing-grade. Never store a raw prompt that could carry PII.

export type Provider = "gemini" | "imagen" | "veo" | "fal" | "elevenlabs" | "google-tts" | "anthropic";

/** Rough US$→NZD; kept local so a receipt never depends on a live FX call. */
const USD_TO_NZD = 1.68;
const nzd = (usd: number) => Math.round(usd * USD_TO_NZD * 100) / 100;

/** Indicative unit costs in US$. Labelled "est." wherever surfaced. */
export const COST_USD = {
  imagenPerImage: 0.04, // Imagen 4.0 generate
  falFluxPerImage: 0.05, // Fal Flux Pro v1.1
  veoPerSecond: 0.2, // Veo 3.1 fast (with audio) — indicative
  falKlingPerVideo: 0.35, // Fal Kling image-to-video, ~5s
  geminiTextPerCall: 0.002, // 2.5 Flash, a paragraph or two
  elevenLabsPerKChar: 0.3, // Creator-tier TTS
  googleTtsPerKChar: 0.016, // Gemini TTS fallback
} as const;

export function imageCostNzd(count: number, provider: "imagen" | "fal"): number {
  const unit = provider === "imagen" ? COST_USD.imagenPerImage : COST_USD.falFluxPerImage;
  return nzd(unit * count);
}
export function videoCostNzd(provider: "veo" | "fal", seconds = 8): number {
  return nzd(provider === "veo" ? COST_USD.veoPerSecond * seconds : COST_USD.falKlingPerVideo);
}
export function copyCostNzd(): number {
  return nzd(COST_USD.geminiTextPerCall);
}
export function podcastCostNzd(chars: number, provider: "elevenlabs" | "google-tts"): number {
  const perK = provider === "elevenlabs" ? COST_USD.elevenLabsPerKChar : COST_USD.googleTtsPerKChar;
  return nzd((chars / 1000) * perK + COST_USD.geminiTextPerCall);
}

// ── Mana Receipt ────────────────────────────────────────────────────────────
export interface ManaReceipt {
  /** which AUAHA agent produced it */
  agent: string;
  kind: "image" | "video" | "copy" | "podcast";
  provider: Provider;
  model: string;
  /** indicative NZD, e.g. "$0.07 est." rendered by the UI */
  costNzd: number;
  /** original AI generation — the trust line shown under every asset */
  trust: string;
  /** short, PII-safe brief summary (never the raw prompt) */
  briefSummary: string;
  /** e.g. "1024×1024", "8s 720p", "31s MP3" */
  spec?: string;
  createdAt: string;
}

/** Redact a brief to a short, PII-safe summary. Strips emails, phone numbers, and
 *  long strings; keeps only the first clause so a receipt never leaks personal data. */
export function safeBriefSummary(brief: string): string {
  const cleaned = brief
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]")
    .replace(/(\+?\d[\d\s-]{6,}\d)/g, "[number]")
    .trim();
  const firstClause = cleaned.split(/[.\n]/)[0] ?? cleaned;
  return firstClause.length > 90 ? firstClause.slice(0, 87).trimEnd() + "…" : firstClause;
}

export function buildReceipt(input: {
  agent: string;
  kind: ManaReceipt["kind"];
  provider: Provider;
  model: string;
  costNzd: number;
  brief: string;
  spec?: string;
  now: string;
}): ManaReceipt {
  const trustByKind: Record<ManaReceipt["kind"], string> = {
    image: "Original AI generation · not for publish without human sign-off",
    video: "Original AI generation · draft film · human sign-off before publish",
    copy: "Original draft · claims to be checked (Fair Trading Act) before publish",
    podcast: "Original AI voice · licensed voice · human sign-off before publish",
  };
  return {
    agent: input.agent,
    kind: input.kind,
    provider: input.provider,
    model: input.model,
    costNzd: input.costNzd,
    trust: trustByKind[input.kind],
    briefSummary: safeBriefSummary(input.brief),
    spec: input.spec,
    createdAt: input.now,
  };
}
