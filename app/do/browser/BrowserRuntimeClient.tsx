'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { DoMark } from '@/components/do/DoMark';
import type { BrowserRuntimeJob } from '@/apps/do/shared/browser-runtime';
import type { PermitRecord, PreparedAction, ReceiptRecord } from '@/lib/do/action-stub';
import styles from './browser.module.css';

type ApiPayload = {
  job?: BrowserRuntimeJob;
  jobs?: BrowserRuntimeJob[];
  prepared?: PreparedAction | null;
  permit?: PermitRecord | null;
  receipt?: ReceiptRecord | null;
  boundary?: string;
  honesty?: string;
  error?: string;
  message?: string;
};

const DEMO_CONTEXT = {
  url: 'https://example-insurer.demo/policy-excess',
  title: 'Comprehensive excess — demo insurer page',
  pageText:
    'Comprehensive cover excess: $500. Third-party fire & theft excess: $750. Glass claim excess: $100. This is synthetic demo page text for DO Browser Runtime — not a live insurer site.',
};

export function BrowserRuntimeClient() {
  const [jobs, setJobs] = useState<BrowserRuntimeJob[]>([]);
  const [job, setJob] = useState<BrowserRuntimeJob | null>(null);
  const [prepared, setPrepared] = useState<PreparedAction | null>(null);
  const [permit, setPermit] = useState<PermitRecord | null>(null);
  const [receipt, setReceipt] = useState<ReceiptRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Jobs persist in DO — not only in this tab');
  const [title, setTitle] = useState('Compare three insurers’ excess');
  const [objective, setObjective] = useState(
    'Compare excess figures across insurer pages; finish with a note artifact.',
  );

  const applyPayload = useCallback((data: ApiPayload) => {
    if (data.job) setJob(data.job);
    if (data.jobs) setJobs(data.jobs);
    setPrepared(data.prepared ?? null);
    setPermit(data.permit ?? null);
    setReceipt(data.receipt ?? null);
    if (data.job) {
      setStatus(`${data.job.status.replace(/_/g, ' ')} · ${data.job.job_id}`);
    }
  }, []);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/do/browser-runtime');
    const data = (await res.json()) as ApiPayload;
    if (data.jobs) setJobs(data.jobs);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const post = useCallback(
    async (body: Record<string, unknown>) => {
      setBusy(true);
      try {
        const res = await fetch('/api/do/browser-runtime', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = (await res.json()) as ApiPayload;
        if (!res.ok) {
          setStatus(data.message || data.error || 'Request failed');
          return;
        }
        applyPayload(data);
        await refresh();
      } catch {
        setStatus('Network error');
      } finally {
        setBusy(false);
      }
    },
    [applyPayload, refresh],
  );

  return (
    <div className={`do-craft do-craft-stage-soft ${styles.page}`}>
      <header className={styles.header}>
        <div className={styles.brandLockup}>
          <Link href="/do" className={styles.wordmark}>
            <span className={`do-craft-orb ${styles.orb}`} aria-hidden>
              <DoMark />
            </span>
            DO
          </Link>
          <span>browser runtime</span>
          <span className={styles.preview}>prototype</span>
        </div>
        <nav className={styles.headerActions}>
          <Link href="/do/sponsored">Sponsored Journeys</Link>
          <Link href="/do/widget">Companion</Link>
          <Link href="/do/install">Install extension</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <p className={styles.disclaimer} role="note">
          DO owns the layer above browser chrome: persistent jobs across tabs, visible context
          controls, model-neutral execution, and finished artifacts under Permit — not another
          page-summarising sidebar. Not Firefox Smart Window / Mozilla embed. Extends the existing
          Chrome DO extension + browser seat; does not invent a second extension.
        </p>

        <section className={styles.hero}>
          <p className={styles.eyebrow}>DEMOS.md · persistent job</p>
          <h1>Jobs that survive the tab</h1>
          <p>
            Capture what DO can see → propose a next step → Permit gate → produce an artifact
            (draft email / note / form prep), not only chat.
          </p>
        </section>

        <section className={`do-craft-card ${styles.panel}`}>
          <label className={styles.field}>
            Job title
            <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={busy} />
          </label>
          <label className={styles.field}>
            Objective
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              rows={3}
              disabled={busy}
            />
          </label>
          <div className={styles.actions}>
            <button
              type="button"
              className="do-cta"
              disabled={busy}
              onClick={() => post({ action: 'create', title, objective })}
            >
              Start persistent job
            </button>
            <button
              type="button"
              className="do-cta do-cta--secondary"
              disabled={busy}
              onClick={() => post({ action: 'seed_insurer_compare' })}
            >
              Seed insurer-compare demo
            </button>
          </div>
          <p className={`do-craft-mono ${styles.status}`} role="status">
            {status}
          </p>
        </section>

        {job ? (
          <>
            <section className={`do-craft-card ${styles.panel}`} aria-label="What DO can see">
              <p className={styles.eyebrow}>Context control · what DO can see</p>
              <h2>{job.title}</h2>
              <p className="do-craft-mono">{job.model_placeholder}</p>
              <p>{job.objective}</p>
              {job.context ? (
                <div className={styles.contextBox}>
                  <p className="do-craft-mono">
                    {job.context.url}
                    {job.context.tabId ? ` · tab ${job.context.tabId}` : ''}
                  </p>
                  <p>
                    <strong>{job.context.title}</strong> · {job.context.pageTextChars} chars locked
                    with consent
                  </p>
                  <pre>{job.context.pageTextPreview}</pre>
                </div>
              ) : (
                <div className={styles.actions}>
                  <button
                    type="button"
                    className="do-cta"
                    disabled={busy}
                    onClick={() =>
                      post({
                        action: 'lock_context',
                        job_id: job.job_id,
                        consent: true,
                        ...DEMO_CONTEXT,
                      })
                    }
                  >
                    Lock demo page context
                  </button>
                  <p className={styles.hint}>
                    From the Chrome DO side panel, use “Lock into open job” after capture — same
                    consent boundary as browser seat.
                  </p>
                </div>
              )}
            </section>

            <section className={`do-craft-card ${styles.panel}`}>
              <p className={styles.eyebrow}>Actions</p>
              <div className={styles.actions}>
                {job.status === 'context_locked' ? (
                  <button
                    type="button"
                    className="do-cta"
                    disabled={busy}
                    onClick={() => post({ action: 'propose', job_id: job.job_id })}
                  >
                    Propose next step
                  </button>
                ) : null}
                {job.status === 'proposed' ? (
                  <button
                    type="button"
                    className="do-cta"
                    disabled={busy}
                    onClick={() => post({ action: 'request_permit', job_id: job.job_id })}
                  >
                    Request Permit
                  </button>
                ) : null}
                {job.status === 'permit_pending' ? (
                  <button
                    type="button"
                    className="do-cta"
                    disabled={busy}
                    onClick={() => post({ action: 'approve_permit', job_id: job.job_id })}
                  >
                    Approve Permit
                  </button>
                ) : null}
                {job.status === 'permitted' ? (
                  <button
                    type="button"
                    className="do-cta"
                    disabled={busy}
                    onClick={() => post({ action: 'produce_artifact', job_id: job.job_id })}
                  >
                    Produce artifact
                  </button>
                ) : null}
                {job.status === 'artifact_ready' ? (
                  <button
                    type="button"
                    className="do-cta"
                    disabled={busy}
                    onClick={() => post({ action: 'receipt', job_id: job.job_id })}
                  >
                    Mint receipt
                  </button>
                ) : null}
              </div>
              {job.proposal ? (
                <div className={styles.proposal}>
                  <strong>{job.proposal.summary}</strong>
                  <p>{job.proposal.next_step}</p>
                  <p className="do-craft-mono">artifact · {job.proposal.artifact_kind}</p>
                </div>
              ) : null}
            </section>

            {job.status === 'permit_pending' || job.status === 'permitted' ? (
              <section className={`do-craft-card ${styles.permitCard}`}>
                <p className={styles.eyebrow}>DO Permit</p>
                <h3>{prepared?.title}</h3>
                <p className="do-craft-mono">{permit?.permit_id}</p>
                <p className={styles.hint}>
                  TODO(action-core): swap to <code>/api/do/action/permit</code> when Phase 1 lands.
                </p>
              </section>
            ) : null}

            {job.artifact ? (
              <section className={`do-craft-card ${styles.artifactCard}`}>
                <p className={styles.eyebrow}>Finished artifact · not a chat dump</p>
                <h3>{job.artifact.title}</h3>
                <pre>{job.artifact.body}</pre>
              </section>
            ) : null}

            {receipt ? (
              <section className={`do-craft-card ${styles.panel}`}>
                <p className={styles.eyebrow}>DO Receipt</p>
                <p className="do-craft-mono">{receipt.receipt_id}</p>
                <p>{receipt.summary}</p>
                <p className={styles.hint}>{receipt.boundary}</p>
              </section>
            ) : null}
          </>
        ) : null}

        {jobs.length ? (
          <section className={`do-craft-card ${styles.panel}`} aria-label="Open jobs">
            <p className={styles.eyebrow}>Persistent jobs · survive tab changes</p>
            <ul className={styles.jobList}>
              {jobs.map((item) => (
                <li key={item.job_id}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      const res = await fetch(`/api/do/browser-runtime?job_id=${item.job_id}`);
                      const data = (await res.json()) as ApiPayload;
                      applyPayload(data);
                    }}
                  >
                    <strong>{item.title}</strong>
                    <span className="do-craft-mono">
                      {item.status} · {item.job_id}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}
