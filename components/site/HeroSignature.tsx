import type { ReactNode } from 'react';

export function HeroSignature({
  eyebrow = 'assembl evidence vessel',
  children = 'Built in Aotearoa. Proven in the record.',
  className = '',
}: {
  eyebrow?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`inline-flex flex-wrap items-center gap-3 ${className}`}>
      <span className="rounded-full border border-[rgba(43,107,87,0.22)] bg-white/45 px-3 py-1 font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
        {eyebrow}
      </span>
      <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
        {children}
      </span>
    </div>
  );
}
