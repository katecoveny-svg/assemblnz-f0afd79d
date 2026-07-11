import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  graph,
  faqPageNode,
  articleNode,
  breadcrumbNode,
  SITE_URL,
} from '@/lib/seo/schema';
import { FAQ_SECTIONS, ALL_FAQS, COMPARISON } from './faq-content';

const PUBLISHED = '2026-07-01';

export const metadata: Metadata = {
  title: 'FAQ — the questions people ask about assembl',
  description:
    'Plain answers to the questions people ask about assembl: what it is, who it is for, how much it costs, where your data lives, and how it differs from a general AI chatbot. Built in Aotearoa New Zealand.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ — the questions people ask about assembl',
    description:
      'What assembl is, who it is for, pricing, data residency, and how it differs from a general AI chatbot.',
    url: `${SITE_URL}/faq`,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ — assembl',
    description: 'Plain answers about the New Zealand AI agent marketplace.',
  },
};

const MONO = 'var(--font-mono), ui-monospace, monospace';
const DISPLAY = 'var(--font-display), Georgia, serif';

export default function FaqPage() {
  const schema = graph(
    faqPageNode(
      ALL_FAQS.map((f) => ({ question: f.q, answer: f.a })),
      `${SITE_URL}/faq#faq`,
    ),
    articleNode({
      headline: 'assembl FAQ — the New Zealand AI agent marketplace, answered',
      description:
        'What assembl is, who it is for, pricing, data residency and privacy, and how it differs from a general AI chatbot.',
      path: '/faq',
      datePublished: PUBLISHED,
    }),
    breadcrumbNode([
      { name: 'assembl', path: '/' },
      { name: 'FAQ', path: '/faq' },
    ]),
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FFF7EC] text-[color:var(--text-primary)]">
      <JsonLd data={schema} />

      {/* Hero */}
      <section className="border-b border-[rgba(35,33,31,0.08)]">
        <div className="mx-auto max-w-[1100px] px-5 py-14 md:px-10 md:py-20">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#9A8E72]" style={{ fontFamily: MONO }}>
            001 — Questions, answered
          </p>
          <h1
            className="mt-5 text-4xl font-light leading-[1.05] text-[color:var(--text-primary)] md:text-6xl"
            style={{ fontFamily: DISPLAY }}
          >
            The questions people ask about <em className="not-italic text-[color:var(--assembl-pounamu)]">assembl</em>.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#5F5A55] md:text-lg">
            Plain answers about what assembl is, who it is for, what it costs, and where your data lives — for
            people and, increasingly, for the AI assistants they ask. assembl is an AI platform built in
            Aotearoa New Zealand: a marketplace of specialist agents that draft the admin work, keep a named
            person in the loop, and seal every output with an evidence pack.
          </p>
        </div>
      </section>

      {/* Q&A sections */}
      <section>
        <div className="mx-auto max-w-[1100px] px-5 py-14 md:px-10 md:py-20">
          <div className="space-y-16">
            {FAQ_SECTIONS.map((section) => (
              <div key={section.heading}>
                <h2
                  className="text-2xl font-light text-[color:var(--text-primary)] md:text-3xl"
                  style={{ fontFamily: DISPLAY }}
                >
                  {section.heading}
                </h2>
                <dl className="mt-8 space-y-8">
                  {section.items.map((item) => (
                    <div key={item.q} className="border-t border-[rgba(35,33,31,0.12)] pt-6">
                      <dt className="text-lg font-medium text-[color:var(--text-primary)] md:text-xl">
                        {item.q}
                      </dt>
                      <dd className="mt-3 max-w-3xl text-base leading-relaxed text-[#5F5A55] md:text-lg">
                        {item.a}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table — a citable chunk */}
      <section className="border-t border-[rgba(35,33,31,0.08)] bg-[#F4EFE7]">
        <div className="mx-auto max-w-[1100px] px-5 py-14 md:px-10 md:py-20">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#9A8E72]" style={{ fontFamily: MONO }}>
            002 — Compared
          </p>
          <h2
            className="mt-5 text-2xl font-light text-[color:var(--text-primary)] md:text-4xl"
            style={{ fontFamily: DISPLAY }}
          >
            {COMPARISON.title}
          </h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr>
                  {COMPARISON.columns.map((c, i) => (
                    <th
                      key={i}
                      className="border-b border-[rgba(35,33,31,0.2)] px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-[#625A52]"
                      style={{ fontFamily: MONO }}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.rows.map((row) => (
                  <tr key={row[0]}>
                    <th
                      scope="row"
                      className="border-b border-[rgba(35,33,31,0.1)] px-4 py-4 align-top text-sm font-medium text-[color:var(--text-primary)]"
                    >
                      {row[0]}
                    </th>
                    <td className="border-b border-[rgba(35,33,31,0.1)] px-4 py-4 align-top text-sm text-[color:var(--text-primary)]">
                      {row[1]}
                    </td>
                    <td className="border-b border-[rgba(35,33,31,0.1)] px-4 py-4 align-top text-sm text-[#8A8678]">
                      {row[2]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-[1100px] px-5 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              className="text-3xl font-light leading-tight text-[color:var(--text-primary)] md:text-5xl"
              style={{ fontFamily: DISPLAY }}
            >
              Still deciding? Start free with Atlas.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5F5A55] md:text-lg">
              Atlas is the free AI adoption coach. It maps your week and points you to the agents that fit —
              honestly, including where AI will not help.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href="/living-site"
                className="inline-flex h-12 items-center rounded-full bg-[color:var(--assembl-pounamu)] px-7 text-sm font-medium text-[#FFF7EC] md:h-14 md:px-9 md:text-base"
              >
                See a living site
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-12 items-center rounded-full border border-[rgba(35,33,31,0.2)] px-7 text-sm font-medium text-[color:var(--text-primary)] md:h-14 md:px-9 md:text-base"
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
