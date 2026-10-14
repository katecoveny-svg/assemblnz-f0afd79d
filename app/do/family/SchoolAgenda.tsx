'use client';
import { useRef, useState } from 'react';
import { DoTaskScene } from '@/components/do/DoTaskScene';
import { prepareSchoolAgenda, agendaDigest, reviewAgendaAction, type SchoolAgenda as Agenda } from '@/apps/do/school/agenda';
import { schoolCalendarFixture, schoolCalendarLinks } from '@/apps/do/school/agenda-fixtures';
import { SCHOOL_DEMO_NOW } from '@/apps/do/school/fixtures';
import { safeSchoolLink, type SchoolBriefing } from '@/apps/do/school/briefing';
export function SchoolAgenda({ brief }: { brief: SchoolBriefing }) {
  const [days, setDays] = useState<1 | 7>(7), [startDate, setStartDate] = useState('2026-10-19');
  const generation = useRef(0);
  const [reviewed, setReviewed] = useState<Agenda | null>(null), [error, setError] = useState('');
  const agenda = reviewed ?? prepareSchoolAgenda(brief, schoolCalendarFixture(), { startDate, days }, schoolCalendarLinks);
  async function review(cardId: string, decision: 'reviewed' | 'dismissed') {
    const run = generation.current;
    try { const next = await reviewAgendaAction(agenda, { ownerId: brief.ownerId, revision: brief.revision, digest: await agendaDigest(agenda), cardId, decision, now: SCHOOL_DEMO_NOW }); if (run === generation.current) setReviewed(next); }
    catch { setError('Prepare the agenda again before reviewing.'); }
  }
  return <section aria-labelledby="school-agenda-heading" className="school-change school-agenda">
    <div className="school-agenda-title"><DoTaskScene kind="agenda"/><div><p className="family-kicker">YOUR REVIEW DESK</p><h3 id="school-agenda-heading">School and calendar agenda</h3></div></div>
    <p>Fictional calendar · Pacific/Auckland. Daily and weekly are views; no scheduled job or notification is enabled. Event links below are explicitly selected fixture matches.</p>
    <div className="school-controls"><label>Agenda view<select value={days} onChange={e => { generation.current++; setReviewed(null); setDays(Number(e.target.value) as 1 | 7); }}><option value={1}>Daily</option><option value={7}>Weekly</option></select></label>
      <label>Agenda starting<select value={startDate} onChange={e => { generation.current++; setReviewed(null); setStartDate(e.target.value); }}>{['19', '20', '21', '22', '23'].map(d => <option key={d} value={`2026-10-${d}`}>{d}/10/2026</option>)}</select></label></div>
    {agenda.notices.map(n => <p className="school-warning" key={n}>{n}</p>)}
    {agenda.entries.map(({ card, position, action, clashes }) => <article key={card.id} className="school-evidence school-agenda-entry">
      <div className="school-agenda-entry-head"><span className="school-date-chip">{card.after.date}<small>{card.after.time}</small></span><div><span className="school-label">{card.change}</span><h4>{card.childName}: {card.after.title}</h4></div></div><p>{card.before ? `Previously: ${card.before.date} ${card.before.time}. ` : ''}Current notice: {card.after.date} {card.after.time} · {card.after.location}</p>
      <p>{position === 'moved_out' ? 'Moved out of this agenda window; previous date retained for review.' : position === 'needs_date' ? 'Date needs confirmation.' : 'In this agenda window.'}</p>
      <p><a href={safeSchoolLink(card.after.source.url) ?? undefined} target="_blank" rel="noopener noreferrer">Current school source · page {card.after.page}</a></p>
      {clashes.length > 0 && <p className="school-warning">Possible calendar conflict: {clashes.map(id => agenda.calendarEvents.find(e => e.id === id)?.title ?? id).join(', ')}</p>}
      <p>Proposed calendar {action.kind} · {action.eventId ?? 'existing event not selected'}</p>
      {action.blockers.length > 0 && <ul>{action.blockers.map(b => <li key={b}>{b}</li>)}</ul>}
      <div className="school-actions"><button disabled={action.blockers.length > 0 || action.status !== 'proposed'} onClick={() => void review(card.id, 'reviewed')}>Review calendar draft</button><button disabled={action.status !== 'proposed'} onClick={() => void review(card.id, 'dismissed')}>Dismiss calendar draft</button><span>{action.status} · no calendar write</span></div>
    </article>)}
    <h4>Selected calendar evidence</h4><p>Only start-time overlaps can be checked until the school confirms duration. Missing or stale events do not establish availability.</p>
    {agenda.calendarEvents.map(e => <p key={e.id}><a href={e.sourceUrl} target="_blank" rel="noopener noreferrer">{e.title}</a> · {e.timing.kind === 'all-day' ? `${e.timing.startDate} all day (ends before ${e.timing.endDateExclusive})` : new Intl.DateTimeFormat('en-NZ', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Pacific/Auckland' }).format(new Date(e.timing.range.start))} · {e.status}</p>)}
    {error && <p role="alert">{error}</p>}
  </section>;
}
