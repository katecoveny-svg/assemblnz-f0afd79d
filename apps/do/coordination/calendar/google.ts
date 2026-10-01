import 'server-only';
import { z } from 'zod';
import { windowSchema } from '../protocol';
import { readApprovalDigest, validateRead } from './availability';
import type { CalendarConnection, CalendarProviderAdapter, CalendarRead } from './contract';

export const GOOGLE_FREE_BUSY_SCOPE = 'https://www.googleapis.com/auth/calendar.freebusy';
/** A dedicated read-only grant, never a legacy full-calendar grant. */
export function validateGoogleScopes(scopes: string): void {
  const actual = new Set(scopes.split(/\s+/).filter(Boolean));
  const allowed = new Set(['openid', 'email', 'https://www.googleapis.com/auth/userinfo.email', GOOGLE_FREE_BUSY_SCOPE]);
  if (!actual.has(GOOGLE_FREE_BUSY_SCOPE) || [...actual].some(scope => !allowed.has(scope))) throw new Error('Unexpected Google grant');
}
export type GoogleReadLease = {
  ownerId: string; connectionId: string; connectionRevision: number; handle: string;
  // Only the connected account's primary calendar in the first milestone.
  calendarId: 'primary'; accessToken: string; grantedScopes: string; expiresAt: string;
};
/** Implement using verified owner/session, encrypted vault and atomic durable CAS.
 * No default implementation exists. The lease is private and must never enter receipts.
 */
export interface GoogleCalendarAuthority {
  primaryChoice(connection: CalendarConnection): Promise<{ handle: string; label: string; timezone: string }>;
  consumeRead(connection: CalendarConnection, read: CalendarRead, exactDigest: string): Promise<GoogleReadLease>;
  invalidate(connection: CalendarConnection): Promise<void>;
}
const providerResponse = z.object({
  timeMin: z.string().datetime({ offset: true }), timeMax: z.string().datetime({ offset: true }),
  calendars: z.object({ primary: z.object({ busy: z.array(windowSchema).max(1000), errors: z.array(z.unknown()).optional() }).passthrough() }).passthrough(),
}).passthrough();
/** Unwired adapter. Both transport and durable authority are explicitly supplied. */
export function googleCalendarAdapter(authority: GoogleCalendarAuthority, transport: typeof fetch, clock: () => number): CalendarProviderAdapter {
  return {
    provider: 'google', mode: 'live',
    async choices(connection) {
      if (connection.provider !== 'google' || connection.mode !== 'live' || connection.status !== 'connected' || !Number.isFinite(Date.parse(connection.expiresAt)) || Date.parse(connection.expiresAt) <= clock()) throw new Error('Google connection unavailable');
      return [{ ...await authority.primaryChoice(connection), ownedByConnectedAccount: true }];
    },
    async readBusy(connection, input) {
      if (connection.provider !== 'google' || connection.mode !== 'live') throw new Error('Google connection unavailable');
      const read = validateRead(input, connection, clock());
      if (read.calendarHandles.length !== 1) throw new Error('Select the connected primary calendar');
      const lease = await authority.consumeRead(connection, read, await readApprovalDigest(read));
      // Recheck wallclock after the authority has acquired locks/consumed approval.
      validateRead(read, connection, clock());
      if (lease.ownerId !== connection.ownerId || lease.connectionId !== connection.id || lease.connectionRevision !== connection.revision || lease.handle !== read.calendarHandles[0] || lease.calendarId !== 'primary' || !Number.isFinite(Date.parse(lease.expiresAt)) || Date.parse(lease.expiresAt) <= clock() || !lease.accessToken) throw new Error('Google lease unavailable');
      validateGoogleScopes(lease.grantedScopes);
      const response = await transport('https://www.googleapis.com/calendar/v3/freeBusy', {
        method: 'POST', redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(10000),
        headers: { Authorization: `Bearer ${lease.accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeMin: read.range.start, timeMax: read.range.end, timeZone: read.timezone, calendarExpansionMax: 1, groupExpansionMax: 0, items: [{ id: 'primary' }] }),
      });
      if (!response.ok) throw new Error('Google availability unavailable');
      const declared = Number(response.headers.get('content-length'));
      if (declared > 262144) throw new Error('Google response too large');
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Google response missing');
      const chunks: Uint8Array[] = []; let size = 0;
      try { for (;;) { const next = await reader.read(); if (next.done) break; size += next.value.byteLength; if (size > 262144) throw new Error('Google response too large'); chunks.push(next.value); } } finally { await reader.cancel(); }
      const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      const parsed = providerResponse.parse(JSON.parse(new TextDecoder().decode(bytes)));
      if (Object.keys(parsed.calendars).length !== 1 || parsed.calendars.primary.errors?.length || Date.parse(parsed.timeMin) !== Date.parse(read.range.start) || Date.parse(parsed.timeMax) !== Date.parse(read.range.end)) throw new Error('Google availability incomplete');
      validateRead(read, connection, clock());
      if (!Number.isFinite(Date.parse(lease.expiresAt)) || Date.parse(lease.expiresAt) <= clock()) throw new Error('Google lease expired');
      const bounds = { start: Date.parse(read.range.start), end: Date.parse(read.range.end) };
      if (parsed.calendars.primary.busy.some(w => Date.parse(w.start) < bounds.start || Date.parse(w.end) > bounds.end)) throw new Error('Google availability out of range');
      return { range: read.range, busy: parsed.calendars.primary.busy.map(w => ({ start: w.start, end: w.end })), complete: true, observedAt: new Date(clock()).toISOString() };
    },
    async revoke(connection) { await authority.invalidate(connection); },
  };
}
