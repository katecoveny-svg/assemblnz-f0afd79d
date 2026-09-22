'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, Download, Search, Check } from 'lucide-react';
import { Draft, type PublicResearchResult } from '@/lib/pursuit/public-contract';
import { buildPitchHtml } from '@/lib/pursuit/pitch-export';
import styles from './live-pursuit.module.css';
import { useResearchAvailability, refreshResearchAvailability } from './useResearchAvailability';

const EXAMPLES = [
  { company: 'NZ Post', goal: 'Find a source-backed customer service opportunity where a small demonstrator could make parcel delivery questions easier to resolve.' },
  { company: 'New Zealand retirement villages', goal: 'Research one useful way to help families prepare questions and compare publicly stated services before contacting a village.' },
];

function saveFile(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function LivePursuitCanvas() {
  const status = useResearchAvailability();
  const [company, setCompany] = useState('');
  const [goal, setGoal] = useState('');
  const [consent, setConsent] = useState(false);
  const [useTypeSafe, setUseTypeSafe] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<PublicResearchResult | null>(null);
  const [reviewed, setReviewed] = useState(false);
  const [tab, setTab] = useState<'evidence' | 'proposal' | 'plan'>('evidence');

  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy || !status?.ready) return;
    setBusy(true); setError(''); setResult(null); setReviewed(false);
    try {
      const response = await fetch('/api/pursuit/research', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: crypto.randomUUID(), company, goal, consent, useTypeSafe: useTypeSafe && status.typesafeReady }), signal: AbortSignal.timeout(115000) });
      const value = await response.json();
      if (!response.ok) throw new Error(typeof value.error === 'string' ? value.error : 'Research was not completed.');
      Draft.parse(value.draft);
      if (value.mode !== 'live' || !Array.isArray(value.trace?.sources) || !value.trace.sources.length) throw new Error('The response did not include a source trail.');
      setResult(value); setTab('evidence');
    } catch (e) { setError(e instanceof Error ? e.message : 'Research could not be completed.'); }
    finally { setBusy(false); refreshResearchAvailability(); }
  }

  const title = result?.draft.title ?? 'An opportunity starts with a question.';
  return <section className={styles.section} id="try-pursuit" aria-labelledby="try-pursuit-title">
    <header className={styles.heading}><div><p className={styles.kicker}>Pursuit / research you can use</p><h2 id="try-pursuit-title">Already have<br /><span>a company in mind?</span></h2></div><p>Ask a specific question about a company or sector. Review the research and download an editable pitch with its sources.</p></header>
    <div className={styles.canvas}>
      <form onSubmit={submit} className={styles.form}>
        <p className={styles.status}>{status?.message ?? (status === null ? 'Checking research availability…' : status.ready ? 'Public research is available.' : 'Live research is temporarily unavailable.')}</p>
        <label>Company or sector<input name="company" value={company} onChange={e => setCompany(e.target.value)} minLength={2} maxLength={120} required placeholder="A New Zealand company or sector" /></label>
        <label>What should the agent investigate?<textarea name="goal" value={goal} onChange={e => setGoal(e.target.value)} minLength={12} maxLength={700} required rows={5} placeholder="Find a specific customer problem we could demonstrate a better way to solve." /></label>
        <div className={styles.examples} aria-label="Example research briefs">{EXAMPLES.map(example => <button key={example.company} type="button" disabled={busy} onClick={() => { setCompany(example.company); setGoal(example.goal); }}>{example.company}<ArrowUpRight size={13} /></button>)}</div>
        <label className={styles.check}><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required /><span>Send this public brief to the research provider. Do not include passwords, confidential information or personal records. The result is stored for retries and abuse control.</span></label>
        {status?.typesafeReady && <label className={styles.check}><input type="checkbox" checked={useTypeSafe} onChange={e => setUseTypeSafe(e.target.checked)} /><span>Also share the public research draft with TypeSafe to suggest a next action. This does not authorise an external action.</span></label>}
        <button className={styles.primary} type="submit" disabled={busy || !status?.ready || !consent}>{busy ? 'Research request running…' : 'Research an opportunity'}<Search size={17} /></button>
        <p className={styles.note}>A limited free trial. No sign-in to your private systems. No messages, purchases or publication. <Link href="/tools/agents">How the tools work</Link>.</p>
        {error && <p role="alert" className={styles.error}>{error}</p>}
      </form>
      <div className={styles.board} aria-busy={busy}>
        <div className={styles.boardTop}><span>the pursuit canvas</span><span>{result ? 'DRAFT / SOURCE-LINKED' : busy ? 'REQUEST IN PROGRESS' : 'YOUR WORK APPEARS HERE'}</span></div>
        <h3>{title}</h3>
        {!result ? <div className={styles.empty}><div className={styles.paperStack} aria-hidden="true"><i /><i /><i /><Search size={34} /></div><p>{busy ? 'Searching public sources and preparing the brief. This can take a minute or two.' : 'Your research will appear here, with links to the evidence and a proposed next step.'}</p><ol><li>Find published evidence.</li><li>Develop a proposed opportunity.</li><li>Review and export the pitch.</li></ol></div> : <>
          <p>{result.draft.summary}</p>
          <div className={styles.tabs} aria-label="Review your pursuit">{(['evidence', 'proposal', 'plan'] as const).map(name => <button key={name} type="button" onClick={() => setTab(name)} aria-pressed={tab === name}>{name}<ArrowRight size={14} /></button>)}</div>
          <div className={styles.cards}>
            {tab === 'evidence' && result.draft.evidence.map((fact, i) => <article key={fact.url + i}><span>SOURCE {i + 1}</span><p>{fact.claim}</p><a href={fact.url} target="_blank" rel="noopener noreferrer">Read the source<ArrowUpRight size={14} /></a></article>)}
            {tab === 'proposal' && <><article><span>PROPOSED OPPORTUNITY</span><p>{result.draft.opportunity}</p></article><article><span>PROPOSED WORK</span><p>{result.draft.proposedWork}</p></article></>}
            {tab === 'plan' && <><article><span>DELIVERABLES</span>{result.draft.deliverables.map(t => <p key={t}>{t}</p>)}</article><article><span>STILL TO CHECK</span>{result.draft.unknowns.map(t => <p key={t}>{t}</p>)}</article><article><span>NEXT STEPS</span>{result.draft.nextSteps.map(t => <p key={t}>{t}</p>)}</article></>}
          </div>
          <details className={styles.trace}><summary>See what actually ran</summary><p>Model: {result.trace.model}. Web searches: {result.trace.webSearches}. Public knowledge records: {result.trace.knowledgeIds.join(', ')}.</p><p>TypeSafe: {result.trace.typesafe.status}{result.trace.typesafe.action ? ` / ${result.trace.typesafe.action}` : ''}. Receipt: {result.trace.id}. Retrieved: {result.trace.at}.</p><p>Private client knowledge was not searched. A matching source URL is not independent fact-checking.</p></details>
          <label className={styles.check}><input type="checkbox" checked={reviewed} onChange={e => setReviewed(e.target.checked)} /><span>I have reviewed the evidence and understand this is a proposed opportunity, not an agreed client project.</span></label>
          <div className={styles.exports}><button type="button" disabled={!reviewed} onClick={() => saveFile('assembl-pursuit-pitch.html', buildPitchHtml(result), 'text/html')}>Export the pitch<Download size={16} /></button><button type="button" disabled={!reviewed} onClick={() => saveFile('assembl-pursuit-handoff.json', JSON.stringify(result, null, 2), 'application/json')}>Save source brief<Check size={15} /></button></div>
          <small>Editable HTML slides, with sources. Print to PDF in your browser. The export does not create or update a private client hub.</small>
        </>}
      </div>
    </div>
  </section>;
}
