'use client';

/**
 * "Share a public page" — publishes this saved Pilot build as a community
 * page (/a/<slug>) via POST /api/a/share, then shows the copyable link.
 * Re-clicking returns the same link (the share API is idempotent per
 * owner + name).
 */

import { useState } from 'react';

const INK = '#313c42';
const MUTED = '#68766f';
const HAIRLINE = 'rgba(49, 60, 66, 0.12)';

export function SharePublicPage({ agentId }: { agentId: string }) {
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const share = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/a/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });
      const data = (await res.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;
      if (!res.ok || !data?.url) {
        setError(data?.error ?? 'Could not create the public page — try again.');
        return;
      }
      setUrl(new URL(data.url, window.location.origin).toString());
    } catch {
      setError('Could not create the public page — try again.');
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the link is visible to copy by hand */
    }
  };

  return (
    <div style={{ marginTop: 18 }}>
      {url ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <code
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: `1px solid ${HAIRLINE}`,
              background: '#fbfaf6',
              color: INK,
              fontSize: 13,
            }}
          >
            {url}
          </code>
          <button
            type="button"
            onClick={() => void copy()}
            style={{
              padding: '10px 18px',
              borderRadius: 999,
              border: `1px solid ${HAIRLINE}`,
              background: '#fff',
              color: INK,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => void share()}
          disabled={busy}
          style={{
            padding: '10px 18px',
            borderRadius: 999,
            border: `1px solid ${HAIRLINE}`,
            background: '#fff',
            color: INK,
            fontSize: 13,
            fontWeight: 700,
            cursor: busy ? 'default' : 'pointer',
            opacity: busy ? 0.5 : 1,
          }}
        >
          {busy ? 'Creating the page…' : 'Share a public page'}
        </button>
      )}
      {error && (
        <p role="alert" style={{ margin: '10px 0 0', color: '#8a4b3c', fontSize: 13 }}>
          {error}
        </p>
      )}
      {url && (
        <p style={{ margin: '10px 0 0', color: MUTED, fontSize: 12 }}>
          Anyone with the link can chat with a copy of this agent. Drafts only.
        </p>
      )}
    </div>
  );
}
