'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Send, Loader2, MessageCircle, Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { findAgent, type ChatKete } from '@/lib/chat/registry';

type ChatMessage = {
  role: 'user' | 'agent' | 'system';
  body: string;
  agentName?: string;
  /** Optional rich metadata returned by Iho — model used, pack, compliance status. */
  meta?: {
    modelUsed?: string;
    pack?: string;
    code?: string;
  };
};

type Props = {
  ketes: ChatKete[];
  initialKete: string;
  initialAgentId: string;
  userEmail: string;
  greeting: string;
};

/**
 * /app/chat — pick a kete, pick an agent, talk to it.
 *
 * • Left rail: kete list (8 industry + 1 cross-pack), each with its accent.
 *   Tap a kete to expand its agents.
 * • Main: chat window. User messages right-aligned, agent messages left.
 *   Editorial typography (Cormorant Garamond for headlines + agent labels,
 *   Inter for body).
 * • Footer input: textarea + send. Submits to `iho-router` via
 *   supabase.functions.invoke — the user JWT is attached automatically so
 *   RLS + the trial limiter apply.
 * • Persistence: every conversation lives in public.conversations (jsonb
 *   messages array). RLS scopes rows to auth.uid().
 *
 * Brand rules (locked):
 *   • lowercase tōro everywhere user-facing
 *   • Use "specialist agents" / "specialist" / "the brain"
 *   • Mārama Whenua palette only — paper, ink, pounamu, gold-thread
 *   • Editorial, calm — no hype-tech aesthetic
 *   • Every reply is a draft — banner the disclaimer.
 */
