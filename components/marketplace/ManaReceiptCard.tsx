'use client';

import { ShieldCheck } from 'lucide-react';
import { PALETTE } from '@/lib/marketplace/agents';

/**
 * Mana Receipt — the honesty layer on every Quill note.
 *
 * Quill ends each clinical note with a "### Mana Receipt" section
 * (Heard / Inferred / Corrected / Trust Map + the Privacy Act 2020 IPP 3A
 * automated-decision notice). The note body already renders that section as
 * markdown in the chat; this component is the scaffold for the dedicated
 * Mana Receipt panel in the v2 three-pane clinical workspace, where the
 * receipt is lifted out of the note and shown beside it for medico-legal
 * review and HDC defence.
 *
 * extractManaReceipt() pulls the section out of a note so the panel can show
 * it on its own. Full structured parsing (per-claim Trust Map links to
 * transcript timestamps) lands with the data model in mana_receipts_clinical.
 */

const HEADING = /(^|\n)#{1,4}\s*Mana Receipt\s*\n/i;

/** Return the Mana Receipt section of a note, or null if there isn't one. */
export function extractManaReceipt(noteMarkdown: string): string | null {
  const m = HEADING.exec(noteMarkdown);
  if (!m) return null;
  const start = m.index + m[0].length;
  // The receipt runs to the next same-or-higher heading, or the end of the note.
  const rest = noteMarkdown.slice(start);
  const next = /\n#{1,4}\s+\S/.exec(rest);
  const body = next ? rest.slice(0, next.index) : rest;
  return body.trim() || null;
}

export function ManaReceiptCard({ noteMarkdown }: { noteMarkdown: string }) {
  const receipt = extractManaReceipt(noteMarkdown);
  if (!receipt) return null;

  return (
    <section
      className="rounded-[18px] border p-4"
      style={{ borderColor: PALETTE.hairline, backgroundColor: 'rgba(255,255,255,0.92)' }}
      aria-label="Mana Receipt"
    >
      <header className="mb-2 flex items-center gap-2">
        <ShieldCheck size={16} aria-hidden style={{ color: PALETTE.ink }} />
        <h3
          className="text-sm font-bold"
          style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', color: PALETTE.ink }}
        >
          Mana Receipt
        </h3>
      </header>
      <p className="whitespace-pre-wrap text-[13px] leading-relaxed" style={{ color: PALETTE.body }}>
        {receipt}
      </p>
      <p className="mk-mono mt-3 text-[10px]" style={{ color: PALETTE.muted }}>
        Privacy Act 2020 · IPP 3A · reviewed and signed by a registered clinician
      </p>
    </section>
  );
}
