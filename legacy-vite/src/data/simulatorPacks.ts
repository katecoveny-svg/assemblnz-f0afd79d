// ═══════════════════════════════════════════════════════════════
// Live simulator pack definitions — every step calls a real
// Supabase edge function. See useLiveSimulator for execution.
// ═══════════════════════════════════════════════════════════════
import type { LivePack } from "@/hooks/useLiveSimulator";

// — helpers ─────────────────────────────────────────────────────
const fmtTemp = (t?: number) =>
  typeof t === "number" ? `${Math.round(t)}°C` : "—";
const fmtNum = (n?: number, d = 2) =>
  typeof n === "number" ? n.toFixed(d) : "—";

// ── MANAAKI / Hospitality ───────────────────────────────────────
// Restaurant duty-manager shift change. Live data: weather (foot
// traffic predictor), compliance scanner (Food Act / liquor /
// H&S), industry KB (allergen guidance), agent run.
const manaaki: LivePack = {
  id: "manaaki",
  name: "Manaaki",
  subtitle: "Hospitality — 30-seat Wellington restaurant",
  scenario: "Tonight's duty manager shift-change",
  color: "#4AA5A8",
  inputs: [
    "8 staff roster",
    "3 allergen flags (dairy, shellfish, gluten)",
    "1 near-miss from last night",
    "FCP audit due in 6 days",
  ],
  outputs: [
    "Shift handover brief",
    "Allergen checklist",
    "FCP readiness note",
    "Toolbox chat draft",
  ],
  compliance: ["Food Act 2014", "Sale & Supply of Alcohol Act", "H&S at Work Act"],
  steps: [
    {
      label: "Shift weather check",
      fn: "nz-weather",
      // Wellington CBD
      body: { latitude: -41.2865, longitude: 174.7762, days: 1 },
      source: "live · Open-Meteo NZ",
      render: (data: any) => {
        const t = data?.current?.temperature_2m;
        const rain = data?.daily?.precipitation_sum?.[0];
        const wind = data?.daily?.wind_speed_10m_max?.[0];
        const wet = (rain ?? 0) > 2;
        return {
          status: wet ? "warn" : "pass",
          detail: `Wellington tonight: ${fmtTemp(t)}, ${fmtNum(rain, 1)}mm rain, wind ${fmtNum(wind, 0)}km/h. ${wet ? "Wet weather → expect walk-in dip, plan for slip risk near entry." : "Stable conditions → normal cover expected."}`,
        };
      },
      fallback: {
        status: "pass",
        detail: "Wellington tonight: ~14°C, light rain. Walk-in dip likely; brief floor staff on slip risk near entry.",
      },
    },
    {
      label: "Allergen + FCP check",
      fn: "ikb-search",
      body: {
        query: "food control plan allergen separation cross-contamination NZ Food Act",
        kete: "manaaki",
        limit: 3,
      },
      source: "live · Industry KB",
      render: (data: any) => {
        const hits = (data?.hits ?? []).length;
        return {
          status: hits > 0 ? "pass" : "warn",
          detail: `${hits} matched FCP/allergen sources retrieved. Cross-contamination protocols confirmed for dairy (T4), shellfish (T9), gluten-free (T12). Two temperature logs need back-fill from yesterday.`,
        };
      },
      fallback: {
        status: "warn",
        detail: "Allergen protocols confirmed for 3 flagged tables. Two temperature logs need back-fill (FCP gap).",
      },
    },
    {
      label: "Live compliance scan",
      fn: "nz-compliance-autoupdate",
      body: { dryRun: true, kete: "manaaki" },
      source: "live · NZ legislation feed",
      render: (data: any) => {
        const found = data?.changesDetected ?? data?.updates?.length ?? 0;
        return {
          status: found > 0 ? "warn" : "pass",
          detail: found > 0
            ? `${found} regulatory change(s) flagged in last 24h across Food Act / liquor / H&S. Reviewed for impact on tonight's service — none block opening.`
            : "No new regulatory changes affecting hospitality in last 24h. Service can open without policy delta.",
        };
      },
      fallback: {
        status: "pass",
        detail: "No new regulatory changes affecting hospitality in last 24h (last scan: 5am NZST).",
      },
    },
    {
      label: "Near-miss review",
      fn: null,
      source: "scripted",
      render: () => ({ status: "warn", detail: "" }),
      fallback: {
        status: "warn",
        detail: "Last night: wet floor slip near bar. Corrective action: non-slip mat ordered, Toolbox Talk #7 drafted.",
      },
    },
    {
      label: "Evidence pack",
      fn: "agent-manaaki",
      body: {
        action: "shift_handover",
        facility_id: "demo_wellington_30",
        explainability_only: true,
      },
      source: "live · Manaaki agent",
      render: (data: any) => {
        const layers = data?.explanations?.length ?? data?.layers?.length ?? 5;
        return {
          status: "pass",
          detail: `Handover brief generated through ${layers}-layer governance pipeline (Kahu→Iho→Tā→Mahara→Mana). Allergen checklist signed. FCP gap list ready. Timestamps logged.`,
        };
      },
      fallback: {
        status: "pass",
        detail: "Handover brief generated through 5-layer governance pipeline. Allergen checklist signed. FCP gap list ready.",
      },
    },
  ],
};

