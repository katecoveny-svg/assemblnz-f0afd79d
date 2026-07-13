import type { ReactNode } from 'react';

/**
 * KeteDefinition — first-mention disclosure for the word "kete".
 *
 * Use ONCE per page, on the first time "kete" appears in body copy on a
 * marketing/landing surface. Renders an accessible <details>/<summary> so it
 * works without JavaScript and never auto-expands. The definition wording is
 * Kate's exact text — do not paraphrase.
 *
 * Usage:
 *   the whole industry <KeteDefinition /> — every agent, every workflow
 *   <KeteDefinition>kete pack</KeteDefinition>  // custom trigger label
 */
export function KeteDefinition({ children }: { children?: ReactNode }) {
  return (
    <details className="group inline align-baseline [&_summary::-webkit-details-marker]:hidden">
      <summary
        className="inline cursor-pointer list-none rounded-sm underline decoration-dotted decoration-[color:var(--assembl-pounamu)] decoration-1 underline-offset-4 transition-colors hover:text-[color:var(--assembl-pounamu)] focus-visible:text-[color:var(--assembl-pounamu)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        aria-label="What is a kete?"
      >
        {children ?? 'kete'}
      </summary>
      <span className="mt-3 block rounded-[14px] border border-[rgba(58,56,50,0.18)] bg-[rgba(58,56,50,0.05)] px-4 py-3 text-body-sm not-italic text-[color:var(--text-body)]">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]">
          /ˈkɛteɪ/
        </span>{' '}
        <span lang="mi">Kete</span> is the traditional Māori word for a hand-woven carrying basket.
        Typically made from indigenous plants like harakeke (New Zealand flax), these baskets are
        culturally significant taonga (treasures) that symbolize the carrying of knowledge, wisdom,
        and life-sustaining resources.
      </span>
    </details>
  );
}
