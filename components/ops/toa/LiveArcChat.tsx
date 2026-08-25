'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { ArcMark } from '@/components/ops/toa/ArcHeroBand';

/**
 * LiveArcChat — ARC, wired to the REAL agent runtime.
 *
 * Replaces the old scripted ArcChatPanel: this streams from the live
 * /api/agents/whakaae/chat endpoint (assembl's consenting + Building Code
 * specialist — the brain behind ARC's PS/CCC/lodgement work), unmetered
 * inside the gated demo. Every reply is a real draft with the agent's own
 * trust footer; nothing sends. Glass-and-champagne per DIRECTION-LOCKED.
 */

// ARC streams from the TOA-tuned endpoint (server-side prompt knows 16A's real
// facts: Remuera, AUP Zone H4, the 380 mm level change, the stormwater line) so
// the 16A chip is a real drafting moment, not generic guidance. Same live model
// ladder as the marketplace agents; draft-only; every reply cites a trust grade.
const ARC_ENDPOINT = '/api/customers/toa-architects/arc/chat';

// The brief's five chips — the 16A memo is the killer moment.
const OPENERS = [
  'draft a consent memo for a rear extension at 16A Hubert Henderson',
  'check this design against Te Aranga principles',
  'summarise Auckland Unitary Plan Zone MHU rules for a 3-storey infill',
  "turn today's site meeting notes into an RFI list",
  'find recently consented terraces in Kingsland',
];

function messageText(m: UIMessage): string {
  return m.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

export function LiveArcChat({ compact = false }: { compact?: boolean }) {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: ARC_ENDPOINT }),
    [],
  );
  const { messages, sendMessage, status } = useChat({ transport });
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const busy = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
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
        boxShadow: '0 18px 48px rgba(26,25,24,0.10), inset 0 1px 0 rgba(255,255,255,0.6)',
        minHeight: compact ? undefined : 460,
      }}
    >
      <div className="flex items-center gap-3 border-b border-black/5 px-4 py-3">
        <ArcMark size={compact ? 28 : 34} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-[color:var(--brand-ink)]">ARC</p>
          <p className="text-[12px] text-[color:var(--brand-muted)]">
            live · draft-only · cites its sources
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium"
          style={{ background: 'rgba(191,163,122,0.14)', color: 'var(--brand-ink)' }}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: busy ? '#bfa37a' : '#5a8a5a' }}
          />
          {busy ? 'thinking' : 'online'}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-4"
        style={{ maxHeight: compact ? 300 : 460 }}
      >
        {messages.length === 0 ? (
          <div className="text-[12.5px] leading-relaxed text-[color:var(--brand-muted)]">
            Nick — ask me about 16A, a consent, the Building Code, PS1&ndash;PS4 or the CCC path.
            I answer with my sources, I draft rather than decide, and every reply ends with a
            trust grade. Nothing sends without you.
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
                    : { background: 'rgba(255,255,255,0.78)', color: 'var(--brand-ink)', border: '1px solid rgba(0,0,0,0.05)' }
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
          {OPENERS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="rounded-full px-3 py-1.5 text-[12px] transition"
              style={{
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(191,163,122,0.4)',
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
          placeholder="Ask ARC about a consent, the Building Code, PS1–PS4…"
          className="flex-1 rounded-xl px-3 py-2 text-[13px] outline-none"
          style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.08)', color: 'var(--brand-ink)' }}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-xl px-4 py-2 text-[13px] font-medium transition disabled:opacity-40"
          style={{
            background: 'linear-gradient(180deg, #c8ab7f, #bfa37a)',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(191,163,122,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}
        >
          Ask
        </button>
      </form>
    </div>
  );
}
