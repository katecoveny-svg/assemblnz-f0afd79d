'use client';

import { useActionState, type CSSProperties } from 'react';
import { submitEnquiry, type EnquiryState } from './actions';

const NAVY = '#1B2A4A';
const PINK_DEEP = '#B87A8A';
const CREAM = '#FFFCFB';
const MUTED = '#6B7389';

const field: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  fontSize: 14,
  padding: '11px 13px',
  borderRadius: 12,
  border: `1.5px solid ${NAVY}22`,
  background: CREAM,
  color: NAVY,
  fontFamily: 'inherit',
};

const label: CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: MUTED,
  fontFamily: 'var(--font-brand-mono), ui-monospace, monospace',
  display: 'block',
  marginBottom: 6,
};

const INITIAL: EnquiryState = { status: 'idle' };

/** Enquiry form → living_site_enquiries via the storeEnquiry server action. */
export function EnquiryForm() {
  const [state, action, pending] = useActionState(submitEnquiry, INITIAL);

  if (state.status === 'sent') {
    return (
      <div
        role="status"
        style={{
          padding: '22px 20px',
          borderRadius: 14,
          background: `${NAVY}0A`,
          border: `1.5px solid ${NAVY}18`,
        }}
      >
        <p style={{ margin: 0, fontFamily: 'var(--font-brand-display), Georgia, serif', fontSize: 20, color: NAVY }}>
          Got it — thank you.
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 13.5, color: MUTED, lineHeight: 1.55 }}>
          Your enquiry is on Fred&apos;s desk. The intake agent reads it, drafts a reply and a
          training recommendation — and Fred approves before anything is sent back to you.
        </p>
      </div>
    );
  }

  return (
    <form action={action} style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div>
          <label htmlFor="enq-name" style={label}>
            your name
          </label>
          <input id="enq-name" name="name" required maxLength={120} autoComplete="name" style={field} />
        </div>
        <div>
          <label htmlFor="enq-email" style={label}>
            email
          </label>
          <input id="enq-email" name="email" type="email" required maxLength={200} autoComplete="email" style={field} />
        </div>
        <div>
          <label htmlFor="enq-dog" style={label}>
            your dog (name · breed)
          </label>
          <input id="enq-dog" name="dog" maxLength={120} placeholder="Bruno · heading collie x" style={field} />
        </div>
      </div>
      <div>
        <label htmlFor="enq-message" style={label}>
          what&apos;s going on?
        </label>
        <textarea
          id="enq-message"
          name="message"
          required
          maxLength={2000}
          rows={4}
          placeholder="Lunging at other dogs on lead, fine off lead. Started about three months ago…"
          style={{ ...field, resize: 'vertical' }}
        />
      </div>
      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div aria-hidden style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="enq-website">website</label>
        <input id="enq-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === 'error' ? (
        <p role="alert" style={{ margin: 0, fontSize: 13, color: '#B54A4A' }}>
          {state.message}
        </p>
      ) : null}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <button
          type="submit"
          disabled={pending}
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '12px 22px',
            borderRadius: 999,
            border: 'none',
            cursor: pending ? 'wait' : 'pointer',
            background: NAVY,
            color: '#fff',
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? 'sending…' : 'send enquiry'}
        </button>
        <p style={{ margin: 0, fontSize: 12, color: PINK_DEEP }}>
          Replies are drafted by the desk — Fred approves every send.
        </p>
      </div>
    </form>
  );
}
