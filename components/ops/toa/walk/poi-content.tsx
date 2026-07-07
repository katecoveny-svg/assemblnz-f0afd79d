import { POI_ANCHORS, type PoiId } from './geometry';
import { toaSiteVisit } from '@/lib/customers/toa-architects/demo-data';

/**
 * The seven ARC insights that hover over 16A. Regulatory figures are REAL and
 * cite-able — Auckland Unitary Plan H4 (operative, PC120), Building Code H1/AS1,
 * E2/AS1, NZGBC Homestar, the Te Aranga principles. Everything project-specific
 * (fees, lead times, precedents) is demo-labelled. Draft-mode throughout:
 * nothing here sends, lodges or determines anything.
 *
 * Te reo is capped by the brief: "Te Aranga" (principles POI) and "kaupapa"
 * (its design-intent line) are the only two terms used across all seven cards.
 */

export type PoiRow = { k: string; v: string; cite?: string };
export type PoiSlide = {
  heading: string;
  body?: string;
  bullets?: string[];
  rows?: PoiRow[];
  note?: string;
};
export type Poi = {
  id: PoiId;
  label: string;
  eyebrow: string;
  title: string;
  intro: string;
  trust: 'A' | 'B' | 'C';
  draft?: boolean;
  where: string;
  citation: string;
  custom?: 'chat';
  slides: PoiSlide[];
};

