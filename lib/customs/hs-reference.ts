/**
 * HS reference data — real headings from the New Zealand Working Tariff
 * Document (Harmonised System, effective 2025). Used to classify the pilot's
 * demo goods against genuine tariff lines rather than invented codes.
 *
 * Duty rates are the General (Normal) ad-valorem rate. "Free" is 0. Where an
 * item also attracts excise-equivalent duty (e.g. wine), that is flagged in
 * `exciseNote` — it is collected by Customs but is separate from tariff duty
 * and always confirmed by the licensed broker.
 *
 * This is a curated reference for the pilot, NOT the full ~7,000-line Tariff.
 * Anything not matched here is returned as an explicit broker-review
 * suggestion by the classifier, never as a confirmed code.
 *
 * Source: NZ Customs Service — Working Tariff Document of New Zealand.
 *   https://www.customs.govt.nz/business/tariffs/working-tariff-document
 */
import type { CustomsCitation } from './types';

export const WORKING_TARIFF_CITATION: CustomsCitation = {
  source: 'NZ Working Tariff Document (Harmonised System)',
  ref: 'Effective 28 Aug 2025',
  url: 'https://www.customs.govt.nz/business/tariffs/working-tariff-document',
  retrievedAt: '2026-07-01',
};

export interface HsReferenceEntry {
  hsCode: string;
  headingText: string;
  /** Chapter-level plain description, for the classify UI. */
  chapterText: string;
  dutyRatePercent: number;
  /** Keywords that map a goods description to this line. */
  keywords: string[];
  /** Which GRI drives a match here (usually GRI 1, then GRI 6 at subheading). */
  griApplied: string[];
  griReasoning: string;
  /** Biosecurity / MPI flag if the chapter commonly triggers clearance. */
  biosecurity?: string;
  exciseNote?: string;
}

/**
 * Curated real lines covering the pilot's demo import categories:
 * LED lighting, wine, and dairy/milking machinery — three common NZ imports.
 */
export const HS_REFERENCE: HsReferenceEntry[] = [
  {
    hsCode: '9405.11.00',
    headingText:
      'Luminaires and lighting fittings — chandeliers and other electric ceiling or wall lighting fittings, designed for use solely with light-emitting diode (LED) light sources',
    chapterText: 'Chapter 94 — Lamps and lighting fittings',
    dutyRatePercent: 0,
    keywords: ['led', 'luminaire', 'light fitting', 'lighting', 'downlight', 'ceiling light', 'wall light', 'panel light'],
    griApplied: ['GRI 1', 'GRI 6'],
    griReasoning:
      'GRI 1: a complete lighting fitting is classified by the terms of heading 94.05, not by its components. GRI 6: at subheading level, "designed for use solely with LED light sources" selects 9405.11 over 9405.19.',
  },
  {
    hsCode: '8539.52.00',
    headingText:
      'Electric filament or discharge lamps — light-emitting diode (LED) lamps',
    chapterText: 'Chapter 85 — Electrical machinery and equipment',
    dutyRatePercent: 0,
    keywords: ['led lamp', 'led bulb', 'led globe', 'retrofit lamp', 'led tube'],
    griApplied: ['GRI 1', 'GRI 6'],
    griReasoning:
      'GRI 1: LED lamps (the light source itself, not a complete fitting) fall in heading 85.39. GRI 6: subheading 8539.52 names LED lamps specifically. Distinguish from 94.05 fittings by GRI 3(a) — the more specific description governs whether the good is a lamp or a fitting.',
  },
  {
    hsCode: '2204.21.00',
    headingText:
      'Wine of fresh grapes, including fortified wines — other wine; grape must with fermentation prevented by alcohol, in containers holding 2 litres or less',
    chapterText: 'Chapter 22 — Beverages, spirits and vinegar',
    dutyRatePercent: 0,
    keywords: ['wine', 'red wine', 'white wine', 'rosé', 'shiraz', 'pinot', 'sauvignon', 'chardonnay', 'grape'],
    griApplied: ['GRI 1', 'GRI 6'],
    griReasoning:
      'GRI 1: wine of fresh grapes is classified in heading 22.04. GRI 6: subheading 2204.21 is selected by container size — 2 litres or less (bottled). Bulk wine over 2L would move to 2204.22/2204.29.',
    biosecurity:
      'Alcohol is subject to importer registration and labelling; MPI requirements may apply to packaging/pallets.',
    exciseNote:
      'Wine attracts excise-equivalent duty on alcohol collected by Customs (Excise and Excise-equivalent Duties Table). Tariff duty is Free; the alcohol charge is separate and confirmed by the broker.',
  },
  {
    hsCode: '8434.20.00',
    headingText:
      'Milking machines and dairy machinery — dairy machinery',
    chapterText: 'Chapter 84 — Machinery and mechanical appliances',
    dutyRatePercent: 0,
    keywords: ['dairy', 'milking', 'milk', 'pasteuriser', 'homogeniser', 'cream separator', 'vat', 'dairy plant'],
    griApplied: ['GRI 1', 'GRI 6'],
    griReasoning:
      'GRI 1: dairy machinery is named in heading 84.34. GRI 6: subheading 8434.20 covers dairy machinery generally; 8434.10 is reserved for milking machines specifically. Select by the machine\'s principal function.',
  },
  {
    hsCode: '8434.10.00',
    headingText: 'Milking machines and dairy machinery — milking machines',
    chapterText: 'Chapter 84 — Machinery and mechanical appliances',
    dutyRatePercent: 0,
    keywords: ['milking machine', 'milking cluster', 'milking plant', 'rotary platform', 'herringbone'],
    griApplied: ['GRI 1', 'GRI 6'],
    griReasoning:
      'GRI 1: milking machines are named in heading 84.34. GRI 6: subheading 8434.10 names milking machines specifically, taking precedence over the general 8434.20 dairy-machinery line.',
  },
];

/**
 * Chapter-level duty heuristic, ported from pikauEntryPlanner.inferDutyRate.
 * Used ONLY as a fallback indicative rate when a description doesn't match a
 * curated reference line — and always surfaced as a suggestion, never a
 * confirmed rate.
 */
export function inferDutyRateByChapter(hsCode: string, description = ''): number {
  const digits = hsCode.replace(/\D/g, '');
  const chapter = Number.parseInt(digits.slice(0, 2), 10);
  const desc = description.toLowerCase();
  if (!Number.isFinite(chapter)) return 5;
  if (chapter >= 84 && chapter <= 85) return 0; // machinery, electrical
  if (chapter >= 1 && chapter <= 5) return 0; // animals, plants, food
  if (chapter >= 61 && chapter <= 63) return 10; // apparel
  if (chapter >= 22 && chapter <= 24) return 5; // beverages, spirits, tobacco
  if (desc.includes('wine') || desc.includes('spirit')) return 5;
  return 5; // conservative default
}

/** Find reference lines whose keywords appear in a goods description. */
export function matchReference(description: string): HsReferenceEntry[] {
  const desc = description.toLowerCase();
  const scored = HS_REFERENCE.map((entry) => {
    let score = 0;
    for (const kw of entry.keywords) {
      if (desc.includes(kw)) score += kw.length >= 6 ? 3 : 1;
    }
    return { entry, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.map((s) => s.entry);
}
