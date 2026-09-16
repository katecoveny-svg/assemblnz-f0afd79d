/**
 * NZ Live — first-class DO toolkit for Aotearoa public / open data.
 *
 * Prefer existing Assembl edge functions over new clients.
 * Status is honest: live | needs_key | stub — never fake traffic or keys.
 *
 * Named product toolkits (docs/UI): Travel NZ · Civic Watch · SME Compliance ·
 * Household Floor NZ · Property NZ · Hazard NZ · Energy & Cost · Media Pulse.
 *
 * Household grocery = consent browser-seat only — do NOT invent supermarket APIs.
 */

export type NzLiveToolStatus = 'live' | 'needs_key' | 'stub';

/**
 * Where the keyed secret lives for status / gating.
 * - next_or_edge: Next.js process.env must see the key (or status is needs_key)
 * - supabase_edge: single key path is the Supabase edge secret — DO must not invent
 *   a second Next-only key. Runtime calls the edge; status may probe edge when
 *   Next.js does not mirror the secret.
 */
export type NzLiveSecretScope = 'next_or_edge' | 'supabase_edge';

export type NzLiveNamedToolkitId =
  | 'travel_nz'
  | 'civic_watch'
  | 'sme_compliance'
  | 'household_floor_nz'
  | 'property_nz'
  | 'hazard_nz'
  | 'energy_cost'
  | 'media_pulse';

export type NzLiveNamedToolkit = {
  id: NzLiveNamedToolkitId;
  label: string;
  fit: string;
};

export const NZ_LIVE_NAMED_TOOLKITS: readonly NzLiveNamedToolkit[] = [
  {
    id: 'travel_nz',
    label: 'Travel NZ',
    fit: 'AT + Waka Kotahi Traffic & Travel + city transit parity (Metlink, Metro Chch).',
  },
  {
    id: 'civic_watch',
    label: 'Civic Watch',
    fit: 'Parliament, Beehive, PCO legislation, Stats NZ portal bookmarks.',
  },
  {
    id: 'sme_compliance',
    label: 'SME Compliance',
    fit: 'NZBN and legislation-aware SME lookups (keyed where required).',
  },
  {
    id: 'household_floor_nz',
    label: 'Household Floor NZ',
    fit: 'Floor-friendly NZ data seats. Grocery stays consent browser-seat — no invented supermarket APIs.',
  },
  {
    id: 'property_nz',
    label: 'Property NZ',
    fit: 'LINZ parcels/titles context (not ownership claims) + schools directory.',
  },
  {
    id: 'hazard_nz',
    label: 'Hazard NZ',
    fit: 'Civil Defence AlertHub CAP + GeoNet CAP/quakes + MetService CAP — unified hazard feeds.',
  },
  {
    id: 'energy_cost',
    label: 'Energy & Cost',
    fit: 'EA EMI ICP (power retailer by address) + MBIE fuel prices.',
  },
  {
    id: 'media_pulse',
    label: 'Media Pulse',
    fit: 'NZ news RSS / search headlines.',
  },
] as const;

export type NzLiveToolDef = {
  toolId: string;
  label: string;
  purpose: string;
  /** Edge function name when routed through Supabase; null = direct public API. */
  edgeFunction: string | null;
  /** Direct upstream when no edge fn / for docs. */
  upstream?: string;
  envKeys: readonly string[];
  /** Declared product status when env is present (or keyless). */
  baseStatus: NzLiveToolStatus;
  /** Default next_or_edge. PCO uses supabase_edge (same PCO_API_KEY as adapter-pco). */
  secretScope?: NzLiveSecretScope;
  namedToolkit: NzLiveNamedToolkitId;
  priority: 'p0' | 'p1' | 'shipped';
  sideEffect: 'none' | 'draft';
  approvalRequired: boolean;
};

export const NZ_LIVE_TOOLKIT = {
  id: 'nz_live' as const,
  label: 'NZ Live',
  fit: 'Aotearoa public data and open APIs a portable DO can see and use on the floor — travel, civic, hazards, property, energy, media.',
  docsPath: 'docs/do-templates/DO-NZ-LIVE.md',
  namedToolkits: NZ_LIVE_NAMED_TOOLKITS,
  groceryNote:
    'Household grocery = consent browser-seat only. Do not invent supermarket APIs.',
} as const;

