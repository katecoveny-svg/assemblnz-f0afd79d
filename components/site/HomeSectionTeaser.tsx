import Link from 'next/link';
import { FadeUp } from '@/components/motion/FadeUp';

interface HomeSectionTeaserProps {
  eyebrow: string;
  headline: string | string[];
  body?: string | null;
  ctaLabel: string;
  ctaHref: string;
  primary?: boolean;
}

/**
 * Homepage section teaser — 6 sections linking to sub-pages.
 * Per Interactive Web Canon §2.1: homepage is an elevator, not a one-pager.
 * Alternates between paper and mist backgrounds (handled by section index).
 */
export function HomeSectionTeaser({
  eyebrow,
  headline,
  body,
  ctaLabel,
  ctaHref,
  primary = false,
}: HomeSectionTeaserProps) {
  const lines = Array.isArray(headline) ? headline : [headline];

  return (
    <section
      className={`border-t border-[color:var(--assembl-gold-thread)] border-opacity-30 py-20 md:py-28 ${
        primary
          ? 'bg-[color:var(--assembl-pounamu)]'
          : 'bg-[color:var(--assembl-paper)]'
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <FadeUp>
          <div className="max-w-3xl">
            <p
              className={`font-mono text-[11px] uppercase tracking-[0.32em] ${
                primary ? 'text-[color:var(--assembl-pounamu-paper)]' : 'text-[color:var(--text-secondary)]'
              }`}
            >
              {eyebrow}
            </p>

            <h2
              className={`mt-6 font-display leading-[0.96] tracking-tight ${
                primary ? 'text-[#FAF7F2]' : 'text-[color:var(--text-primary)]'
              }`}
              style={{ fontWeight: 300, fontSize: 'clamp(2rem, 3.8vw, 4rem)' }}
            >
              {lines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h2>

            {body && (
              <p
                className={`mt-6 max-w-2xl font-body text-[1.125rem] leading-relaxed ${
                  primary ? 'text-[color:var(--assembl-pounamu-paper)]' : 'text-[color:var(--text-body)]'
                }`}
              >
                {body}
              </p>
            )}

            <div className="mt-8">
              <Link
                href={ctaHref}
                className={`inline-flex h-12 items-center rounded-full px-7 text-sm transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 md:text-base ${
                  primary
                    ? 'bg-[#FAF7F2] font-medium text-[color:var(--assembl-pounamu)] focus-visible:outline-[#FAF7F2]'
                    : 'border border-[color:var(--assembl-gold-thread)] text-[color:var(--text-primary)] focus-visible:outline-[color:var(--assembl-gold-thread)]'
                }`}
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
