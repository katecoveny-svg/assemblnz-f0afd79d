import 'server-only';
import { z } from 'zod';
import {
  findNzWeatherPlace, geonetArticleSchema, type UpdatesSnapshot, type WeatherSnapshot,
} from '@/apps/do/personal/local-updates';

export const MET_FORECAST_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
export const GEONET_NEWS_URL = 'https://api.geonet.org.nz/news/geonet';
const USER_AGENT = 'assembl-personal-do/1.0 (+https://assembl.co.nz)';
const HOUR = 3_600_000;
const FALLBACK_CACHE_MS = 15 * 60_000;
const FAILURE_BACKOFF_MS = 60_000;
const timestamp = z.iso.datetime({ offset: true });
const precipitation = z.object({ details: z.object({ precipitation_amount: z.number().nonnegative().max(5000) }) });
const metSchema = z.object({
  properties: z.object({
    meta: z.object({ updated_at: timestamp, units: z.object({
      air_temperature: z.literal('celsius'), wind_speed: z.literal('m/s'), precipitation_amount: z.literal('mm'),
    }) }),
    timeseries: z.array(z.object({ time: timestamp, data: z.object({
      instant: z.object({ details: z.object({
        air_temperature: z.number().min(-100).max(70), wind_speed: z.number().nonnegative().max(277),
      }) }),
      next_1_hours: precipitation.optional(), next_6_hours: precipitation.optional(),
    }) })).min(1).max(500),
  }),
});
type MetForecast = z.infer<typeof metSchema>;

/** Validate units and shape before using any model values. Never relabel observations. */
export function parseMetForecast(raw: unknown): MetForecast { return metSchema.parse(raw); }
export function selectForecast(data: MetForecast, now: Date): WeatherSnapshot['forecast'] {
  const updated = Date.parse(data.properties.meta.updated_at);
  if (updated > now.getTime() + 5 * 60_000 || now.getTime() - updated > 24 * HOUR) throw new Error('old_model');
  const ordered = [...data.properties.timeseries].sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
  const points = ordered.filter(point => Date.parse(point.time) > now.getTime() - HOUR).slice(0, 6);
  if (!points.length || Date.parse(points[0].time) > now.getTime() + HOUR) throw new Error('no_current_forecast');
  return points.map(({ time, data: point }) => {
    const period = point.next_1_hours ?? point.next_6_hours;
    return {
      time,
      temperatureC: point.instant.details.air_temperature,
      windKmh: Math.round(point.instant.details.wind_speed * 36) / 10,
      precipitationMm: period?.details.precipitation_amount ?? null,
      precipitationHours: point.next_1_hours ? 1 : point.next_6_hours ? 6 : null,
    };
  });
}

/** Headlines are untrusted text. Links must be exact HTTPS official article URLs. */
export function parseGeonetNews(raw: unknown, now: Date): UpdatesSnapshot['articles'] {
  const { feed } = z.object({ feed: z.array(geonetArticleSchema).max(100) }).parse(raw);
  if (feed.some(article => Date.parse(article.published) > now.getTime() + 5 * 60_000)) throw new Error('future_article');
  return [...feed].sort((a, b) => Date.parse(b.published) - Date.parse(a.published)).slice(0, 10);
}

