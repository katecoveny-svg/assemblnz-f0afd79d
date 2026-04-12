import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const TOKEN_ESTIMATE_PER_MSG = 400;
const COMPRESS_THRESHOLD_MSGS = 20;
const COMPRESS_THRESHOLD_TOKENS = 80_000;
const KEEP_RECENT = 6;
const MIN_COMPRESSIBLE = 8;

// ─── Industry agent sets ───────────────────────────────
const WAIHANGA_AGENTS = new Set([
  "apex", "arai", "kaupapa", "ata", "rawa", "pai", "whakaae",
]);

const AUAHA_AGENTS = new Set([
  "prism", "echo", "spark", "flux", "muse", "toi", "kōrero", "whakaata", "ahua",
]);

const AHUWHENUA_AGENTS = new Set([
  "terra",
]);

const MANAAKI_AGENTS = new Set([
  "aura", "saffron", "cellar", "nova", "vitals", "haven",
]);

// ─── Industry-specific extraction schemas ──────────────
const WAIHANGA_EXTRACTION_PROMPT = `You are a conversation compressor for a NZ construction/trades AI platform.
Compress the conversation into structured JSON, extracting NZ construction-specific data.
Return ONLY valid JSON:
{
  "summary": "2-3 sentence overview of what was discussed",
  "facts": [{"key": "dot.notation.key", "value": "string value", "confidence": 0.9}],
  "decisions": ["decision 1"],
  "pending_actions": ["action 1"],
  "compliance_notes": ["any compliance-relevant items"],
  "construction": {
    "project": { "address": "", "consent_ref": "", "consent_authority": "" },
    "participants": [{ "lbp_name": "", "lbp_number": "", "lbp_class": "" }],
    "code_decisions": [{ "clause": "E2", "decision": "cavity system", "reason": "exposure zone HIGH" }],
    "inspection_stage": "pre-line | framing | post-line | pre-clad | final",
    "upcoming_inspections": [{ "type": "", "date": "", "items_to_prep": "" }],
    "retentions": { "amount": "", "held_by": "", "release_date": "", "trust_compliant": true }
  }
}
Extract NZ-specific construction data:
- Building consent references (e.g., BCA-2025-XXXX)
- LBP licence numbers and classes (BP, DC, SC, etc.)
- Building Code clauses (B1, B2, E1, E2, E3, F7, H1, etc.)
- Inspection stages and results
- CCA 2002 retention details — trust compliance since 2023 amendment
- Exposure zones (LOW, MEDIUM, HIGH, VERY HIGH per E2/AS1)
- Producer statements (PS1, PS2, PS3, PS4)
Omit any "construction" sub-object fields that are empty/unknown.`;

const AUAHA_EXTRACTION_PROMPT = `You are a conversation compressor for a NZ creative & marketing AI platform.
Compress the conversation into structured JSON, extracting brand and content performance data.
Return ONLY valid JSON:
{
  "summary": "2-3 sentence overview of what was discussed",
  "facts": [{"key": "dot.notation.key", "value": "string value", "confidence": 0.9}],
  "decisions": ["decision 1"],
  "pending_actions": ["action 1"],
  "compliance_notes": ["any compliance-relevant items"],
  "creative": {
    "brand_dna": {
      "primary_colour": "",
      "voice_formality": 0,
      "tone_notes": "",
      "forbidden_words": [],
      "approved_phrases": []
    },
    "content_performance": [
      { "platform": "", "format": "", "engagement_rate": 0, "what_worked": "", "what_failed": "" }
    ],
    "audience_insights": {
      "top_locations": [],
      "best_posting_day": "",
      "best_posting_time": "",
      "demographic_skew": ""
    },
    "style_preferences": {
      "preferred_formats": [],
      "rejected_styles": [],
      "edit_patterns": []
    },
    "competitor_notes": [],
    "seasonal_calendar": []
  }
}
Extract NZ creative/marketing-specific data:
- Brand voice preferences (formality level, humour style, words to avoid/prefer)
- Content performance data (engagement rates, what worked/bombed, platform breakdowns)
- Audience demographics and behaviour (NZ location skews, posting times)
- User edit patterns — when they change "innovative" to "practical", log the preference
- Competitor observations and seasonal NZ events (Matariki, ANZAC Day, school holidays)
- Platform-specific insights (LinkedIn vs Instagram vs Facebook performance)
Omit any "creative" sub-object fields that are empty/unknown.`;

