import { z } from 'zod';

/** Public city centres, never a person's location. Selection is not persisted. */
export const NZ_WEATHER_PLACES = [
  { id: 'whangarei', name: 'Whangārei', latitude: -35.73, longitude: 174.32 },
  { id: 'auckland', name: 'Auckland', latitude: -36.85, longitude: 174.76 },
  { id: 'hamilton', name: 'Hamilton', latitude: -37.79, longitude: 175.28 },
  { id: 'tauranga', name: 'Tauranga', latitude: -37.69, longitude: 176.17 },
  { id: 'rotorua', name: 'Rotorua', latitude: -38.14, longitude: 176.25 },
  { id: 'taupo', name: 'Taupō', latitude: -38.69, longitude: 176.07 },
  { id: 'gisborne', name: 'Gisborne', latitude: -38.66, longitude: 178.02 },
  { id: 'napier', name: 'Napier', latitude: -39.49, longitude: 176.92 },
  { id: 'new-plymouth', name: 'New Plymouth', latitude: -39.06, longitude: 174.08 },
  { id: 'whanganui', name: 'Whanganui', latitude: -39.93, longitude: 175.05 },
  { id: 'palmerston-north', name: 'Palmerston North', latitude: -40.35, longitude: 175.61 },
  { id: 'wellington', name: 'Wellington', latitude: -41.29, longitude: 174.78 },
  { id: 'nelson', name: 'Nelson', latitude: -41.27, longitude: 173.28 },
  { id: 'blenheim', name: 'Blenheim', latitude: -41.51, longitude: 173.96 },
  { id: 'westport', name: 'Westport', latitude: -41.75, longitude: 171.60 },
  { id: 'greymouth', name: 'Greymouth', latitude: -42.45, longitude: 171.21 },
  { id: 'christchurch', name: 'Christchurch', latitude: -43.53, longitude: 172.64 },
  { id: 'timaru', name: 'Timaru', latitude: -44.40, longitude: 171.25 },
  { id: 'queenstown', name: 'Queenstown', latitude: -45.03, longitude: 168.66 },
  { id: 'dunedin', name: 'Dunedin', latitude: -45.87, longitude: 170.50 },
  { id: 'invercargill', name: 'Invercargill', latitude: -46.41, longitude: 168.35 },
] as const;
export type NzWeatherPlace = typeof NZ_WEATHER_PLACES[number];
export function findNzWeatherPlace(id: string): NzWeatherPlace | undefined {
  return NZ_WEATHER_PLACES.find(place => place.id === id);
}

export const NZ_LOCAL_SOURCES = {
  weather: {
    name: 'MET Norway',
    url: 'https://api.met.no/doc/locationforecast/HowTO',
    termsUrl: 'https://api.met.no/doc/TermsOfService',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    attribution: 'Based on data from MET Norway. Selected forecast values; wind converted to km/h.',
  },
  updates: {
    name: 'GeoNet',
    url: 'https://www.geonet.org.nz/news',
    termsUrl: 'https://www.geonet.org.nz/policy',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/nz/',
    attribution: 'GeoNet / Earth Sciences New Zealand, with programme sponsors NHC, LINZ, NEMA and MBIE. Original headlines; selected and date-sorted.',
  },
  warnings: 'https://www.metservice.com/warnings/home',
  emergency: 'https://www.civildefence.govt.nz/',
  prepare: 'https://getready.govt.nz/',
  emergencyPhone: 'https://www.police.govt.nz/call-111',
} as const;

const timestamp = z.iso.datetime({ offset: true });
const snapshotFields = {
  status: z.enum(['available', 'unavailable']),
  freshness: z.enum(['fetched', 'cached', 'revalidated', 'unavailable']),
  checkedAt: timestamp,
  fetchedAt: timestamp.nullable(),
  validUntil: timestamp.nullable(),
  message: z.string().max(1000),
};
export const forecastPointSchema = z.object({
  time: timestamp,
  temperatureC: z.number().min(-100).max(70),
  windKmh: z.number().nonnegative().max(1000),
  precipitationMm: z.number().nonnegative().max(5000).nullable(),
  precipitationHours: z.union([z.literal(1), z.literal(6)]).nullable(),
});
export const weatherSnapshotSchema = z.object({
  ...snapshotFields,
  source: z.literal('met-norway'),
  placeId: z.string().refine(id => !!findNzWeatherPlace(id)),
  modelUpdatedAt: timestamp.nullable(),
  forecast: z.array(forecastPointSchema).max(6),
});
const officialGeoNetLink = z.url().refine(value => {
  const url = new URL(value);
  return url.protocol === 'https:' && url.hostname === 'www.geonet.org.nz' &&
    !url.username && !url.password && !url.port && !url.search && !url.hash &&
    /^\/(news|vabs|response)\/[a-zA-Z0-9_-]+$/.test(url.pathname);
}, 'Expected an official GeoNet article');
export const geonetArticleSchema = z.object({
  title: z.string().min(1).max(1000),
  published: timestamp,
  link: officialGeoNetLink,
  tag: z.string().max(100).optional(),
});
export const updatesSnapshotSchema = z.object({
  ...snapshotFields,
  source: z.literal('geonet-news'),
  articles: z.array(geonetArticleSchema).max(10),
});
export type WeatherSnapshot = z.infer<typeof weatherSnapshotSchema>;
export type UpdatesSnapshot = z.infer<typeof updatesSnapshotSchema>;

export function isSnapshotStale(snapshot: { validUntil: string | null }, now: number): boolean {
  return !snapshot.validUntil || !Number.isFinite(Date.parse(snapshot.validUntil)) || now >= Date.parse(snapshot.validUntil);
}
