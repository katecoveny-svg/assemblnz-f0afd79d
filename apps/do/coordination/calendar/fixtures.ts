import { validateRead } from './availability';
import type { CalendarConnection, CalendarProvider, CalendarRead, CalendarProviderAdapter } from './contract';
export const FIXTURE_NOW = Date.parse('2026-10-05T19:00:00Z');
export const FIXTURE_CALENDAR = '11111111-1111-4111-8111-111111111111';
export function fixtureConnection(provider: CalendarProvider): CalendarConnection {
  return { id: '22222222-2222-4222-8222-222222222222', ownerId: '44444444-4444-4444-8444-444444444444', revision: 1, provider, mode: 'fixture', status: 'connected', accountLabel: 'Alex · fictional account', expiresAt: '2026-10-06T00:00:00Z' };
}
export function fixtureRead(connection: CalendarConnection): CalendarRead {
  return { requestId: '33333333-3333-4333-8333-333333333333', connectionId: connection.id, connectionRevision: connection.revision, calendarHandles: [FIXTURE_CALENDAR], timezone: 'Pacific/Auckland', range: { start: '2026-10-06T09:00:00+13:00', end: '2026-10-06T17:00:00+13:00' }, workingWindows: [{ start: '2026-10-06T09:00:00+13:00', end: '2026-10-06T17:00:00+13:00' }], expiresAt: '2026-10-05T20:00:00Z', purpose: 'ea_scheduling_free_busy' };
}
export function fixtureAdapter(provider: CalendarProvider): CalendarProviderAdapter {
  return { provider, mode: 'fixture', async choices() { return [{ handle: FIXTURE_CALENDAR, label: 'Fictional work calendar', timezone: 'Pacific/Auckland', ownedByConnectedAccount: true }]; }, async readBusy(connection, approved) { validateRead(approved,connection,FIXTURE_NOW); if (connection.mode !== 'fixture' || connection.provider !== provider || approved.calendarHandles.length !== 1 || approved.calendarHandles[0] !== FIXTURE_CALENDAR || JSON.stringify(approved.range) !== JSON.stringify(fixtureRead(connection).range)) throw new Error('Fictional calendar scope mismatch'); return { range: fixtureRead(fixtureConnection(provider)).range, busy: [{start:'2026-10-06T10:00:00+13:00',end:'2026-10-06T11:30:00+13:00'},{start:'2026-10-06T14:00:00+13:00',end:'2026-10-06T15:00:00+13:00'}], complete:true, observedAt:new Date(FIXTURE_NOW).toISOString() }; }, async revoke() {} };
}