const AHUWHENUA_EXTRACTION_PROMPT = `You are a conversation compressor for a NZ agriculture AI platform (agent: TERRA).
Compress the conversation into structured JSON, extracting NZ farming-specific data.
Return ONLY valid JSON:
{
  "summary": "2-3 sentence overview of what was discussed",
  "facts": [{"key": "dot.notation.key", "value": "string value", "confidence": 0.9}],
  "decisions": ["decision 1"],
  "pending_actions": ["action 1"],
  "compliance_notes": ["any compliance-relevant items"],
  "agriculture": {
    "farm": { "type": "", "region": "", "effective_area_ha": 0, "stock_units": 0, "nait_number": "", "supplier_number": "" },
    "dairy": { "milk_production_kgms": 0, "processor": "", "season": "" },
    "fep": { "status": "", "audit_date": "", "regional_council": "", "risk_grade": "" },
    "water_consents": [{ "consent_number": "", "expiry_date": "", "type": "" }],
    "effluent": { "system_type": "", "capacity": "", "compliant": true },
    "ets": { "registered": false, "forestry_ha": 0, "nzu_balance": 0 },
    "nait_compliance": { "location_registered": true, "movements_current": true, "last_declaration": "" },
    "schedule_prices": [{ "species": "", "grade": "", "price_per_kg": 0, "processor": "", "date": "" }],
    "seasonal_calendar": [{ "event": "", "date_range": "", "notes": "" }],
    "succession": { "structure": "", "status": "", "timeline": "" }
  }
}
Extract NZ agriculture-specific data:
- NAIT location numbers and compliance status
- Farm Environment Plan status, audit dates, regional council
- Water consents with expiry dates
- Effluent system details and compliance
- ETS registration, forestry blocks, carbon credits
- Milk production (kgMS), supplier numbers, processor
- Meat schedule prices, grades, timing decisions
- Seasonal calendar (calving, lambing, shearing, mating)
- Succession planning structures and status
- Regional council — critical as rules vary by region
Omit any "agriculture" sub-object fields that are empty/unknown.`;

const MANAAKI_EXTRACTION_PROMPT = `You are a conversation compressor for a NZ hospitality & tourism AI platform.
Compress the conversation into structured JSON, extracting hospitality-specific data.
Return ONLY valid JSON:
{
  "summary": "2-3 sentence overview of what was discussed",
  "facts": [{"key": "dot.notation.key", "value": "string value", "confidence": 0.9}],
  "decisions": ["decision 1"],
  "pending_actions": ["action 1"],
  "compliance_notes": ["any compliance-relevant items"],
  "hospitality": {
    "venue": { "name": "", "type": "", "location": "", "covers_avg": 0 },
    "fcp": { "template": "", "level": "", "last_verification_date": "", "last_verification_result": "", "next_verification_due": "" },
    "liquor_licence": { "type": "", "number": "", "expiry_date": "", "conditions": [] },
    "manager_certificate": { "holder": "", "number": "", "expiry_date": "" },
    "equipment": [{ "type": "", "name": "", "last_calibration": "", "temp_issues": "" }],
    "staff_training": [{ "name": "", "topic": "", "date": "", "next_due": "" }],
    "temperature_records": [{ "equipment": "", "temp_c": 0, "timestamp": "", "within_range": true, "corrective_action": "" }],
    "allergen_declarations": [{ "menu_item": "", "allergens": [] }],
    "corrective_actions": [{ "issue": "", "action_taken": "", "date": "", "resolved": true }],
    "operational_patterns": { "peak_days": [], "avg_food_cost_pct": 0, "common_issues": [], "seasonal_changes": [] }
  }
}
Extract NZ hospitality-specific data (Food Act 2014 / SSAA 2012):
- Food Control Plan type, level, verification dates and results
- Temperature records with corrective actions (critical for FCP compliance)
- Liquor licence details: type, number, expiry, conditions
- Manager certificate (duty manager) number and expiry
- Equipment inventory: chillers, freezers, hot-hold units, calibration dates
- Staff food safety training records: who, when, what, next due
- Allergen declarations per menu item
- Corrective action register: issue, action, date, resolution
- Operational patterns: peak days, food cost %, recurring issues, seasonal menu changes
- Host responsibility training status
Omit any "hospitality" sub-object fields that are empty/unknown.`;

const DEFAULT_EXTRACTION_PROMPT = `You are a conversation compressor for a NZ business AI platform. Compress the conversation into structured JSON. Extract: decisions made, facts learned, action items, compliance notes. Return ONLY valid JSON:
{
  "summary": "2-3 sentence overview of what was discussed",
  "facts": [{"key": "dot.notation.key", "value": "string value", "confidence": 0.9}],
  "decisions": ["decision 1", "decision 2"],
  "pending_actions": ["action 1"],
  "compliance_notes": ["any compliance-relevant items"]
}`;

function getExtractionPrompt(agentId: string): string {
  const id = agentId?.toLowerCase();
  if (WAIHANGA_AGENTS.has(id)) return WAIHANGA_EXTRACTION_PROMPT;
  if (AUAHA_AGENTS.has(id)) return AUAHA_EXTRACTION_PROMPT;
  if (AHUWHENUA_AGENTS.has(id)) return AHUWHENUA_EXTRACTION_PROMPT;
  if (MANAAKI_AGENTS.has(id)) return MANAAKI_EXTRACTION_PROMPT;
  return DEFAULT_EXTRACTION_PROMPT;
}

