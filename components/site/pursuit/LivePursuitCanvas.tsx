'use client';
import { retainDirectSourceGoal, DIRECT_STARTER_PLAN_DESCRIPTION, DIRECT_FOCUS_VALUES, DIRECT_FOCUS_LABELS, type DirectFocus } from '@/lib/pursuit/direct-proposal';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, Download, Search, Check } from 'lucide-react';
import { Draft, type PublicFailureReceipt, type PublicPresentationResult } from '@/lib/pursuit/public-contract';
import {readPublicFailureReceipt} from '@/lib/pursuit/public-cost-admission';
import { buildPitchHtml } from '@/lib/pursuit/pitch-export';
import styles from './live-pursuit.module.css';
import { useResearchAvailability, refreshResearchAvailability } from './useResearchAvailability';
import { PursuitWalkthrough } from './PursuitWalkthrough';
import walkthroughStyles from './pursuit-walkthrough.module.css';
import { bindPublicPresentation, matchesPublicAttempt, publicAttempt, type PublicAttempt } from '@/lib/pursuit/public-attempt';

const EXAMPLES = [
  { company: 'NZ Post', goal: 'Find a source-backed customer service opportunity where a small demonstrator could make parcel delivery questions easier to resolve.' },
  { company: 'New Zealand retirement villages', goal: 'Research one useful way to help families prepare questions and compare publicly stated services before contacting a village.' },
];

