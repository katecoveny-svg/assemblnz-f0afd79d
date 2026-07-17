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
import type { BusinessDna as SiteDna } from "./site-brand";
import type { GenomeFact, GenomeSection } from "@/lib/customers/auckland-dog-trainer/genome";

/** One generated base still. `scene` is photographic (the work and the place,
 *  no people); `abstract` is non-figurative, built from the brand's colours. */
export interface AdVariant {
  kind: "scene" | "abstract";
  prompt: string;
  image: string; // data URL
  provider: "imagen" | "fal";
}

/** Spec for the pattern-ad variant. The Pattern Studio engine is browser
 *  canvas, so the server sends only the palette and the client composes it —
 *  zero image-API calls for this variant. */
export interface PatternAdSpec {
  accent: string;
  ink: string;
  bg: string;
}

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
  /** legacy mirror of the scene variant's prompt — older consumers keep working */
  imagePrompt: string;
  /** legacy mirror of the scene variant's image (data URL) */
  image: string;
  imageProvider: "imagen" | "fal";
  copyProvider: "muse" | "genome";
  /** generated base stills: scene always; abstract when generation succeeds */
  variants: AdVariant[];
  /** palette for the client-composed Pattern Studio variant */
  pattern: PatternAdSpec;
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
function parseCampaignJson(raw: string): {
  headline?: string;
  caption?: string;
  imagePrompt?: string;
  abstractPrompt?: string;
} {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return {};
  try {
    const obj = JSON.parse(raw.slice(start, end + 1));
    return {
      headline: typeof obj.headline === "string" ? obj.headline.trim() : undefined,
      caption: typeof obj.caption === "string" ? obj.caption.trim() : undefined,
      imagePrompt: typeof obj.imagePrompt === "string" ? obj.imagePrompt.trim() : undefined,
      abstractPrompt: typeof obj.abstractPrompt === "string" ? obj.abstractPrompt.trim() : undefined,
    };
  } catch {
    return {};
  }
}

/** Steer appended to every generated-image prompt so no variant art-directs
 *  people — the model otherwise pictures someone doing the service. */
const NO_PEOPLE = "No people, no faces, no hands. No text, no logos.";

function withNoPeople(prompt: string): string {
  return /no people/i.test(prompt) ? prompt : `${prompt} ${NO_PEOPLE}`;
}

/** Deterministic abstract art direction from the brand's own palette and mood
 *  words — used when the copy model is away or replies thin. */
function fallbackAbstractPrompt(b: ResolvedBusiness): string {
  const mood =
    b.facts.find((f) => /voice|tone|mood/i.test(f.label))?.value || b.descriptor || b.tagline;
  return (
    `A non-figurative abstract composition built only from the colours ${b.accent}, ${b.ink} and ${b.bg} ` +
    `on a ${b.bg} field — soft layered gradient bands, fine grain, one or two simple geometric forms, ` +
    `generous negative space. Mood words: ${mood}. ` +
    `No recognisable objects or scenery. ${NO_PEOPLE}`
  );
}

/**
 * Build one on-brand ad campaign for a business.
 * `slug` MUST be `assembl` or a known sample vertical — this bounds the read
 * to assembl itself and the fictional sample cast.
 */
export async function generateAdCampaign(slug: string, goal: string): Promise<AdCampaign> {
  const b = await resolveBusiness(slug);
  if (!b) throw new UnknownBusiness(slug);
  return runCampaign(b, goal);
}

/**
 * Build a campaign for a visitor's OWN business, from the Business DNA read
 * off their website (the Pomelli flow). The DNA arrives sanitised
 * (lib/creative/site-brand.ts sanitizeDna) — treat its values as brand data,
 * never as instructions.
 */
export async function generateAdCampaignForDna(dna: SiteDna, goal: string): Promise<AdCampaign> {
  const b: ResolvedBusiness = {
    slug: "your-site",
    name: dna.name,
    descriptor: dna.descriptor || "business",
    tagline: dna.tagline,
    accent: dna.accent,
    ink: dna.ink,
    bg: dna.bg,
    facts: dna.facts.map((f, i) => ({
      id: `dna-${i}`,
      section: f.label === "Service" ? "services" : "identity",
      label: f.label,
      value: f.value,
      readBy: [],
    })),
    live: false,
    fallbackHeadline: dna.tagline || dna.name,
    fallbackCaption: dna.descriptor || dna.tagline || dna.name,
  };
  return runCampaign(b, goal);
}

