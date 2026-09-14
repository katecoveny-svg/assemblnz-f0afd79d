'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AgentSpec, DemoTemplate } from '@/apps/do/shared/types';

type Groups = Record<'needs_you' | 'working' | 'done', AgentSpec[]>;

const EMPTY: Groups = { needs_you: [], working: [], done: [] };

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

  return (
    <div className="do-root">
      <header className="do-top">
        <div>
          <p className="do-eyebrow">assembl · DO · PREVIEW</p>
          <h1 className="do-brand">DO</h1>
          <p className="do-tag">See something → ✦ make agent.</p>
        </div>
        <button
          type="button"
          className="do-cta"
          disabled={busy}
          onClick={() => {
            setMakeOpen(true);
            setDraft(null);
          }}
        >
          ✦ make agent
        </button>
      </header>

      <p className="do-honesty">{honesty || 'DEMO · consequential actions always need your yes.'}</p>

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
              placeholder='e.g. tell me if this changes'
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
              ✦ compile
            </button>
          </div>

          {draft ? <AgentCard spec={draft} onActivate={() => void activate(draft.id)} busy={busy} highlight /> : null}
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
      />
      <Board
        title="Working"
        statusKey="working"
        agents={groups.working}
        busy={busy}
        onActivate={(id) => void activate(id)}
        onDecide={decide}
      />
      <Board
        title="Done"
        statusKey="done"
        agents={groups.done}
        busy={busy}
        onActivate={(id) => void activate(id)}
        onDecide={decide}
      />
    </div>
  );
}

function Board({
  title,
  agents,
  busy,
  onActivate,
  onDecide,
}: {
  title: string;
  statusKey: string;
  agents: AgentSpec[];
  busy: boolean;
  onActivate: (id: string) => void;
  onDecide: (agentId: string, approvalId: string, decision: 'approve' | 'reject') => void;
}) {
  return (
    <section className="do-board" aria-label={title}>
      <h2 className="do-section-title">
        {title}
        <span className="do-count">{agents.length}</span>
      </h2>
      {agents.length === 0 ? <p className="do-empty">Nothing here yet.</p> : null}
      <div className="do-cards">
        {agents.map((a) => (
          <AgentCard
            key={a.id}
            spec={a}
            busy={busy}
            onActivate={() => onActivate(a.id)}
            onDecide={onDecide}
          />
        ))}
      </div>
    </section>
  );
}

function AgentCard({
  spec,
  onActivate,
  onDecide,
  busy,
  highlight,
}: {
  spec: AgentSpec;
  onActivate?: () => void;
  onDecide?: (agentId: string, approvalId: string, decision: 'approve' | 'reject') => void;
  busy?: boolean;
  highlight?: boolean;
}) {
  return (
    <article className={`do-card${highlight ? ' do-card-highlight' : ''}`}>
      <header className="do-card-head">
        <h3>{spec.name}</h3>
        <span className="do-mono">{spec.primitive}</span>
      </header>
      <p className="do-brief">{spec.brief}</p>
      <dl className="do-spec">
        <div>
          <dt>Watches</dt>
          <dd>{spec.watches.join(' · ')}</dd>
        </div>
        <div>
          <dt>Looks for</dt>
          <dd>{spec.looks_for.join(' · ')}</dd>
        </div>
        <div>
          <dt>Can do without asking</dt>
          <dd>{spec.can_do_without_asking.join(' · ') || '—'}</dd>
        </div>
        <div>
          <dt>Must ask before</dt>
          <dd>{spec.must_ask_before.join(' · ') || '—'}</dd>
        </div>
        <div>
          <dt>Never</dt>
          <dd>{spec.never.join(' · ')}</dd>
        </div>
      </dl>
      {spec.lastNote ? <p className="do-note">{spec.lastNote}</p> : null}

      {spec.pendingApprovals.map((p) => (
        <div key={p.id} className="do-approval">
          <p>
            <span className="do-mono">approval · {p.policyHit}</span>
            <br />
            {p.reason}
          </p>
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

      {onActivate && spec.status === 'needs_you' && spec.pendingApprovals.length === 0 ? (
        <button type="button" className="do-cta do-cta-secondary" disabled={busy} onClick={onActivate}>
          Activate
        </button>
      ) : null}
    </article>
  );
}
