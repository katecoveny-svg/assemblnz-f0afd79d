'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  AgentSpec,
  ConnectorChoice,
  DemoTemplate,
  PageContext,
  TemplateLane,
} from '@/apps/do/shared/types';

type TemplateGroup = {
  lane: TemplateLane;
  label: string;
  templates: DemoTemplate[];
};

type ConnectorStub = {
  id: ConnectorChoice;
  name: string;
  honesty: string;
};

type WidgetStep = 'browse' | 'spec' | 'connector';

export type DoFloatingWidgetProps = {
  /** When set, open immediately on this template (Mitre DEMO path). */
  launchTemplateId?: string | null;
  /** Override page context (Mitre fixture context). */
  pageOverride?: PageContext | null;
  onActivated?: (agent: AgentSpec) => void;
  onClose?: () => void;
  /** Controlled open from parent (Mitre DEMO / hero). */
  forceOpen?: boolean;
  /** Seed a same-tab draft from the homepage; compiling is a separate action. */
  initialBrief?: string | null;
};

function capturePage(): PageContext {
  if (typeof window === 'undefined') {
    return { url: '', title: '' };
  }
  const selected = window.getSelection()?.toString()?.trim() || '';
  let pageText = '';
  try {
    pageText = (document.body?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 3500);
  } catch {
    pageText = '';
  }
  return {
    url: window.location.href,
    title: document.title || '',
    selectedText: selected.slice(0, 2000) || undefined,
    pageText: pageText || undefined,
  };
}