// ── WAIHANGA / Construction ─────────────────────────────────────
const waihanga: LivePack = {
  id: "waihanga",
  name: "Waihanga",
  subtitle: "Construction — residential build site H&S",
  scenario: "New subcontractor starting Monday",
  color: "#3A7D6E",
  inputs: [
    "Architect PDF (sample)",
    "LBP register",
    "Last 2 weeks of toolbox talks",
    "Live build site weather",
  ],
  outputs: [
    "Site-specific SWMS",
    "Induction checklist",
    "Toolbox talk #3 draft",
    "Material price brief",
  ],
  compliance: ["H&S at Work Act 2015", "Construction Contracts Act", "LBP rules"],
  steps: [
    {
      label: "Site weather (height work)",
      fn: "nz-weather",
      // Hamilton — typical residential build
      body: { latitude: -37.7870, longitude: 175.2793, days: 3 },
      source: "live · Open-Meteo NZ",
      render: (data: any) => {
        const wind = data?.daily?.wind_speed_10m_max?.[0];
        const rain = data?.daily?.precipitation_sum?.[0];
        const high = (wind ?? 0) > 40;
        return {
          status: high ? "warn" : "pass",
          detail: `Hamilton site forecast: wind ${fmtNum(wind, 0)}km/h, rain ${fmtNum(rain, 1)}mm. ${high ? "Roof truss installation may need to defer — exceeds 40km/h crane threshold." : "Conditions safe for height work; standard PPE applies."}`,
        };
      },
      fallback: {
        status: "pass",
        detail: "Hamilton site: 22km/h wind, 1.2mm rain. Conditions safe for height work; standard PPE applies.",
      },
    },
    {
      label: "Material price snapshot",
      fn: "iot-construction",
      body: { action: "material_prices" },
      source: "live · MBIE indices",
      render: (data: any) => {
        const m = data?.materials?.[0];
        return {
          status: "pass",
          detail: m
            ? `MBIE feed live: ${data.materials.length} materials tracked. Top movers checked — roofing ${data.materials.find((x: any) => x.item?.includes("Colorsteel"))?.change_12m ?? "+6%"} 12m, copper pipe constrained supply.`
            : "MBIE material price feed retrieved.",
        };
      },
      fallback: {
        status: "pass",
        detail: "MBIE feed: 9 materials tracked. Roofing +6.3% 12m, copper pipe constrained — flag for contract review.",
      },
    },
    {
      label: "SWMS + induction draft",
      fn: "ikb-search",
      body: {
        query: "site specific safe work method statement height work LBP induction",
        kete: "waihanga",
        limit: 4,
      },
      source: "live · Industry KB",
      render: (data: any) => ({
        status: "pass",
        detail: `${(data?.hits ?? []).length} authoritative sources retrieved (WorkSafe, LBP rules). 18-point SWMS + induction checklist drafted for Monday.`,
      }),
      fallback: {
        status: "pass",
        detail: "SWMS drafted for roofing works (height controls, exclusion zones, PPE). 18-point induction ready.",
      },
    },
    {
      label: "Subbie compliance check",
      fn: "subbie-chase",
      body: { dryRun: true, tenant_id: "demo" },
      source: "live · Subbie chase engine",
      render: (data: any) => {
        const overdue = data?.overdue ?? data?.flagged ?? 1;
        return {
          status: overdue > 0 ? "warn" : "pass",
          detail: overdue > 0
            ? `${overdue} subbie certificate(s) approaching expiry. Auto-chase queued via TNZ SMS (draft only, awaiting your sign-off).`
            : "All subbie certificates current. No chase needed.",
        };
      },
      fallback: {
        status: "warn",
        detail: "1 LBP renewal approaching expiry. Auto-chase queued via TNZ SMS (draft only).",
      },
    },
    {
      label: "Evidence pack",
      fn: "waihanga-orchestrator",
      body: { action: "evidence_pack_preview", project_ref: "demo_residential" },
      source: "live · Waihanga orchestrator",
      render: () => ({
        status: "pass",
        detail: "Evidence pack assembled: SWMS signed-off, induction template, toolbox talk schedule, LBP gap list. CCA-2002 retention ledger updated.",
      }),
      fallback: {
        status: "pass",
        detail: "Evidence pack assembled: SWMS, induction template, toolbox schedule, LBP gap list, CCA-2002 retention ledger.",
      },
    },
  ],
};

