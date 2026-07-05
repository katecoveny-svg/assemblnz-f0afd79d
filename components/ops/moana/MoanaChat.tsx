'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';

/**
 * MoanaChat — the Moana pilot's LIVE streaming chat, wired to the REAL agent
 * runtime (self-contained; does NOT reuse TOA's LiveArcChat).
 *
 * Streams from /api/agents/<agentSlug>/chat, unmetered inside the gated demo.
 * Defaults to `tide-weather` (marine forecast + tides brain); pass
 * agentSlug="catch-log" on the Catch log section to talk to the logbook agent.
 *
 * Every reply is a real, sourced draft with the agent's own trust footer —
 * nothing sends, nothing books. Glass-and-champagne: translucent surface,
 * backdrop-blur, safety-orange used ONLY for the live status dot. Respects
 * prefers-reduced-motion (the auto-scroll degrades to instant).
 */

type MoanaChatProps = {
  /** Which live agent to stream from. */
  agentSlug?: string;
  /** Compact mode for the right rail / secondary placements. */
  compact?: boolean;
  /** Header title shown beside the mark. */
  title?: string;
  /** Suggested opener chips. */
  openers?: string[];
  /** Empty-state greeting line. */
  greeting?: string;
  /** Input placeholder. */
  placeholder?: string;
};

const DEFAULT_OPENERS = [
  'How do I read a MetService marine forecast — what do the wind and swell numbers mean?',
  'What should I check before crossing a bar?',
  'Explain spring vs neap tides and why they matter for launching',
  'What are the two forms of comms I should carry, and why VHF Ch 16?',
];

function messageText(m: UIMessage): string {
  return m.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

/** Small inline swell mark — three stacked wave lines, teal → steel. */
function SwellMark({ size = 32 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-lg"
      style={{ width: size, height: size, background: '#0a2a43' }}
      aria-hidden
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 40 40" fill="none">
        <path d="M4 24c4 0 4-4 8-4s4 4 8 4 4-4 8-4 4 4 8 4" stroke="#1E7A8C" strokeWidth="2.5" />
        <path d="M4 31c4 0 4-4 8-4s4 4 8 4 4-4 8-4 4 4 8 4" stroke="#6E93A6" strokeWidth="2.5" />
      </svg>
    </span>
  );
}

export function MoanaChat({
  agentSlug = 'tide-weather',
  compact = false,
  title = 'Tide & Weather',
  openers = DEFAULT_OPENERS,
  greeting = 'Kia ora. I read the marine forecast and the tides and answer with my sources. I never fabricate live conditions — for anything happening right now I point you at the official source. I draft rather than decide, and nothing sends without you.',
  placeholder = 'Ask about the forecast, tides, a bar crossing…',
}: MoanaChatProps) {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: `/api/agents/${agentSlug}/chat` }),
    [agentSlug],
  );
  const { messages, sendMessage, status } = useChat({ transport });
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const busy = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: reduce ? 'auto' : 'smooth',
    });
  }, [messages]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    setInput('');
    void sendMessage({ text: t });
  };

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border border-[#bfa37a]/55"
      style={{
        // Glass: translucent surface over the brand paper, soft inner light.
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,255,255,0.42))',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '0 18px 48px rgba(10,42,67,0.14), inset 0 1px 0 rgba(255,255,255,0.6)',
        minHeight: compact ? undefined : 460,
      }}
    >
      <div className="flex items-center gap-3 border-b border-black/5 px-4 py-3">
        <SwellMark size={compact ? 28 : 34} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-[color:var(--brand-ink)]">{title}</p>
          <p className="text-[11px] text-[color:var(--brand-muted)]">
            live · draft-only · cites its sources
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium"
          style={{ background: 'rgba(30,122,140,0.12)', color: 'var(--brand-ink)' }}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            // Safety-orange live dot — the single accent (per brand rule).
            style={{ background: busy ? '#e1622f' : '#1e7a8c' }}
          />
          {busy ? 'reading' : 'online'}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-4"
        style={{ maxHeight: compact ? 300 : 460 }}
      >
        {messages.length === 0 ? (
          <div className="text-[12.5px] leading-relaxed text-[color:var(--brand-muted)]">
            {greeting}
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`max-w-[92%] whitespace-pre-wrap rounded-xl px-3 py-2 text-[12.5px] leading-relaxed ${
                  mine ? 'self-end' : 'self-start'
                }`}
                style={
                  mine
                    ? { background: 'var(--brand-ink)', color: 'var(--brand-surface,#fff)' }
                    : {
                        background: 'rgba(255,255,255,0.78)',
                        color: 'var(--brand-ink)',
                        border: '1px solid rgba(0,0,0,0.05)',
                      }
                }
              >
                {messageText(m) || (busy ? '…' : '')}
              </div>
            );
          })
        )}
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2">
          {openers.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="rounded-full px-3 py-1.5 text-left text-[11.5px] transition"
              style={{
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(30,122,140,0.32)',
                color: 'var(--brand-ink)',
                backdropFilter: 'blur(6px)',
              }}
            >
              {q}
            </button>
          ))}
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-black/5 px-3 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-xl px-3 py-2 text-[13px] outline-none"
          style={{
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(0,0,0,0.08)',
            color: 'var(--brand-ink)',
          }}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-xl px-4 py-2 text-[13px] font-medium transition disabled:opacity-40"
          style={{
            // Safety-orange is reserved for CTAs — the send button is the
            // primary action, so it wears the accent.
            background: 'linear-gradient(180deg, #e97a49, #e1622f)',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(225,98,47,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}
        >
          Ask
        </button>
      </form>
    </div>
  );
}
