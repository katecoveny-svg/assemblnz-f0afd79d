import { KETE_COMPLIANCE } from '@/lib/kete-compliance';
import type { KeteSlug } from '@/lib/kete';

export function ComplianceChips({ kete }: { kete: KeteSlug }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Compliance frameworks">
      {KETE_COMPLIANCE[kete].map((chip) => (
        <li
          key={chip}
          className="rounded-full border border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-paper)] px-2 py-1 font-mono text-[12px] leading-none text-[color:var(--text-primary)]"
        >
          {chip}
        </li>
      ))}
    </ul>
  );
}

