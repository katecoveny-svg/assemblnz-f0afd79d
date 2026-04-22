/**
 * Industry kete imagery — Brand Guidelines v1.0 canonical
 * --------------------------------------------------------
 * Per-industry feather-kete photographs, each tinted with the kete's
 * accent colour. Use these everywhere a kete portrait appears (industry
 * landing pages, kete cards, hero modules, brand guidelines).
 *
 * Hero (lake/mountain) kete is for marketing mastheads only.
 */
import keteHero from "@/assets/brand/hero-kete-masthead.jpg";
import ketePikau from "@/assets/brand/kete/kete-pikau.jpg";
import keteHoko from "@/assets/brand/kete/kete-hoko.jpg";
import keteAko from "@/assets/brand/kete/kete-ako.jpg";
import keteToro from "@/assets/brand/kete/kete-toro.jpg";
import keteManaaki from "@/assets/brand/kete/kete-manaaki.jpg";
import keteWaihanga from "@/assets/brand/kete/kete-waihanga.jpg";
import keteArataki from "@/assets/brand/kete/kete-arataki.jpg";
import keteAuaha from "@/assets/brand/kete/kete-auaha.jpg";

export type IndustrySlug =
  | "pikau" | "hoko" | "ako" | "toro"
  | "manaaki" | "waihanga" | "arataki" | "auaha";

export interface KeteBrandRecord {
  code: string;             // e.g. "PIKAU-01"
  slug: IndustrySlug;
  industry: string;         // human label
  accentName: string;       // "Soft Moss"
  accentHex: string;        // "#B8C7B1"
  image: string;            // imported asset path
}

export const INDUSTRY_KETE: Record<IndustrySlug, KeteBrandRecord> = {
  pikau:    { code: "PIKAU-01",    slug: "pikau",    industry: "Freight & Customs",  accentName: "Soft Moss",       accentHex: "#B8C7B1", image: ketePikau },
  hoko:     { code: "HOKO-02",     slug: "hoko",     industry: "Retail",             accentName: "Blush Stone",     accentHex: "#D8C3C2", image: keteHoko },
  ako:      { code: "AKO-03",      slug: "ako",      industry: "Early Childhood",    accentName: "Soft Sage",       accentHex: "#C7D6C7", image: keteAko },
  toro:     { code: "TORO-04",     slug: "toro",     industry: "Family",             accentName: "Moonstone Blue",  accentHex: "#C7D9E8", image: keteToro },
  manaaki:  { code: "MANAAKI-05",  slug: "manaaki",  industry: "Hospitality",        accentName: "Warm Linen",      accentHex: "#E6D8C6", image: keteManaaki },
  waihanga: { code: "WAIHANGA-06", slug: "waihanga", industry: "Construction",       accentName: "Clay Sand",       accentHex: "#CBB8A4", image: keteWaihanga },
  arataki:  { code: "ARATAKI-07",  slug: "arataki",  industry: "Automotive & Fleet", accentName: "Dusky Rose",      accentHex: "#D5C0C8", image: keteArataki },
  auaha:    { code: "AUAHA-08",    slug: "auaha",    industry: "Creative",           accentName: "Pale Seafoam",    accentHex: "#C8DDD8", image: keteAuaha },
};

export const INDUSTRY_KETE_LIST: KeteBrandRecord[] = Object.values(INDUSTRY_KETE);

export const HERO_KETE_IMAGE = keteHero;

/** Lookup helper — returns the industry record or undefined. */
export const keteFor = (slug: string): KeteBrandRecord | undefined =>
  INDUSTRY_KETE[slug.toLowerCase() as IndustrySlug];