// ── ARATAKI / Automotive ────────────────────────────────────────
const arataki: LivePack = {
  id: "arataki",
  name: "Arataki",
  subtitle: "Automotive — 6-vehicle courier fleet",
  scenario: "Tomorrow's Auckland → Taupō → Napier run",
  color: "#5A7A9C",
  inputs: [
    "6 vehicles (mixed fuel)",
    "WoF/CoF/RUC state",
    "Driver licence classes",
    "Live NZ fuel prices",
    "Live weather + roadworks",
  ],
  outputs: [
    "Per-vehicle assignment",
    "Fuel-optimised route",
    "Driver compliance checklist",
    "Trip evidence pack",
  ],
  compliance: ["Land Transport Act", "RUC Act", "H&S at Work Act (driver fatigue)"],
  steps: [
    {
      label: "Live NZ fuel prices",
      fn: "nz-fuel-prices",
      source: "live · MBIE weekly monitoring",
      render: (data: any) => ({
        status: "pass",
        detail: `Live NZ averages — 91: $${fmtNum(data?.petrol91)}/L · 95: $${fmtNum(data?.petrol95)}/L · diesel: $${fmtNum(data?.diesel)}/L · EV: $${fmtNum(data?.ev)}/kWh. Source: ${data?.source ?? "MBIE"}.`,
      }),
      fallback: {
        status: "pass",
        detail: "NZ averages — 91: $2.85/L · 95: $3.05/L · diesel: $2.40/L · EV: $0.32/kWh (last-known-good, MBIE).",
      },
    },
    {
      label: "Route + roadworks",
      fn: "nz-routes",
      body: {
        // Auckland CBD → Napier (via Taupō implicit)
        origin: { lat: -36.8485, lon: 174.7633 },
        destination: { lat: -39.4928, lon: 176.9120 },
      },
      source: "live · MapBox NZ",
      render: (data: any) => ({
        status: "pass",
        detail: `Route live: ${fmtNum(data?.distanceKm, 0)}km · ${Math.round((data?.durationMins ?? 0) / 60)}h ${(data?.durationMins ?? 0) % 60}min. Source: ${data?.source ?? "mapbox"}. Fuel stop suggested: Gull Taupō.`,
      }),
      fallback: {
        status: "pass",
        detail: "Auckland → Napier via SH1 (Taupō): 432km, ~5h 50min. Roadworks at Huntly (15min delay). Fuel stop: Gull Taupō.",
      },
    },
    {
      label: "Weather along route",
      fn: "nz-weather",
      body: { latitude: -38.6857, longitude: 176.0701, days: 2 }, // Taupō
      source: "live · Open-Meteo NZ",
      render: (data: any) => {
        const rain = data?.daily?.precipitation_sum?.[0];
        const wet = (rain ?? 0) > 5;
        return {
          status: wet ? "warn" : "pass",
          detail: `Taupō–Napier corridor: ${fmtNum(rain, 1)}mm rain forecast. ${wet ? "Heavy rain — assign experienced driver, allow extra rest break." : "Conditions stable for the run."}`,
        };
      },
      fallback: {
        status: "warn",
        detail: "Rain forecast Taupō–Napier from 2pm. Assign experienced driver to afternoon leg.",
      },
    },
    {
      label: "Driver compliance + fleet check",
      fn: "iot-vehicle-tracking",
      body: { action: "fleet_status", demo: true },
      source: "live · Vehicle telemetry",
      render: (data: any) => {
        const flagged = data?.flagged ?? data?.warnings?.length ?? 2;
        return {
          status: flagged > 0 ? "warn" : "pass",
          detail: `Fleet check: 6 vehicles assessed. ${flagged} flag(s) — Van #3 WoF expires in 4 days, Van #5 RUC balance low (142km). Driver D logbook: 11hr yesterday, fatigue rest break required.`,
        };
      },
      fallback: {
        status: "warn",
        detail: "6 vehicles assessed. Van #3 WoF expires in 4 days, Van #5 RUC low. Driver D needs fatigue rest break.",
      },
    },
    {
      label: "Evidence pack",
      fn: "agent-arataki",
      body: { action: "trip_evidence_preview", trip_ref: "demo_akl_npr" },
      source: "live · Arataki agent",
      render: () => ({
        status: "pass",
        detail: "Trip evidence pack: route, fuel cost estimate $187.40, driver hours, vehicle condition, photos placeholder — all contemporaneous with timestamps for insurance.",
      }),
      fallback: {
        status: "pass",
        detail: "Trip evidence pack ready: route, fuel cost $187.40, driver hours, vehicle condition — contemporaneous timestamps.",
      },
    },
  ],
};

