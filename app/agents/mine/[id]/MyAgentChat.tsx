'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';

const INK = '#313c42';
const MUTED = '#68766f';
const TEAL = '#3f7373';
const HAIRLINE = 'rgba(49, 60, 66, 0.12)';

/**
 * The shipped-agent chat. The system prompt never travels through here —
 * the run route resolves it server-side from the saved pilot_agents row.
 */
export function MyAgentChat({
  id,
  name,
  tests,
}: {
  id: string;
  name: string;
  tests: Array<{ title: string; prompt: string }>;
}) {
  const greeting: UIMessage = {
    id: 'greeting',
    role: 'assistant',
    parts: [{ type: 'text', text: `Hi — I'm ${name}. What are we working on?` }],
  };
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: `/api/pilot/agents/${id}/chat` }),
    messages: [greeting],
  });
  const [input, setInput] = useState('');
  const busy = status === 'submitted' || status === 'streaming';
  const scrollRef = useRef<HTMLDivElement>(null);

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
    sendMessage({ text: v });
    setInput('');
  };

  return (
    <div style={{ marginTop: 28 }}>
      {tests.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {tests.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => submit(t.prompt)}
              disabled={busy}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                border: `1px solid ${HAIRLINE}`,
                background: '#fff',
                color: INK,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t.title}
            </button>
          ))}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 480,
          borderRadius: 22,
          border: `1px solid ${HAIRLINE}`,
          background: '#fbfaf6',
          overflow: 'hidden',
        }}
      >
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: 18 }}>
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
          {error && (
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
    </div>
  );
}
