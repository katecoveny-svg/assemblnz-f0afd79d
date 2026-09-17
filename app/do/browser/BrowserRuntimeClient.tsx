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

export function browserRuntimeResponseError(response: { ok: boolean }, data: ApiPayload): string | null {
  return response.ok ? null : data.message || data.error || 'Browser Runtime request failed.';
}

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
  const [status, setStatus] = useState('Loading Browser Runtime preview…');
  const [title, setTitle] = useState('Compare three insurers’ excess');
  const [objective, setObjective] = useState(
    'Compare excess figures across insurer pages; finish with a note artifact.',
  );

  const applyPayload = useCallback((data: ApiPayload, ok: boolean) => {
    const error = browserRuntimeResponseError({ ok }, data);
    if (error) {
      // Do not leave previously opened private context visible after an auth/not-found denial.
      setJobs([]);
      setJob(null);
      setPrepared(null);
      setPermit(null);
      setReceipt(null);
      setStatus(error);
      return false;
    }
    if (data.jobs) {
      setJobs(data.jobs);
      if (data.honesty) setStatus(data.honesty);
    }
    if (data.job) {
      setJob(data.job);
      setPrepared(data.prepared ?? null);
      setPermit(data.permit ?? null);
      setReceipt(data.receipt ?? null);
      setStatus(`${data.job.status.replace(/_/g, ' ')} · ${data.job.job_id}`);
    }
    return true;
  }, []);

  const refresh = useCallback(() => {
    return fetch('/api/do/browser-runtime')
      .then(async res => applyPayload((await res.json()) as ApiPayload, res.ok))
      .catch(() => applyPayload({ message: 'Network error' }, false));
  }, [applyPayload]);

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
        if (res.status === 409 && data.error === 'stale_review' && typeof body.job_id === 'string') {
          // Refresh what is displayed, never retry the rejected decision with
          // newer identities. The person must review and explicitly act again.
          const latest = await fetch(`/api/do/browser-runtime?job_id=${encodeURIComponent(body.job_id)}`);
          if (!applyPayload((await latest.json()) as ApiPayload, latest.ok)) return;
          if (await refresh()) setStatus(data.message || 'Review changed. Review the current job before deciding again.');
          return;
        }
        if (!applyPayload(data, res.ok)) return;
        await refresh();
      } catch {
        applyPayload({ message: 'Network error' }, false);
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
                    This signed-in web preview uses sample context. Authenticated job capture from the Chrome side panel is not connected.
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
                    onClick={() => post({
                      action: 'approve_permit', job_id: job.job_id,
                      expected_permit_id: job.permit_id,
                      expected_review_generation: job.review_generation,
                    })}
                  >
                    Approve Permit
                  </button>
                ) : null}
                {job.status === 'permitted' ? (
                  <button
                    type="button"
                    className="do-cta"
                    disabled={busy}
                    onClick={() => post({
                      action: 'produce_artifact', job_id: job.job_id,
                      expected_permit_id: job.permit_id,
                      expected_review_generation: job.review_generation,
                    })}
                  >
                    Produce artifact
                  </button>
                ) : null}
                {job.status === 'artifact_ready' ? (
                  <button
                    type="button"
                    className="do-cta"
                    disabled={busy}
                    onClick={() => post({
                      action: 'receipt', job_id: job.job_id,
                      expected_permit_id: job.permit_id,
                      expected_review_generation: job.review_generation,
                    })}
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
                      setBusy(true);
                      try {
                        const res = await fetch(`/api/do/browser-runtime?job_id=${encodeURIComponent(item.job_id)}`);
                        applyPayload((await res.json()) as ApiPayload, res.ok);
                      } catch {
                        applyPayload({ message: 'Network error' }, false);
                      } finally {
                        setBusy(false);
                      }
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
