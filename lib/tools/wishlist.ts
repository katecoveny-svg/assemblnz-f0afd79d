/**
 * Wishlist tool engine — pure functions, no network, unit-testable.
 *
 * A NZ business names one job they wish they could hand off; the tool returns a
 * tailored spec for the specialist Assembl would build them. The live route
 * (app/api/wishlist/spec) calls a model for this; if the model call fails or
 * returns malformed JSON, we fall back to buildFallbackSpec() so the tool never
 * breaks. Both paths return the same WishlistSpec shape.
 *
 * Every output is a draft for a named human reviewer, sealed in an evidence
 * pack; nothing is ever lodged automatically. This is not legal/financial/
 * medical advice. NZ English, macrons intact, never the word "AI".
 */

export const WISHLIST_KETE = [
  'Pīkau',
  'Manaaki',
  'Waihanga',
  'Arataki',
  'Hoko',
  'Ako',
  'Auaha',
  'Mātauranga',
  'Tōro',
  'Core',
] as const;

export type WishlistKete = (typeof WISHLIST_KETE)[number];

export type WishlistSpec = {
  kete: WishlistKete;
  specialistName: string;
  drafts: string[];
  checks: string[];
  hoursPerWeek: number;
  forLine: string;
};

const PRIVACY_CHECK = 'Privacy Act 2020 check on any personal information handled';

function clampHours(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return 3;
  return Math.min(Math.max(Math.round(n), 1), 20);
}

function threeStrings(value: unknown, fallback: string[]): string[] {
  if (Array.isArray(value)) {
    const cleaned = value.map((v) => String(v).trim()).filter(Boolean).slice(0, 3);
    if (cleaned.length === 3) return cleaned;
    if (cleaned.length > 0) return [...cleaned, ...fallback].slice(0, 3);
  }
  return fallback.slice(0, 3);
}

/**
 * Validate + coerce an untrusted model response into a WishlistSpec. Returns
 * null when it isn't usable JSON of the right shape (caller then falls back).
 */
export function parseWishlistSpec(
  raw: unknown,
  business: string,
  wish: string,
): WishlistSpec | null {
  let obj: Record<string, unknown> | null = null;
  if (typeof raw === 'string') {
    // Tolerate stray prose around the JSON object.
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      obj = JSON.parse(match[0]) as Record<string, unknown>;
    } catch {
      return null;
    }
  } else if (raw && typeof raw === 'object') {
    obj = raw as Record<string, unknown>;
  }
  if (!obj) return null;

  const keteRaw = String(obj.kete ?? '').trim();
  const kete = (WISHLIST_KETE as readonly string[]).includes(keteRaw)
    ? (keteRaw as WishlistKete)
    : 'Core';

  const fallback = buildFallbackSpec(business, wish);

  const specialistName =
    typeof obj.specialistName === 'string' && obj.specialistName.trim()
      ? obj.specialistName.trim()
      : fallback.specialistName;

  let checks = threeStrings(obj.checks, fallback.checks);
  // The Privacy Act check is mandatory on every output.
  if (!checks.some((c) => /privacy act 2020/i.test(c))) {
    checks = [checks[0] ?? PRIVACY_CHECK, checks[1] ?? PRIVACY_CHECK, PRIVACY_CHECK].slice(0, 3);
    if (!checks.some((c) => /privacy act 2020/i.test(c))) checks[2] = PRIVACY_CHECK;
  }

  const forLine =
    typeof obj.forLine === 'string' && obj.forLine.trim() ? obj.forLine.trim() : fallback.forLine;

  return {
    kete,
    specialistName,
    drafts: threeStrings(obj.drafts, fallback.drafts),
    checks,
    hoursPerWeek: clampHours(obj.hoursPerWeek),
    forLine,
  };
}

type Rule = {
  kete: WishlistKete;
  keywords: RegExp;
  specialistName: string;
  drafts: string[];
  law: string;
};

