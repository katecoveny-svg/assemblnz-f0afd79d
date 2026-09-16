/**
 * NZ Live — first-class DO toolkit for Aotearoa public / open data.
 *
 * Prefer existing Assembl edge functions over new clients.
 * Status is honest: live | needs_key | stub — never fake traffic or keys.
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
  sideEffect: 'none' | 'draft';
  approvalRequired: boolean;
};

export const NZ_LIVE_TOOLKIT = {
  id: 'nz_live' as const,
  label: 'NZ Live',
  fit: 'Aotearoa public data and open APIs a portable DO can see and use on the floor — transport, weather, business register, hazards, Parliament, fuel.',
  docsPath: 'docs/do-templates/DO-NZ-LIVE.md',
} as const;

export const NZ_LIVE_TOOLS: readonly NzLiveToolDef[] = [
  {
    toolId: 'at_bus_positions',
    label: 'Auckland Transport bus positions',
    purpose: 'Realtime vehicle locations (GTFS-realtime) via existing bus-positions edge function.',
    edgeFunction: 'bus-positions',
    upstream: 'https://api.at.govt.nz/realtime/legacy/vehiclelocations',
    envKeys: ['AT_API_KEY'],
    baseStatus: 'needs_key',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'nz_weather_forecast',
    label: 'NZ weather forecast',
    purpose: 'Current + daily forecast via Open-Meteo (nz-weather edge). MetService official API not wired — labelled Open-Meteo.',
    edgeFunction: 'nz-weather',
    upstream: 'https://api.open-meteo.com/v1/forecast',
    envKeys: [],
    baseStatus: 'live',
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
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'metservice_alerts',
    label: 'MetService alerts',
    purpose: 'Weather warnings. mcp-weather alerts path is pending MetService API key — stub until keyed.',
    edgeFunction: 'mcp-weather',
    envKeys: ['METSERVICE_API_KEY'],
    baseStatus: 'stub',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'nzbn_search',
    label: 'NZBN search',
    purpose: 'New Zealand Business Number lookup via mcp-nz-govt → api.business.govt.nz.',
    edgeFunction: 'mcp-nz-govt',
    upstream: 'https://api.business.govt.nz/gateway/nzbn/v5/entities',
    envKeys: ['NZBN_API_KEY'],
    baseStatus: 'needs_key',
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'waka_kotahi_traffic',
    label: 'Waka Kotahi traffic',
    purpose: 'NZTA open traffic/travel APIs — not implemented yet. Docs only; no fake live congestion.',
    edgeFunction: null,
    upstream: 'https://www.nzta.govt.nz/about-us/about-this-site/use-our-data/',
    envKeys: [],
    baseStatus: 'stub',
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
    sideEffect: 'none',
    approvalRequired: false,
  },
  {
    toolId: 'nz_news_rss',
    label: 'NZ news headlines (RSS)',
    purpose: 'RNZ/Stuff/Herald-style RSS via mcp-news rss_feed action (no NewsAPI key).',
    edgeFunction: 'mcp-news',
    envKeys: [],
    baseStatus: 'live',
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
