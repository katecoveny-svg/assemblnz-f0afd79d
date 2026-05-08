import { HERO_COPY } from '@/lib/site-config';

/**
 * 4 mono-caps proof points separated by ·
 * Per Interactive Web Canon §6 / Reo Phase 1 §1.
 */
export function TrustStrip() {
  const items = HERO_COPY.trustStrip.split(' · ');
  return (
    <div
      className="border-t border-[color:var(--assembl-gold-thread)] bg-[color:var(--assembl-mist)]"
      aria-label="Trust credentials"
    >
      <div className="mx-auto max-w-7xl px-6 py-4 md:px-12">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-start">
          {items.map((item, i) => (
            <li
              key={i}
              className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]"
            >
              {item.trim()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
