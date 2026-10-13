'use client';

import { useRef, useState } from 'react';
import { reviewSchoolCard, safeSchoolLink, type SchoolBriefing as Brief, type SchoolEvent } from '@/apps/do/school/briefing';
import { SCHOOL_DEMO_NOW, SCHOOL_DEMO_OWNER } from '@/apps/do/school/fixtures';
import './school-briefing.css';

function Evidence({ event, label }: { event: SchoolEvent; label: string }) {
  const url = safeSchoolLink(event.source.url);
  return <div className="school-evidence"><h4>{label}</h4><p><strong>{event.date} · {event.time}</strong><br/>{event.location} · {event.status}</p><p className="school-detail">Pacific/Auckland{event.instant ? ` · ${event.instant}` : ' · exact time unconfirmed'}</p><blockquote>{event.quote}</blockquote>{url && <a href={`${url}#page=${event.page}`} target="_blank" rel="noopener noreferrer">{event.source.title} · page {event.page}</a>}</div>;
}
export function SchoolBriefing() {
  const [selected, setSelected] = useState(['office@harbour.example', 'office@hill.example']);
  const [days, setDays] = useState<7 | 14 | 30>(14);
  const [matched, setMatched] = useState(false);
  const [scenario, setScenario] = useState('revised');
  const [brief, setBrief] = useState<Brief | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  function invalidate() { generation.current++; setBusy(false); setBrief(null); setError(''); }
  async function prepare() {
    const run = ++generation.current;
    setBusy(true); setBrief(null); setError('');
    try {
      const res = await fetch('/api/do/family/school-preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senders: selected, days, scenario, confirmed: matched }) });
      const data = await res.json();
      if (run !== generation.current) return;
      if (!res.ok) throw new Error(data.message || 'The sample briefing is unavailable.');
      setBrief(data.brief);
    } catch (e) { if (run === generation.current) { setBrief(null); setError(e instanceof Error ? e.message : 'The sample briefing is unavailable.'); } }
    finally { if (run === generation.current) setBusy(false); }
  }
  function review(cardId: string, decision: 'approved' | 'dismissed') {
    if (!brief) return;
    try { setBrief(reviewSchoolCard(brief, { ownerId: SCHOOL_DEMO_OWNER, revision: brief.revision, cardId, decision, now: SCHOOL_DEMO_NOW })); }
    catch { setError('The evidence needs another check. Prepare the briefing again.'); }
  }
  return <section className="school-briefing" aria-labelledby="school-heading">
    <div className="school-heading"><div><h2 id="school-heading">What changed at school?</h2><p>Compare an earlier notice with the revision, then review what needs changing.</p></div><span className="school-label">Fictional preview</span></div>
    <p className="school-boundary">Local sample as at 13 October 2026. No inbox, model, saved family history or calendar is connected to this preview. The Gmail digest below is a separate live service: Prepare my school admin reads selected emails through Pipedream and sends selected text to TypeSafe and OpenAI (GPT-6 Astra) after its consent. It does not unlock this preview or provide a private school-comparison pilot.</p>
    <div className="school-controls"><fieldset><legend>School senders</legend>{['harbour', 'hill'].map(s => { const email = `office@${s}.example`; return <label key={s}><input type="checkbox" checked={selected.includes(email)} onChange={e => { invalidate(); setSelected(v => e.target.checked ? [...v, email] : v.filter(x => x !== email)); }}/>{email}</label>; })}</fieldset>
      <label>Look back<select value={days} onChange={e => { invalidate(); setDays(Number(e.target.value) as 7 | 14 | 30); }}><option value={7}>7 days</option><option value={14}>14 days</option><option value={30}>30 days</option></select></label>
      <label>Sample notice<select value={scenario} onChange={e => { invalidate(); setScenario(e.target.value); }}><option value="revised">Revised exam + cancelled visit</option><option value="duplicate">Duplicate forwarded notice</option><option value="conflict">Conflicting current notices</option><option value="baseline-conflict">Conflicting earlier notices</option><option value="missing">Missing date</option><option value="stale">Stale source</option><option value="unavailable">Unavailable source</option></select></label>
    </div>
    <label className="school-match"><input type="checkbox" checked={matched} onChange={e => { invalidate(); setMatched(e.target.checked); }}/>For this fictional example, confirm Alex at Harbour is in Year 9 and Robin at Hill is in Year 7. Class options and transport are not inferred.</label>
    <div className="school-actions"><button className="family-primary" disabled={busy} onClick={() => void prepare()}>{busy ? 'Reading sample PDFs…' : 'Compare sample notices'}</button><button onClick={() => { invalidate(); setMatched(false); }}>Clear preview</button></div>
    <div role="status" aria-live="polite">{error && <p>{error}</p>}{brief && <p>{brief.cards.length} items prepared for review. {brief.cards.filter(c => c.status === 'approved').length} reviewed draft decisions. Nothing changed in a calendar.</p>}</div>
    {brief?.notices.map(n => <p className="school-warning" key={n}>{n}</p>)}
    {brief?.cards.map(card => <article className="school-change" key={card.id}>
      <div className="school-heading"><div><h3>{card.after.title}</h3><p>{card.childName} · {card.after.audience}</p></div><strong className="school-label">{card.change}</strong></div>
      <div className="school-comparison">{card.before ? <Evidence event={card.before} label="Previously seen"/> : <p>{card.priorEvidence.length ? 'Earlier sources conflict; no single previous value can be chosen.' : 'No earlier source-backed event.'}</p>}<Evidence event={card.after} label="Current notice"/></div>
      {(card.change === 'conflict' || card.priorEvidence.length > 1) && <details className="school-source-review"><summary>Inspect earlier and current source rows</summary><h4>Earlier source evidence</h4>{card.priorEvidence.map((e, i) => <Evidence key={i} event={e} label={`Earlier notice ${i + 1}`}/>)}<h4>Current source evidence</h4>{card.alternatives.map((e, i) => <Evidence key={i} event={e} label={`Current notice ${i + 1}`}/>)}</details>}
      {card.changedFields.length > 0 && <p>Changed: {card.changedFields.join(', ')}.</p>}
      {card.blockers.length > 0 && <ul className="school-warning">{card.blockers.map(b => <li key={b}>{b}</li>)}</ul>}
      <p><strong>{card.action}.</strong> Confirm the actual calendar event and reminder timing before any future write. No duration, pickup or transport arrangement has been assumed.</p>
      <div className="school-actions"><button disabled={Boolean(card.blockers.length) || card.change === 'unchanged' || card.status !== 'proposed'} onClick={() => review(card.id, 'approved')}>Mark draft reviewed</button><button disabled={card.status !== 'proposed'} onClick={() => review(card.id, 'dismissed')}>Dismiss proposal</button><span>{card.status === 'approved' ? 'Reviewed draft · no external action' : card.status === 'dismissed' ? 'Dismissed · no external action' : 'Awaiting adult review'}</span></div>
    </article>)}
    <details className="school-limits"><summary>Private pilot requirements and current limits</summary><p>This preview recognises explicit timetable rows only. Scanned PDFs, prose notices and uncertain rows require manual review; this is not general PDF understanding. Reopening clears the preview.</p><p>Before live use: sign into DO, verify your own read-only Gmail connection through Pipedream, select exact senders and a 7/14/30-day window, and separately approve the exact information and any named processors. Chat Gmail access gives DO no access.</p><p>The existing email digest below sends selected text to OpenAI (GPT-6 Astra) and TypeSafe only with its separate consent. The school comparison pilot is closed pending verified account-isolated storage, retention/deletion and attachment permissions. Background ingestion, calendar writes and notifications are unavailable.</p></details>
  </section>;
}
