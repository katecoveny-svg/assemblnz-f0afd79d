'use client';

import { useState, type CSSProperties } from 'react';
import type { VerticalPalette } from '@/lib/living-site/verticals';

type State = 'idle' | 'sending' | 'done' | 'error';

/**
 * Public enquiry form for a Living Site sample vertical — writes a real row
 * to living_site_enquiries (tenant-scoped) via /api/living-site/enquiry.
 */
export function SampleEnquiryForm({
  tenant,
  owner,
  palette,
  detailLabel,
  detailPlaceholder,
  messagePlaceholder,
}: {
  tenant: string;
  owner: string;
  palette: VerticalPalette;
  detailLabel: string;
  detailPlaceholder: string;
  messagePlaceholder: string;
}) {
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState<string | null>(null);

  const field: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    fontSize: 14,
    fontFamily: 'var(--font-brand-body), system-ui, sans-serif',
    color: palette.ink,
    background: palette.card,
    border: `1.5px solid ${palette.ink}22`,
    borderRadius: 12,
    padding: '12px 14px',
    outline: 'none',
  };

  const label: CSSProperties = {
    fontSize: 10,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: palette.muted,
    fontFamily: 'var(--font-brand-mono), ui-monospace, monospace',
    display: 'block',
    marginBottom: 6,
  };

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
        body: JSON.stringify({ ...data, tenant }),
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
        role="status"
        style={{
          padding: 18,
          borderRadius: 14,
          background: `${palette.ink}0A`,
          border: `1.5px solid ${palette.ink}18`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-brand-display), Georgia, serif',
            fontSize: 20,
            color: palette.ink,
          }}
        >
          Got it — thank you.
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 13.5, color: palette.muted, lineHeight: 1.55 }}>
          Your enquiry is on {owner}&apos;s desk. The intake agent reads it and drafts a reply —
          and {owner} approves before anything is sent back to you.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div>
          <label htmlFor="ls-name" style={label}>
            your name
          </label>
          <input id="ls-name" name="name" required maxLength={120} autoComplete="name" style={field} />
        </div>
        <div>
          <label htmlFor="ls-email" style={label}>
            email
          </label>
          <input id="ls-email" name="email" type="email" required maxLength={200} autoComplete="email" style={field} />
        </div>
        <div>
          <label htmlFor="ls-detail" style={label}>
            {detailLabel}
          </label>
          <input id="ls-detail" name="dog" maxLength={200} placeholder={detailPlaceholder} style={field} />
        </div>
      </div>
      <div>
        <label htmlFor="ls-message" style={label}>
          what&apos;s going on?
        </label>
        <textarea
          id="ls-message"
          name="message"
          required
          maxLength={2000}
          rows={4}
          placeholder={messagePlaceholder}
          style={{ ...field, resize: 'vertical' }}
        />
      </div>
      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div aria-hidden style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="ls-website">website</label>
        <input id="ls-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state === 'error' && error ? (
        <p role="alert" style={{ margin: 0, fontSize: 13, color: '#B54A4A' }}>
          {error}
        </p>
      ) : null}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <button
          type="submit"
          disabled={state === 'sending'}
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '12px 22px',
            borderRadius: 999,
            border: 'none',
            cursor: state === 'sending' ? 'wait' : 'pointer',
            background: palette.ink,
            color: '#fff',
            opacity: state === 'sending' ? 0.7 : 1,
          }}
        >
          {state === 'sending' ? 'sending…' : 'send enquiry'}
        </button>
        <p style={{ margin: 0, fontSize: 12, color: palette.accent }}>
          Replies are drafted by the desk — {owner} approves every send.
        </p>
      </div>
    </form>
  );
}