export const NZ_LIVE_TOOLS: readonly NzLiveToolDef[] = [
  // ── Travel NZ ──────────────────────────────────────────────
  {
    toolId: 'at_bus_positions',
    label: 'Auckland Transport bus positions',
    purpose: 'Realtime vehicle locations (GTFS-realtime) via existing bus-positions edge function.',
    edgeFunction: 'bus-positions',
    upstream: 'https://api.at.govt.nz/realtime/legacy/vehiclelocations',
    envKeys: ['AT_API_KEY'],
    baseStatus: 'needs_key',
    namedToolkit: 'travel_nz',
    priority: 'shipped',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'waka_kotahi_traffic',
    label: 'Waka Kotahi road events',
    purpose:
      'NZTA Traffic & Travel REST v4 road events (no account). trafficnz.info — Accept application/json.',
    edgeFunction: null,
    upstream: 'https://trafficnz.info/service/traffic/rest/4/events/all/10',
    envKeys: [],
    baseStatus: 'live',
    namedToolkit: 'travel_nz',
    priority: 'p0',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'waka_kotahi_cameras',
    label: 'Waka Kotahi traffic cameras',
    purpose: 'NZTA Traffic & Travel REST v4 camera list (no account). Metadata only — not ownership of camera imagery rights beyond API terms.',
    edgeFunction: null,
    upstream: 'https://trafficnz.info/service/traffic/rest/4/cameras/all',
    envKeys: [],
    baseStatus: 'live',
    namedToolkit: 'travel_nz',
    priority: 'p0',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'metlink_transit',
    label: 'Metlink (Wellington) transit',
    purpose: 'Next city parity after AT — Metlink open transit. Stub until GTFS/realtime client is wired.',
    edgeFunction: null,
    upstream: 'https://www.metlink.org.nz/about/open-data/',
    envKeys: [],
    baseStatus: 'stub',
    namedToolkit: 'travel_nz',
    priority: 'p0',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'metro_chch_transit',
    label: 'Metro Christchurch transit',
    purpose: 'Next city parity after AT — Metro Chch open transit. Stub until GTFS/realtime client is wired.',
    edgeFunction: null,
    upstream: 'https://www.metroinfo.co.nz/',
    envKeys: [],
    baseStatus: 'stub',
    namedToolkit: 'travel_nz',
    priority: 'p0',
    sideEffect: 'none',
    approvalRequired: false,
  },

  // ── Hazard NZ ──────────────────────────────────────────────
  {
    toolId: 'civil_defence_alerthub',
    label: 'Civil Defence AlertHub CAP',
    purpose: 'NEMA / CDEM Emergency Mobile Alert CAP Atom feed (public). Prefer Accept: application/atom+xml.',
    edgeFunction: null,
    upstream: 'https://alerthub.civildefence.govt.nz/atom/pwp',
    envKeys: [],
    baseStatus: 'live',
    namedToolkit: 'hazard_nz',
    priority: 'p0',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'geonet_cap',
    label: 'GeoNet CAP quake alerts',
    purpose: 'GNS Science CAP Atom feed for earthquakes — pairs with AlertHub under Hazard NZ.',
    edgeFunction: null,
    upstream: 'https://api.geonet.org.nz/cap/1.2/GPA1.0/feed/atom1.0/quake',
    envKeys: [],
    baseStatus: 'live',
    namedToolkit: 'hazard_nz',
    priority: 'p0',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'metservice_cap',
    label: 'MetService CAP weather alerts',
    purpose: 'Public MetService CAP RSS (no MetService commercial API key). Separate from official MetService API stub.',
    edgeFunction: null,
    upstream: 'https://alerts.metservice.com/cap/rss',
    envKeys: [],
    baseStatus: 'live',
    namedToolkit: 'hazard_nz',
    priority: 'p0',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'hazard_cap_bundle',
    label: 'Hazard CAP bundle',
    purpose: 'Unified Hazard NZ pull: AlertHub + GeoNet CAP + MetService CAP in one receipt (public feeds).',
    edgeFunction: null,
    upstream: 'https://www.civildefence.govt.nz/cdem-sector/guidelines/common-alerting-protocol',
    envKeys: [],
    baseStatus: 'live',
    namedToolkit: 'hazard_nz',
    priority: 'p0',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'geonet_quakes',
    label: 'GeoNet quakes',
    purpose: 'Recent felt quakes from api.geonet.org.nz (public, no key).',
    edgeFunction: null,
    upstream: 'https://api.geonet.org.nz/quake?MMI=3',
    envKeys: [],
    baseStatus: 'live',
    namedToolkit: 'hazard_nz',
    priority: 'shipped',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'geonet_news',
    label: 'GeoNet news',
    purpose: 'GeoNet news feed (public JSON API).',
    edgeFunction: null,
    upstream: 'https://api.geonet.org.nz/news/geonet',
    envKeys: [],
    baseStatus: 'live',
    namedToolkit: 'hazard_nz',
    priority: 'shipped',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'metservice_alerts',
    label: 'MetService official alerts API',
    purpose: 'Official MetService API path pending METSERVICE_API_KEY — stub. Prefer metservice_cap (public CAP) for live warnings.',
    edgeFunction: 'mcp-weather',
    envKeys: ['METSERVICE_API_KEY'],
    baseStatus: 'stub',
    namedToolkit: 'hazard_nz',
    priority: 'shipped',
    sideEffect: 'none',
    approvalRequired: false,
  },

  // ── Civic Watch / SME ──────────────────────────────────────
  {
    toolId: 'nz_weather_forecast',
    label: 'NZ weather forecast',
    purpose: 'Current + daily forecast via Open-Meteo (nz-weather edge). MetService official API not wired — labelled Open-Meteo.',
    edgeFunction: 'nz-weather',
    upstream: 'https://api.open-meteo.com/v1/forecast',
    envKeys: [],
    baseStatus: 'live',
    namedToolkit: 'household_floor_nz',
    priority: 'shipped',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'nz_marine_weather',
    label: 'NZ marine weather',
    purpose: 'Marine forecast via marine-weather edge (Open-Meteo marine; MetService HTML links for context).',
    edgeFunction: 'marine-weather',
    envKeys: [],
    baseStatus: 'live',
    namedToolkit: 'household_floor_nz',
    priority: 'shipped',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'nzbn_search',
    label: 'NZBN search',
    purpose: 'New Zealand Business Number lookup via mcp-nz-govt → api.business.govt.nz. Honest needs_key until NZBN_API_KEY is in Supabase secrets.',
    edgeFunction: 'mcp-nz-govt',
    upstream: 'https://api.business.govt.nz/gateway/nzbn/v5/entities',
    envKeys: ['NZBN_API_KEY'],
    baseStatus: 'needs_key',
    namedToolkit: 'sme_compliance',
    priority: 'shipped',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'parliament_bills',
    label: 'Parliament bills search',
    purpose: 'Bills search via bills.parliament.nz (adapter-parliament / public API).',
    edgeFunction: 'adapter-parliament',
    upstream: 'https://bills.parliament.nz/api/data/search',
    envKeys: [],
    baseStatus: 'live',
    namedToolkit: 'civic_watch',
    priority: 'shipped',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'beehive_releases',
    label: 'Beehive releases',
    purpose: 'Government media releases via Beehive RSS.',
    edgeFunction: null,
    upstream: 'https://www.beehive.govt.nz/rss.xml',
    envKeys: [],
    baseStatus: 'live',
    namedToolkit: 'civic_watch',
    priority: 'shipped',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'pco_legislation',
    label: 'PCO legislation search',
    purpose:
      'Parliamentary Counsel Office legislation search via mcp-nz-govt (legislation_search). Same single secret PCO_API_KEY as adapter-pco KB ingest — no second key path.',
    edgeFunction: 'mcp-nz-govt',
    upstream: 'https://api.legislation.govt.nz/v0/works/',
    envKeys: ['PCO_API_KEY'],
    baseStatus: 'needs_key',
    secretScope: 'supabase_edge',
    namedToolkit: 'civic_watch',
    priority: 'shipped',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'stats_nz_portal',
    label: 'Stats NZ portal bookmark',
    purpose: 'Bookmark / deep-link helper for stats.govt.nz — schema documented; no invented scrape. Stub returns portal URLs only.',
    edgeFunction: null,
    upstream: 'https://www.stats.govt.nz/',
    envKeys: [],
    baseStatus: 'stub',
    namedToolkit: 'civic_watch',
    priority: 'p1',
    sideEffect: 'none',
    approvalRequired: false,
  },

  // ── Property NZ (P1) ───────────────────────────────────────
  {
    toolId: 'linz_wfs_parcels',
    label: 'LINZ Data Service WFS (parcels)',
    purpose: 'LINZ WFS parcels/titles context — NOT ownership claims. Stub until WFS client + attribution path ships.',
    edgeFunction: null,
    upstream: 'https://data.linz.govt.nz/',
    envKeys: [],
    baseStatus: 'stub',
    namedToolkit: 'property_nz',
    priority: 'p1',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'schools_directory',
    label: 'Schools directory (data.govt.nz)',
    purpose: 'NZ schools directory via data.govt.nz Datastore API. Stub until resource_id + datastore_search wired.',
    edgeFunction: null,
    upstream: 'https://catalogue.data.govt.nz/dataset/directory-of-educational-institutions',
    envKeys: [],
    baseStatus: 'stub',
    namedToolkit: 'property_nz',
    priority: 'p1',
    sideEffect: 'none',
    approvalRequired: false,
  },

  // ── Energy & Cost ──────────────────────────────────────────
  {
    toolId: 'ea_emi_icp',
    label: 'EA EMI ICP (power retailer)',
    purpose: 'Electricity Authority EMI ICP API — power retailer by address. Stub until EA access path is confirmed; no invented credentials.',
    edgeFunction: null,
    upstream: 'https://www.emi.ea.govt.nz/',
    envKeys: [],
    baseStatus: 'stub',
    namedToolkit: 'energy_cost',
    priority: 'p1',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'nz_fuel_prices',
    label: 'NZ fuel prices',
    purpose: 'MBIE weekly fuel prices via nz-fuel-prices edge (fallback labelled when scrape fails).',
    edgeFunction: 'nz-fuel-prices',
    envKeys: [],
    baseStatus: 'live',
    namedToolkit: 'energy_cost',
    priority: 'shipped',
    sideEffect: 'none',
    approvalRequired: false,
  },

  // ── Media Pulse ────────────────────────────────────────────
  {
    toolId: 'nz_news_rss',
    label: 'NZ news headlines (RSS)',
    purpose: 'RNZ/Stuff/Herald-style RSS via mcp-news rss_feed action (no NewsAPI key).',
    edgeFunction: 'mcp-news',
    envKeys: [],
    baseStatus: 'live',
    namedToolkit: 'media_pulse',
    priority: 'shipped',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'nz_news_search',
    label: 'NZ news search',
    purpose: 'NewsAPI-backed search via mcp-news — needs NEWSAPI_KEY.',
    edgeFunction: 'mcp-news',
    envKeys: ['NEWSAPI_KEY'],
    baseStatus: 'needs_key',
    namedToolkit: 'media_pulse',
    priority: 'shipped',
    sideEffect: 'none',
    approvalRequired: false,
  },
] as const;

