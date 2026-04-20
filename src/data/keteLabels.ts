// ═══════════════════════════════════════════════════════════════
// CANONICAL KETE LABELS — locked 2026-04-20 (8 entries only)
// ═══════════════════════════════════════════════════════════════
// Assembl has exactly 8 ketes: 7 industry + 1 consumer (Tōro).
//
// Retired/legacy codes (Hanga, Pakihi, Waka, Hangarau, Hauora,
// Te Kāhui Reo) MUST NOT appear in user-facing copy. They are
// archived in /docs/legacy-kete-codes.md for historical reference.
//
// Used by /knowledge and per-kete chrome.
// ═══════════════════════════════════════════════════════════════

export interface KeteLabel {
  code: string;          // matches industry_knowledge_base.kete
  slug: string;          // route slug (lowercase)
  short: string;         // short te reo name
  english: string;       // english descriptor
  href: string;          // landing page route
  accent: string;        // hex accent for chips
}

export const KETE_LABELS: KeteLabel[] = [
  { code: "MANAAKI",  slug: "manaaki",  short: "Manaaki",  english: "Hospitality",                href: "/manaaki",  accent: "#4AA5A8" },
  { code: "WAIHANGA", slug: "waihanga", short: "Waihanga", english: "Construction",               href: "/waihanga", accent: "#3A7D6E" },
  { code: "AUAHA",    slug: "auaha",    short: "Auaha",    english: "Creative",                   href: "/auaha",    accent: "#9B8EC4" },
  { code: "ARATAKI",  slug: "arataki",  short: "Arataki",  english: "Automotive & Fleet",         href: "/arataki",  accent: "#4A6FA5" },
  { code: "PIKAU",    slug: "pikau",    short: "Pikau",    english: "Freight & Customs",          href: "/pikau",    accent: "#5AADA0" },
  { code: "HOKO",     slug: "hoko",     short: "Hoko",     english: "Retail",                     href: "/hoko",     accent: "#C66B5C" },
  { code: "AKO",      slug: "ako",      short: "Ako",      english: "Early Childhood Education",  href: "/ako",      accent: "#7BA7C7" },
  { code: "TORO",     slug: "toro",     short: "Tōro",     english: "Family",                     href: "/toro",     accent: "#4AA5A8" },
];

export const KETE_BY_CODE: Record<string, KeteLabel> =
  Object.fromEntries(KETE_LABELS.map((k) => [k.code, k]));

export const KETE_BY_SLUG: Record<string, KeteLabel> =
  Object.fromEntries(KETE_LABELS.map((k) => [k.slug, k]));
