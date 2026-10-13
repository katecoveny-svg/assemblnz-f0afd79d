import { z } from 'zod';
import { familyRequest, senderAddress } from '../services/family';
import type { HouseholdPerson } from '../shared/household-floor';
import type { FamilyStatus } from '@/lib/family/types';

export const schoolSelection = familyRequest.pick({ senders: true, days: true });
export type SchoolChild = Pick<HouseholdPerson, 'id' | 'displayName' | 'role'> & { schoolId: string; confirmedAudiences: string[] };
const page = z.object({ number: z.number().int().min(1).max(20), text: z.string().max(16000) }).strict();
export const schoolSource = z.object({
  id: z.string().min(1).max(100), ownerId: z.string().min(1).max(100), schoolId: z.string().min(1).max(100),
  sender: z.string().email(), title: z.string().max(240), url: z.string().max(2000),
  receivedAt: z.string().datetime(), checkedAt: z.string().datetime(),
  state: z.enum(['available', 'unavailable', 'partial']), kind: z.enum(['email', 'pdf']),
  pages: z.array(page).max(20),
}).strict();
export type SchoolSource = z.infer<typeof schoolSource>;
export type SchoolEvent = {
  key: string; title: string; audience: string; date: string; time: string; location: string;
  status: 'scheduled' | 'cancelled'; instant: string | null; source: SchoolSource; page: number; quote: string;
};
export type SchoolCard = {
  id: string; childId: string; childName: string; before?: SchoolEvent; after: SchoolEvent;
  change: 'new' | 'changed' | 'cancelled' | 'unchanged' | 'conflict';
  changedFields: string[]; priorEvidence: SchoolEvent[]; alternatives: SchoolEvent[]; blockers: string[];
  action: string; status: Extract<FamilyStatus, 'proposed' | 'approved' | 'dismissed'>;
};
export type SchoolBriefing = { ownerId: string; revision: string; checkedAt: string; cards: SchoolCard[]; notices: string[] };
const normal = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();
const fields = ['date', 'time', 'location', 'status'] as const;
const comparable = (e: SchoolEvent, f: typeof fields[number]) => f === 'date' ? nzDate(e.date) ?? normal(e.date) : normal(e[f]);
const signature = (e: SchoolEvent) => JSON.stringify(fields.map(f => comparable(e, f)));

