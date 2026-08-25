'use client';

import { useState, useTransition, type CSSProperties } from 'react';
import { mintConnectLinkAction, queueConnectEmailAction, revokeConnectionAction, type MintResult } from './actions';

/**
 * Client half of /admin/connectors: the mint form, the link modal (copy +
 * queue-email-draft), and the per-row mint/revoke buttons. The Connect link
 * lives only in this component's state and the operator's clipboard — it is
 * never put in the URL bar, so it can't leak into request logs.
 */

const DISPLAY = 'var(--font-display), "Cormorant Garamond", Georgia, serif';
const BODY = 'var(--font-body), Lato, system-ui, sans-serif';
const MONO = 'var(--font-mono), "Space Mono", ui-monospace, monospace';
const C = {
  gold: '#BFA37A',
  ink: '#3A3832',
  body: '#56544B',
  muted: '#8A8678',
  paper: '#FFFFFF',
  cream: '#FFF7EC',
  hairline: '#EFEADC',
  ok: '#3A7D6E',
  bad: '#B5533A',
} as const;

export type AppOption = { slug: string; label: string };

const input: CSSProperties = {
  padding: '9px 12px',
  fontFamily: BODY,
  fontSize: 13.5,
  color: C.ink,
  background: C.paper,
  border: `1px solid ${C.hairline}`,
  borderRadius: 10,
  boxSizing: 'border-box',
  width: '100%',
};

const goldButton: CSSProperties = {
  fontFamily: BODY,
  fontWeight: 700,
  fontSize: 14,
  color: C.ink,
  background: C.gold,
  border: 'none',
  borderRadius: 999,
  padding: '9px 18px',
  cursor: 'pointer',
  boxShadow: '0 6px 16px rgba(191,163,122,.32)',
};

const ghostButton = (color: string): CSSProperties => ({
  fontFamily: MONO,
  fontSize: 12,
  letterSpacing: '0.04em',
  color,
  background: 'transparent',
  border: `1px solid ${color}66`,
  borderRadius: 999,
  padding: '4px 12px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
});

function nzTime(iso: string | null): string {
  if (!iso) return 'about 4 hours';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'about 4 hours';
  return d.toLocaleString('en-NZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// ── The link modal ───────────────────────────────────────────────────────────

function LinkModal({
  externalUserId,
  result,
  onClose,
}: {
  externalUserId: string;
  result: Extract<MintResult, { ok: true }>;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [queued, setQueued] = useState<string | null>(null);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Copy the Connect link:', result.url);
    }
  };

  const queueEmail = () => {
    startTransition(async () => {
      setQueueError(null);
      const r = await queueConnectEmailAction({ externalUserId, url: result.url, to: email || undefined });
      if (r.ok) setQueued('Draft filed — it waits on /admin/approvals and nothing sends until you approve (and dispatch is switched on).');
      else setQueueError(r.error ?? 'Could not file the draft.');
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(58,56,50,.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.paper,
          border: `1px solid ${C.hairline}`,
          borderRadius: 18,
          boxShadow: '0 24px 60px rgba(58,56,50,.25)',
          padding: 26,
          maxWidth: 560,
          width: '100%',
        }}
      >
        <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.gold }}>
          connect link · {externalUserId}
        </div>
        <h3 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 27, letterSpacing: '-0.01em', color: C.ink, margin: '8px 0 6px' }}>
          link minted
        </h3>
        <p style={{ fontFamily: BODY, fontSize: 13.5, color: C.body, margin: '0 0 14px' }}>
          Send this to the pilot customer. They authorise on Pipedream&apos;s hosted page — you never see their
          credentials. Expires {nzTime(result.expiresAt)}.
        </p>

        <div
          style={{
            fontFamily: MONO,
            fontSize: 12,
            color: C.ink,
            background: C.cream,
            border: `1px solid ${C.hairline}`,
            borderRadius: 10,
            padding: '10px 12px',
            wordBreak: 'break-all',
            marginBottom: 14,
          }}
        >
          {result.url}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={copy} style={goldButton}>
            {copied ? 'copied ✓' : 'copy link'}
          </button>
          <input
            type="email"
            placeholder="customer email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ ...input, width: 220 }}
          />
          <button type="button" onClick={queueEmail} disabled={pending || !!queued} style={ghostButton(queued ? C.ok : C.ink)}>
            {queued ? 'draft queued ✓' : pending ? 'filing…' : 'queue email draft'}
          </button>
          <button type="button" onClick={onClose} style={ghostButton(C.muted)}>
            close
          </button>
        </div>

        {queued && <p style={{ fontFamily: BODY, fontSize: 12.5, color: C.ok, margin: '12px 0 0' }}>{queued}</p>}
        {queueError && <p style={{ fontFamily: BODY, fontSize: 12.5, color: C.bad, margin: '12px 0 0' }}>{queueError}</p>}
      </div>
    </div>
  );
}

