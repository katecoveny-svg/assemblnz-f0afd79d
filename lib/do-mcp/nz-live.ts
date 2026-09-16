import 'server-only';

import {
  NZ_LIVE_TOOLS,
  resolveNzLiveToolStatus,
  type NzLiveToolDef,
} from '@/apps/do/shared/nz-live-pack';

function supabaseFnBase(): { url: string; key: string | null } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) return null;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
    || process.env.SUPABASE_ANON_KEY?.trim()
    || null;
  return { url: url.replace(/\/$/, ''), key };
}

async function invokeEdge(
  name: string,
  body: Record<string, unknown>,
): Promise<{ ok: true; detail: Record<string, unknown> } | { ok: false; error: string }> {
  const base = supabaseFnBase();
  if (!base) return { ok: false, error: 'NEXT_PUBLIC_SUPABASE_URL is not configured' };
  try {
    const res = await fetch(`${base.url}/functions/v1/${name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(base.key
          ? { Authorization: `Bearer ${base.key}`, apikey: base.key }
          : {}),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
    });
    const text = await res.text().catch(() => '');
    let parsed: Record<string, unknown> = {};
    try {
      parsed = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      parsed = { raw: text.slice(0, 400) };
    }
    if (!res.ok) {
      const msg =
        typeof parsed.error === 'string'
          ? parsed.error
          : text.slice(0, 160) || `HTTP ${res.status}`;
      return { ok: false, error: `${name}: ${msg}` };
    }
    return { ok: true, detail: { function: name, response: parsed } };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : `${name} failed` };
  }
}

async function fetchPublicJson(url: string): Promise<{ ok: true; detail: Record<string, unknown> } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json, application/rss+xml, text/xml, */*' },
      signal: AbortSignal.timeout(15_000),
      cache: 'no-store',
    });
    const text = await res.text().catch(() => '');
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    try {
      return { ok: true, detail: { url, response: JSON.parse(text) as unknown } };
    } catch {
      return { ok: true, detail: { url, response: { raw: text.slice(0, 4000) } } };
    }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'fetch failed' };
  }
}

function toolById(toolId: string): NzLiveToolDef | undefined {
  return NZ_LIVE_TOOLS.find((tool) => tool.toolId === toolId);
}

export function listNzLiveToolStatuses() {
  return NZ_LIVE_TOOLS.map((tool) => ({
    toolId: tool.toolId,
    label: tool.label,
    purpose: tool.purpose,
    status: resolveNzLiveToolStatus(tool),
    envKeys: tool.envKeys,
    edgeFunction: tool.edgeFunction,
    upstream: tool.upstream,
  }));
}

/**
 * Run an NZ Live tool. Never invents traffic or keyed success.
 */
export async function runNzLiveTool(
  toolId: string,
  args: Record<string, unknown> = {},
): Promise<{ ok: true; detail: Record<string, unknown> } | { ok: false; error: string; statusHint?: string }> {
  const tool = toolById(toolId);
  if (!tool) return { ok: false, error: `Unknown NZ Live tool: ${toolId}` };

  const status = resolveNzLiveToolStatus(tool);
  if (status === 'stub') {
    return {
      ok: false,
      error: `${tool.label} is stubbed. ${tool.upstream ? `See ${tool.upstream}` : 'Not implemented.'}`,
      statusHint: 'stub',
    };
  }
  if (status === 'needs_key') {
    return {
      ok: false,
      error: `${tool.label} needs ${tool.envKeys.join(', ')} (set in Supabase secrets / env). Not configured here.`,
      statusHint: 'needs_key',
    };
  }

  switch (toolId) {
    case 'at_bus_positions':
      return invokeEdge('bus-positions', {
        route_ids: args.route_ids ?? args.routeIds ?? undefined,
      });
    case 'nz_weather_forecast': {
      const latitude = Number(args.latitude ?? args.lat ?? -36.8485);
      const longitude = Number(args.longitude ?? args.lon ?? 174.7633);
      return invokeEdge('nz-weather', { latitude, longitude, days: Number(args.days ?? 3) });
    }
    case 'nz_marine_weather':
      return invokeEdge('marine-weather', {
        region: typeof args.region === 'string' ? args.region : 'auckland',
        lat: args.lat,
        lon: args.lon,
      });
    case 'nzbn_search':
      return invokeEdge('mcp-nz-govt', {
        action: 'nzbn_search',
        query: String(args.query ?? args.q ?? '').slice(0, 200),
        limit: Number(args.limit ?? 5),
      });
    case 'geonet_quakes':
      return fetchPublicJson('https://api.geonet.org.nz/quake?MMI=3');
    case 'geonet_news':
      return fetchPublicJson('https://api.geonet.org.nz/news/geonet');
    case 'parliament_bills':
      // adapter-parliament is KB-tick shaped; use public bills search directly.
      return fetchPublicJson(
        `https://bills.parliament.nz/api/data/search?${new URLSearchParams({
          search: String(args.query ?? args.q ?? 'bill').slice(0, 80),
          limit: String(Math.min(Number(args.limit ?? 5), 20)),
        }).toString()}`,
      );
    case 'beehive_releases':
      return fetchPublicJson('https://www.beehive.govt.nz/rss.xml');
    case 'nz_news_rss':
      return invokeEdge('mcp-news', {
        action: 'rss_feed',
        source: typeof args.source === 'string' ? args.source : 'rnz',
        limit: Number(args.limit ?? 8),
      });
    case 'nz_news_search':
      return invokeEdge('mcp-news', {
        action: 'search_news',
        query: String(args.query ?? args.q ?? '').slice(0, 120),
        limit: Number(args.limit ?? 8),
      });
    case 'pco_legislation':
      return invokeEdge('mcp-nz-govt', {
        action: 'legislation_search',
        query: String(args.query ?? args.q ?? '').slice(0, 120),
        limit: Number(args.limit ?? 5),
      });
    case 'nz_fuel_prices':
      return invokeEdge('nz-fuel-prices', {});
    case 'waka_kotahi_traffic':
      return {
        ok: false,
        error: 'Waka Kotahi traffic is not wired. See https://www.nzta.govt.nz/about-us/about-this-site/use-our-data/',
        statusHint: 'stub',
      };
    case 'metservice_alerts':
      return {
        ok: false,
        error: 'MetService alerts pending METSERVICE_API_KEY / official API. Use nz_weather_forecast (Open-Meteo) for conditions.',
        statusHint: 'stub',
      };
    default:
      return { ok: false, error: `NZ Live tool not implemented: ${toolId}` };
  }
}