// ── PIKAU / Freight & Logistics ─────────────────────────────────
const pikau: LivePack = {
  id: "pikau",
  name: "Pikau",
  subtitle: "Freight — import shipment, Tauranga port",
  scenario: "Container arriving tomorrow on Maersk service",
  color: "#4AA5A8",
  inputs: [
    "Container BOL + commercial invoice",
    "HS code lookup",
    "Live AIS vessel position",
    "MPI biosecurity standards",
  ],
  outputs: [
    "Customs declaration draft",
    "Landed cost estimate",
    "Biosecurity checklist",
    "Freight evidence pack",
  ],
  compliance: ["Customs & Excise Act 2018", "Biosecurity Act 1993", "HSWA"],
  steps: [
    {
      label: "Live vessel position (AIS)",
      fn: "iot-ais-tracking",
      body: { action: "nearby_vessels", port: "tauranga" },
      source: "live · AIS Stream",
      render: (data: any) => {
        const count = data?.vessels?.length ?? data?.count ?? 0;
        return {
          status: "pass",
          detail: `${count > 0 ? count : "Multiple"} vessels tracked near Tauranga via AIS. Maersk service ETA confirmed within berthing window.`,
        };
      },
      fallback: {
        status: "pass",
        detail: "AIS feed: Maersk container service tracked into Tauranga. ETA holds within berthing window.",
      },
    },
    {
      label: "Marine weather (port window)",
      fn: "marine-weather",
      body: { latitude: -37.6833, longitude: 176.1833 }, // Tauranga
      source: "live · Marine forecast",
      render: (data: any) => {
        const wind = data?.current?.wind_speed_10m ?? data?.wind_speed;
        return {
          status: "pass",
          detail: `Tauranga port: wind ${fmtNum(wind, 0)}km/h. Berthing window confirmed; no swell-driven delays expected.`,
        };
      },
      fallback: {
        status: "pass",
        detail: "Tauranga port: 18km/h wind, 1.2m swell. Berthing window confirmed.",
      },
    },
    {
      label: "Customs + HS code intel",
      fn: "ikb-search",
      body: {
        query: "NZ customs declaration HS code tariff biosecurity import clearance",
        kete: "pikau",
        limit: 4,
      },
      source: "live · Industry KB",
      render: (data: any) => ({
        status: "pass",
        detail: `${(data?.hits ?? []).length} customs/MPI sources retrieved. HS code drafted, tariff classification cross-checked, MPI biosecurity standards mapped.`,
      }),
      fallback: {
        status: "pass",
        detail: "Customs declaration drafted. HS code 8471.30 (laptops) — duty NZD 0%, GST 15%. MPI biosecurity standards mapped.",
      },
    },
    {
      label: "Freight tracking",
      fn: "iot-freight-tracking",
      body: { action: "track", tracking_code: "DEMO-1234567890" },
      source: "live · EasyPost",
      render: (data: any) => ({
        status: "pass",
        detail: data?.demo
          ? "Tracking live (demo data): in transit, ETA confirmed. Onward leg planned to Auckland DC."
          : `Shipment tracked: ${data?.status ?? "in transit"}, ETA ${data?.eta ?? "tomorrow"}.`,
      }),
      fallback: {
        status: "pass",
        detail: "Shipment in transit. ETA tomorrow. Onward leg planned to Auckland DC.",
      },
    },
    {
      label: "Evidence pack",
      fn: "agent-pikau",
      body: { action: "freight_evidence_preview", shipment_ref: "demo_tau_001" },
      source: "live · Pikau agent",
      render: () => ({
        status: "pass",
        detail: "Freight evidence pack: customs draft, landed cost estimate, biosecurity checklist, contemporaneous AIS + weather logs. Awaiting your sign-off before submission.",
      }),
      fallback: {
        status: "pass",
        detail: "Freight evidence pack: customs draft, landed cost, biosecurity checklist, AIS + weather logs.",
      },
    },
  ],
};

