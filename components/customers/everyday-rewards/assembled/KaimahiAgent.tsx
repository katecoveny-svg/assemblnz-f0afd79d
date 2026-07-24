'use client';

import { useRef, useState } from 'react';
import { Card } from '@/components/customers/everyday-rewards/ui';
import styles from '@/app/customers/everyday-rewards/assembled/assembled.module.css';

const NAVY = '#22303c';
const CHARCOAL = '#3a474e';
const GREY = '#8a959c';
const ORANGE = '#fd6400';

type Turn = { role: 'you' | 'agent'; text: string };

const ENDPOINT = '/api/concepts/everyday-rewards/agent';

/**
 * The in-app customer agent (kaimahi persona), named by the buyer. Role-plays
 * what the agent would do inside the shop journey. Model-backed; if the model
 * isn't configured it says so honestly rather than faking a reply.
 */
export function KaimahiAgent() {
  const [name, setName] = useState('');
  const [named, setNamed] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const send = async () => {
    const message = input.trim();
    if (!message || busy) return;
    setTurns((t) => [...t, { role: 'you', text: message }]);
    setInput('');
    setBusy(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: 'kaimahi', message, name }),
      });
      if (!res.ok) {
        const reason =
          res.status === 503
            ? 'The live agent isn’t switched on in this environment — but in the app I’d reflect your week back, prepare the shop, and stage it for your approval. review + approve →'
            : 'I hit an error reaching the model. Try again in a moment.';
        setTurns((t) => [...t, { role: 'agent', text: reason }]);
      } else {
        const data = (await res.json()) as { text?: string };
        setTurns((t) => [...t, { role: 'agent', text: data.text || '(no reply)' }]);
      }
    } catch {
      setTurns((t) => [...t, { role: 'agent', text: 'Network error — please try again.' }]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => scroller.current?.scrollTo({ top: 1e9 }));
    }
  };

  if (!named) {
    return (
      <Card style={{ maxWidth: 460 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: GREY, marginBottom: 8 }}>
          name your agent
        </div>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: CHARCOAL, margin: '0 0 14px' }}>
          Give the in-app agent a name, then talk to it like a shopper would — tell it about
          your week, your household, your budget. It role-plays the assembled shop, draft-only.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim()) setNamed(true);
            }}
            placeholder="e.g. Kai, Piki, Scout…"
            aria-label="Name your agent"
            style={{ flex: 1, padding: '11px 14px', borderRadius: 10, border: '1.5px solid rgba(34,48,60,0.16)', fontSize: 14, fontFamily: 'inherit' }}
          />
          <button
            type="button"
            className={styles.chip}
            data-active
            onClick={() => name.trim() && setNamed(true)}
            disabled={!name.trim()}
            style={{ opacity: name.trim() ? 1 : 0.5 }}
          >
            name it →
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ maxWidth: 460 }}>
      <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: ORANGE, marginBottom: 10 }}>
        {name} · in-app agent
      </div>
      <div ref={scroller} style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
        {turns.length === 0 ? (
          <p style={{ fontSize: 13.5, color: GREY }}>
            Kia ora — I&rsquo;m {name}. Tell me about your week and I&rsquo;ll assemble a shop
            around it. Nothing is ordered until you approve.
          </p>
        ) : (
          turns.map((t, i) => (
            <div
              key={i}
              className={styles.assemble}
              style={{
                alignSelf: t.role === 'you' ? 'flex-end' : 'flex-start',
                maxWidth: '86%',
                padding: '9px 13px',
                borderRadius: 13,
                fontSize: 13.5,
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                background: t.role === 'you' ? '#ffe6d1' : '#f2f2f2',
                color: t.role === 'you' ? '#c65100' : CHARCOAL,
              }}
            >
              {t.text}
            </div>
          ))
        )}
        {busy ? <div style={{ fontSize: 12.5, color: GREY }}>{name} is assembling…</div> : null}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send();
          }}
          placeholder="Tell it about your week…"
          aria-label={`Message ${name}`}
          disabled={busy}
          style={{ flex: 1, padding: '11px 14px', borderRadius: 10, border: '1.5px solid rgba(34,48,60,0.16)', fontSize: 14, fontFamily: 'inherit' }}
        />
        <button type="button" className={styles.chip} data-active onClick={send} disabled={busy}>
          send
        </button>
      </div>
    </Card>
  );
}
