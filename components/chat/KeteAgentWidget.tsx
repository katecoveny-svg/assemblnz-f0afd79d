'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Loader2, MessageCircle, Send, ShieldCheck, X } from 'lucide-react';
import {
  getKeteWidgetCopy,
  publicChatUrl,
  type KeteWidgetMode,
} from '@/lib/kete-chat';
import type { KeteSlug } from '@/lib/kete';

type KeteAgentWidgetProps = {
  kete: KeteSlug;
  agent?: string;
  mode?: KeteWidgetMode;
  accent?: string;
};

type WidgetMessage = {
  id: string;
  role: 'user' | 'assistant';
  body: string;
};

function newId() {
  return crypto.randomUUID();
}

export function KeteAgentWidget({
  kete,
  agent,
  mode = 'marketing',
  accent = '#3A3832',
}: KeteAgentWidgetProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>(() => newId());
  const [chatId, setChatId] = useState<string>(() => newId());
  const copy = useMemo(() => getKeteWidgetCopy(kete, mode), [kete, mode]);
  const fullUrl = useMemo(() => publicChatUrl(kete, agent), [agent, kete]);
  const [messages, setMessages] = useState<WidgetMessage[]>([
    {
      id: 'hello',
      role: 'assistant',
      body: copy.prompt,
    },
  ]);

  const send = async (text = draft) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const userMessage: WidgetMessage = { id: newId(), role: 'user', body: trimmed };
    const assistantId = newId();
    const history = messages
      .filter((message) => message.id !== 'hello')
      .slice(-8)
      .map((message) => ({
        role: message.role,
        content: message.body,
      }));

    setMessages((current) => [
      ...current,
      userMessage,
      { id: assistantId, role: 'assistant', body: '' },
    ]);
    setDraft('');
    setSending(true);
    setError(null);

    try {
      const response = await fetch('/api/public-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: kete,
          kete,
          agent,
          message: trimmed,
          sessionId,
          chatId,
          history,
        }),
      });

      if (!response.ok || !response.body) throw new Error('The assistant could not answer just now.');

      const nextChatId = response.headers.get('X-Chat-Id');
      const nextSessionId = response.headers.get('X-Session-Id');
      if (nextChatId) setChatId(nextChatId);
      if (nextSessionId) setSessionId(nextSessionId);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let body = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        body += decoder.decode(value, { stream: true });
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId ? { ...message, body } : message,
          ),
        );
      }

      if (!body.trim()) throw new Error('The assistant returned an empty reply.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setError(message);
      setDraft(trimmed);
      setMessages((current) =>
        current.filter((item) => item.id !== assistantId && item.id !== userMessage.id),
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <aside
      className="fixed bottom-4 right-4 z-[70] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 md:bottom-6 md:right-6"
      style={{ '--kete-widget-accent': accent } as React.CSSProperties}
    >
      {open ? (
        <section className="w-[min(calc(100vw-2rem),420px)] overflow-hidden rounded-[8px] border border-[rgba(35,33,31,0.14)] bg-[#FFF7EC] shadow-[0_24px_80px_rgba(35,33,31,0.24)]">
          <header className="flex items-start justify-between gap-4 border-b border-[rgba(35,33,31,0.10)] bg-white/70 p-4">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--kete-widget-accent)]">
                {copy.eyebrow}
              </p>
              <h2 className="mt-1 font-display text-2xl font-light leading-none text-[#3D4250]">
                {copy.title}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#5C6273]">
                {copy.prompt}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close assistant"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#5C6273] transition hover:bg-[rgba(35,33,31,0.06)] hover:text-[#3D4250] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--kete-widget-accent)]"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </header>

          <div className="max-h-[min(470px,calc(100vh-17rem))] min-h-[300px] space-y-3 overflow-y-auto bg-white p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
              >
                <div
                  className={[
                    'max-w-[88%] rounded-[8px] px-3 py-2 text-sm leading-relaxed',
                    message.role === 'user'
                      ? 'bg-[color:var(--kete-widget-accent)] text-[#FFF7EC]'
                      : 'border border-[rgba(35,33,31,0.10)] bg-[#FFF7EC] text-[#3D4250]',
                  ].join(' ')}
                >
                  {message.body ? (
                    <p className="whitespace-pre-wrap">{message.body}</p>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-[#5C6273]">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      Drafting
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <footer className="border-t border-[rgba(35,33,31,0.10)] bg-[#FFF7EC] p-4">
            {error ? <p className="mb-3 text-sm text-[#9A3412]">{error}</p> : null}
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                send();
              }}
            >
              <label htmlFor={`kete-widget-${kete}`} className="sr-only">
                Ask {copy.buttonLabel}
              </label>
              <input
                id={`kete-widget-${kete}`}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask a question..."
                className="h-11 min-w-0 flex-1 rounded-[8px] border border-[rgba(35,33,31,0.14)] bg-white px-3 text-sm text-[#3D4250] outline-none focus:border-[color:var(--kete-widget-accent)] focus:ring-2 focus:ring-[color:var(--kete-widget-accent)]/20"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={sending || !draft.trim()}
                className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] bg-[color:var(--kete-widget-accent)] text-[#FFF7EC] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
              </button>
            </form>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-xs text-[#5C6273]">
                <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--kete-widget-accent)]" aria-hidden />
                Routed through Iho with reviewable proof.
              </span>
              <Link
                href={fullUrl}
                className="inline-flex items-center font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--kete-widget-accent)]"
              >
                Full chat
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </footer>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-14 items-center gap-3 rounded-full border border-[rgba(35,33,31,0.12)] bg-[color:var(--kete-widget-accent)] px-5 text-sm font-medium text-[#FFF7EC] shadow-[0_16px_50px_rgba(35,33,31,0.22)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--kete-widget-accent)] focus-visible:ring-offset-2"
        aria-expanded={open}
      >
        <MessageCircle className="h-5 w-5" aria-hidden />
        {copy.buttonLabel}
      </button>
    </aside>
  );
}