function getIndustry(agentId: string): "waihanga" | "auaha" | "ahuwhenua" | "manaaki" | "default" {
  const id = agentId?.toLowerCase();
  if (WAIHANGA_AGENTS.has(id)) return "waihanga";
  if (AUAHA_AGENTS.has(id)) return "auaha";
  if (AHUWHENUA_AGENTS.has(id)) return "ahuwhenua";
  if (MANAAKI_AGENTS.has(id)) return "manaaki";
  return "default";
}

// ─── Industry-specific tool schemas ────────────────────
function getToolSchema(agentId: string) {
  const base: Record<string, any> = {
    summary: { type: "string" },
    facts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          key: { type: "string" },
          value: { type: "string" },
          confidence: { type: "number" },
        },
        required: ["key", "value", "confidence"],
      },
    },
    decisions: { type: "array", items: { type: "string" } },
    pending_actions: { type: "array", items: { type: "string" } },
    compliance_notes: { type: "array", items: { type: "string" } },
  };

  const industry = getIndustry(agentId);

  if (industry === "waihanga") {
    base.construction = {
      type: "object",
      properties: {
        project: {
          type: "object",
          properties: {
            address: { type: "string" },
            consent_ref: { type: "string" },
            consent_authority: { type: "string" },
          },
        },
        participants: {
          type: "array",
          items: {
            type: "object",
            properties: {
              lbp_name: { type: "string" },
              lbp_number: { type: "string" },
              lbp_class: { type: "string" },
            },
          },
        },
        code_decisions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              clause: { type: "string" },
              decision: { type: "string" },
              reason: { type: "string" },
            },
            required: ["clause", "decision"],
          },
        },
        inspection_stage: { type: "string" },
        upcoming_inspections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string" },
              date: { type: "string" },
              items_to_prep: { type: "string" },
            },
          },
        },
        retentions: {
          type: "object",
          properties: {
            amount: { type: "string" },
            held_by: { type: "string" },
            release_date: { type: "string" },
            trust_compliant: { type: "boolean" },
          },
        },
      },
    };
  }

  if (industry === "auaha") {
    base.creative = {
      type: "object",
      properties: {
        brand_dna: {
          type: "object",
          properties: {
            primary_colour: { type: "string" },
            voice_formality: { type: "number", description: "0-10 scale" },
            tone_notes: { type: "string" },
            forbidden_words: { type: "array", items: { type: "string" } },
            approved_phrases: { type: "array", items: { type: "string" } },
          },
        },
        content_performance: {
          type: "array",
          items: {
            type: "object",
            properties: {
              platform: { type: "string" },
              format: { type: "string" },
              engagement_rate: { type: "number" },
              what_worked: { type: "string" },
              what_failed: { type: "string" },
            },
          },
        },
        audience_insights: {
          type: "object",
          properties: {
            top_locations: { type: "array", items: { type: "string" } },
            best_posting_day: { type: "string" },
            best_posting_time: { type: "string" },
            demographic_skew: { type: "string" },
          },
        },
        style_preferences: {
          type: "object",
          properties: {
            preferred_formats: { type: "array", items: { type: "string" } },
            rejected_styles: { type: "array", items: { type: "string" } },
            edit_patterns: { type: "array", items: { type: "string", description: "e.g. 'changed innovative→practical'" } },
          },
        },
        competitor_notes: { type: "array", items: { type: "string" } },
        seasonal_calendar: { type: "array", items: { type: "string" } },
      },
    };
  }

  if (industry === "ahuwhenua") {
    base.agriculture = {
      type: "object",
      properties: {
        farm: {
          type: "object",
          properties: {
            type: { type: "string", description: "dairy | sheep_beef | horticulture | mixed | deer | forestry" },
            region: { type: "string" },
            effective_area_ha: { type: "number" },
            stock_units: { type: "number" },
            nait_number: { type: "string" },
            supplier_number: { type: "string" },
          },
        },
        dairy: {
          type: "object",
          properties: {
            milk_production_kgms: { type: "number" },
            processor: { type: "string" },
            season: { type: "string" },
          },
        },
        fep: {
          type: "object",
          properties: {
            status: { type: "string", description: "none | draft | submitted | audited" },
            audit_date: { type: "string" },
            regional_council: { type: "string" },
            risk_grade: { type: "string", description: "A | B | C | D" },
          },
        },
        water_consents: {
          type: "array",
          items: {
            type: "object",
            properties: {
              consent_number: { type: "string" },
              expiry_date: { type: "string" },
              type: { type: "string" },
            },
          },
        },
        effluent: {
          type: "object",
          properties: {
            system_type: { type: "string" },
            capacity: { type: "string" },
            compliant: { type: "boolean" },
          },
        },
        ets: {
          type: "object",
          properties: {
            registered: { type: "boolean" },
            forestry_ha: { type: "number" },
            nzu_balance: { type: "number" },
          },
        },
        nait_compliance: {
          type: "object",
          properties: {
            location_registered: { type: "boolean" },
            movements_current: { type: "boolean" },
            last_declaration: { type: "string" },
          },
        },
        schedule_prices: {
          type: "array",
          items: {
            type: "object",
            properties: {
              species: { type: "string" },
              grade: { type: "string" },
              price_per_kg: { type: "number" },
              processor: { type: "string" },
              date: { type: "string" },
            },
          },
        },
        seasonal_calendar: {
          type: "array",
          items: {
            type: "object",
            properties: {
              event: { type: "string" },
              date_range: { type: "string" },
              notes: { type: "string" },
            },
          },
        },
        succession: {
          type: "object",
          properties: {
            structure: { type: "string" },
            status: { type: "string" },
            timeline: { type: "string" },
          },
        },
      },
    };
  }

  if (industry === "manaaki") {
    base.hospitality = {
      type: "object",
      properties: {
        venue: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: { type: "string", description: "cafe | restaurant | bar | hotel | lodge | food_truck" },
            location: { type: "string" },
            covers_avg: { type: "number" },
          },
        },
        fcp: {
          type: "object",
          properties: {
            template: { type: "string" },
            level: { type: "string", description: "SSS_level_1 | SSS_level_2 | SSS_level_3 | custom" },
            last_verification_date: { type: "string" },
            last_verification_result: { type: "string", description: "passed | failed | corrective_actions" },
            next_verification_due: { type: "string" },
          },
        },
        liquor_licence: {
          type: "object",
          properties: {
            type: { type: "string", description: "on_licence | off_licence | club_licence | special" },
            number: { type: "string" },
            expiry_date: { type: "string" },
            conditions: { type: "array", items: { type: "string" } },
          },
        },
        manager_certificate: {
          type: "object",
          properties: {
            holder: { type: "string" },
            number: { type: "string" },
            expiry_date: { type: "string" },
          },
        },
        equipment: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string", description: "chiller | freezer | hot_hold | thermometer" },
              name: { type: "string" },
              last_calibration: { type: "string" },
              temp_issues: { type: "string" },
            },
          },
        },
        staff_training: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              topic: { type: "string" },
              date: { type: "string" },
              next_due: { type: "string" },
            },
          },
        },
        temperature_records: {
          type: "array",
          items: {
            type: "object",
            properties: {
              equipment: { type: "string" },
              temp_c: { type: "number" },
              timestamp: { type: "string" },
              within_range: { type: "boolean" },
              corrective_action: { type: "string" },
            },
          },
        },
        corrective_actions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              issue: { type: "string" },
              action_taken: { type: "string" },
              date: { type: "string" },
              resolved: { type: "boolean" },
            },
          },
        },
        operational_patterns: {
          type: "object",
          properties: {
            peak_days: { type: "array", items: { type: "string" } },
            avg_food_cost_pct: { type: "number" },
            common_issues: { type: "array", items: { type: "string" } },
            seasonal_changes: { type: "array", items: { type: "string" } },
          },
        },
      },
    };
  }

  return base;
}

