import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { palette, typography } from '@assembl/canvas/tokens';
import { MicroLabel } from '@assembl/canvas';
import { HeroArt } from '@/components/v2/HeroArt';
import { MottoStrip } from '@/components/v2/V2Chrome';
import { JsonLd } from '@/components/seo/JsonLd';
import { graph, articleNode, breadcrumbNode, personNode, SITE_URL } from '@/lib/seo/schema';
import styles from '@/components/v2/v2.module.css';

export const metadata: Metadata = {
  title: 'about — assembl',
  description:
    'assembl is an ai platform built in aotearoa new zealand, founded by kate hudson. agents draft, people decide, and every output carries the record of how it was made.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'about assembl',
    description:
      'built in aotearoa, founded by kate hudson. agents draft, people decide, and every output carries its receipt.',
    url: `${SITE_URL}/about`,
    type: 'article',
  },
};

const ABOUT_SCHEMA = graph(
  articleNode({
    headline: 'What assembl is — an AI marketplace built in Aotearoa New Zealand',
    description:
      'assembl is an AI platform built in Aotearoa New Zealand that solves the real reason AI adoption stalls in New Zealand businesses: not the technology, but trust and uptake. Founded by Kate Hudson.',
    path: '/about',
    datePublished: '2026-07-01',
  }),
  personNode(),
  breadcrumbNode([
    { name: 'assembl', path: '/' },
    { name: 'About', path: '/about' },
  ]),
);

/**
 * /about — the founding story in the locked direction. English-first,
 * tikanga-lite: te reo appears only where it earns its place (mahi, whānau,
 * the Te Tiriti statement link). Founder is Kate Hudson — always.
 */

const STEPS = [
  ['agents draft it.', 'The slow, repetitive writing, done in seconds.'],
  ['you decide.', 'Nothing sends or publishes until a named person approves it.'],
  [
    'you get the receipts.',
    'Every output comes with an evidence pack — the sources used, the assumptions made, and who signed off.',
  ],
] as const;

