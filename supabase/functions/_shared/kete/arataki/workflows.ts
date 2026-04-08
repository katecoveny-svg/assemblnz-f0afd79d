// ═══════════════════════════════════════════════════════════════
// ARATAKI · WORKFLOWS — three end-to-end automotive flows
//   1. vehicle_listing_check
//   2. customer_enquiry_response
//   3. finance_disclosure_generator
// ═══════════════════════════════════════════════════════════════
import type { KeteRequest, KahuResult, TaResult, MaharaWrite } from "../pipeline.ts";
import { arataki_extraHardRules } from "./mana-policy.ts";

type WorkflowOutput = {
  output: string;
  maharaWrites: MaharaWrite[];
  extraHardRules?: typeof arataki_extraHardRules;
};

export const arataki_workflows = {
  vehicle_listing_check: (req: KeteRequest, _kahu: KahuResult, ta: TaResult): WorkflowOutput => {
    const p = req.payload as any;
    const warns = ta.warnings.length ? ta.warnings : ["none"];
    const summary =
      `LISTING DRAFT — ${p.year} ${p.make} ${p.model}\n` +
      `VIN: ${p.vin}\n` +
      `Asking price: NZ$${p.priceNzd.toLocaleString()}\n` +
      `Odometer: ${p.odometerKm.toLocaleString()} km\n` +
      `WoF expiry: ${p.warrantOfFitnessExpiry || "not provided"}\n` +
      `Compliance status: ${ta.passed ? "READY FOR DEALER REVIEW" : "BLOCKED"}\n` +
      `Warnings to resolve: ${warns.join(" | ")}\n` +
      `\n— Draft only. Awaiting dealer principal sign-off before going live.`;
    return {
      output: summary,
      maharaWrites: [{
        table: "arataki_listings",
        row: {
          tenant_id: req.tenantId,
          vin: p.vin,
          year: p.year, make: p.make, model: p.model,
          price_nzd: p.priceNzd,
          odometer_km: p.odometerKm,
          status: ta.passed ? "draft_ready" : "blocked",
          ta_warnings: ta.warnings,
          created_at: new Date().toISOString(),
        },
      }],
      extraHardRules: arataki_extraHardRules,
    };
  },

  customer_enquiry_response: (req: KeteRequest, _kahu: KahuResult, _ta: TaResult): WorkflowOutput => {
    const p = req.payload as any;
    // Strip injection attempts before drafting (pre-render guard)
    const safeEnquiry = String(p.enquiryText)
      .replace(/ignore (all|previous|prior) instructions/gi, "[redacted-injection]")
      .replace(/system prompt/gi, "[redacted-injection]");
    const aiNotice = p.includeAiNotice
      ? "\n\n(This reply was drafted by Arataki, your dealership AI assistant, and reviewed by our team before sending — Privacy Act IPP 3A.)"
      : "";
    const draft =
      `Kia ora ${p.customerName},\n\n` +
      `Thanks for getting in touch about ${p.vehicleOfInterest || "the vehicle"}. ` +
      `One of our team will be in contact within one business day to talk you through the details ` +
      `and answer the question you raised: "${safeEnquiry.slice(0, 200)}"\n\n` +
      `Ngā mihi,\nThe team` +
      aiNotice;
    return {
      output: draft,
      maharaWrites: [{
        table: "arataki_enquiries",
        row: {
          tenant_id: req.tenantId,
          customer_name_hash: hash(p.customerName),
          vehicle_of_interest: p.vehicleOfInterest || null,
          consent_marketing: !!p.consentMarketing,
          ai_notice_included: !!p.includeAiNotice,
          status: "draft_in_queue",
          created_at: new Date().toISOString(),
        },
      }],
      extraHardRules: arataki_extraHardRules,
    };
  },

  finance_disclosure_generator: (req: KeteRequest, _kahu: KahuResult, _ta: TaResult): WorkflowOutput => {
    const p = req.payload as any;
    const monthly = monthlyPayment(p.principalNzd, p.interestRatePct, p.termMonths);
    const totalRepay = monthly * p.termMonths;
    const totalInterest = totalRepay - p.principalNzd;
    const draft =
      `INITIAL DISCLOSURE STATEMENT (CCCFA s.17 — DRAFT)\n` +
      `Lender: ${p.lenderName}\n` +
      `Principal: NZ$${p.principalNzd.toLocaleString()}\n` +
      `Annual interest rate: ${p.interestRatePct}% p.a. (fixed)\n` +
      `Term: ${p.termMonths} months\n` +
      `Estimated monthly repayment: NZ$${monthly.toFixed(2)}\n` +
      `Estimated total repayments: NZ$${totalRepay.toFixed(2)}\n` +
      `Estimated total interest: NZ$${totalInterest.toFixed(2)}\n` +
      `\nThis is an estimate only. The lender's own disclosure documents are the legal record. ` +
      `The customer must receive these from the lender before signing.\n` +
      `\n— Draft only. Arataki does not approve or transmit finance applications.`;
    return {
      output: draft,
      maharaWrites: [{
        table: "arataki_finance_disclosures",
        row: {
          tenant_id: req.tenantId,
          lender_name: p.lenderName,
          principal_nzd: p.principalNzd,
          interest_rate_pct: p.interestRatePct,
          term_months: p.termMonths,
          monthly_payment_nzd: Number(monthly.toFixed(2)),
          total_interest_nzd: Number(totalInterest.toFixed(2)),
          status: "draft_ready",
          created_at: new Date().toISOString(),
        },
      }],
      extraHardRules: arataki_extraHardRules,
    };
  },
};

function monthlyPayment(p: number, ratePct: number, months: number): number {
  const r = (ratePct / 100) / 12;
  if (r === 0) return p / months;
  return (p * r) / (1 - Math.pow(1 + r, -months));
}

function hash(s: string): string {
  // sim-only deterministic hash, not cryptographic
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return `h_${(h >>> 0).toString(16)}`;
}
