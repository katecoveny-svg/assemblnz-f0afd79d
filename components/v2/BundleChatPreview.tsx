'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { AssemblingLoader, MicroLabel } from '@assembl/canvas';
import { palette, typography } from '@assembl/canvas/tokens';
import { AgentMarkdown } from '@/components/marketplace/AgentMarkdown';

/**
 * BundleChatPreview — the live agent chat on /bundles/[slug].
 *
 * Reuses the EXISTING chat stack: posts to /api/agents/<lead>/chat, whose
 * system prompt is resolved server-side from lib/marketplace/agent-prompts.ts
 * (prompts live in CODE — the browser never sees them). Typing/thinking state
 * is the branded <AssemblingLoader /> ("assembling…").
 *
 * Knowledge honesty: when the agent's searchNZKnowledge tool returns real
 * sources they render as citation chips with an A/B tier badge (A = primary
 * NZ government source by URL, B = assembl knowledge base). When retrieval
 * isn't wired or returns nothing, no citations render — no fake trust scores,
 * ever. The free tier (3 messages per agent) and unconfigured-key states
 * degrade to plain-English notices.
 */

type SourceChip = { title: string; url?: string; tier: 'A' | 'B' | 'C' };

const TIER_LABEL: Record<SourceChip['tier'], string> = {
  A: 'tier a · primary source',
  B: 'tier b · knowledge base',
  C: 'tier c · workspace demo data',
};

function messageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

function tierFor(url?: string): SourceChip['tier'] {
  if (!url) return 'B';
  try {
    const host = new URL(url).hostname;
    if (host.endsWith('.govt.nz') || host.endsWith('.parliament.nz')) return 'A';
  } catch {
    /* not a URL */
  }
  return 'B';
}