export function ChatClient({
  ketes,
  initialKete,
  initialAgentId,
  userEmail,
  greeting,
}: Props) {
  const supabase = useMemo(() => createClient(), []);

  const [activeKete, setActiveKete] = useState(initialKete);
  const [activeAgent, setActiveAgent] = useState(initialAgentId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [railOpen, setRailOpen] = useState(false); // mobile drawer

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const selection = findAgent(activeKete, activeAgent);
  const accent = selection?.kete.accent ?? '#2B6B57';
  const agentLabel = selection?.agent.name ?? 'an agent';
  const agentRole = selection?.agent.role ?? '';
  const agentBlurb = selection?.agent.blurb;
  const agentExpertise = selection?.agent.expertise;
  const agentMemoryScope = selection?.agent.memoryScope;
  const agentAmbientBrief = selection?.agent.ambientBrief;
  const collaborators = selection?.agent.collaboratesWith ?? [];

  // Switching agent: fresh conversation, fresh transcript.
  const onChooseAgent = useCallback((keteSlug: string, agentId: string) => {
    setActiveKete(keteSlug);
    setActiveAgent(agentId);
    setMessages([]);
    setConversationId(null);
    setError(null);
    setRailOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  // Autoscroll to newest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  // Initial focus + handle starter prompt from query string (?prompt=...)
  useEffect(() => {
    inputRef.current?.focus();
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const prompt = url.searchParams.get('prompt');
      if (prompt) setDraft(prompt);
    }
  }, []);

  // Submit handler — sends to iho-router + persists to public.conversations.
  const send = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || sending || !selection) return;

    setSending(true);
    setError(null);

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', body: trimmed },
    ];
    setMessages(nextMessages);
    setDraft('');

    try {
      const previousMessages = nextMessages
        .filter((m) => m.role !== 'system')
        .slice(-8) // last 8 turns is plenty of context for now
        .map((m) => ({
          role: m.role === 'agent' ? 'assistant' : 'user',
          content: m.body,
        }));

      // The Iho edge function. Lives at supabase/functions/iho-router/.
      // Falls back to keyword classification if agentId can't be resolved.
      const { data, error: invokeError } = await supabase.functions.invoke<{
        response?: string;
        error?: string;
        agentUsed?: { code: string; name: string; pack: string; model: string };
        modelUsed?: string;
      }>('iho-router', {
        body: {
          message: trimmed,
          agentId: selection.agent.agentId,
          packId: selection.kete.slug,
          mode: 'respond',
          context: { previousMessages },
        },
      });

      if (invokeError) throw invokeError;
      if (!data) throw new Error('No response from Iho');
      if (data.error) throw new Error(data.error);
      if (!data.response) throw new Error('Empty response');

      const agentMessage: ChatMessage = {
        role: 'agent',
        body: data.response,
        agentName: data.agentUsed?.name ?? selection.agent.name,
        meta: {
          modelUsed: data.modelUsed ?? data.agentUsed?.model,
          pack: data.agentUsed?.pack,
          code: data.agentUsed?.code,
        },
      };
      const finalMessages = [...nextMessages, agentMessage];
      setMessages(finalMessages);

      // Persist (best-effort — chat keeps working even if persistence fails).
      const persistPayload = finalMessages.map((m) => ({
        role: m.role,
        body: m.body,
        agent_name: m.agentName ?? null,
        meta: m.meta ?? null,
        created_at: new Date().toISOString(),
      }));

      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (uid) {
        if (conversationId) {
          await supabase
            .from('conversations')
            .update({ messages: persistPayload, updated_at: new Date().toISOString() })
            .eq('id', conversationId);
        } else {
          const { data: inserted } = await supabase
            .from('conversations')
            .insert({
              user_id: uid,
              agent_id: `${selection.kete.slug}:${selection.agent.agentId}`,
              messages: persistPayload,
            })
            .select('id')
            .single();
          if (inserted?.id) setConversationId(inserted.id);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
      // Roll the user message back into the input so they don't lose it.
      setDraft(trimmed);
      setMessages(messages);
    } finally {
      setSending(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [draft, sending, selection, messages, conversationId, supabase]);

  const onKey = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send],
  );

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[320px_1fr]">
      {/* Mobile top bar — kete drawer toggle */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[rgba(35,33,31,0.10)] bg-[color:var(--assembl-paper)] px-4 py-3 md:hidden">
        <button
          type="button"
          aria-label="Open kete picker"
          onClick={() => setRailOpen(true)}
          className="inline-flex items-center gap-2 text-sm text-[color:var(--text-primary)]"
        >
          <Menu size={18} aria-hidden /> Kete
        </button>
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
          assembl · chat
        </span>
        <Link
          href="/app"
          className="text-xs text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
        >
          back
        </Link>
      </div>

      {/* LEFT RAIL — kete + agent picker */}
      <aside
        className={[
          'border-r border-[rgba(35,33,31,0.10)] bg-white/40 md:sticky md:top-0 md:h-screen md:overflow-y-auto',
          railOpen
            ? 'fixed inset-0 z-40 block bg-[color:var(--assembl-paper)]'
            : 'hidden md:block',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-6 pt-7 md:pt-9">
          <Link
            href="/"
            className="font-display text-xl font-semibold lowercase tracking-tight text-[color:var(--text-primary)]"
          >
            assembl
          </Link>
          {railOpen && (
            <button
              type="button"
              aria-label="Close kete picker"
              onClick={() => setRailOpen(false)}
              className="text-[color:var(--text-secondary)] md:hidden"
            >
              <X size={20} aria-hidden />
            </button>
          )}
        </div>
        <p className="px-6 pt-5 font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
          Choose a kete
        </p>
        <nav className="mt-3 space-y-1 px-3 pb-10">
          {ketes.map((kete) => {
            const isActiveKete = kete.slug === activeKete;
            return (
              <div key={kete.slug} className="rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    // First agent in the kete becomes the selection.
                    onChooseAgent(kete.slug, kete.agents[0].agentId);
                  }}
                  className={[
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                    isActiveKete
                      ? 'bg-[rgba(35,33,31,0.06)]'
                      : 'hover:bg-[rgba(35,33,31,0.04)]',
                  ].join(' ')}
                >
                  <span
                    aria-hidden
                    className="block h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: kete.accent }}
                  />
                  <span className="flex-1">
                    <span className="block font-display text-base leading-tight text-[color:var(--text-primary)]">
                      {kete.name}
                    </span>
                    <span className="block text-[11px] text-[color:var(--text-secondary)]">
                      {kete.industry}
                    </span>
                  </span>
                </button>
                {isActiveKete && (
                  <ul className="ml-6 mt-1 space-y-0.5 border-l border-[rgba(35,33,31,0.10)] pl-3">
                    {kete.agents.map((agent) => {
                      const isActive = agent.agentId === activeAgent;
                      return (
                        <li key={agent.agentId}>
                          <button
                            type="button"
                            onClick={() => onChooseAgent(kete.slug, agent.agentId)}
                            className={[
                              'block w-full rounded-md px-2.5 py-1.5 text-left text-sm',
                              isActive
                                ? 'text-[color:var(--text-primary)]'
                                : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]',
                            ].join(' ')}
                          >
                            <span
                              className="block font-medium"
                              style={isActive ? { color: kete.accent } : undefined}
                            >
                              {agent.name}
                            </span>
                            <span className="block text-[11px] text-[color:var(--text-secondary)]">
                              {agent.role}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* MAIN — chat window */}
      <section className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="border-b border-[rgba(35,33,31,0.10)] bg-white/40 px-6 py-5 md:px-10 md:py-7">
          <div className="flex flex-col gap-1">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.32em]"
              style={{ color: accent }}
            >
              {selection?.kete.name} · {agentRole}
            </p>
            <h1
              className="font-display leading-tight text-[color:var(--text-primary)]"
              style={{ fontWeight: 300, fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)' }}
            >
              {greeting},{' '}
              <em
                className="not-italic"
                style={{ color: accent }}
              >
                {userEmail.split('@')[0]}
              </em>
              . Talking to{' '}
              <em
                className="not-italic"
                style={{ color: accent }}
              >
                {agentLabel}
              </em>
              .
            </h1>
            {agentBlurb && (
              <p className="mt-1 max-w-2xl text-sm text-[color:var(--text-body)]">
                {agentBlurb}
              </p>
            )}
            <div className="mt-4 grid gap-2 text-xs text-[color:var(--text-secondary)] md:grid-cols-3">
              {agentExpertise ? (
                <AgentTrait label="Expertise" value={agentExpertise} accent={accent} />
              ) : null}
              {agentMemoryScope ? (
                <AgentTrait label="Memory" value={agentMemoryScope} accent={accent} />
              ) : null}
              {agentAmbientBrief ? (
                <AgentTrait label="Ambient" value={agentAmbientBrief} accent={accent} />
              ) : null}
            </div>
            {collaborators.length > 0 ? (
              <p className="mt-3 max-w-2xl text-[12px] text-[color:var(--text-secondary)]">
                Collaborates with {collaborators.join(', ')} when the mahi crosses disciplines.
              </p>
            ) : null}
            <p className="mt-3 max-w-2xl text-[12px] italic text-[color:var(--text-secondary)]">
              All replies are draft. You approve before anything happens elsewhere.
            </p>
          </div>
        </header>

        {/* Transcript */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 md:px-10">
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.length === 0 && (
              <div className="rounded-card border border-[rgba(35,33,31,0.10)] bg-white/55 p-6 text-center">
                <MessageCircle
                  size={20}
                  className="mx-auto mb-3 text-[color:var(--text-secondary)]"
                  aria-hidden
                />
                <p className="font-display text-lg text-[color:var(--text-primary)]">
                  Ask {agentLabel} a question.
                </p>
                <p className="mt-2 text-sm text-[color:var(--text-body)]">
                  Type below. Press Enter to send, Shift+Enter for a new line.
                </p>
              </div>
            )}

            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} accent={accent} />
            ))}

            {sending && (
              <div className="flex items-center gap-2 text-sm text-[color:var(--text-secondary)]">
                <Loader2 size={14} className="animate-spin" aria-hidden />
                <span>{agentLabel} is drafting…</span>
              </div>
            )}

            {error && (
              <div className="rounded-md border border-[rgba(172,88,56,0.4)] bg-[rgba(172,88,56,0.06)] px-4 py-3 text-sm text-[color:var(--text-body)]">
                <strong className="font-mono text-[10px] uppercase tracking-[0.24em]">
                  Error
                </strong>
                <div className="mt-1">{error}</div>
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="border-t border-[rgba(35,33,31,0.10)] bg-white/55 px-4 py-4 md:px-10 md:py-5"
        >
          <div className="mx-auto flex max-w-3xl items-end gap-3">
            <label htmlFor="chat-input" className="sr-only">
              Message {agentLabel}
            </label>
            <textarea
              ref={inputRef}
              id="chat-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKey}
              rows={1}
              placeholder={`Message ${agentLabel}…`}
              disabled={sending}
              className="min-h-[44px] flex-1 resize-none rounded-card border border-[rgba(35,33,31,0.14)] bg-[color:var(--assembl-paper)] px-4 py-3 text-base text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)] focus:border-[rgba(35,33,31,0.3)] focus:outline-none"
              style={{ maxHeight: 200 }}
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              aria-label="Send"
              className="inline-flex h-11 items-center gap-2 rounded-card px-5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
              style={{ backgroundColor: accent }}
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" aria-hidden />
              ) : (
                <>
                  Send
                  <Send size={14} aria-hidden />
                </>
              )}
            </button>
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-[11px] text-[color:var(--text-secondary)]">
            {selection?.kete.name} → {agentLabel}.{' '}
            <Link
              href="/app"
              className="underline decoration-[rgba(35,33,31,0.2)] underline-offset-2 hover:text-[color:var(--text-primary)]"
            >
              Back to admin
            </Link>
            <span aria-hidden> · </span>
            <Link
              href="/kete"
              className="underline decoration-[rgba(35,33,31,0.2)] underline-offset-2 hover:text-[color:var(--text-primary)]"
            >
              Browse kete
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}

function AgentTrait({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-[rgba(250,247,242,0.55)] p-3">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: accent }}>
        {label}
      </p>
      <p className="mt-1 line-clamp-3 leading-relaxed">{value}</p>
    </div>
  );
}

function MessageBubble({
  message,
  accent,
}: {
  message: ChatMessage;
  accent: string;
}) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-card bg-[color:var(--text-primary)] px-4 py-3 text-sm text-[color:var(--assembl-paper)] md:text-base">
          {message.body}
        </div>
      </div>
    );
  }

  if (message.role === 'agent') {
    return (
      <div className="flex justify-start">
        <div className="max-w-[90%]">
          <p
            className="mb-1 font-mono text-[10px] uppercase tracking-[0.28em]"
            style={{ color: accent }}
          >
            {message.agentName ?? 'agent'}
            {message.meta?.modelUsed && (
              <span className="ml-2 text-[color:var(--text-secondary)] normal-case tracking-normal">
                · {message.meta.modelUsed}
              </span>
            )}
          </p>
          <div className="whitespace-pre-wrap rounded-card border border-[rgba(35,33,31,0.10)] bg-white/55 px-5 py-4 text-sm leading-relaxed text-[color:var(--text-body)] md:text-base">
            {message.body}
          </div>
        </div>
      </div>
    );
  }

  // system
  return (
    <div className="text-center text-xs italic text-[color:var(--text-secondary)]">
      {message.body}
    </div>
  );
}

// helper export keeps the deep-link icon usable elsewhere
export const _ArrowRight = ArrowRight;
