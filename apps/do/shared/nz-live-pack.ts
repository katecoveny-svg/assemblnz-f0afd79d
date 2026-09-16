/**
 * NZ Live — first-class DO toolkit for Aotearoa public / open data.
 *
 * Prefer existing Assembl edge functions over new clients.
 * Status is honest: live | needs_key | stub — never fake traffic or keys.
 */

export type NzLiveToolStatus = 'live' | 'needs_key' | 'stub';

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
    purpose: 'Parliamentary Counsel Office legislation API via adapter-pco / mcp-nz-govt.',
    edgeFunction: 'adapter-pco',
    envKeys: ['PCO_API_KEY'],
    baseStatus: 'needs_key',
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

export function resolveNzLiveToolStatus(tool: NzLiveToolDef): NzLiveToolStatus {
  if (tool.baseStatus === 'stub') return 'stub';
  if (tool.baseStatus === 'live' && tool.envKeys.length === 0) return 'live';
  const missing = tool.envKeys.filter((key) => !process.env[key]?.trim());
  if (missing.length) return 'needs_key';
  return tool.baseStatus === 'needs_key' ? 'live' : tool.baseStatus;
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
