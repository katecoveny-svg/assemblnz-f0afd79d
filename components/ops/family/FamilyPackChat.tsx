'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';

/**
 * FamilyPackChat — the whānau's dog-training second opinion.
 *
 * Streams from /api/agents/pack/chat. `pack` is the real Kaitiaki-bundle slug:
 * a generic, honest, cited NZ dog-training agent that blends the world's most-
 * trusted trainers (Vette, Atherton, Millan, Yin, McDevitt, Stewart) and, where
 * they disagree, shows both sides. It gives guidance and week-by-week plans —
 * it never books a vet, orders gear or messages a trainer, and it refers out to
 * a certified behaviourist the moment biting or aggression is in play.
 *
 * Franklin (the whānau dachshund) context lives HERE, in the greeting + openers,
 * not in the shared system prompt — so the public Kaitiaki surface stays generic
 * and the family surface knows the dog. Champagne canon: warm gold glass + a
 * hand-drawn line-art dog to match Family OS's illustrated direction (B).
 */

const PACK_AGENT = 'pack';
const GOLD = '#BFA37A';
const CORAL = '#E08A6B';
const SAGE = '#7A8B6F';
const INK = '#2A2620';

const GREETING =
  "Kia ora — I'm PACK, your dog-training second opinion. Tell me what's tricky with Franklin (or any dog) — jumping on visitors, reacting to bikes on walks, pulling on the lead, recall. I'll build a plan from the trainers who actually know this, cite who said what, and show you both sides where they disagree. Guidance only: anything with biting or aggression, I'll point you to a certified behaviourist.";

const OPENERS = [
  'Franklin jumps on visitors — build a 4-week plan',
  'Franklin reacts to bikes on walks — what do the experts say?',
  'Introducing Franklin to a new dog / cat',
  'Cesar Millan vs Will Atherton on reactivity?',
];

/** Line-art dachshund — a nod to Franklin, in the illustrated (direction B) style. */
function LineDog({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 40" fill="none" aria-hidden
      style={{ display: 'block' }}>
      <g stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* long dachshund body + legs */}
        <path d="M11 22 C11 18 15 17 19 17 L33 17 C37 17 40 18 40 21" />
        <path d="M11 22 L11 30 M18 22 L18 30 M32 22 L32 30 M39 22 L39 30" />
        {/* head + long ear + snout */}
        <path d="M40 21 C43 20 45 22 45 25 L41 26" />
        <path d="M40 21 C40 25 39 28 37 28" />
        {/* tail up */}
        <path d="M11 22 C8 21 7 18 8 15" />
      </g>
      <circle cx="43.5" cy="23" r="1" fill="#fff" />
    </svg>
  );
}

function messageText(m: UIMessage): string {
  return m.parts.filter((p): p is { type: 'text'; text: string } => p.type === 'text').map((p) => p.text).join('');
}

export function FamilyPackChat() {
  const transport = useMemo(() => new DefaultChatTransport({ api: `/api/agents/${PACK_AGENT}/chat` }), []);
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
        background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,253,249,0.7))',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 16px 44px rgba(191,163,122,0.14), inset 0 1px 0 rgba(255,255,255,0.8)',
        minHeight: 440,
      }}
    >
      <div className="flex items-center gap-3 border-b border-black/5 px-4 py-3">
        <span style={{ width: 38, height: 38, borderRadius: 11, background: `linear-gradient(135deg, ${GOLD}, ${CORAL})`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <LineDog size={26} />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: INK }}>PACK · dog training</p>
          <p className="text-[11px]" style={{ color: '#8a8272' }}>reactivity · jumping · cited · draft-only</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium" style={{ background: `${GOLD}22`, color: INK }}>
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: busy ? CORAL : SAGE }} />
          {busy ? 'thinking' : 'online'}
        </span>
      </div>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-4" style={{ maxHeight: 440 }}>
        {messages.length === 0 ? (
          <div className="text-[12.5px] leading-relaxed" style={{ color: '#8a8272' }}>{GREETING}</div>
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
              style={{ background: 'rgba(255,255,255,0.7)', border: `1px solid ${GOLD}55`, color: INK }}>
              {q}
            </button>
          ))}
        </div>
      ) : null}

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 border-t border-black/5 px-3 py-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about jumping, reactivity, recall, a training plan…"
          className="flex-1 rounded-xl px-3 py-2 text-[13px] outline-none"
          style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.08)', color: INK }} />
        <button type="submit" disabled={busy || !input.trim()} className="rounded-xl px-4 py-2 text-[13px] font-medium transition disabled:opacity-40"
          style={{ background: `linear-gradient(180deg, #c9a878, ${GOLD})`, color: '#fff', boxShadow: `0 4px 14px ${GOLD}66, inset 0 1px 0 rgba(255,255,255,0.35)` }}>
          Ask
        </button>
      </form>
    </div>
  );
}
