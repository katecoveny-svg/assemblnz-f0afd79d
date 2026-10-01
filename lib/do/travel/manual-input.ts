import { prepareReviewedTravel, travelInstant, type FlightInput, type TravelDraft } from './preparation';

export const manualFields = ['marketingFlight', 'operatingFlight', 'origin', 'destination',
  'departure.local', 'departure.offset', 'departure.zone', 'arrival.local', 'arrival.offset', 'arrival.zone'] as const;
export type ManualField = typeof manualFields[number];
export type ManualFlight = Record<ManualField, string>;
export type ManualIssue = { segment: number; field: ManualField | 'segment'; message: string };
export const emptyManualFlight = (): ManualFlight => Object.fromEntries(manualFields.map(f => [f, ''])) as ManualFlight;

function project(f: ManualFlight): FlightInput {
  return { marketingFlight: f.marketingFlight.trim().toUpperCase(), operatingFlight: f.operatingFlight.trim().toUpperCase(),
    origin: f.origin.trim().toUpperCase(), destination: f.destination.trim().toUpperCase(),
    departure: { local: f['departure.local'].trim(), offset: f['departure.offset'].trim(), zone: f['departure.zone'].trim() },
    arrival: { local: f['arrival.local'].trim(), offset: f['arrival.offset'].trim(), zone: f['arrival.zone'].trim() } };
}

/** Generic errors contain field names, never the entered values or original text. */
export function manualIssues(flight: ManualFlight, segment = 0): ManualIssue[] {
  const issues: ManualIssue[] = [];
  for (const field of manualFields) {
    const value = flight[field];
    if (typeof value !== 'string' || value.length > 80 || !value.trim()) issues.push({ segment, field, message: 'Enter and review this field.' });
  }
  if (issues.length) return issues;
  const f = project(flight);
  for (const field of ['marketingFlight', 'operatingFlight'] as const) if (!/^[A-Z0-9]{2,3}\d{1,4}$/.test(f[field])) issues.push({ segment, field, message: 'Enter the airline code and flight number; confirm the operating flight.' });
  for (const field of ['origin', 'destination'] as const) if (!/^[A-Z]{3}$/.test(f[field])) issues.push({ segment, field, message: 'Enter a three-letter airport code.' });
  for (const end of ['departure', 'arrival'] as const) {
    try { travelInstant(f[end]); } catch { issues.push({ segment, field: `${end}.local`, message: 'Correct the full date, time, UTC offset and IANA timezone. Ambiguous dates and DST gaps cannot be guessed.' }); }
  }
  if (!issues.length && travelInstant(f.arrival) <= travelInstant(f.departure)) issues.push({ segment, field: 'segment', message: 'Arrival must follow departure; check dates and timezones.' });
  return issues;
}

/** Memory-only controller. Never automatically serialise or persist originals.
 * UI must call clear on unmount and switchContext on identity/workspace change.
 * Its key is a local lifecycle discriminator, never proof of authenticated ownership.
 */
export function createManualTravelSession(contextKey: string) {
  let context = contextKey;
  let original = '';
  let flights: ManualFlight[] = [emptyManualFlight()];
  let revision = 1;
  let reviewedRevision: number | null = null;
  const invalidate = () => { revision++; reviewedRevision = null; };
  const clear = () => { original = ''; flights = [emptyManualFlight()]; invalidate(); };
  return {
    inputTypes: ['manual_fields'] as const,
    setOriginalForReference(text: string) {
      if (typeof text !== 'string' || text.length > 64000) throw new Error('Reference text exceeds limit');
      original = text; invalidate();
    },
    /** Explicit local reference display only; no extraction or automatic flight inference. */
    originalForLocalReview: () => original,
    snapshot: () => ({ revision, flights: flights.map(f => ({ ...f })), reviewed: reviewedRevision === revision,
      inputType: 'manual_fields' as const, retention: 'session_memory_only' as const, booking: 'disabled' as const }),
    setFlights(next: ManualFlight[]) {
      if (!Array.isArray(next) || next.length < 1 || next.length > 20) throw new Error('Enter 1–20 flight segments');
      // Project known keys only; extra private fields never enter the itinerary.
      flights = next.map(f => Object.fromEntries(manualFields.map(field => {
        if (typeof f[field] !== 'string' || f[field].length > 80) throw new Error('Invalid manual field');
        return [field, f[field]];
      })) as ManualFlight);
      invalidate();
    },
    review(expectedRevision: number) {
      if (expectedRevision !== revision) throw new Error('Input changed; review again');
      const issues = flights.flatMap((f, i) => manualIssues(f, i));
      if (!issues.length) reviewedRevision = revision;
      return { accepted: !issues.length, issues };
    },
    prepare(completion: Parameters<typeof prepareReviewedTravel>[1], expectedRevision: number): TravelDraft {
      if (expectedRevision !== revision || reviewedRevision !== revision) throw new Error('Correct and review all fields first');
      const completed = Date.parse(completion.completedAt);
      if (!Number.isFinite(completed)) throw new Error('Completion timestamp required');
      try {
        return prepareReviewedTravel({ source: { id: `manual-${completion.runId}`, kind: 'user_manual',
          observedAt: completion.completedAt, verifiedAt: completion.completedAt,
          expiresAt: new Date(completed + 24 * 3600000).toISOString() }, flights: flights.map(project) }, completion);
      } catch { throw new Error('Itinerary validation failed; check segments and completion identity.'); }
    },
    switchContext(nextContext: string) { if (nextContext !== context) { context = nextContext; clear(); } },
    clear,
  };
}

/** Only these safe diagnostics may be logged. No source ID, raw text or booking fields. */
export function travelDiagnostic(draft: TravelDraft) {
  return { module: 'travel', receipt: draft.receipt, sourceKind: draft.source.kind,
    segmentCount: draft.flights.length, externalAction: 'none', booking: 'disabled' };
}
