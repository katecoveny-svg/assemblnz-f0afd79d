import type { ReactNode } from 'react';

export function PullQuote({
  children,
  cite,
  accent = 'var(--assembl-pounamu)',
  className = '',
}: {
  children: ReactNode;
  cite?: ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <figure className={`border-l pl-6 ${className}`} style={{ borderColor: accent }}>
      <blockquote className="font-display text-display-md font-light leading-[1.08] tracking-[-0.01em] text-[color:var(--text-primary)]">
        {children}
      </blockquote>
      {cite && (
        <figcaption className="mt-5 font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
          {cite}
        </figcaption>
      )}
    </figure>
  );
}