export function DoFloatingWidget({
  launchTemplateId = null,
  pageOverride = null,
  onActivated,
  onClose,
  forceOpen = false,
  initialBrief = null,
}: DoFloatingWidgetProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<WidgetStep>('browse');
  const [groups, setGroups] = useState<TemplateGroup[]>([]);
  const [connectors, setConnectors] = useState<ConnectorStub[]>([]);
  const [honesty, setHonesty] = useState('');
  const [brief, setBrief] = useState(initialBrief?.trim() || '');
  const [draft, setDraft] = useState<AgentSpec | null>(null);
  const [connector, setConnector] = useState<ConnectorChoice>('hook-later');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<PageContext>(() => capturePage());
  const [laneFilter, setLaneFilter] = useState<TemplateLane | 'all'>('all');
  const [runtimeLabel, setRuntimeLabel] = useState('Assembl runtime · DEMO');

  const refreshContext = useCallback(() => {
    setPage(pageOverride ?? capturePage());
  }, [pageOverride]);

  useEffect(() => {
    void fetch('/api/do/templates')
      .then((r) => r.json())
      .then(
        (data: {
          groups: TemplateGroup[];
          connectors: ConnectorStub[];
          honesty: string;
        }) => {
          setGroups(data.groups || []);
          setConnectors(data.connectors || []);
          setHonesty(data.honesty || '');
        },
      );
    void fetch('/api/do/runtime')
      .then((r) => r.json())
      .then((data: { runtime?: { label?: string } }) => {
        if (data.runtime?.label) setRuntimeLabel(data.runtime.label);
      });
  }, []);

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      refreshContext();
    }
  }, [forceOpen, refreshContext]);

  useEffect(() => {
    const seeded = initialBrief?.trim();
    if (!seeded || !open) return;
    setBrief(seeded);
    setStep('browse');
  }, [initialBrief, open]);

  useEffect(() => {
    if (!launchTemplateId || !open) return;
    void compileFromTemplate(launchTemplateId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [launchTemplateId, open]);

  async function compileFromTemplate(templateId: string, nextBrief?: string) {
    setBusy(true);
    setError(null);
    refreshContext();
    try {
      const ctx = pageOverride ?? capturePage();
      setPage(ctx);
      const res = await fetch('/api/do/agents/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: nextBrief || '',
          templateId,
          page: ctx,
          surface: 'web-widget',
          connector,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'compile failed');
      setDraft(data.spec as AgentSpec);
      setBrief((data.spec as AgentSpec).brief);
      const hint = groups
        .flatMap((g) => g.templates)
        .find((t) => t.id === templateId)?.connectorHint;
      if (hint) setConnector(hint);
      setStep('spec');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'compile failed');
    } finally {
      setBusy(false);
    }
  }

  async function compileFreeText() {
    if (!brief.trim()) return;
    setBusy(true);
    setError(null);
    refreshContext();
    try {
      const ctx = pageOverride ?? capturePage();
      setPage(ctx);
      const res = await fetch('/api/do/agents/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: brief.trim(),
          page: ctx,
          surface: 'web-widget',
          connector,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'compile failed');
      setDraft(data.spec as AgentSpec);
      setStep('spec');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'compile failed');
    } finally {
      setBusy(false);
    }
  }

  async function activate() {
    if (!draft?.id) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/do/agents/${draft.id}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connector }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'activate failed');
      const agent = data.agent as AgentSpec;
      setDraft(agent);
      onActivated?.(agent);
      setStep('spec');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'activate failed');
    } finally {
      setBusy(false);
    }
  }

  function close() {
    setOpen(false);
    setStep('browse');
    setDraft(null);
    setError(null);
    onClose?.();
  }

  const visibleGroups = useMemo(() => {
    if (laneFilter === 'all') return groups;
    return groups.filter((g) => g.lane === laneFilter);
  }, [groups, laneFilter]);

  const chips = [
    page.title ? { label: 'Title', value: page.title } : null,
    page.url ? { label: 'URL', value: page.url } : null,
    page.selectedText
      ? { label: 'Selection', value: page.selectedText.slice(0, 120) }
      : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      <button
        type="button"
        className="do-fab"
        aria-label="DO make agent"
        aria-expanded={open}
        onClick={() => {
          if (open) {
            close();
          } else {
            refreshContext();
            setOpen(true);
            setStep('browse');
          }
        }}
      >
        <span className="do-star" aria-hidden>
          ✦
        </span>
      </button>

      {open ? (
        <div className="do-widget" role="dialog" aria-label="DO make agent">
          <header className="do-widget-head">
            <div>
              <p className="do-eyebrow">assembl · DO · PREVIEW</p>
              <h2>
                <span className="do-star" aria-hidden>
                  ✦
                </span>{' '}
                Make agent
              </h2>
            </div>
            <button type="button" className="do-widget-close" onClick={close} aria-label="Close">
              Close
            </button>
          </header>

          <p className="do-widget-honesty">
            <span className="do-chip do-chip-preview">PREVIEW</span>{' '}
            <span className="do-chip do-chip-live">
              <span className="do-chip-dot" />
              {runtimeLabel}
            </span>
            <br />
            {honesty || 'DEMO · consequential actions always need your yes.'}
          </p>

          <div className="do-context-chips" aria-label="Context">
            {chips.length === 0 ? (
              <span className="do-chip">No page context yet</span>
            ) : (
              chips.map((c) => (
                <span key={c.label} className="do-chip do-chip-live" title={c.value}>
                  <span className="do-chip-dot" />
                  {c.label}: {c.value.length > 42 ? `${c.value.slice(0, 40)}…` : c.value}
                </span>
              ))
            )}
          </div>

          {error ? <p className="do-error">{error}</p> : null}

          {step === 'browse' ? (
            <>
              <label className="do-label" htmlFor="do-widget-brief">
                Make agent for this
              </label>
              <div className="do-make-row">
                <input
                  id="do-widget-brief"
                  className="do-input"
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="e.g. prepare a pursuit brief from this page"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && brief.trim()) void compileFreeText();
                  }}
                />
                <button
                  type="button"
                  className="do-cta do-cta-secondary"
                  disabled={busy || !brief.trim()}
                  onClick={() => void compileFreeText()}
                >
                  <span className="do-star" aria-hidden>
                    ✦
                  </span>
                  compile
                </button>
              </div>

              <div className="do-lane-tabs" role="tablist" aria-label="Template lanes">
                <button
                  type="button"
                  className={`do-lane-tab${laneFilter === 'all' ? ' is-active' : ''}`}
                  onClick={() => setLaneFilter('all')}
                >
                  All
                </button>
                {groups.map((g) => (
                  <button
                    key={g.lane}
                    type="button"
                    className={`do-lane-tab${laneFilter === g.lane ? ' is-active' : ''}`}
                    onClick={() => setLaneFilter(g.lane)}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              <p className="do-how-title">Use a template</p>
              <div className="do-widget-templates">
                {visibleGroups.map((g) => (
                  <div key={g.lane} className="do-widget-lane">
                    <p className="do-mono">{g.label}</p>
                    <div className="do-template-grid do-template-grid-compact">
                      {g.templates.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          className="do-template"
                          disabled={busy}
                          onClick={() => {
                            setBrief(t.brief);
                            void compileFromTemplate(t.id, t.brief);
                          }}
                        >
                          <span className="do-mono">{t.primitive}</span>
                          <strong>{t.name}</strong>
                          <span>{t.summary}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {step === 'spec' && draft ? (
            <div className="do-widget-spec">
              <article className="do-card do-card-highlight">
                <header className="do-card-head">
                  <div>
                    <h3>{draft.name}</h3>
                    <p className="do-brief">{draft.brief}</p>
                  </div>
                  <span className={`do-status do-status-${draft.status}`}>
                    {draft.status === 'needs_you'
                      ? 'Needs you'
                      : draft.status === 'working'
                        ? 'Working'
                        : 'Done'}
                    <span className="do-lane">
                      {draft.primitive}
                      {draft.lane ? ` · ${draft.lane}` : ''}
                    </span>
                  </span>
                </header>
                <dl className="do-spec" aria-label="Agent permissions">
                  <div>
                    <dt>Watches</dt>
                    <dd>{draft.watches.join(' · ')}</dd>
                  </div>
                  <div>
                    <dt>When</dt>
                    <dd>{draft.looks_for.join(' · ')}</dd>
                  </div>
                  <div>
                    <dt>Does</dt>
                    <dd>{draft.can_do_without_asking.join(' · ') || '—'}</dd>
                  </div>
                  <div>
                    <dt>Asks first</dt>
                    <dd>{draft.must_ask_before.join(' · ') || '—'}</dd>
                  </div>
                </dl>
                {draft.lastNote ? <p className="do-note">{draft.lastNote}</p> : null}
                {draft.evidence ? (
                  <div className="do-evidence">
                    <div className="do-evidence-head">
                      <p className="do-mono">DO Evidence</p>
                    </div>
                    <p className="do-evidence-summary">{draft.evidence.summary}</p>
                    <p className="do-evidence-why">{draft.evidence.why}</p>
                  </div>
                ) : null}
              </article>

              <div className="do-widget-actions">
                <button
                  type="button"
                  className="do-cta do-cta-secondary"
                  disabled={busy}
                  onClick={() => setStep('browse')}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="do-cta do-cta-secondary"
                  disabled={busy}
                  onClick={() => setStep('connector')}
                >
                  Connector (optional)
                </button>
                {draft.status === 'needs_you' && draft.pendingApprovals.length === 0 ? (
                  <button
                    type="button"
                    className="do-cta"
                    disabled={busy}
                    onClick={() => void activate()}
                  >
                    <span className="do-star" aria-hidden>
                      ✦
                    </span>
                    Activate
                  </button>
                ) : (
                  <button type="button" className="do-cta" disabled={busy} onClick={close}>
                    Done
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {step === 'connector' ? (
            <div className="do-widget-connector">
              <p className="do-label">Optional connector</p>
              <p className="do-board-lede">
                Stubs only. Default is hook later — nothing is wired live.
              </p>
              <div className="do-connector-grid">
                {connectors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`do-connector${connector === c.id ? ' is-active' : ''}`}
                    onClick={() => setConnector(c.id)}
                  >
                    <strong>{c.name}</strong>
                    <span>{c.honesty}</span>
                  </button>
                ))}
              </div>
              <div className="do-widget-actions">
                <button
                  type="button"
                  className="do-cta do-cta-secondary"
                  onClick={() => setStep('spec')}
                >
                  Back to card
                </button>
                <button
                  type="button"
                  className="do-cta"
                  disabled={busy || !draft}
                  onClick={() => {
                    setStep('spec');
                    void activate();
                  }}
                >
                  <span className="do-star" aria-hidden>
                    ✦
                  </span>
                  Activate
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
