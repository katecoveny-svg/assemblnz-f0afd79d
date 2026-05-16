import type { ReactNode } from 'react';

export function CitationChip({
  children,
  accent = 'var(--assembl-pounamu)',
  href,
}: {
  children: ReactNode;
  accent?: string;
  href?: string;
}) {
  const className =
    'inline-flex max-w-full items-center gap-2 rounded-full border bg-white/55 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--text-primary)]';

  if (href) {
    return (
      <a className={className} href={href} style={{ borderColor: `${accent}55` }}>
        <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
        <span className="truncate">{children}</span>
      </a>
    );
  }

  return (
    <span className={className} style={{ borderColor: `${accent}55` }}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
      <span className="truncate">{children}</span>
    </span>
  );
}
