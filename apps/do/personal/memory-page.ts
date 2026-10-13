import { MEMORY_NOTICE_VERSION, type PersonalMemoryMutation, type PersonalMemoryRecord } from './memory';

/** Pure helpers for the Memory page. The server remains the owner authority and clock. */
export const MEMORY_KIND_LABEL: Record<PersonalMemoryRecord['kind'], string> = {
  preference: 'Preference',
  routine: 'Routine',
  ongoing_context: 'Ongoing context',
};
export const MEMORY_RETENTION_OPTIONS = [7, 30, 90] as const;
export type MemoryRetention = (typeof MEMORY_RETENTION_OPTIONS)[number];

export type MemoryDraft = { kind: PersonalMemoryRecord['kind']; text: string; observedAt: string; retentionDays: MemoryRetention };
export const MEMORY_TIME_ZONE = 'Pacific/Auckland';
const dayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: MEMORY_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });
/** The calendar day in New Zealand for an instant, as a date input value. */
export function memoryDay(now: Date | string = new Date()): string {
  return dayFormat.format(typeof now === 'string' ? new Date(now) : now);
}
export const EMPTY_MEMORY_DRAFT = (now: string): MemoryDraft => ({ kind: 'preference', text: '', observedAt: memoryDay(now), retentionDays: 30 });

/** A new note, or a full re-save of an existing one. Consent is a literal the owner ticked this time. */
export function saveMemoryMutation(id: string, draft: MemoryDraft, current: PersonalMemoryRecord | null, active = true): PersonalMemoryMutation {
  return {
    action: 'save', id, expectedRevision: current?.revision ?? 0,
    subject: 'self', kind: draft.kind, text: draft.text.trim(), source: 'owner_entered',
    observedAt: toObservedAt(draft.observedAt), retentionDays: draft.retentionDays, active,
    consent: true, noticeVersion: MEMORY_NOTICE_VERSION, selfOnly: true, nonSensitive: true,
  };
}
export function changeMemoryMutation(action: 'review' | 'pause' | 'delete', record: PersonalMemoryRecord): PersonalMemoryMutation {
  return { action, id: record.id, expectedRevision: record.revision };
}
export function draftFromRecord(record: PersonalMemoryRecord): MemoryDraft {
  return { kind: record.kind, text: record.text, observedAt: record.observedAt.slice(0, 10), retentionDays: record.retentionDays };
}
/** Date inputs give a New Zealand calendar day. It is stored as that day's midnight UTC, which is midday on the same
 * day in New Zealand, so it reads back as the day the owner picked and is never in the future. */
export function toObservedAt(day: string, now = new Date()): string {
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(day) ? new Date(`${day}T00:00:00.000Z`) : new Date(NaN);
  if (Number.isNaN(parsed.getTime())) return now.toISOString();
  return (parsed.getTime() > now.getTime() ? now : parsed).toISOString();
}
export function daysUntil(iso: string, now = new Date()): number {
  return Math.max(0, Math.ceil((Date.parse(iso) - now.getTime()) / 86400000));
}
export function sortMemory(records: PersonalMemoryRecord[]): PersonalMemoryRecord[] {
  return [...records].sort((a, b) => Number(b.active) - Number(a.active) || Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}
