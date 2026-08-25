import type { ReactNode } from 'react';

export function NumberedChapter({
  number,
  title,
  children,
  eyebrow = 'Chapter',
  className = '',
}: {
  number: string | number;
  title: ReactNode;
  children?: ReactNode;
  eyebrow?: string;
  className?: string;
}) {
  const padded = typeof number === 'number' ? String(number).padStart(2, '0') : number;

  return (
    <section className={`grid gap-6 border-t border-[rgba(35,33,31,0.10)] pt-8 md:grid-cols-[10rem_1fr] ${className}`}>
      <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
        {eyebrow} {padded}
      </div>
      <div>
        <h2 className="font-display text-display-md font-light text-[color:var(--text-primary)]">
          {title}
        </h2>
        {children && <div className="mt-5 max-w-3xl text-body-lg text-[color:var(--text-body)]">{children}</div>}
      </div>
    </section>
  );
}
