'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * TrustStrip — narrow band of mono-caps proof points sitting directly under the
 * hero. Closes the dead space between HeroSignature and the section teasers.
 *
 * Items come from `reo.trustStrip` (locked Phase 1 copy).
 */
export function TrustStrip({ items }: { items: readonly string[] }) {
  const reduce = useReducedMotion();

  return (
    <section
      aria-label="Proof points"
      className="relative border-y border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)] py-10 md:py-14"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <motion.ul
          initial={reduce ? false : { opacity: 0.6, y: 12 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5 md:justify-between md:gap-x-8"
        >
          {items.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)] md:text-[12px]"
            >
              <span
                aria-hidden
                className="h-1 w-1 rounded-full bg-[color:var(--assembl-pounamu)]"
              />
              {item}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
