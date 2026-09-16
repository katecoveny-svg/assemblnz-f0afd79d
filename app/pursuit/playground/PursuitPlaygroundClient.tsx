'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  partnerMakerHref,
  PURSUIT_PLAYGROUND_PATH,
} from '@/lib/studio/task-do-maker';
import {
  hasUnlockedOutreach,
  outreachUnlockKey,
  saveOutreachLead,
  unlockOutreach,
} from '@/lib/studio/pursuit-journey';
import styles from './playground.module.css';

type WhoRunsItPayload = {
  status: string;
  legalName: string | null;
  nzbn: string | null;
  entityStatus?: string | null;
  entityType?: string | null;
  directors: Array<{ name: string; role?: string }>;
  registeredOffice?: string | null;
  sandbox: boolean;
  adapters?: { nzbn: string; companiesOffice: string };
  gaps?: string[];
};

type ToolCallEvent =
  | { kind: 'thinking'; text: string }
  | { kind: 'tool_call'; name: string; args: Record<string, unknown> }
  | {
      kind: 'tool_result';
      ok: boolean;
      summary: string;
      sandbox: boolean;
      raw?: WhoRunsItPayload;
      receiptId?: string;
    }
  | { kind: 'answer'; text: string };

type HealthResponse = {
  ok: boolean;
  auth?: { demo_test_key?: string };
  upstream?: { nzbn_configured?: boolean; companies_office_configured?: boolean };
};

const UNLOCK_ID = 'pursuit-playground-v1';
const SUGGESTIONS = ['assembl', 'Trade Me', '9429053514950', 'Xero'];

