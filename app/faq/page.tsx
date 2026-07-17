import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { PatternBackdrop } from '@/components/pattern-studio/PatternBackdrop';
import { graph, faqPageNode, articleNode, breadcrumbNode, SITE_URL } from '@/lib/seo/schema';
import { FAQS } from './faq-content';
import { FaqAccordion } from './FaqAccordion';

const PUBLISHED = '2026-07-17';

export const metadata: Metadata = {
  title: 'FAQ — the questions people ask about assembl',
  description:
    'Plain answers about assembl: what it is, whether you need to be technical, what it does day to day, what it costs, where your data lives, and how it differs from an AI chatbot. Built in Aotearoa New Zealand.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ — the questions people ask about assembl',
    description: 'What assembl is, what it does, pricing, data residency, and how it differs from an AI chatbot.',
    url: `${SITE_URL}/faq`,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ — assembl',
    description: 'Plain answers about assembl, the living business operating system.',
  },
};

const MONO = 'var(--font-mono), ui-monospace, monospace';
const DISPLAY = 'var(--font-display), Georgia, serif';

export default function FaqPage() {
  const schema = graph(
    faqPageNode(
      FAQS.map((f) => ({ question: f.q, answer: f.a })),
      `${SITE_URL}/faq#faq`,
    ),
    articleNode({
      headline: 'assembl FAQ — the living business operating system, answered',
      description:
        'What assembl is, what it does day to day, pricing, data residency and privacy, and how it differs from an AI chatbot.',
      path: '/faq',
      datePublished: PUBLISHED,
    }),
    breadcrumbNode([
      { name: 'assembl', path: '/' },
      { name: 'FAQ', path: '/faq' },
    ]),
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#313c42]">
      <JsonLd data={schema} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[rgba(49,60,66,0.1)]">
        <PatternBackdrop
          className="absolute inset-0 -z-10"
          mode="halftone"
          colorRole="gold"
          opacity={0.28}
          speed={0.5}
          lazyMount={false}
        />
        <div className="mx-auto max-w-[1000px] px-5 py-14 md:px-10 md:py-20">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#8b7447]" style={{ fontFamily: MONO }}>
            Questions, answered
          </p>
          <h1
            className="mt-5 text-4xl font-light leading-[1.03] md:text-6xl"
            style={{ fontFamily: DISPLAY, letterSpacing: '-0.02em' }}
          >
            The questions people ask about <em className="not-italic text-[#3f7373]">assembl</em>.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#5a6b6f] md:text-lg">
            Plain answers about what assembl is, what it does day to day, what it costs, and where your data
            lives. Built in Aotearoa New Zealand.
          </p>
        </div>
      </section>

      {/* Accordion */}
      <section>
        <div className="mx-auto max-w-[1000px] px-5 py-12 md:px-10 md:py-16">
          <FaqAccordion items={FAQS} />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[rgba(49,60,66,0.08)] bg-[#f8f9f8]">
        <div className="mx-auto max-w-[1000px] px-5 py-16 md:px-10 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-light leading-tight md:text-4xl" style={{ fontFamily: DISPLAY }}>
              See it running on a real business.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5a6b6f] md:text-lg">
              The fastest way to understand assembl is to watch one work — a living site, its Business Genome,
              and its customer desk, all reading from the same source.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href="/living-site"
                className="inline-flex h-12 items-center rounded-full bg-[#3f7373] px-7 text-sm font-semibold text-white md:h-14 md:px-9 md:text-base"
              >
                See a living site
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-12 items-center rounded-full border border-[rgba(49,60,66,0.2)] px-7 text-sm font-semibold text-[#313c42] md:h-14 md:px-9 md:text-base"
              >
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
