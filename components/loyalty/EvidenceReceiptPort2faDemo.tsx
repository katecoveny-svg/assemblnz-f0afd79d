'use client';

/**
 * Evidence receipt DEMO — Engage People craft BAR (checklist #1198).
 * Paper/chalk · plum/heather accent · Instrument Sans + IBM Plex Mono.
 * Phase 0 spine = port_2fa. status=DEMO always. Homepage `/` untouched.
 */

import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';
import { CraftScroll, ObserveAdviseAct } from '@/components/agent-app';
import {
  ASSEMBL_CANON,
  EVIDENCE_RECEIPT_MOMENTS,
  EVIDENCE_RECEIPT_OPS,
  EVIDENCE_RECEIPT_PREVIEW,
  EVIDENCE_RECEIPT_SYSTEM,
  EVIDENCE_RECEIPT_WAIT,
  PORT_2FA_EVIDENCE_RECEIPT_DEMO,
  formatSampleCredit,
  type EvidenceReceiptDemoV0,
} from '@/lib/loyalty/evidence-receipt-demo';
import '@/components/agent-app/agent-app-craft.css';
import './evidence-receipt-port-2fa.css';

const THEME = {
  '--erd-plum': ASSEMBL_CANON.plum,
  '--erd-mulberry': ASSEMBL_CANON.mulberry,
  '--erd-heather': ASSEMBL_CANON.heather,
  '--erd-chalk': ASSEMBL_CANON.chalk,
  '--erd-paper': ASSEMBL_CANON.paper,
  ['--aa-plum']: ASSEMBL_CANON.plum,
  ['--aa-muted']: ASSEMBL_CANON.mulberry,
  ['--aa-rose']: ASSEMBL_CANON.heather,
  ['--aa-chalk']: ASSEMBL_CANON.chalk,
  ['--aa-paper']: ASSEMBL_CANON.paper,
  ['--aa-ink']: ASSEMBL_CANON.plum,
  ['--aa-ink-soft']: 'rgba(36, 11, 33, 0.68)',
  ['--aa-line']: 'rgba(36, 11, 33, 0.12)',
  ['--aa-line-strong']: 'rgba(36, 11, 33, 0.28)',
  ['--aa-grid']: 'transparent',
} as CSSProperties;

function PhoneReceipt({ receipt }: { receipt: EvidenceReceiptDemoV0 }) {
  const stamp = formatSampleCredit(receipt.earn.sample_stamp_nzd);
  const [clock, setClock] = useState('9:41');

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(`${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`);
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="erd-phone" aria-label="Phone preview of Evidence receipt DEMO">
      <div className="erd-phone-shell">
        <div className="erd-phone-island" aria-hidden="true" />
        <div className="erd-phone-status">
          <span>{clock}</span>
          <span className="erd-phone-status-right" aria-hidden="true">
            <i />
            <i />
            <b />
          </span>
        </div>

        <div className="erd-phone-app">
          <div className="erd-phone-appbar">
            <strong>assembl</strong>
            <em>evidence receipt</em>
          </div>

          <span className="erd-phone-demo">status · DEMO</span>

          <p className="erd-phone-kicker">
            {receipt.wait_type} · {receipt.wait.window}
          </p>
          <h2>{receipt.wait.moment}</h2>

          <p className="erd-auth-clear">
            <strong>Auth path clear.</strong> 2FA keeps moving. Earn sits beside the wait.
          </p>

          <div className="erd-pulse" aria-hidden="true">
            <i />
          </div>

          <article className="erd-phone-receipt" aria-label="Evidence receipt DEMO summary">
            <header>
              <span>assembl</span>
              <strong>Evidence receipt</strong>
            </header>
            <dl>
              <div>
                <dt>status</dt>
                <dd>{receipt.evidence.status}</dd>
              </div>
              <div>
                <dt>source</dt>
                <dd>{receipt.evidence.source}</dd>
              </div>
              <div>
                <dt>amount</dt>
                <dd>{receipt.evidence.amount_label}</dd>
              </div>
              <div>
                <dt>wait</dt>
                <dd>
                  {receipt.wait.label} · {receipt.wait.window}
                </dd>
              </div>
              <div>
                <dt>named human</dt>
                <dd>
                  {receipt.named_human.name} · {receipt.named_human.role}
                </dd>
              </div>
            </dl>
          </article>
        </div>

        <div className="erd-homebar" aria-hidden="true" />
      </div>
    </div>
  );
}

