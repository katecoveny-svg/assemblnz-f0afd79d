'use client';

import { useState, useTransition } from 'react';
import {
  approveDraftAction,
  editAndApproveDraftAction,
  rejectDraftAction,
} from './actions';

export interface DraftRowData {
  id: string;
  contact_name: string | null;
  contact_identifier: string | null;
  incoming_body: string | null;
  draft_body: string;
  confidence: number | null;
  created_at: string;
  chatwoot_conversation_id: number;
}

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

export function DraftRow({ draft }: { draft: DraftRowData }) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(draft.draft_body);
  const [error, setError] = useState<string | null>(null);

  const contactLabel =
    draft.contact_name ??
    draft.contact_identifier ??
    `Conversation #${draft.chatwoot_conversation_id}`;

  const handleApprove = () => {
    setError(null);
    startTransition(async () => {
      const result = await approveDraftAction(draft.id);
      if (!result.ok) setError(result.reason ?? 'approve failed');
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

  return (
    <article className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-6">
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
        <span className="font-mono text-[10.5px] lowercase tracking-[0.16em] text-[color:var(--assembl-gold-thread)]">
          pending approval
        </span>
      </header>

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

      {error ? (
        <p className="mt-3 font-mono text-[11px] tracking-[0.06em] text-red-700">
          · {error}
        </p>
      ) : null}

      <footer className="mt-5 flex flex-wrap gap-2">
        {editing ? (
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
        ) : (
          <>
            <button
              type="button"
              onClick={handleApprove}
              disabled={isPending}
              className="inline-flex h-10 items-center rounded-[2px] bg-[color:var(--text-primary)] px-5 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--assembl-paper)] hover:opacity-90 disabled:opacity-50"
            >
              approve & send
            </button>
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
        )}
      </footer>
    </article>
  );
}
