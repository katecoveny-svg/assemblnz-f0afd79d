import 'server-only';
import { z } from 'zod';

/** Public national feed only. Never construct this URL from user context. */
export const NZTA_EVENTS_URL = 'https://trafficnz.info/service/traffic/rest/4/events/all/10';
export const NZTA_TRAFFIC_SOURCE = {
  id: 'nzta-traffic',
  name: 'NZ Transport Agency Waka Kotahi',
  url: 'https://www.journeys.nzta.govt.nz/highway-conditions/traffic-and-travel-list-view',
  documentationUrl: 'https://www.nzta.govt.nz/about-us/our-data-and-official-information/use-our-data/about-the-apis',
  termsUrl: 'https://www.nzta.govt.nz/about-us/our-data-and-official-information/use-our-data/terms-of-use',
  scope: 'Notable state-highway events verified by NZTA or another official source. Check the relevant council for local roads.',
  attribution: 'Traffic information supplied by NZ Transport Agency Waka Kotahi.',
  chargingNote: 'The underlying NZTA travel information is free. Any DO charge is for added functionality, not access to this information.',
} as const;

const optionalText = z.string().max(20_000).nullish();
const eventSchema = z.object({
  id: z.number().int().nonnegative(),
  eventDescription: z.string().max(2_000),
  locationArea: z.string().max(2_000),
  eventType: optionalText,
  impact: optionalText,
  status: optionalText,
  planned: z.boolean().nullish(),
  region: z.object({ id: z.number().int(), name: z.string().max(200) }),
  eventComments: optionalText,
  alternativeRoute: optionalText,
  startDate: optionalText,
  endDate: optionalText,
  eventModified: optionalText,
});

export type NztaRoadEvent = z.infer<typeof eventSchema>;
export type NztaTrafficSnapshot = {
  source: typeof NZTA_TRAFFIC_SOURCE;
  status: 'available' | 'unavailable';
  freshness: 'fresh' | 'unavailable';
  checkedAt: string;
  fetchedAt: string | null;
  /** No server/browser/CDN content cache or old-data fallback is used. */
  cachedAt: null;
  cachePolicy: 'no-store';
  suggestedRefreshAfter: string | null;
  events: NztaRoadEvent[];
  message: string;
};

/** Reject schema drift instead of quietly dropping hazards and implying clear roads. */
export function parseNztaEvents(raw: unknown): NztaRoadEvent[] {
  const parsed = z.object({ response: z.union([
    z.literal(''),
    z.object({ roadevent: z.union([eventSchema, z.array(eventSchema).max(2_000)]) }),
  ]) }).parse(raw);
  if (parsed.response === '') return [];
  const events = parsed.response.roadevent;
  return Array.isArray(events) ? events : [events];
}

async function boundedJson(response: Response): Promise<unknown> {
  const maximumBytes = 2_000_000;
  if (Number(response.headers.get('content-length') || 0) > maximumBytes) throw new Error('response_too_large');
  const reader = response.body?.getReader();
  if (!reader) throw new Error('missing_body');
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maximumBytes) {
        await reader.cancel();
        throw new Error('response_too_large');
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}

/** No auth, private notes, addresses, cookies or client headers leave Assembl. */
export async function fetchNztaTraffic(options: {
  fetcher?: typeof fetch;
  now?: () => Date;
  signal?: AbortSignal;
} = {}): Promise<NztaTrafficSnapshot> {
  const now = options.now ?? (() => new Date());
  const base = {
    source: NZTA_TRAFFIC_SOURCE,
    cachedAt: null,
    cachePolicy: 'no-store',
  } as const;
  try {
    const timeout = AbortSignal.timeout(20_000);
    const response = await (options.fetcher ?? fetch)(NZTA_EVENTS_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      credentials: 'omit',
      redirect: 'error',
      signal: options.signal ? AbortSignal.any([timeout, options.signal]) : timeout,
    });
    if (!response.ok || !response.headers.get('content-type')?.toLowerCase().includes('application/json')) {
      throw new Error('source_unavailable');
    }
    const events = parseNztaEvents(await boundedJson(response));
    const fetched = now();
    return {
      ...base,
      status: 'available',
      freshness: 'fresh',
      checkedAt: fetched.toISOString(),
      fetchedAt: fetched.toISOString(),
      suggestedRefreshAfter: new Date(fetched.getTime() + 60_000).toISOString(),
      events,
      message: 'A current-source snapshot. Conditions can change; check NZTA before travelling. No listed event does not mean a road is clear.',
    };
  } catch {
    return {
      ...base,
      status: 'unavailable',
      freshness: 'unavailable',
      checkedAt: now().toISOString(),
      fetchedAt: null,
      suggestedRefreshAfter: null,
      events: [],
      message: 'NZTA traffic information could not be checked. Open the official Journey Planner for current conditions.',
    };
  }
}