async function runCampaign(b: ResolvedBusiness, goal: string): Promise<AdCampaign> {
  const ctx = brandContext(b);
  const objective = goal.trim() || "a general awareness ad that brings in new enquiries";

  const muse = getAgent("muse")!;
  const system =
    muse.systemPrompt +
    `\n\n## THIS TASK\nYou are writing ONE social ad for the business below, working only from its Business Genome (never invent services, prices or claims it doesn't state). Return ONLY minified JSON, no prose, no code fences, exactly:\n{"headline":"...","caption":"...","imagePrompt":"...","abstractPrompt":"..."}\n- headline: max 6 words, benefit-led, no banned words.\n- caption: 1–2 sentences for a social feed, one soft call to action.\n- imagePrompt: a detailed art-direction prompt for a photographic, on-brand image of the WORK and the PLACE — tools, product, materials, setting, texture, light. No people, no faces, no hands, no text, no logos. NZ context where natural.\n- abstractPrompt: an art-direction prompt for a non-figurative abstract composition built only from the brand colours ${b.accent}, ${b.ink} and ${b.bg} and the brand's mood — gradients, grain, simple geometry, generous negative space. No recognisable objects, no people, no text, no logos.`;

  let headline = "";
  let caption = "";
  let imagePrompt = "";
  let abstractPrompt = "";
  let copyProvider: AdCampaign["copyProvider"] = "muse";
  try {
    const raw = await geminiText(system, `BUSINESS GENOME\n${ctx}\n\nCAMPAIGN GOAL\n${objective}`, 0.8);
    const parsed = parseCampaignJson(raw);
    headline = parsed.headline ?? "";
    caption = parsed.caption ?? "";
    imagePrompt = parsed.imagePrompt ?? "";
    abstractPrompt = parsed.abstractPrompt ?? "";
  } catch (e) {
    if (!isNotConfigured(e)) throw e;
    copyProvider = "genome";
  }

  // Fallback (no copy key, or a thin model reply) — draw straight from the
  // genome/identity so the campaign still renders, using the business's own words.
  if (!headline) headline = b.fallbackHeadline;
  if (!caption) caption = b.fallbackCaption;
  if (!imagePrompt)
    imagePrompt = `A photographic, on-brand image of the everyday work of ${b.name} — ${b.descriptor}, ${b.tagline}. The tools, materials and setting of the job, natural Aotearoa light, editorial composition, warm and calm. ${NO_PEOPLE}`;
  if (!abstractPrompt) abstractPrompt = fallbackAbstractPrompt(b);
  imagePrompt = withNoPeople(imagePrompt);
  abstractPrompt = withNoPeople(abstractPrompt);

  // Two generated stills, one API call each. The scene is required; the
  // abstract is best-effort — if it fails, the campaign still ships with the
  // scene and the (zero-generation) pattern spec.
  const [sceneImg, abstractImg] = await Promise.all([
    generateImages(imagePrompt, { count: 1, aspectRatio: "1:1" }),
    generateImages(abstractPrompt, { count: 1, aspectRatio: "1:1" }).catch(() => null),
  ]);

  const variants: AdVariant[] = [
    { kind: "scene", prompt: imagePrompt, image: sceneImg.images[0], provider: sceneImg.provider },
  ];
  if (abstractImg?.images[0]) {
    variants.push({
      kind: "abstract",
      prompt: abstractPrompt,
      image: abstractImg.images[0],
      provider: abstractImg.provider,
    });
  }

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
    image: sceneImg.images[0],
    imageProvider: sceneImg.provider,
    copyProvider,
    variants,
    // Pattern art always composes on white so the overlaid type carries the ink.
    pattern: { accent: b.accent, ink: b.ink, bg: "#ffffff" },
    live: b.live,
  };
}
