// ═══════════════════════════════════════════════════════════════
// Canonical mapping between industry_knowledge_base.kete codes
// (uppercase, snake) and the user-facing labels + URL slugs.
// Used by the public /knowledge page and the per-kete strip.
// ═══════════════════════════════════════════════════════════════

export interface KeteLabel {
  code: string;          // matches industry_knowledge_base.kete
  slug: string;          // route slug (lowercase) — null for cross-cutting
  short: string;         // short te reo name
  english: string;       // english descriptor
  href: string | null;   // landing page route
  accent: string;        // hex accent for chips
}

export const KETE_LABELS: KeteLabel[] = [
  { code: "MANAAKI",      slug: "manaaki",  short: "Manaaki",      english: "Hospitality",        href: "/manaaki",  accent: "#4AA5A8" },
  { code: "WAIHANGA",     slug: "waihanga", short: "Waihanga",     english: "Construction",       href: "/waihanga", accent: "#3A7D6E" },
  { code: "AUAHA",        slug: "auaha",    short: "Auaha",        english: "Creative",           href: "/auaha",    accent: "#C97B5C" },
  { code: "ARATAKI",      slug: "arataki",  short: "Arataki",      english: "Automotive",         href: "/arataki",  accent: "#4A6FA5" },
  { code: "HOKO",         slug: "hoko",     short: "Hoko",         english: "Retail & Trade",     href: "/hoko",     accent: "#7B5EA7" },
  { code: "WHENUA",       slug: "whenua",   short: "Whenua",       english: "Land & Primary",     href: "/pikau",    accent: "#5A7E4F" },
  { code: "ORA",          slug: "ora",      short: "Ora",          english: "Health & Wellbeing", href: "/ako",      accent: "#B8576A" },
  { code: "KĀINGA",       slug: "kainga",   short: "Kāinga",       english: "Home & Family",      href: "/toroa",    accent: "#8C6B4F" },
  { code: "AKO",          slug: "ako",      short: "Ako",          english: "Education",          href: "/ako",      accent: "#4F8CB8" },
  { code: "HANGARAU",     slug: "hangarau", short: "Hangarau",     english: "Technology",         href: null,        accent: "#5C6F8A" },
  { code: "HAUORA",       slug: "hauora",   short: "Hauora",       english: "Wellness & Travel",  href: "/voyage",   accent: "#6FA88C" },
  { code: "TE_KAHUI_REO", slug: "te-reo",   short: "Te Kāhui Reo", english: "Te Reo & Tikanga",   href: null,        accent: "#A87B4F" },
  { code: "OPEN_DATA",    slug: "open-data",short: "Open Data",    english: "Cross-cutting NZ open datasets", href: null, accent: "#3D4250" },
];

export const KETE_BY_CODE: Record<string, KeteLabel> =
  Object.fromEntries(KETE_LABELS.map((k) => [k.code, k]));

export const KETE_BY_SLUG: Record<string, KeteLabel> =
  Object.fromEntries(KETE_LABELS.map((k) => [k.slug, k]));