export const POIS: Poi[] = [
  {
    id: 'teAranga',
    label: 'Te Aranga',
    eyebrow: 'principles · design intent',
    title: 'the kaupapa of the site',
    where: 'on the boundary, before the building',
    intro:
      'Before a line is drawn, ARC holds the ground first: whose place this is, what the water does, what the naming carries. The kaupapa — the design intent — reads from the whenua out, not the floor plan in.',
    trust: 'B',
    slides: [
      {
        heading: 'whakapapa of the place',
        body:
          'Remuera sits within the rohe of Ngāti Whātua Ōrākei and the wider Tāmaki mana whenua. ARC surfaces that context up front so the design answers to the place — orientation, planting, stormwater and naming all read from it.',
        note: 'Cultural calls are ARC’s to raise, never to settle — held for review with mana whenua.',
      },
      {
        heading: 'the seven Te Aranga principles',
        bullets: [
          'Mana — the authority of mana whenua is recognised and respected',
          'Whakapapa — names, traditional and new, are celebrated',
          'Taiao — the natural environment is protected and restored',
          'Mauri Tū — environmental health is maintained and enhanced',
          'Mahi Toi — iwi/hapū narratives are expressed creatively',
          'Tohu — significant sites and cultural landmarks are acknowledged',
          'Ahi Kā — a living, enduring presence within the rohe',
        ],
      },
      {
        heading: 'how it lands on 16A',
        bullets: [
          'Taiao / Mauri Tū — the 225 mm stormwater line treated as a water story, not just a service',
          'Whakapapa — a naming conversation flagged for the client and mana whenua',
          'Mahi Toi — a place for narrative in the entry threshold, if welcomed',
        ],
        note: 'A prompt for kōrero — not a determination. The Te Aranga audit stays held for review with mana whenua.',
      },
    ],
    citation: 'Auckland Design Manual — Te Aranga Māori Design Principles (Auckland Council).',
  },
  {
    id: 'zoneRules',
    label: 'Zone rules',
    eyebrow: 'auckland unitary plan · H4',
    title: 'the rules for this address',
    where: 'on the side setback line',
    intro:
      '16A Hubert Henderson Place sits in AUP Zone H4 — Residential Mixed Housing Suburban. ARC reads the operative zone standards straight off the e-plan and checks the scheme against each, clause by clause.',
    trust: 'A',
    slides: [
      {
        heading: 'H4 · Mixed Housing Suburban — the standards',
        rows: [
          { k: 'Dwellings per site', v: 'up to 3 permitted; 4+ restricted discretionary', cite: 'Table H4.4.1 (A3/A4)' },
          { k: 'Max height', v: '8 m (+1 m for a roof pitched ≥15°)', cite: 'H4.6.4' },
          { k: 'Recession plane', v: '45° from 2.5 m above ground, side & rear', cite: 'H4.6.5' },
          { k: 'Yards', v: 'front 3 m · side 1 m · rear 1 m', cite: 'H4.6.7' },
          { k: 'Building coverage', v: 'max 40% of net site area', cite: 'H4.6.9' },
          { k: 'Impervious area', v: 'max 60% of site area', cite: 'H4.6.8' },
          { k: 'Landscaped area', v: 'min 40% (≥50% of the front yard)', cite: 'H4.6.10' },
        ],
      },
      {
        heading: 'the flag ARC raises',
        body:
          '16A + 16B are retained and 16C + 16D proposed — four dwellings on the site. That is past the three-dwelling permitted threshold, so the application reads as a Restricted Discretionary activity, not permitted as of right.',
        note: 'A gap flagged before lodgement, cited to Table H4.4.1 (A4) — so it’s a known step, not a surprise from council.',
      },
      {
        heading: 'which version of the plan',
        body:
          'These are the operative PC120 (Housing Intensification & Resilience) figures on the e-plan today. The MDRS / Plan Change 78 intensification standards are not operative in Auckland, so H4’s 8 m / 40% / 45° rules apply.',
        note: 'ARC re-checks live zone status at lodgement — intensification rules are in flux.',
      },
    ],
    citation:
      'Auckland Unitary Plan (Operative in part), Chapter H4 — Residential Mixed Housing Suburban Zone (clauses as cited).',
  },
  {
    id: 'h1Energy',
    label: 'H1 energy',
    eyebrow: 'building code · H1/AS1',
    title: 'the warmth the code asks for',
    where: 'on the north wall, in the sun',
    intro:
      'Auckland is H1 Climate Zone 2. ARC holds the minimum construction R-values the Building Code asks for and checks the wall, roof, floor and glazing build-ups against them.',
    trust: 'A',
    slides: [
      {
        heading: 'minimum construction R-values — Zone 2',
        rows: [
          { k: 'Roof / ceiling', v: 'R 6.6', cite: 'H1/AS1 Table 2.1.2.2B' },
          { k: 'Wall', v: 'R 2.0', cite: 'H1/AS1 Table 2.1.2.2B' },
          { k: 'Floor (slab-on-ground)', v: 'R 1.5', cite: 'H1/AS1 Table 2.1.2.2B' },
          { k: 'Windows & doors', v: 'R 0.46', cite: 'H1/AS1 Table 2.1.2.2B' },
        ],
        note: 'Schedule method, H1/AS1 5th edition Amendment 1 — in force from 4 August 2022.',
      },
      {
        heading: 'about solar heat gain',
        body:
          'Honest note: H1 sets thermal resistance (R-value), not a mandatory SHGC. Glass selection and passive solar are offered as design guidance, not a hard number — so ARC frames SHGC as a comfort decision for the north glazing, not a compliance gate.',
      },
      {
        heading: 'which edition',
        body:
          'The 5th-edition R-values above are the figures Nick’s team knows. The H1/AS1 6th edition (in force 27 Nov 2025, transition to 26 Nov 2026) moves housing off the Schedule method to calculation or modelling — ARC checks which path each consent runs under.',
        note: 'ARC flags the edition in play so the compliance route is never assumed.',
      },
    ],
    citation:
      'NZ Building Code Clause H1 Energy Efficiency — H1/AS1 5th ed. Amendment 1 (Auckland = Climate Zone 2).',
  },
  {
    id: 'consentMemo',
    label: 'Consent memo',
    eyebrow: 'live · draft-only',
    title: 'the memo, drafted at the desk',
    where: 'at the drawing desk, office corner',
    intro:
      'This is the real agent, not a script. Ask ARC to draft a consent memo for 16A and it writes one — grounded in the Building Code, the unitary plan and Te Aranga, closed with its sources and a trust grade. Nothing sends without your yes.',
    trust: 'B',
    draft: true,
    custom: 'chat',
    slides: [],
    citation: 'ARC streams live, grounded in Building Code / AUP H4 / Te Aranga / NZIA. Draft-only.',
  },
  {
    id: 'precedent',
    label: 'Precedent',
    eyebrow: 'nearby · consented',
    title: 'what’s been let nearby',
    where: 'on the mantel, in the living room',
    intro:
      'Before a pre-app, ARC pulls what’s already been consented nearby — the typology, the density, the conditions councils attached — so the 16C + 16D case stands on precedent, not hope.',
    trust: 'B',
    slides: [
      {
        heading: 'comparable consents nearby',
        bullets: [
          'Two-unit infill, Remuera — retained villa + rear two-bed, RDA granted (demo)',
          'Three-dwelling site, Meadowbank — recession-plane relief, granted with conditions (demo)',
          'Rear studio + minor dwelling, Ōrākei — permitted, no notification (demo)',
        ],
        note: 'Illustrative precedents, demo-labelled — the point is the pattern, not these exact records.',
      },
      {
        heading: 'how ARC sources it',
        bullets: [
          'Auckland Council public consent register — application status and decision notices',
          'LINZ titles and property data — lot sizes, easements, encumbrances',
          'GeoMaps / council GIS — zone overlays and site constraints',
        ],
        note: 'Read-only signal sources. ARC surfaces and links; it never edits a register.',
      },
    ],
    citation: 'Auckland Council public consent register · LINZ (read-only). Example precedents are demo.',
  },
  {
    id: 'materials',
    label: 'Materials',
    eyebrow: 'cladding · spec',
    title: 'the skin, specified',
    where: 'on the cladding, at eye height',
    intro:
      'The wall is bevel-back cedar weatherboard, per Work Section 2640. ARC holds the standards that make it weathertight and durable — and the performance story it buys.',
    trust: 'B',
    slides: [
      {
        heading: 'the build-up',
        rows: [
          { k: 'Cladding', v: 'bevel-back cedar weatherboard', cite: 'Work Section 2640' },
          { k: 'Profile', v: 'timber weatherboard profile', cite: 'NZS 3617' },
          { k: 'Cavity', v: '20 mm drained & vented cavity', cite: 'E2/AS1 (risk 7+)' },
          { k: 'Durability', v: 'timber treatment & selection', cite: 'NZS 3602' },
          { k: 'Framing', v: 'timber-framed, ≤10 m', cite: 'NZS 3604' },
        ],
      },
      {
        heading: 'performance it signals',
        body:
          'Over a drained cavity with the right R-value wall behind it, this build-up supports a warm, low-carbon home. On the Homestar v5 scale (6–10 certifiable), a 7-Homestar target reads as clearly above Building Code minimum.',
        note: 'Homestar rating is a design target here, confirmed only by an assessor.',
      },
      {
        heading: 'supply',
        body:
          'ARC keeps the lead time next to the spec so the programme and the material decision move together — cedar weatherboard indicative lead time ~6–8 weeks (demo figure).',
        note: 'Lead time is demo — ARC would read it live from the supplier at spec stage.',
      },
    ],
    citation: 'E2/AS1 External Moisture · NZS 3617 / 3602 / 3604 · NZGBC Homestar v5. Lead time is demo.',
  },
  {
    id: 'rfi',
    label: 'RFI',
    eyebrow: 'site notes · draft',
    title: 'the walk, turned into RFIs',
    where: 'on the deck, after the site meeting',
    intro: `A ${toaSiteVisit.memoSeconds}-second voice memo on the walk back to the car. ARC listens, structures it, and drafts the RFI list — each item with an owner, nothing sent.`,
    trust: 'B',
    draft: true,
    slides: [
      {
        heading: 'what ARC heard',
        body: `Site walkover, ${toaSiteVisit.date}. ${toaSiteVisit.weather}. Recorded by the ${toaSiteVisit.recordedBy}.`,
        bullets: toaSiteVisit.progress,
      },
      {
        heading: 'the RFI list, drafted',
        bullets: toaSiteVisit.defects.map(
          (d, i) => `RFI-0${i + 1} · ${d.item} → ${d.action} (${d.owner})`,
        ),
        note: 'Draft-only — sits in your queue. Nothing is sent to a consultant without your yes.',
      },
    ],
    citation: 'From the 16A site memo, 2 Jul. Draft-only — ARC drafts, never dispatches.',
  },
];

export const POI_LIST = POIS.map((p) => ({
  id: p.id,
  label: p.label,
  position: POI_ANCHORS[p.id],
}));

export function getPoi(id: PoiId): Poi {
  const p = POIS.find((x) => x.id === id);
  if (!p) throw new Error(`unknown POI ${id}`);
  return p;
}