export default function AboutPage() {
  const body: React.CSSProperties = {
    fontFamily: typography.body.fontFamily,
    fontSize: 15,
    lineHeight: typography.body.lineHeight,
    color: palette.bodyGrey,
  };

  return (
    <div className={styles.page}>
      <JsonLd data={ABOUT_SCHEMA} />

      {/* ── hero: story left, founder portrait right ─────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
          <HeroArt constellation={false} />
        </div>
        <div className={styles.section} style={{ position: 'relative', paddingBottom: 48 }}>
          <div className={`${styles.inner} ${styles.detail}`} style={{ alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
                  •
                </span>
                <MicroLabel>about assembl</MicroLabel>
              </div>
              <h1 className={styles.h1} style={{ marginTop: 18, maxWidth: 560 }}>
                less admin. more mahi
                <span aria-hidden style={{ color: palette.accentGold }}>
                  .
                </span>
              </h1>
              <p style={{ ...body, marginTop: 22, maxWidth: 480 }}>
                Document-heavy work eats people&apos;s days. The reports, the customs entries, the
                notices, the compliance paperwork — hours that should go to the actual job, or home
                to your whānau.
              </p>
              <p style={{ ...body, marginTop: 14, maxWidth: 480 }}>
                assembl takes that load off. Specialist agents write the first draft; someone on
                your team checks it and signs it off. Every piece of work carries a plain record of
                how it was made — so you can trust it, file it, or hand it on.
              </p>
            </div>
            <div
              style={{
                position: 'relative',
                aspectRatio: '4 / 5',
                maxWidth: 420,
                width: '100%',
                justifySelf: 'center',
                borderRadius: 16,
                overflow: 'hidden',
                border: `1px solid ${palette.hairline}`,
                boxShadow: '0 24px 70px rgba(26, 25, 24, 0.10)',
              }}
            >
              <Image
                src="/img/about/kate-hudson-portrait-tan-blazer-art.webp"
                alt="Kate Hudson, founder of assembl"
                fill
                priority
                sizes="(min-width: 1000px) 420px, 100vw"
                quality={82}
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── what assembl is ──────────────────────────────────────────── */}
      <section className={styles.section} style={{ paddingTop: 24 }}>
        <div className={`${styles.inner} rise`} style={{ maxWidth: 760 }}>
          <MicroLabel as="h2">what assembl is</MicroLabel>
          <p
            style={{
              fontFamily: typography.display.fontFamily,
              fontWeight: typography.display.fontWeightMin,
              fontSize: 'clamp(1.4rem, 2.6vw, 1.8rem)',
              lineHeight: 1.45,
              color: palette.ink,
              marginTop: 18,
              marginBottom: 0,
            }}
          >
            assembl is an AI platform built in Aotearoa that solves the real reason AI adoption
            stalls in NZ businesses: not the technology, but trust and uptake. Purpose-built agents
            do one ordinary job each and produce a reviewable result in minutes — no prompting to
            learn, no tools to switch.
          </p>
          <p style={{ ...body, marginTop: 20 }}>
            Every output is draft-only and reviewed by a named human before it ships, with an
            auditable trail — the Mana Receipts provenance layer — and privacy designed to the
            Privacy Act 2020, including IPP 3A. One public win becomes a private, branded tool for
            that team, then a repeatable internal system.
          </p>
        </div>
      </section>

      {/* ── how it works ─────────────────────────────────────────────── */}
      <section className={styles.section} style={{ paddingTop: 12 }}>
        <div className={`${styles.inner} rise`}>
          <MicroLabel as="h2">how it works</MicroLabel>
          <ol
            style={{
              listStyle: 'none',
              margin: '24px 0 0',
              padding: 0,
              display: 'grid',
              gap: 20,
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            }}
          >
            {STEPS.map(([title, copy], i) => (
              <li
                key={title}
                style={{
                  borderTop: `1px solid ${palette.hairline}`,
                  paddingTop: 18,
                }}
              >
                <MicroLabel>
                  step {i + 1}{' '}
                  <span aria-hidden style={{ color: palette.accentGold }}>
                    •
                  </span>
                </MicroLabel>
                <h3
                  style={{
                    fontFamily: typography.display.fontFamily,
                    fontWeight: typography.display.fontWeight,
                    fontSize: 24,
                    textTransform: 'lowercase',
                    margin: '10px 0 0',
                    color: palette.ink,
                  }}
                >
                  {title}
                </h3>
                <p style={{ ...body, fontSize: 13.5, marginTop: 8, marginBottom: 0 }}>{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── from the founder ─────────────────────────────────────────── */}
      <section className={styles.section} style={{ paddingTop: 12 }}>
        <div className={`${styles.inner} rise`} style={{ maxWidth: 760 }}>
          <MicroLabel as="h2">from the founder</MicroLabel>
          <blockquote
            style={{
              fontFamily: typography.display.fontFamily,
              fontWeight: typography.display.fontWeightMin,
              fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
              lineHeight: 1.3,
              color: palette.ink,
              margin: '18px 0 0',
            }}
          >
            &ldquo;I started assembl to give people their time back — for the work that matters,
            and the life around it.&rdquo;
          </blockquote>
          <MicroLabel style={{ display: 'block', marginTop: 14 }}>
            kate hudson · founder
          </MicroLabel>
          <p style={{ ...body, marginTop: 22 }}>
            Built for Aotearoa: NZ law, council and sector rules, and tikanga are in from the
            start, not bolted on. Read the{' '}
            <Link href="/te-tiriti" style={{ color: palette.ink }}>
              Te Tiriti statement
            </Link>{' '}
            and the{' '}
            <Link href="/trust" style={{ color: palette.ink }}>
              trust page
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── cta ──────────────────────────────────────────────────────── */}
      <section className={styles.section} style={{ paddingTop: 12, paddingBottom: 40 }}>
        <div
          className={`${styles.inner} rise`}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 22, alignItems: 'center' }}
        >
          <Link href="/agents" className={styles.navCta} style={{ padding: '11px 22px' }}>
            explore the marketplace
            <span aria-hidden style={{ color: palette.accentGold, fontSize: 15, lineHeight: 1 }}>
              •
            </span>
          </Link>
          <Link
            href="/pilot-sprint"
            className={styles.navLink}
            style={{ borderBottom: `1px solid ${palette.hairline}`, paddingBottom: 2 }}
          >
            or start with a pilot in 30 days
          </Link>
        </div>
      </section>

      <MottoStrip />
    </div>
  );
}