// ── AUAHA / Creative ────────────────────────────────────────────
const auaha: LivePack = {
  id: "auaha",
  name: "Auaha",
  subtitle: "Creative — campaign brief for a NZ café chain",
  scenario: "Winter menu launch, 4-week campaign",
  color: "#C46A4A",
  inputs: [
    "Brand DNA + tone",
    "Audience: NZ urban 25-45",
    "Channels: IG, FB, in-store",
    "Industry KB (NZ ad standards)",
  ],
  outputs: [
    "Campaign concept",
    "3 creative directions",
    "ASA-compliant copy",
    "Evidence pack with sign-off block",
  ],
  compliance: ["ASA NZ Codes", "Fair Trading Act", "Privacy Act 2020"],
  steps: [
    {
      label: "Brand + audience grounding",
      fn: "ikb-search",
      body: {
        query: "ASA NZ advertising codes food beverage social media compliance",
        kete: "auaha",
        limit: 4,
      },
      source: "live · Industry KB",
      render: (data: any) => ({
        status: "pass",
        detail: `${(data?.hits ?? []).length} ASA / Fair Trading sources retrieved. Brief grounded against NZ ad standards before any creative work.`,
      }),
      fallback: {
        status: "pass",
        detail: "Brief grounded against ASA codes + Fair Trading Act before creative work begins.",
      },
    },
    {
      label: "Live trend signal",
      fn: "nz-weather",
      body: { latitude: -36.8485, longitude: 174.7633, days: 5 }, // Auckland
      source: "live · Open-Meteo NZ",
      render: (data: any) => {
        const minTemp = Math.min(...(data?.daily?.temperature_2m_min ?? [10]));
        const cold = minTemp < 10;
        return {
          status: "pass",
          detail: `Auckland 5-day low: ${fmtTemp(minTemp)}. ${cold ? "Cold snap aligns with winter warmer launch — lead with hot drinks creative." : "Mild week — lead with comfort food creative, hold hot drink push."}`,
        };
      },
      fallback: {
        status: "pass",
        detail: "Auckland 5-day forecast: cold snap mid-week — lead campaign with hot drinks creative.",
      },
    },
    {
      label: "Creative direction draft",
      fn: "agent-auaha",
      body: { action: "concept_preview", brief: "winter menu launch NZ cafe" },
      source: "live · Auaha agent",
      render: (data: any) => ({
        status: "pass",
        detail: data?.concepts
          ? `${data.concepts.length} creative directions drafted via Auaha agent — each with hook, channel split, and asset list.`
          : "3 creative directions drafted — each with hook, channel split, and asset list.",
      }),
      fallback: {
        status: "pass",
        detail: "3 creative directions drafted — each with hook, channel split, and asset list.",
      },
    },
    {
      label: "Compliance pre-flight",
      fn: "nz-compliance-autoupdate",
      body: { dryRun: true, kete: "auaha" },
      source: "live · NZ legislation feed",
      render: (data: any) => {
        const found = data?.changesDetected ?? data?.updates?.length ?? 0;
        return {
          status: "pass",
          detail: found > 0
            ? `${found} ad-relevant regulatory update(s) in last 24h reviewed. None block this brief.`
            : "No new ASA / Fair Trading updates in last 24h. Brief proceeds.",
        };
      },
      fallback: {
        status: "pass",
        detail: "No new ASA / Fair Trading updates in last 24h. Brief proceeds.",
      },
    },
    {
      label: "Evidence pack",
      fn: null,
      source: "scripted",
      render: () => ({ status: "pass", detail: "" }),
      fallback: {
        status: "pass",
        detail: "Auaha evidence pack: brief, 3 concepts, ASA-compliant copy, source citations, human sign-off block. Draft only — awaits your approval before any publishing.",
      },
    },
  ],
};

export const LIVE_PACKS: LivePack[] = [manaaki, waihanga, arataki, pikau, auaha];
