'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { DoMark } from '@/components/do/DoMark';
import type {
  SponsoredJourneyDemo,
  SponsoredJourneyRun,
} from '@/lib/do/sponsored-journeys';
import type { PermitRecord, PreparedAction, ReceiptRecord } from '@/lib/do/action-stub';
import styles from './sponsored.module.css';

type ApiPayload = {
  demo?: SponsoredJourneyDemo;
  run?: SponsoredJourneyRun;
  prepared?: PreparedAction | null;
  permit?: PermitRecord | null;
  receipt?: ReceiptRecord | null;
  error?: string;
  message?: string;
};

const STEP_ACTIONS: Array<{
  when: SponsoredJourneyRun['status'][];
  action: string;
  label: string;
  tone?: 'primary' | 'secondary' | 'ghost';
}> = [
  { when: ['intent'], action: 'assemble', label: 'Assemble next step', tone: 'primary' },
  { when: ['assembled'], action: 'show_offer', label: 'Show labelled offer', tone: 'primary' },
  { when: ['assembled'], action: 'skip_offer', label: 'Continue without offer', tone: 'secondary' },
  { when: ['offer_shown'], action: 'request_permit', label: 'Prepare DO Permit', tone: 'primary' },
  { when: ['permit_pending'], action: 'approve_permit', label: 'Approve permit', tone: 'primary' },
  { when: ['permit_pending'], action: 'deny_permit', label: 'Deny', tone: 'ghost' },
  { when: ['permitted'], action: 'execute', label: 'Run action stub', tone: 'primary' },
  { when: ['action_simulated'], action: 'handoff', label: 'Stub CRM handoff', tone: 'primary' },
  { when: ['handoff_stubbed'], action: 'receipt', label: 'Mint receipt', tone: 'primary' },
];

