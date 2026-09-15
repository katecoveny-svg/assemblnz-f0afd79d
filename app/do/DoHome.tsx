'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import type { AgentPrimitive, AgentSpec, DemoTemplate, PageContext, TemplateLane } from '@/apps/do/shared/types';
import { DoClearDemo } from './DoClearDemo';
import { DoDistributionPlates } from './DoDistributionPlates';
import { DoFloatingWidget } from './DoFloatingWidget';
import { DoWhatsAppSim } from './DoWhatsAppSim';
import { readHomeBrief } from '@/apps/do/shared/home-handoff';

type Groups = Record<'needs_you' | 'working' | 'done', AgentSpec[]>;

type TemplateGroup = {
  lane: TemplateLane;
  label: string;
  templates: DemoTemplate[];
};

const EMPTY: Groups = { needs_you: [], working: [], done: [] };

const BOARD_META: Record<
  keyof Groups,
  { title: string; lede: string; depth: 'near' | 'mid' | 'far' }
> = {
  needs_you: {
    title: 'Needs you',
    lede: 'Approvals waiting on a human yes.',
    depth: 'near',
  },
  working: {
    title: 'Working',
    lede: 'Watching or preparing within policy.',
    depth: 'mid',
  },
  done: {
    title: 'Done',
    lede: 'Evidence receipts — what was seen, and why.',
    depth: 'far',
  },
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

const PRIMITIVE_GLYPH: Record<AgentPrimitive, string> = {
  watch: '◎',
  find: '⌕',
  extract: '▤',
  prepare: '✦',
  compare: '⇄',
};

export function DoHome() {
  const [groups, setGroups] = useState<Groups>(EMPTY);
  const [templateGroups, setTemplateGroups] = useState<TemplateGroup[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<AgentSpec | null>(null);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [mitreTemplateId, setMitreTemplateId] = useState<string | null>(null);
  const [mitrePage, setMitrePage] = useState<PageContext | null>(null);
  const [widgetKey, setWidgetKey] = useState(0);
  const [runtimeLabel, setRuntimeLabel] = useState('Assembl runtime · DEMO');
  const [pinned, setPinned] = useState<string[]>([]);
  const [homeBrief, setHomeBrief] = useState<string | null>(null);

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
      .then((data: { groups: TemplateGroup[] }) => {
        setTemplateGroups(data.groups || []);
      });
    void fetch('/api/do/runtime')
      .then((r) => r.json())
      .then((data: { runtime?: { label?: string } }) => {
        if (data.runtime?.label) setRuntimeLabel(data.runtime.label);
      });
  }, [refresh]);

  // Same-tab homepage draft: the URL carries an opaque ID, never the brief.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('from') !== 'home') return;
    let brief: string | null = null;
    try {
      brief = readHomeBrief(window.sessionStorage, params.get('handoff') || '');
    } catch {
      // Browser storage may be disabled. Keep the demonstration usable.
    }
    if (!brief) {
      setError('This homepage draft has expired or is unavailable in this tab. Give DO a new brief to continue.');
      return;
    }
    setHomeBrief(brief);
    setWidgetOpen(true);
  }, []);

  async function compileFromTemplate(t: DemoTemplate) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/do/agents/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: t.brief,
          templateId: t.id,
          page:
            typeof window !== 'undefined'
              ? { url: window.location.href, title: document.title }
              : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'compile failed');
      setDraft(data.spec as AgentSpec);
      if (data.runtime?.label) setRuntimeLabel(data.runtime.label);
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

  async function remove(id: string) {
    setBusy(true);
    try {
      await fetch(`/api/do/agents/${id}`, { method: 'DELETE' });
      if (draft?.id === id) setDraft(null);
      await refresh();
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
      if (data.spec) setDraft(data.spec as AgentSpec);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'whatsapp sim failed');
    } finally {
      setBusy(false);
    }
  }

  async function openClearAgent() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/do/agents/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: 'keep my writing clear on this site — flag AI-slop and basic grammar',
          templateId: 'clear-writing-watch',
          page:
            typeof window !== 'undefined'
              ? { url: window.location.href, title: document.title }
              : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'compile failed');
      setDraft(data.spec as AgentSpec);
      if (data.runtime?.label) setRuntimeLabel(data.runtime.label);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'compile failed');
    } finally {
      setBusy(false);
    }
  }

  function togglePin(id: string) {
    setPinned((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const flatTemplates = templateGroups.flatMap((g) =>
    g.templates.map((t) => ({ ...t, laneLabel: g.label })),
  );
  const featured = [
    ...flatTemplates.filter((t) => pinned.includes(t.id)),
    ...flatTemplates.filter((t) => !pinned.includes(t.id)),
  ].slice(0, 10);

  return (
    <div className="do-root">
      <div className="do-stage-glow" aria-hidden />
      <div className="do-shell">
        <div className="do-topbar" aria-label="Status">
          <span className="do-pill do-pill-preview">PREVIEW</span>
          <span className="do-pill do-pill-runtime">
            <span className="do-pill-dot" />
            {runtimeLabel}
          </span>
          <span className="do-pill do-pill-lock" title="Product locks">
            not chat · not Grammarly · not Instinct
          </span>
        </div>

        <section className="do-stage" aria-label="DO widget stage">
          <div className="do-stage-brand">
            <p className="do-kicker">assembl · portable agents</p>
            <h1 className="do-wordmark">DO</h1>
            <p className="do-tagline">See something → ✦ make agent</p>
            <p className="do-verb-row" aria-label="Agent object verbs">
              <span>place</span>
              <span>template</span>
              <span>delete</span>
            </p>
          </div>

          <button
            type="button"
            className="do-orb"
            disabled={busy}
            onClick={openWidget}
            aria-label="Make agent"
          >
            <span className="do-orb-halo" aria-hidden />
            <span className="do-orb-core" aria-hidden>
              <span className="do-orb-star">✦</span>
            </span>
            <span className="do-orb-label">make agent</span>
          </button>

          <button
            type="button"
            className="do-mitre-card"
            disabled={busy}
            onClick={startMitreDemo}
            aria-label="Mitre 10 SAP pursuit DEMO"
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

          <div className="do-pinboard" aria-label="Templates">
            {featured.map((t, i) => (
              <button
                key={t.id}
                type="button"
                className={`do-pin${pinned.includes(t.id) ? ' is-pinned' : ''}`}
                style={{ '--do-pin-i': String(i % 5) } as CSSProperties}
                disabled={busy}
                onClick={() => void compileFromTemplate(t)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  togglePin(t.id);
                }}
                title={`${t.laneLabel} · right-click to pin`}
              >
                <span className="do-pin-glyph" aria-hidden>
                  {PRIMITIVE_GLYPH[t.primitive]}
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
          <section className="do-draft-strip" aria-label="Draft agent">
            <AgentWallet
              spec={draft}
              busy={busy}
              highlight
              onActivate={() => void activate(draft.id)}
              onDecide={decide}
              onTick={tick}
              onDelete={() => void remove(draft.id)}
            />
          </section>
        ) : null}

        <section className="do-depths" aria-label="Boards">
          <Board
            statusKey="needs_you"
            agents={groups.needs_you}
            busy={busy}
            onActivate={(id) => void activate(id)}
            onDecide={decide}
            onTick={(id, sim) => void tick(id, sim)}
            onDelete={(id) => void remove(id)}
          />
          <Board
            statusKey="working"
            agents={groups.working}
            busy={busy}
            onActivate={(id) => void activate(id)}
            onDecide={decide}
            onTick={(id, sim) => void tick(id, sim)}
            onDelete={(id) => void remove(id)}
          />
          <Board
            statusKey="done"
            agents={groups.done}
            busy={busy}
            onActivate={(id) => void activate(id)}
            onDecide={decide}
            onTick={(id, sim) => void tick(id, sim)}
            onDelete={(id) => void remove(id)}
          />
        </section>

        <DoDistributionPlates
          groups={groups}
          busy={busy}
          onRefresh={() => void refresh()}
          onWhatsAppSim={() => void runWhatsAppSim()}
          onOpenClearAgent={() => void openClearAgent()}
        />

        <section className="do-demos" aria-label="Surface demos">
          <DoClearDemo />
          <aside className="do-how-card" aria-label="How this works">
            <p className="do-mono">How this works</p>
            <ol>
              <li>
                <span aria-hidden>✦</span> Make
              </li>
              <li>
                <span aria-hidden>◎</span> Place
              </li>
              <li>
                <span aria-hidden>▤</span> Evidence
              </li>
            </ol>
            <p className="do-how-note">
              Wallet cards + Needs you — not chat threads. Mitre DEMO is fictional. Nothing sends without your yes.
            </p>
          </aside>
          <DoWhatsAppSim />
        </section>
      </div>

      <DoFloatingWidget
        key={widgetKey}
        forceOpen={widgetOpen}
        launchTemplateId={mitreTemplateId}
        pageOverride={mitrePage}
        initialBrief={homeBrief}
        onActivated={(agent) => {
          setDraft(agent);
          void refresh();
        }}
        onClose={() => {
          setWidgetOpen(false);
          setMitreTemplateId(null);
          setMitrePage(null);
          setHomeBrief(null);
        }}
      />
    </div>
  );
}

function Board({
  statusKey,
  agents,
  busy,
  onActivate,
  onDecide,
  onTick,
  onDelete,
}: {
  statusKey: keyof Groups;
  agents: AgentSpec[];
  busy: boolean;
  onActivate: (id: string) => void;
  onDecide: (agentId: string, approvalId: string, decision: 'approve' | 'reject') => void;
  onTick: (id: string, simulateChange?: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const meta = BOARD_META[statusKey];
  return (
    <div className={`do-depth do-depth-${meta.depth}`}>
      <header className="do-depth-head">
        <h2>{meta.title}</h2>
        <span className="do-count">{agents.length}</span>
      </header>
      <p className="do-depth-lede">{meta.lede}</p>
      {agents.length === 0 ? <p className="do-empty">Nothing placed yet.</p> : null}
      <div className="do-wallet-stack">
        {agents.map((a, i) => (
          <AgentWallet
            key={a.id}
            spec={a}
            busy={busy}
            stackIndex={i}
            onActivate={() => onActivate(a.id)}
            onDecide={onDecide}
            onTick={onTick}
            onDelete={() => onDelete(a.id)}
          />
        ))}
      </div>
    </div>
  );
}

function statusLabel(status: AgentSpec['status']) {
  if (status === 'needs_you') return 'Needs you';
  if (status === 'working') return 'Working';
  return 'Done';
}

function AgentWallet({
  spec,
  onActivate,
  onDecide,
  onTick,
  onDelete,
  busy,
  highlight,
  stackIndex = 0,
}: {
  spec: AgentSpec;
  onActivate?: () => void;
  onDecide?: (agentId: string, approvalId: string, decision: 'approve' | 'reject') => void;
  onTick?: (id: string, simulateChange?: boolean) => void;
  onDelete?: () => void;
  busy?: boolean;
  highlight?: boolean;
  stackIndex?: number;
}) {
  const when = spec.looks_for.join(' · ');
  const does = spec.can_do_without_asking.join(' · ') || '—';
  const asks = spec.must_ask_before.join(' · ') || '—';

  return (
    <article
      className={`do-wallet${highlight ? ' do-wallet-highlight' : ''}`}
      style={{ '--do-stack': String(Math.min(stackIndex, 4)) } as CSSProperties}
    >
      <header className="do-wallet-head">
        <div>
          <p className="do-mono">
            {spec.primitive}
            {spec.lane ? ` · ${spec.lane}` : ''}
          </p>
          <h3>{spec.name}</h3>
          <p className="do-wallet-job">{spec.brief}</p>
        </div>
        <span className={`do-status do-status-${spec.status}`}>{statusLabel(spec.status)}</span>
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
        {spec.connector && spec.connector !== 'hook-later' ? (
          <div>
            <dt>Connector</dt>
            <dd>{spec.connector}</dd>
          </div>
        ) : null}
      </dl>

      {spec.lastNote ? <p className="do-note">{spec.lastNote}</p> : null}

      {spec.evidence ? (
        <div className="do-receipt">
          <div className="do-receipt-head">
            <span className="do-mono">Evidence</span>
            <span className="do-evidence-meta">
              {new Date(spec.evidence.createdAt).toLocaleString('en-NZ', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </span>
          </div>
          <p className="do-receipt-summary">{spec.evidence.summary}</p>
          <p className="do-receipt-why">{spec.evidence.why}</p>
          {spec.evidence.sources?.length ? (
            <ul className="do-receipt-sources">
              {spec.evidence.sources.map((s) => (
                <li key={s.id}>
                  <span className="do-evidence-meta">
                    {s.kind}
                    {s.contentHash ? ` · ${s.contentHash}` : ''}
                  </span>
                  <span>
                    {s.label}
                    {s.excerpt ? ` — ${s.excerpt.slice(0, 100)}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {spec.pendingApprovals.map((p) => (
        <div key={p.id} className="do-approval">
          <p className="do-mono">approval · {p.policyHit}</p>
          <p>{p.reason}</p>
          {onDecide ? (
            <div className="do-approval-actions">
              <button type="button" disabled={busy} onClick={() => onDecide(spec.id, p.id, 'approve')}>
                Approve
              </button>
              <button type="button" disabled={busy} onClick={() => onDecide(spec.id, p.id, 'reject')}>
                Decline
              </button>
            </div>
          ) : null}
        </div>
      ))}

      <div className="do-wallet-actions">
        {spec.primitive === 'watch' && onTick && (spec.status === 'working' || spec.watchSnapshots?.length) ? (
          <>
            <button
              type="button"
              className="do-cta do-cta-ghost do-cta-compact"
              disabled={busy}
              onClick={() => onTick(spec.id, false)}
            >
              Tick
            </button>
            <button
              type="button"
              className="do-cta do-cta-ghost do-cta-compact"
              disabled={busy}
              onClick={() => onTick(spec.id, true)}
            >
              Simulate
            </button>
          </>
        ) : null}
        {onActivate && spec.status === 'needs_you' && spec.pendingApprovals.length === 0 ? (
          <button type="button" className="do-cta do-cta-compact" disabled={busy} onClick={onActivate}>
            <span className="do-star" aria-hidden>
              ✦
            </span>
            Activate
          </button>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            className="do-cta do-cta-ghost do-cta-compact"
            disabled={busy}
            onClick={onDelete}
          >
            Delete
          </button>
        ) : null}
      </div>
    </article>
  );
}
