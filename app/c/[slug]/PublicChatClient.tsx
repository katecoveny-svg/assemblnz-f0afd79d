'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Loader2, Send, ShieldCheck, X } from 'lucide-react';

type Tenant = {
  slug: string;
  name: string;
  kete: string;
  keteName: string;
  logoUrl: string | null;
  brandColor: string;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  body: string;
};

type Props = {
  tenant: Tenant;
  embed?: boolean;
};

function storageKey(slug: string) {
  return `assembl-public-chat:${slug}`;
}

function newId() {
  return crypto.randomUUID();
}

export function PublicChatClient({ tenant, embed = false }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'hello',
      role: 'assistant',
      body: `Kia ora. Ask ${tenant.name} a question and this ${tenant.keteName} fleet will draft a grounded reply for review.`,
    },
  ]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string>(() => newId());
  const [sessionId, setSessionId] = useState<string>(() => newId());
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const history = useMemo(
    () =>
      messages
        .filter((message) => message.id !== 'hello')
        .slice(-8)
        .map((message) => ({
          role: message.role,
          content: message.body,
        })),
    [messages],
  );

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(storageKey(tenant.slug));
      if (stored) {
        const parsed = JSON.parse(stored) as { chatId?: string; sessionId?: string };
        if (parsed.chatId) setChatId(parsed.chatId);
        if (parsed.sessionId) setSessionId(parsed.sessionId);
      } else {
        const ids = { chatId: newId(), sessionId: newId() };
        setChatId(ids.chatId);
        setSessionId(ids.sessionId);
        sessionStorage.setItem(storageKey(tenant.slug), JSON.stringify(ids));
      }
    } catch {
      // Keep generated ids; private browsing can block sessionStorage.
    }
  }, [tenant.slug]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
    if (embed) {
      window.parent?.postMessage(
        { type: 'assembl:resize', height: Math.min(node.scrollHeight + 160, 720) },
        '*',
      );
    }
  }, [messages, sending, embed]);

  useEffect(() => {
    inputRef.current?.focus();
    if (embed) {
      window.parent?.postMessage({ type: 'assembl:ready', tenant: tenant.slug }, '*');
    }
  }, [embed, tenant.slug]);

  const closeEmbed = useCallback(() => {
    window.parent?.postMessage({ type: 'assembl:close' }, '*');
  }, []);

  const send = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || sending) return;

    const userMessage: Message = { id: newId(), role: 'user', body: trimmed };
    const assistantId = newId();
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
          slug: tenant.slug,
          kete: tenant.kete,
          message: trimmed,
          sessionId,
          chatId,
          history,
        }),
      });
      if (!response.ok || !response.body) throw new Error('The chat could not answer just now.');

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
      if (!body.trim()) throw new Error('The chat returned an empty reply.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setError(message);
      setDraft(trimmed);
      setMessages((current) => current.filter((item) => item.id !== assistantId && item.id !== userMessage.id));
    } finally {
      setSending(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [chatId, draft, history, sending, sessionId, tenant.kete, tenant.slug]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        send();
      }
    },
    [send],
  );

  return (
    <div
      className={[
        'public-chat-route fixed inset-0 z-[80] flex bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]',
        embed ? 'bg-transparent p-0' : 'p-3 sm:p-5',
      ].join(' ')}
      style={{ '--tenant-accent': tenant.brandColor } as React.CSSProperties}
    >
      <section
        className={[
          'mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-hidden border border-[rgba(35,33,31,0.10)] bg-white shadow-[0_24px_70px_rgba(35,33,31,0.12)]',
          embed ? 'rounded-none border-0 shadow-none' : 'rounded-[8px]',
        ].join(' ')}
      >
        <header className="flex items-center justify-between gap-4 border-b border-[rgba(35,33,31,0.10)] px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            {tenant.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-[8px] object-cover"
              />
            ) : (
              <div
                className="h-10 w-10 rounded-[8px]"
                style={{ backgroundColor: tenant.brandColor }}
                aria-hidden
              />
            )}
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-light leading-none sm:text-3xl">
                {tenant.name}
              </h1>
              <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                {tenant.keteName} fleet
              </p>
            </div>
          </div>
          {embed ? (
            <button
              type="button"
              aria-label="Close chat"
              onClick={closeEmbed}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(35,33,31,0.12)] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <div className="hidden items-center gap-2 rounded-full border border-[rgba(35,33,31,0.10)] px-3 py-1.5 text-xs text-[color:var(--text-secondary)] sm:flex">
              <ShieldCheck className="h-3.5 w-3.5" style={{ color: tenant.brandColor }} aria-hidden />
              Evidence held for review
            </div>
          )}
        </header>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={[
                  'max-w-[88%] rounded-[8px] px-4 py-3 text-sm leading-relaxed',
                  message.role === 'user'
                    ? 'ml-auto text-white'
                    : 'mr-auto border border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)] text-[color:var(--text-body)]',
                ].join(' ')}
                style={message.role === 'user' ? { backgroundColor: tenant.brandColor } : undefined}
              >
                {message.body ? (
                  <p className="whitespace-pre-wrap">{message.body}</p>
                ) : (
                  <span className="inline-flex items-center gap-2 text-[color:var(--text-secondary)]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    Drafting
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="border-t border-[rgba(35,33,31,0.08)] px-4 py-2 text-sm text-[#9A3412] sm:px-5">
            {error}
          </p>
        )}

        <footer className="border-t border-[rgba(35,33,31,0.10)] bg-white px-4 py-3 sm:px-5">
          <div className="mx-auto max-w-3xl">
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Ask a question..."
                className="min-h-11 resize-none rounded-[8px] border border-[rgba(35,33,31,0.14)] bg-[color:var(--assembl-paper)] px-3 py-2.5 text-sm outline-none focus:border-[color:var(--tenant-accent)]"
              />
              <button
                type="button"
                onClick={send}
                disabled={sending || !draft.trim()}
                className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: tenant.brandColor }}
                aria-label="Send message"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
              </button>
            </div>
            {!embed && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[rgba(35,33,31,0.08)] pt-3 text-xs text-[color:var(--text-secondary)]">
                <span>Powered by assembl.</span>
                <Link href={`/verify/${chatId}`} className="underline-offset-2 hover:underline">
                  View your evidence pack →
                </Link>
              </div>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
}
