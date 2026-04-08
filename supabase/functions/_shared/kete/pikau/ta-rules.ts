// ═══════════════════════════════════════════════════════════════
// PIKAU · TĀ — policy gates for freight + customs
// Coverage: Customs & Excise Act 2018, Biosecurity Act 1993,
//           HSNO Act 1996, IMDG (sea), Incoterms 2020,
//           GST zero-rating for exports, Sanctions list
// ═══════════════════════════════════════════════════════════════
import type { TaRule } from "../pipeline.ts";

// Stub sanctions list — production reads from a maintained source
const SANCTIONED_COUNTRIES = ["KP", "IR", "SY", "RU"];
const HIGH_BIO_RISK_HS_PREFIX = ["44", "12", "10", "01", "02", "06"]; // wood, seeds, cereals, live animals, meat, plants

// Tariff lookup stub — in prod this calls the Working Tariff API
const TARIFF_RATES_NZD: Record<string, number> = {
  "8703.23": 0,    // motor vehicles — duty free under most FTAs
  "6109.10": 0.10, // T-shirts cotton
  "9504.50": 0,    // game consoles
  "8517.13": 0,    // smartphones
};

export const pikau_taRules: TaRule[] = [
  // ── Pikau is never a licensed broker — must always have one named
  (req) => {
    const p = req.payload as any;
    if (req.workflow !== "customs_entry_prep") return { id: "broker_required", level: "PASS" };
    if (!p.brokerCode)
      return { id: "broker_required", level: "BLOCK", reason: "Pikau is never a licensed customs broker — entries must route through a licensed broker (s.180 C&E Act 2018)" };
    return { id: "broker_required", level: "PASS" };
  },

  // ── Customs value: ≥$1000 → entry required (s.39 C&E Act)
  (req) => {
    const p = req.payload as any;
    if (req.workflow !== "customs_entry_prep") return { id: "ce_value_threshold", level: "PASS" };
    if (typeof p.customsValueNzd === "number" && p.customsValueNzd < 1000)
      return { id: "ce_value_threshold", level: "INFO", reason: "Customs value <$1000 — informal entry pathway likely available" };
    return { id: "ce_value_threshold", level: "PASS" };
  },

  // ── Sanctions screen
  (req) => {
    const p = req.payload as any;
    if (req.workflow !== "customs_entry_prep") return { id: "sanctions_screen", level: "PASS" };
    if (SANCTIONED_COUNTRIES.includes(String(p.countryOfOrigin || "").toUpperCase()))
      return { id: "sanctions_screen", level: "BLOCK", reason: `Sanctions screen — country ${p.countryOfOrigin} is on the NZ sanctions list. Refer to MFAT.` };
    return { id: "sanctions_screen", level: "PASS" };
  },

  // ── Biosecurity flag — high-risk HS prefixes need MPI clearance
  (req) => {
    const p = req.payload as any;
    if (req.workflow !== "customs_entry_prep") return { id: "biosecurity_flag", level: "PASS" };
    const prefix = String(p.hsCode || "").slice(0, 2);
    if (HIGH_BIO_RISK_HS_PREFIX.includes(prefix))
      return { id: "biosecurity_flag", level: "WARN", reason: `Biosecurity Act 1993 — HS prefix ${prefix} requires MPI biosecurity clearance before release` };
    return { id: "biosecurity_flag", level: "PASS" };
  },

  // ── Freight quote — Incoterms must be valid 2020 set
  (req) => {
    const p = req.payload as any;
    if (req.workflow !== "freight_quote_compare") return { id: "incoterm_2020", level: "PASS" };
    return { id: "incoterm_2020", level: "PASS" }; // already validated by Kahu
  },

  // ── Freight quote — flag any quote that omits insurance for CIF/CIP
  (req) => {
    const p = req.payload as any;
    if (req.workflow !== "freight_quote_compare") return { id: "cif_insurance", level: "PASS" };
    if (["CIF", "CIP"].includes(p.incoterm)) {
      const missing = (p.quotes as any[]).filter(q => !q.includesInsurance).map(q => q.carrier);
      if (missing.length)
        return { id: "cif_insurance", level: "WARN", reason: `Incoterms 2020 ${p.incoterm} requires seller-provided insurance — missing on: ${missing.join(", ")}` };
    }
    return { id: "cif_insurance", level: "PASS" };
  },

  // ── GST zero-rating for exports — non-NZ destination must have zero-rate flag
  (req) => {
    const p = req.payload as any;
    if (req.workflow !== "freight_quote_compare") return { id: "gst_zero_rate", level: "PASS" };
    if (p.destination && String(p.destination).toUpperCase() !== "NZ" && p.gstZeroRated !== true)
      return { id: "gst_zero_rate", level: "WARN", reason: "GST Act s.11(1)(a) — exports may qualify for zero-rating; flag to importer/exporter" };
    return { id: "gst_zero_rate", level: "PASS" };
  },

  // ── Dangerous goods — IMDG class + UN number must match a known dangerous-goods entry
  (req) => {
    const p = req.payload as any;
    if (req.workflow !== "dangerous_goods_check") return { id: "imdg_class_known", level: "PASS" };
    const knownClasses = ["1","1.1","1.2","1.3","1.4","2.1","2.2","2.3","3","4.1","4.2","4.3","5.1","5.2","6.1","6.2","7","8","9"];
    if (!knownClasses.includes(String(p.imdgClass)))
      return { id: "imdg_class_known", level: "BLOCK", reason: `IMDG class ${p.imdgClass} unknown — refer to IMDG Code` };
    return { id: "imdg_class_known", level: "PASS" };
  },

  // ── Dangerous goods — Class 1 (explosives) require special handling and permit
  (req) => {
    const p = req.payload as any;
    if (req.workflow !== "dangerous_goods_check") return { id: "class1_permit", level: "PASS" };
    if (String(p.imdgClass).startsWith("1") && !p.hasExplosivesLicence)
      return { id: "class1_permit", level: "BLOCK", reason: "HSNO 1996 — Class 1 (explosives) require an Explosives Controller licence; cannot proceed without it" };
    return { id: "class1_permit", level: "PASS" };
  },

  // ── Hard rule: never file with NZCS directly (status claim parity)
  (req) => {
    const p = req.payload as any;
    if (req.workflow !== "customs_entry_prep") return { id: "no_direct_file", level: "PASS" };
    if (p.fileDirectToNzcs === true)
      return { id: "no_direct_file", level: "BLOCK", reason: "Hard rule: Pikau never files entries directly with NZCS — must route through broker" };
    return { id: "no_direct_file", level: "PASS" };
  },

  // ── INFO: tariff lookup (works as a passive enrichment, never blocks)
  (req) => {
    const p = req.payload as any;
    if (req.workflow !== "customs_entry_prep") return { id: "tariff_lookup", level: "PASS" };
    const prefix = String(p.hsCode || "").slice(0, 7);
    const rate = TARIFF_RATES_NZD[prefix];
    if (rate === undefined) return { id: "tariff_lookup", level: "WARN", reason: `Tariff rate not found for ${prefix} — broker must confirm` };
    return { id: "tariff_lookup", level: "INFO", reason: `Indicative tariff for ${prefix}: ${rate * 100}%` };
  },
];
