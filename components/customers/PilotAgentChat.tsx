'use client';

import { useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { AgentMarkdown } from '@/components/marketplace/AgentMarkdown';
import { ASSEMBL_WARM_GREY } from '@/components/assembl/chrome';

/**
 * PilotAgentChat — the live agent panel inside a customer pilot workspace.
 *
 * Real streaming chat against the pilot's own API route; the agent answers
 * through real tools (domain engines + pgvector knowledge retrieval), and the
 * sources those tools cite are surfaced under each reply together with a
 * provenance score. No canned responses anywhere.
 *
 * Layer rules (AI-OS positioning): the panel itself is assembl OS chrome;
 * the customer's accent colour appears in exactly one place — the send
 * button / active states.
 */

type Citation = { title: string; ref?: string; url?: string; tier?: 'A' | 'B' | 'C' };

/** Pull the text out of a UIMessage's parts. */
function messageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

/** Collect citations from every completed tool call in a message. */
function messageCitations(message: UIMessage): Citation[] {
  const out: Citation[] = [];
  for (const part of message.parts) {
    if (!part.type.startsWith('tool-') && part.type !== 'dynamic-tool') continue;
    const p = part as unknown as { state?: string; output?: { citations?: Citation[] } };
    if (p.state === 'output-available' && Array.isArray(p.output?.citations)) {
      out.push(...p.output.citations);
    }
  }
  // De-dup by title+ref.
  const seen = new Set<string>();
  return out.filter((c) => {
    const k = `${c.title}|${c.ref ?? ''}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/**
 * Provenance score — an honest, deterministic heuristic over the reply's
 * actual citation trail: base 0.5, +0.12 per distinct source (cap 3), +0.05
 * if any Tier A (statute / tariff reference) source is present. Shown with
 * its source count so it can't be mistaken for a model-confidence claim.
 */
function provenanceScore(citations: Citation[]): number | null {
  if (citations.length === 0) return null;
  const tierABoost = citations.some((c) => c.tier === 'A') ? 0.05 : 0;
  return Math.min(0.95, 0.5 + Math.min(citations.length, 3) * 0.12 + tierABoost);
}

const TIER_LABEL: Record<string, string> = {
  A: 'tier a · primary source',
  B: 'tier b · knowledge base',
  C: 'tier c · workspace demo data',
};

export function PilotAgentChat({
  apiPath,
  agentName,
  greeting,
  tryMe,
  accent,
  draftNote,
}: {
  apiPath: string;
  agentName: string;
  greeting: string;
  tryMe: string[];
  /** The customer accent colour — used on the send button only. */
  accent: string;
  draftNote?: string;
}) {
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const initialMessages = useMemo<UIMessage[]>(
    () => [
      {
        id: 'greeting',
        role: 'assistant',
        parts: [{ type: 'text', text: greeting }],
      } as UIMessage,
    ],
    [greeting],
  );

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: apiPath }),
    messages: initialMessages,
  });

  const busy = status === 'submitted' || status === 'streaming';

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    sendMessage({ text: trimmed });
    setInput('');
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    });
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-black/10 bg-white/85 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-black/5 px-4 py-3">
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: accent }}
        />
        <span className="text-sm font-semibold">{agentName}</span>
        <span
          className="ml-auto text-[9px] uppercase"
          style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}
        >
          live agent · draft-only
        </span>
      </div>

      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4" style={{ minHeight: 320, maxHeight: 460 }}>
        {messages.map((m) => {
          const text = messageText(m);
          const citations = m.role === 'assistant' ? messageCitations(m) : [];
          const score = provenanceScore(citations);
          return (
            <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div
                className={
                  m.role === 'user'
                    ? 'max-w-[85%] rounded-2xl rounded-br-md bg-black/80 px-4 py-2.5 text-sm text-white'
                    : 'max-w-[92%] rounded-2xl rounded-bl-md border border-black/5 bg-white px-4 py-3 text-sm'
                }
              >
                {m.role === 'assistant' ? (
                  <>
                    {text ? <AgentMarkdown text={text} /> : (
                      <span className="text-xs" style={{ color: ASSEMBL_WARM_GREY }}>
                        working — checking the tools…
                      </span>
                    )}
                    {citations.length > 0 && (
                      <div className="mt-3 border-t border-black/5 pt-2">
                        <div
                          className="mb-1.5 text-[9px] uppercase"
                          style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}
                        >
                          sources
                          {score !== null && (
                            <span className="ml-2" title="Provenance: deterministic score over this reply's real citation trail (source count + tier), not a model-confidence claim.">
                              · provenance {(score * 100).toFixed(0)}% · {citations.length} source{citations.length === 1 ? '' : 's'}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {citations.map((c, i) => (
                            <a
                              key={i}
                              href={c.url ?? undefined}
                              target={c.url ? '_blank' : undefined}
                              rel="noreferrer"
                              title={`${TIER_LABEL[c.tier ?? 'B']}${c.ref ? ` — ${c.ref}` : ''}`}
                              className={`rounded-full border border-black/10 px-2 py-0.5 text-[10px] ${c.url ? 'hover:bg-black/5' : 'cursor-default'}`}
                              style={{ color: '#3E3C36' }}
                            >
                              {c.tier ? `${c.tier} · ` : ''}
                              {c.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  text
                )}
              </div>
            </div>
          );
        })}
        {error ? (
          <p className="text-xs text-red-700">
            The agent hit a snag: {error.message}. Try again — nothing was lost.
          </p>
        ) : null}
      </div>

      <div className="border-t border-black/5 px-4 pb-4 pt-3">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {tryMe.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => send(t)}
              disabled={busy}
              className="rounded-full border border-black/10 bg-white px-3 py-1 text-left text-[11px] transition-colors hover:bg-black/5 disabled:opacity-50"
            >
              {t}
            </button>
          ))}
        </div>
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
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
            rows={2}
            placeholder={`Ask ${agentName} anything about the workspace…`}
            className="flex-1 resize-none rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: accent }}
          >
            {busy ? '…' : 'send'}
          </button>
        </form>
        {draftNote ? (
          <p className="mt-2 text-[10px]" style={{ color: ASSEMBL_WARM_GREY }}>
            {draftNote}
          </p>
        ) : null}
      </div>
    </div>
  );
}
