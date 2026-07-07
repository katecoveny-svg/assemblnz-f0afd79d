/**
 * Bundle display metadata — the CODE mirror of public.bundles, used to render
 * the bundle cards on the shelf and the /bundles/<slug> detail pages.
 *
 * V4 architecture (LOCKED 2026-07-01): eight bundles + one standalone (Visa).
 *
 *   Assembler — Construction   (lead: Foreman*)
 *   Forge     — Automotive     (lead: Arataki — existing agent)
 *   Ensemble  — Creative       (lead: Creative Director*)
 *   Practice  — Human health   (lead: Duty Doctor*)
 *   Kaitiaki  — Animal + conservation (lead: Keeper — existing agent)
 *   Hearth    — Family / whānau (lead: Tōro — existing agent, becomes Whānau Navigator)
 *   Counsel   — Legal          (lead: Solicitor*)
 *   Visa      — Immigration    (STANDALONE — pack-priced, not monthly)
 *
 *   * = provisional lead-agent slug that will be built as a thin routing agent in
 *     a follow-up phase. The shelf card still renders with the lead slug even
 *     if no MarketplaceAgent is registered for it yet.
 *
 * English-first names on chrome, per feedback_te_reo_lighter_2026-06-24. te reo
 * appears only where it earns its place — Kaitiaki keeps `Kaitiakitanga` as its
 * subtitle because the word IS the right word; every other bundle sets teReo to
 * '' so the card headline stays clean English.
 */

export type BundleGroup = {
  /** section label on the bundle page */
  label: string;
  /** one-line section blurb */
  blurb: string;
  /** specialty slugs, in display order */
  slugs: string[];
};

export type BundleMeta = {
  slug: string;
  name: string;
  /** te reo label — kept where it earns its place (feedback_te_reo_lighter) */
  teReo: string;
  /** the bundle-page subtitle */
  subtitle: string;
  /** vertical / category */
  category: string;
  /** front-door lead agent slug */
  leadSlug: string;
  /** one-line pitch for the shelf card */
  shortPitch: string;
  /**
   * Hand-written card line for the marketplace shelf and homepage. The shelf
   * cards render lowercase, so this line avoids acronyms and initialisms —
   * never derive it from shortPitch (auto-lowercasing turned "GP" into "gp"
   * and "WoF" into "wof").
   */
  cardLine: string;
  /** headline bundle price (NZD/mo) */
  monthlyNzd: number;
  /** standalone per-seat price (NZD/mo) */
  seatNzd: number;
  /** AgentIcon key */
  icon: string;
  /** cream/canary accent */
  accent: string;
  groups: BundleGroup[];
  /**
   * Standalone marker — Visa is pack-priced (not monthly). The `monthlyNzd`
   * carries the headline paid unit ($49.99) so the type stays consistent.
   */
  standalone?: boolean;
};

export const ASSEMBLER_BUNDLE: BundleMeta = {
  slug: 'assembler',
  name: 'Assembler',
  teReo: '',
  subtitle:
    'The site foreman that routes site safety, consents, project admin and quality — drafted for a Licensed Building Practitioner to review.',
  category: 'construction',
  leadSlug: 'foreman',
  shortPitch:
    'The site foreman who routes safety, consents, project admin and quality — without you having to think about which agent owns which job.',
  cardLine:
    'the site foreman — safety, consents, project admin and quality, routed to the right specialist.',
  monthlyNzd: 399,
  seatNzd: 199,
  icon: 'shield',
  accent: '#F4A261',
  groups: [
    {
      label: 'Site + safety',
      blurb: 'Health and safety, risk registers, incidents and worker competency under the Health and Safety at Work Act 2015.',
      slugs: ['arai'],
    },
    {
      label: 'Design + product',
      blurb: 'BIM, plan review, and materials against Building Product Specifications 2025 and the Building Code.',
      slugs: ['ata', 'rawa'],
    },
    {
      label: 'Programme, contract + consent',
      blurb: 'Project scoping, payment claims, quality records, and the consent pathway from application through CCC.',
      slugs: ['kaupapa', 'pai', 'whakaae'],
    },
  ],
};

