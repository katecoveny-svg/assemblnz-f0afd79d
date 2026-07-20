import type { CSSProperties } from 'react';
import { CONCEPT_CHIPS } from '@/lib/copy/editorial-home';

type ConceptId = keyof typeof CONCEPT_CHIPS;

/**
 * Tiny inline visual card slotted between words in the hero H1 — the
 * designbyshiv "photo strip as punctuation" trick, translated to the three
 * concept-demo installations Kate points to from the editorial homepage.
 *
 * Kept deliberately low-fi: a flat colour block with the brand accent
 * bar and the concept name in Space Mono. Reads as a "torn magazine
 * clipping" against the massive Archivo Black type around it.
 */
export function InlineDemoChip({ id }: { id: ConceptId }) {
  const chip = CONCEPT_CHIPS[id];
  const style: CSSProperties = {
    backgroundColor: chip.color,
    color: chip.accent,
    fontFamily: 'var(--font-mono)',
  };
  return (
    <a
      href={chip.href}
      target="_blank"
      rel="noreferrer noopener"
      style={style}
      className="mx-1 sm:mx-2 inline-flex h-[0.58em] max-w-full items-center gap-[0.35em] rounded-[0.1em] px-[0.35em] align-middle text-[0.22em] font-bold uppercase tracking-[0.14em] shadow-[0_0.04em_0.12em_rgba(26,25,24,0.18)] transition-transform hover:-rotate-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-ink,#1A1918)] focus-visible:ring-offset-2"
      aria-label={`Concept demo — ${chip.label}`}
    >
      <span
        aria-hidden
        className="inline-block h-[0.28em] w-[0.28em] rounded-full"
        style={{ backgroundColor: chip.accent }}
      />
      <span className="whitespace-nowrap">{chip.label}</span>
    </a>
  );
}