// ─── Industry fact flatteners ──────────────────────────
function flattenConstructionFacts(construction: any): Array<{ key: string; value: string; confidence: number }> {
  const facts: Array<{ key: string; value: string; confidence: number }> = [];
  if (!construction) return facts;

  const p = construction.project;
  if (p?.address) facts.push({ key: "project.address", value: p.address, confidence: 0.9 });
  if (p?.consent_ref) facts.push({ key: "project.consent_ref", value: p.consent_ref, confidence: 0.95 });
  if (p?.consent_authority) facts.push({ key: "project.consent_authority", value: p.consent_authority, confidence: 0.9 });

  if (construction.participants?.length) {
    for (const pt of construction.participants) {
      if (pt.lbp_number) {
        facts.push({ key: `participants.lbp.${pt.lbp_number}`, value: `${pt.lbp_name || "Unknown"} (${pt.lbp_class || "?"})`, confidence: 0.95 });
      }
    }
  }

  if (construction.code_decisions?.length) {
    for (const cd of construction.code_decisions) {
      facts.push({ key: `code_decision.${cd.clause}`, value: `${cd.decision}${cd.reason ? " — " + cd.reason : ""}`, confidence: 0.9 });
    }
  }

  if (construction.inspection_stage) {
    facts.push({ key: "project.inspection_stage", value: construction.inspection_stage, confidence: 0.85 });
  }

  if (construction.retentions?.amount) {
    facts.push({ key: "project.retentions.amount", value: construction.retentions.amount, confidence: 0.9 });
    if (construction.retentions.trust_compliant !== undefined) {
      facts.push({ key: "project.retentions.trust_compliant", value: String(construction.retentions.trust_compliant), confidence: 0.9 });
    }
  }

  return facts;
}

