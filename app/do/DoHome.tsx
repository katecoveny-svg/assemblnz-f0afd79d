'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AgentSpec, DemoTemplate } from '@/apps/do/shared/types';

type Groups = Record<'needs_you' | 'working' | 'done', AgentSpec[]>;

const EMPTY: Groups = { needs_you: [], working: [], done: [] };

const BOARD_LEDE: Record<keyof Groups, string> = {
  needs_you: 'Approvals and change alerts waiting on a human yes.',
  working: 'Agents watching or preparing within policy.',
  done: 'Outcomes with Evidence — what was seen, and why.',
};

export function DoHome() {
  const [groups, setGroups] = useState<Groups>(EMPTY);
  const [templates, setTemplates] = useState<DemoTemplate[]>([]);
  const [honesty, setHonesty] = useState('');
  const [brief, setBrief] = useState('');
  const [draft, setDraft] = useState<AgentSpec | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [makeOpen, setMakeOpen] = useState(false);

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
      .then((data: { templates: DemoTemplate[]; honesty: string }) => {
        setTemplates(data.templates);
        setHonesty(data.honesty);
      });
  }, [refresh]);

  async function compile(nextBrief?: string, templateId?: string) {
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
            typeof window !== 'undefined'
              ? {
                  url: window.location.href,
                  title: document.title,
                }
              : undefined,
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
            <button
              type="button"
              className="do-cta"
              disabled={busy}
              onClick={() => {
                setMakeOpen(true);
                setDraft(null);
              }}
            >
              <span className="do-star" aria-hidden>
                ✦
              </span>
              make agent
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
              <span>✦ captures context → AgentSpec</span>
            </li>
            <li>
              <span className="do-how-n">02</span>
              <span>Simple jobs run local Watch; hard jobs route Astra-class (stub)</span>
            </li>
            <li>
              <span className="do-how-n">03</span>
              <span>Consequential actions need your approve — Evidence shows why</span>
            </li>
          </ol>
          <div className="do-wired" aria-label="What is wired">
            <span className="do-chip do-chip-live">
              <span className="do-chip-dot" /> Chrome ✦
            </span>
            <span className="do-chip do-chip-live">
              <span className="do-chip-dot" /> /do home
            </span>
            <span className="do-chip do-chip-live">
              <span className="do-chip-dot" /> Watch + Evidence
            </span>
            <span className="do-chip do-chip-stub">WhatsApp stub</span>
            <span className="do-chip do-chip-stub">SMS stub</span>
            <span className="do-chip do-chip-stub">Messenger stub</span>
            <span className="do-chip do-chip-stub">Astra stub</span>
          </div>
        </section>

        {error ? <p className="do-error">{error}</p> : null}

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

        <section className="do-templates" aria-label="Demo templates">
          <h2 className="do-section-title">Demo templates</h2>
          <div className="do-template-grid">
            {templates.map((t) => (
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
