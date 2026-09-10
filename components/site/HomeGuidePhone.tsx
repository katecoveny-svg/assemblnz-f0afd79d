'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  HOME_AGENTS,
  HOME_AGENTS_FEATURED,
  HOME_AGENT_CATEGORIES,
  homeAgentBySlug,
  type HomeAgent,
} from '@/lib/home/agent-roster';
import { HOME_AGENT_EVENT } from '@/lib/home/agent-handoff';

/**
 * The homepage phone — a live agent you can talk to, and swap.
 *
 * LIVE  — the default, and the thing the panel is actually for. A real model
 *         call to /api/home/agent. The house guide answers about assembl; pick
 *         any of the specialists and that agent answers as itself, grounded in
 *         its own registry record. Labelled as AI, because the house rule is
 *         that we never hide that drafting is agent-assisted.
 * WAIT  — the simulated customer wait, kept as a second tab and labelled as
 *         simulated.
 *
 * The two stay visibly separate. Mixing a simulated application with a live
 * agent in one thread would leave a visitor unsure which parts were real, which
 * is the opposite of what this panel is arguing for.
 */

type Msg = { role: 'user' | 'assistant'; content: string };

/** The house guide, presented in the picker as one option among the agents. */
const GUIDE: HomeAgent = {
  slug: 'assembl',
  name: 'assembl',
  teReo: '',
  description: 'The guide to assembl itself — what it is, what it does, and what it will not do.',
  category: 'start-here',
  categoryLabel: 'Start here',
  icon: 'assembl',
  does: [],
  samples: [],
  grounding: [],
};

/** The demo beat sheet. Timings are gaps before each line lands. */
const DEMO_SCRIPT: ReadonlyArray<{ role: 'user' | 'assistant'; content: string; after: number }> = [
  { role: 'assistant', content: 'Your application is with the team.', after: 400 },
  {
    role: 'assistant',
    content: 'While they review it, I can check what is missing, prepare your questions, or keep you updated.',
    after: 1500,
  },
  { role: 'user', content: 'Check my documents', after: 2200 },
  {
    role: 'assistant',
    content: 'Two things are missing: your last three months of statements, and proof of address.',
    after: 1800,
  },
  {
    role: 'assistant',
    content: 'I have prepared that list for Aroha, your lending specialist. Nothing goes to her until you approve it.',
    after: 2000,
  },
];

const GUIDE_SUGGESTIONS = ['What is assembl?', 'What will it not do?', 'How would we start?'];
/** Honest for any specialist — none of these assume a capability. */
const AGENT_SUGGESTIONS = ['What can you do?', 'Show me an example', 'What won’t you do?'];
/** Flagships with live NZ knowledge cite mode on /api/home/agent. */
const KNOWLEDGE_SUGGESTIONS = [
  'What NZ sources do you use?',
  'Cite one relevant rule',
  'What won’t you do?',
];
const KNOWLEDGE_FEATURED = new Set([
  'arai',
  'kaupapa',
  'pikau',
  'auaha',
  'arataki',
  'prism',
  'gateway',
]);

function subscribeMotionPreference(onChange: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeMotionPreference,
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches, () => false);
}

const openingLine = (agent: HomeAgent) =>
  agent.slug === 'assembl'
    ? 'Ask me what assembl is, what it does, or what it will not do.'
    : `${agent.description} Ask me what I do — or pick another agent above.`;

