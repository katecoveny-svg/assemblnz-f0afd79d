'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  approveDraftAction,
  confirmPaymentAndApproveAction,
  editAndApproveDraftAction,
  markReviewingAction,
  rejectDraftAction,
  retrySendAction,
} from './actions';
import type { DraftState } from '@/lib/toro/state-machine-types';

export interface DraftPaymentIntent {
  stripe_payment_intent_id: string;
  amount_cents: number;
  currency: string;
  description: string | null;
  status: string;
}

export interface DraftRowData {
  id: string;
  contact_name: string | null;
  contact_identifier: string | null;
  incoming_body: string | null;
  draft_body: string;
  confidence: number | null;
  created_at: string;
  chatwoot_conversation_id: number;
  status: DraftState;
  send_error: string | null;
  paymentIntent?: DraftPaymentIntent | null;
}

export interface TransitionLogEntry {
  from_state: DraftState | null;
  to_state: DraftState;
  transitioned_by: string | null;
  transitioned_at: string;
  reason: string | null;
}

// Auto-expire window per spec §4.4. 48h matches the toro-expire-drafts cron;
// the UI warning fires at the 24h mark.
const AUTO_EXPIRE_HOURS = 48;
const WARN_THRESHOLD_HOURS = 24;

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-NZ', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function hoursSince(iso: string, nowMs: number): number {
  const t = new Date(iso).getTime();
  return (nowMs - t) / 3_600_000;
}