/**
 * Sync status from Next.js env only.
 * For supabase_edge tools (PCO), if the secret is not mirrored into Next.js this
 * returns needs_key — callers that can probe the edge should prefer
 * `resolveNzLiveToolStatusWithEdgeHint` so production edge secrets count as live.
 */
export function resolveNzLiveToolStatus(tool: NzLiveToolDef): NzLiveToolStatus {
  if (tool.baseStatus === 'stub') return 'stub';
  if (tool.baseStatus === 'live' && tool.envKeys.length === 0) return 'live';
  const missing = tool.envKeys.filter((key) => !process.env[key]?.trim());
  if (missing.length) return 'needs_key';
  return tool.baseStatus === 'needs_key' ? 'live' : tool.baseStatus;
}

/**
 * Status with optional edge-live hint (e.g. mcp-nz-govt returned PCO provider + result).
 * Never requires reading or logging the raw secret.
 */
export function resolveNzLiveToolStatusWithEdgeHint(
  tool: NzLiveToolDef,
  edgeLiveByToolId?: Readonly<Record<string, boolean>>,
): NzLiveToolStatus {
  const sync = resolveNzLiveToolStatus(tool);
  if (sync === 'live' || sync === 'stub') return sync;
  if (tool.secretScope === 'supabase_edge' && edgeLiveByToolId?.[tool.toolId] === true) {
    return 'live';
  }
  return sync;
}

