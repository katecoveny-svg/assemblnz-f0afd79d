import { calendarReadSchema, busySnapshotSchema, type CalendarRead, type BusySnapshot, type CalendarConnection } from './contract';
import { digest, type Window } from '../protocol';
export function validateRead(input: CalendarRead, connection: CalendarConnection, now: number): CalendarRead {
  const read = calendarReadSchema.parse(input);
  if (!Number.isFinite(now) || connection.status !== 'connected' || connection.id !== read.connectionId || connection.revision !== read.connectionRevision || !Number.isFinite(Date.parse(connection.expiresAt)) || Date.parse(connection.expiresAt) <= now) throw new Error('Connection changed or unavailable');
  try { new Intl.DateTimeFormat('en-NZ', { timeZone: read.timezone }).format(now); } catch { throw new Error('Invalid timezone'); }
  const start = Date.parse(read.range.start), end = Date.parse(read.range.end), expiry = Date.parse(read.expiresAt);
  if (start < now || end - start > 7 * 86400000 || expiry <= now || expiry > Math.min(Date.parse(connection.expiresAt), now + 3600000)) throw new Error('Read scope expired or too broad');
  if (new Set(read.calendarHandles).size !== read.calendarHandles.length || read.workingWindows.some(w => Date.parse(w.start) < start || Date.parse(w.end) > end)) throw new Error('Invalid calendar selection or working window');
  const working = [...read.workingWindows].sort((a,b) => Date.parse(a.start)-Date.parse(b.start));
  if (working.some((w,i) => i > 0 && Date.parse(w.start) < Date.parse(working[i-1].end))) throw new Error('Working windows overlap');
  return read;
}
export async function readApprovalDigest(read: CalendarRead): Promise<string> { return digest(calendarReadSchema.parse(read)); }
/** The provider snapshot is untrusted; incomplete/error responses never imply free time. */
export function freeWindows(read: CalendarRead, input: BusySnapshot): Window[] {
  const snapshot = busySnapshotSchema.parse(input);
  if (Date.parse(snapshot.range.start) !== Date.parse(read.range.start) || Date.parse(snapshot.range.end) !== Date.parse(read.range.end)) throw new Error('Provider returned a different range');
  const bounds = { start: Date.parse(read.range.start), end: Date.parse(read.range.end) };
  if (snapshot.busy.some(w => Date.parse(w.start) < bounds.start || Date.parse(w.end) > bounds.end)) throw new Error('Provider returned out-of-range data');
  const merged: { start: number; end: number }[] = [];
  for (const interval of snapshot.busy.map(w => ({ start: Date.parse(w.start), end: Date.parse(w.end) })).sort((a,b) => a.start-b.start)) {
    const previous = merged.at(-1);
    if (previous && interval.start <= previous.end) previous.end = Math.max(previous.end, interval.end); else merged.push({ ...interval });
  }
  const result: Window[] = [];
  for (const working of read.workingWindows) {
    let cursor = Date.parse(working.start); const stop = Date.parse(working.end);
    for (const block of merged) {
      if (block.end <= cursor || block.start >= stop) continue;
      if (block.start > cursor) result.push({ start: new Date(cursor).toISOString(), end: new Date(Math.min(block.start,stop)).toISOString() });
      cursor = Math.max(cursor, block.end); if (cursor >= stop) break;
    }
    if (cursor < stop) result.push({ start: new Date(cursor).toISOString(), end: new Date(stop).toISOString() });
  }
  // A disclosure uses the existing eight-window cap; never silently truncate permissions.
  const unique = [...new Map(result.map(w => [`${w.start}/${w.end}`,w])).values()].sort((a,b) => Date.parse(a.start)-Date.parse(b.start));
  if (unique.length > 8) throw new Error('Narrow the range before disclosure');
  return unique;
}
export type AvailabilityReview = { mode: 'fixture' | 'live'; readDigest: string; connectionRevision: number; range: Window; timezone: string; observedAt: string; expiresAt: string; windows: Window[]; peerDisclosureApproved: false };
export async function availabilityReview(read: CalendarRead, snapshot: BusySnapshot, connection: CalendarConnection, now: number): Promise<AvailabilityReview> {
  validateRead(read,connection,now);
  const observed = Date.parse(snapshot.observedAt);
  if (observed > now || observed < now-300000) throw new Error('Provider snapshot is stale');
  return { mode: connection.mode, readDigest: await readApprovalDigest(read), connectionRevision: connection.revision, range: read.range, timezone: read.timezone, observedAt: snapshot.observedAt, expiresAt: read.expiresAt, windows: freeWindows(read,snapshot), peerDisclosureApproved: false };
}
