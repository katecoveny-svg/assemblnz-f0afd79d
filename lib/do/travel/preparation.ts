import { z } from 'zod';
import { tripSchema, type DoTrip } from '../../../apps/do/shared/travel';

/** No document upload, pass barcode, or provider call. Manual fields require review. */
export type TravelSource = {
  id: string; kind: 'synthetic_itinerary' | 'synthetic_boarding_summary' | 'user_manual';
  observedAt: string; verifiedAt: string; expiresAt: string;
};
export type TravelTime = { local: string; offset: string; zone: string };
export type FlightInput = {
  marketingFlight: string; operatingFlight: string;
  origin: string; destination: string; departure: TravelTime; arrival: TravelTime;
};
export type TravelDocument = {
  synthetic: true; source: TravelSource; flights: FlightInput[];
};
export type TravelDraft = {
  responsibilityId: string; runId: string; revision: number; preparedAt: string;
  receipt: 'prepared_draft'; externalAction: 'none'; review: 'required' | 'acknowledged';
  booking: 'disabled'; source: TravelSource; flights: FlightInput[];
};

const timeSchema = z.object({ local: z.string().max(16), offset: z.string().max(6), zone: z.string().max(80) });
const documentSchema = z.object({ synthetic: z.literal(true), source: z.object({
  id: z.string().max(80), kind: z.enum(['synthetic_itinerary', 'synthetic_boarding_summary']),
  observedAt: z.string().max(30), verifiedAt: z.string().max(30), expiresAt: z.string().max(30),
}), flights: z.array(z.object({ marketingFlight: z.string().max(7), operatingFlight: z.string().max(7),
  origin: z.string().max(3), destination: z.string().max(3), departure: timeSchema, arrival: timeSchema })).min(1).max(20) });

/** JSON fixture importer, not an OCR or airport-pass decoder. Raw input is never retained. */
export function importSyntheticTravel(json: string, completion: Parameters<typeof prepareTravel>[1]) {
  if (json.length > 64000) throw new Error('Document exceeds import limit');
  return prepareTravel(documentSchema.parse(JSON.parse(json)), completion);
}

/** Extend the existing editable trip only after explicit, revision-bound review. */
export function applyTravelToTrip(trip: DoTrip, draft: TravelDraft, expectedRevision: number): DoTrip {
  if (draft.review !== 'acknowledged' || draft.revision !== expectedRevision) throw new Error('Review required');
  return tripSchema.parse({ ...trip, summary: draft.flights.map(f =>
    `${f.marketingFlight} (operated as ${f.operatingFlight}): ${f.origin} ${f.departure.local} ${f.departure.offset} [${f.departure.zone}] → ${f.destination} ${f.arrival.local} ${f.arrival.offset} [${f.arrival.zone}]`
  ).join('\n') + `\n${draft.source.kind === 'user_manual' ? 'User-entered itinerary; provider verification required.' : 'Synthetic itinerary.'} Flight status unknown. Nothing booked.`, updatedAt: draft.preparedAt });
}

const instantPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
function instant(value: string): number {
  if (!instantPattern.test(value) || !Number.isFinite(Date.parse(value))) throw new Error('Explicit UTC timestamp required');
  if (new Date(value).toISOString() !== value.replace(/Z$/, value.includes('.') ? 'Z' : '.000Z')) throw new Error('Invalid calendar timestamp');
  return Date.parse(value);
}
function identifier(value: string) {
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(value)) throw new Error('Invalid identity');
  return value;
}

