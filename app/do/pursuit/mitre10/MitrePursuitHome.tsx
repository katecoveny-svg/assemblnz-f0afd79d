'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AgentSpec, DemoTemplate, PageContext } from '@/apps/do/shared/types';
import { DoFloatingWidget } from '../../DoFloatingWidget';
import Link from 'next/link';

const MITRE_FIXTURE_PAGE: PageContext = {
  url: 'fixture://mitre10-sap-rfp',
  title: 'DEMO · Mitre 10 SAP pursuit — RFP snippet',
  selectedText:
    'Improve purchase-order visibility from DC to store · Human approval before any write-back to SAP',
  pageText: `REQUEST FOR PROPOSAL — Store operations + supply-chain visibility (DEMO)
Buyer: Mitre 10 New Zealand (sample business — details fictional for this DEMO).
Closing: 24 Oct 2026, 17:00 NZST.
Must-haves: SAP MM / SD touchpoints · Read-path ≤ 15 min · Human approval before SAP write-back.
SAP landscape: ECC 6.0 with S/4 migration (wave 2) · MM PO/GR · SD transfers · PI/PO middleware.`,
};

/**
 * Private Mitre / SAP pursuit pack — not rendered on public /do.
 * Reach via /do/pursuit/mitre10 only.
 */
export function MitrePursuitHome() {
  const [templates, setTemplates] = useState<DemoTemplate[]>([]);
  const [draft, setDraft] = useState<AgentSpec | null>(null);
  const [busy, setBusy] = useState(false);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [widgetKey, setWidgetKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch('/api/do/templates?pack=mitre10')
      .then((r) => r.json())
      .then((data: { templates?: DemoTemplate[] }) => {
        setTemplates(data.templates || []);
      });
  }, []);

  const openDemo = useCallback(() => {
    setWidgetOpen(true);
    setWidgetKey((k) => k + 1);
  }, []);

  async function compile(t: DemoTemplate) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/do/agents/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: t.brief,
          templateId: t.id,
          page: MITRE_FIXTURE_PAGE,
          connector: t.connectorHint ?? 'hook-later',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'compile failed');
      setDraft(data.spec as AgentSpec);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'compile failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="do-root">
      <div className="do-stage-glow" aria-hidden />
      <div className="do-shell">
        <div className="do-topbar">
          <span className="do-pill do-pill-preview">PRIVATE · PREVIEW</span>
          <Link href="/do" className="do-pill">
            ← public /do
          </Link>
        </div>

        <section className="do-stage do-stage-private" aria-label="Mitre pursuit private pack">
          <div className="do-stage-brand">
            <p className="do-kicker">assembl · private pack</p>
            <h1 className="do-wordmark do-wordmark-sm">pursuit</h1>
            <p className="do-tagline">Mitre 10 · SAP DEMO fixtures</p>
          </div>

          <button
            type="button"
            className="do-mitre-card"
            disabled={busy}
            onClick={openDemo}
            aria-label="Open Mitre SAP DEMO"
          >
            <span className="do-mitre-mark" aria-hidden>
              <span />
              <span />
              <span />
              <span />
            </span>
            <strong>Mitre 10 · SAP</strong>
            <span className="do-mono">DEMO</span>
          </button>

          <div className="do-pinboard" aria-label="Mitre templates">
            {templates.map((t, i) => (
              <button
                key={t.id}
                type="button"
                className="do-pin"
                style={{ ['--do-pin-i' as string]: String(i % 5) }}
                disabled={busy}
                onClick={() => void compile(t)}
              >
                <span className="do-pin-glyph" aria-hidden>
                  ✦
                </span>
                <span className="do-pin-body">
                  <strong>{t.name}</strong>
                  <span>{t.summary}</span>
                </span>
                <span className="do-mono">{t.primitive}</span>
              </button>
            ))}
          </div>
        </section>

        {error ? <p className="do-error">{error}</p> : null}

        {draft ? (
          <article className="do-wallet do-wallet-highlight">
            <header className="do-wallet-head">
              <div>
                <p className="do-mono">
                  {draft.primitive}
                  {draft.lane ? ` · ${draft.lane}` : ''}
                </p>
                <h3>{draft.name}</h3>
                <p className="do-wallet-job">{draft.brief}</p>
              </div>
            </header>
            <dl className="do-spec">
              <div>
                <dt>Watches</dt>
                <dd>{draft.watches.join(' · ')}</dd>
              </div>
              <div>
                <dt>Does</dt>
                <dd>{draft.can_do_without_asking.join(' · ')}</dd>
              </div>
              <div>
                <dt>Asks first</dt>
                <dd>{draft.must_ask_before.join(' · ')}</dd>
              </div>
            </dl>
          </article>
        ) : null}
      </div>

      <DoFloatingWidget
        key={widgetKey}
        forceOpen={widgetOpen}
        launchTemplateId="mitre10-sap-rfp-brief"
        pageOverride={MITRE_FIXTURE_PAGE}
        pack="mitre10"
        onActivated={(agent) => setDraft(agent)}
        onClose={() => setWidgetOpen(false)}
      />
    </div>
  );
}