/** Collect real sources from completed tool calls (both marketplace + pilot shapes). */
function messageSources(message: UIMessage): SourceChip[] {
  const out: SourceChip[] = [];
  for (const part of message.parts) {
    if (!part.type.startsWith('tool-') && part.type !== 'dynamic-tool') continue;
    const p = part as unknown as {
      state?: string;
      output?: {
        status?: string;
        sources?: Array<{ title?: string; url?: string }>;
        citations?: Array<{ title?: string; url?: string; tier?: 'A' | 'B' | 'C' }>;
      };
    };
    if (p.state !== 'output-available' || !p.output) continue;
    if (Array.isArray(p.output.sources) && p.output.status === 'ok') {
      for (const s of p.output.sources) {
        if (s.title) out.push({ title: s.title, url: s.url, tier: tierFor(s.url) });
      }
    }
    if (Array.isArray(p.output.citations)) {
      for (const c of p.output.citations) {
        if (c.title) out.push({ title: c.title, url: c.url, tier: c.tier ?? tierFor(c.url) });
      }
    }
  }
  const seen = new Set<string>();
  return out.filter((s) => {
    const k = `${s.title}|${s.url ?? ''}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Plain-English degrade for the two expected non-streaming states. */
function friendlyError(message: string): React.ReactNode {
  if (message.includes('free_limit') || message.includes('402')) {
    return (
      <>
        that&apos;s the three free preview messages for this agent. install it from the{' '}
        <Link href="/agents" style={{ color: palette.ink }}>
          marketplace
        </Link>{' '}
        to keep going.
      </>
    );
  }
  if (message.includes('not configured') || message.includes('503')) {
    return 'live chat is not configured in this environment yet — nothing was lost.';
  }
  return 'the agent hit a snag. try again — nothing was lost.';
}

export function BundleChatPreview({
  agentSlug,
  agentName,
  greeting,
  starters,
}: {
  agentSlug: string;
  agentName: string;
  greeting: string;
  starters: string[];
}) {
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: `/api/agents/${agentSlug}/chat` }),
  });

  const busy = status === 'submitted' || status === 'streaming';
  const lastMessage = messages[messages.length - 1];
  const streamingText =
    busy && lastMessage?.role === 'assistant' ? messageText(lastMessage) : '';

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    void sendMessage({ text: trimmed });
    setInput('');
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    });
  };

  const bodyFont: React.CSSProperties = {
    fontFamily: typography.body.fontFamily,
    fontSize: 13.5,
    lineHeight: typography.body.lineHeight,
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 16,
        border: `1px solid ${palette.hairline}`,
        background: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          borderBottom: `1px solid ${palette.hairline}`,
        }}
      >
        <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
          •
        </span>
        <span
          style={{
            fontFamily: typography.display.fontFamily,
            fontWeight: typography.display.fontWeight,
            fontSize: 19,
            textTransform: 'lowercase',
            color: palette.ink,
          }}
        >
          {agentName}
        </span>
        <MicroLabel style={{ marginLeft: 'auto' }}>live agent · draft-only</MicroLabel>
      </div>

      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          minHeight: 240,
          maxHeight: 380,
        }}
      >
        {/* greeting is local UI only — never sent to the model */}
        <div style={{ ...bodyFont, color: palette.bodyGrey, maxWidth: '92%' }}>{greeting}</div>

        {messages.map((m) => {
          const text = messageText(m);
          const sources = m.role === 'assistant' ? messageSources(m) : [];
          if (m.role === 'user') {
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div
                  style={{
                    ...bodyFont,
                    maxWidth: '85%',
                    padding: '9px 14px',
                    borderRadius: '16px 16px 4px 16px',
                    background: palette.ink,
                    color: palette.paper,
                  }}
                >
                  {text}
                </div>
              </div>
            );
          }
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div
                style={{
                  ...bodyFont,
                  maxWidth: '92%',
                  padding: '10px 14px',
                  borderRadius: '16px 16px 16px 4px',
                  border: `1px solid ${palette.hairline}`,
                  background: palette.paper,
                  color: palette.ink,
                }}
              >
                {text ? <AgentMarkdown text={text} /> : <AssemblingLoader size={16} />}
                {sources.length > 0 ? (
                  <div
                    style={{
                      marginTop: 10,
                      paddingTop: 8,
                      borderTop: `1px solid ${palette.hairline}`,
                    }}
                  >
                    <MicroLabel>sources</MicroLabel>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                      {sources.map((s, i) => (
                        <a
                          key={i}
                          href={s.url ?? undefined}
                          target={s.url ? '_blank' : undefined}
                          rel="noreferrer"
                          title={TIER_LABEL[s.tier]}
                          style={{
                            ...bodyFont,
                            fontSize: 12,
                            textDecoration: 'none',
                            color: palette.bodyGrey,
                            padding: '3px 9px',
                            borderRadius: 999,
                            border: `1px solid ${palette.hairline}`,
                            background: '#FFFFFF',
                          }}
                        >
                          <span style={{ color: palette.goldSoft, marginRight: 5 }}>
                            {s.tier.toLowerCase()}
                          </span>
                          {s.title}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}

        {busy && !streamingText ? <AssemblingLoader size={18} /> : null}

        {error ? (
          <p style={{ ...bodyFont, color: palette.bodyGrey }}>{friendlyError(error.message)}</p>
        ) : null}
      </div>

      <div style={{ borderTop: `1px solid ${palette.hairline}`, padding: '12px 16px 14px' }}>
        {messages.length === 0 && starters.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {starters.slice(0, 3).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                disabled={busy}
                style={{
                  ...bodyFont,
                  fontSize: 12,
                  textAlign: 'left',
                  padding: '5px 11px',
                  borderRadius: 999,
                  border: `1px solid ${palette.hairline}`,
                  background: palette.paperDeep,
                  color: palette.bodyGrey,
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}
        <form
          style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}
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
            placeholder={`ask ${agentName.toLowerCase()} about the work…`}
            aria-label={`Message ${agentName}`}
            style={{
              ...bodyFont,
              flex: 1,
              resize: 'none',
              borderRadius: 12,
              border: `1px solid ${palette.hairline}`,
              background: '#FFFFFF',
              padding: '8px 12px',
              outline: 'none',
              color: palette.ink,
            }}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            style={{
              ...bodyFont,
              padding: '9px 18px',
              borderRadius: 12,
              border: 'none',
              background: palette.ink,
              color: palette.paper,
              cursor: busy || !input.trim() ? 'default' : 'pointer',
              opacity: busy || !input.trim() ? 0.5 : 1,
            }}
          >
            send
          </button>
        </form>
        <p style={{ ...bodyFont, fontSize: 12, color: palette.bodyGrey, marginTop: 8, marginBottom: 0 }}>
          three messages free, no login. every reply is a draft for a person to check.
        </p>
      </div>
    </div>
  );
}