// Conservative keyword map — the graceful fallback when the model is
// unavailable. Order matters: first match wins.
const RULES: Rule[] = [
  {
    kete: 'Pīkau',
    keywords: /customs|import|export|freight|tariff|hs code|broker|shipment|biosecurity|cargo/i,
    specialistName: 'a Pīkau customs drafter',
    drafts: [
      'a broker-ready customs entry draft from your commercial invoice',
      'a tariff-classification shortlist for your broker to confirm',
      'a biosecurity evidence checklist for the shipment',
    ],
    law: 'Customs and Excise Act 2018 and the Biosecurity Act 1993',
  },
  {
    kete: 'Manaaki',
    keywords: /food|allergen|menu|kitchen|hospitality|cafe|restaurant|roster|liquor|host/i,
    specialistName: 'a Manaaki hospitality drafter',
    drafts: [
      'an allergen matrix and menu disclosure draft',
      'a food-safety corrective-action note',
      'a roster and host-responsibility record for review',
    ],
    law: 'the Food Act 2014 and the Sale and Supply of Alcohol Act 2012',
  },
  {
    kete: 'Waihanga',
    keywords: /consent|build|site|construction|rfi|h&s|health and safety|sssp|producer statement|council|lim|reno|renovat|subcontract/i,
    specialistName: 'a Waihanga construction drafter',
    drafts: [
      'an RFI response drafted from your site notes',
      'a consent-pack gap checklist',
      'a site safety (SSSP) section for review',
    ],
    law: 'the Building Act 2004 and the Health and Safety at Work Act 2015',
  },
  {
    kete: 'Arataki',
    keywords: /vehicle|wof|cof|fleet|workshop|car|automotive|ruc|warrant|plate/i,
    specialistName: 'an Arataki fleet drafter',
    drafts: [
      'a WoF/CoF readiness summary from the job card',
      'a CGA disclosure draft for the sale',
      'a fleet maintenance record for review',
    ],
    law: 'the Land Transport Act 1998 and the Consumer Guarantees Act 1993',
  },
  {
    kete: 'Hoko',
    keywords: /retail|return|refund|stock|consumer|fair trading|warranty|shop|e-?commerce/i,
    specialistName: 'a Hoko retail drafter',
    drafts: [
      'a returns and refund response aligned to consumer law',
      'a supplier-records summary',
      'a fair-trading claims check for your listings',
    ],
    law: 'the Consumer Guarantees Act 1993 and the Fair Trading Act 1986',
  },
  {
    kete: 'Ako',
    keywords: /childcare|ece|early childhood|tamariki|kaiako|ratio|ero|kindergarten|daycare/i,
    specialistName: 'an Ako early-childhood drafter',
    drafts: [
      'a ratio and attendance record for review',
      'an ERO evidence-pack section',
      'a whānau communication draft',
    ],
    law: 'the Education and Training Act 2020 and Te Whāriki',
  },
  {
    kete: 'Auaha',
    keywords: /brand|campaign|content|marketing|creative|social|copy|advert|design/i,
    specialistName: 'an Auaha creative drafter',
    drafts: [
      'a campaign brief drafted from your goal',
      'a claims-and-rights check on the creative',
      'a content calendar for review',
    ],
    law: 'the Fair Trading Act 1986 and the Copyright Act 1994',
  },
  {
    kete: 'Mātauranga',
    keywords: /school|ncea|secondary|teacher|board of trustees|attendance|achievement standard|reporting/i,
    specialistName: 'a Mātauranga school drafter',
    drafts: [
      'a weekly NCEA reporting summary',
      'a board-pack section for review',
      'a pastoral note drafted from the records',
    ],
    law: 'the Education and Training Act 2020',
  },
  {
    kete: 'Tōro',
    keywords: /family|whānau|whanau|household|kids|school run|roster|chores|appointments/i,
    specialistName: 'a Tōro whānau drafter',
    drafts: [
      'a week-ahead plan from the school newsletter',
      'an appointments and gear checklist',
      'a household budget note for review',
    ],
    law: 'the Privacy Act 2020',
  },
];

const CORE_RULE: Omit<Rule, 'keywords'> = {
  kete: 'Core',
  specialistName: 'an assembl specialist drafter',
  drafts: [
    'a first draft of the work you described',
    'a checklist of what evidence is still missing',
    'a summary of the next action for your review',
  ],
  law: 'relevant NZ sector law',
};

/**
 * Deterministic fallback spec. Keyword-matches the wish to a kete and returns a
 * conservative, on-brand spec. Always includes the Privacy Act 2020 check and a
 * tikanga check.
 */
export function buildFallbackSpec(business: string, wish: string): WishlistSpec {
  const haystack = `${wish} ${business}`;
  const rule = RULES.find((r) => r.keywords.test(haystack)) ?? CORE_RULE;
  const biz = business.trim() || 'your business';
  const job = wish.trim() || 'the job you described';

  return {
    kete: rule.kete,
    specialistName: rule.specialistName,
    drafts: rule.drafts,
    checks: [
      `Built on ${rule.law}`,
      'A tikanga check appropriate to the work',
      PRIVACY_CHECK,
    ],
    hoursPerWeek: 4,
    forLine: `For ${biz}, taking ‘${job}’ off their plate.`,
  };
}
