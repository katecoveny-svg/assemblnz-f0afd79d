'use client';

import { FadeIn } from '@/lib/motion';
import type { ManaReceipt } from './types';

/**
 * Mana Receipt — the audit-trail receipt Assembl issues for material actions.
 * Rendered as a card in the ops shell's right rail.
 */
export function ManaReceiptViewer({ receipt }: { receipt: ManaReceipt | null }) {
  if (!receipt) {
    return (
      <FadeIn className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-4">
        <h4 className="text-sm font-semibold text-[color:var(--brand-ink)]">
          Mana Receipt
        </h4>
        <p className="mt-1 text-xs text-[color:var(--brand-muted)]">
          Nothing to attest to yet.
        </p>
      </FadeIn>
    );
  }
  return (
    <FadeIn className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-4">
      <div className="flex items-baseline justify-between">
        <h4 className="text-sm font-semibold text-[color:var(--brand-ink)]">
          Mana Receipt
        </h4>
        <span className="text-[12px] uppercase tracking-wider text-[color:var(--brand-muted)]">
          {receipt.kind}
        </span>
      </div>
      <div className="mt-1 font-mono text-[12px] text-[color:var(--brand-muted)]">
        {receipt.id}
      </div>
      <p className="mt-2 text-sm text-[color:var(--brand-ink)]">{receipt.note}</p>
      <div className="mt-2 text-[12px] text-[color:var(--brand-muted)]">
        Issued {new Date(receipt.at).toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' })}
      </div>
      {receipt.evidence && receipt.evidence.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {receipt.evidence.map((e, i) => (
            <li key={i} className="truncate text-[12px] text-[color:var(--brand-accent)]">
              · {e}
            </li>
          ))}
        </ul>
      ) : null}
    </FadeIn>
  );
}
