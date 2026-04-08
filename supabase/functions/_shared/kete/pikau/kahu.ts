// ═══════════════════════════════════════════════════════════════
// PIKAU · KAHU — input validation for freight + customs payloads
// ═══════════════════════════════════════════════════════════════
import type { KeteRequest } from "../pipeline.ts";

const HS_CODE_RE = /^\d{4}\.\d{2}(?:\.\d{2})?$/; // e.g. 8703.23 or 8703.23.10
const INCOTERM_2020 = ["EXW","FCA","CPT","CIP","DAP","DPU","DDP","FAS","FOB","CFR","CIF"];
const UN_NUMBER_RE = /^UN\d{4}$/;

export function pikau_validate(req: KeteRequest): string[] {
  const errs: string[] = [];
  const p = req.payload as Record<string, any>;

  switch (req.workflow) {
    case "customs_entry_prep":
      if (!p.hsCode || !HS_CODE_RE.test(p.hsCode)) errs.push("hs_code_invalid");
      if (!p.countryOfOrigin || typeof p.countryOfOrigin !== "string" || p.countryOfOrigin.length !== 2)
        errs.push("country_of_origin_iso2_required");
      if (typeof p.customsValueNzd !== "number" || p.customsValueNzd < 0)
        errs.push("customs_value_invalid");
      if (!p.importerIrd) errs.push("importer_ird_required");
      if (!p.brokerCode) errs.push("broker_code_required"); // Pikau never files direct
      if (!p.descriptionOfGoods) errs.push("goods_description_required");
      break;

    case "freight_quote_compare":
      if (!Array.isArray(p.quotes) || p.quotes.length < 2)
        errs.push("at_least_two_quotes_required");
      if (!p.origin || !p.destination) errs.push("origin_destination_required");
      if (!p.weightKg || typeof p.weightKg !== "number") errs.push("weight_invalid");
      if (!p.incoterm || !INCOTERM_2020.includes(p.incoterm))
        errs.push("incoterm_invalid_or_missing");
      break;

    case "dangerous_goods_check":
      if (!p.unNumber || !UN_NUMBER_RE.test(p.unNumber)) errs.push("un_number_invalid");
      if (!p.properShippingName) errs.push("proper_shipping_name_required");
      if (!p.imdgClass) errs.push("imdg_class_required");
      if (!p.packingGroup || !["I","II","III"].includes(p.packingGroup))
        errs.push("packing_group_invalid");
      if (typeof p.netQuantityKg !== "number" || p.netQuantityKg < 0)
        errs.push("net_quantity_invalid");
      break;

    default:
      errs.push(`unknown_workflow:${req.workflow}`);
  }
  return errs;
}