function saveFile(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function LivePursuitCanvas({ homepage = false }: { homepage?: boolean }) {
  const status = useResearchAvailability();
  const [directSource, setDirectSource] = useState(false);
  const [directFocus, setDirectFocus] = useState<DirectFocus>('goal-led');
  const [company, setCompany] = useState('');
  const [goal, setGoal] = useState('');
  const [consent, setConsent] = useState(false);
  const [useTypeSafe, setUseTypeSafe] = useState(false);
  const [busy, setBusy] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [failureReceipt,setFailureReceipt]=useState<PublicFailureReceipt|null>(null);
  const [error, setError] = useState('');
  const [requestState, setRequestState] = useState<'unknown'|'pending'|'failed'|'not_found'|'not_started'>('unknown');
  const [result, setResult] = useState<PublicPresentationResult | null>(null);
  const [reviewed, setReviewed] = useState(false);
  const [tab, setTab] = useState<'evidence' | 'proposal' | 'plan'>('evidence');
  const [attempt, setAttempt] = useState<PublicAttempt | null>(null);
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);
  const brief = { company, goal, consent: true as const, useTypeSafe, ...(directSource ? {sourceMode:'direct_source_brief' as const,directFocus}: {}) };
  const canRecover = matchesPublicAttempt(attempt, brief);

  async function submit(event: FormEvent) {
    event.preventDefault(); if (active.current || !consent || (!status?.ready && !canRecover)) return;
    const recovering = matchesPublicAttempt(attempt, brief);
    const next = recovering ? attempt! : publicAttempt(null, brief, () => crypto.randomUUID());
    const controller = new AbortController(); active.current = controller; setAttempt(next);
    setIsRecovering(recovering); setBusy(true); setError(''); setFailureReceipt(null); setRequestState('unknown'); setResult(null); setReviewed(false);
    try {
      const response = await fetch('/api/pursuit/research', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(recovering ? { 'X-Pursuit-Recovery': 'lookup-only' } : {}) },
        body: JSON.stringify(next.input), signal: AbortSignal.any([controller.signal, AbortSignal.timeout(115000)]) });
      const value = await response.json();
      if (!response.ok) {
        setFailureReceipt(readPublicFailureReceipt(value.receipt,next.input.requestId)??null);
        setRequestState(value.code === 'pending' ? 'pending' : value.code === 'not_found' ? 'not_found' : ['client_limit','daily_limit','disabled'].includes(value.code) ? 'not_started' : ['failed','untraced_source','direct_sources_unavailable','direct_brief_failed','direct_quote_untraced','direct_quote_drift','direct_inference_unavailable','direct_inference_protocol','direct_inference_usage','direct_proposal_unsupported'].includes(value.code) ? 'failed' : 'unknown');
        throw new Error(typeof value.error === 'string' ? value.error : 'Request status is unknown.');
      }
      Draft.parse(value.draft);
      if (!['live','direct_source_brief'].includes(value.mode) || !Array.isArray(value.trace?.sources) || !value.trace.sources.length) throw new Error('The response did not include a source trail.');
      setResult(bindPublicPresentation(value,next)); setTab('evidence');
    } catch (e) {
      setError(e instanceof DOMException && (e.name === 'AbortError' || e.name === 'TimeoutError')
        ? 'Stopped waiting. The bounded request may still finish. Recover this same brief to check its saved result; no fresh research request is created.'
        : e instanceof Error ? e.message : 'Research could not be completed.');
    }
    finally { active.current = null; setBusy(false); refreshResearchAvailability(); }
  }

  const title = result?.draft.title ?? 'An opportunity starts with a question.';
  return <section className={styles.section} id="try-pursuit" aria-labelledby="try-pursuit-title">
    <header className={styles.heading}><div><p className={styles.kicker}>Pursuit / research you can use</p><h2 id="try-pursuit-title">{homepage ? <>Ask a question.<br /><span>Get a sourced first step.</span></> : <>Already have<br /><span>a company in mind?</span></>}</h2></div><p>Ask a specific question about a company or sector. Review the research and download an editable pitch with its sources.</p></header>
    <div className={`${styles.canvas} ${!result && !busy ? walkthroughStyles.previewCanvas : ''}`}>
      <form onSubmit={submit} className={styles.form}>
        <p className={styles.status}>{status?.message ?? (status === null ? 'Checking research availability…' : status.ready ? 'Public research is available.' : 'Live research is temporarily unavailable.')}</p>
        <label className={styles.check}><input type="checkbox" disabled={busy} checked={directSource} onChange={e=>{setDirectSource(e.target.checked);if(e.target.checked){setCompany('assembl.co.nz');setGoal(retainDirectSourceGoal);setUseTypeSafe(false);}}} /><span>Scoped Assembl brief: check its website and fixed official AI-use guidance (delivery context, not market evidence). Zero web searches; no prospect discovery.</span></label>
        {directSource && <label>What kind of work should this scoped plan explore?<select disabled={busy} value={directFocus} onChange={e=>setDirectFocus(e.target.value as DirectFocus)}>{DIRECT_FOCUS_VALUES.map(focus=><option value={focus} key={focus}>{DIRECT_FOCUS_LABELS[focus]}</option>)}</select><small>{DIRECT_STARTER_PLAN_DESCRIPTION}</small></label>}
        <label>Company or sector<input name="company" disabled={busy || directSource} value={company} onChange={e => setCompany(e.target.value)} minLength={2} maxLength={120} required placeholder="A New Zealand company or sector" /></label>
        <label>What should the agent investigate?<textarea name="goal" disabled={busy} value={goal} onChange={e => setGoal(e.target.value)} minLength={12} maxLength={700} required rows={5} placeholder="Find a specific customer problem we could demonstrate a better way to solve." /></label>
        <div className={styles.examples} aria-label="Example research briefs">{!directSource && EXAMPLES.map(example => <button key={example.company} type="button" disabled={busy} onClick={() => { setCompany(example.company); setGoal(example.goal); }}>{example.company}<ArrowUpRight size={13} /></button>)}</div>
        <label className={styles.check}><input type="checkbox" disabled={busy} checked={consent} onChange={e => setConsent(e.target.checked)} required /><span>Send this public brief to the research provider. Do not include passwords, confidential information or personal records. The result is stored for retries and abuse control.</span></label>
        {!directSource && status?.typesafeReady && <label className={styles.check}><input type="checkbox" disabled={busy} checked={useTypeSafe} onChange={e => setUseTypeSafe(e.target.checked)} /><span>Also share the public research draft with TypeSafe to suggest a next action. This does not authorise an external action.</span></label>}
        <button className={styles.primary} type="submit" disabled={busy || (!status?.ready && !canRecover) || !consent}>{busy ? isRecovering ? 'Checking saved request…' : 'Research request running…' : canRecover ? 'Recover this request' : 'Research an opportunity'}<Search size={17} /></button>
        {busy && <button type="button" onClick={() => active.current?.abort()}>Stop waiting</button>}
        <p className={styles.note}>A limited free trial. No sign-in to your private systems. No messages, purchases or publication. <Link href="/tools/agents">How the tools work</Link>.</p>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        {error && failureReceipt && <p className={styles.note}>Failed-request budget receipt: {failureReceipt.providerCalls} attempted provider calls; maximum reserved model charge US${failureReceipt.budget.reservedUpperUsd.toFixed(3)} before tax. Stage: {failureReceipt.stage}. Recovery does not start another call.</p>}
      </form>
      <div className={styles.board} aria-busy={busy}>
        <div className={styles.boardTop}><span>the pursuit canvas</span><span>{result ? 'DRAFT / SOURCE-LINKED' : busy ? isRecovering ? 'CHECKING SAVED REQUEST' : 'REQUEST IN PROGRESS' : 'YOUR WORK APPEARS HERE'}</span></div>
        {(result || busy) && <h3>{title}</h3>}
        {!result ? busy ? <div className={styles.empty}><p role="status">{isRecovering ? 'Checking saved request. This lookup does not start research.' : directSource ? 'Checking the two fixed public pages and preparing a scoped brief. This can take a minute or two.' : 'Searching public sources and preparing the brief. This can take a minute or two.'}</p></div> : error ? <div className={styles.empty}><h3>{requestState === 'failed' ? 'No verified research result.' : requestState === 'pending' ? 'Research is still running.' : requestState === 'not_found' ? 'No saved request found.' : requestState === 'not_started' ? 'Research was not started.' : 'Request status is unknown.'}</h3><p>{requestState === 'failed' ? 'The saved request did not complete.' : requestState === 'pending' ? 'Recover this same brief later to check its saved result.' : requestState === 'not_found' ? 'Recovery only checked for an existing request. It did not start research.' : requestState === 'not_started' ? 'This request was not admitted. Recovery cannot start research.' : 'The bounded request may still finish. Recovery only checks its saved status.'} The illustration has not been used as a result.</p></div> : homepage ? <div className={styles.empty}><h3>Your first piece of work.</h3><p>Research one company or sector. Get public sources, a proposed opening and a small work plan you can review and export.</p><p>Choose a brief and consent before the agent runs.</p></div> : <PursuitWalkthrough compact /> : <>
          {result.scopedPlan && <article><h3>Your brief</h3><p>{result.scopedPlan.yourBrief}</p><small>Unverified user input. Focus: {DIRECT_FOCUS_LABELS[result.scopedPlan.focus]}.</small><p className={styles.note}>{DIRECT_STARTER_PLAN_DESCRIPTION}</p></article>}
          <p>{result.draft.summary}</p><p className={styles.note}>{result.warning}</p>
          <div className={styles.tabs} aria-label="Review your pursuit">{(['evidence', 'proposal', 'plan'] as const).map(name => <button key={name} type="button" onClick={() => setTab(name)} aria-pressed={tab === name}>{name}<ArrowRight size={14} /></button>)}</div>
          <div className={styles.cards}>
            {tab === 'evidence' && result.draft.evidence.map((fact, i) => <article key={fact.url + i}><span>SOURCE {i + 1}</span><p>{fact.claim}</p><a href={fact.url} target="_blank" rel="noopener noreferrer">Read the source<ArrowUpRight size={14} /></a></article>)}
            {tab === 'proposal' && <><article><span>PROPOSED OPPORTUNITY</span><p>{result.draft.opportunity}</p></article><article><span>PROPOSED WORK</span><p>{result.draft.proposedWork}</p></article></>}
            {tab === 'plan' && <><article><span>DELIVERABLES</span>{result.draft.deliverables.map(t => <p key={t}>{t}</p>)}</article><article><span>STILL TO CHECK</span>{result.draft.unknowns.map(t => <p key={t}>{t}</p>)}</article><article><span>NEXT STEPS</span>{result.draft.nextSteps.map(t => <p key={t}>{t}</p>)}</article></>}
          </div>
          <details className={styles.trace}><summary>See what actually ran</summary><p>Model: {result.trace.model}. Web searches: {result.trace.webSearches}. Public knowledge records: {result.trace.knowledgeIds.join(', ')}.</p><p>TypeSafe: {result.trace.typesafe.status}{result.trace.typesafe.action ? ` / ${result.trace.typesafe.action}` : ''}. Receipt: {result.trace.id}. Retrieved: {result.trace.at}.</p>{result.mode==='direct_source_brief' && <p>Scoped direct-source retrieval. Publication dates are unknown; retrieval is not new buyer activity. Maximum reserved model charge: US${result.trace.budget?.reservedUpperUsd.toFixed(3)} before tax; tax assumption: {Math.round((result.trace.budget?.assumedTaxRate??0)*100)}%. Account fees and currency treatment require separate verification.</p>}<p>Private client knowledge was not searched. A matching source URL is not independent fact-checking.</p></details>
          <label className={styles.check}><input type="checkbox" checked={reviewed} onChange={e => setReviewed(e.target.checked)} /><span>I have reviewed the evidence and understand this is a proposed opportunity, not an agreed client project.</span></label>
          <div className={styles.exports}><button type="button" disabled={!reviewed} onClick={() => saveFile('assembl-pursuit-pitch.html', buildPitchHtml(result), 'text/html')}>Export the pitch<Download size={16} /></button><button type="button" disabled={!reviewed} onClick={() => saveFile('assembl-pursuit-handoff.json', JSON.stringify(result, null, 2), 'application/json')}>Save source brief<Check size={15} /></button></div>
          <small>Editable HTML slides, with sources. Print to PDF in your browser. The export does not create or update a private client hub.</small>
        </>}
      </div>
    </div>
  </section>;
}
