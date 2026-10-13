import 'server-only';
import { z } from 'zod';
import { digest } from '../coordination/protocol';
import { schoolSelection, schoolSource, prepareSchoolBriefing, type SchoolSource, type SchoolChild } from './briefing';
import { agendaWindow, calendarReadInput, prepareSchoolAgenda, type AgendaCalendar, type SchoolAgenda } from './agenda';

/** A server-resolved receipt, never client-supplied consent or provider credentials. */
export const pilotScopeSchema = schoolSelection.extend({
  calendarId: z.string().min(1).max(512), startDate: z.string(), agendaDays: z.union([z.literal(1), z.literal(7)]),
  retentionDays: z.union([z.literal(1), z.literal(7), z.literal(30)]),
  processing: z.literal('school-deterministic-v1'), termsDigest: z.string().regex(/^[a-f0-9]{64}$/),
}).strict();
export type PilotScope = z.infer<typeof pilotScopeSchema>;
export type PilotLease = {
  ownerId: string; historyRevision: number; approvalId: string; approvalRevision: number; scopeDigest: string;
  gmailConnectionId: string; gmailRevision: number; calendarConnectionId: string; calendarRevision: number;
  gmailScopes: string[]; calendarScopes: string[]; issuedAt: string; expiresAt: string;
};
export type SchoolHistory = { revision: number; sources: SchoolSource[] };
/** Durable adapter must atomically enforce owner, active approval/connection revisions,
 * history CAS and delete/revoke tombstones at read/commit/publish, using server time.
 * No browser persistence and no production implementation is bound to this port. */
export type PilotPorts = {
  now(): string;
  owner(): Promise<string | null>;
  authorize(ownerId: string, approvalId: string): Promise<{ lease: PilotLease; scope: PilotScope; children: SchoolChild[]; links: Record<string, string> }>;
  history(lease: PilotLease): Promise<SchoolHistory>;
  readMail(lease: PilotLease, selection: { senders: string[]; days: 7 | 14 | 30; before: string }): Promise<SchoolSource[]>;
  readCalendar(lease: PilotLease, input: ReturnType<typeof calendarReadInput>): Promise<AgendaCalendar>;
  assertActive(lease: PilotLease): Promise<void>;
  /** Stage candidate evidence only; do not promote it over the reviewed baseline. */
  commit(lease: PilotLease, expectedRevision: number, sources: SchoolSource[], expiresAt: string): Promise<number>;
  publish(lease: PilotLease, historyRevision: number, agenda: SchoolAgenda): Promise<SchoolAgenda>;
};
/** One bounded iteration. No cron, OAuth, model, notification or write action. */
export async function stageSchoolPilot(command: { workspace: string; approvalId: string }, ports: PilotPorts): Promise<SchoolAgenda> {
  const ownerId = await ports.owner();
  if (!ownerId || command.workspace !== ownerId) throw new Error('Pilot account changed');
  const grant = await ports.authorize(ownerId, command.approvalId);
  const scope = pilotScopeSchema.parse(grant.scope), lease = grant.lease;
  const identityScopes = new Set(['openid', 'email', 'profile', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']);
  function exactRead(scopes: string[], required: string) { return scopes.includes(required) && scopes.every(s => s === required || identityScopes.has(s)); }
  if (!exactRead(lease.gmailScopes, 'https://www.googleapis.com/auth/gmail.readonly') || !exactRead(lease.calendarScopes, 'https://www.googleapis.com/auth/calendar.events.owned.readonly')) throw new Error('Pilot verified read scopes required');
  const now = ports.now(), issued = Date.parse(lease.issuedAt), expires = Date.parse(lease.expiresAt);
  if (lease.ownerId !== ownerId || lease.approvalId !== command.approvalId || !Number.isInteger(lease.historyRevision) || lease.historyRevision < 0 || !Number.isInteger(lease.approvalRevision) || lease.approvalRevision < 1 ||
    !lease.gmailConnectionId || !lease.calendarConnectionId || !Number.isInteger(lease.gmailRevision) || lease.gmailRevision < 1 || !Number.isInteger(lease.calendarRevision) || lease.calendarRevision < 1 ||
    !Number.isFinite(issued) || !Number.isFinite(expires) || expires <= issued || expires - issued > 15 * 60000 ||
    lease.scopeDigest !== await digest({ scope, children: grant.children, links: grant.links })) throw new Error('Pilot approval scope invalid');
  async function active() {
    const current = Date.parse(ports.now());
    if (!Number.isFinite(current) || current < issued || current >= expires || await ports.owner() !== ownerId) throw new Error('Pilot account or approval expired');
    await ports.assertActive(lease);
  }
  const range = agendaWindow({ startDate: scope.startDate, days: scope.agendaDays });
  await active();
  const history = await ports.history(lease);
  if (history.revision !== lease.historyRevision) throw new Error('Pilot history changed; renew approval');
  if (history.sources.length > 40 || history.sources.some(s => s.ownerId !== ownerId || !scope.senders.includes(s.sender))) throw new Error('Pilot source scope mismatch');
  history.sources.forEach(s => schoolSource.parse(s));
  await active();
  const current = await ports.readMail(lease, { senders: scope.senders, days: scope.days, before: now });
  await active();
  // Apply bounds again at the port boundary, rather than trusting a provider query.
  if (current.length > 20 || history.sources.length > 40 || [...current, ...history.sources].some(s => s.ownerId !== ownerId) || current.some(s => !scope.senders.includes(s.sender) || Date.parse(s.receivedAt) > Date.parse(now) || Date.parse(s.receivedAt) < Date.parse(now) - scope.days * 86400000)) throw new Error('Pilot source scope mismatch');
  [...current, ...history.sources].forEach(s => schoolSource.parse(s));
  const calendar = await ports.readCalendar(lease, calendarReadInput(scope.calendarId, range));
  await active();
  if (calendar.ownerId !== ownerId || calendar.calendarId !== scope.calendarId || calendar.connectionId !== lease.calendarConnectionId || calendar.connectionRevision !== lease.calendarRevision) throw new Error('Pilot calendar scope mismatch');
  const brief = prepareSchoolBriefing({ ownerId, revision: `${lease.approvalId}:${lease.approvalRevision}:${history.revision}`, now, selection: { senders: scope.senders, days: scope.days }, children: grant.children, previous: history.sources, current });
  const agenda = prepareSchoolAgenda(brief, calendar, { startDate: scope.startDate, days: scope.agendaDays }, grant.links);
  // Never replace a trusted baseline with failed, conflicting or unparsed evidence.
  if (brief.notices.length || brief.cards.some(c => c.blockers.length || c.change === 'conflict') || agenda.notices.length) throw new Error('Pilot evidence incomplete; history unchanged');
  await active();
  const retentionEnd = new Date(Date.parse(now) + scope.retentionDays * 86400000).toISOString();
  const revision = await ports.commit(lease, history.revision, current, retentionEnd);
  await active();
  return ports.publish(lease, revision, agenda);
}