/** Require an explicit date, offset and IANA zone; never guess a DST fold or gap. */
export function travelInstant(time: TravelTime): number {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(time.local) || !/^[+-]\d{2}:\d{2}$/.test(time.offset)) throw new Error('Unambiguous date and offset required');
  const milliseconds = Date.parse(time.local + time.offset);
  if (!Number.isFinite(milliseconds)) throw new Error('Invalid date');
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: time.zone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(milliseconds);
  const part = (key: string) => parts.find(p => p.type === key)?.value;
  const local = `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
  if (local !== time.local) throw new Error('Date or timezone offset mismatch');
  return milliseconds;
}

/** Allowlist projection drops all booking references, passenger fields and raw text. */
export function prepareTravel(document: TravelDocument, completion: {
  responsibilityId: string; runId: string; revision: number; completedAt: string;
}): TravelDraft {
  if (document.synthetic !== true) throw new Error('Only synthetic documents supported');
  if (!['synthetic_itinerary', 'synthetic_boarding_summary'].includes(document.source.kind)) throw new Error('Unsupported synthetic source');
  return prepareReviewedTravel(document, completion);
}

/** Internal common projection; manual entry gate is owned by manual-input.ts. */
export function prepareReviewedTravel(document: { source: TravelSource; flights: FlightInput[] }, completion: Parameters<typeof prepareTravel>[1]): TravelDraft {
  const source = document.source;
  if (!['synthetic_itinerary', 'synthetic_boarding_summary', 'user_manual'].includes(source.kind)) throw new Error('Unsupported source');
  const observed = instant(source.observedAt), verified = instant(source.verifiedAt), expiry = instant(source.expiresAt);
  const completed = instant(completion.completedAt);
  if (observed > verified || verified > completed || expiry <= verified) throw new Error('Invalid evidence times');
  if (!Number.isInteger(completion.revision) || completion.revision < 1) throw new Error('Invalid revision');
  if (!Array.isArray(document.flights) || document.flights.length < 1 || document.flights.length > 20) throw new Error('1–20 flights required');
  const keys = new Set<string>();
  const flights = document.flights.map(f => {
    for (const code of [f.marketingFlight, f.operatingFlight]) if (!/^[A-Z0-9]{2,3}\d{1,4}$/.test(code)) throw new Error('Invalid flight code');
    for (const airport of [f.origin, f.destination]) if (!/^[A-Z]{3}$/.test(airport)) throw new Error('Invalid airport');
    const departure = travelInstant(f.departure), arrival = travelInstant(f.arrival);
    if (arrival <= departure) throw new Error('Arrival must follow departure');
    const key = `${f.operatingFlight}:${departure}:${f.origin}:${f.destination}`;
    if (keys.has(key)) throw new Error('Duplicate segment or codeshare');
    keys.add(key);
    const time = (t: TravelTime): TravelTime => ({ local: t.local, offset: t.offset, zone: t.zone });
    return { marketingFlight: f.marketingFlight, operatingFlight: f.operatingFlight,
      origin: f.origin, destination: f.destination, departure: time(f.departure), arrival: time(f.arrival) };
  });
  flights.sort((a,b) => travelInstant(a.departure) - travelInstant(b.departure));
  for (let i = 1; i < flights.length; i++) if (travelInstant(flights[i].departure) < travelInstant(flights[i-1].arrival)) throw new Error('Overlapping segments');
  return { responsibilityId: identifier(completion.responsibilityId), runId: identifier(completion.runId),
    revision: completion.revision, preparedAt: completion.completedAt, receipt: 'prepared_draft',
    externalAction: 'none', review: 'required', booking: 'disabled',
    source: { id: identifier(source.id), kind: source.kind, observedAt: source.observedAt, verifiedAt: source.verifiedAt, expiresAt: source.expiresAt }, flights };
}

/** Re-import replaces the same source only after new preparation; review always resets. */
export function upsertTravel(drafts: TravelDraft[], next: TravelDraft): TravelDraft[] {
  const previous = drafts.find(d => d.responsibilityId === next.responsibilityId && d.source.id === next.source.id);
  if (previous && (next.revision < previous.revision || instant(next.preparedAt) < instant(previous.preparedAt))) throw new Error('Stale import');
  if (previous && next.revision === previous.revision && next.runId === previous.runId) {
    if (JSON.stringify({ ...previous, review: 'required' }) !== JSON.stringify({ ...next, review: 'required' })) throw new Error('Import identity conflict');
    return drafts;
  }
  return [...drafts.filter(d => !(d.responsibilityId === next.responsibilityId && d.source.id === next.source.id)), next];
}
export function acknowledgeTravel(draft: TravelDraft, expectedRevision: number): TravelDraft {
  if (draft.revision !== expectedRevision) throw new Error('Review revision changed');
  return { ...draft, review: 'acknowledged', externalAction: 'none', booking: 'disabled' };
}
export function travelTimeline(draft: TravelDraft, now: string) {
  const fresh = instant(now) >= instant(draft.source.verifiedAt) && instant(now) < instant(draft.source.expiresAt);
  return draft.flights.flatMap(f => [
    { kind: 'departure' as const, airport: f.origin, time: f.departure, instant: travelInstant(f.departure), flight: f.marketingFlight, operatingFlight: f.operatingFlight },
    { kind: 'arrival' as const, airport: f.destination, time: f.arrival, instant: travelInstant(f.arrival), flight: f.marketingFlight, operatingFlight: f.operatingFlight },
  ]).sort((a,b) => a.instant-b.instant).map(e => ({ ...e, sourceId: draft.source.id,
    evidence: fresh ? (draft.source.kind === 'user_manual' ? 'user_entered' as const : 'synthetic' as const) : 'stale' as const, flightStatus: 'unknown' as const }));
}

/** Official universal link. Opening is user-directed; prices and terms stay in Uber. */
export function uberHandoff() {
  return { label: 'opens Uber', url: 'https://m.uber.com/looking', externalAction: 'none' as const,
    booking: 'disabled' as const, locationShared: false,
    documentation: 'https://developer.uber.com/docs/riders/ride-requests/tutorials/deep-links/introduction' };
}
