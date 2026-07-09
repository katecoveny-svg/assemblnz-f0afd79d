'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { OsScrollReveal } from '@/components/ops/shared/OsMotion';

/**
 * Client half of OpsShell — hover-lift sidebar + scroll-reveal main column.
 */
export function OpsShellClient({
  slug,
  nav,
  greeting,
  accent,
  shellPattern,
  rightRail,
  children,
}: {
  slug: string;
  nav: Array<[string, string]>;
  greeting: string;
  accent: string;
  shellPattern: string | null;
  rightRail?: ReactNode;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="relative z-[1] grid grid-cols-12 gap-6 px-6 py-6">
      <aside className="col-span-12 md:col-span-2">
        <nav className="sticky top-6 flex flex-col gap-1.5 text-sm">
          {nav.map(([label, path], i) => {
            const href =
              path.startsWith('#') || path.startsWith('?')
                ? `/customers/${slug}/ops${path}`
                : `/customers/${slug}/ops/${path}`;
            const link = (
              <Link
                href={href}
                className="block rounded-xl px-3 py-2.5 text-[color:var(--brand-muted)] transition-colors hover:bg-black/5 hover:text-[color:var(--brand-ink)]"
                style={{ borderLeft: `2px solid transparent` }}
              >
                {label}
              </Link>
            );
            if (reduce) return <div key={path || label}>{link}</div>;
            return (
              <motion.div
                key={path || label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i, duration: 0.4 }}
                whileHover={{ x: 4, borderColor: accent }}
              >
                {link}
              </motion.div>
            );
          })}
        </nav>
      </aside>

      <main
        className="relative col-span-12 flex flex-col gap-6 md:col-span-7"
        style={
          shellPattern
            ? {
                backgroundImage: `url(${shellPattern})`,
                backgroundRepeat: 'repeat',
                backgroundSize: '360px auto',
                backgroundColor: 'var(--brand-bg)',
              }
            : undefined
        }
      >
        {shellPattern ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 rounded-3xl"
            style={{ backgroundColor: 'var(--brand-bg)', opacity: 0.92 }}
          />
        ) : null}
        <OsScrollReveal>
          <div
            className="relative overflow-hidden rounded-2xl border border-black/5 bg-[color:var(--brand-surface)]/75 px-4 py-3 text-sm text-[color:var(--brand-muted)] shadow-sm backdrop-blur-md"
          >
            <span
              aria-hidden
              className="mr-2 inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: accent, boxShadow: `0 0 0 4px ${accent}33` }}
            />
            {greeting}
          </div>
        </OsScrollReveal>
        <div className="relative flex flex-col gap-6">{children}</div>
      </main>

      <aside className="col-span-12 flex flex-col gap-4 md:col-span-3">
        <OsScrollReveal delay={0.1}>{rightRail}</OsScrollReveal>
      </aside>
    </div>
  );
}