/** No host-locale Date parsing, no inferred year, no ambiguous two-digit years. */
export function nzDate(raw: string): string | null {
  const numeric = raw.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const iso = raw.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const words = raw.trim().match(/^(\d{1,2}) ([A-Za-z]+) (\d{4})$/);
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  let y: number, m: number, d: number;
  if (numeric) [, d, m, y] = numeric.map(Number);
  else if (iso) [, y, m, d] = iso.map(Number);
  else if (words) { d = Number(words[1]); m = months.findIndex(v => v === words[2].toLowerCase() || v.slice(0, 3) === words[2].toLowerCase()) + 1; y = Number(words[3]); }
  else return null;
  if (y < 2000 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? date.toISOString().slice(0, 10) : null;
}
/** NZ's two offsets are candidates, never a fixed-offset assumption. Gaps/folds fail closed. */
export function aucklandInstant(date: string, time: string): string | null {
  const day = nzDate(date);
  if (!day || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
  const wall = `${day}T${time}:00`;
  const formatter = new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const candidates = [12, 13].map(offset => new Date(Date.parse(`${wall}Z`) - offset * 3600000)).filter(candidate => {
    const p = Object.fromEntries(formatter.formatToParts(candidate).map(v => [v.type, v.value]));
    return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:00` === wall;
  });
  return candidates.length === 1 ? candidates[0].toISOString() : null;
}
export function safeSchoolLink(raw: string): string | null {
  if (/^\/do\/school-fixtures\/[a-z0-9-]+\.pdf$/.test(raw)) return raw;
  try { const u = new URL(raw); return u.protocol === 'https:' && !u.username && !u.password ? u.href : null; } catch { return null; }
}
/** Bounded exact-row recipe, not a general newsletter/PDF understanding claim.
 * Event | Audience | DD/MM/YYYY | HH:mm | Location | scheduled/cancelled
 * Unrecognised rows are surfaced for manual review, never silently interpreted. */
export function extractSchoolRows(source: SchoolSource): { events: SchoolEvent[]; unparsed: boolean } {
  const events: SchoolEvent[] = [];
  let unparsed = false;
  for (const p of source.pages) for (const raw of p.text.split('\n')) {
    if (!raw.trim()) continue;
    const cells = raw.split('|').map(s => s.trim());
    if (cells.length !== 6 || !cells[0] || !cells[1] || !['scheduled', 'cancelled'].includes(cells[5])) { unparsed = true; continue; }
    const [title, audience, date, time, location, status] = cells;
    events.push({ key: JSON.stringify([source.schoolId, normal(title), normal(audience)]), title, audience, date, time, location,
      status: status as SchoolEvent['status'], instant: aucklandInstant(date, time), source, page: p.number, quote: raw });
  }
  return { events, unparsed };
}

export function prepareSchoolBriefing(input: {
  ownerId: string; revision: string; now: string; selection: z.infer<typeof schoolSelection>;
  children: SchoolChild[]; previous: SchoolSource[]; current: SchoolSource[];
}): SchoolBriefing {
  const selection = schoolSelection.parse(input.selection);
  const now = Date.parse(input.now);
  if (!input.ownerId || !input.revision || !Number.isFinite(now) || input.previous.length + input.current.length > 60 || input.children.length > 12) throw new Error('Invalid briefing scope');
  if (new Set(input.children.map(c => c.id)).size !== input.children.length) throw new Error('Duplicate child identity');
  const notices: string[] = [];
  const incompleteSchools = new Set<string>();
  const read = (sources: SchoolSource[], current: boolean) => sources.flatMap(raw => {
    const source = schoolSource.parse(raw);
    if (source.ownerId !== input.ownerId) throw new Error('School source owner mismatch');
    if (!selection.senders.map(normal).includes(senderAddress(source.sender))) return [];
    const received = Date.parse(source.receivedAt);
    if (received > now || (current && received < now - selection.days * 86400000)) return [];
    if (source.state === 'unavailable') { incompleteSchools.add(source.schoolId); notices.push(`${source.title}: source unavailable; no event can be verified.`); return []; }
    const parsed = extractSchoolRows(source);
    if (parsed.unparsed || !parsed.events.length) { incompleteSchools.add(source.schoolId); notices.push(`${source.title}: some text needs manual review; no dates or child options inferred.`); }
    return parsed.events;
  });
  const previous = read(input.previous, false), current = read(input.current, true);
  const cards: SchoolCard[] = [];
  const keys = [...new Set(current.map(e => e.key))];
  for (const key of keys) {
    const candidates = current.filter(e => e.key === key).sort((a, b) => b.source.receivedAt.localeCompare(a.source.receivedAt));
    const variants = [...new Map(candidates.map(e => [signature(e), e])).values()];
    const after = candidates[0];
    const old = previous.filter(e => e.key === key);
    // Retain every distinct prior source/page/row, including corroborating copies.
    // A conflicting baseline has no authoritative single "before" value.
    const priorEvidence = [...new Map(old.map(e => [JSON.stringify([e.source.id, e.source.url, e.page, e.quote]), e])).values()];
    const before = new Set(old.map(signature)).size > 1 ? undefined : old[0];
    const conflict = variants.length > 1 || new Set(old.map(signature)).size > 1;
    const changedFields = before ? fields.filter(f => comparable(before, f) !== comparable(after, f)) : [];
    const change = conflict ? 'conflict' : !before ? (after.status === 'cancelled' ? 'cancelled' : 'new') : !changedFields.length ? 'unchanged' : after.status === 'cancelled' ? 'cancelled' : 'changed';
    const matches = input.children.filter(c => c.role === 'child' && c.schoolId === after.source.schoolId);
    if (!matches.length) notices.push(`${after.title}: no child explicitly matched to this school.`);
    for (const child of matches) {
      const blockers: string[] = [];
      if (incompleteSchools.has(after.source.schoolId)) blockers.push('Some source evidence for this school is unavailable or unparsed. Recheck the originals.');
      if (!child.confirmedAudiences.map(normal).includes(normal(after.audience))) blockers.push('Confirm this child’s class/options against the notice.');
      if (before && signature(before) !== signature(after) && after.source.receivedAt <= before.source.receivedAt) blockers.push('Current notice does not postdate the baseline. Confirm which revision applies.');
      if (conflict) blockers.push('Conflicting notices: ask the school which version applies.');
      if (!after.instant) blockers.push('Date/time missing, invalid or ambiguous in Pacific/Auckland.');
      if (!after.location || after.location === '?') blockers.push('Location needs confirmation.');
      for (const event of [...candidates, ...old]) {
        const age = now - Date.parse(event.source.checkedAt);
        if (event.source.state !== 'available' || age > 86400000 || age < 0 || !safeSchoolLink(event.source.url)) blockers.push('Source is partial, stale or has no usable original link. Recheck before acting.');
      }
      const action = conflict ? 'Resolve conflicting source evidence before proposing a calendar change' : change === 'cancelled' ? 'Review cancelling the existing reminder/calendar event' : before ? 'Review updating the existing reminder/calendar event' : 'Review preparing a reminder/calendar event';
      cards.push({ id: JSON.stringify([input.revision, child.id, key]), childId: child.id, childName: child.displayName, before, after, change, changedFields, priorEvidence, alternatives: variants, blockers: [...new Set(blockers)], action, status: 'proposed' });
    }
  }
  if (!current.length) notices.push('No comparable current events. This does not mean no school changes.');
  return { ownerId: input.ownerId, revision: input.revision, checkedAt: input.now, cards, notices: [...new Set(notices)] };
}
/** Exact owner + revision + card review; records a draft decision only. No executor. */
export function reviewSchoolCard(brief: SchoolBriefing, command: { ownerId: string; revision: string; cardId: string; decision: 'approved' | 'dismissed'; now: string }): SchoolBriefing {
  if (brief.ownerId !== command.ownerId || brief.revision !== command.revision) throw new Error('Review scope changed');
  const elapsed = Date.parse(command.now) - Date.parse(brief.checkedAt);
  if (!Number.isFinite(elapsed) || elapsed < 0 || elapsed > 15 * 60000) throw new Error('Briefing is stale. Prepare again.');
  const target = brief.cards.find(c => c.id === command.cardId);
  if (!target || (command.decision === 'approved' && (target.blockers.length || target.change === 'unchanged'))) throw new Error('Resolve evidence before review');
  return { ...brief, cards: brief.cards.map(c => c.id === target.id ? { ...c, status: command.decision } : c) };
}