export function HomeGuidePhone({ presentation = 'compact' }: { presentation?: 'compact' | 'device' }) {
  const device = presentation === 'device';
  const [mode, setMode] = useState<'live' | 'wait'>('live');
  const reduced = usePrefersReducedMotion();

  // ── who is answering ───────────────────────────────────────────────────────
  const [agent, setAgent] = useState<HomeAgent>(GUIDE);
  const [browsing, setBrowsing] = useState(false);
  const [category, setCategory] = useState<string | null>(null);

  const rail = useMemo(() => [GUIDE, ...HOME_AGENTS_FEATURED], []);
  const browseList = useMemo(
    () => (category ? HOME_AGENTS.filter((a) => a.category === category) : HOME_AGENTS),
    [category],
  );

  // ── simulated wait ─────────────────────────────────────────────────────────
  const [shown, setShown] = useState(0);
  const [demoTyping, setDemoTyping] = useState(false);

  useEffect(() => {
    if (mode !== 'wait') return;
    // Reduced motion gets the finished conversation, not a performance of it.
    if (reduced) return;
    if (shown >= DEMO_SCRIPT.length) return;
    const next = DEMO_SCRIPT[shown];
    const isAgent = next.role === 'assistant';
    let reveal: ReturnType<typeof setTimeout>;
    const think = setTimeout(() => {
      if (isAgent) setDemoTyping(true);
      reveal = setTimeout(
        () => {
          setDemoTyping(false);
          setShown((n) => n + 1);
        },
        isAgent ? 700 : 0,
      );
    }, next.after);
    return () => {
      clearTimeout(think);
      clearTimeout(reveal);
    };
  }, [mode, shown, reduced]);

  const replayDemo = () => {
    setShown(0);
    setDemoTyping(false);
  };

  // ── live agent ─────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: openingLine(GUIDE) },
  ]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<string | null>(null);
  const streamRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sessionRef.current) {
      sessionRef.current = `hg-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
    }
  }, []);

  useEffect(() => {
    const el = streamRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy, shown, demoTyping, mode]);

  /** Switching agent starts a fresh thread — one voice per conversation. */
  const pickAgent = useCallback((next: HomeAgent) => {
    setAgent(next);
    setBrowsing(false);
    setMode('live');
    setError(null);
    setDraft('');
    setMessages([{ role: 'assistant', content: openingLine(next) }]);
  }, []);

  // The agent gallery panel hands an agent over by event rather than by threading
  // state through the whole page. Picking one there switches the phone and brings
  // the visitor back to it.
  useEffect(() => {
    const onPick = (event: Event) => {
      const slug = (event as CustomEvent<{ slug?: string }>).detail?.slug;
      const next = slug ? homeAgentBySlug(slug) : undefined;
      if (!next) return;
      pickAgent(next);
      document.getElementById('live-agent')?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    };
    window.addEventListener(HOME_AGENT_EVENT, onPick);
    return () => window.removeEventListener(HOME_AGENT_EVENT, onPick);
  }, [pickAgent]);

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || busy) return;
      setError(null);
      setDraft('');
      const history = messages.filter((m) => m.content).slice(-8);
      setMessages((m) => [...m, { role: 'user', content: clean }]);
      setBusy(true);
      try {
        const res = await fetch('/api/home/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: clean,
            sessionId: sessionRef.current,
            history,
            agent: agent.slug,
          }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.reply) {
          setError(data?.error ?? 'That did not go through. Try again, or email assembl@assembl.co.nz.');
        } else {
          setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
        }
      } catch {
        setError('That did not go through. Try again, or email assembl@assembl.co.nz.');
      } finally {
        setBusy(false);
      }
    },
    [busy, messages, agent.slug],
  );

  const visible = reduced ? DEMO_SCRIPT.length : shown;
  const demoDone = visible >= DEMO_SCRIPT.length;
  const suggestions =
    agent.slug === 'assembl'
      ? GUIDE_SUGGESTIONS
      : KNOWLEDGE_FEATURED.has(agent.slug)
        ? KNOWLEDGE_SUGGESTIONS
        : AGENT_SUGGESTIONS;

  const suggestionButtons = messages.length <= 1 && !busy && (
    <div className="hg-foot hg-suggest">
      {suggestions.map((s) => (
        <button key={s} type="button" className="hg-chip" onClick={() => send(s)}>
          {s}
        </button>
      ))}
    </div>
  );

  const content = (
    <>
      {device && (
        <>
          <div className="hg-hardware" aria-hidden="true">
            <span>9:41</span>
            <i className="hg-island"><i /></i>
            <svg width="62" height="16" viewBox="0 0 62 16" fill="currentColor">
              <rect x="1" y="10" width="3" height="4" rx="1" /><rect x="6" y="7" width="3" height="7" rx="1" /><rect x="11" y="4" width="3" height="10" rx="1" /><rect x="16" y="1" width="3" height="13" rx="1" />
              <path d="M25 6Q31 0 37 6L35 8Q31 4 27 8ZM28 10Q31 7 34 10L31 14Z" />
              <rect x="43" y="3" width="16" height="10" rx="3" fill="none" stroke="currentColor" /><rect x="45" y="5" width="12" height="6" rx="1" /><rect x="60" y="6" width="2" height="4" rx="1" />
            </svg>
          </div>
          <div className="hg-device-agent">
            <div className="hg-agent-mark" aria-hidden="true">a<span>·</span></div>
            <div><strong>{mode === 'live' ? agent.name : 'assembl'}</strong><span>{mode === 'live' ? agent.categoryLabel : 'simulated wait'}</span></div>
            {mode === 'live' && <button type="button" aria-label="Choose an agent" aria-expanded={browsing} onClick={() => setBrowsing((b) => !b)}>⌄</button>}
          </div>
        </>
      )}

      <div className="hg-modes" role="tablist" aria-label="Phone mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'live'}
          className={mode === 'live' ? 'is-on' : undefined}
          onClick={() => setMode('live')}
        >
          live agent
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'wait'}
          className={mode === 'wait' ? 'is-on' : undefined}
          onClick={() => setMode('wait')}
        >
          simulated wait
        </button>
      </div>

      {mode === 'live' && (
        <div className="hg-pick">
          <div className="hg-rail" role="tablist" aria-label="Choose an agent">
            {rail.map((a) => (
              <button
                key={a.slug}
                type="button"
                role="tab"
                aria-selected={agent.slug === a.slug}
                className={agent.slug === a.slug ? 'is-on' : undefined}
                onClick={() => pickAgent(a)}
              >
                {a.name}
              </button>
            ))}
            <button
              type="button"
              className={browsing ? 'hg-more is-on' : 'hg-more'}
              aria-expanded={browsing}
              onClick={() => setBrowsing((b) => !b)}
            >
              all {HOME_AGENTS.length} <i aria-hidden="true">{browsing ? '↑' : '↓'}</i>
            </button>
          </div>

          {browsing && (
            <div className="hg-browse">
              <div className="hg-cats">
                <button
                  type="button"
                  className={category === null ? 'is-on' : undefined}
                  onClick={() => setCategory(null)}
                >
                  everything
                </button>
                {HOME_AGENT_CATEGORIES.map((c) => (
                  <button
                    key={c.category}
                    type="button"
                    className={category === c.category ? 'is-on' : undefined}
                    onClick={() => setCategory(c.category)}
                  >
                    {c.label} <b>{c.count}</b>
                  </button>
                ))}
              </div>
              <ul className="hg-list">
                {browseList.map((a) => (
                  <li key={a.slug}>
                    <button type="button" onClick={() => pickAgent(a)}>
                      <strong>
                        {a.name}
                        {a.teReo ? <em>{a.teReo}</em> : null}
                      </strong>
                      <span>{a.description}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <small className="hg-status">
        {mode === 'wait' ? (
          <>
            <b className="hg-dot" aria-hidden="true" /> SIMULATED EXAMPLE / APPLICATION REVIEW
          </>
        ) : (
          <>
            <b className="hg-dot hg-dot-live" aria-hidden="true" /> LIVE AI ·{' '}
            {agent.slug === 'assembl'
              ? 'ANSWERS ABOUT ASSEMBL'
              : KNOWLEDGE_FEATURED.has(agent.slug)
                ? `${agent.name.toUpperCase()} · NZ CITE MODE`
                : agent.name.toUpperCase()}
          </>
        )}
      </small>

      <div className="hg-stream" ref={streamRef} role="log" aria-label={mode === 'live' ? `${agent.name} conversation` : 'Simulated conversation'} aria-live="polite" aria-relevant="additions text">
        {mode === 'wait'
          ? DEMO_SCRIPT.slice(0, visible).map((m, i) => (
              <p key={i} className={`hg-msg hg-${m.role}`}>
                {m.content}
              </p>
            ))
          : messages.map((m, i) => (
              <p key={i} className={`hg-msg hg-${m.role}`}>
                {m.content}
              </p>
            ))}

        {(mode === 'wait' ? !reduced && demoTyping : busy) && (
          <p className="hg-msg hg-assistant hg-typing" aria-label="Preparing a reply">
            <span />
            <span />
            <span />
          </p>
        )}

        {mode === 'live' && error && <p className="hg-msg hg-error">{error}</p>}
        {device && mode === 'live' && suggestionButtons}
      </div>

      {mode === 'wait' ? (
        <div className="hg-foot">
          {demoDone ? (
            <>
              <button type="button" className="hg-chip" onClick={replayDemo}>
                Replay
              </button>
              <button type="button" className="hg-chip hg-chip-go" onClick={() => setMode('live')}>
                Talk to a real one <i aria-hidden="true">↗</i>
              </button>
            </>
          ) : (
            <span className="hg-hint">A real wait, made useful.</span>
          )}
        </div>
      ) : (
        <>
          {!device && suggestionButtons}
          <form
            className="aj-phone-input hg-input"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <label className="sr-only" htmlFor="hg-ask">
              Ask {agent.name}
            </label>
            <input
              id="hg-ask"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={agent.slug === 'assembl' ? 'Ask about assembl…' : `Ask ${agent.name}…`}
              maxLength={1000}
              autoComplete="off"
              disabled={busy}
            />
            <button type="submit" disabled={busy || !draft.trim()} aria-label="Send">
              <b aria-hidden="true">↑</b>
            </button>
          </form>
        </>
      )}
    </>
  );

  return (
    <div className={`aj-phone hg-phone${device ? ' hg-phone-device' : ''}`}>
      {device ? <div className="hg-device-screen">{content}<div className="hg-home-indicator" aria-hidden="true" /></div> : <><i aria-hidden="true" />{content}</>}
    </div>
  );
}