function formatCurrency(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

const STATUS_PILL: Record<DraftState, { label: string; tone: string }> = {
  pending_approval: {
    label: 'pending approval',
    tone: 'text-[color:var(--assembl-gold-thread)]',
  },
  reviewing: {
    label: 'reviewing · in progress',
    tone: 'text-[color:var(--text-primary)]',
  },
  approved: {
    label: 'approved · sending',
    tone: 'text-emerald-700',
  },
  edited_then_approved: {
    label: 'edited & approved · sending',
    tone: 'text-emerald-700',
  },
  rejected: {
    label: 'rejected',
    tone: 'text-[color:var(--text-secondary)] line-through decoration-[0.5px]',
  },
  sent: {
    label: 'sent · in chatwoot',
    tone: 'text-emerald-800',
  },
  send_failed: {
    label: 'send failed · retry available',
    tone: 'text-red-700',
  },
  expired: {
    label: 'expired · auto-closed',
    tone: 'text-[color:var(--text-secondary)] opacity-60',
  },
};

export function DraftRow({
  draft,
  transitions,
}: {
  draft: DraftRowData;
  transitions: TransitionLogEntry[];
}) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(draft.draft_body);
  const [error, setError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Live ticking countdown for pending drafts so the banner stays honest
  // without a server round-trip.
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  useEffect(() => {
    if (draft.status !== 'pending_approval' && draft.status !== 'reviewing') return;
    const id = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, [draft.status]);

  const ageHours = useMemo(() => hoursSince(draft.created_at, nowMs), [draft.created_at, nowMs]);

  const expiringSoon =
    (draft.status === 'pending_approval' || draft.status === 'reviewing') &&
    ageHours >= WARN_THRESHOLD_HOURS &&
    ageHours < AUTO_EXPIRE_HOURS;
  const hoursToExpiry = expiringSoon ? Math.max(0, AUTO_EXPIRE_HOURS - ageHours) : null;

  const isInteractive =
    draft.status === 'pending_approval' || draft.status === 'reviewing';

  const contactLabel =
    draft.contact_name ??
    draft.contact_identifier ??
    `Conversation #${draft.chatwoot_conversation_id}`;

  const pill = STATUS_PILL[draft.status];

  const handleMarkReviewing = () => {
    if (draft.status !== 'pending_approval') return;
    setError(null);
    startTransition(async () => {
      const result = await markReviewingAction(draft.id);
      if (!result.ok) setError(result.reason ?? 'could not mark as reviewing');
    });
  };

  const handleApprove = () => {
    setError(null);
    startTransition(async () => {
      const result = await approveDraftAction(draft.id);
      if (!result.ok) setError(result.reason ?? 'approve failed');
    });
  };

  const handleConfirmPayment = () => {
    setError(null);
    startTransition(async () => {
      const result = await confirmPaymentAndApproveAction(draft.id);
      if (!result.ok) setError(result.reason ?? 'payment confirmation failed');
    });
  };

  const handleReject = () => {
    setError(null);
    startTransition(async () => {
      const result = await rejectDraftAction(draft.id);
      if (!result.ok) setError(result.reason ?? 'reject failed');
    });
  };

  const handleSaveEdit = () => {
    setError(null);
    startTransition(async () => {
      const result = await editAndApproveDraftAction(draft.id, body);
      if (!result.ok) setError(result.reason ?? 'edit failed');
      else setEditing(false);
    });
  };

  const handleRetry = () => {
    setError(null);
    startTransition(async () => {
      const result = await retrySendAction(draft.id);
      if (!result.ok) setError(result.reason ?? 'retry failed');
    });
  };

  // Visual reviewing-state accent: subtle gold-thread left border on the card.
  const articleAccent =
    draft.status === 'reviewing'
      ? 'border-l-[2px] border-l-[color:var(--assembl-gold-thread)]'
      : draft.status === 'send_failed'
      ? 'border-l-[2px] border-l-red-600'
      : draft.status === 'expired'
      ? 'border-l-[2px] border-l-[color:var(--assembl-cloud)] opacity-70'
      : '';

  return (
    <article
      className={`rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-6 ${articleAccent}`}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="font-display text-[20px] font-light text-[color:var(--text-primary)]">
            {contactLabel}
          </p>
          <p className="mt-0.5 font-mono text-[10.5px] lowercase tracking-[0.16em] text-[color:var(--text-secondary)]">
            received {formatTime(draft.created_at)}
            {draft.confidence !== null
              ? ` · confidence ${draft.confidence.toFixed(2)}`
              : ''}
          </p>
        </div>
        <span
          className={`font-mono text-[10.5px] lowercase tracking-[0.16em] ${pill.tone}`}
        >
          {pill.label}
        </span>
      </header>

      {expiringSoon ? (
        <div className="mt-3 rounded-[2px] border border-[color:var(--assembl-gold-thread)]/40 bg-[color:var(--assembl-gold-thread)]/[0.07] px-3 py-2">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--text-primary)]">
            auto-expires in {Math.ceil(hoursToExpiry ?? 0)} hours
          </p>
          <p className="mt-1 font-mono text-[10.5px] tracking-[0.04em] text-[color:var(--text-secondary)]">
            drafts that sit longer than {AUTO_EXPIRE_HOURS} hours auto-close so they don&apos;t haunt the inbox.
          </p>
        </div>
      ) : null}

      {draft.status === 'pending_approval' ? (
        <button
          type="button"
          onClick={handleMarkReviewing}
          disabled={isPending}
          className="mt-3 inline-flex items-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] disabled:opacity-50"
        >
          mark as reviewing
        </button>
      ) : null}

      {draft.incoming_body ? (
        <section className="mt-4">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            they said
          </p>
          <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-[color:var(--text-primary)]">
            {draft.incoming_body}
          </p>
        </section>
      ) : null}

      <section className="mt-5">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          tōro suggests
        </p>
        {editing ? (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            className="mt-1.5 w-full resize-y rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white p-3 font-display text-[15px] leading-relaxed text-[color:var(--text-primary)] focus:border-[color:var(--assembl-gold-thread)] focus:outline-none"
            disabled={isPending}
          />
        ) : (
          <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-[color:var(--text-primary)]">
            {draft.draft_body}
          </p>
        )}
      </section>

      {draft.status === 'send_failed' && draft.send_error ? (
        <p className="mt-3 font-mono text-[11px] tracking-[0.04em] text-red-700">
          send error · {draft.send_error}
        </p>
      ) : null}

      {draft.paymentIntent && draft.paymentIntent.status === 'requires_capture' ? (
        <section className="mt-4 rounded-[2px] border border-[color:var(--assembl-gold-thread)]/40 bg-[color:var(--assembl-gold-thread)]/[0.07] px-4 py-3">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--text-primary)]">
            payment authorisation pending
          </p>
          <p className="mt-1.5 font-display text-[20px] font-light text-[color:var(--text-primary)]">
            {formatCurrency(draft.paymentIntent.amount_cents, draft.paymentIntent.currency)}
          </p>
          <p className="mt-1 font-mono text-[11px] tracking-[0.04em] text-[color:var(--text-secondary)]">
            {draft.paymentIntent.description ?? 'tōro-initiated charge — awaiting your tap'}
          </p>
          <p className="mt-2 font-mono text-[10.5px] tracking-[0.04em] text-[color:var(--text-secondary)]">
            canon hard rule #34: your card is authorised but not captured until you confirm.
          </p>
        </section>
      ) : null}

      {error ? (
        <p className="mt-3 font-mono text-[11px] tracking-[0.06em] text-red-700">
          · {error}
        </p>
      ) : null}

      <footer className="mt-5 flex flex-wrap gap-2">
        {isInteractive && editing ? (
          <>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={isPending}
              className="inline-flex h-10 items-center rounded-[2px] bg-[color:var(--text-primary)] px-5 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--assembl-paper)] hover:opacity-90 disabled:opacity-50"
            >
              save & send
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setBody(draft.draft_body);
                setError(null);
              }}
              disabled={isPending}
              className="inline-flex h-10 items-center rounded-[2px] border border-[color:var(--assembl-cloud)] px-5 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] disabled:opacity-50"
            >
              cancel
            </button>
          </>
        ) : null}

        {isInteractive && !editing ? (
          <>
            {draft.paymentIntent && draft.paymentIntent.status === 'requires_capture' ? (
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isPending}
                className="inline-flex h-10 items-center rounded-[2px] bg-[color:var(--assembl-gold-thread)] px-5 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-primary)] hover:opacity-90 disabled:opacity-50"
              >
                confirm payment & send
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApprove}
                disabled={isPending}
                className="inline-flex h-10 items-center rounded-[2px] bg-[color:var(--text-primary)] px-5 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--assembl-paper)] hover:opacity-90 disabled:opacity-50"
              >
                approve & send
              </button>
            )}
            <button
              type="button"
              onClick={() => setEditing(true)}
              disabled={isPending}
              className="inline-flex h-10 items-center rounded-[2px] border border-[color:var(--assembl-cloud)] px-5 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-primary)] hover:bg-white disabled:opacity-50"
            >
              edit
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={isPending}
              className="inline-flex h-10 items-center rounded-[2px] border border-[color:var(--assembl-cloud)] px-5 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] disabled:opacity-50"
            >
              reject
            </button>
          </>
        ) : null}

        {draft.status === 'send_failed' ? (
          <button
            type="button"
            onClick={handleRetry}
            disabled={isPending}
            className="inline-flex h-10 items-center rounded-[2px] border border-red-600 px-5 font-mono text-[11px] uppercase tracking-[0.18em] text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            retry send
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setHistoryOpen((v) => !v)}
          className="ml-auto inline-flex h-10 items-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
        >
          {historyOpen ? 'hide history' : `history (${transitions.length})`}
        </button>
      </footer>

      {historyOpen ? (
        <section className="mt-4 border-t border-[color:var(--assembl-cloud)] pt-4">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
            transition log
          </p>
          {transitions.length === 0 ? (
            <p className="mt-2 font-mono text-[11px] tracking-[0.04em] text-[color:var(--text-secondary)]">
              no transitions recorded yet — the draft is in its initial state.
            </p>
          ) : (
            <ol className="mt-2 space-y-1.5">
              {transitions.map((t, i) => (
                <li
                  key={`${t.transitioned_at}-${i}`}
                  className="font-mono text-[11px] tracking-[0.04em] text-[color:var(--text-secondary)]"
                >
                  <span className="text-[color:var(--text-primary)]">
                    {t.from_state ?? '∅'} → {t.to_state}
                  </span>{' '}
                  · {formatTime(t.transitioned_at)}
                  {t.reason ? ` · ${t.reason}` : ''}
                </li>
              ))}
            </ol>
          )}
        </section>
      ) : null}
    </article>
  );
}