export function SponsoredJourneyClient({ demo }: { demo: SponsoredJourneyDemo }) {
  const [intent, setIntent] = useState(demo.seedIntent);
  const [run, setRun] = useState<SponsoredJourneyRun | null>(null);
  const [prepared, setPrepared] = useState<PreparedAction | null>(null);
  const [permit, setPermit] = useState<PermitRecord | null>(null);
  const [receipt, setReceipt] = useState<ReceiptRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Demo stub · no live retailer or OpenAI Ads');

  const post = useCallback(async (body: Record<string, unknown>) => {
    setBusy(true);
    try {
      const res = await fetch('/api/do/sponsored', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as ApiPayload;
      if (!res.ok) {
        setStatus(data.message || data.error || 'Request failed');
        return;
      }
      if (data.run) setRun(data.run);
      setPrepared(data.prepared ?? null);
      setPermit(data.permit ?? null);
      setReceipt(data.receipt ?? null);
      setStatus(
        data.run
          ? `Step · ${data.run.current_step.replace(/_/g, ' ')} · ${data.run.status.replace(/_/g, ' ')}`
          : 'Ready',
      );
    } catch {
      setStatus('Network error — is the DO server running?');
    } finally {
      setBusy(false);
    }
  }, []);

  const basketLines = demo.basket.filter(
    (line) => !run || run.use_sponsored_path || !line.sponsored,
  );
  const total = basketLines.reduce((sum, line) => sum + line.priceNzd * line.qty, 0);

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
          <span>sponsored journeys</span>
          <span className={styles.preview}>assembl prototype</span>
        </div>
        <nav className={styles.headerActions} aria-label="DO surfaces">
          <Link href="/do/browser">Browser Runtime</Link>
          <Link href="/do/widget">Companion</Link>
          <Link href="/do/office">Office</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <p className={styles.disclaimer} role="note">
          {demo.disclaimer}
        </p>

        <section className={styles.hero}>
          <p className={styles.eyebrow}>{demo.demoLabel}</p>
          <div className={styles.agentRow}>
            <span className={`do-craft-orb ${styles.agentOrb}`} aria-hidden>
              <DoMark />
            </span>
            <div>
              <h1>{demo.agent.name}</h1>
              <p>{demo.agent.tagline}</p>
            </div>
          </div>
          <h2 className={styles.title}>{demo.title}</h2>
        </section>

        <ol className={styles.steps} aria-label="Journey steps">
          {demo.steps.map((step) => {
            const active = run?.current_step === step.id;
            return (
              <li
                key={step.id}
                data-active={active ? 'true' : 'false'}
                data-sponsored={step.sponsored ? 'true' : 'false'}
              >
                <strong>{step.label}</strong>
                {step.sponsored ? <em>sponsored</em> : null}
                <span>{step.summary}</span>
              </li>
            );
          })}
        </ol>

        <section className={`do-craft-card ${styles.panel}`}>
          <label className={styles.field}>
            Intent
            <textarea
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              rows={3}
              disabled={Boolean(run) || busy}
            />
          </label>
          {!run ? (
            <button
              type="button"
              className="do-cta"
              disabled={busy || intent.trim().length < 3}
              onClick={() => post({ action: 'start', intent, demo_id: demo.id })}
            >
              Start journey
            </button>
          ) : (
            <div className={styles.actions}>
              {STEP_ACTIONS.filter((item) => item.when.includes(run.status)).map((item) => (
                <button
                  key={item.action}
                  type="button"
                  className={
                    item.tone === 'secondary'
                      ? 'do-cta do-cta--secondary'
                      : item.tone === 'ghost'
                        ? styles.ghostBtn
                        : 'do-cta'
                  }
                  disabled={busy}
                  onClick={() => post({ action: item.action, run_id: run.run_id })}
                >
                  {item.label}
                </button>
              ))}
              {run.status === 'receipted' ? (
                <button
                  type="button"
                  className="do-cta do-cta--secondary"
                  disabled={busy}
                  onClick={() => {
                    setRun(null);
                    setPrepared(null);
                    setPermit(null);
                    setReceipt(null);
                    setStatus('Ready for another demo run');
                  }}
                >
                  Reset demo
                </button>
              ) : null}
            </div>
          )}
          <p className={`do-craft-mono ${styles.status}`} role="status">
            {status}
          </p>
        </section>

        {run && run.status !== 'intent' ? (
          <section className={`do-craft-card ${styles.panel}`}>
            <p className={styles.eyebrow}>Assembled basket · synthetic</p>
            <ul className={styles.basket}>
              {basketLines.map((line) => (
                <li key={line.sku}>
                  <span>
                    {line.name}
                    {line.sponsored ? <em> · sponsored</em> : null}
                  </span>
                  <span className="do-craft-mono">
                    ${line.priceNzd.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <p className={styles.total}>
              Total <strong>${total.toFixed(2)}</strong>
              {run.use_sponsored_path ? (
                <span className="do-craft-mono"> · {demo.offer.disclosure}</span>
              ) : (
                <span className="do-craft-mono"> · unpaid path</span>
              )}
            </p>
          </section>
        ) : null}

        {run?.status === 'permit_pending' || run?.status === 'permitted' ? (
          <section className={`do-craft-card ${styles.permitCard}`} aria-label="DO Permit">
            <p className={styles.eyebrow}>DO Permit · approval required</p>
            <h3>{prepared?.title ?? 'Prepared action'}</h3>
            <dl className={styles.dl}>
              <div>
                <dt>prep_id</dt>
                <dd className="do-craft-mono">{prepared?.prep_id}</dd>
              </div>
              <div>
                <dt>args_hash</dt>
                <dd className="do-craft-mono">{prepared?.args_hash}</dd>
              </div>
              <div>
                <dt>permit_id</dt>
                <dd className="do-craft-mono">{permit?.permit_id}</dd>
              </div>
              <div>
                <dt>expires</dt>
                <dd className="do-craft-mono">
                  {permit
                    ? new Date(permit.expires_at).toLocaleString('en-NZ', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : '—'}
                </dd>
              </div>
            </dl>
            <p className={styles.permitNote}>
              TODO(action-core): swap local stubs to <code>/api/do/action/*</code>. This permit is
              demo-only — approve does not send to a retailer.
            </p>
          </section>
        ) : null}

        {receipt ? (
          <section className={`do-craft-card ${styles.receiptCard}`} aria-label="DO Receipt">
            <p className={styles.eyebrow}>DO Receipt</p>
            <h3>{receipt.summary}</h3>
            <p className="do-craft-mono">{receipt.receipt_id}</p>
            <p>{receipt.boundary}</p>
            {receipt.sponsor_report ? (
              <p className={styles.sponsorReport}>
                Sponsor report · sponsored={String(receipt.sponsor_report.sponsored)} ·{' '}
                {receipt.sponsor_report.vertical}
              </p>
            ) : null}
          </section>
        ) : null}

        {run?.handoff_id ? (
          <section className={`do-craft-card ${styles.panel}`}>
            <p className={styles.eyebrow}>CRM / commerce handoff stub</p>
            <p>
              <strong>{demo.handoff.system}</strong> · {demo.handoff.note}
            </p>
            <p className="do-craft-mono">handoff_id · {run.handoff_id}</p>
          </section>
        ) : null}
      </main>
    </div>
  );
}
