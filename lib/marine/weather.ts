/**
 * MetService marine forecast retrieval — ported from the paused edge function
 * (supabase/functions/marine-weather/index.ts: REGIONS + fetchMetServicePage +
 * extractMarineData) so the mariner community agent can read live conditions
 * from the Next.js runtime with no database in the loop.
 *
 * Posture: fail-soft everywhere. A short fetch timeout, a ~15-minute
 * in-memory cache per region, and null on any failure — the chat route says
 * nothing extra when this returns null (the agent is already instructed to
 * tell users to check the forecast themselves).
 *
 * Server-only usage (route handlers); plain module so it stays testable.
 */

export interface MarineRegion {
  name: string;
  url: string;
}

/** MetService marine forecast regions — same map as the edge function. */
export const MARINE_REGIONS: Record<string, MarineRegion> = {
  auckland: { name: 'Auckland / Hauraki Gulf', url: 'https://www.metservice.com/marine/regions/auckland-north' },
  northland: { name: 'Northland', url: 'https://www.metservice.com/marine/regions/northland' },
  coromandel: { name: 'Coromandel', url: 'https://www.metservice.com/marine/regions/coromandel' },
  bay_of_plenty: { name: 'Bay of Plenty', url: 'https://www.metservice.com/marine/regions/bay-of-plenty' },
  waikato: { name: 'Waikato / West Coast', url: 'https://www.metservice.com/marine/regions/waikato' },
  taranaki: { name: 'Taranaki', url: 'https://www.metservice.com/marine/regions/taranaki' },
  wellington: { name: 'Wellington / Cook Strait', url: 'https://www.metservice.com/marine/regions/wellington' },
  marlborough: { name: 'Marlborough Sounds', url: 'https://www.metservice.com/marine/regions/marlborough' },
  canterbury: { name: 'Canterbury', url: 'https://www.metservice.com/marine/regions/canterbury' },
  otago: { name: 'Otago', url: 'https://www.metservice.com/marine/regions/otago' },
  southland: { name: 'Southland / Fiordland', url: 'https://www.metservice.com/marine/regions/southland' },
  east_cape: { name: 'East Cape / Gisborne', url: 'https://www.metservice.com/marine/regions/east-cape' },
  hawkes_bay: { name: "Hawke's Bay", url: 'https://www.metservice.com/marine/regions/hawkes-bay' },
  west_coast: { name: 'West Coast (SI)', url: 'https://www.metservice.com/marine/regions/west-coast' },
};

export const DEFAULT_MARINE_REGION = 'auckland';

/**
 * Keyword → region resolution for chat messages. Place-name matching runs on
 * diacritic-stripped lowercase text, so "Kaikōura" and "kaikoura" both hit.
 * First match wins; null when nothing matches (caller decides the default).
 */
const REGION_KEYWORDS: Array<[region: string, keywords: string[]]> = [
  ['northland', ['northland', 'bay of islands', 'whangarei', 'doubtless bay', 'hokianga']],
  ['coromandel', ['coromandel', 'whitianga', 'whangamata', 'mercury bay']],
  ['bay_of_plenty', ['bay of plenty', 'tauranga', 'whakatane', 'motiti', 'mayor island']],
  ['east_cape', ['east cape', 'gisborne', 'tairawhiti', 'tolaga']],
  ['hawkes_bay', ['hawke', 'napier', 'hastings', 'mahia']],
  ['taranaki', ['taranaki', 'new plymouth']],
  ['wellington', ['wellington', 'cook strait', 'kapiti', 'mana island']],
  ['marlborough', ['marlborough', 'pelorus', 'queen charlotte', 'picton', 'the sounds']],
  ['canterbury', ['canterbury', 'christchurch', 'kaikoura', 'akaroa', 'banks peninsula']],
  ['otago', ['otago', 'dunedin', 'moeraki']],
  ['southland', ['southland', 'fiordland', 'stewart island', 'bluff', 'foveaux', 'invercargill']],
  ['west_coast', ['west coast', 'greymouth', 'hokitika', 'westport']],
  ['waikato', ['raglan', 'kawhia', 'manukau bar']],
  ['auckland', ['auckland', 'hauraki', 'waitemata', 'waiheke', 'great barrier', 'kawau', 'tamaki strait']],
];

export function resolveMarineRegion(text: string): string | null {
  const hay = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  for (const [region, keywords] of REGION_KEYWORDS) {
    if (keywords.some((k) => hay.includes(k))) return region;
  }
  return null;
}

const FETCH_TIMEOUT_MS = 5000;

async function fetchMetServicePage(url: string): Promise<string> {
  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AssemblBot/1.0)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: 'no-store',
    });
    if (!resp.ok) return '';
    return await resp.text();
  } catch {
    return '';
  }
}

/** Text-scrape the forecast content out of a MetService region page. */
export function extractMarineData(html: string): string {
  if (!html) return '';

  const sections: string[] = [];

  // Forecast blocks — common MetService patterns.
  const forecastMatches = html.match(/<div[^>]*class="[^"]*forecast[^"]*"[^>]*>([\s\S]*?)<\/div>/gi) ?? [];
  for (const match of forecastMatches) {
    const text = match.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length > 20) sections.push(text);
  }

  // Paragraphs that read like weather.
  const pMatches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) ?? [];
  for (const match of pMatches) {
    const text = match.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length > 30 && /wind|swell|sea|wave|knot|rain|cloud|fine|gale|storm|temp|press|tide/i.test(text)) {
      sections.push(text);
    }
  }

  // Table cells (tide times etc.).
  const tdMatches = html.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) ?? [];
  const tableData: string[] = [];
  for (const match of tdMatches) {
    const text = match.replace(/<[^>]+>/g, '').trim();
    if (text && text.length < 100) tableData.push(text);
  }
  if (tableData.length > 0) {
    sections.push(`Data points: ${tableData.slice(0, 40).join(' | ')}`);
  }

  // Structured data blocks, when present.
  const scriptMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  for (const match of scriptMatches) {
    const json = match.replace(/<[^>]+>/g, '').trim();
    if (json.length > 10 && json.length < 5000) {
      try {
        const parsed = JSON.parse(json) as unknown;
        sections.push(`Structured data: ${JSON.stringify(parsed).substring(0, 500)}`);
      } catch {
        /* skip */
      }
    }
  }

  return sections.slice(0, 20).join('\n\n');
}

export interface MarineForecast {
  regionKey: string;
  regionName: string;
  text: string;
  fetchedAt: Date;
}

const CACHE_TTL_MS = 15 * 60 * 1000;
const cache = new Map<string, MarineForecast>();

/**
 * Live marine forecast for a region key (falls back to Auckland for unknown
 * keys). ~15-minute in-memory cache; null on any fetch/extract failure.
 */
export async function getMarineForecast(regionKey: string): Promise<MarineForecast | null> {
  const key = MARINE_REGIONS[regionKey] ? regionKey : DEFAULT_MARINE_REGION;
  const region = MARINE_REGIONS[key];

  const cached = cache.get(key);
  if (cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS) return cached;

  try {
    const html = await fetchMetServicePage(region.url);
    const text = extractMarineData(html);
    if (!text) return null;
    const forecast: MarineForecast = {
      regionKey: key,
      regionName: region.name,
      text,
      fetchedAt: new Date(),
    };
    cache.set(key, forecast);
    return forecast;
  } catch {
    return null;
  }
}
