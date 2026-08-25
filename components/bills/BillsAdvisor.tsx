'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles, X, Send, Loader2, ShieldCheck } from 'lucide-react';
import { useBillsSession } from './useSession';

type Msg = { role: 'user' | 'assistant'; content: string; sources?: string[] };

const SUGGESTIONS = [
  'Should I switch electricity?',
  'Where am I overpaying?',
  'What can I cancel safely?',
];

const INTRO: Msg = {
  role: 'assistant',
  content:
    'Kia ora — I’m the assembl bills advisor. Ask me about your power, broadband, insurance or subscriptions and I’ll point to the cheaper options in your NZ provider list. I recommend and prepare the switch; you always approve it.',
};

/**
 * ARC-style grounded advisor. Talks to /api/bills/chat, which answers over the
 * NZ Provider DB with the existing Anthropic key. Draft-mode only — it never
 * switches anything; it prepares a recommendation for the household to approve.
 */
export function BillsAdvisor() {
  const sessionId = useBillsSession();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([INTRO]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const next = [...messages, { role: 'user' as const, content: q }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const res = await fetch('/api/bills/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          sessionId,
          history: next.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessages((m) => [...m, { role: 'assistant', content: json.error ?? 'I couldn’t answer just now — please try again.' }]);
      } else {
        setMessages((m) => [...m, { role: 'assistant', content: json.response, sources: json.sources }]);
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Network hiccup — please try again.' }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white transition hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, #240B21, #3A1435)',
          boxShadow: '0 0 20px rgba(47,107,79,0.55), 0 0 44px rgba(47,107,79,0.3)',
          fontFamily: "var(--font-bills-display), system-ui, sans-serif",
        }}
      >
        <Sparkles size={16} className="transition group-hover:rotate-12" /> Ask the advisor
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setOpen(false)} aria-hidden />
          <aside
            className="relative flex h-full w-full max-w-md flex-col shadow-2xl"
            style={{ background: 'var(--b-paper)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--b-line)' }}>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: 'var(--b-brand)' }}>
                  <Sparkles size={16} />
                </span>
                <div>
                  <p className="text-sm font-bold" style={{ fontFamily: "var(--font-bills-display), system-ui, sans-serif", color: 'var(--b-ink)' }}>
                    Bills advisor
                  </p>
                  <p className="text-[12px]" style={{ color: 'var(--b-faint)' }}>
                    Grounded in your NZ provider list · draft-mode
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 transition hover:bg-black/5" aria-label="Close">
                <X size={18} style={{ color: 'var(--b-muted)' }} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                    style={
                      m.role === 'user'
                        ? { background: 'var(--b-brand)', color: '#fff' }
                        : { background: 'var(--b-surface)', border: '1px solid var(--b-line)', color: 'var(--b-ink)' }
                    }
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.sources.map((s) => (
                          <span key={s} className="rounded-md px-1.5 py-0.5 text-[12px] font-medium" style={{ background: 'var(--b-ochre-soft)', color: 'var(--b-gold-deep)' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-3.5 py-2.5" style={{ background: 'var(--b-surface)', border: '1px solid var(--b-line)' }}>
                    <Loader2 size={16} className="animate-spin" style={{ color: 'var(--b-gold)' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 px-5 pb-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full px-3 py-1.5 text-xs font-medium transition hover:opacity-80"
                    style={{ background: 'var(--b-surface)', border: '1px solid var(--b-brand-line)', color: 'var(--b-brand)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t px-4 py-3"
              style={{ borderColor: 'var(--b-line)' }}
            >
              <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: 'var(--b-surface)', border: '1px solid var(--b-line)' }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about a bill…"
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--b-ink)' }}
                />
                <button type="submit" disabled={busy || !input.trim()} className="rounded-lg p-1.5 text-white transition disabled:opacity-40" style={{ background: 'var(--b-brand)' }} aria-label="Send">
                  <Send size={15} />
                </button>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--b-faint)' }}>
                <ShieldCheck size={12} /> Advice only. assembl bills never switches or cancels on its own — you approve every action.
              </p>
            </form>
          </aside>
        </div>
      )}
    </>
  );
}
