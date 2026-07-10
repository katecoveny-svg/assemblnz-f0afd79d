'use client';

import { useState, type CSSProperties } from 'react';

const NAVY = '#1B2A4A';
const PINK_DEEP = '#B87A8A';
const CREAM = '#FFFCFB';
const MUTED = '#6B7389';

const field: CSSProperties = {
  width: '100%',
  fontSize: 14,
  fontFamily: 'var(--font-brand-body), system-ui, sans-serif',
  color: NAVY,
  background: CREAM,
  border: `1.5px solid ${NAVY}22`,
  borderRadius: 12,
  padding: '12px 14px',
  outline: 'none',
};

const label: CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: MUTED,
  fontFamily: 'var(--font-brand-mono), ui-monospace, monospace',
  display: 'block',
  marginBottom: 6,
};

type State = 'idle' | 'sending' | 'done' | 'error';

/** Public booking/enquiry form — writes a real row to living_site_enquiries. */
export function EnquiryForm() {
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState('sending');
    setError(null);
    try {
      const res = await fetch('/api/living-site/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? 'something went wrong — please try again');
        setState('error');
        return;
      }
      setState('done');
      form.reset();
    } catch {
      setError('network hiccup — please try again');
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <div
        style={{
          padding: 18,
          borderRadius: 14,
          background: `${PINK_DEEP}14`,
          border: `1.5px solid ${PINK_DEEP}55`,
        }}
      >
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY }}>
          ✓ Received — thank you.
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 13.5, color: MUTED, lineHeight: 1.55 }}>
          Your enquiry just landed in the CRM and the enquiry agent is drafting Fred&apos;s reply
          with the right programme suggestion. Nothing sends without Fred&apos;s yes — expect to
          hear back within one working day.
        </p>
        <button
          type="button"
          onClick={() => setState('idle')}
          style={{
            marginTop: 12,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '8px 14px',
            borderRadius: 999,
            border: `1.5px solid ${NAVY}22`,
            background: CREAM,
            color: NAVY,
            cursor: 'pointer',
          }}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div>
          <label style={label} htmlFor="enq-name">
            your name
          </label>
          <input id="enq-name" name="name" required maxLength={120} style={field} />
        </div>
        <div>
          <label style={label} htmlFor="enq-email">
            email
          </label>
          <input id="enq-email" name="email" type="email" required maxLength={200} style={field} />
        </div>
      </div>
      <div>
        <label style={label} htmlFor="enq-dog">
          your dog — name · breed · age
        </label>
        <input
          id="enq-dog"
          name="dog"
          maxLength={200}
          placeholder="e.g. Nova · Kelpie cross · 20 months"
          style={field}
        />
      </div>
      <div>
        <label style={label} htmlFor="enq-message">
          what&apos;s going on?
        </label>
        <textarea
          id="enq-message"
          name="message"
          required
          maxLength={2000}
          rows={4}
          placeholder="Tell Fred what walks look like right now, and what you want them to look like."
          style={{ ...field, resize: 'vertical' }}
        />
      </div>
      {/* honeypot — humans never see it */}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }}
      />
      {error ? (
        <p style={{ margin: 0, fontSize: 13, color: '#B54A4A' }}>{error}</p>
      ) : null}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="submit"
          disabled={state === 'sending'}
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '12px 22px',
            borderRadius: 999,
            border: 'none',
            cursor: state === 'sending' ? 'wait' : 'pointer',
            background: NAVY,
            color: '#fff',
            opacity: state === 'sending' ? 0.7 : 1,
          }}
        >
          {state === 'sending' ? 'Sending…' : 'Book a consultation'}
        </button>
        <p style={{ margin: 0, fontSize: 12, color: MUTED }}>
          Goes straight into the CRM · reply drafted for Fred&apos;s yes
        </p>
      </div>
    </form>
  );
}