function flattenCreativeFacts(creative: any): Array<{ key: string; value: string; confidence: number }> {
  const facts: Array<{ key: string; value: string; confidence: number }> = [];
  if (!creative) return facts;

  const dna = creative.brand_dna;
  if (dna?.primary_colour) facts.push({ key: "brand.dna.primary_colour", value: dna.primary_colour, confidence: 0.9 });
  if (dna?.voice_formality !== undefined) facts.push({ key: "brand.dna.voice_formality", value: String(dna.voice_formality), confidence: 0.85 });
  if (dna?.tone_notes) facts.push({ key: "brand.dna.tone_notes", value: dna.tone_notes, confidence: 0.85 });
  if (dna?.forbidden_words?.length) facts.push({ key: "brand.forbidden_words", value: dna.forbidden_words.join(", "), confidence: 0.9 });
  if (dna?.approved_phrases?.length) facts.push({ key: "brand.approved_phrases", value: dna.approved_phrases.join(", "), confidence: 0.9 });

  if (creative.content_performance?.length) {
    for (const cp of creative.content_performance) {
      const label = `${cp.platform || "unknown"}.${cp.format || "post"}`;
      if (cp.what_worked) facts.push({ key: `brand.top_content.${label}`, value: `${cp.what_worked} (${cp.engagement_rate || "?"}% engagement)`, confidence: 0.8 });
      if (cp.what_failed) facts.push({ key: `brand.failed_content.${label}`, value: cp.what_failed, confidence: 0.8 });
    }
  }

  const audience = creative.audience_insights;
  if (audience?.top_locations?.length) facts.push({ key: "brand.audience.locations", value: audience.top_locations.join(", "), confidence: 0.85 });
  if (audience?.best_posting_day) facts.push({ key: "brand.audience.best_day", value: audience.best_posting_day, confidence: 0.8 });
  if (audience?.best_posting_time) facts.push({ key: "brand.audience.best_time", value: audience.best_posting_time, confidence: 0.8 });
  if (audience?.demographic_skew) facts.push({ key: "brand.audience.demographic", value: audience.demographic_skew, confidence: 0.8 });

  const style = creative.style_preferences;
  if (style?.preferred_formats?.length) facts.push({ key: "brand.style.preferred_formats", value: style.preferred_formats.join(", "), confidence: 0.85 });
  if (style?.rejected_styles?.length) facts.push({ key: "brand.style.rejected", value: style.rejected_styles.join(", "), confidence: 0.85 });
  if (style?.edit_patterns?.length) facts.push({ key: "brand.style.edit_patterns", value: style.edit_patterns.join("; "), confidence: 0.9 });

  if (creative.competitor_notes?.length) facts.push({ key: "brand.competitors", value: creative.competitor_notes.join("; "), confidence: 0.7 });
  if (creative.seasonal_calendar?.length) facts.push({ key: "brand.seasonal_calendar", value: creative.seasonal_calendar.join(", "), confidence: 0.8 });

  return facts;
}