export const FORGE_BUNDLE: BundleMeta = {
  slug: 'forge',
  name: 'Forge',
  teReo: '',
  subtitle:
    'The service manager for dealerships, workshops and heavy transport — drafted for a registered trader or operator to act on.',
  category: 'automotive',
  leadSlug: 'arataki',
  shortPitch:
    'Service manager for dealerships, workshops and heavy transport. One front door for WoF/CoF, CCCFA finance, GPS consent, RUC, VDAM and freight admin.',
  cardLine:
    'the service manager for dealerships, workshops and heavy transport — warrants, finance and freight admin in one trail.',
  monthlyNzd: 349,
  seatNzd: 199,
  icon: 'car',
  accent: '#E76F51',
  groups: [
    {
      label: 'Dealership + workshop',
      blurb: 'CIN, CCCFA finance disclosure, WoF/CoF, courtesy cars and the CGA record.',
      slugs: ['arataki'],
    },
    {
      label: 'Customs + freight',
      blurb: 'Import entries, tariff classification and broker-ready documentation under the Customs and Excise Act 2018.',
      slugs: ['pikau', 'gateway'],
    },
  ],
};

export const ENSEMBLE_BUNDLE: BundleMeta = {
  slug: 'ensemble',
  name: 'Ensemble',
  teReo: '',
  subtitle:
    'The creative director — brief, draft, brand-redline and ship. ASA + Fair Trading + Copyright compliance on every artefact.',
  category: 'creative',
  leadSlug: 'creative-director',
  shortPitch:
    'A creative director who briefs, drafts, brand-redlines and ships — copy, image, video, 3D, podcast, schedule. ASA + Fair Trading + Copyright compliance on every artefact.',
  cardLine:
    'the creative director — briefs, drafts, redlines and ships, claim-safe and on brand every time.',
  monthlyNzd: 299,
  seatNzd: 149,
  icon: 'spark',
  accent: '#E9C46A',
  groups: [
    {
      label: 'Studio',
      blurb: 'Creative direction, brand DNA, and the full-shop pipeline from brief to publish.',
      slugs: ['auaha', 'prism'],
    },
    {
      label: 'Copy + campaigns',
      blurb: 'On-brand copy, claim-safe under the Fair Trading Act, and production plans that keep the campaign on time.',
      slugs: ['muse', 'saffron', 'social-manager'],
    },
  ],
};

export const PRACTICE_BUNDLE: BundleMeta = {
  slug: 'practice',
  name: 'Practice',
  teReo: '',
  subtitle:
    'The duty doctor. Triages the request to GP, oncology, mental health, paeds, women’s, aged care, ACC, allied health — and always sends the work to a registered practitioner for review.',
  category: 'health',
  leadSlug: 'duty-doctor',
  shortPitch:
    'A duty doctor who triages the request to GP, oncology, mental health, paeds, women’s, aged care, ACC, allied health or vet — and always sends the work to a registered practitioner for review.',
  cardLine:
    'the duty doctor — triages every request and always sends the work to a registered practitioner.',
  monthlyNzd: 499,
  seatNzd: 249,
  icon: 'scribe',
  accent: '#2A9D8F',
  groups: [
    {
      label: 'Clinical documentation + reception',
      blurb: 'Consult notes with ACC + Pharmac checks, and after-hours voice reception, drafted for a registered clinician.',
      slugs: ['quill', 'front'],
    },
  ],
};

export const KAITIAKI_BUNDLE: BundleMeta = {
  slug: 'kaitiaki',
  name: 'Kaitiaki',
  teReo: 'Kaitiakitanga',
  subtitle:
    'Animal care, welfare and conservation, drafted for a licensed vet or authorised welfare officer to sign.',
  category: 'animal',
  leadSlug: 'keeper',
  shortPitch:
    'Animal health, welfare, service and conservation — one front door. Keeper routes to a companion vet, farm, equine or exotic specialist, doggy daycare, welfare triage, wildlife rehab or Threatened Species Recovery.',
  cardLine:
    'animal health, welfare and conservation — one front door, from the clinic to the sanctuary.',
  monthlyNzd: 399,
  seatNzd: 199,
  icon: 'paw',
  accent: '#FFF7EC',
  groups: [
    {
      label: 'Vet clinical',
      blurb: 'Companion, production, equine and exotic — a draft for a registered veterinarian to examine and sign.',
      slugs: ['vet-small-animal', 'vet-large-animal', 'vet-equine', 'vet-exotic'],
    },
    {
      label: 'Welfare, training & service',
      blurb: 'Case triage, multi-agency rescue, dog training and behaviour, and the operating system for a boutique NZ doggy daycare.',
      slugs: ['spca-workflow', 'rescue-coordination', 'kaiako', 'doggy-daycare'],
    },
    {
      label: 'Conservation & wildlife',
      blurb:
        'Wildlife hospital, zoo vet, and Threatened Species Recovery. Taonga species never ship model-only — a named kaitiaki reviewer is always in the loop.',
      slugs: ['kakapo-recovery', 'kiwi-conservation', 'wildbase-recovery', 'zoo-vet', 'species-recovery'],
    },
  ],
};