function EvidenceReceiptCard({ receipt }: { receipt: EvidenceReceiptDemoV0 }) {
  const c = EVIDENCE_RECEIPT_PREVIEW;
  const rows: { label: string; value: string }[] = [
    { label: 'source', value: receipt.evidence.source },
    { label: 'timestamp', value: receipt.evidence.timestamp },
    { label: 'rule', value: receipt.evidence.rule },
    { label: 'amount', value: receipt.evidence.amount_label },
    { label: 'status', value: receipt.evidence.status },
    { label: 'receipt_id', value: receipt.receipt_id },
    { label: 'permission', value: receipt.earn.permission },
    {
      label: 'named human',
      value: `${receipt.named_human.name} · ${receipt.named_human.role}`,
    },
    { label: 'context_hash', value: receipt.context_hash },
    { label: 'rules_hash', value: receipt.rules_hash },
  ];

  return (
    <section className="erd-receipt-card" id="erd-receipt" aria-labelledby="erd-receipt-title">
      <div className="erd-receipt-card-head">
        <div>
          <p className="erd-mono erd-eyebrow">{c.receiptEyebrow}</p>
          <h2 id="erd-receipt-title">{c.evidenceLabel}</h2>
          <p>{c.receiptSupport}</p>
        </div>
        <span className="erd-seal">{receipt.evidence.status}</span>
      </div>
      <dl className="erd-receipt-fields">
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="erd-receipt-audit">
        <a className="erd-cta erd-cta-ghost" href="#erd-ledger">
          {receipt.evidence.audit_label}
        </a>
        <p className="erd-mono">audit link · in-page · DEMO only</p>
      </div>
    </section>
  );
}

