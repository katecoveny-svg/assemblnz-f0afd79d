/**
 * Entry readiness engine — the heart of the Pīkau intelligence layer.
 *
 * Ported and generalised from legacy-vite/src/lib/pikau/pikauEntryPlanner.ts
 * (single-line) to the multi-line import entries this workspace manages. Given
 * a drafted entry it computes: the CIF customs value, indicative duty + import
 * GST, the required-vs-held document checklist, compliance blockers and
 * warnings (each with a real statute citation), a readiness score, and the
 * next actions a broker takes before lodgement.
 *
 * Draft-only. It never lodges and never fabricates a classification — an
 * unclassified line is a blocker, not a guess.
 *
 * Statute citations distilled from
 * supabase/functions/_shared/kete/pikau/ta-rules.ts.
 */
import type {
  CustomsCitation,
  CustomsDocumentType,
  DutyCalc,
  EntryInput,
  EntryIssue,
  EntryPlan,
  EntryStatus,
} from './types';
import { DE_MINIMIS_NZD, NZ_GST_RATE } from './types';
import { round2, nonNegative } from './format';

// Indicative transaction charges applied by Customs at the border.
// Import Entry Transaction Fee + biosecurity system entry levy (indicative,
// broker confirms the current gazetted amounts).
const IETF_NZD = 33.03; // Import Entry Transaction Fee (GST incl., indicative)
const BIOSECURITY_LEVY_NZD = 30.66; // MPI Import levy (indicative)

const CITE_CE_VALUE: CustomsCitation = {
  source: 'Customs and Excise Act 2018',
  ref: 's.98 (Importer entry) / Schedule value threshold',
  note: 'Commercial imports need a valid declarant/importer path at or above the entry threshold.',
  url: 'https://www.legislation.govt.nz/act/public/2018/0004/latest/whole.html',
  retrievedAt: '2026-07-01',
};
const CITE_BROKER: CustomsCitation = {
  source: 'Customs and Excise Act 2018',
  ref: 's.180 (Customs brokers)',
  note: 'Entries are lodged through a licensed customs broker — this workspace only drafts.',
  url: 'https://www.legislation.govt.nz/act/public/2018/0004/latest/whole.html',
  retrievedAt: '2026-07-01',
};
const CITE_BIOSECURITY: CustomsCitation = {
  source: 'Biosecurity Act 1993',
  ref: 'Import Health Standards',
  note: 'Wood packaging, food and plant/animal goods may need MPI clearance before release.',
  url: 'https://www.mpi.govt.nz/import/',
  retrievedAt: '2026-07-01',
};
const CITE_ORIGIN: CustomsCitation = {
  source: 'NZ FTA Rules of Origin',
  ref: 'Certificate / declaration of origin',
  note: 'A preference claim needs origin evidence on file.',
  url: 'https://www.customs.govt.nz/business/international/free-trade-agreements/',
  retrievedAt: '2026-07-01',
};
const CITE_DG: CustomsCitation = {
  source: 'HSNO Act 1996 / IMDG Code',
  ref: 'Dangerous goods declaration',
  note: 'Dangerous goods require a signed declaration and correct classification.',
  retrievedAt: '2026-07-01',
};

export function computeDuty(input: EntryInput): DutyCalc {
  const goodsValueNzd = round2(
    input.lines.reduce((sum, l) => sum + nonNegative(l.lineValueNzd), 0),
  );
  const freightNzd = nonNegative(input.freightNzd);
  const insuranceNzd = nonNegative(input.insuranceNzd);
  const customsValueNzd = round2(goodsValueNzd + freightNzd + insuranceNzd);

  // Base calc holds duty at 0 — the effective rate is supplied by the planner
  // from confirmed classifications (computeDutyAtRate). Unclassified lines
  // never contribute a guessed rate, so nothing is over-stated before a broker
  // classifies the goods.
  const dutyRatePercent = 0;
  const estimatedDutyNzd = round2((customsValueNzd * dutyRatePercent) / 100);
  const belowDeMinimis = customsValueNzd <= DE_MINIMIS_NZD;
  const estimatedGstNzd = belowDeMinimis
    ? 0
    : round2((customsValueNzd + estimatedDutyNzd) * NZ_GST_RATE);
  const transactionFeesNzd = belowDeMinimis
    ? 0
    : round2(IETF_NZD + BIOSECURITY_LEVY_NZD);
  const estimatedBorderChargesNzd = round2(
    estimatedDutyNzd + estimatedGstNzd + transactionFeesNzd,
  );
  const estimatedLandedCostNzd = round2(
    customsValueNzd + estimatedBorderChargesNzd,
  );

  return {
    goodsValueNzd,
    freightNzd,
    insuranceNzd,
    customsValueNzd,
    dutyRatePercent,
    estimatedDutyNzd,
    estimatedGstNzd,
    transactionFeesNzd,
    estimatedBorderChargesNzd,
    estimatedLandedCostNzd,
    belowDeMinimis,
  };
}

