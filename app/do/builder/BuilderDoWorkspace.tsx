'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './builder.module.css';
import type { BuilderJob, BuilderQuality, BuilderRisk } from '@/apps/do/shared/builder';

type PlannedResponse = {
  job: BuilderJob;
  models: Array<{ id: string; provider?: string; label?: string; costPerMTokensNzd?: number }>;
  executionBoundary: string;
};

type SavedJob = PlannedResponse & { savedAt: string };

const EXAMPLES = [
  'Build the next usable version of DO Office with a real usage rail and Builder DO entry point.',
  'Audit the current public Assembl shell for brand drift and fix only active company surfaces.',
  'Create a visual Creative Director DO that can brief, critique and route image, video, web and 3D work.',
];

function handoffText(plan: PlannedResponse): string {
  const { job } = plan;
  return [
    'Act as Builder DO for Assembl.',
    `Job: ${job.title}`,
    `Objective: ${job.objective}`,
    `Authority: ${job.authority}. ${plan.executionBoundary}`,
    `Risk: ${job.risk}. Quality: ${job.quality}.`,
    '',
    'Load canonical context:',
    ...job.contextFiles.map((file) => `- ${file}`),
    '',
    'Capabilities required:',
    job.capabilities.join(', '),
    '',
    'Preferred model ladder from current Assembl router:',
    ...(job.route.ladder.length ? job.route.ladder.map((model, index) => `${index + 1}. ${model}`) : ['No configured model matched; keep the job queued and report the missing provider/capability.']),
    '',
    'Definition of done:',
    ...job.definitionOfDone.map((item) => `- ${item}`),
    '',
    'Proof required:',
    ...job.proof.map((item) => `- ${item}`),
    '',
    'Inspect the existing implementation first. Reuse primitives. Work in isolation. Do not merge or deploy without explicit authority.',
  ].join('\n');
}

