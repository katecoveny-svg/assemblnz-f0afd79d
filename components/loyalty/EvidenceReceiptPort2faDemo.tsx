'use client';

/**
 * Evidence receipt DEMO — Engage People–class loyalty craft.
 * Paper/chalk field · plum accent · Instrument Sans + IBM Plex Mono.
 * Phase 0 spine = port_2fa. status=DEMO always. Auth path stays clear.
 * Homepage `/` untouched. One NZ private gate untouched.
 */

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { CraftScroll, ObserveAdviseAct } from '@/components/agent-app';
import {
  ASSEMBL_CANON,
  EVIDENCE_RECEIPT_PREVIEW,
  EVIDENCE_RECEIPT_WORKFLOWS,
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
                <dd>DEMO</dd>
              </div>
              <div>
                <dt>wait</dt>
                <dd>
                  {receipt.wait.label} · {receipt.wait.window}
                </dd>
              </div>
              <div>
                <dt>sample earn</dt>
                <dd>+{stamp} (sample)</dd>
              </div>
              <div>
                <dt>permission</dt>
                <dd>{receipt.earn.permission}</dd>
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
          <h2 id="erd-detail-title">Evidence receipt · detail</h2>
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

function WorkflowsRail() {
  const c = EVIDENCE_RECEIPT_PREVIEW;
  const [activeId, setActiveId] = useState<(typeof EVIDENCE_RECEIPT_WORKFLOWS)[number]['id']>(
    EVIDENCE_RECEIPT_WORKFLOWS[0].id,
  );
  const active =
    EVIDENCE_RECEIPT_WORKFLOWS.find((s) => s.id === activeId) ?? EVIDENCE_RECEIPT_WORKFLOWS[0];

  if (!active) return null;

  return (
    <div className="erd-life" id="erd-workflows">
      <div className="erd-life-rail" role="tablist" aria-label="DEMO loyalty workflows">
        {EVIDENCE_RECEIPT_WORKFLOWS.map((stage, index) => (
          <button
            key={stage.id}
            type="button"
            role="tab"
            id={`erd-life-tab-${stage.id}`}
            aria-selected={stage.id === active.id}
            aria-controls="erd-life-panel"
            className="erd-life-node"
            data-active={stage.id === active.id ? 'true' : 'false'}
            onClick={() => setActiveId(stage.id)}
          >
            <span className="erd-mono erd-life-step">{stage.step}</span>
            <strong>{stage.short}</strong>
            {index < EVIDENCE_RECEIPT_WORKFLOWS.length - 1 ? (
              <span className="erd-life-connector" aria-hidden />
            ) : null}
          </button>
        ))}
      </div>

      <div
        className="erd-life-panel"
        id="erd-life-panel"
        role="tabpanel"
        aria-labelledby={`erd-life-tab-${active.id}`}
        aria-live="polite"
      >
        <div className="erd-life-copy">
          <p className="erd-mono erd-life-hint">{c.workflowsHint}</p>
          <h3>{active.title}</h3>
          <p>{active.summary}</p>
          {active.id === 'wait-earn' || active.id === 'prove-wait' ? (
            <a className="erd-cta erd-cta-ghost erd-life-link" href="#erd-port">
              {c.ctaPort2fa}
            </a>
          ) : null}
          {active.id === 'agent-surface' ? (
            <a className="erd-cta erd-cta-ghost erd-life-link" href="#erd-chat">
              {c.ctaChat}
            </a>
          ) : null}
        </div>

        <aside className="erd-life-pin">
          <span className="erd-demo-pill erd-mono">{c.demoBadge}</span>
          <p className="erd-mono erd-life-pin-code">{active.pinCode}</p>
          <h4>{active.pinTitle}</h4>
          <p>{active.pinBody}</p>
          <p className="erd-mono erd-life-pin-desk">{active.desk}</p>
          <p className="erd-mono erd-life-pin-stamp">
            {c.evidenceLabel} · staged · not lodged
          </p>
        </aside>
      </div>
    </div>
  );
}

type ChatMsg = { role: 'user' | 'assistant'; content: string };

function LoyaltyPreviewChat() {
  const c = EVIDENCE_RECEIPT_PREVIEW;
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState('');
  const streamRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = streamRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const send = (raw: string) => {
    const clean = raw.trim();
    if (!clean || busy) return;
    setBusy(true);
    setDraft('');
    setMessages((m) => [...m, { role: 'user', content: clean }]);
    const match = c.chatOpeners.find((o) => o.q.toLowerCase() === clean.toLowerCase());
    const reply =
      match?.a ??
      `Draft ready — loyalty desk. I heard “${clean.slice(0, 80)}”. Ask about wait→earn, the Evidence receipt, who reviews, or the wallet layer. Status: awaiting human approval. Evidence receipt: DEMO · nothing sends.`;
    window.setTimeout(() => {
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
      setBusy(false);
    }, 380);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(draft);
  };

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');

  return (
    <div className="erd-chat" id="erd-chat">
      <div className="erd-chat-main">
        <header className="erd-chat-head">
          <p className="erd-mono">scripted · draft-only · DEMO</p>
          <p>{c.chatGreeting}</p>
        </header>

        {messages.length === 0 ? (
          <div className="erd-chat-openers" role="group" aria-label="Loyalty DEMO questions">
            {c.chatOpeners.map((o) => (
              <button key={o.q} type="button" className="erd-chat-opener" onClick={() => send(o.q)}>
                {o.q}
              </button>
            ))}
          </div>
        ) : (
          <div className="erd-chat-thread" ref={streamRef} aria-live="polite">
            {messages.map((m, i) => (
              <p key={i} className={`erd-chat-msg erd-chat-${m.role}`}>
                {m.content}
              </p>
            ))}
            {busy ? (
              <p className="erd-chat-msg erd-chat-assistant erd-chat-typing" aria-label="Preparing a reply">
                <span />
                <span />
                <span />
              </p>
            ) : null}
          </div>
        )}

        <form className="erd-chat-composer" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="erd-ask">
            Ask the loyalty desk
          </label>
          <input
            id="erd-ask"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about wait · earn · evidence…"
            maxLength={280}
            autoComplete="off"
            disabled={busy}
          />
          <button type="submit" disabled={busy || !draft.trim()} aria-label="Send">
            ↑
          </button>
        </form>
        <p className="erd-mono erd-chat-foot">{c.chatFooter}</p>
      </div>

      <aside className="erd-chat-evidence" aria-label="Evidence aside">
        <p className="erd-mono">{c.evidenceLabel}</p>
        {lastAssistant ? (
          <>
            <h3>{c.approvalLabel}</h3>
            <p>{lastAssistant.content.slice(0, 160)}…</p>
            <span className="erd-demo-pill erd-mono">{c.demoBadge}</span>
          </>
        ) : (
          <>
            <h3>No draft yet</h3>
            <p>Ask once. A cited draft assembles and holds for a human yes — nothing outbound.</p>
            <a className="erd-cta erd-cta-ghost" href="#erd-port">
              {c.ctaPort2fa}
            </a>
          </>
        )}
      </aside>
    </div>
  );
}

export function EvidenceReceiptPort2faDemo() {
  const receipt = PORT_2FA_EVIDENCE_RECEIPT_DEMO;
  const c = EVIDENCE_RECEIPT_PREVIEW;

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

          <div className="erd-hero-stage">
            <div className="erd-copy">
              <p className="erd-brand-signal">{c.brand}</p>
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
                <a className="erd-cta erd-cta-primary" href="#erd-workflows">
                  {c.ctaWorkflows}
                </a>
                <a className="erd-cta erd-cta-ghost" href="#erd-port">
                  {c.ctaPort2fa}
                </a>
              </div>

              <p className="erd-disclaimer">{c.disclaimer}</p>
            </div>

            <aside className="erd-hero-aside" aria-label="DEMO loyalty journey preview">
              <div className="erd-hero-lot">
                <p className="erd-mono erd-hero-lot-label">DEMO journey rail</p>
                <ol className="erd-hero-stages">
                  <li data-on="true">
                    <span className="erd-mono">01</span> Wait
                  </li>
                  <li data-on="true">
                    <span className="erd-mono">02</span> Earn
                  </li>
                  <li data-on="true">
                    <span className="erd-mono">03</span> Evidence
                  </li>
                  <li>
                    <span className="erd-mono">04</span> Human yes
                  </li>
                </ol>
                <p className="erd-hero-stamp erd-mono">sample · DEMO · not a live program</p>
              </div>
              <div className="erd-phone-wrap">
                <PhoneReceipt receipt={receipt} />
                <div className="erd-plinth" aria-hidden="true" />
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
          <div className="erd-metrics" aria-label="DEMO directional trust signals">
            {c.metrics.map((m) => (
              <article key={m.label} className="erd-metric">
                <p className="erd-mono erd-metric-value">{m.value}</p>
                <h3>{m.label}</h3>
                <p>{m.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="erd-section" aria-labelledby="erd-who-title">
          <div className="erd-section-head">
            <p className="erd-eyebrow erd-mono">{c.whoForEyebrow}</p>
            <h2 id="erd-who-title">{c.whoForTitle}</h2>
            <p>{c.whoForSupport}</p>
          </div>
          <div className="erd-who">
            {c.whoForPoints.map((point) => (
              <article key={point.title} className="erd-who-card">
                <h3>{point.title}</h3>
                <p>{point.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="erd-section" aria-labelledby="erd-pillars-title">
          <div className="erd-section-head">
            <p className="erd-eyebrow erd-mono">{c.pillarsEyebrow}</p>
            <h2 id="erd-pillars-title">{c.pillarsTitle}</h2>
            <p>{c.pillarsSupport}</p>
          </div>
          <div className="erd-pillars">
            {c.pillars.map((p) => (
              <article key={p.id} className="erd-pillar">
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="erd-section" aria-labelledby="erd-life-title">
          <div className="erd-section-head">
            <p className="erd-eyebrow erd-mono">{c.workflowsEyebrow}</p>
            <h2 id="erd-life-title">{c.workflowsTitle}</h2>
            <p>{c.workflowsSupport}</p>
          </div>
          <WorkflowsRail />
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

        <section className="erd-section" aria-labelledby="erd-chat-title">
          <div className="erd-section-head">
            <p className="erd-eyebrow erd-mono">{c.chatEyebrow}</p>
            <h2 id="erd-chat-title">{c.chatTitle}</h2>
            <p>{c.chatSupport}</p>
          </div>
          <LoyaltyPreviewChat />
        </section>
      </main>

      <footer className="erd-footer">
        <p>{c.footerNote}</p>
        <p className="erd-footer-mark">{c.footerWordmark}</p>
      </footer>
    </div>
  );
}