/**
 * Compute duty with an explicit effective rate (from confirmed
 * classifications). Used by the planner once lines are classified.
 */
export function computeDutyAtRate(input: EntryInput, ratePercent: number): DutyCalc {
  const base = computeDuty(input);
  const dutyRatePercent = Math.max(0, ratePercent);
  const estimatedDutyNzd = base.belowDeMinimis
    ? 0
    : round2((base.customsValueNzd * dutyRatePercent) / 100);
  const estimatedGstNzd = base.belowDeMinimis
    ? 0
    : round2((base.customsValueNzd + estimatedDutyNzd) * NZ_GST_RATE);
  const estimatedBorderChargesNzd = round2(
    estimatedDutyNzd + estimatedGstNzd + base.transactionFeesNzd,
  );
  return {
    ...base,
    dutyRatePercent,
    estimatedDutyNzd,
    estimatedGstNzd,
    estimatedBorderChargesNzd,
    estimatedLandedCostNzd: round2(
      base.customsValueNzd + estimatedBorderChargesNzd,
    ),
  };
}

function requiredDocuments(input: EntryInput): CustomsDocumentType[] {
  const transport: CustomsDocumentType = input.documentsHeld.includes('air_waybill')
    ? 'air_waybill'
    : 'bill_of_lading';
  const base: CustomsDocumentType[] = ['commercial_invoice', 'packing_list', transport];
  if (input.flags.claimPreference) base.push('certificate_of_origin');
  if (input.flags.hasDangerousGoods) base.push('dangerous_goods_declaration');
  if (input.flags.hasFoodForSale) base.push('mpi_certificate');
  if (input.flags.hasWoodPackaging) base.push('fumigation_certificate');
  return Array.from(new Set(base));
}

/**
 * Build the full readiness plan. `effectiveRatePercent` is the duty rate
 * resolved from the entry's confirmed classifications (0 while unclassified).
 */
