'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ACTION_LABELS, EVIDENCE_LABELS, makePayload, parseInput, type PilotInput, type PilotResult, type Surface } from '@/lib/typesafe/core';
import { pilotFixture, rehearsal } from '@/lib/typesafe/fixtures';
import styles from './TypeSafePilot.module.css';

const HANDOFF_KEY = 'assembl:typesafe:handoff:v1';
const TITLES: Record<Surface, string> = { pursuit: 'from signal to useful work.', do: 'the next useful thing. right here.', studio: 'show the work. keep the proof.' };
type Status = { signedIn?: boolean; ready?: boolean; userId?: string | null; enabled?: boolean; configured?: boolean; allowed?: boolean };
function download(name: string, value: string, type: string) {
  const url = URL.createObjectURL(new Blob([value], { type }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name;
  document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
/** Portable same-origin pilot surface. No background capture, cross-tab access or extension bridge. */
export function TypeSafePilot({ surface }: { surface: Surface }) {
  const [mode, setMode] = useState<'rehearsal' | 'live'>('rehearsal');
  const [input, setInput] = useState<PilotInput>(() => pilotFixture(surface));
  const [result, setResult] = useState<PilotResult | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [kept, setKept] = useState(false);
  const generation = useRef(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/do/decision', { credentials: 'same-origin', cache: 'no-store', signal: controller.signal })
      .then(async response => {
        const value = await response.json();
        if (!controller.signal.aborted) setStatus(response.ok || response.status === 401 ? value : { ready: false });
      }).catch(() => { if (!controller.signal.aborted) setStatus({ ready: false }); });
    try {
      const stored = sessionStorage.getItem(HANDOFF_KEY);
      sessionStorage.removeItem(HANDOFF_KEY);
      if (stored && stored.length <= 30_000) {
        const next = parseInput({ ...JSON.parse(stored), surface, shareWithTypeSafe: true });
        setInput({ ...next, shareWithTypeSafe: false }); setMode('live');
      }
    } catch { /* Invalid or disabled session storage must not break the page. */ }
    return () => { controller.abort(); generation.current++; };
  }, [surface]);
  function change(next: PilotInput) {
    generation.current++; setInput(next); setResult(null); setKept(false); setError('');
  }
  function changeMode(next: 'rehearsal' | 'live') {
    setMode(next); change(pilotFixture(surface));
  }
  async function run() {
    setError(''); setResult(null); setKept(false);
    if (mode === 'rehearsal') { setResult(rehearsal(surface)); return; }
    let checked: PilotInput;
    try { checked = parseInput(input); } catch (e) { setError(e instanceof Error ? e.message : 'Check the context.'); return; }
    const current = ++generation.current;
    setBusy(true);
    try {
      const response = await fetch('/api/do/decision', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(checked),
      });
      const value = await response.json();
      if (!response.ok) throw new Error(typeof value.message === 'string' ? value.message : 'The live request failed.');
      if (current === generation.current) setResult(value as PilotResult);
    } catch (e) { if (current === generation.current) setError(e instanceof Error ? e.message : 'The live request failed.'); }
    finally { setBusy(false); }
  }
  function handoff(next: Surface) {
    const paths: Record<Surface, string> = { pursuit: '/pursuit/typesafe', do: '/do/typesafe', studio: '/creative-studio/typesafe' };
    if (mode === 'rehearsal') { window.location.assign(paths[next]); return; }
    try {
      sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ ...input, shareWithTypeSafe: false,
        intent: next === 'studio' ? 'Prepare a Studio handoff from this context. Check the proposed claim. Do not publish anything.' : input.intent }));
      window.location.assign(paths[next]);
    } catch { setError('Browser storage is unavailable. Copy your context before opening the next surface.'); }
  }
  const canRun = !busy && (mode === 'rehearsal' || Boolean(status?.ready && input.shareWithTypeSafe));
  const locked = mode === 'rehearsal' || busy;
  const preview = makePayload({ ...input, page: { ...input.page, url: (() => {
    try { return parseInput({ ...input, shareWithTypeSafe: true }).page.url; } catch { return '(invalid URL or context; no request will be sent)'; }
  })() } }, 'configured server model').state;

  return <main className={styles.root}>
    <header className={styles.header}>
      <Link href="/" className={styles.wordmark}>assembl</Link>
      <nav aria-label="Pilot surfaces"><Link href="/pursuit/typesafe">Pursuit</Link><Link href="/do/typesafe">DO</Link><Link href="/creative-studio/typesafe">Studio</Link></nav>
      <span className={styles.eyebrow}>PILOT PREVIEW · DRAFT ONLY</span>
    </header>
    <section className={styles.intro}>
      <p className={styles.eyebrow}>{surface.toUpperCase()} × TYPESAFE · WORKING PROOF</p>
      <h1>{TITLES[surface]}</h1>
      <p>Review the context. Let TypeSafe suggest a bounded next step. Assembl prepares the draft. You decide what happens next.</p>
      <p className={styles.small}>This pilot uses pasted page context. It does not read other tabs or control your browser. TypeSafe evaluates text; the draft below is assembled in code.</p>
    </section>
    <div className={styles.modeBar}>
      <div role="group" aria-label="Run mode">
        <button type="button" disabled={busy} aria-pressed={mode === 'rehearsal'} onClick={() => changeMode('rehearsal')}>Rehearse the example</button>
        <button type="button" disabled={busy} aria-pressed={mode === 'live'} onClick={() => changeMode('live')}>Use live TypeSafe</button>
      </div>
      <span>{mode === 'rehearsal' ? 'Fictional input · no provider call' : status?.ready ? 'Server configured · ready for your consent' : 'Live setup required'}</span>
    </div>
    {mode === 'live' && !status?.ready && <aside className={styles.setup}>
      <strong>{status === null ? 'Checking the pilot connection…' : !status.signedIn ? 'Sign in to make a live request.' : 'This deployment is not ready for your live request.'}</strong>
      <p>The hosting project needs TYPESAFE_API_KEY, TYPESAFE_ENABLED=true and your account in TYPESAFE_PILOT_USER_IDS. Keep the key server-side; do not paste it here.</p>
      {status?.signedIn ? <p>Your signed-in account ID: <code>{status.userId}</code>. Use this only for the pilot allowlist.</p> : <Link href="/login?redirect=%2Fdo%2Ftypesafe">Sign in to DO →</Link>}
    </aside>}
    <div className={styles.workspace}>
      <section className={styles.source} aria-labelledby="source-title">
        <div className={styles.sectionHead}><span className={styles.eyebrow}>01 · KNOW</span><h2 id="source-title">the context you choose.</h2></div>
        <label>Page title<input maxLength={200} disabled={locked} value={input.page.title} onChange={e => change({ ...input, shareWithTypeSafe: false, page: { ...input.page, title: e.target.value } })} /></label>
        <label>Source URL <span>(optional; never fetched)</span><input type="url" maxLength={2000} disabled={locked} value={input.page.url} placeholder="https://…" onChange={e => change({ ...input, shareWithTypeSafe: false, page: { ...input.page, url: e.target.value } })} /></label>
        <label>Approved source text<textarea className={styles.sourceText} maxLength={12000} disabled={locked} value={input.page.text} onChange={e => change({ ...input, shareWithTypeSafe: false, page: { ...input.page, text: e.target.value } })} /></label>
        <p className={styles.small}>Only the text shown here is used. Remove confidential information and credentials. URL query strings, fragments and embedded passwords are stripped.</p>
        <label>Claim to check <span>(optional)</span><textarea rows={3} maxLength={1000} disabled={locked} value={input.claim} onChange={e => change({ ...input, shareWithTypeSafe: false, claim: e.target.value })} /></label>
      </section>
      <section className={styles.assistant} aria-labelledby="do-title">
        <div className={styles.sectionHead}><span className={styles.eyebrow}>02 · PREPARE</span><h2 id="do-title">DO, with context.</h2></div>
        <label>What should DO help with?<textarea rows={4} maxLength={2000} disabled={locked} value={input.intent} onChange={e => change({ ...input, shareWithTypeSafe: false, intent: e.target.value })} /></label>
        {mode === 'live' && <>
          <details className={styles.details}><summary>Review the state shared with TypeSafe</summary><pre>{JSON.stringify(preview, null, 2)}</pre></details>
          <label className={styles.consent}><input type="checkbox" disabled={busy} checked={input.shareWithTypeSafe} onChange={e => change({ ...input, shareWithTypeSafe: e.target.checked })} /><span>I am authorised to share this context with TypeSafe for this request.</span></label>
        </>}
        <button type="button" className={styles.primary} disabled={!canRun} onClick={run}>{busy ? 'Evaluating the supplied context…' : mode === 'rehearsal' ? 'Run the rehearsal →' : 'Run with TypeSafe →'}</button>
        <p className={styles.small}>No sending. No publishing. No purchasing. A model result cannot grant permission.</p>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <div aria-live="polite" aria-busy={busy}>
          {result ? <div className={styles.result}>
            <span className={styles.eyebrow}>{result.mode === 'live' ? 'LIVE PROVIDER RESPONSE' : 'SCRIPTED REHEARSAL · NOT MODEL OUTPUT'}</span>
            <h3>{ACTION_LABELS[result.decision.action]}</h3>
            <p>{result.decision.explanation}</p>
            <div className={styles.evidence}><strong>{EVIDENCE_LABELS[result.decision.evidence]}</strong><p>The claim is reviewed separately from the selected task. A polished draft does not turn an unsupported claim into a fact.</p></div>
            {result.evaluation && <dl className={styles.metrics}>
              <div><dt>Model</dt><dd>{result.evaluation.model}</dd></div>
              <div><dt>Provider-call time</dt><dd>{result.trace.elapsedMs} ms</dd></div>
              <div><dt>Billed-input counter</dt><dd>{result.evaluation.usage.input_tokens} tokens</dd></div>
              <div><dt>Route confidence</dt><dd>{result.evaluation.answers.next_action.confidence.toFixed(3)}</dd></div>
            </dl>}
            {result.evaluation && <p className={styles.small}>Confidence describes the answer distribution, not correctness. The pilot review threshold is provisional. No benchmark or savings claim is made.</p>}
            {result.decision.artifact && <>
              <details className={styles.details} open><summary>Review the prepared draft</summary><pre>{result.decision.artifact}</pre></details>
              <button type="button" className={styles.secondary} onClick={() => { download('assembl-draft.md', result.decision.artifact!, 'text/markdown'); setKept(true); }}>Download this draft</button>
            </>}
            {kept && <p className={styles.small}>Download requested on this device. Not saved to Pursuit, sent to a client or published.</p>}
            <details className={styles.details}><summary>Inspect decision and DO plan</summary><pre>{JSON.stringify(result, null, 2)}</pre></details>
            <button type="button" className={styles.secondary} onClick={() => {
              const packet = { schema: 'assembl.typesafe.proof.v1', mode: result.mode, decision: { ...result.decision, artifact: undefined }, evaluation: result.evaluation, trace: result.trace, doPlan: result.doPlan, policy: result.policy, note: 'Source text and draft omitted. Private run record, not a public benchmark. Nothing has been sent to TypeSafe beyond the explicitly approved evaluation request.' };
              download('assembl-typesafe-proof.json', JSON.stringify(packet, null, 2), 'application/json');
            }}>Download private proof packet</button>
          </div> : <div className={styles.empty}><span className={styles.eyebrow}>THE WORK, NOT ANOTHER CHAT</span><p>A source. A sensible next step. A draft you can review.</p></div>}
        </div>
      </section>
    </div>
    <section className={styles.next}>
      <div><p className={styles.eyebrow}>03 · CONNECT THE WORK</p><h2>one context. three useful surfaces.</h2><p>Carry this context into DO or prepare a Studio handoff. Live context uses this browser tab’s session storage, is consumed on the next surface, and requires fresh consent before another provider call. This does not create a durable client record.</p></div>
      <div className={styles.nextButtons}><button type="button" disabled={busy} onClick={() => handoff('do')}>Open in DO →</button><button type="button" disabled={busy} onClick={() => handoff('studio')}>Prepare in Studio →</button></div>
    </section>
    <footer className={styles.footer}>assembl · find it. DO it. show it.<span>Text decisions by TypeSafe when live. Execution authority stays with you.</span></footer>
  </main>;
}
