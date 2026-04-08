// ═══════════════════════════════════════════════════════════════
// PIKAU · WORKFLOWS
//   1. customs_entry_prep
//   2. freight_quote_compare
//   3. dangerous_goods_check
// ═══════════════════════════════════════════════════════════════
import type { KeteRequest, KahuResult, TaResult, MaharaWrite } from "../pipeline.ts";
import { pikau_extraHardRules } from "./mana-policy.ts";

type WorkflowOutput = {
  output: string;
  maharaWrites: MaharaWrite[];
  extraHardRules?: typeof pikau_extraHardRules;
};

export const pikau_workflows = {
  customs_entry_prep: (req: KeteRequest, _kahu: KahuResult, ta: TaResult): WorkflowOutput => {
    const p = req.payload as any;
    // Pre-render guard — strip prompt-injection attempts from free-text fields
    // before echoing them into the broker handoff packet.
    const safeDescription = String(p.descriptionOfGoods || "")
      .replace(/ignore (all |previous |prior )?instructions/gi, "[redacted-injection]")
      .replace(/submit\s+(directly\s+)?to\s+nzcs/gi, "[redacted-injection]")
      .replace(/file\s+(directly\s+)?with\s+nzcs/gi, "[redacted-injection]")
      .replace(/system prompt/gi, "[redacted-injection]");
    const dutyRate = guessDutyRate(p.hsCode);
    const dutyNzd = p.customsValueNzd * dutyRate;
    const gstNzd = (p.customsValueNzd + dutyNzd) * 0.15;
    const totalLanded = p.customsValueNzd + dutyNzd + gstNzd;
    const out =
      `BROKER HANDOFF PACKET — DRAFT (Pikau pre-check)\n` +
      `Importer IRD: ${p.importerIrd}\n` +
      `Broker: ${p.brokerCode}\n` +
      `Goods: ${safeDescription}\n` +
      `HS code: ${p.hsCode}\n` +
      `Country of origin: ${p.countryOfOrigin}\n` +
      `Customs value: NZ$${p.customsValueNzd.toLocaleString()}\n` +
      `Indicative duty (${(dutyRate*100).toFixed(1)}%): NZ$${dutyNzd.toFixed(2)}\n` +
      `Indicative GST (15%): NZ$${gstNzd.toFixed(2)}\n` +
      `Indicative landed cost: NZ$${totalLanded.toFixed(2)}\n` +
      `Warnings: ${ta.warnings.join(" | ") || "none"}\n` +
      `Notes: ${ta.notes.join(" | ") || "none"}\n` +
      `\n— Pre-check only. Pikau is not a licensed customs broker. Hand this packet to ${p.brokerCode} for lodgement with the New Zealand Customs Service.`;
    return {
      output: out,
      maharaWrites: [{
        table: "pikau_customs_entries",
        row: {
          tenant_id: req.tenantId,
          importer_ird_hash: hash(p.importerIrd),
          broker_code: p.brokerCode,
          hs_code: p.hsCode,
          country_of_origin: p.countryOfOrigin,
          customs_value_nzd: p.customsValueNzd,
          indicative_duty_nzd: Number(dutyNzd.toFixed(2)),
          indicative_gst_nzd: Number(gstNzd.toFixed(2)),
          status: "broker_handoff_ready",
          ta_warnings: ta.warnings,
          created_at: new Date().toISOString(),
        },
      }],
      extraHardRules: pikau_extraHardRules,
    };
  },

  freight_quote_compare: (req: KeteRequest, _kahu: KahuResult, ta: TaResult): WorkflowOutput => {
    const p = req.payload as any;
    // Score: lower price + faster transit + insurance bonus
    const scored = (p.quotes as any[]).map((q: any) => ({
      ...q,
      score:
        (10000 / Math.max(q.priceNzd, 1)) +
        (30 - Math.min(q.transitDays || 30, 30)) +
        (q.includesInsurance ? 5 : 0),
    })).sort((a: any, b: any) => b.score - a.score);
    const winner = scored[0];
    const out =
      `FREIGHT QUOTE COMPARISON — ${p.origin} → ${p.destination}\n` +
      `Weight: ${p.weightKg} kg · Incoterm: ${p.incoterm}\n` +
      scored.map((q: any, i: number) =>
        `  ${i+1}. ${q.carrier}  NZ$${q.priceNzd}  · ${q.transitDays}d · ` +
        `${q.includesInsurance ? "insured" : "no insurance"}  (score ${q.score.toFixed(1)})`
      ).join("\n") +
      `\n\nRecommended: ${winner.carrier}\n` +
      `Warnings: ${ta.warnings.join(" | ") || "none"}\n` +
      `\n— Recommendation only. Forwarder/importer makes the final call.`;
    return {
      output: out,
      maharaWrites: [{
        table: "pikau_freight_quotes",
        row: {
          tenant_id: req.tenantId,
          origin: p.origin, destination: p.destination,
          weight_kg: p.weightKg, incoterm: p.incoterm,
          quotes: p.quotes,
          recommended_carrier: winner.carrier,
          recommended_price_nzd: winner.priceNzd,
          status: "comparison_ready",
          created_at: new Date().toISOString(),
        },
      }],
      extraHardRules: pikau_extraHardRules,
    };
  },

  dangerous_goods_check: (req: KeteRequest, _kahu: KahuResult, ta: TaResult): WorkflowOutput => {
    const p = req.payload as any;
    const out =
      `DANGEROUS GOODS DECLARATION — DRAFT (IMDG check)\n` +
      `UN number: ${p.unNumber}\n` +
      `Proper shipping name: ${p.properShippingName}\n` +
      `IMDG class: ${p.imdgClass}\n` +
      `Packing group: ${p.packingGroup}\n` +
      `Net quantity: ${p.netQuantityKg} kg\n` +
      `Warnings: ${ta.warnings.join(" | ") || "none"}\n` +
      `\nDeclaration status: DRAFT — must be signed by a competent person before tendering to carrier. ` +
      `Pikau does not act as the dangerous-goods declarant.`;
    return {
      output: out,
      maharaWrites: [{
        table: "pikau_dg_declarations",
        row: {
          tenant_id: req.tenantId,
          un_number: p.unNumber,
          proper_shipping_name: p.properShippingName,
          imdg_class: p.imdgClass,
          packing_group: p.packingGroup,
          net_quantity_kg: p.netQuantityKg,
          status: "draft_awaiting_competent_person",
          created_at: new Date().toISOString(),
        },
      }],
      extraHardRules: pikau_extraHardRules,
    };
  },
};

function guessDutyRate(hs: string): number {
  // Stub — production reads from Working Tariff
  if (!hs) return 0;
  if (hs.startsWith("8703")) return 0;     // motor vehicles
  if (hs.startsWith("61")) return 0.10;    // apparel
  if (hs.startsWith("62")) return 0.10;
  return 0.05;
}

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return `h_${(h >>> 0).toString(16)}`;
}
