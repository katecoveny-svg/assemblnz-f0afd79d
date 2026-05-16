import type { ReactNode } from 'react';
import { HeroSignature } from '@/components/site/HeroSignature';
import { HairlineRule } from '@/components/site/HairlineRule';

export function HeroPage({
  title,
  subtitle,
  signature,
  actions,
  media,
  children,
  className = '',
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  signature?: ReactNode;
  actions?: ReactNode;
  media?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`relative overflow-hidden bg-[color:var(--assembl-paper)] px-6 py-24 text-[color:var(--text-primary)] lg:py-32 ${className}`}>
      <div className="mx-auto grid max-w-[1500px] items-end gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.62fr)]">
        <div>
          {signature ?? <HeroSignature />}
          <h1 className="mt-8 max-w-[12ch] font-display text-display-xl font-light text-[color:var(--text-primary)]">
            {title}
          </h1>
          {subtitle && <div className="mt-6 max-w-2xl text-body-lg text-[color:var(--text-body)]">{subtitle}</div>}
          {actions && <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
        {media && <div className="lg:justify-self-end">{media}</div>}
      </div>
      {children && <div className="mx-auto mt-16 max-w-[1500px]">{children}</div>}
      <HairlineRule className="mx-auto mt-16 max-w-[1500px]" />
    </section>
  );
}
