'use client';

/**
 * Public chat with a shared community agent (/a/[slug]).
 *
 * Mirrors the saved-Pilot chat (app/agents/mine/[id]/MyAgentChat.tsx): the
 * system prompt never travels through here — /api/a/[slug]/chat resolves it
 * server-side from the shared row.
 *
 * Gating: a thin custom fetch on the transport watches for the 402 the gate
 * returns. On capture:true the shared CaptureModal opens (surface
 * 'agent:<slug>'); the blocked message is restored into the input so the
 * visitor can resend once their email lifts the limit. (useToolGate is not
 * used here — it hardcodes the 'hapai:' surface and can't replay streams.)
 */

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { CaptureModal } from '@/components/gating/CaptureModal';

const INK = '#313c42';
const MUTED = '#68766f';
const TEAL = '#3f7373';
const HAIRLINE = 'rgba(49, 60, 66, 0.12)';

export function CommunityAgentChat({ slug, name }: { slug: string; name: string }) {
  const [input, setInput] = useState('');
  const [captureOpen, setCaptureOpen] = useState(false);
  const [gateNote, setGateNote] = useState<string | null>(null);
  const lastSent = useRef('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // One stable transport; its fetch reads state via setters and a ref, so it
  // stays current without re-creating the chat.
  const [transport] = useState(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: `/api/a/${slug}/chat`,
        fetch: (async (info: RequestInfo | URL, init?: RequestInit) => {
          const res = await fetch(info, init);
          if (res.status === 402) {
            const data = (await res
              .clone()
              .json()
              .catch(() => null)) as { capture?: boolean; message?: string } | null;
            if (data?.capture) {
              setCaptureOpen(true);
            } else if (data?.message) {
              setGateNote(data.message);
            }
            // Put the blocked message back so one click resends it.
            setInput((v) => v || lastSent.current);
          }
          return res;
        }) as typeof fetch,
      }),
  );

  const greeting: UIMessage = {
    id: 'greeting',
    role: 'assistant',
    parts: [{ type: 'text', text: `Hi — I’m ${name}. What are we working on?` }],
  };
  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: [greeting],
  });
  const busy = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const textOf = (m: UIMessage) =>
    m.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('');

  const submit = (t: string) => {
    const v = t.trim();
    if (!v || busy) return;
    lastSent.current = v;
    setGateNote(null);
    sendMessage({ text: v });
    setInput('');
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 440,
          borderRadius: 22,
          border: `1px solid ${HAIRLINE}`,
          background: '#fbfaf6',
          overflow: 'hidden',
        }}
      >
        <div
          ref={scrollRef}
          style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: 18 }}
        >
          {messages.map((m) => {
            const text = textOf(m);
            if (!text) return null;
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                style={{
                  maxWidth: '85%',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  padding: '10px 16px',
                  borderRadius: 18,
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  ...(isUser
                    ? { background: TEAL, color: '#fff' }
                    : { background: '#fff', color: INK, border: `1px solid ${HAIRLINE}` }),
                }}
              >
                {text}
              </div>
            );
          })}
          {busy && (
            <div
              style={{
                alignSelf: 'flex-start',
                padding: '10px 16px',
                borderRadius: 18,
                border: `1px solid ${HAIRLINE}`,
                background: '#fff',
              }}
            >
              <Loader2 size={16} style={{ color: '#b8964f', animation: 'spin 1s linear infinite' }} />
            </div>
          )}
          {gateNote && (
            <p style={{ alignSelf: 'flex-start', margin: 0, color: MUTED, fontSize: 13 }}>{gateNote}</p>
          )}
          {error && !gateNote && !captureOpen && (
            <p style={{ alignSelf: 'flex-start', margin: 0, color: '#8a4b3c', fontSize: 13 }}>
              Something went wrong — try that again.
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 14, borderTop: `1px solid ${HAIRLINE}` }}>
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
            placeholder="Type a message…"
            style={{
              flex: 1,
              resize: 'none',
              padding: '10px 14px',
              borderRadius: 14,
              border: `1px solid ${HAIRLINE}`,
              background: '#fff',
              color: INK,
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={() => submit(input)}
            disabled={busy || !input.trim()}
            aria-label="Send"
            style={{
              display: 'flex',
              width: 42,
              height: 42,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              border: 'none',
              background: INK,
              color: '#fff',
              cursor: busy || !input.trim() ? 'default' : 'pointer',
              opacity: busy || !input.trim() ? 0.4 : 1,
            }}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <CaptureModal
        open={captureOpen}
        surface={`agent:${slug}`}
        onClose={() => setCaptureOpen(false)}
        onUnlocked={() => setCaptureOpen(false)}
      />
    </div>
  );
}
