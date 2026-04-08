// ═══════════════════════════════════════════════════════════════
// ARATAKI · KAHU — input validation + automotive-specific PII rules
// ═══════════════════════════════════════════════════════════════
import type { KeteRequest } from "../pipeline.ts";

const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/;
const NZ_PLATE_RE = /^[A-Z0-9]{2,7}$/;

export function arataki_validate(req: KeteRequest): string[] {
  const errs: string[] = [];
  const p = req.payload as Record<string, any>;

  switch (req.workflow) {
    case "vehicle_listing_check":
      if (!p.vin || typeof p.vin !== "string" || !VIN_RE.test(p.vin))
        errs.push("vin_invalid");
      if (typeof p.priceNzd !== "number" || p.priceNzd <= 0)
        errs.push("price_invalid");
      if (typeof p.odometerKm !== "number" || p.odometerKm < 0)
        errs.push("odometer_invalid");
      if (!p.year || typeof p.year !== "number" || p.year < 1980 || p.year > 2030)
        errs.push("year_invalid");
      if (!p.make || !p.model) errs.push("make_model_required");
      if (p.warrantOfFitnessExpiry && isNaN(Date.parse(p.warrantOfFitnessExpiry)))
        errs.push("wof_date_invalid");
      break;

    case "customer_enquiry_response":
      if (!p.customerName || typeof p.customerName !== "string")
        errs.push("customer_name_required");
      if (!p.enquiryText || typeof p.enquiryText !== "string" || p.enquiryText.length < 5)
        errs.push("enquiry_text_required");
      if (p.consentMarketing !== true && p.consentMarketing !== false)
        errs.push("consent_marketing_must_be_explicit");
      break;

    case "finance_disclosure_generator":
      if (typeof p.principalNzd !== "number" || p.principalNzd <= 0)
        errs.push("principal_invalid");
      if (typeof p.interestRatePct !== "number" || p.interestRatePct < 0 || p.interestRatePct > 100)
        errs.push("interest_rate_invalid");
      if (typeof p.termMonths !== "number" || p.termMonths <= 0 || p.termMonths > 120)
        errs.push("term_invalid");
      if (!p.lenderName) errs.push("lender_required");
      break;

    default:
      errs.push(`unknown_workflow:${req.workflow}`);
  }
  return errs;
}