/** True when Next.js mirrors the secret — never log the value. */
export function nzLiveNextHasSecret(tool: NzLiveToolDef): boolean {
  return tool.envKeys.every((key) => Boolean(process.env[key]?.trim()));
}

/**
 * Scrubbed PCO live signal from mcp-nz-govt envelope — never includes API key material.
 * Live = Parliamentary Counsel Office provider + result payload (not search-URL fallback).
 */
export function pcoLegislationLooksLive(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') return false;
  const root = payload as Record<string, unknown>;
  const data =
    root.data && typeof root.data === 'object'
      ? (root.data as Record<string, unknown>)
      : root;
  if (data.provider !== 'Parliamentary Counsel Office') return false;
  if (!('result' in data) || data.result == null) return false;
  const note = typeof data.note === 'string' ? data.note.toLowerCase() : '';
  if (note.includes('not configured')) return false;
  return true;
}

export function toolsForNamedToolkit(id: NzLiveNamedToolkitId) {
  return NZ_LIVE_TOOLS.filter((tool) => tool.namedToolkit === id);
}

export function nzLiveAllowlistEntries() {
  return NZ_LIVE_TOOLS.map((tool) => ({
    provider: 'nz_live' as const,
    toolId: tool.toolId,
    label: tool.label,
    purpose: tool.purpose,
    sideEffect: tool.sideEffect,
    approvalRequired: tool.approvalRequired,
    required: false,
  }));
}
