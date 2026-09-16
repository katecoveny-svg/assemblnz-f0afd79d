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

type JobReceipt = {
  id: string;
  kind: string;
  title: string;
  summary: string;
  evidence?: Record<string, unknown>;
  createdAt: string;
};

type SavedJob = PlannedResponse & {
  savedAt: string;
  durable?: boolean;
  receipt?: JobReceipt | null;
};

const EXAMPLES = [
  'Build the next usable version of DO Office with a real usage rail and Builder DO entry point.',
  'Audit the current public Assembl shell for brand drift and fix only active company surfaces.',
  'Create a visual Creative Director DO that can brief, critique and route image, video, web and 3D work.',
];

const LOCAL_QUEUE_KEY = 'assembl-builderdoo-jobs-v1';

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

function readLocalQueue(): SavedJob[] {
  try {
    const raw = JSON.parse(localStorage.getItem(LOCAL_QUEUE_KEY) || '[]') as unknown;
    return Array.isArray(raw) ? (raw.slice(0, 12) as SavedJob[]) : [];
  } catch {
    return [];
  }
}

function writeLocalQueue(next: SavedJob[]) {
  localStorage.setItem(LOCAL_QUEUE_KEY, JSON.stringify(next.slice(0, 12)));
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
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<JobReceipt | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const local = readLocalQueue();
      try {
        const response = await fetch('/api/do/builder/jobs', { method: 'GET', credentials: 'same-origin' });
        if (cancelled) return;
        if (response.status === 401) {
          setSignedIn(false);
          setQueue(local);
          return;
        }
        if (!response.ok) {
          setSignedIn(null);
          setQueue(local);
          return;
        }
        const data = await response.json() as { jobs?: SavedJob[] };
        setSignedIn(true);
        const durable = Array.isArray(data.jobs) ? data.jobs : [];
        const merged = [
          ...durable,
          ...local.filter((item) => !durable.some((job) => job.job.id === item.job.id)),
        ].slice(0, 12);
        setQueue(merged);
      } catch {
        if (!cancelled) {
          setSignedIn(null);
          setQueue(local);
        }
      }
    }
    void hydrate();
    return () => { cancelled = true; };
  }, []);

  const activeModel = useMemo(() => plan?.models.find((model) => model.id === plan.job.route.ladder[0]), [plan]);

  async function planJob() {
    if (objective.trim().length < 8 || busy) return;
    setBusy(true);
    setActiveReceipt(null);
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
      setMessage('Plan ready. Review it, then save to your Office workspace or download a handoff. Planning does not start a build.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Builder DO could not plan this job.');
    } finally {
      setBusy(false);
    }
  }

  async function saveJob() {
    if (!plan || busy) return;
    setBusy(true);
    setMessage(signedIn === false
      ? 'Saving on this device…'
      : 'Saving to your Office workspace…');
    try {
      const idempotencyKey = `builder-save:${plan.job.id}`;
      const response = await fetch('/api/do/builder/jobs', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          job: plan.job,
          models: plan.models,
          executionBoundary: plan.executionBoundary,
          idempotencyKey,
        }),
      });
      const data = await response.json() as SavedJob & { message?: string; receipt?: JobReceipt | null; error?: string };

      if (response.status === 401) {
        setSignedIn(false);
        const next: SavedJob[] = [{ ...plan, savedAt: new Date().toISOString(), durable: false }, ...queue.filter((item) => item.job.id !== plan.job.id)].slice(0, 12);
        setQueue(next);
        try { writeLocalQueue(next); } catch { /* ignore */ }
        setActiveReceipt(null);
        setMessage('Signed out — saved on this device only. Sign in to reopen this job on another device with a real acceptance receipt.');
        return;
      }

      if (!response.ok) throw new Error(data.message || 'Could not save this Builder job.');

      setSignedIn(true);
      const saved: SavedJob = {
        job: data.job,
        models: data.models,
        executionBoundary: data.executionBoundary,
        savedAt: data.savedAt,
        durable: true,
        receipt: data.receipt ?? null,
      };
      setPlan({ job: saved.job, models: saved.models, executionBoundary: saved.executionBoundary });
      setActiveReceipt(saved.receipt ?? null);
      const next = [saved, ...queue.filter((item) => item.job.id !== saved.job.id)].slice(0, 12);
      setQueue(next);
      try {
        writeLocalQueue(next.map(({ receipt: _receipt, ...rest }) => rest));
      } catch { /* local mirror is optional */ }
      setMessage(saved.receipt
        ? `${saved.receipt.title}. ${saved.receipt.summary}`
        : 'Saved to your Office workspace. No build has started.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save this Builder job.');
    } finally {
      setBusy(false);
    }
  }

  async function openSavedJob(item: SavedJob) {
    setPlan(item);
    setObjective(item.job.objective);
    setRisk(item.job.risk);
    setQuality(item.job.quality);
    setAuthority(item.job.authority);
    setNeedsVision(item.job.capabilities.includes('vision'));
    setNeedsBrowser(item.job.capabilities.includes('browser_use'));
    setActiveReceipt(item.receipt ?? null);

    if (!item.durable) {
      setMessage('Opened a device-local job. Sign in and save again to attach an Office receipt.');
      return;
    }

    try {
      const response = await fetch(`/api/do/builder/jobs/${item.job.id}`, { method: 'GET', credentials: 'same-origin' });
      if (response.status === 401) {
        setSignedIn(false);
        setMessage('Sign in to reopen durable jobs from another device.');
        return;
      }
      if (!response.ok) {
        setMessage('Could not refresh this durable job. Showing the last known plan.');
        return;
      }
      const data = await response.json() as SavedJob & { receipts?: JobReceipt[] };
      const refreshed: PlannedResponse = {
        job: data.job,
        models: data.models,
        executionBoundary: data.executionBoundary,
      };
      setPlan(refreshed);
      const receipt = data.receipts?.find((entry) => entry.kind === 'job_accepted') ?? data.receipts?.[0] ?? null;
      setActiveReceipt(receipt);
      setMessage(receipt ? `Reopened with receipt: ${receipt.title}` : 'Reopened durable Builder job from your Office workspace.');
    } catch {
      setMessage('Could not refresh this durable job. Showing the last known plan.');
    }
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
          {signedIn === false ? <Link href="/login?redirect=%2Fdo%2Fbuilder">sign in</Link> : null}
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Builder DO / prepare a build</p>
            <h1>tell it what<br />needs to exist.</h1>
          </div>
          <p className={styles.heroCopy}>
            Describe what you want to build. Review the plan, save it to your Office workspace for a real acceptance receipt, or download a handoff for your coding agent. Planning does not run a build worker.
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
          {activeReceipt ? <div className={styles.boundary}><span>office receipt · {activeReceipt.kind}</span><p>{activeReceipt.title} — {activeReceipt.summary}</p></div> : null}
          <div className={styles.actions}>
            <button type="button" onClick={() => void saveJob()} disabled={busy}>{signedIn === false ? 'save on this device' : 'save to office'}</button>
            <button type="button" onClick={downloadHandoff}>download build handoff</button>
            <button type="button" onClick={() => void copyHandoff()} className={styles.primaryAction}>copy builder handoff</button>
          </div>
          <details><summary>portable handoff</summary><pre>{handoffText(plan)}</pre></details>
        </section> : null}

        <section className={styles.queue}>
          <div className={styles.sectionHead}>
            <span>03</span>
            <div>
              <strong>work queue</strong>
              <p>{signedIn ? 'Durable Office jobs reopen across devices. Device-local jobs remain until you save while signed in.' : 'Sign in to keep jobs in your Office workspace. Until then, saves stay on this device.'}</p>
            </div>
          </div>
          {queue.length ? <div className={styles.queueGrid}>{queue.map((item) => <button key={item.job.id} type="button" onClick={() => void openSavedJob(item)}><span>{item.durable ? `${item.job.status} · office` : item.job.status}</span><strong>{item.job.title}</strong><small>{new Date(item.savedAt).toLocaleString('en-NZ', { dateStyle: 'medium', timeStyle: 'short' })}</small></button>)}</div> : <div className={styles.empty}><strong>no saved jobs yet</strong><p>Plan your first build, inspect it, then save it here.</p></div>}
        </section>
      </main>
    </div>
  );
}
