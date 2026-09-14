'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AgentSpec, DemoTemplate, PageContext, TemplateLane } from '@/apps/do/shared/types';
import { DoFloatingWidget } from './DoFloatingWidget';
import { DoDistributionPlates } from './DoDistributionPlates';

type Groups = Record<'needs_you' | 'working' | 'done', AgentSpec[]>;

type TemplateGroup = {
  lane: TemplateLane;
  label: string;
  templates: DemoTemplate[];
};

const EMPTY: Groups = { needs_you: [], working: [], done: [] };

const BOARD_LEDE: Record<keyof Groups, string> = {
  needs_you: 'Approvals and change alerts waiting on a human yes.',
  working: 'Agents watching or preparing within policy.',
  done: 'Outcomes with Evidence — what was seen, and why.',
};

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

export function DoHome() {
  const [groups, setGroups] = useState<Groups>(EMPTY);
  const [templateGroups, setTemplateGroups] = useState<TemplateGroup[]>([]);
  const [honesty, setHonesty] = useState('');
  const [brief, setBrief] = useState('');
  const [draft, setDraft] = useState<AgentSpec | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [makeOpen, setMakeOpen] = useState(false);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [mitreTemplateId, setMitreTemplateId] = useState<string | null>(null);
  const [mitrePage, setMitrePage] = useState<PageContext | null>(null);
  const [widgetKey, setWidgetKey] = useState(0);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/do/agents?grouped=1');
    if (!res.ok) return;
    const data = (await res.json()) as { groups: Groups };
    setGroups(data.groups);
  }, []);

  useEffect(() => {
    void refresh();
    void fetch('/api/do/templates')
      .then((r) => r.json())
      .then((data: { groups: TemplateGroup[]; honesty: string }) => {
        setTemplateGroups(data.groups || []);
        setHonesty(data.honesty);
      });
  }, [refresh]);

  async function compile(nextBrief?: string, templateId?: string, page?: PageContext) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/do/agents/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: nextBrief ?? brief,
          templateId,
          page:
            page ??
            (typeof window !== 'undefined'
              ? {
                  url: window.location.href,
                  title: document.title,
                }
              : undefined),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'compile failed');
      setDraft(data.spec as AgentSpec);
      setMakeOpen(true);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'compile failed');
    } finally {
      setBusy(false);
    }
  }

  async function activate(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/do/agents/${id}/activate`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'activate failed');
      setDraft(data.agent as AgentSpec);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'activate failed');
    } finally {
      setBusy(false);
    }
  }

  async function decide(agentId: string, approvalId: string, decision: 'approve' | 'reject') {
    setBusy(true);
    try {
      await fetch(`/api/do/agents/${agentId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId, decision }),
      });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function tick(id: string, simulateChange = false) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/do/agents/${id}/tick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulateChange }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'tick failed');
      setDraft(data.agent as AgentSpec);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'tick failed');
    } finally {
      setBusy(false);
    }
  }

  function openWidget() {
    setMitreTemplateId(null);
    setMitrePage(null);
    setWidgetOpen(true);
    setWidgetKey((k) => k + 1);
    setError(null);
  }

  function startMitreDemo() {
    setMitrePage(MITRE_FIXTURE_PAGE);
    setMitreTemplateId('mitre10-sap-rfp-brief');
    setWidgetOpen(true);
    setWidgetKey((k) => k + 1);
    setError(null);
  }

  async function runWhatsAppSim() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/do/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surface: 'whatsapp', demo: true }),
      });
      const data = await res.json();
      if (!res.ok && !data.spec) throw new Error(data.error || data.honesty || 'whatsapp sim failed');
      if (data.spec) {
        setDraft(data.spec as AgentSpec);
        setMakeOpen(true);
      }
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'whatsapp sim failed');
    } finally {
      setBusy(false);
    }
  }

  function openClearAgent() {
    setBrief('keep my writing clear on this site — flag AI-slop and basic grammar');
    void compile(
      'keep my writing clear on this site — flag AI-slop and basic grammar',
      'clear-writing-watch',
    );
  }

  return (
    <div className="do-root">
      <div className="do-shell">
        <header className="do-hero">
          <div>
            <p className="do-eyebrow">assembl · DO · PREVIEW</p>
            <h1 className="do-brand">DO</h1>
            <p className="do-tag">See something → ✦ make agent.</p>
          </div>
          <div className="do-hero-actions">
            <button type="button" className="do-cta" disabled={busy} onClick={openWidget}>
              <span className="do-star" aria-hidden>
                ✦
              </span>
              make agent
            </button>
            <button
              type="button"
              className="do-cta do-cta-secondary"
              disabled={busy}
              onClick={startMitreDemo}
            >
              Mitre 10 · SAP pursuit DEMO
            </button>
            <p className="do-honesty">
              {honesty || 'DEMO · consequential actions always need your yes.'}
            </p>
          </div>
        </header>

        <section className="do-how" aria-label="How this works">
          <p className="do-how-title">How this works</p>
          <ol>
            <li>
              <span className="do-how-n">01</span>
              <span>Floating ✦ captures context → pick a template or type what to DO</span>
            </li>
            <li>
              <span className="do-how-n">02</span>
              <span>AgentSpec card (watches / when / does / asks first) → Activate</span>
            </li>
            <li>
              <span className="do-how-n">03</span>
              <span>Optional connector stub (hook later by default) · Evidence on outcome</span>
            </li>
          </ol>
          <div className="do-wired" aria-label="What is wired">
            <span className="do-chip do-chip-live">
              <span className="do-chip-dot" /> Floating ✦
            </span>
            <span className="do-chip do-chip-live">
              <span className="do-chip-dot" /> /do home
            </span>
            <span className="do-chip do-chip-live">
              <span className="do-chip-dot" /> Mitre 10 DEMO
            </span>
            <span className="do-chip do-chip-live">
              <span className="do-chip-dot" /> DO Clear
            </span>
            <span className="do-chip do-chip-live">
              <span className="do-chip-dot" /> Share intake
            </span>
            <span className="do-chip do-chip-stub">WhatsApp DEMO</span>
            <span className="do-chip do-chip-stub">Keyboard stub</span>
            <span className="do-chip do-chip-stub">Home widget stub</span>
            <span className="do-chip do-chip-stub">SAP stub</span>
            <span className="do-chip do-chip-stub">Astra stub</span>
          </div>
        </section>

        {error ? <p className="do-error">{error}</p> : null}

        <DoDistributionPlates
          groups={groups}
          busy={busy}
          onRefresh={() => void refresh()}
          onWhatsAppSim={() => void runWhatsAppSim()}
          onOpenClearAgent={openClearAgent}
        />

        {makeOpen ? (
          <section className="do-make" aria-label="Make agent">
            <label className="do-label" htmlFor="do-brief">
              What should this agent do?
            </label>
            <div className="do-make-row">
              <input
                id="do-brief"
                className="do-input"
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="e.g. tell me if this changes"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && brief.trim()) void compile();
                }}
              />
              <button
                type="button"
                className="do-cta do-cta-secondary"
                disabled={busy || !brief.trim()}
                onClick={() => void compile()}
              >
                <span className="do-star" aria-hidden>
                  ✦
                </span>
                compile
              </button>
            </div>

            {draft ? (
              <AgentCard spec={draft} onActivate={() => void activate(draft.id)} busy={busy} highlight />
            ) : null}
          </section>
        ) : null}

        <section className="do-templates" aria-label="Launch templates">
          <h2 className="do-section-title">Launch templates</h2>
          <p className="do-board-lede">
            Pick a job. Surface ≠ agent — the ✦ widget is one place to launch from.
          </p>
          {templateGroups.map((g) => (
            <div key={g.lane} className="do-lane-block">
              <h3 className="do-lane-heading">{g.label}</h3>
              <div className="do-template-grid">
                {g.templates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="do-template"
                    disabled={busy}
                    onClick={() => {
                      setBrief(t.brief);
                      void compile(t.brief, t.id);
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
        </section>

        <Board
          title="Needs you"
          statusKey="needs_you"
          agents={groups.needs_you}
          busy={busy}
          onActivate={(id) => void activate(id)}
          onDecide={decide}
          onTick={(id, sim) => void tick(id, sim)}
        />
        <Board
          title="Working"
          statusKey="working"
          agents={groups.working}
          busy={busy}
          onActivate={(id) => void activate(id)}
          onDecide={decide}
          onTick={(id, sim) => void tick(id, sim)}
        />
        <Board
          title="Done"
          statusKey="done"
          agents={groups.done}
          busy={busy}
          onActivate={(id) => void activate(id)}
          onDecide={decide}
          onTick={(id, sim) => void tick(id, sim)}
        />
      </div>

      <DoFloatingWidget
        key={widgetKey}
        forceOpen={widgetOpen}
        launchTemplateId={mitreTemplateId}
        pageOverride={mitrePage}
        onActivated={(agent) => {
          setDraft(agent);
          void refresh();
        }}
        onClose={() => {
          setWidgetOpen(false);
          setMitreTemplateId(null);
          setMitrePage(null);
        }}
      />
    </div>
  );
}

function Board({
  title,
  statusKey,
  agents,
  busy,
  onActivate,
  onDecide,
  onTick,
}: {
  title: string;
  statusKey: keyof Groups;
  agents: AgentSpec[];
  busy: boolean;
  onActivate: (id: string) => void;
  onDecide: (agentId: string, approvalId: string, decision: 'approve' | 'reject') => void;
  onTick: (id: string, simulateChange?: boolean) => void;
}) {
  return (
    <section className="do-board" aria-label={title}>
      <h2 className="do-section-title">
        {title}
        <span className="do-count">{agents.length}</span>
      </h2>
      <p className="do-board-lede">{BOARD_LEDE[statusKey]}</p>
      {agents.length === 0 ? <p className="do-empty">Nothing here yet.</p> : null}
      <div className="do-cards">
        {agents.map((a) => (
          <AgentCard
            key={a.id}
            spec={a}
            busy={busy}
            onActivate={() => onActivate(a.id)}
            onDecide={onDecide}
            onTick={onTick}
          />
        ))}
      </div>
    </section>
  );
}

function statusLabel(status: AgentSpec['status']) {
  if (status === 'needs_you') return 'Needs you';
  if (status === 'working') return 'Working';
  return 'Done';
}

function AgentCard({
  spec,
  onActivate,
  onDecide,
  onTick,
  busy,
  highlight,
}: {
  spec: AgentSpec;
  onActivate?: () => void;
  onDecide?: (agentId: string, approvalId: string, decision: 'approve' | 'reject') => void;
  onTick?: (id: string, simulateChange?: boolean) => void;
  busy?: boolean;
  highlight?: boolean;
}) {
  const when = spec.looks_for.join(' · ');
  const does = spec.can_do_without_asking.join(' · ') || '—';
  const asks = spec.must_ask_before.join(' · ') || '—';

  return (
    <article className={`do-card${highlight ? ' do-card-highlight' : ''}`}>
      <header className="do-card-head">
        <div>
          <h3>{spec.name}</h3>
          <p className="do-brief">{spec.brief}</p>
        </div>
        <span className={`do-status do-status-${spec.status}`}>
          {statusLabel(spec.status)}
          <span className="do-lane">
            {spec.primitive}
            {spec.lane ? ` · ${spec.lane}` : ''}
          </span>
        </span>
      </header>

      <dl className="do-spec" aria-label="Agent permissions">
        <div>
          <dt>Watches</dt>
          <dd>{spec.watches.join(' · ')}</dd>
        </div>
        <div>
          <dt>When</dt>
          <dd>{when}</dd>
        </div>
        <div>
          <dt>Does</dt>
          <dd>{does}</dd>
        </div>
        <div>
          <dt>Asks first</dt>
          <dd>{asks}</dd>
        </div>
        <div>
          <dt>Never</dt>
          <dd>{spec.never.join(' · ')}</dd>
        </div>
        {spec.connector ? (
          <div>
            <dt>Connector</dt>
            <dd>{spec.connector}</dd>
          </div>
        ) : null}
      </dl>

      {spec.lastNote ? <p className="do-note">{spec.lastNote}</p> : null}

      {spec.evidence ? (
        <div className="do-evidence">
          <div className="do-evidence-head">
            <p className="do-mono">DO Evidence</p>
            <p className="do-evidence-meta">
              {new Date(spec.evidence.createdAt).toLocaleString('en-NZ', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
          <p className="do-evidence-summary">{spec.evidence.summary}</p>
          <p className="do-evidence-why">{spec.evidence.why}</p>
          <ul className="do-evidence-sources">
            {spec.evidence.sources.map((s) => (
              <li key={s.id}>
                <span className="do-evidence-meta">
                  {s.kind}
                  {s.contentHash ? ` · ${s.contentHash}` : ''}
                  {' · '}
                  {new Date(s.capturedAt).toLocaleString('en-NZ', {
                    dateStyle: 'short',
                    timeStyle: 'medium',
                  })}
                </span>
                <span>
                  {s.label}
                  {s.excerpt ? ` — ${s.excerpt.slice(0, 120)}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {spec.pendingApprovals.map((p) => (
        <div key={p.id} className="do-approval">
          <p>
            <span className="do-mono">approval · {p.policyHit}</span>
            <br />
            {p.reason}
          </p>
          {p.chain?.length ? (
            <ol className="do-chain">
              {p.chain.map((step) => (
                <li key={step.stage}>
                  <span className="do-mono">{step.stage}</span> {step.note}
                </li>
              ))}
            </ol>
          ) : null}
          {onDecide ? (
            <div className="do-approval-actions">
              <button type="button" disabled={busy} onClick={() => onDecide(spec.id, p.id, 'approve')}>
                Approve (DEMO)
              </button>
              <button type="button" disabled={busy} onClick={() => onDecide(spec.id, p.id, 'reject')}>
                Decline
              </button>
            </div>
          ) : null}
        </div>
      ))}

      {spec.primitive === 'watch' && onTick && (spec.status === 'working' || spec.watchSnapshots?.length) ? (
        <div className="do-watch-actions">
          <button
            type="button"
            className="do-cta do-cta-secondary"
            disabled={busy}
            onClick={() => onTick(spec.id, false)}
          >
            Tick watch
          </button>
          <button
            type="button"
            className="do-cta do-cta-secondary"
            disabled={busy}
            onClick={() => onTick(spec.id, true)}
          >
            Simulate change
          </button>
        </div>
      ) : null}

      {onActivate && spec.status === 'needs_you' && spec.pendingApprovals.length === 0 ? (
        <button
          type="button"
          className="do-cta do-cta-secondary do-cta-block"
          disabled={busy}
          onClick={onActivate}
          style={{ marginTop: '0.85rem' }}
        >
          Activate
        </button>
      ) : null}
    </article>
  );
}
