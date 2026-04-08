// ═══════════════════════════════════════════════════════════════
// ARATAKI · TĀ — policy gates per workflow
// Coverage: CGA 1993, FTA 1986, MVSA 2003, Privacy Act 2020 + IPP 3A,
//           AML/CFT (>$10k), odometer fraud (Land Transport Act 1998)
// ═══════════════════════════════════════════════════════════════
import type { TaRule } from "../pipeline.ts";

export const arataki_taRules: TaRule[] = [
  // ── MVSA: dealer must be a registered Motor Vehicle Trader
  (req) => {
    const p = req.payload as any;
    if (req.workflow !== "vehicle_listing_check") return { id: "mvsa_dealer_reg", level: "PASS" };
    if (!p.mvtRegistrationNumber)
      return { id: "mvsa_dealer_reg", level: "BLOCK", reason: "MVSA 2003 s.9 — Motor Vehicle Trader registration required before listing" };
    return { id: "mvsa_dealer_reg", level: "PASS" };
  },

  // ── MVSA: Consumer Information Notice (CIN) details present
  (req) => {
    const p = req.payload as any;
    if (req.workflow !== "vehicle_listing_check") return { id: "mvsa_cin", level: "PASS" };
    if (!p.cinDetails || typeof p.cinDetails !== "object")
      return { id: "mvsa_cin", level: "WARN", reason: "MVSA s.14 — Consumer Information Notice (CIN) fields missing; cannot publish without CIN at point of sale" };
    return { id: "mvsa_cin", level: "PASS" };
  },

  // ── CGA: vehicle must be of "acceptable quality"; warn if WoF lapsed
  (req) => {
    const p = req.payload as any;
    if (req.workflow !== "vehicle_listing_check") return { id: "cga_wof", level: "PASS" };
    if (p.warrantOfFitnessExpiry) {
      const days = (Date.parse(p.warrantOfFitnessExpiry) - Date.now()) / 86400000;
      if (days < 0) return { id: "cga_wof", level: "BLOCK", reason: `CGA 1993 s.6 — WoF expired ${Math.abs(Math.round(days))} days ago, cannot represent as roadworthy` };
      if (days < 30) return { id: "cga_wof", level: "WARN", reason: `WoF expires in ${Math.round(days)} days — flag to dealer` };
    }
    return { id: "cga_wof", level: "PASS" };
  },

  // ── FTA: no misleading representation — odometer plausibility check
  (req) => {
    const p = req.payload as any;
    if (req.workflow !== "vehicle_listing_check") return { id: "fta_odometer", level: "PASS" };
    const ageYears = 2026 - (p.year || 2026);
    const expectedKm = ageYears * 14000; // NZ avg ~14k/yr
    if (typeof p.odometerKm === "number" && ageYears > 2 && p.odometerKm < expectedKm * 0.3)
      return { id: "fta_odometer", level: "BLOCK", reason: "FTA 1986 s.9 / Land Transport Act 1998 — implausibly low odometer relative to vehicle age (possible odometer fraud)" };
    return { id: "fta_odometer", level: "PASS" };
  },

  // ── AML/CFT: cash transactions >$10k must trigger suspicious-activity check
  (req) => {
    const p = req.payload as any;
    if (req.workflow !== "vehicle_listing_check") return { id: "aml_cft", level: "PASS" };
    if (p.priceNzd >= 10000 && p.proposedPaymentMethod === "cash")
      return { id: "aml_cft", level: "WARN", reason: "AML/CFT Act 2009 — cash sale ≥$10k requires customer due diligence; route to compliance officer" };
    return { id: "aml_cft", level: "PASS" };
  },

  // ── Privacy Act IPP 3A: customer must be told if AI used to generate response
  (req) => {
    const p = req.payload as any;
    if (req.workflow !== "customer_enquiry_response") return { id: "ipp_3a", level: "PASS" };
    if (p.includeAiNotice !== true)
      return { id: "ipp_3a", level: "WARN", reason: "Privacy Act IPP 3A (in force 1 May 2026) — automated-decision notice required when AI drafts customer-facing comms" };
    return { id: "ipp_3a", level: "PASS" };
  },

  // ── Privacy Act IPP 3: marketing comms require explicit consent
  (req) => {
    const p = req.payload as any;
    if (req.workflow !== "customer_enquiry_response") return { id: "ipp_3_consent", level: "PASS" };
    if (p.includeMarketing === true && p.consentMarketing !== true)
      return { id: "ipp_3_consent", level: "BLOCK", reason: "Privacy Act 2020 IPP 3 — marketing content requires explicit prior consent" };
    return { id: "ipp_3_consent", level: "PASS" };
  },

  // ── CCCFA: finance disclosure must include all key disclosures
  (req) => {
    const p = req.payload as any;
    if (req.workflow !== "finance_disclosure_generator") return { id: "cccfa_disclosure", level: "PASS" };
    const required = ["principalNzd", "interestRatePct", "termMonths", "lenderName"];
    const missing = required.filter(k => p[k] === undefined || p[k] === null);
    if (missing.length)
      return { id: "cccfa_disclosure", level: "BLOCK", reason: `CCCFA 2003 s.17 — initial disclosure missing fields: ${missing.join(", ")}` };
    return { id: "cccfa_disclosure", level: "PASS" };
  },

  // ── CCCFA: usurious interest gate (>30% APR is presumptively unreasonable)
  (req) => {
    const p = req.payload as any;
    if (req.workflow !== "finance_disclosure_generator") return { id: "cccfa_rate", level: "PASS" };
    if (typeof p.interestRatePct === "number" && p.interestRatePct > 30)
      return { id: "cccfa_rate", level: "BLOCK", reason: `CCCFA 2003 s.41 — interest rate ${p.interestRatePct}% APR exceeds reasonable-rate threshold; route to compliance` };
    return { id: "cccfa_rate", level: "PASS" };
  },

  // ── Hard rule: never auto-approve a customer's finance application
  (req) => {
    const p = req.payload as any;
    if (req.workflow !== "finance_disclosure_generator") return { id: "no_auto_approve", level: "PASS" };
    if (p.autoApprove === true)
      return { id: "no_auto_approve", level: "BLOCK", reason: "Hard rule: Arataki never approves a finance application autonomously" };
    return { id: "no_auto_approve", level: "PASS" };
  },
];
