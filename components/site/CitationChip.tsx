import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function CitationChip({
  children,
  accent = 'var(--assembl-pounamu)',
  href,
}: {
  children: ReactNode;
  accent?: string;
  href?: string;
}) {
  const baseClasses =
    'inline-flex max-w-full items-center gap-2 rounded-full border bg-white/55 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)] transition-all';

  if (href) {
    return (
      <a
        href={href}
        className={cn(
          baseClasses,
          'hover:bg-white/80 hover:text-[color:var(--text-primary)] hover:shadow-sm focus-visible:bg-white/80 focus-visible:text-[color:var(--text-primary)] focus-visible:shadow-sm focus-visible:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--assembl-pounamu)] focus-visible:outline-offset-2',
        )}
        style={{ borderColor: `${accent}55` }}
      >
        <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
        <span className="truncate">{children}</span>
      </a>
    );
  }

  return (
    <span className={baseClasses} style={{ borderColor: `${accent}55` }}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
      <span className="truncate">{children}</span>
    </span>
  );
}
