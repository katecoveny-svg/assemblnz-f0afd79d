'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The homepage phone, in two honest modes.
 *
 * DEMO   — the simulated customer wait that the panel exists to show, now played
 *          out over time instead of sitting still. Labelled as simulated.
 * GUIDE  — a real agent on /api/home/agent, answering about assembl. Labelled as
 *          AI, because the house rule is that we never hide that drafting is
 *          agent-assisted.
 *
 * The two are kept visibly separate. Mixing a simulated customer application
 * with a live guide in one thread would leave a visitor unsure which parts were
 * real, which is the opposite of what this panel is arguing for.
 */

type Msg = { role: 'user' | 'assistant'; content: string };

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

const SUGGESTIONS = [
  'What is assembl?',
  'What will it not do?',
  'How would we start?',
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

export function HomeGuidePhone() {
  const [mode, setMode] = useState<'demo' | 'guide'>('demo');
  const reduced = usePrefersReducedMotion();

  // ── demo mode ──────────────────────────────────────────────────────────────
  const [shown, setShown] = useState(0);
  const [demoTyping, setDemoTyping] = useState(false);

  useEffect(() => {
    if (mode !== 'demo') return;
    // Reduced motion gets the finished conversation, not a performance of it.
    if (reduced) {
      setShown(DEMO_SCRIPT.length);
      setDemoTyping(false);
      return;
    }
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

  // ── guide mode ─────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: 'Ask me what assembl is, what it does, or what it will not do.' },
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
          body: JSON.stringify({ message: clean, sessionId: sessionRef.current, history }),
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
    [busy, messages],
  );

  const visible = reduced ? DEMO_SCRIPT.length : shown;
  const demoDone = visible >= DEMO_SCRIPT.length;

  return (
    <div className="aj-phone hg-phone">
      <i aria-hidden="true" />

      <div className="hg-modes" role="tablist" aria-label="Phone mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'demo'}
          className={mode === 'demo' ? 'is-on' : undefined}
          onClick={() => setMode('demo')}
        >
          simulated wait
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'guide'}
          className={mode === 'guide' ? 'is-on' : undefined}
          onClick={() => setMode('guide')}
        >
          ask assembl
        </button>
      </div>

      <small className="hg-status">
        {mode === 'demo' ? (
          <>
            <b className="hg-dot" aria-hidden="true" /> SIMULATED EXAMPLE / APPLICATION REVIEW
          </>
        ) : (
          <>
            <b className="hg-dot hg-dot-live" aria-hidden="true" /> LIVE AI GUIDE / ANSWERS ABOUT ASSEMBL
          </>
        )}
      </small>

      <div className="hg-stream" ref={streamRef} aria-live="polite">
        {mode === 'demo'
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

        {(mode === 'demo' ? demoTyping : busy) && (
          <p className="hg-msg hg-assistant hg-typing" aria-label="Preparing a reply">
            <span />
            <span />
            <span />
          </p>
        )}

        {mode === 'guide' && error && <p className="hg-msg hg-error">{error}</p>}
      </div>

      {mode === 'demo' ? (
        <div className="hg-foot">
          {demoDone ? (
            <>
              <button type="button" className="hg-chip" onClick={replayDemo}>
                Replay
              </button>
              <button type="button" className="hg-chip hg-chip-go" onClick={() => setMode('guide')}>
                Ask the real one <i aria-hidden="true">↗</i>
              </button>
            </>
          ) : (
            <span className="hg-hint">A real wait, made useful.</span>
          )}
        </div>
      ) : (
        <>
          {messages.length <= 1 && !busy && (
            <div className="hg-foot hg-suggest">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="hg-chip" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
          <form
            className="aj-phone-input hg-input"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <label className="sr-only" htmlFor="hg-ask">
              Ask about assembl
            </label>
            <input
              id="hg-ask"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask about assembl…"
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
    </div>
  );
}