// ── "Send a new Connect link" form ───────────────────────────────────────────

export function MintForm({ apps }: { apps: AppOption[] }) {
  const [externalUserId, setExternalUserId] = useState('');
  const [app, setApp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [minted, setMinted] = useState<{ id: string; result: Extract<MintResult, { ok: true }> } | null>(null);
  const [pending, startTransition] = useTransition();

  const mint = () => {
    startTransition(async () => {
      setError(null);
      const id = externalUserId.trim().toLowerCase();
      const r = await mintConnectLinkAction({ externalUserId: id, app: app || null });
      if (r.ok) setMinted({ id, result: r });
      else setError(r.error);
    });
  };

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <label style={{ flex: '1 1 260px' }}>
        <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, display: 'block', marginBottom: 6 }}>
          external user id
        </span>
        <input
          value={externalUserId}
          onChange={(e) => setExternalUserId(e.target.value)}
          placeholder="tenant:happytails"
          spellCheck={false}
          style={input}
        />
        <span style={{ fontFamily: BODY, fontSize: 12, color: C.muted, display: 'block', marginTop: 5 }}>
          <code style={{ fontFamily: MONO, fontSize: 12 }}>agent:&lt;slug&gt;</code> for a single agent&apos;s account ·{' '}
          <code style={{ fontFamily: MONO, fontSize: 12 }}>tenant:&lt;slug&gt;</code> for a workspace
        </span>
      </label>

      <label style={{ flex: '0 1 200px' }}>
        <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, display: 'block', marginBottom: 6 }}>
          app (optional)
        </span>
        <select value={app} onChange={(e) => setApp(e.target.value)} style={{ ...input, cursor: 'pointer' }}>
          <option value="">All apps in the project</option>
          {apps.map((a) => (
            <option key={a.slug} value={a.slug}>
              {a.label}
            </option>
          ))}
        </select>
        <span style={{ fontFamily: BODY, fontSize: 12, color: C.muted, display: 'block', marginTop: 5 }}>
          Pre-filters Pipedream&apos;s hosted page
        </span>
      </label>

      <div style={{ paddingBottom: 24 }}>
        <button type="button" onClick={mint} disabled={pending} style={{ ...goldButton, opacity: pending ? 0.6 : 1 }}>
          {pending ? 'minting…' : 'mint link'}
        </button>
      </div>

      {error && <p style={{ fontFamily: BODY, fontSize: 12.5, color: C.bad, flexBasis: '100%', margin: 0 }}>{error}</p>}

      {minted && <LinkModal externalUserId={minted.id} result={minted.result} onClose={() => setMinted(null)} />}
    </div>
  );
}

// ── Per-row actions: mint fresh link + revoke ────────────────────────────────

export function RowActions({ externalUserId, hasAccounts }: { externalUserId: string; hasAccounts: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [minted, setMinted] = useState<Extract<MintResult, { ok: true }> | null>(null);
  const [pending, startTransition] = useTransition();

  const mint = () => {
    startTransition(async () => {
      setError(null);
      const r = await mintConnectLinkAction({ externalUserId });
      if (r.ok) setMinted(r);
      else setError(r.error);
    });
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <button type="button" onClick={mint} disabled={pending} style={ghostButton(C.ink)}>
        {pending ? 'minting…' : 'mint fresh link'}
      </button>
      {hasAccounts && (
        <form
          action={revokeConnectionAction}
          onSubmit={(e) => {
            if (
              !window.confirm(
                `Revoke every connected account for ${externalUserId}?\n\nPipedream drops the grant immediately — the customer would need a new Connect link to reconnect. Their own account (Google, HubSpot, …) is untouched.`,
              )
            ) {
              e.preventDefault();
            }
          }}
          style={{ display: 'inline' }}
        >
          <input type="hidden" name="external_user_id" value={externalUserId} />
          <button type="submit" style={ghostButton(C.bad)}>
            revoke
          </button>
        </form>
      )}
      {error && <span style={{ fontFamily: BODY, fontSize: 12, color: C.bad }}>{error}</span>}
      {minted && <LinkModal externalUserId={externalUserId} result={minted} onClose={() => setMinted(null)} />}
    </div>
  );
}