export const HEARTH_BUNDLE: BundleMeta = {
  slug: 'hearth',
  name: 'Hearth',
  teReo: '',
  subtitle:
    'The whānau navigator. School notices, meals, calendar, elder check-ins, power bills, weather, catch logs. Tōro is the lead, no longer a peer.',
  category: 'family',
  leadSlug: 'toro',
  shortPitch:
    'The whānau navigator. School notices, meals, calendar, elder check-ins, power bills, weather, catch logs. Tōro is the lead, no longer a peer.',
  cardLine:
    'the whānau navigator — school notices, meals, money and the week ahead, sorted.',
  monthlyNzd: 24.99,
  seatNzd: 9.99,
  icon: 'whanau',
  accent: '#EFB366',
  groups: [
    {
      label: 'The lead',
      blurb: 'Helm — the front door to your household, riding on Tōro.',
      slugs: ['toro'],
    },
    {
      label: 'School + week',
      blurb: 'The morning brief, school notices and the family calendar.',
      slugs: ['dawn', 'panui-parser', 'school-notice'],
    },
    {
      label: 'Home + care',
      blurb: 'Meals, elder check-ins, the power bill and the household admin.',
      slugs: ['fridge-to-list', 'awhi', 'switch'],
    },
    {
      label: 'Coast + trips',
      blurb: 'The catch log and trip planning — the everyday stuff a whānau actually does.',
      slugs: ['catch-log', 'voyage'],
    },
  ],
};

export const COUNSEL_BUNDLE: BundleMeta = {
  slug: 'counsel',
  name: 'Counsel',
  teReo: '',
  subtitle:
    'The solicitor. Every output ends: this is a model-assisted draft — have a registered NZ lawyer review and sign.',
  category: 'legal',
  leadSlug: 'solicitor',
  shortPitch:
    'The solicitor. Routes to family, employment, property, wills/trusts, immigration appeals, tenancy, consumer, Te Tiriti, tax or Disputes Tribunal. Every output ends: this is a model-assisted draft — have a registered NZ lawyer review and sign.',
  cardLine:
    'the solicitor — every draft goes to a registered lawyer to review and sign before it counts.',
  monthlyNzd: 499,
  seatNzd: 249,
  icon: 'shield',
  accent: '#264653',
  groups: [
    {
      label: 'Coming soon',
      blurb:
        'Specialists across family, employment, property, wills and trusts, immigration appeals, tenancy, consumer, Te Tiriti, tax and Disputes Tribunal are being built. The Counsel front door ships first.',
      slugs: [],
    },
  ],
};

export const VISA_STANDALONE: BundleMeta = {
  slug: 'visa',
  name: 'Visa',
  teReo: '',
  subtitle:
    'One agent, one job. AEWV, partnership, dependent child, student. INZ form-pack, Schedule of Documents, fee table, refusal-risk flags. Refers to a licensed adviser before submitting.',
  category: 'immigration',
  leadSlug: 'visa',
  shortPitch:
    'One agent, one job. AEWV, partnership, dependent child, student. INZ form-pack, Schedule of Documents, fee table, refusal-risk flags. Refers to a licensed adviser before submitting.',
  cardLine:
    'one agent, one job — a complete visa application pack, checked with a licensed adviser before it ships.',
  monthlyNzd: 49.99,
  seatNzd: 49.99,
  icon: 'panui',
  accent: '#457B9D',
  standalone: true,
  groups: [
    {
      label: 'Coming soon',
      blurb:
        'A single visa agent priced as a pack ($49.99 application pack, $199 advisor mode). Ships after Counsel.',
      slugs: [],
    },
  ],
};

export const BUNDLES: Record<string, BundleMeta> = {
  assembler: ASSEMBLER_BUNDLE,
  forge: FORGE_BUNDLE,
  ensemble: ENSEMBLE_BUNDLE,
  practice: PRACTICE_BUNDLE,
  kaitiaki: KAITIAKI_BUNDLE,
  hearth: HEARTH_BUNDLE,
  counsel: COUNSEL_BUNDLE,
  visa: VISA_STANDALONE,
};

/**
 * The nine cards that render on /agents, in display order:
 *   Kaitiaki + Hearth + Assembler + Forge + Practice + Ensemble + Counsel + Visa
 * (Kaitiaki first because it's the most-shipped bundle right now.)
 */
export const BUNDLE_ORDER: string[] = [
  'kaitiaki',
  'hearth',
  'assembler',
  'forge',
  'practice',
  'ensemble',
  'counsel',
  'visa',
];

export function bundleBySlug(slug: string): BundleMeta | undefined {
  return BUNDLES[slug];
}

export function orderedBundles(): BundleMeta[] {
  return BUNDLE_ORDER.map((s) => BUNDLES[s]).filter(Boolean);
}
