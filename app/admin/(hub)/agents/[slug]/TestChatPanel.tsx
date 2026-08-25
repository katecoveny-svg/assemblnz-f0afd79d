'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { AgentMarkdown } from '@/components/marketplace/AgentMarkdown';
import { recordTestExchange } from '../actions';

/**
 * Admin test chat — wired to the SAME /api/agents/[slug]/chat endpoint real
 * users hit, so Kate sees the exact response, citations and trust footer a
 * prospect gets. Differences from the public chat are guardrails only:
 *
 *  - draft-mode banner: every response is a draft; nothing is sent anywhere
 *  - kaumātua-hold: on Kaitiaki taonga agents, a query naming a taonga
 *    species is refused client-side before it reaches the model
 *  - each completed exchange is recorded to assembl_audit_log (draft decision)
 *  - the free-tier 402 paywall renders as a notice (useful signal, not an error)
 */

const C = {
  gold: '#BFA37A',
  goldDeep: '#8A6B4E',
  pale: '#FFF1C2',
  ink: '#3A3832',
  body: '#56544B',
  muted: '#8A8678',
  paper: '#FFFFFF',
  cream: '#FFF7EC',
  hairline: '#EFEADC',
  warn: '#C98A1B',
  bad: '#B5533A',
} as const;

const BODY = 'var(--font-body), Lato, system-ui, sans-serif';
const MONO = 'var(--font-mono), "Space Mono", ui-monospace, monospace';
const DISPLAY = 'var(--font-display), "Cormorant Garamond", Georgia, serif';

const TAONGA_PATTERN = /\b(kiwi|k[āa]k[āa]p[ōo]|tuatara|takah[ēe]|k[ēe]repar[īi]|whakapapa)\b/i;

const KAUMATUA_HOLD_MESSAGE =
  'Kaumātua-hold: this looks like a question about a taonga species. Content on taonga species does not ship model-only — it needs a named kaitiaki reviewer and kaumātua sign-off before anything is drafted. Nothing was sent to the model.';

