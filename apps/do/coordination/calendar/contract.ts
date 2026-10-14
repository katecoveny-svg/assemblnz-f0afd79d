import { z } from 'zod';
import { windowSchema } from '../protocol';
export const calendarProviderSchema = z.enum(['google', 'microsoft', 'apple']);
export type CalendarProvider = z.infer<typeof calendarProviderSchema>;
const uuid = z.string().uuid();
export const calendarReadSchema = z.object({
  requestId: uuid, connectionId: uuid, connectionRevision: z.number().int().min(1).max(100),
  calendarHandles: z.array(uuid).min(1).max(3), timezone: z.string().min(1).max(80),
  range: windowSchema, workingWindows: z.array(windowSchema).min(1).max(14),
  expiresAt: z.string().datetime({ offset: true }), purpose: z.literal('ea_scheduling_free_busy'),
}).strict();
export type CalendarRead = z.infer<typeof calendarReadSchema>;
/** Private owner-only projection. Never include this or provider identities in a peer envelope. */
export type CalendarChoice = { handle: string; label: string; timezone: string; ownedByConnectedAccount: true };
export type CalendarConnection = { id: string; ownerId: string; revision: number; provider: CalendarProvider; mode: 'fixture' | 'live'; status: 'connected' | 'revoked'; accountLabel: string; expiresAt: string };
export const busySnapshotSchema = z.object({ range: windowSchema, busy: z.array(windowSchema).max(1000), complete: z.literal(true), observedAt: z.string().datetime({ offset: true }) }).strict();
export type BusySnapshot = z.infer<typeof busySnapshotSchema>;
export interface CalendarProviderAdapter {
  readonly provider: CalendarProvider;
  readonly mode: 'fixture' | 'live';
  /** Owner and exact account binding must already be established server-side. */
  choices(connection: CalendarConnection): Promise<CalendarChoice[]>;
  readBusy(connection: CalendarConnection, approved: CalendarRead): Promise<BusySnapshot>;
  revoke(connection: CalendarConnection): Promise<void>;
}
export const CALENDAR_NOTICE = 'Calendar setup preview. No real account is connected. Nothing is shared with another owner.';
