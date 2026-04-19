// ═══════════════════════════════════════════════════════════════
// agentLiveDataMap — every agent gets curated NZ live-data feeds.
// Each entry maps an agent ID → list of edge-function calls
// surfaced in the LiveDataPanel sidebar tab in chat.
// ═══════════════════════════════════════════════════════════════

export interface LiveSource {
  fn: string;
  defaultBody: any;
  label: string;
}

// ── Reusable feed presets (keep bodies in one place) ──────────
const WEATHER = (city: string, mode: "current" | "forecast" | "both" = "both"): LiveSource => ({
  fn: "iot-weather",
  defaultBody: { city, mode },
  label: `${city} Weather`,
});

const NZ_WEATHER = (lat: number, lon: number, label: string): LiveSource => ({
  fn: "nz-weather",
  defaultBody: { latitude: lat, longitude: lon, days: 3 },
  label,
});

const FUEL: LiveSource = {
  fn: "nz-fuel-prices",
  defaultBody: {},
  label: "NZ Fuel Prices (live)",
};

const COMPLIANCE = (kete: string): LiveSource => ({
  fn: "nz-compliance-autoupdate",
  defaultBody: { dryRun: true, kete },
  label: `${kete.toUpperCase()} Compliance Pulse (24h)`,
});

const KB = (query: string, kete: string, label: string): LiveSource => ({
  fn: "ikb-search",
  defaultBody: { query, kete, limit: 4 },
  label,
});

const ROUTES = (origin: [number, number], destination: [number, number], label: string): LiveSource => ({
  fn: "nz-routes",
  defaultBody: {
    origin: { lat: origin[0], lon: origin[1] },
    destination: { lat: destination[0], lon: destination[1] },
  },
  label,
});

const FLEET: LiveSource = {
  fn: "iot-vehicle-tracking",
  defaultBody: { action: "fleet_status" },
  label: "Fleet Status",
};

const DRIVERS: LiveSource = {
  fn: "iot-vehicle-tracking",
  defaultBody: { action: "driver_scores" },
  label: "Driver Scores",
};

const FREIGHT: LiveSource = {
  fn: "iot-freight-tracking",
  defaultBody: { action: "track", tracking_code: "DEMO" },
  label: "Freight Tracker",
};

const SITE_CONDITIONS = (lat = -36.85, lon = 174.76): LiveSource => ({
  fn: "iot-construction",
  defaultBody: { action: "site_conditions", lat, lon },
  label: "Site Conditions",
});

const MATERIALS: LiveSource = {
  fn: "iot-construction",
  defaultBody: { action: "material_prices" },
  label: "MBIE Material Prices",
};

const NDVI: LiveSource = {
  fn: "iot-agri-satellite",
  defaultBody: { action: "ndvi" },
  label: "Crop Health (NDVI)",
};

const MARINE_WEATHER = (lat: number, lon: number, label: string): LiveSource => ({
  fn: "marine-weather",
  defaultBody: { latitude: lat, longitude: lon },
  label,
});

// Common NZ coordinates
const AKL: [number, number] = [-36.8485, 174.7633];
const WLG: [number, number] = [-41.2865, 174.7762];
const CHC: [number, number] = [-43.5320, 172.6362];
const TAUR: [number, number] = [-37.6833, 176.1833];
const HAM: [number, number] = [-37.7870, 175.2793];
const QTN: [number, number] = [-45.0312, 168.6626];

