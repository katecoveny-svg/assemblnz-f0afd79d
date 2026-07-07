'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, PawPrint, Send, BookOpen, Stethoscope, Phone, Globe } from 'lucide-react';

const display = { fontFamily: 'var(--font-alpha-display), system-ui, sans-serif' } as const;

type Source = { name: string; url: string | null; tier: string };
type Vet = { name: string; region: string; service: string | null; phone: string | null; website: string | null; placeholder: boolean };
type Msg = {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  vets?: Vet[];
  referToVet?: boolean;
};

const STARTERS = [
  'Help with leash pulling.',
  "My puppy won't stop biting.",
  'How do I teach recall?',
  'Crate training help.',
];

function useSessionId() {
  const [id, setId] = useState('');
  useEffect(() => {
    let s = localStorage.getItem('alphassembl_session');
    if (!s) {
      s = `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      localStorage.setItem('alphassembl_session', s);
    }
    setId(s);
  }, []);
  return id;
}

export function KaiakoChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const sessionId = useSessionId();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setInput('');
    const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: 'user', content: message }]);
    setBusy(true);
    try {
      const res = await fetch('/api/alphassembl/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId, history }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessages((m) => [...m, { role: 'assistant', content: json.error ?? 'Sorry — I couldn’t answer just now. Please try again.' }]);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            content: json.response ?? '',
            sources: json.sources ?? [],
            vets: json.vets ?? [],
            referToVet: !!json.refer_to_vet,
          },
        ]);
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Network error — please try again.' }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col px-4">
      {/* Header */}
      <header className="flex items-center justify-between py-4">
        <Link href="/alphassembl" className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--a-muted)' }}>
          <ArrowLeft size={16} /> Alphassembl
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg text-white" style={{ background: 'var(--a-navy)' }}>
            <PawPrint size={15} />
          </span>
          <span className="text-sm font-bold" style={{ ...display, color: 'var(--a-navy)' }}>Kaiako</span>
          <span className="text-xs" style={{ color: 'var(--a-muted)' }}>· your Alphassembl trainer</span>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-white" style={{ background: 'var(--a-navy)' }}>
              <PawPrint size={26} />
            </span>
            <h1 className="mt-4 text-xl font-bold" style={{ ...display, color: 'var(--a-navy)' }}>Kia ora — I’m your Alphassembl trainer.</h1>
            <p className="mt-2 max-w-sm text-sm" style={{ color: 'var(--a-muted)' }}>
              Force-free, grounded in NZ advice. Tell me what’s tricky, or start with one of these:
            </p>
            <div className="mt-5 grid w-full max-w-md gap-2 sm:grid-cols-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-xl border px-4 py-3 text-left text-sm font-medium transition hover:shadow-sm"
                  style={{ borderColor: '#e5e7eb', background: 'var(--a-grey)', color: 'var(--a-navy)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div className={m.role === 'user' ? 'max-w-[85%]' : 'w-full max-w-[92%]'}>
              <div
                className="whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={
                  m.role === 'user'
                    ? { background: 'var(--a-navy)', color: '#fff' }
                    : { background: 'var(--a-grey)', color: 'var(--a-ink)', border: '1px solid #eceef1' }
                }
              >
                {m.content}
              </div>

              {/* Refer-to-vet card */}
              {m.referToVet && m.vets && m.vets.length > 0 && (
                <div className="mt-2 rounded-2xl border p-4" style={{ borderColor: '#fecaca', background: '#fef2f2' }}>
                  <div className="flex items-center gap-2">
                    <Stethoscope size={16} style={{ color: '#dc2626' }} />
                    <span className="text-sm font-semibold" style={{ ...display, color: '#b91c1c' }}>Please talk to a professional</span>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {m.vets.map((v, j) => (
                      <li key={j} className="text-sm" style={{ color: 'var(--a-ink)' }}>
                        <div className="font-medium">
                          {v.name}
                          {v.placeholder && <span className="ml-1 text-[10px] uppercase tracking-wide" style={{ color: 'var(--a-muted)' }}>(placeholder)</span>}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--a-muted)' }}>
                          {v.service && <span>{v.service} · {v.region}</span>}
                          {v.phone && <span className="inline-flex items-center gap-1"><Phone size={11} />{v.phone}</span>}
                          {v.website && (
                            <a href={v.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline" style={{ color: 'var(--a-navy)' }}>
                              <Globe size={11} /> website
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sources panel */}
              {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                <details className="mt-2 rounded-xl border px-3 py-2" style={{ borderColor: '#eceef1', background: 'var(--a-paper)' }}>
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--a-muted)' }}>
                    <BookOpen size={13} /> Sources ({m.sources.length})
                  </summary>
                  <ul className="mt-2 space-y-1.5">
                    {m.sources.map((s, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs">
                        <span className="inline-flex h-4 items-center rounded px-1 text-[9px] font-bold text-white" style={{ background: s.tier === 'A' ? 'var(--a-success)' : s.tier === 'B' ? 'var(--a-amber)' : '#9ca3af' }}>
                          Trust {s.tier}
                        </span>
                        {s.url ? (
                          <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--a-navy)' }}>{s.name}</a>
                        ) : (
                          <span style={{ color: 'var(--a-navy)' }}>{s.name}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-3 text-sm" style={{ background: 'var(--a-grey)', color: 'var(--a-muted)', border: '1px solid #eceef1' }}>
              Kaiako is thinking…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-0 flex items-end gap-2 border-t bg-white py-4"
        style={{ borderColor: '#eceef1' }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          placeholder="Ask Kaiako about your dog…"
          className="max-h-32 flex-1 resize-none rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2"
          style={{ borderColor: '#d5dae2', color: 'var(--a-ink)' }}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition disabled:opacity-40"
          style={{ background: 'var(--a-navy)' }}
          aria-label="Send"
        >
          <Send size={17} />
        </button>
      </form>
      <p className="pb-3 text-center text-[11px]" style={{ color: 'var(--a-muted)' }}>
        Kaiako gives force-free guidance, not veterinary treatment. Anything urgent, see your vet.
      </p>
    </div>
  );
}
