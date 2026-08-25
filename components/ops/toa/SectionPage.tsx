import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * SectionPage — shared chrome for the six TOA ops sections. Keeps every
 * sub-page to: title, one plain-English line on what ARC does here, content.
 */
export function SectionPage({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-md border border-dashed border-[color:var(--brand-accent)]/40 bg-[color:var(--brand-canary)]/25 px-3 py-1.5 text-[12px] text-[color:var(--brand-ink)]">
        concept demo · fictional data — what a TOA × assembl operating system
        could look like.
      </div>
      <div>
        <Link
          href="/customers/toa-architects/ops"
          className="text-xs text-[color:var(--brand-muted)] hover:text-[color:var(--brand-ink)]"
        >
          ← dashboard
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-brand-display)] text-xl font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-ink)]">
          {title}
        </h1>
        <p className="mt-1 max-w-xl text-sm text-[color:var(--brand-muted)]">{lede}</p>
      </div>
      {children}
    </div>
  );
}