function flattenAgricultureFacts(agriculture: any): Array<{ key: string; value: string; confidence: number }> {
  const facts: Array<{ key: string; value: string; confidence: number }> = [];
  if (!agriculture) return facts;

  const f = agriculture.farm;
  if (f?.type) facts.push({ key: "farm.type", value: f.type, confidence: 0.9 });
  if (f?.region) facts.push({ key: "farm.region", value: f.region, confidence: 0.9 });
  if (f?.effective_area_ha) facts.push({ key: "farm.effective_area_ha", value: String(f.effective_area_ha), confidence: 0.85 });
  if (f?.stock_units) facts.push({ key: "farm.stock_units", value: String(f.stock_units), confidence: 0.85 });
  if (f?.nait_number) facts.push({ key: "farm.nait_number", value: f.nait_number, confidence: 0.95 });
  if (f?.supplier_number) facts.push({ key: "farm.supplier_number", value: f.supplier_number, confidence: 0.95 });

  const d = agriculture.dairy;
  if (d?.milk_production_kgms) facts.push({ key: "farm.milk_production_kgms", value: String(d.milk_production_kgms), confidence: 0.85 });
  if (d?.processor) facts.push({ key: "farm.processor", value: d.processor, confidence: 0.9 });

  const fep = agriculture.fep;
  if (fep?.status) facts.push({ key: "farm.fep_status", value: fep.status, confidence: 0.9 });
  if (fep?.audit_date) facts.push({ key: "farm.fep_audit_date", value: fep.audit_date, confidence: 0.9 });
  if (fep?.regional_council) facts.push({ key: "farm.region_council", value: fep.regional_council, confidence: 0.9 });
  if (fep?.risk_grade) facts.push({ key: "farm.fep_risk_grade", value: fep.risk_grade, confidence: 0.85 });

  if (agriculture.water_consents?.length) {
    for (const wc of agriculture.water_consents) {
      if (wc.consent_number) {
        facts.push({ key: `farm.water_consent.${wc.consent_number}`, value: `${wc.type || "water take"} — expires ${wc.expiry_date || "unknown"}`, confidence: 0.9 });
      }
    }
  }

  const eff = agriculture.effluent;
  if (eff?.system_type) facts.push({ key: "farm.effluent_system", value: `${eff.system_type} (${eff.capacity || "?"})`, confidence: 0.85 });
  if (eff?.compliant !== undefined) facts.push({ key: "farm.effluent_compliant", value: String(eff.compliant), confidence: 0.85 });

  const ets = agriculture.ets;
  if (ets?.registered !== undefined) facts.push({ key: "farm.ets_registered", value: String(ets.registered), confidence: 0.9 });
  if (ets?.forestry_ha) facts.push({ key: "farm.ets_forestry_ha", value: String(ets.forestry_ha), confidence: 0.85 });
  if (ets?.nzu_balance) facts.push({ key: "farm.ets_nzu_balance", value: String(ets.nzu_balance), confidence: 0.8 });

  const nait = agriculture.nait_compliance;
  if (nait?.location_registered !== undefined) facts.push({ key: "farm.nait_registered", value: String(nait.location_registered), confidence: 0.9 });
  if (nait?.movements_current !== undefined) facts.push({ key: "farm.nait_movements_current", value: String(nait.movements_current), confidence: 0.85 });
  if (nait?.last_declaration) facts.push({ key: "farm.nait_last_declaration", value: nait.last_declaration, confidence: 0.85 });

  if (agriculture.schedule_prices?.length) {
    for (const sp of agriculture.schedule_prices) {
      if (sp.species) {
        facts.push({ key: `farm.schedule.${sp.species}.${sp.grade || "all"}`, value: `$${sp.price_per_kg}/kg (${sp.processor || "?"}) ${sp.date || ""}`, confidence: 0.8 });
      }
    }
  }

  if (agriculture.seasonal_calendar?.length) {
    for (const sc of agriculture.seasonal_calendar) {
      if (sc.event) facts.push({ key: `farm.calendar.${sc.event.replace(/\s+/g, "_")}`, value: `${sc.date_range || ""} — ${sc.notes || ""}`, confidence: 0.8 });
    }
  }

  const succ = agriculture.succession;
  if (succ?.structure) facts.push({ key: "farm.succession_structure", value: succ.structure, confidence: 0.85 });
  if (succ?.status) facts.push({ key: "farm.succession_status", value: succ.status, confidence: 0.85 });

  return facts;
}

