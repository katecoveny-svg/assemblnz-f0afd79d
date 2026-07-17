'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';

/**
 * FamilyMoanaChat — the family's live mariner.
 *
 * Streams from /api/agents/tide-weather/chat. `tide-weather` is the real
 * marketplace slug for the mariner: the chat route wires the maritime
 * knowledge block + marineWeather tool to it (there is no `moana` slug in the
 * registry — "Moana" is the household-facing persona name). It drafts and
 * suggests — tides, weather windows, safety checklists, knots — you skipper.
 * Nothing gets booked, sent or actioned. Calm deep-sea blue + gold glass to sit
 * inside Family OS's champagne canon.
 */

const MARINER_AGENT = 'tide-weather';
const GOLD = '#b8964f';
const BLUE = '#2E5A6B';
const SEA = '#6E93A6';
const SAGE = '#7A8B6F';
const INK = '#313c42';

const GREETING =
  "Kia ora — I'm Moana, your mariner. Ask me about the tides at Islington Bay off Rangitoto, a weather window for the weekend, a pre-launch safety checklist, or knots for the kids. I draft and suggest — you skipper. Nothing gets booked or sent without you.";

const OPENERS = [
  'Tides & weather window this weekend?',
  'Pre-launch safety checklist',
  'Teach the kids a bowline',
  'Best Hauraki Gulf spot for a day out?',
];

function messageText(m: UIMessage): string {
  return m.parts.filter((p): p is { type: 'text'; text: string } => p.type === 'text').map((p) => p.text).join('');
}

export function FamilyMoanaChat() {
  const transport = useMemo(() => new DefaultChatTransport({ api: `/api/agents/${MARINER_AGENT}/chat` }), []);
  const { messages, sendMessage, status } = useChat({ transport });
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const busy = status === 'submitted' || status === 'streaming';

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages]);

  const send = (t: string) => {
    const text = t.trim();
    if (!text || busy) return;
    setInput('');
    void sendMessage({ text });
  };

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl"
      style={{
        border: `1px solid ${GOLD}55`,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(251,252,251,0.7))',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 16px 44px rgba(46,90,107,0.12), inset 0 1px 0 rgba(255,255,255,0.8)',
        minHeight: 440,
      }}
    >
      <div className="flex items-center gap-3 border-b border-black/5 px-4 py-3">
        <span style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${BLUE}, ${SEA})`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }} aria-hidden>≈</span>
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: INK }}>Moana · your mariner</p>
          <p className="text-[11px]" style={{ color: '#68766f' }}>tides · weather · safety · draft-only</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium" style={{ background: `${BLUE}18`, color: INK }}>
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: busy ? BLUE : SAGE }} />
          {busy ? 'thinking' : 'online'}
        </span>
      </div>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-4" style={{ maxHeight: 440 }}>
        {messages.length === 0 ? (
          <div className="text-[12.5px] leading-relaxed" style={{ color: '#68766f' }}>{GREETING}</div>
        ) : (
          messages.map((m) => {
            const mine = m.role === 'user';
            return (
              <div key={m.id} className={`max-w-[92%] whitespace-pre-wrap rounded-xl px-3 py-2 text-[12.5px] leading-relaxed ${mine ? 'self-end' : 'self-start'}`}
                style={mine ? { background: INK, color: '#fff' } : { background: 'rgba(255,255,255,0.85)', color: INK, border: '1px solid rgba(0,0,0,0.05)' }}>
                {messageText(m) || (busy ? '…' : '')}
              </div>
            );
          })
        )}
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2">
          {OPENERS.map((q) => (
            <button key={q} type="button" onClick={() => send(q)} className="rounded-full px-3 py-1.5 text-left text-[11.5px] transition"
              style={{ background: 'rgba(255,255,255,0.7)', border: `1px solid ${BLUE}44`, color: INK }}>
              {q}
            </button>
          ))}
        </div>
      ) : null}

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 border-t border-black/5 px-3 py-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about tides, a weather window, a safety check…"
          className="flex-1 rounded-xl px-3 py-2 text-[13px] outline-none"
          style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.08)', color: INK }} />
        <button type="submit" disabled={busy || !input.trim()} className="rounded-xl px-4 py-2 text-[13px] font-medium transition disabled:opacity-40"
          style={{ background: `linear-gradient(180deg, #3a6d80, ${BLUE})`, color: '#fff', boxShadow: `0 4px 14px ${BLUE}55, inset 0 1px 0 rgba(255,255,255,0.35)` }}>
          Ask
        </button>
      </form>
    </div>
  );
}