function DetailLedger({ receipt }: { receipt: EvidenceReceiptDemoV0 }) {
  const rows: { label: string; value: string }[] = [
    { label: 'schema', value: receipt.schema_version },
    { label: 'status', value: receipt.status },
    { label: 'wait_type', value: receipt.wait_type },
    { label: 'receipt_id', value: receipt.receipt_id },
    { label: 'issued_at', value: receipt.issued_at },
    {
      label: 'auth_path',
      value: `${receipt.wait.auth_path} — never slows 2FA`,
    },
    { label: 'source', value: receipt.evidence.source },
    { label: 'rule', value: receipt.evidence.rule },
    { label: 'amount', value: receipt.evidence.amount_label },
    { label: 'context_hash', value: receipt.context_hash },
    { label: 'rules_hash', value: receipt.rules_hash },
    {
      label: 'sample stamp',
      value: `${formatSampleCredit(receipt.earn.sample_stamp_nzd)} → ${receipt.earn.destination_label}`,
    },
    {
      label: 'permission',
      value: `opted in ${receipt.permission.opted_in ? 'yes' : 'no'} · reversible ${receipt.permission.reversible ? 'yes' : 'no'}`,
    },
    { label: 'currency owner', value: receipt.ownership.currency_owner },
    { label: 'evidence owner', value: receipt.ownership.evidence_owner },
    {
      label: 'named human',
      value: `${receipt.named_human.name} · ${receipt.named_human.role}`,
    },
  ];

  return (
    <section className="erd-detail" aria-labelledby="erd-detail-title" id="erd-ledger">
      <div className="erd-detail-head">
        <div>
          <h2 id="erd-detail-title">Evidence receipt · audit detail</h2>
          <p>
            What the wait recorded. Sample earn only. Currency stays with the carrier.
          </p>
        </div>
        <span className="erd-seal">DEMO</span>
      </div>

      <dl className="erd-grid">
        {rows.map((row) => (
          <div className="erd-row" key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="erd-note-block">
        <h3>currency_note</h3>
        <p>{receipt.currency_note}</p>
      </div>
    </section>
  );
}

function JourneyMoments() {
  const [activeId, setActiveId] = useState<(typeof EVIDENCE_RECEIPT_MOMENTS)[number]['id']>(
    EVIDENCE_RECEIPT_MOMENTS[0].id,
  );
  const active =
    EVIDENCE_RECEIPT_MOMENTS.find((m) => m.id === activeId) ?? EVIDENCE_RECEIPT_MOMENTS[0];
  if (!active) return null;

  return (
    <div className="erd-moments" id="erd-moments">
      <div className="erd-moments-rail" role="tablist" aria-label="DEMO journey moments">
        {EVIDENCE_RECEIPT_MOMENTS.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            id={`erd-moment-tab-${m.id}`}
            aria-selected={m.id === active.id}
            aria-controls="erd-moment-panel"
            className="erd-moment-tab"
            data-active={m.id === active.id ? 'true' : 'false'}
            onClick={() => setActiveId(m.id)}
          >
            {m.short}
          </button>
        ))}
      </div>
      <div
        className="erd-moment-panel"
        id="erd-moment-panel"
        role="tabpanel"
        aria-labelledby={`erd-moment-tab-${active.id}`}
        aria-live="polite"
      >
        <div className="erd-moment-copy">
          <h3>{active.title}</h3>
          <p>{active.summary}</p>
        </div>
        <dl className="erd-moment-ui" aria-label="DEMO UI surface">
          {active.ui.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export function EvidenceReceiptPort2faDemo() {
  const receipt = PORT_2FA_EVIDENCE_RECEIPT_DEMO;
  const c = EVIDENCE_RECEIPT_PREVIEW;
  const wait = EVIDENCE_RECEIPT_WAIT;
  const ops = EVIDENCE_RECEIPT_OPS;

  return (
    <div className="erd aa-root" data-craft="loyalty-evidence" style={THEME}>
      <CraftScroll
        rootSelector=".erd"
        revealSelector=".erd-story > section:not(.erd-hero), .erd-footer"
      />

      <header className="erd-header">
        <Link className="erd-wordmark" href="/" aria-label="assembl home">
          {c.brand}
          <span>·</span>
        </Link>
        <p className="erd-header-tag erd-mono">{c.productLine}</p>
        <nav className="erd-header-nav" aria-label="assembl tools">
          <a className="erd-studio" href={c.nav.studio.href}>
            {c.nav.studio.label}
            <i aria-hidden="true">↗</i>
          </a>
          <a className="erd-operator" href={c.nav.operator.href} rel="nofollow">
            {c.nav.operator.label}
            <i aria-hidden="true">↗</i>
          </a>
        </nav>
      </header>

      <main className="erd-shell erd-story">
        <section className="erd-section erd-hero" aria-labelledby="erd-hero-title">
          <div className="erd-top">
            <div className="erd-brand">
              <strong>{c.brand}</strong>
              <span>{c.productLine}</span>
            </div>
            <span className="erd-demo-pill" role="status">
              <i aria-hidden="true" />
              {c.previewBadge}
            </span>
          </div>

          <div className="erd-hero-card">
            <div className="erd-copy">
              <p className="erd-kicker erd-mono">{c.kicker}</p>
              <h1 id="erd-hero-title">{c.heroLine}</h1>
              <p className="erd-lede">{c.heroSupport}</p>
              <p className="erd-spine">{c.spine}</p>

              <div className="erd-boundary" aria-label="Ownership boundary">
                <p>
                  <span>currency</span>
                  <strong>{receipt.ownership.currency_owner}</strong>
                </p>
                <p>
                  <span>evidence</span>
                  <strong>{receipt.ownership.evidence_owner}</strong>
                </p>
              </div>

              <div className="erd-cta-row">
                <a className="erd-cta erd-cta-primary" href="#erd-receipt">
                  {c.ctaInspect}
                </a>
                <a className="erd-cta erd-cta-ghost" href="#erd-port">
                  {c.ctaPort2fa}
                </a>
              </div>

              <p className="erd-disclaimer">{c.disclaimer}</p>
            </div>

            <aside className="erd-hero-frame" aria-label="DEMO Evidence receipt preview">
              <div className="erd-hero-frame-inner">
                <p className="erd-mono erd-hero-lot-label">Phase 0 · port_2fa</p>
                <PhoneReceipt receipt={receipt} />
                <p className="erd-hero-stamp erd-mono">sample · DEMO · not a live program</p>
              </div>
            </aside>
          </div>
        </section>

        <section className="erd-section erd-section-metrics" aria-labelledby="erd-metrics-title">
          <div className="erd-section-head">
            <p className="erd-eyebrow erd-mono">{c.metricsEyebrow}</p>
            <h2 id="erd-metrics-title">{c.metricsTitle}</h2>
            <p>{c.metricsSupport}</p>
          </div>
          <div className="erd-metrics erd-metrics-bento" aria-label="DEMO directional trust signals">
            {c.metrics.map((m) => (
              <article key={m.label} className="erd-metric">
                <p className="erd-mono erd-metric-value">{m.value}</p>
                <h3>{m.label}</h3>
                <p>{m.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="erd-section" aria-labelledby="erd-system-title" id="erd-system">
          <div className="erd-section-head">
            <p className="erd-eyebrow erd-mono">{c.systemEyebrow}</p>
            <h2 id="erd-system-title">{c.systemTitle}</h2>
            <p>{c.systemSupport}</p>
          </div>
          <ol className="erd-system" aria-label="Loyalty system stages">
            {EVIDENCE_RECEIPT_SYSTEM.map((stage) => (
              <li key={stage.id} className="erd-system-node">
                <span className="erd-mono erd-system-step">{stage.step}</span>
                <strong>{stage.label}</strong>
                <p>{stage.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="erd-section" aria-labelledby="erd-wait-title" id="erd-wait">
          <div className="erd-section-head">
            <p className="erd-eyebrow erd-mono">{c.waitEyebrow}</p>
            <h2 id="erd-wait-title">{c.waitTitle}</h2>
            <p>{c.waitSupport}</p>
          </div>
          <div className="erd-wait-panel">
            <article>
              <h3 className="erd-mono">status</h3>
              <p>{wait.status}</p>
            </article>
            <article>
              <h3 className="erd-mono">timing</h3>
              <p>{wait.timing}</p>
            </article>
            <article>
              <h3 className="erd-mono">why wait</h3>
              <p>{wait.why}</p>
            </article>
            <article>
              <h3 className="erd-mono">next action</h3>
              <p>{wait.nextAction}</p>
            </article>
          </div>
        </section>

        <section className="erd-section" aria-labelledby="erd-receipt-section-title">
          <div className="erd-section-head">
            <p className="erd-eyebrow erd-mono">{c.receiptEyebrow}</p>
            <h2 id="erd-receipt-section-title">{c.receiptTitle}</h2>
            <p>{c.receiptSupport}</p>
          </div>
          <EvidenceReceiptCard receipt={receipt} />
        </section>

        <section className="erd-section" aria-labelledby="erd-moments-title">
          <div className="erd-section-head">
            <p className="erd-eyebrow erd-mono">{c.momentsEyebrow}</p>
            <h2 id="erd-moments-title">{c.momentsTitle}</h2>
            <p>{c.momentsSupport}</p>
          </div>
          <JourneyMoments />
        </section>

        <section className="erd-section" aria-labelledby="erd-ops-title" id="erd-ops">
          <div className="erd-section-head">
            <p className="erd-eyebrow erd-mono">{ops.eyebrow}</p>
            <h2 id="erd-ops-title">{ops.title}</h2>
            <p>{ops.support}</p>
          </div>
          <div className="erd-ops">
            {ops.tiles.map((tile) => (
              <article key={tile.id} className="erd-ops-tile">
                <h3>{tile.title}</h3>
                <p>{tile.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="erd-section" aria-labelledby="erd-port-title" id="erd-port">
          <div className="erd-section-head">
            <p className="erd-eyebrow erd-mono">{c.portEyebrow}</p>
            <h2 id="erd-port-title">{c.portTitle}</h2>
            <p>{c.portSupport}</p>
          </div>
          <div className="erd-port-stage">
            <div className="erd-phone-wrap erd-phone-wrap-inline">
              <PhoneReceipt receipt={receipt} />
              <div className="erd-plinth" aria-hidden="true" />
            </div>
            <DetailLedger receipt={receipt} />
          </div>
        </section>

        <ObserveAdviseAct
          eyebrow={c.narrativeEyebrow}
          title={c.narrativeTitle}
          steps={c.chapters}
          demoBadge={c.demoBadge}
          observeStatus="Observing loyalty wait · draft not ready"
          approveLabel="Approve draft"
          actLabel="Act"
          actDisabledHint="Act stays locked until you approve the draft."
          actEnabledHint="Approved — Act can run the staged loyalty draft."
        />
      </main>

      <footer className="erd-footer">
        <div className="erd-cta-row erd-footer-cta">
          <a className="erd-cta erd-cta-primary" href="#erd-receipt">
            {c.ctaInspect}
          </a>
          <a className="erd-cta erd-cta-ghost" href="#erd-port">
            {c.ctaPort2fa}
          </a>
        </div>
        <p>{c.footerNote}</p>
        <p className="erd-footer-mark">{c.footerWordmark}</p>
      </footer>
    </div>
  );
}
