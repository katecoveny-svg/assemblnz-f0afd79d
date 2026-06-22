'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import { PALETTE, type PublicMarketplaceAgent } from '@/lib/marketplace/agents';
import { AgentIcon } from '@/components/marketplace/AgentIcon';
import { DashLoader } from '@/components/marketplace/DashLoader';
import { Wordmark } from '@/components/marketplace/Wordmark';

/** Pull the rendered text out of a UIMessage's parts. */
function messageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

export function AgentChat({ agent }: { agent: PublicMarketplaceAgent }) {
  const greeting: UIMessage = {
    id: 'greeting',
    role: 'assistant',
    parts: [{ type: 'text', text: agent.greeting }],
  };

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: `/api/agents/${agent.slug}/chat` }),
    messages: [greeting],
  });

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const busy = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    sendMessage({ text: trimmed });
    setInput('');
  }

  // Is the assistant streaming but hasn't emitted visible text yet? Show the dog.
  const last = messages[messages.length - 1];
  const waitingForText = busy && (!last || last.role !== 'assistant' || messageText(last).length === 0);

  return (
    <div className="flex h-[100dvh] flex-col" style={{ backgroundColor: PALETTE.cream }}>
      {/* Header */}
      <header
        className="flex items-center justify-between border-b px-4 py-3 md:px-6"
        style={{ borderColor: 'rgba(22,58,35,0.10)' }}
      >
        <div className="flex items-center gap-3">
          <Link
            href={`/agents/${agent.slug}`}
            aria-label="Back to agent details"
            className="rounded-full p-1.5 hover:bg-black/5"
            style={{ color: PALETTE.forest }}
          >
            <ArrowLeft size={18} aria-hidden />
          </Link>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${agent.accent}33` }}
          >
            <AgentIcon name={agent.icon} className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="font-display text-lg" style={{ color: PALETTE.forest }}>
              {agent.name}
            </p>
            <p className="text-xs" style={{ color: PALETTE.forest, opacity: 0.5 }}>
              {agent.teReo}
            </p>
          </div>
        </div>
        <Wordmark className="text-lg" href="/agents" />
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.map((m) => {
            const text = messageText(m);
            if (!text) return null;
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser ? 'self-end' : 'self-start'
                }`}
                style={
                  isUser
                    ? { backgroundColor: PALETTE.forest, color: PALETTE.cream }
                    : { backgroundColor: 'white', color: PALETTE.forest, border: '1px solid rgba(22,58,35,0.10)' }
                }
              >
                <p className="whitespace-pre-wrap">{text}</p>
              </div>
            );
          })}

          {waitingForText ? (
            <div className="self-start rounded-2xl border bg-white px-4 py-3" style={{ borderColor: 'rgba(22,58,35,0.10)' }}>
              <DashLoader label={`${agent.name} is thinking…`} />
            </div>
          ) : null}

          {error ? (
            <div
              className="self-start rounded-2xl border px-4 py-3 text-sm"
              style={{ borderColor: 'rgba(180,60,40,0.3)', backgroundColor: 'rgba(180,60,40,0.06)', color: '#7a2a1a' }}
            >
              Something went wrong: {error.message || 'the agent could not reply.'} The chat may not be
              configured yet.
            </div>
          ) : null}

          {/* Starters — only on the fresh, greeting-only state */}
          {messages.length <= 1 && !busy ? (
            <div className="mt-2 flex flex-col gap-2">
              {agent.starters.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submit(s)}
                  className="self-start rounded-full border px-4 py-2 text-left text-sm transition hover:bg-white"
                  style={{ borderColor: 'rgba(22,58,35,0.18)', color: PALETTE.forest }}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t px-4 py-3 md:px-6" style={{ borderColor: 'rgba(22,58,35,0.10)' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="mx-auto flex max-w-2xl items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            rows={1}
            placeholder={`Message ${agent.name}…`}
            className="max-h-40 flex-1 resize-none rounded-2xl border bg-white px-4 py-3 text-sm outline-none"
            style={{ borderColor: 'rgba(22,58,35,0.15)', color: PALETTE.forest }}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition disabled:opacity-40"
            style={{ backgroundColor: PALETTE.forest, color: PALETTE.cream }}
          >
            <ArrowUp size={18} aria-hidden />
          </button>
        </form>
        <p className="mx-auto mt-2 max-w-2xl text-center text-xs" style={{ color: PALETTE.forest, opacity: 0.45 }}>
          A draft for you to check. Not legal, financial, or medical advice.
        </p>
      </div>
    </div>
  );
}