export function PursuitPlaygroundClient() {
  const unlockKey = outreachUnlockKey(UNLOCK_ID);
  const [company, setCompany] = useState('assembl');
  const [events, setEvents] = useState<ToolCallEvent[]>([]);
  const [busy, setBusy] = useState(false);
  const [demoKey, setDemoKey] = useState('test_assembl_demo_nz_who_runs_it');
  const [healthNote, setHealthNote] = useState('Checking tool health…');
  const [unlocked, setUnlocked] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadError, setLeadError] = useState('');

  useEffect(() => {
    setUnlocked(hasUnlockedOutreach(window.localStorage, unlockKey));
    let cancelled = false;
    fetch('/api/tools/nz-who-runs-it')
      .then((r) => r.json())
      .then((data: HealthResponse) => {
        if (cancelled) return;
        if (data.auth?.demo_test_key) setDemoKey(data.auth.demo_test_key);
        const nzbn = data.upstream?.nzbn_configured ? 'NZBN key present' : 'NZBN live key not set';
        const co = data.upstream?.companies_office_configured
          ? 'Companies Office key present'
          : 'Companies Office optional';
        setHealthNote(`Sandbox playground · ${nzbn} · ${co}. test_ keys never hit live registers.`);
      })
      .catch(() => {
        if (!cancelled) setHealthNote('Tool health check failed — you can still try the sandbox key.');
      });
    return () => {
      cancelled = true;
    };
  }, [unlockKey]);

  const runLookup = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q || busy) return;
    setBusy(true);
    const next: ToolCallEvent[] = [
      { kind: 'thinking', text: `Looking up who publicly runs “${q}” on NZ registers…` },
      {
        kind: 'tool_call',
        name: 'nz-who-runs-it',
        args: { company: q },
      },
    ];
    setEvents(next);

    try {
      const res = await fetch('/api/tools/nz-who-runs-it', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${demoKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ company: q }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: { message?: string; hint?: string };
        data?: WhoRunsItPayload;
        meta?: { receiptId?: string; environment?: string };
      };

      if (!res.ok || !json.ok || !json.data) {
        setEvents([
          ...next,
          {
            kind: 'tool_result',
            ok: false,
            sandbox: true,
            summary:
              json.error?.message ||
              `Lookup failed (${res.status}). ${json.error?.hint || 'Check the API key and input.'}`,
          },
          {
            kind: 'answer',
            text: 'The agent stopped. Fix the tool input or request a live key — this playground stays honest about failures.',
          },
        ]);
        return;
      }

      const data = json.data;
      const directorLine =
        data.directors?.length > 0
          ? data.directors.map((d) => `${d.name}${d.role ? ` (${d.role})` : ''}`).join(', ')
          : 'No directors returned in this result';
      const summary = [
        `status=${data.status}`,
        data.legalName ? `legalName=${data.legalName}` : null,
        data.nzbn ? `nzbn=${data.nzbn}` : null,
        `directors=${directorLine}`,
      ]
        .filter(Boolean)
        .join(' · ');

      setEvents([
        ...next,
        {
          kind: 'tool_result',
          ok: true,
          sandbox: Boolean(data.sandbox),
          summary,
          raw: data,
          receiptId: json.meta?.receiptId,
        },
        {
          kind: 'answer',
          text: data.sandbox
            ? `${data.legalName || q}: sandbox fixture from nz-who-runs-it. Not a live Companies Office read. Directors shown are public-register fields only.`
            : `${data.legalName || q}: live-shaped result. Still treat as operational data — not advice.`,
        },
      ]);
    } catch (error) {
      setEvents([
        ...next,
        {
          kind: 'tool_result',
          ok: false,
          sandbox: true,
          summary: error instanceof Error ? error.message : 'Network error',
        },
      ]);
    } finally {
      setBusy(false);
    }
  }, [busy, demoKey]);

  const submitLead = (event: React.FormEvent) => {
    event.preventDefault();
    if (!leadEmail.trim() || !leadEmail.includes('@')) {
      setLeadError('Add a work email so we can follow up on API access.');
      return;
    }
    saveOutreachLead(window.localStorage, {
      name: leadName.trim(),
      email: leadEmail.trim(),
      company: leadCompany.trim(),
      interest: 'Pursuit playground · nz-who-runs-it API access',
      surface: 'playground',
    });
    unlockOutreach(window.localStorage, unlockKey);
    setUnlocked(true);
    setLeadError('');
  };

  const ctaHref = useMemo(
    () => `/contact?product=pursuit&from=${encodeURIComponent(PURSUIT_PLAYGROUND_PATH)}`,
    [],
  );

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brandCol}>
          <div className={styles.brandRow}>
            <Link href="/" className={styles.wordmark}>assembl</Link>
            <span className={styles.slash}>/</span>
            <Link href="/pursuit">pursuit</Link>
            <span className={styles.slash}>/</span>
            <span>playground</span>
          </div>
          <p className={styles.demoBadge}>public showcase · sandbox tool · DEMO</p>
        </div>
        <nav aria-label="Playground">
          <Link href="/tools/nz-who-runs-it">Tool docs</Link>
          <Link href={partnerMakerHref('bp')}>Creator · bp Road-Ready</Link>
          <Link href="/studio/do-maker">Task DO Maker</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Pursuit playground · public showcase</p>
          <h1>See an agent call a real NZ tool.</h1>
          <p className={styles.lead}>
            Try a company lookup. Watch the agent call <code>nz-who-runs-it</code> (NZBN + Companies Office).
            Then ask for API access if you want it in your own agents.
          </p>
          <p className={styles.health} role="status">{healthNote}</p>
        </section>

        <section className={styles.stage} aria-labelledby="lookup-title">
          <div className={styles.stageHead}>
            <h2 id="lookup-title">Company lookup</h2>
            <span className={styles.badge}>tool calling</span>
          </div>
          <form
            className={styles.lookup}
            onSubmit={(event) => {
              event.preventDefault();
              void runLookup(company);
            }}
          >
            <label htmlFor="company-query">Company name or NZBN</label>
            <div className={styles.lookupRow}>
              <input
                id="company-query"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="assembl"
                maxLength={120}
                autoComplete="organization"
              />
              <button type="submit" disabled={busy}>
                {busy ? 'Calling…' : 'Run lookup'}
              </button>
            </div>
          </form>
          <div className={styles.suggestions} aria-label="Suggestions">
            {SUGGESTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setCompany(item);
                  void runLookup(item);
                }}
              >
                {item}
              </button>
            ))}
          </div>

          <div className={styles.transcript} aria-live="polite" aria-label="Agent tool transcript">
            {events.length === 0 ? (
              <p className={styles.empty}>
                No calls yet. Run a lookup to see thinking → tool call → evidence plate → answer.
              </p>
            ) : (
              events.map((event, index) => (
                <article key={`${event.kind}-${index}`} data-kind={event.kind} className={styles.event}>
                  <header>
                    <span>{event.kind.replace('_', ' ')}</span>
                    {event.kind === 'tool_result' && event.sandbox ? (
                      <span className={styles.badge}>sandbox</span>
                    ) : null}
                  </header>
                  {event.kind === 'thinking' || event.kind === 'answer' ? <p>{event.text}</p> : null}
                  {event.kind === 'tool_call' ? (
                    <p className={styles.toolCall}>
                      <code>{event.name}</code>
                      {' · '}
                      company=<strong>{String(event.args.company ?? '')}</strong>
                    </p>
                  ) : null}
                  {event.kind === 'tool_result' ? (
                    event.ok && event.raw ? (
                      <EvidencePlate data={event.raw} receiptId={event.receiptId} />
                    ) : (
                      <p data-ok={event.ok}>{event.summary}</p>
                    )
                  ) : null}
                </article>
              ))
            )}
          </div>
        </section>

        <section className={styles.cta} aria-labelledby="cta-title">
          <div>
            <p className={styles.eyebrow}>Next step</p>
            <h2 id="cta-title">Request API access</h2>
            <p>
              Unlock deeper notes in this browser, or talk to Assembl about wiring nz-who-runs-it into your agents.
            </p>
          </div>
          {!unlocked ? (
            <form className={styles.leadForm} onSubmit={submitLead}>
              <label>
                Name
                <input value={leadName} onChange={(e) => setLeadName(e.target.value)} maxLength={80} />
              </label>
              <label>
                Work email
                <input
                  type="email"
                  required
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  maxLength={120}
                />
              </label>
              <label>
                Company
                <input value={leadCompany} onChange={(e) => setLeadCompany(e.target.value)} maxLength={80} />
              </label>
              {leadError ? <p className={styles.error} role="alert">{leadError}</p> : null}
              <button type="submit">Request API access</button>
              <p className={styles.fine}>
                DEMO lead capture stays in this browser until you contact us. Nothing is emailed from this page.
              </p>
            </form>
          ) : (
            <div className={styles.unlocked}>
              <p>Thanks — access notes unlocked for this browser.</p>
              <ul>
                <li>Sandbox key prefix: <code>test_</code> (never hits live registers)</li>
                <li>Docs: <Link href="/tools/nz-who-runs-it">/tools/nz-who-runs-it</Link></li>
                <li>Endpoint: <code>POST /api/tools/nz-who-runs-it</code></li>
                <li>Creator demos: <Link href={partnerMakerHref('bp')}>bp Road-Ready maker</Link></li>
              </ul>
              <a className={styles.primary} href={ctaHref}>Talk to Assembl</a>
            </div>
          )}
        </section>

        <p className={styles.footerNote}>
          Public Assembl showcase — not a client skin · live home untouched
        </p>
      </main>
    </div>
  );
}

