// Genome-driven ad campaign — the Pomelli-equivalent, native to assembl.
// Reads a business's Business Genome, writes on-brand ad copy with MUSE
// (Gemini) and generates a base image with PRISM (Imagen → Fal). The client
// composes the copy + image into sized, captioned ad cards.
//
// Pomelli (Google Labs) has no public API, so it can't be called; this builds
// the same idea — on-brand ads from your "Business DNA" — on assembl's own
// Genome and real generation stack. assembl runs its own launch ad here too.

import "server-only";
import { getAgent } from "./agents";
import { generateImages, geminiText, isNotConfigured } from "./generate";
import { getGenomeFactsFor } from "@/lib/customers/auckland-dog-trainer/genome-store";
import { ASSEMBL_TENANT, ASSEMBL_FALLBACK_FACTS } from "@/lib/customers/assembl/genome";
import { verticalBySlug } from "@/lib/living-site/verticals";
import type { GenomeFact, GenomeSection } from "@/lib/customers/auckland-dog-trainer/genome";

export interface AdCampaign {
  business: {
    name: string;
    slug: string;
    tagline: string;
    /** palette so the composed ad is on-brand */
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

/** assembl's own launch identity — its palette is the light canon. */
export const ASSEMBL_AD = {
  slug: "assembl",
  name: "assembl",
  descriptor: "living business operating system",
  tagline: "a living business operating system",
  accent: "#3f7373",
  ink: "#313c42",
  bg: "#ffffff",
} as const;

export class UnknownBusiness extends Error {
  constructor(public slug: string) {
    super(`Unknown business: ${slug}`);
    this.name = "UnknownBusiness";
  }
}

type ResolvedBusiness = {
  slug: string;
  name: string;
  descriptor: string;
  tagline: string;
  accent: string;
  ink: string;
  bg: string;
  facts: GenomeFact[];
  live: boolean;
  fallbackHeadline: string;
  fallbackCaption: string;
};

/** Resolve a slug to a runnable business — assembl itself, or a sample vertical. */
async function resolveBusiness(slug: string): Promise<ResolvedBusiness | null> {
  if (slug === ASSEMBL_AD.slug) {
    // Dogfood: assembl grounds its own ads on its own LIVE genome (tenant
    // 'assembl'), exactly like every sample vertical. The static fallback
    // mirrors the DB seeds, so behaviour is identical when the DB is away.
    const { facts, live } = await getGenomeFactsFor(ASSEMBL_TENANT, ASSEMBL_FALLBACK_FACTS);
    return {
      slug: ASSEMBL_AD.slug,
      name: ASSEMBL_AD.name,
      descriptor: ASSEMBL_AD.descriptor,
      tagline: ASSEMBL_AD.tagline,
      accent: ASSEMBL_AD.accent,
      ink: ASSEMBL_AD.ink,
      bg: ASSEMBL_AD.bg,
      facts,
      live,
      fallbackHeadline: "Less admin. More mahi.",
      fallbackCaption: "assembl grows your business while you run it.",
    };
  }
  const v = verticalBySlug(slug);
  if (!v) return null;
  const { facts, live } = await getGenomeFactsFor(v.tenant, v.fallbackFacts);
  return {
    slug: v.slug,
    name: v.businessName,
    descriptor: v.industryLabel,
    tagline: v.tagline,
    accent: v.palette.accent,
    ink: v.palette.ink,
    bg: v.palette.bg,
    facts,
    live,
    fallbackHeadline: v.heroHeadline,
    fallbackCaption: v.heroLede,
  };
}

/** A compact, model-friendly brand brief built from the confirmed genome. */
function brandContext(b: ResolvedBusiness): string {
  const pick = (section: GenomeSection, n: number) =>
    b.facts
      .filter((f) => f.section === section)
      .slice(0, n)
      .map((f) => `${f.label}: ${f.value}`);
  const identity = pick("identity", 5);
  const services = pick("services", 4);
  const proof = pick("proof", 2);
  return [
    `Business: ${b.name} — ${b.descriptor}, ${b.tagline}.`,
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

/**
 * Build one on-brand ad campaign for a business.
 * `slug` MUST be `assembl` or a known sample vertical — this bounds the read
 * to assembl itself and the fictional sample cast.
 */
export async function generateAdCampaign(slug: string, goal: string): Promise<AdCampaign> {
  const b = await resolveBusiness(slug);
  if (!b) throw new UnknownBusiness(slug);

  const ctx = brandContext(b);
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
  if (!headline) headline = b.fallbackHeadline;
  if (!caption) caption = b.fallbackCaption;
  if (!imagePrompt)
    imagePrompt = `A photographic, on-brand image for ${b.name} — ${b.descriptor}, ${b.tagline}. Natural Aotearoa light, editorial composition, warm and calm. No text, no logos.`;

  const img = await generateImages(imagePrompt, { count: 1, aspectRatio: "1:1" });

  return {
    business: {
      name: b.name,
      slug: b.slug,
      tagline: b.tagline,
      accent: b.accent,
      ink: b.ink,
      bg: b.bg,
    },
    headline,
    caption,
    imagePrompt,
    image: img.images[0],
    imageProvider: img.provider,
    copyProvider,
    live: b.live,
  };
}