// ═══════════════════════════════════════════════════════════════
// AGENT → LIVE DATA MAP
// Every agent gets at least 2 live feeds: usually weather +
// compliance pulse, plus one or two domain-specific signals.
// ═══════════════════════════════════════════════════════════════
export const AGENT_LIVE_DATA_MAP: Record<string, LiveSource[]> = {
  // ── MANAAKI / Hospitality ─────────────────────────────────────
  aura: [WEATHER("Auckland", "both"), COMPLIANCE("manaaki"), KB("Food Act 2014 FCP allergen separation", "manaaki", "Food Safety KB")],
  saffron: [WEATHER("Wellington", "both"), KB("liquor licensing duty manager NZ", "manaaki", "Liquor Licensing KB"), COMPLIANCE("manaaki")],
  cellar: [KB("Sale Supply Alcohol Act host responsibility", "manaaki", "Host Responsibility KB"), COMPLIANCE("manaaki")],
  luxe: [WEATHER("Queenstown", "both"), KB("luxury hospitality NZ guest experience", "manaaki", "Premium Hospitality KB")],
  moana: [WEATHER("Tauranga", "both"), MARINE_WEATHER(TAUR[0], TAUR[1], "Tauranga Marine"), KB("waterfront hospitality biosecurity", "manaaki", "Waterfront KB")],
  coast: [WEATHER("Napier", "both"), KB("regional tourism NZ winery hospitality", "manaaki", "Coastal Tourism KB")],
  kura: [WEATHER("Rotorua", "both"), KB("cultural tourism manaakitanga visitor", "manaaki", "Cultural Tourism KB")],
  pau: [WEATHER("Auckland", "current"), KB("commercial kitchen H&S worker safety NZ", "manaaki", "Kitchen Safety KB")],
  summit: [WEATHER("Queenstown", "both"), KB("alpine adventure tourism risk NZ", "manaaki", "Adventure Tourism KB")],
  menu: [KB("menu engineering allergen labelling NZ", "manaaki", "Menu Compliance KB"), COMPLIANCE("manaaki")],

  // ── WAIHANGA / Construction ───────────────────────────────────
  ata: [SITE_CONDITIONS(...AKL), MATERIALS, COMPLIANCE("waihanga")],
  arc: [SITE_CONDITIONS(...AKL), MATERIALS, KB("construction H&S WorkSafe height", "waihanga", "Construction H&S KB")],
  arai: [KB("WorkSafe height work scaffolding NZ", "waihanga", "Height Safety KB"), COMPLIANCE("waihanga")],
  kaupapa: [KB("CCA 2002 retentions trust account NZ", "waihanga", "CCA Trust KB"), COMPLIANCE("waihanga")],
  rawa: [MATERIALS, KB("MBIE construction material prices NZ", "waihanga", "Materials Pricing KB")],
  whakaaē: [KB("LBP licensed building practitioner NZ", "waihanga", "LBP Rules KB"), COMPLIANCE("waihanga")],
  pai: [SITE_CONDITIONS(...HAM), KB("subcontractor compliance management NZ", "waihanga", "Subbie Mgmt KB")],
  terra: [SITE_CONDITIONS(...AKL), KB("groundworks consent RMA earthworks", "waihanga", "Groundworks KB")],
  pinnacle: [SITE_CONDITIONS(...QTN), KB("commercial construction NZ standards", "waihanga", "Commercial Build KB")],

  // ── AUAHA / Creative & Media ──────────────────────────────────
  prism: [KB("ASA NZ advertising codes", "auaha", "ASA Codes KB"), COMPLIANCE("auaha")],
  muse: [KB("creative brief NZ brand strategy", "auaha", "Brand Strategy KB")],
  pixel: [KB("visual design NZ brand", "auaha", "Visual Design KB")],
  verse: [KB("copywriting NZ Fair Trading Act", "auaha", "Copy Compliance KB"), COMPLIANCE("auaha")],
  echo: [KB("social media content NZ ASA", "auaha", "Social Media KB"), COMPLIANCE("auaha")],
  flux: [KB("sales intelligence Challenger SPIN NZ", "auaha", "Sales Intel KB")],
  chromatic: [KB("colour theory brand identity NZ", "auaha", "Colour KB")],
  rhythm: [KB("video production NZ broadcasting", "auaha", "Video KB")],
  market: [KB("marketing automation NZ Privacy Act", "auaha", "Marketing Automation KB"), COMPLIANCE("auaha")],

  // ── PAKIHI / Business & Commerce ──────────────────────────────
  ledger: [KB("NZ tax IRD GST PAYE", "pakihi", "IRD/Tax KB"), COMPLIANCE("pakihi")],
  vault: [KB("NZ accounting Xero MYOB compliance", "pakihi", "Accounting KB"), COMPLIANCE("pakihi")],
  catalyst: [KB("NZ Companies Act director duties", "pakihi", "Corporate Governance KB"), COMPLIANCE("pakihi")],
  compass: [KB("NZ business strategy market intelligence", "pakihi", "Strategy KB")],
  haven: [KB("NZ property landlord Healthy Homes", "pakihi", "Property Compliance KB"), COMPLIANCE("pakihi"), WEATHER("Auckland", "current")],
  counter: [KB("NZ retail Consumer Guarantees Act", "pakihi", "Retail Compliance KB"), COMPLIANCE("pakihi")],
  gateway: [KB("NZ ecommerce Privacy Act payment", "pakihi", "Ecommerce KB"), COMPLIANCE("pakihi")],
  harvest: [NDVI, NZ_WEATHER(...HAM, "Waikato Farm Weather"), KB("NZ farming MPI biosecurity", "pakihi", "Agri Compliance KB")],
  grove: [NDVI, NZ_WEATHER(-41.2706, 173.2840, "Marlborough Vineyard Weather"), KB("NZ viticulture WSMP", "pakihi", "Viticulture KB")],
  sage: [KB("NZ professional services advisory", "pakihi", "Advisory KB")],
  ascend: [KB("NZ leadership coaching development", "pakihi", "Leadership KB")],

  // ── WAKA / Transport & Vehicles (legacy fleet) ────────────────
  motor: [FLEET, DRIVERS, FUEL],
  transit: [FLEET, FUEL, ROUTES(AKL, WLG, "AKL → WLG live route")],
  mariner: [MARINE_WEATHER(TAUR[0], TAUR[1], "Tauranga Marine"), { fn: "iot-ais-tracking", defaultBody: { action: "nearby_vessels", port: "tauranga" }, label: "AIS Vessels Near Tauranga" }],

  // ── ARATAKI / Automotive ──────────────────────────────────────
  axis: [FLEET, DRIVERS, FUEL, COMPLIANCE("arataki")],
  drive: [FLEET, ROUTES(AKL, [-39.4928, 176.9120], "AKL → Napier route"), FUEL],
  "flux-arataki": [FUEL, KB("NZ EV charging fleet electrification", "arataki", "EV Fleet KB")],
  "axis-fleet": [FLEET, DRIVERS, KB("NZ Land Transport Act fleet driver fatigue", "arataki", "Fleet Compliance KB"), COMPLIANCE("arataki")],

  // ── HANGARAU / Technology ─────────────────────────────────────
  spark: [KB("NZ Privacy Act 2020 breach notification", "hangarau", "Privacy Act KB"), COMPLIANCE("hangarau")],
  sentinel: [KB("NZ NCSC cybersecurity advisories", "hangarau", "NCSC Security KB"), COMPLIANCE("hangarau")],
  "nexus-t": [KB("NZ data sovereignty cloud hosting", "hangarau", "Data Sovereignty KB")],
  cipher: [KB("NZ encryption cryptography standards", "hangarau", "Crypto Standards KB")],
  relay: [KB("NZ telecommunications TCF code", "hangarau", "Telco KB")],
  matrix: [KB("NZ AI governance MBIE Responsible AI", "hangarau", "AI Governance KB"), COMPLIANCE("hangarau")],
  forge: [KB("NZ software development delivery agile", "hangarau", "Engineering KB")],
  oracle: [KB("NZ data analytics BI", "hangarau", "Data Analytics KB")],
  ember: [KB("NZ startup accelerator funding", "hangarau", "Startup Funding KB")],
  reef: [KB("NZ deep tech R&D Callaghan grants", "hangarau", "R&D Funding KB")],
  patent: [KB("NZ IP patent IPONZ trademark", "hangarau", "IP/IPONZ KB"), COMPLIANCE("hangarau")],
  foundry: [KB("NZ hardware manufacturing electronics", "hangarau", "Hardware Mfg KB")],

  // ── HAUORA / Health, Wellbeing, Sport, Lifestyle ──────────────
  turf: [WEATHER("Auckland", "both"), KB("NZ sports event safety H&S", "hauora", "Sports Event KB")],
  league: [WEATHER("Wellington", "both"), KB("NZ team sport coaching pathway", "hauora", "Team Sport KB")],
  vitals: [KB("NZ Te Whatu Ora Healthy Homes", "hauora", "Health Standards KB"), COMPLIANCE("hauora")],
  remedy: [KB("NZ ACC injury rehabilitation", "hauora", "ACC Rehab KB"), COMPLIANCE("hauora")],
  vitae: [KB("NZ HQSC patient safety triage", "hauora", "HQSC Safety KB")],
  radiance: [KB("NZ beauty cosmetic Medsafe", "hauora", "Cosmetic Safety KB"), COMPLIANCE("hauora")],
  palette: [KB("NZ wellness mental health support", "hauora", "Wellbeing KB")],
  odyssey: [WEATHER("Queenstown", "both"), NZ_WEATHER(...QTN, "Queenstown 3-day Forecast"), KB("NZ adventure tourism risk", "hauora", "Adventure Risk KB")],

  // ── TE KĀHUI REO / Māori Business Intelligence ────────────────
  whanau: [KB("NZ whanau ora Māori health", "te-kahui-reo", "Whānau Ora KB")],
  rohe: [KB("NZ iwi rohe regional Māori", "te-kahui-reo", "Iwi/Rohe KB")],
  "kaupapa-m": [KB("NZ kaupapa Māori principles tikanga", "te-kahui-reo", "Kaupapa Māori KB")],
  "mana-bi": [KB("NZ Māori business Te Puni Kōkiri", "te-kahui-reo", "Māori Business KB")],
  kaitiaki: [KB("NZ kaitiakitanga environmental Māori", "te-kahui-reo", "Kaitiakitanga KB")],
  taura: [KB("NZ Te Tiriti partnership obligations", "te-kahui-reo", "Te Tiriti KB")],
  whakaaro: [KB("NZ Māori advisory tikanga business", "te-kahui-reo", "Tikanga Advisory KB")],
  hiringa: [KB("NZ Māori energy economy enterprise", "te-kahui-reo", "Māori Economy KB")],

  // ── TORO / Family Navigator ───────────────────────────────────
  toroa: [WEATHER("Auckland", "current"), KB("NZ family household childcare logistics", "toroa", "Family Life KB")],

  // ── CORE agents (cross-kete) ──────────────────────────────────
  charter: [KB("NZ business compliance multi-jurisdiction", "pakihi", "Cross-Compliance KB"), COMPLIANCE("pakihi")],
  arbiter: [KB("NZ dispute resolution Disputes Tribunal", "pakihi", "Dispute Resolution KB")],
  shield: [KB("NZ Privacy Act breach response", "hangarau", "Breach Response KB"), COMPLIANCE("hangarau")],
  anchor: [KB("NZ charities Charities Services", "pakihi", "Charities KB"), COMPLIANCE("pakihi")],
  aroha: [KB("NZ wellbeing caregiver burnout support", "hauora", "Caregiver Support KB")],
  pulse: [WEATHER("Auckland", "current"), KB("NZ business pulse intelligence", "pakihi", "Business Pulse KB")],
  scholar: [KB("NZ research evidence academic", "hangarau", "Research KB")],
  nova: [KB("NZ innovation R&D Callaghan", "hangarau", "Innovation KB")],
  pilot: [WEATHER("Auckland", "current"), FUEL, COMPLIANCE("pakihi"), KB("NZ founder operations", "pakihi", "Founder Ops KB")],

  // ── Legacy agent IDs used by ChatPage ─────────────────────────
  hospitality: [WEATHER("Queenstown", "both"), COMPLIANCE("manaaki"), KB("NZ hospitality Food Act", "manaaki", "Hospitality KB")],
  agriculture: [NDVI, NZ_WEATHER(...HAM, "Waikato Farm Weather"), KB("NZ MPI biosecurity farm", "pakihi", "Agri KB")],
  sports: [WEATHER("Auckland", "both"), KB("NZ sport event H&S", "hauora", "Sport Safety KB")],
  maritime: [MARINE_WEATHER(TAUR[0], TAUR[1], "Tauranga Marine"), { fn: "iot-ais-tracking", defaultBody: { action: "nearby_vessels", port: "auckland" }, label: "AIS Vessels Near Auckland" }, COMPLIANCE("pikau")],
  pm: [FREIGHT, ROUTES(AKL, CHC, "AKL → CHC freight route"), KB("NZ Customs MPI biosecurity import", "pikau", "Customs KB")],
  automotive: [FLEET, DRIVERS, FUEL, COMPLIANCE("arataki")],
  construction: [SITE_CONDITIONS(...AKL), MATERIALS, COMPLIANCE("waihanga")],
};

// AIS WebSocket tracker — stays separate (uses streaming, not invoke)
export const AIS_AGENTS = ["maritime", "pm", "moana", "mariner", "transit"];