function flattenHospitalityFacts(hospitality: any): Array<{ key: string; value: string; confidence: number }> {
  const facts: Array<{ key: string; value: string; confidence: number }> = [];
  if (!hospitality) return facts;

  const v = hospitality.venue;
  if (v?.name) facts.push({ key: "hospitality.venue_name", value: v.name, confidence: 0.95 });
  if (v?.type) facts.push({ key: "hospitality.venue_type", value: v.type, confidence: 0.9 });
  if (v?.location) facts.push({ key: "hospitality.location", value: v.location, confidence: 0.9 });
  if (v?.covers_avg) facts.push({ key: "hospitality.covers_avg", value: String(v.covers_avg), confidence: 0.8 });

  const fcp = hospitality.fcp;
  if (fcp?.template) facts.push({ key: "hospitality.fcp_type", value: `${fcp.template} ${fcp.level || ""}`.trim(), confidence: 0.9 });
  if (fcp?.last_verification_date) facts.push({ key: "hospitality.last_verification", value: `${fcp.last_verification_date} (${fcp.last_verification_result || "?"})`, confidence: 0.9 });
  if (fcp?.next_verification_due) facts.push({ key: "hospitality.verification_due", value: fcp.next_verification_due, confidence: 0.9 });

  const ll = hospitality.liquor_licence;
  if (ll?.number) facts.push({ key: "hospitality.liquor_licence", value: `${ll.type || "licence"} #${ll.number} (expires ${ll.expiry_date || "?"})`, confidence: 0.95 });
  if (ll?.conditions?.length) facts.push({ key: "hospitality.licence_conditions", value: ll.conditions.join("; "), confidence: 0.9 });

  const mc = hospitality.manager_certificate;
  if (mc?.number) facts.push({ key: "hospitality.manager_cert", value: `${mc.holder || "?"} #${mc.number} (expires ${mc.expiry_date || "?"})`, confidence: 0.95 });

  if (hospitality.equipment?.length) {
    for (const eq of hospitality.equipment) {
      if (eq.name || eq.type) {
        const label = eq.name || eq.type;
        facts.push({ key: `hospitality.equipment.${label.replace(/\s+/g, "_")}`, value: `${eq.type || ""} — calibrated ${eq.last_calibration || "?"}${eq.temp_issues ? " ⚠️ " + eq.temp_issues : ""}`, confidence: 0.85 });
      }
    }
  }

  if (hospitality.staff_training?.length) {
    for (const st of hospitality.staff_training) {
      if (st.name) {
        facts.push({ key: `hospitality.training.${st.name.replace(/\s+/g, "_")}`, value: `${st.topic || "food safety"} on ${st.date || "?"} (next: ${st.next_due || "?"})`, confidence: 0.85 });
      }
    }
  }

  if (hospitality.temperature_records?.length) {
    const outOfRange = hospitality.temperature_records.filter((t: any) => !t.within_range);
    if (outOfRange.length) {
      facts.push({ key: "hospitality.temp_issues_count", value: String(outOfRange.length), confidence: 0.9 });
      for (const t of outOfRange.slice(0, 3)) {
        facts.push({ key: `hospitality.temp_issue.${t.equipment || "unknown"}`, value: `${t.temp_c}°C at ${t.timestamp || "?"} — ${t.corrective_action || "no action recorded"}`, confidence: 0.9 });
      }
    }
  }

  if (hospitality.corrective_actions?.length) {
    const unresolved = hospitality.corrective_actions.filter((ca: any) => !ca.resolved);
    if (unresolved.length) {
      facts.push({ key: "hospitality.unresolved_correctives", value: unresolved.map((ca: any) => ca.issue).join("; "), confidence: 0.9 });
    }
  }

  const ops = hospitality.operational_patterns;
  if (ops?.peak_days?.length) facts.push({ key: "hospitality.peak_days", value: ops.peak_days.join(", "), confidence: 0.8 });
  if (ops?.avg_food_cost_pct) facts.push({ key: "hospitality.avg_food_cost_pct", value: `${ops.avg_food_cost_pct}%`, confidence: 0.8 });
  if (ops?.common_issues?.length) facts.push({ key: "hospitality.common_issues", value: ops.common_issues.join("; "), confidence: 0.8 });
  if (ops?.seasonal_changes?.length) facts.push({ key: "hospitality.seasonal_changes", value: ops.seasonal_changes.join("; "), confidence: 0.75 });

  return facts;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, agentId, userId, conversationId } = await req.json();

    if (!messages || !agentId || !userId) {
      return new Response(
        JSON.stringify({ error: "messages, agentId, and userId required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const estimatedTokens = messages.length * TOKEN_ESTIMATE_PER_MSG;
    const shouldCompress =
      messages.length > COMPRESS_THRESHOLD_MSGS ||
      estimatedTokens > COMPRESS_THRESHOLD_TOKENS;

    if (!shouldCompress) {
      return new Response(
        JSON.stringify({ compressed: false, messages }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = messages[0]?.role === "system" ? messages[0] : null;
    const startIdx = systemPrompt ? 1 : 0;
    const keepRecent = messages.slice(-KEEP_RECENT);
    const toCompress = messages.slice(startIdx, -KEEP_RECENT);

    if (toCompress.length < MIN_COMPRESSIBLE) {
      return new Response(
        JSON.stringify({ compressed: false, messages }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const industry = getIndustry(agentId);
    console.log(
      `[compress] Compressing ${toCompress.length} messages for agent=${agentId}, user=${userId} [${industry.toUpperCase()}]`
    );

    // Call Lovable AI Gateway with industry-specific extraction
    const aiResp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: getExtractionPrompt(agentId) },
            {
              role: "user",
              content: JSON.stringify(
                toCompress.map((m: any) => ({
                  role: m.role,
                  content: typeof m.content === "string" ? m.content.slice(0, 2000) : m.content,
                }))
              ),
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "compress_conversation",
                description: "Return structured compression of conversation",
                parameters: {
                  type: "object",
                  properties: getToolSchema(agentId),
                  required: ["summary", "facts", "decisions", "pending_actions"],
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "compress_conversation" },
          },
        }),
      }
    );

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("[compress] AI error:", aiResp.status, errText);
      return new Response(
        JSON.stringify({ compressed: false, messages, error: "AI compression failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let parsed: any;

    if (toolCall?.function?.arguments) {
      parsed = JSON.parse(toolCall.function.arguments);
    } else {
      const content = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("[compress] Could not parse AI response");
        return new Response(
          JSON.stringify({ compressed: false, messages }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      parsed = JSON.parse(jsonMatch[0]);
    }

    // Persist to database
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Save conversation summary with lineage
    const { error: summaryError } = await supabase
      .from("conversation_summaries")
      .insert({
        user_id: userId,
        agent_id: agentId,
        summary: parsed.summary,
        key_facts_extracted: parsed,
        original_message_count: toCompress.length,
        compression_level: 1,
      });

    if (summaryError) {
      console.error("[compress] Summary save error:", summaryError.message);
    }

    // 2. Upsert extracted facts to shared_context
    const allFacts = [
      ...(parsed.facts || []),
      ...flattenConstructionFacts(parsed.construction),
      ...flattenCreativeFacts(parsed.creative),
      ...flattenAgricultureFacts(parsed.agriculture),
      ...flattenHospitalityFacts(parsed.hospitality),
    ];

    if (allFacts.length) {
      for (const fact of allFacts) {
        const { error: ctxError } = await supabase
          .from("shared_context")
          .upsert(
            {
              user_id: userId,
              context_key: fact.key,
              context_value: fact.value,
              source_agent: agentId,
              confidence: fact.confidence ?? 0.5,
            },
            { onConflict: "user_id,context_key" }
          );
        if (ctxError) {
          console.error(`[compress] Context upsert error for ${fact.key}:`, ctxError.message);
        }
      }
    }

    console.log(
      `[compress] Done: ${toCompress.length} msgs → summary + ${allFacts.length} facts [${industry}]`
    );

    // 3. Rebuild compressed message array
    let industryContext = "";
    if (industry === "waihanga") {
      if (parsed.construction?.inspection_stage) industryContext += `Inspection Stage: ${parsed.construction.inspection_stage}\n`;
      if (parsed.construction?.code_decisions?.length) industryContext += `Code Decisions: ${parsed.construction.code_decisions.map((c: any) => `${c.clause}: ${c.decision}`).join("; ")}\n`;
    }
    if (industry === "auaha") {
      if (parsed.creative?.brand_dna?.tone_notes) industryContext += `Brand Voice: ${parsed.creative.brand_dna.tone_notes}\n`;
      if (parsed.creative?.content_performance?.length) {
        const top = parsed.creative.content_performance.filter((c: any) => c.what_worked);
        if (top.length) industryContext += `Top Content: ${top.map((c: any) => `${c.platform} ${c.format}: ${c.what_worked}`).join("; ")}\n`;
      }
      if (parsed.creative?.style_preferences?.edit_patterns?.length) industryContext += `Style Patterns: ${parsed.creative.style_preferences.edit_patterns.join("; ")}\n`;
    }
    if (industry === "ahuwhenua") {
      const ag = parsed.agriculture;
      if (ag?.farm?.type) industryContext += `Farm: ${ag.farm.type} (${ag.farm.region || "NZ"}, ${ag.farm.effective_area_ha || "?"}ha)\n`;
      if (ag?.fep?.status) industryContext += `FEP: ${ag.fep.status} (${ag.fep.regional_council || ""})\n`;
      if (ag?.nait_compliance?.movements_current !== undefined) industryContext += `NAIT: movements ${ag.nait_compliance.movements_current ? "current" : "OVERDUE"}\n`;
      if (ag?.ets?.registered) industryContext += `ETS: registered, ${ag.ets.forestry_ha || 0}ha forestry\n`;
      if (ag?.dairy?.milk_production_kgms) industryContext += `Production: ${ag.dairy.milk_production_kgms} kgMS (${ag.dairy.processor || ""})\n`;
    }
    if (industry === "manaaki") {
      const h = parsed.hospitality;
      if (h?.venue?.name) industryContext += `Venue: ${h.venue.name} (${h.venue.type || "hospitality"}, ${h.venue.location || "NZ"})\n`;
      if (h?.fcp?.template) industryContext += `FCP: ${h.fcp.template} ${h.fcp.level || ""} — last verified ${h.fcp.last_verification_date || "?"} (${h.fcp.last_verification_result || "?"})\n`;
      if (h?.liquor_licence?.number) industryContext += `Liquor Licence: ${h.liquor_licence.type || "on_licence"} #${h.liquor_licence.number} expires ${h.liquor_licence.expiry_date || "?"}\n`;
      if (h?.manager_certificate?.number) industryContext += `Manager Cert: ${h.manager_certificate.holder || "?"} #${h.manager_certificate.number} expires ${h.manager_certificate.expiry_date || "?"}\n`;
      const tempIssues = h?.temperature_records?.filter((t: any) => !t.within_range) || [];
      if (tempIssues.length) industryContext += `⚠️ ${tempIssues.length} temperature exceedance(s) recorded\n`;
      if (h?.operational_patterns?.avg_food_cost_pct) industryContext += `Food Cost: ${h.operational_patterns.avg_food_cost_pct}%\n`;
    }


    const compressionMessage = {
      role: "assistant" as const,
      content:
        `[EARLIER IN THIS CONVERSATION]\n${parsed.summary}\n` +
        (parsed.decisions?.length ? `Decisions: ${parsed.decisions.join("; ")}\n` : "") +
        (parsed.pending_actions?.length ? `Pending: ${parsed.pending_actions.join("; ")}\n` : "") +
        (parsed.compliance_notes?.length ? `Compliance: ${parsed.compliance_notes.join("; ")}\n` : "") +
        industryContext,
    };

    const compressedMessages = [
      ...(systemPrompt ? [systemPrompt] : []),
      compressionMessage,
      ...keepRecent,
    ];

    return new Response(
      JSON.stringify({
        compressed: true,
        messages: compressedMessages,
        stats: {
          original_count: messages.length,
          compressed_count: compressedMessages.length,
          facts_extracted: allFacts.length,
          decisions: parsed.decisions?.length || 0,
          industry,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[compress] Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
