import { z } from "zod";

const DOCUMENT_TYPES = [
  "commercial_invoice",
  "packing_list",
  "bill_of_lading",
  "air_waybill",
  "certificate_of_origin",
  "dangerous_goods_declaration",
  "mpi_certificate",
  "fumigation_certificate",
] as const;

const INCOTERMS = ["EXW", "FCA", "FOB", "CFR", "CIF", "CPT", "CIP", "DAP", "DPU", "DDP"] as const;

export const pikauEntryInputSchema = z.object({
  shipmentRef: z.string().trim().optional(),
  importerName: z.string().trim().min(1, "Importer name is required"),
  description: z.string().trim().min(1, "Goods description is required"),
  hsCode: z.string().trim().optional(),
  originCountry: z.string().trim().max(2).optional(),
  incoterm: z.enum(INCOTERMS).default("FOB"),
  customsValueNzd: z.number().min(0).default(0),
  freightNzd: z.number().min(0).default(0),
  insuranceNzd: z.number().min(0).default(0),
  packages: z.number().int().min(0).optional(),
  grossWeightKg: z.number().min(0).optional(),
  documentTypes: z.array(z.enum(DOCUMENT_TYPES)).default([]),
  hasImporterClientCode: z.boolean().default(true),
  claimPreference: z.boolean().default(false),
  hasFoodForSale: z.boolean().default(false),
  hasWoodPackaging: z.boolean().default(false),
  hasDangerousGoods: z.boolean().default(false),
  intendedUseCode: z.string().trim().max(2).optional(),
  notes: z.string().trim().optional(),
});

export type PikauEntryInput = z.infer<typeof pikauEntryInputSchema>;
export type PikauEntryDocumentType = PikauEntryInput["documentTypes"][number];

export interface PikauEntryIssue {
  code: string;
  title: string;
  detail: string;
}

export interface PikauEntryPlan {
  readinessScore: number;
  status: "ready_for_broker_review" | "missing_information" | "hold_for_compliance";
  customsValueBaseNzd: number;
  estimatedDutyNzd: number;
  estimatedGstNzd: number;
  estimatedTotalBorderChargesNzd: number;
  dutyRatePercent: number;
  requiredDocuments: PikauEntryDocumentType[];
  missingDocuments: PikauEntryDocumentType[];
  blockers: PikauEntryIssue[];
  warnings: PikauEntryIssue[];
  nextActions: string[];
  summary: string;
}

export const PIKAU_ENTRY_AUTOPILOT_SYSTEM_PROMPT = [
  "You are Assembl's Pikau entry-autopilot extractor for New Zealand customs brokers.",
  "Read the uploaded shipment documents and return only structured JSON matching the agreed schema.",
  "Prefer document-grounded facts over assumptions. If facts conflict, surface the conflict instead of resolving it silently.",
  "Optimise for broker review speed: complete fields when evidence exists, mark uncertainty clearly, and identify what would block an import entry or MPI clearance.",
  "Do not claim that an entry has been submitted. This workflow drafts and prepares for human approval only.",
].join(" ");

export function buildPikauEntryPlan(rawInput: PikauEntryInput): PikauEntryPlan {
  const input = pikauEntryInputSchema.parse(rawInput);
  const hsDigits = normaliseHsCode(input.hsCode);
  const dutyRatePercent = inferDutyRate(hsDigits, input.description);
  const customsValueBaseNzd = roundCurrency(input.customsValueNzd + input.freightNzd + input.insuranceNzd);
  const estimatedDutyNzd = roundCurrency((customsValueBaseNzd * dutyRatePercent) / 100);
  const estimatedGstNzd = roundCurrency((customsValueBaseNzd + estimatedDutyNzd) * 0.15);
  const estimatedTotalBorderChargesNzd = roundCurrency(estimatedDutyNzd + estimatedGstNzd);

  const requiredDocuments = getRequiredDocuments(input);
  const missingDocuments = requiredDocuments.filter((doc) => !input.documentTypes.includes(doc));

  const blockers: PikauEntryIssue[] = [];
  const warnings: PikauEntryIssue[] = [];

  if (!hsDigits) {
    blockers.push({
      code: "missing_hs_code",
      title: "HS code still needs broker confirmation",
      detail: "The shipment cannot be reviewed cleanly until a tariff classification is recorded.",
    });
  }

  if (input.customsValueNzd >= 1000 && !input.hasImporterClientCode) {
    blockers.push({
      code: "missing_client_code",
      title: "Importer client code missing",
      detail: "Commercial imports at or above NZ$1,000 need a valid importer or declarant path before lodgement.",
    });
  }

  if (input.hasFoodForSale && !input.intendedUseCode) {
    blockers.push({
      code: "missing_intended_use",
      title: "Intended use code missing",
      detail: "Food-related lines should carry the MPI intended-use declaration before the entry is finalised.",
    });
  }

  if (input.claimPreference && !input.documentTypes.includes("certificate_of_origin")) {
    blockers.push({
      code: "missing_origin_evidence",
      title: "Preference claim lacks origin evidence",
      detail: "A preferential duty claim should not be drafted without the supporting origin document or declaration.",
    });
  }

  if (input.hasDangerousGoods && !input.documentTypes.includes("dangerous_goods_declaration")) {
    blockers.push({
      code: "missing_dg_declaration",
      title: "Dangerous goods declaration missing",
      detail: "The goods are marked as dangerous, but no dangerous goods declaration is attached.",
    });
  }

  if (input.hasWoodPackaging && !input.documentTypes.includes("fumigation_certificate")) {
    warnings.push({
      code: "missing_ispm15_evidence",
      title: "Wood packaging evidence not attached",
      detail: "If timber packaging is present, attach ISPM 15 or fumigation evidence before broker review.",
    });
  }

  if (input.hasFoodForSale && !input.documentTypes.includes("mpi_certificate")) {
    warnings.push({
      code: "food_pathway",
      title: "MPI certificate may be required",
      detail: "Food and beverage lines often need MPI evidence or importer registration detail alongside Customs clearance.",
    });
  }

  if (["CIF", "CFR"].includes(input.incoterm) && input.freightNzd === 0) {
    warnings.push({
      code: "incoterm_breakdown",
      title: "Keep freight and insurance evidence",
      detail: "CIF and CFR shipments still need the underlying cost support retained for valuation review.",
    });
  }

  if (!input.documentTypes.includes("packing_list") && (input.packages || input.grossWeightKg)) {
    warnings.push({
      code: "packing_list_gap",
      title: "Packing list not attached",
      detail: "Package count or weight is present, but the packing list is missing from the bundle.",
    });
  }

  const status = blockers.length > 0
    ? "hold_for_compliance"
    : missingDocuments.length > 0
      ? "missing_information"
      : "ready_for_broker_review";

  const readinessScore = Math.max(
    0,
    Math.min(
      100,
      100 - blockers.length * 24 - missingDocuments.length * 8 - warnings.length * 4,
    ),
  );

  const nextActions = buildNextActions({ input, missingDocuments, blockers, warnings, hsDigits });
  const summary = buildSummary({ input, status, readinessScore, blockers, missingDocuments });

  return {
    readinessScore,
    status,
    customsValueBaseNzd,
    estimatedDutyNzd,
    estimatedGstNzd,
    estimatedTotalBorderChargesNzd,
    dutyRatePercent,
    requiredDocuments,
    missingDocuments,
    blockers,
    warnings,
    nextActions,
    summary,
  };
}

