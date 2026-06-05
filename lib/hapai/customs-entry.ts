/**
 * Free HAPAI customs-entry drafter — deterministic, safe structuring only.
 *
 * This module turns commercial-invoice fields into a broker-ready *draft* of a
 * customs entry. Hard rules baked in:
 *   - It NEVER invents an HS / tariff code. Every line reads
 *     "to be classified — your broker confirms".
 *   - It NEVER lodges to TSW. There is no submission path here.
 *   - GST / duty figures are clearly indicative and depend on classification,
 *     which only the broker confirms.
 *
 * The maths is plain CIF customs-value assembly so the output is reproducible
 * and auditable.
 */

export const CUSTOMS_ENTRY_ASSUMPTIONS_VERSION = "2026-06-05-v1";
export const NZ_GST_RATE = 0.15;
export const TARIFF_PLACEHOLDER = "to be classified — your broker confirms";

export type Incoterm =
  | "EXW"
  | "FOB"
  | "CFR"
  | "CIF"
  | "DAP"
  | "DDP"
  | "FCA"
  | "CPT"
  | "CIP"
  | "other";

export type CustomsLineInput = {
  description: string;
  quantity: number;
  unitValue: number;
  countryOfOrigin?: string;
};

export type CustomsEntryInput = {
  supplierName: string;
  supplierCountry: string;
  importerName: string;
  importerClientCode?: string;
  invoiceNumber: string;
  invoiceDate: string;
  currency: string;
  incoterm: Incoterm;
  freightNzd: number;
  insuranceNzd: number;
  lines: CustomsLineInput[];
};

export type CustomsLineDraft = {
  description: string;
  quantity: number;
  unitValue: number;
  lineValue: number;
  countryOfOrigin: string;
  tariffLine: string;
};

export type CustomsEntryDraft = {
  assumptionsVersion: string;
  header: {
    supplierName: string;
    supplierCountry: string;
    importerName: string;
    importerClientCode: string;
    invoiceNumber: string;
    invoiceDate: string;
    currency: string;
    incoterm: Incoterm;
  };
  lines: CustomsLineDraft[];
  goodsValue: number;
  freightNzd: number;
  insuranceNzd: number;
  /** CIF-style customs value: goods + freight + insurance. */
  customsValue: number;
  /** Indicative only — real GST depends on confirmed classification. */
  indicativeGst: number;
  /** Items the broker must confirm before lodging. */
  brokerChecklist: string[];
  notes: string[];
};

function clean(value: string | undefined, fallback: string): string {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function nonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function buildCustomsEntryDraft(input: CustomsEntryInput): CustomsEntryDraft {
  const lines: CustomsLineDraft[] = input.lines
    .filter((line) => clean(line.description, "").length > 0)
    .map((line) => {
      const quantity = nonNegative(line.quantity);
      const unitValue = nonNegative(line.unitValue);
      return {
        description: line.description.trim(),
        quantity,
        unitValue,
        lineValue: round2(quantity * unitValue),
        countryOfOrigin: clean(line.countryOfOrigin, clean(input.supplierCountry, "to be confirmed")),
        // SAFETY: we never guess an HS code. The broker classifies.
        tariffLine: TARIFF_PLACEHOLDER,
      };
    });

  const goodsValue = round2(lines.reduce((sum, line) => sum + line.lineValue, 0));
  const freightNzd = nonNegative(input.freightNzd);
  const insuranceNzd = nonNegative(input.insuranceNzd);
  const customsValue = round2(goodsValue + freightNzd + insuranceNzd);
  const indicativeGst = round2(customsValue * NZ_GST_RATE);

  const brokerChecklist = [
    "Confirm the HS / tariff classification for every line — nothing is classified here.",
    "Confirm country of origin and any preferential origin claim (e.g. CPTPP, NZ–China FTA).",
    "Confirm whether MPI biosecurity clearance or permits apply to these goods.",
    "Confirm the correct Customs value method for the stated Incoterm.",
    "Confirm duty rate and concessions once the classification is set.",
  ];

  const notes = [
    "Draft only — assembl does not lodge this to TSW. Your licensed broker reviews and files.",
    `Customs value shown is a CIF-style assembly (goods + freight + insurance) at ${input.currency || "the invoice currency"} values you entered.`,
    "GST shown is indicative at 15% of customs value; the confirmed figure depends on classification and any concessions.",
  ];

  return {
    assumptionsVersion: CUSTOMS_ENTRY_ASSUMPTIONS_VERSION,
    header: {
      supplierName: clean(input.supplierName, "to be confirmed"),
      supplierCountry: clean(input.supplierCountry, "to be confirmed"),
      importerName: clean(input.importerName, "to be confirmed"),
      importerClientCode: clean(input.importerClientCode, "to be confirmed"),
      invoiceNumber: clean(input.invoiceNumber, "to be confirmed"),
      invoiceDate: clean(input.invoiceDate, "to be confirmed"),
      currency: clean(input.currency, "NZD"),
      incoterm: input.incoterm,
    },
    lines,
    goodsValue,
    freightNzd,
    insuranceNzd,
    customsValue,
    indicativeGst,
    brokerChecklist,
    notes,
  };
}

export function formatMoney(value: number, currency = "NZD"): string {
  try {
    return new Intl.NumberFormat("en-NZ", {
      style: "currency",
      currency: currency.length === 3 ? currency.toUpperCase() : "NZD",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}