export function buildEntryPlan(
  input: EntryInput,
  effectiveRatePercent = 0,
): EntryPlan {
  const duty = computeDutyAtRate(input, effectiveRatePercent);
  const required = requiredDocuments(input);
  const missingDocuments = required.filter((d) => !input.documentsHeld.includes(d));

  const blockers: EntryIssue[] = [];
  const warnings: EntryIssue[] = [];

  const anyUnclassified = input.lines.some((l) => l.unclassified);
  if (anyUnclassified || input.lines.length === 0) {
    blockers.push({
      code: 'unclassified_line',
      title: 'HS classification still needed',
      detail:
        'One or more lines are unclassified. Classify every line (or record a broker-confirmed code) before the entry can be marked ready.',
      citation: CITE_BROKER,
    });
  }
  if (duty.customsValueNzd >= DE_MINIMIS_NZD && !input.flags.hasImporterClientCode) {
    blockers.push({
      code: 'missing_client_code',
      title: 'Importer client code missing',
      detail:
        'Commercial imports at or above NZ$1,000 need a valid importer/declarant code before lodgement.',
      citation: CITE_CE_VALUE,
    });
  }
  if (input.flags.hasFoodForSale && !input.flags.intendedUseCode) {
    blockers.push({
      code: 'missing_intended_use',
      title: 'Intended-use code missing',
      detail: 'Food-for-sale lines need the MPI intended-use declaration before finalising.',
      citation: CITE_BIOSECURITY,
    });
  }
  if (input.flags.claimPreference && !input.documentsHeld.includes('certificate_of_origin')) {
    blockers.push({
      code: 'missing_origin_evidence',
      title: 'Preference claim lacks origin evidence',
      detail: 'Do not draft a preferential duty claim without the supporting certificate/declaration of origin.',
      citation: CITE_ORIGIN,
    });
  }
  if (input.flags.hasDangerousGoods && !input.documentsHeld.includes('dangerous_goods_declaration')) {
    blockers.push({
      code: 'missing_dg_declaration',
      title: 'Dangerous goods declaration missing',
      detail: 'The goods are marked dangerous but no dangerous goods declaration is attached.',
      citation: CITE_DG,
    });
  }

  if (input.flags.hasWoodPackaging && !input.documentsHeld.includes('fumigation_certificate')) {
    warnings.push({
      code: 'missing_ispm15',
      title: 'Wood packaging evidence not attached',
      detail: 'Attach ISPM 15 / fumigation evidence for timber packaging before broker review.',
      citation: CITE_BIOSECURITY,
    });
  }
  if (input.flags.hasFoodForSale && !input.documentsHeld.includes('mpi_certificate')) {
    warnings.push({
      code: 'food_pathway',
      title: 'MPI certificate may be required',
      detail: 'Food and beverage lines often need MPI evidence or importer registration alongside Customs clearance.',
      citation: CITE_BIOSECURITY,
    });
  }
  if (['CIF', 'CFR'].includes(input.incoterm) && input.freightNzd === 0) {
    warnings.push({
      code: 'incoterm_breakdown',
      title: 'Keep freight & insurance evidence',
      detail: 'CIF/CFR shipments still need the underlying cost support retained for the valuation review.',
    });
  }
  if (!input.documentsHeld.includes('packing_list') && (input.packages || input.grossWeightKg)) {
    warnings.push({
      code: 'packing_list_gap',
      title: 'Packing list not attached',
      detail: 'Package count or weight is present but the packing list is missing from the bundle.',
    });
  }

  const status: EntryStatus =
    blockers.length > 0
      ? 'hold_for_compliance'
      : missingDocuments.length > 0
        ? 'missing_information'
        : 'ready_for_broker_review';

  const readinessScore = Math.max(
    0,
    Math.min(100, 100 - blockers.length * 24 - missingDocuments.length * 8 - warnings.length * 4),
  );

  const nextActions: string[] = [];
  if (anyUnclassified) nextActions.push('Classify remaining lines via the HS classifier, then confirm with the broker.');
  for (const doc of missingDocuments) nextActions.push(`Obtain and attach: ${doc.replace(/_/g, ' ')}.`);
  if (blockers.length === 0 && missingDocuments.length === 0) {
    nextActions.push('Hand the drafted entry to the licensed broker to lodge in TSW.');
  }

  const summary = buildSummary(status, readinessScore, blockers.length, missingDocuments.length, duty);

  return {
    readinessScore,
    status,
    duty,
    requiredDocuments: required,
    missingDocuments,
    blockers,
    warnings,
    nextActions,
    citations: [CITE_BROKER, CITE_CE_VALUE, CITE_BIOSECURITY],
    summary,
  };
}

function buildSummary(
  status: EntryStatus,
  score: number,
  blockerCount: number,
  missingCount: number,
  duty: DutyCalc,
): string {
  const value = `Customs value NZ$${duty.customsValueNzd.toLocaleString('en-NZ')}`;
  if (status === 'hold_for_compliance') {
    return `${value}. Held — ${blockerCount} compliance ${blockerCount === 1 ? 'item' : 'items'} to resolve before this entry can be drafted for the broker. Readiness ${score}/100.`;
  }
  if (status === 'missing_information') {
    return `${value}. ${missingCount} document${missingCount === 1 ? '' : 's'} outstanding. Readiness ${score}/100.`;
  }
  return `${value}. Ready for the broker to review and lodge. Estimated border charges NZ$${duty.estimatedBorderChargesNzd.toLocaleString('en-NZ')}. Readiness ${score}/100.`;
}