function getRequiredDocuments(input: PikauEntryInput): PikauEntryDocumentType[] {
  const base: PikauEntryDocumentType[] = [
    "commercial_invoice",
    "packing_list",
    input.documentTypes.includes("air_waybill") ? "air_waybill" : "bill_of_lading",
  ];

  if (input.claimPreference) base.push("certificate_of_origin");
  if (input.hasDangerousGoods) base.push("dangerous_goods_declaration");
  if (input.hasFoodForSale) base.push("mpi_certificate");
  if (input.hasWoodPackaging) base.push("fumigation_certificate");

  return dedupe(base);
}

function buildNextActions(args: {
  input: PikauEntryInput;
  missingDocuments: PikauEntryDocumentType[];
  blockers: PikauEntryIssue[];
  warnings: PikauEntryIssue[];
  hsDigits: string;
}): string[] {
  const { input, missingDocuments, blockers, warnings, hsDigits } = args;
  const actions: string[] = [];

  if (!hsDigits) actions.push("Confirm the HS classification against the Working Tariff before drafting the import line.");
  if (blockers.some((issue) => issue.code === "missing_client_code")) actions.push("Collect or confirm the importer client code before any NZ$1,000+ lodgement.");
  if (blockers.some((issue) => issue.code === "missing_intended_use")) actions.push("Add the intended-use code for the food line so the MPI pathway is explicit.");
  if (missingDocuments.length > 0) actions.push(`Chase the missing documents: ${missingDocuments.join(", ")}.`);
  if (input.claimPreference) actions.push("Only claim preference if the origin evidence is attached and the product-specific rule is met.");
  if (warnings.some((issue) => issue.code === "incoterm_breakdown")) actions.push("Keep the freight and insurance breakdown in the evidence pack for valuation review.");

  actions.push("Send the drafted bundle to a licensed broker for review and submission approval.");

  return dedupe(actions);
}

function buildSummary(args: {
  input: PikauEntryInput;
  status: PikauEntryPlan["status"];
  readinessScore: number;
  blockers: PikauEntryIssue[];
  missingDocuments: PikauEntryDocumentType[];
}): string {
  const { input, status, readinessScore, blockers, missingDocuments } = args;
  if (status === "ready_for_broker_review") {
    return `${input.importerName}'s shipment is ${readinessScore}% ready for broker review with no hard compliance blockers detected.`;
  }
  if (status === "hold_for_compliance") {
    return `${input.importerName}'s shipment should stay on hold until ${blockers.length} blocker${blockers.length === 1 ? "" : "s"} are resolved.`;
  }
  return `${input.importerName}'s shipment is partly prepared, but ${missingDocuments.length} required document${missingDocuments.length === 1 ? "" : "s"} are still missing.`;
}

function inferDutyRate(hsDigits: string, description: string): number {
  const chapter = Number.parseInt(hsDigits.slice(0, 2), 10);
  const desc = description.toLowerCase();

  if (!Number.isFinite(chapter)) return 5;
  if (chapter >= 84 && chapter <= 85) return 0;
  if (chapter >= 1 && chapter <= 5) return 0;
  if (chapter >= 61 && chapter <= 63) return 10;
  if (chapter >= 22 && chapter <= 24) return 5;
  if (desc.includes("wine") || desc.includes("spirit")) return 5;
  return 5;
}

function normaliseHsCode(value?: string): string {
  return (value ?? "").replace(/\D/g, "");
}

function dedupe<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}