async function readJson(response: Response): Promise<unknown> {
  const maximumBytes = 1_000_000;
  if (!response.headers.get('content-type')?.toLowerCase().includes('application/json') ||
    Number(response.headers.get('content-length') || 0) > maximumBytes) throw new Error('invalid_response');
  const reader = response.body?.getReader();
  if (!reader) throw new Error('missing_body');
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maximumBytes) { await reader.cancel(); throw new Error('response_too_large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}

type CacheEntry<T> = { data: T; fetchedAt: string; checkedAt: string; expires: number; lastModified?: string; deprecated: boolean };

/** Fixed-key, bounded process cache + single-flight; never stores user context. */
export function createNzLocalUpdates(options: { fetcher?: typeof fetch; now?: () => Date } = {}) {
  const fetcher = options.fetcher ?? fetch;
  const now = options.now ?? (() => new Date());
  const weatherCache = new Map<string, CacheEntry<MetForecast>>();
  const weatherPending = new Map<string, Promise<WeatherSnapshot>>();
  const weatherRetryAfter = new Map<string, number>();
  let weatherBlockedUntil = 0;
  let newsCache: CacheEntry<UpdatesSnapshot['articles']> | undefined;
  let newsPending: Promise<UpdatesSnapshot> | undefined;
  let newsRetryAfter = 0;

  function expiry(response: Response, checked: Date): number {
    const expires = Date.parse(response.headers.get('expires') ?? '');
    // Do not hit the provider again before its Expires header. If absent/expired,
    // use a conservative 15-minute interval, never a tight client-driven poll.
    return Number.isFinite(expires) && expires > checked.getTime() ? expires : checked.getTime() + FALLBACK_CACHE_MS;
  }
  function get(url: string, accept: string, lastModified?: string) {
    return fetcher(url, {
      method: 'GET', headers: { Accept: accept, 'User-Agent': USER_AGENT, ...(lastModified ? { 'If-Modified-Since': lastModified } : {}) },
      cache: 'no-store', credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(15_000),
    });
  }
  function weatherUnavailable(placeId: string): WeatherSnapshot {
    return { source: 'met-norway', placeId, status: 'unavailable', freshness: 'unavailable',
      checkedAt: now().toISOString(), fetchedAt: null, validUntil: null, modelUpdatedAt: null, forecast: [],
      message: 'The forecast could not be checked, or the model is too old. Open MetService for current NZ weather and warnings.' };
  }
  function weatherResult(placeId: string, entry: CacheEntry<MetForecast>, freshness: WeatherSnapshot['freshness']): WeatherSnapshot {
    return { source: 'met-norway', placeId, status: 'available', freshness,
      checkedAt: entry.checkedAt, fetchedAt: entry.fetchedAt, validUntil: new Date(entry.expires).toISOString(),
      modelUpdatedAt: entry.data.properties.meta.updated_at, forecast: selectForecast(entry.data, now()),
      message: entry.deprecated
        ? 'This provider API is being retired. Check MetService; this source needs an application update.'
        : 'A city-centre model forecast, not an observation or a NZ severe-weather warning. Local conditions can differ.',
    };
  }
  async function loadWeather(placeId: string): Promise<WeatherSnapshot> {
    const place = findNzWeatherPlace(placeId);
    if (!place) throw new Error('invalid_place');
    const cached = weatherCache.get(placeId);
    try {
      if (cached && now().getTime() < cached.expires) return weatherResult(placeId, cached, 'cached');
      if (now().getTime() < Math.max(weatherRetryAfter.get(placeId) ?? 0, weatherBlockedUntil)) return weatherUnavailable(placeId);
      const url = `${MET_FORECAST_URL}?lat=${place.latitude}&lon=${place.longitude}`;
      const response = await get(url, 'application/json', cached?.lastModified);
      const checked = now();
      if (response.status === 429 || response.status === 403) {
        const retry = response.headers.get('retry-after') ?? '';
        const seconds = /^\d+$/.test(retry) ? Number(retry) : NaN;
        const requested = Number.isFinite(seconds) ? checked.getTime() + seconds * 1000 : Date.parse(retry);
        weatherBlockedUntil = Math.max(checked.getTime() + FALLBACK_CACHE_MS, Number.isFinite(requested) ? requested : 0);
        throw new Error('provider_backoff');
      }
      if (response.status === 304 && cached) {
        const entry = { ...cached, checkedAt: checked.toISOString(), expires: expiry(response, checked) };
        weatherCache.set(placeId, entry);
        return weatherResult(placeId, entry, 'revalidated');
      }
      if (!response.ok) throw new Error('source_unavailable');
      const data = parseMetForecast(await readJson(response));
      selectForecast(data, checked);
      const entry: CacheEntry<MetForecast> = { data, fetchedAt: checked.toISOString(), checkedAt: checked.toISOString(),
        expires: expiry(response, checked), lastModified: response.headers.get('last-modified') ?? undefined, deprecated: response.status === 203 };
      weatherCache.set(placeId, entry);
      weatherRetryAfter.delete(placeId);
      return weatherResult(placeId, entry, 'fetched');
    } catch {
      // Retain validators only for a later conditional retry. Never display stale
      // values as a successful refresh, even when the network is unavailable.
      weatherRetryAfter.set(placeId, now().getTime() + FAILURE_BACKOFF_MS);
      return weatherUnavailable(placeId);
    }
  }
  function newsUnavailable(): UpdatesSnapshot {
    return { source: 'geonet-news', status: 'unavailable', freshness: 'unavailable',
      checkedAt: now().toISOString(), fetchedAt: null, validUntil: null, articles: [],
      message: 'GeoNet updates could not be checked. Open GeoNet and Civil Defence for official information.' };
  }
  async function loadNews(): Promise<UpdatesSnapshot> {
    try {
      let freshness: UpdatesSnapshot['freshness'] = 'cached';
      if (!newsCache || now().getTime() >= newsCache.expires) {
        if (now().getTime() < newsRetryAfter) return newsUnavailable();
        const response = await get(GEONET_NEWS_URL, 'application/json;version=2');
        if (!response.ok) throw new Error('source_unavailable');
        const checked = now();
        const articles = parseGeonetNews(await readJson(response), checked);
        newsCache = { data: articles, fetchedAt: checked.toISOString(), checkedAt: checked.toISOString(), expires: checked.getTime() + 60_000, deprecated: response.status === 203 };
        freshness = 'fetched';
      }
      return { source: 'geonet-news', status: 'available', freshness,
        checkedAt: newsCache.checkedAt, fetchedAt: newsCache.fetchedAt, validUntil: new Date(newsCache.expires).toISOString(),
        articles: newsCache.data,
        message: 'Dated national GeoNet headlines, not a comprehensive news feed or an emergency alert service. Older bulletins may have been superseded.',
      };
    } catch { newsRetryAfter = now().getTime() + FAILURE_BACKOFF_MS; return newsUnavailable(); }
  }
  return {
    weather(placeId: string): Promise<WeatherSnapshot> {
      if (!findNzWeatherPlace(placeId)) return Promise.reject(new Error('invalid_place'));
      const pending = weatherPending.get(placeId);
      if (pending) return pending;
      const request = loadWeather(placeId).finally(() => weatherPending.delete(placeId));
      weatherPending.set(placeId, request);
      return request;
    },
    news(): Promise<UpdatesSnapshot> {
      if (newsPending) return newsPending;
      newsPending = loadNews().finally(() => { newsPending = undefined; });
      return newsPending;
    },
  };
}

export const nzLocalUpdates = createNzLocalUpdates();