function EvidencePlate({
  data,
  receiptId,
}: {
  data: WhoRunsItPayload;
  receiptId?: string;
}) {
  return (
    <div className={styles.receipt} aria-label="Evidence receipt">
      <div className={styles.receiptHead}>
        <strong>{data.legalName || 'Lookup result'}</strong>
        <span className={styles.receiptMeta}>
          {data.sandbox ? 'sandbox fixture' : 'live-shaped'} · evidence plate
        </span>
      </div>
      <div className={styles.receiptGrid}>
        <div className={styles.receiptCell}>
          <span>NZBN</span>
          <strong>{data.nzbn || '—'}</strong>
        </div>
        <div className={styles.receiptCell}>
          <span>Status</span>
          <strong>{data.entityStatus || data.status || '—'}</strong>
        </div>
        <div className={styles.receiptCell}>
          <span>Entity</span>
          <strong>{data.entityType || '—'}</strong>
        </div>
        <div className={styles.receiptCell}>
          <span>Registered office</span>
          <strong>{data.registeredOffice || '—'}</strong>
        </div>
      </div>
      <div className={styles.receiptDirectors}>
        <span>Directors · public register fields only</span>
        {data.directors?.length ? (
          <ul>
            {data.directors.map((director) => (
              <li key={`${director.name}-${director.role || 'dir'}`}>
                {director.name}
                {director.role ? ` · ${director.role}` : ''}
              </li>
            ))}
          </ul>
        ) : (
          <p>No directors returned in this result.</p>
        )}
      </div>
      <div className={styles.receiptFoot}>
        adapters · nzbn={data.adapters?.nzbn || '—'} · companiesOffice=
        {data.adapters?.companiesOffice || '—'}
        {receiptId ? ` · receipt ${receiptId}` : ''}
        {data.sandbox
          ? ' · DEMO honesty: not a live Companies Office read'
          : ' · treat as operational data, not advice'}
      </div>
    </div>
  );
}
