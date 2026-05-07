import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionReveal } from '@/components/SectionReveal';
import { footerDisclaimer } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description:
    'assembl produces drafts and evidence packs. We do not provide legal, tax, or medical advice. Full Phase 1B disclaimer landing soon.',
};

export default function DisclaimerPage() {
  return (
    <section className="relative overflow-hidden bg-[color:var(--assembl-paper)]">
      <div className="container py-24 md:py-32">
        <div className="mx-auto max-w-3xl">
          <SectionReveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              Legal · Disclaimer
            </p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h1
              className="mt-6 font-display leading-[0.98] tracking-tight"
              style={{ fontWeight: 300, fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)' }}
            >
              Disclaimer.
            </h1>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <p className="mt-10 text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
              {footerDisclaimer}
            </p>
            <p className="mt-6 text-sm leading-relaxed text-[color:var(--text-secondary)]">
              This page is a placeholder for Phase 1B. The full disclaimer — covering plain-English
              limitations, source disclosure, reviewer responsibility, and indemnity — will land
              before public launch. Until then, the line above is the operative position.
            </p>
            <p className="mt-10 font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              Questions?{' '}
              <Link
                href="/contact"
                className="underline-offset-2 hover:text-[color:var(--assembl-pounamu)] hover:underline"
              >
                Contact us
              </Link>
            </p>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