function messageText(m: UIMessage): string {
  return m.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

type LocalNotice = { id: string; kind: 'hold' | 'paywall'; text: string };

export function TestChatPanel({
  slug,
  agentName,
  greeting,
  kaumatuaHold,
}: {
  slug: string;
  agentName: string;
  greeting: string;
  kaumatuaHold: boolean;
}) {
  const [paywalled, setPaywalled] = useState(false);
  const [notices, setNotices] = useState<LocalNotice[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  // One audit session per panel mount — groups this test conversation.
  const sessionIdRef = useRef<string>('');
  if (!sessionIdRef.current && typeof crypto !== 'undefined') sessionIdRef.current = crypto.randomUUID();

  const chatFetch = useCallback<typeof fetch>(async (input, init) => {
    const res = await fetch(input, init);
    if (res.status === 402) {
      const data = (await res.clone().json().catch(() => null)) as { message?: string } | null;
      setPaywalled(true);
      setNotices((n) => [
        ...n,
        {
          id: `pw-${Date.now()}`,
          kind: 'paywall',
          text: `Free-tier paywall hit (402): ${data?.message ?? 'free messages spent'} — this is the exact wall a prospect sees after 3 free messages.`,
        },
      ]);
    }
    return res;
  }, []);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: `/api/agents/${slug}/chat`, fetch: chatFetch }),
    messages: [
      { id: 'greeting', role: 'assistant', parts: [{ type: 'text', text: greeting }] } as UIMessage,
    ],
  });

  const busy = status === 'submitted' || status === 'streaming';
  const [input, setInput] = useState('');
  const lastLogged = useRef<string | null>(null);

  // Record each completed exchange to the audit log (fail-soft, once per reply).
  useEffect(() => {
    if (busy) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant' || last.id === 'greeting' || last.id === lastLogged.current) return;
    const prevUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!prevUser) return;
    lastLogged.current = last.id;
    void recordTestExchange({ slug, query: messageText(prevUser), response: messageText(last), sessionId: sessionIdRef.current }).catch(() => {});
  }, [busy, messages, slug]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, notices, busy]);

  function submit() {
    const text = input.trim();
    if (!text || busy || paywalled) return;
    if (kaumatuaHold && TAONGA_PATTERN.test(text)) {
      setNotices((n) => [...n, { id: `hold-${Date.now()}`, kind: 'hold', text: KAUMATUA_HOLD_MESSAGE }]);
      void recordTestExchange({ slug, query: text, response: KAUMATUA_HOLD_MESSAGE, sessionId: sessionIdRef.current, held: true }).catch(() => {});
      setInput('');
      return;
    }
    sendMessage({ text });
    setInput('');
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 480,
        background: C.paper,
        border: `1px solid ${C.hairline}`,
        borderRadius: 18,
        boxShadow: '0 16px 40px rgba(180,150,40,.07)',
        overflow: 'hidden',
      }}
    >
      {/* header + draft banner */}
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 22, color: C.ink, textTransform: 'lowercase' }}>
          test chat · {agentName}
        </div>
        <div
          style={{
            marginTop: 8,
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: C.goldDeep,
            background: C.pale,
            border: `1px solid ${C.gold}`,
            borderRadius: 8,
            padding: '6px 10px',
          }}
        >
          draft mode — the real endpoint, the real answer; nothing sends, everything logs to the audit trail
        </div>
        {kaumatuaHold && (
          <div
            style={{
              marginTop: 6,
              fontFamily: MONO,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: C.warn,
            }}
          >
            kaumātua-hold active — taonga-species queries are refused
          </div>
        )}
      </div>

      {/* transcript */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m) => {
          const text = messageText(m);
          if (!text) return null;
          const mine = m.role === 'user';
          return (
            <div
              key={m.id}
              style={{
                alignSelf: mine ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
                background: mine ? C.gold : C.cream,
                color: C.ink,
                fontFamily: BODY,
                fontSize: 13.5,
                lineHeight: 1.55,
                borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                padding: '10px 14px',
                whiteSpace: mine ? 'pre-wrap' : 'normal',
                wordBreak: 'break-word',
              }}
            >
              {mine ? text : <AgentMarkdown text={text} />}
              {!mine && m.id !== 'greeting' && (
                <div style={{ fontFamily: MONO, fontSize: 12, color: C.muted, marginTop: 6, letterSpacing: '0.08em' }}>
                  DRAFT · not sent
                </div>
              )}
            </div>
          );
        })}
        {notices.map((n) => (
          <div
            key={n.id}
            style={{
              alignSelf: 'flex-start',
              maxWidth: '92%',
              background: n.kind === 'hold' ? 'rgba(201,138,27,.12)' : 'rgba(181,83,58,.10)',
              border: `1px solid ${n.kind === 'hold' ? C.warn : C.bad}`,
              color: n.kind === 'hold' ? C.warn : C.bad,
              fontFamily: BODY,
              fontSize: 13,
              lineHeight: 1.5,
              borderRadius: 12,
              padding: '10px 14px',
            }}
          >
            {n.text}
          </div>
        ))}
        {busy && (
          <div style={{ fontFamily: MONO, fontSize: 12, color: C.muted }}>…thinking</div>
        )}
        {error && !paywalled && (
          <div style={{ fontFamily: MONO, fontSize: 12, color: C.bad }}>
            endpoint error: {error.message || 'request failed'} — this is what a user would hit right now.
          </div>
        )}
      </div>

      {/* composer */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 14px', borderTop: `1px solid ${C.hairline}` }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={paywalled ? 'paywall reached on this identity' : `ask ${agentName} what a prospect would…`}
          disabled={paywalled}
          style={{
            flex: 1,
            fontFamily: BODY,
            fontSize: 14,
            color: C.ink,
            background: C.paper,
            border: `1px solid ${C.hairline}`,
            borderRadius: 999,
            padding: '10px 16px',
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={submit}
          disabled={busy || paywalled || !input.trim()}
          style={{
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 14,
            color: C.ink,
            background: C.gold,
            border: 'none',
            borderRadius: 999,
            padding: '10px 20px',
            cursor: busy || paywalled ? 'default' : 'pointer',
            opacity: busy || paywalled || !input.trim() ? 0.55 : 1,
          }}
        >
          send
        </button>
      </div>
    </div>
  );
}
