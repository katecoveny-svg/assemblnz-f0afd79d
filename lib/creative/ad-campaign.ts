// Genome-driven ad campaign — the Pomelli-equivalent, native to assembl.
// Reads a business's live Business Genome, writes on-brand ad copy with MUSE
// (Gemini) and generates a base image with PRISM (Imagen → Fal). The client
// composes the copy + image into sized, captioned ad cards.
//
// Pomelli (Google Labs) has no public API, so it can't be called; this builds
// the same idea — on-brand ads from your "Business DNA" — on assembl's own
// Genome and real generation stack.

import "server-only";
import { getAgent } from "./agents";
import { generateImages, geminiText, isNotConfigured } from "./generate";
import { getGenomeFactsFor } from "@/lib/customers/auckland-dog-trainer/genome-store";
import { verticalBySlug, type SampleVertical } from "@/lib/living-site/verticals";
import type { GenomeFact, GenomeSection } from "@/lib/customers/auckland-dog-trainer/genome";

export interface AdCampaign {
  business: {
    name: string;
    slug: string;
    tagline: string;
    /** palette from the genome so the composed ad is on-brand */
    accent: string;
    ink: string;
    bg: string;
  };
  headline: string;
  caption: string;
  imagePrompt: string;
  image: string; // data URL — a single base image, composed at each size client-side
  imageProvider: "imagen" | "fal";
  copyProvider: "muse" | "genome";
  /** true when the genome came from the live database, not the static fallback */
  live: boolean;
}

/** A compact, model-friendly brand brief built from the confirmed genome. */
function brandContext(v: SampleVertical, facts: GenomeFact[]): string {
  const pick = (section: GenomeSection, n: number) =>
    facts
      .filter((f) => f.section === section)
      .slice(0, n)
      .map((f) => `${f.label}: ${f.value}`);
  const identity = pick("identity", 4);
  const services = pick("services", 4);
  const proof = pick("proof", 2);
  return [
    `Business: ${v.businessName} — ${v.industryLabel}, ${v.tagline}. Owner: ${v.owner}.`,
    identity.length ? `Identity — ${identity.join("; ")}` : "",
    services.length ? `Services — ${services.join("; ")}` : "",
    proof.length ? `Proof — ${proof.join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Lenient JSON extractor — Gemini sometimes wraps output in fences or prose. */
function parseCampaignJson(raw: string): { headline?: string; caption?: string; imagePrompt?: string } {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return {};
  try {
    const obj = JSON.parse(raw.slice(start, end + 1));
    return {
      headline: typeof obj.headline === "string" ? obj.headline.trim() : undefined,
      caption: typeof obj.caption === "string" ? obj.caption.trim() : undefined,
      imagePrompt: typeof obj.imagePrompt === "string" ? obj.imagePrompt.trim() : undefined,
    };
  } catch {
    return {};
  }
}

export class UnknownBusiness extends Error {
  constructor(public slug: string) {
    super(`Unknown business: ${slug}`);
    this.name = "UnknownBusiness";
  }
}

/**
 * Build one on-brand ad campaign for a sample business.
 * `slug` MUST be a known sample vertical — the cast is fictional, and this
 * bounds the genome read to sample tenants only.
 */
export async function generateAdCampaign(slug: string, goal: string): Promise<AdCampaign> {
  const v = verticalBySlug(slug);
  if (!v) throw new UnknownBusiness(slug);

  const { facts, live } = await getGenomeFactsFor(v.tenant, v.fallbackFacts);
  const ctx = brandContext(v, facts);
  const objective = goal.trim() || "a general awareness ad that brings in new enquiries";

  const muse = getAgent("muse")!;
  const system =
    muse.systemPrompt +
    `\n\n## THIS TASK\nYou are writing ONE social ad for the business below, working only from its Business Genome (never invent services, prices or claims it doesn't state). Return ONLY minified JSON, no prose, no code fences, exactly:\n{"headline":"...","caption":"...","imagePrompt":"..."}\n- headline: max 6 words, benefit-led, no banned words.\n- caption: 1–2 sentences for a social feed, one soft call to action.\n- imagePrompt: a detailed art-direction prompt for a photographic, on-brand image with NO text and no logos — subject, setting, light, mood, palette. NZ context where natural.`;

  let headline = "";
  let caption = "";
  let imagePrompt = "";
  let copyProvider: AdCampaign["copyProvider"] = "muse";
  try {
    const raw = await geminiText(system, `BUSINESS GENOME\n${ctx}\n\nCAMPAIGN GOAL\n${objective}`, 0.8);
    const parsed = parseCampaignJson(raw);
    headline = parsed.headline ?? "";
    caption = parsed.caption ?? "";
    imagePrompt = parsed.imagePrompt ?? "";
  } catch (e) {
    if (!isNotConfigured(e)) throw e;
    copyProvider = "genome";
  }

  // Fallback (no copy key, or a thin model reply) — draw straight from the
  // genome/identity so the campaign still renders, using the business's own words.
  if (!headline) headline = v.heroHeadline;
  if (!caption) caption = v.heroLede;
  if (!imagePrompt)
    imagePrompt = `A photographic, on-brand hero image for ${v.businessName} — ${v.industryLabel}, ${v.tagline}. Natural Aotearoa light, editorial composition, warm and calm. No text, no logos.`;

  const img = await generateImages(imagePrompt, { count: 1, aspectRatio: "1:1" });

  return {
    business: {
      name: v.businessName,
      slug: v.slug,
      tagline: v.tagline,
      accent: v.palette.accent,
      ink: v.palette.ink,
      bg: v.palette.bg,
    },
    headline,
    caption,
    imagePrompt,
    image: img.images[0],
    imageProvider: img.provider,
    copyProvider,
    live,
  };
}