export function BuilderDoWorkspace() {
  const [objective, setObjective] = useState(EXAMPLES[0]);
  const [risk, setRisk] = useState<BuilderRisk>('medium');
  const [quality, setQuality] = useState<BuilderQuality>('balanced');
  const [authority, setAuthority] = useState<'plan_only' | 'branch_and_build' | 'prepare_pr'>('prepare_pr');
  const [needsVision, setNeedsVision] = useState(true);
  const [needsBrowser, setNeedsBrowser] = useState(true);
  const [plan, setPlan] = useState<PlannedResponse | null>(null);
  const [queue, setQueue] = useState<SavedJob[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('assembl-builderdoo-jobs-v1') || '[]') as unknown;
      // Hydrate optional browser storage after SSR; server and initial client must agree.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(raw)) setQueue(raw.slice(0, 12) as SavedJob[]);
    } catch { /* local queue is optional */ }
  }, []);

  const activeModel = useMemo(() => plan?.models.find((model) => model.id === plan.job.route.ladder[0]), [plan]);

  async function planJob() {
    if (objective.trim().length < 8 || busy) return;
    setBusy(true);
    setMessage('Builder DO is routing this job…');
    try {
      const response = await fetch('/api/do/builder/plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ objective, risk, quality, authority, needsVision, needsBrowser }),
      });
      const data = await response.json() as PlannedResponse & { message?: string };
      if (!response.ok) throw new Error(data.message || 'Builder DO could not plan this job.');
      setPlan(data);
      setMessage('Plan ready. Review it, then download or copy the handoff for your coding agent.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Builder DO could not plan this job.');
    } finally {
      setBusy(false);
    }
  }

  function saveJob() {
    if (!plan) return;
    const next: SavedJob[] = [{ ...plan, savedAt: new Date().toISOString() }, ...queue.filter((item) => item.job.id !== plan.job.id)].slice(0, 12);
    setQueue(next);
    try { localStorage.setItem('assembl-builderdoo-jobs-v1', JSON.stringify(next)); } catch { setMessage('Browser storage is unavailable. Download the handoff to keep this job.'); return; }
    setMessage('Saved to this device. It will be here when you return in this browser.');
  }

  function downloadHandoff() {
    if (!plan) return;
    const url = URL.createObjectURL(new Blob([handoffText(plan)], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `builder-do-${plan.job.id}.txt`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage('Handoff downloaded. Open it with your coding agent; no build has started here.');
  }

  async function copyHandoff() {
    if (!plan) return;
    try {
      await navigator.clipboard.writeText(handoffText(plan));
      setMessage('Builder handoff copied. Paste it into any repo-capable agent harness.');
    } catch {
      setMessage('Clipboard access was unavailable. The handoff is shown below for manual copy.');
    }
  }

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div>
          <Link href="/do" className={styles.brand}>DO</Link>
          <span className={styles.slash}>/</span>
          <strong>Builder DO</strong>
          <span className={styles.preview}>build planner</span>
        </div>
        <nav>
          <Link href="/do/connections">connections</Link>
          <Link href="/do/office">office</Link>
          <Link href="/do/widget">companion</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Builder DO / prepare a build</p>
            <h1>tell it what<br />needs to exist.</h1>
          </div>
          <p className={styles.heroCopy}>
            Describe what you want to build. Review the plan, save it or download a handoff for your coding agent. This page prepares the job; it does not yet run a build worker.
          </p>
        </section>

        <div className={styles.grid}>
          <section className={styles.composer}>
            <div className={styles.sectionHead}>
              <span>01</span><div><strong>the job</strong><p>What should Builder DO make, fix or prove?</p></div>
            </div>
            <textarea value={objective} onChange={(event) => setObjective(event.target.value)} maxLength={4000} rows={7} aria-label="Builder DO objective" />
            <div className={styles.examples}>
              {EXAMPLES.map((example) => <button type="button" key={example} onClick={() => setObjective(example)}>{example.split(' ').slice(0, 5).join(' ')}…</button>)}
            </div>

            <div className={styles.controls}>
              <label>risk<select value={risk} onChange={(event) => setRisk(event.target.value as BuilderRisk)}><option value="low">low</option><option value="medium">medium</option><option value="high">high</option></select></label>
              <label>quality<select value={quality} onChange={(event) => setQuality(event.target.value as BuilderQuality)}><option value="economy">economy</option><option value="balanced">balanced</option><option value="maximum">maximum</option></select></label>
              <label>authority<select value={authority} onChange={(event) => setAuthority(event.target.value as typeof authority)}><option value="plan_only">plan only</option><option value="branch_and_build">branch + build</option><option value="prepare_pr">prepare PR</option></select></label>
            </div>

            <div className={styles.checks}>
              <label><input type="checkbox" checked={needsVision} onChange={(event) => setNeedsVision(event.target.checked)} /> visual inspection</label>
              <label><input type="checkbox" checked={needsBrowser} onChange={(event) => setNeedsBrowser(event.target.checked)} /> browser/runtime proof</label>
            </div>

            <button type="button" className={styles.planButton} onClick={() => void planJob()} disabled={busy || objective.trim().length < 8}>{busy ? 'routing…' : 'plan this build'}</button>
            <p className={styles.status} role="status">{message}</p>
          </section>

          <aside className={styles.routePanel}>
            <div className={styles.sectionHead}><span>02</span><div><strong>intelligence route</strong><p>Capability first. Provider second.</p></div></div>
            {plan ? <>
              <div className={styles.modelHero}><span>primary</span><strong>{activeModel?.label || plan.job.route.ladder[0] || 'no configured match'}</strong><small>{activeModel?.provider || 'waiting for provider capability'}</small></div>
              <ol className={styles.ladder}>{plan.job.route.ladder.map((model, index) => <li key={model}><span>{String(index + 1).padStart(2, '0')}</span><strong>{model}</strong></li>)}</ol>
              <div className={styles.boundary}><span>authority boundary</span><p>{plan.executionBoundary}</p></div>
            </> : <div className={styles.empty}><strong>no route yet</strong><p>Builder DO will choose from the configured model candidates after you define the job.</p></div>}
          </aside>
        </div>

        {plan ? <section className={styles.jobCard}>
          <div className={styles.jobTitle}><div><p className={styles.eyebrow}>job contract</p><h2>{plan.job.title}</h2></div><span>{plan.job.risk} risk · {plan.job.quality}</span></div>
          <div className={styles.jobColumns}>
            <div><h3>context</h3>{plan.job.contextFiles.map((file) => <code key={file}>{file}</code>)}</div>
            <div><h3>done when</h3>{plan.job.definitionOfDone.map((item) => <p key={item}>✓ {item}</p>)}</div>
            <div><h3>proof</h3>{plan.job.proof.map((item) => <p key={item}>↳ {item}</p>)}</div>
          </div>
          <div className={styles.actions}><button type="button" onClick={saveJob}>save job</button><button type="button" onClick={downloadHandoff}>download build handoff</button><button type="button" onClick={() => void copyHandoff()} className={styles.primaryAction}>copy builder handoff</button></div>
          <details><summary>portable handoff</summary><pre>{handoffText(plan)}</pre></details>
        </section> : null}

        <section className={styles.queue}>
          <div className={styles.sectionHead}><span>03</span><div><strong>work queue</strong><p>Saved on this device. Open a job to continue.</p></div></div>
          {queue.length ? <div className={styles.queueGrid}>{queue.map((item) => <button key={item.job.id} type="button" onClick={() => { setPlan(item); setObjective(item.job.objective); setRisk(item.job.risk); setQuality(item.job.quality); setAuthority(item.job.authority); setNeedsVision(item.job.capabilities.includes('vision')); setNeedsBrowser(item.job.capabilities.includes('browser_use')); }}><span>{item.job.status}</span><strong>{item.job.title}</strong><small>{new Date(item.savedAt).toLocaleString('en-NZ', { dateStyle: 'medium', timeStyle: 'short' })}</small></button>)}</div> : <div className={styles.empty}><strong>no saved jobs yet</strong><p>Plan your first build, inspect it, then save it here.</p></div>}
        </section>
      </main>
    </div>
  );
}
