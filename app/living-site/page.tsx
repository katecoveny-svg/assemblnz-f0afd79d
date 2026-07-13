import type { Metadata } from 'next';
import Link from 'next/link';
import { palette } from '@assembl/canvas/tokens';
import { MicroLabel } from '@assembl/canvas';
import { BusinessGenome } from '@/components/ops/fred/BusinessGenome';
import { MorningBrief } from '@/components/ops/fred/MorningBrief';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { KineticHero } from '@/components/v2/home/hero-particles/KineticHero';
import { Reveal } from '@/components/site/Reveal';
import { MagneticButton } from '@/components/site/MagneticButton';
import { getBrandFonts } from '@/lib/brand/fonts';
import { getLiveGenomeFacts } from '@/lib/customers/auckland-dog-trainer/genome-store';
import { SAMPLE_VERTICALS } from '@/lib/living-site/verticals';
import styles from '@/components/v2/home/home.module.css';

// The genome is read from the database on every request — a fact edited in
// Supabase shows up here on the next load. That's the point.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'a living site, live — inside a real business OS · assembl',
  description:
    'Step inside a Living Site: an Auckland dog-training business running on one source of truth. Touch the Business Genome, approve the morning brief — everything here is interactive.',
  alternates: { canonical: '/living-site' },
};

/**
 * The public, ungated slice of the Sam demo — where the homepage's
 * "watch a business come alive" story ends in something a visitor can touch.
 * Sample data only; the full console stays behind guided-demo invites.
 */
export default async function LivingSitePage() {
  const { facts, live } = await getLiveGenomeFacts();
  const fonts = getBrandFonts('auckland-dog-trainer');
  const brandVars = `${fonts.display.variable} ${fonts.body.variable} ${fonts.mono.variable}`;

  // Pearl glass (design canon vNext) — white panel, hairline, soft shadow.
  const frame: React.CSSProperties = {
    background: '#fbfbfc',
    border: '1px solid #ececef',
    borderRadius: 22,
    padding: 'clamp(14px, 3vw, 34px)',
    boxShadow: '0 1px 2px rgba(38, 38, 43, 0.04), 0 24px 60px rgba(38, 38, 43, 0.07)',
  };

  return (
    <div style={{ background: palette.paper }}>
      {/* ── intro ─────────────────────────────────────────────────────── */}
      <section className={styles.section} style={{ paddingBottom: 24 }}>
        <div className={styles.inner}>
          <Reveal>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 24,
              }}
            >
              <div className={styles.sectionHead} style={{ flex: '1 1 420px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
                    •
                  </span>
                  <MicroLabel as="h2">a living site · live demo</MicroLabel>
                </div>
                <p className={styles.h2} style={{ marginTop: 16 }}>
                  this is a living site
                  <span aria-hidden style={{ color: palette.accentGold }}>
                    .
                  </span>
                </p>
                <p className={styles.sectionLede}>
                  One business. One source of truth. Every surface reads it.
                  Sample business — real system. Go on: change a price, approve the brief.
                </p>
              </div>
              {/* the genome itself — the living particle sculpture, morphing
                  through its formations; click through to the interactive view */}
              <Link href="/genome" aria-label="Explore the Business Genome in 3D" style={{ flex: '0 1 420px', margin: '0 auto' }}>
                <span style={{ display: 'block', width: '100%', minWidth: 280, height: 340, overflow: 'hidden', borderRadius: 26 }}>
                  <KineticHero />
                </span>
              </Link>
            </div>
          </Reveal>
          <div
            style={
              {
                // DemoRibbon reads --brand-* vars, normally set by the ops
                // shell — pearl values here (canon vNext).
                '--brand-accent': '#c2a15f',
                '--brand-canary': '#c2a15f',
                '--brand-ink': '#26262b',
              } as React.CSSProperties
            }
          >
            <DemoRibbon />
          </div>
        </div>
      </section>

      {/* ── the genome — change once, everything updates ──────────────── */}
      <section className={styles.section} style={{ paddingTop: 28 }}>
        <div className={styles.inner}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
                •
              </span>
              <MicroLabel as="h2">one · the business genome</MicroLabel>
            </div>
          </Reveal>
          <div className={brandVars} style={frame}>
            <BusinessGenome facts={facts} live={live} tone="pearl" />
          </div>
        </div>
      </section>

      {/* ── the morning brief — one improvement, one yes ──────────────── */}
      <section className={styles.section} style={{ paddingTop: 28 }}>
        <div className={styles.inner}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
                •
              </span>
              <MicroLabel as="h2">two · every morning, one improvement</MicroLabel>
            </div>
          </Reveal>
          <div className={brandVars} style={frame}>
            <MorningBrief tone="pearl" />
          </div>
        </div>
      </section>

      {/* ── the sample businesses — one living site per industry ───────── */}
      <section className={styles.section} style={{ paddingTop: 28 }}>
        <div className={styles.inner}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
                •
              </span>
              <MicroLabel as="h2">the websites it writes · every industry</MicroLabel>
            </div>
          </Reveal>
          <Reveal>
            <p className={styles.sectionLede} style={{ marginTop: 0 }}>
              Eight industries, eight sample businesses. Every price and FAQ reads live
              from a genome. Send an enquiry — it lands on the owner&apos;s desk.
            </p>
          </Reveal>
          <div
            style={{
              display: 'grid',
              gap: 14,
              marginTop: 22,
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            }}
          >
            {SAMPLE_VERTICALS.map((v) => (
              <Reveal key={v.slug}>
                <Link href={`/living-site/${v.slug}`} style={{ textDecoration: 'none' }}>
                  <article
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      padding: '18px 20px',
                      borderRadius: 18,
                      background: palette.paper,
                      border: `1px solid ${palette.hairline}`,
                      boxShadow: '0 14px 34px rgba(24, 28, 38, 0.06)',
                    }}
                  >
                    <MicroLabel style={{ color: v.palette.accent }}>{v.industryLabel}</MicroLabel>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                        fontSize: 21,
                        lineHeight: 1.2,
                        color: palette.ink,
                      }}
                    >
                      {v.businessName}
                    </p>
                    <p style={{ margin: 0, fontSize: 12.5, color: palette.bodyGrey, lineHeight: 1.5 }}>
                      {v.tagline}
                    </p>
                    <p
                      style={{
                        margin: 'auto 0 0',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: palette.accentGold,
                      }}
                    >
                      visit the sample site →
                    </p>
                  </article>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── outro ─────────────────────────────────────────────────────── */}
      <section className={styles.section} style={{ background: palette.paperDeep }}>
        <div className={styles.inner}>
          <Reveal>
            <div className={styles.sectionHead}>
              <p className={styles.h2}>
                your business could run like this
                <span aria-hidden style={{ color: palette.accentGold }}>
                  .
                </span>
              </p>
              <p className={styles.sectionLede}>
                We don&apos;t believe the future is a collection of disconnected AI agents.
                We believe every business should have one connected operating system that
                understands how it works and helps it improve over time. That&apos;s a
                Living Business. An industry template and ten questions installs yours —
                nothing sends without your yes.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className={styles.ctaRow} style={{ marginTop: 8 }}>
              <MagneticButton>
                <Link href="/install" className={styles.ctaPrimary}>
                  install a business
                  <span
                    aria-hidden
                    style={{ color: palette.goldSoft, fontSize: 15, lineHeight: 1 }}
                  >
                    •
                  </span>
                </Link>
              </MagneticButton>
              <Link href="/os" className={styles.ctaGhost}>
                see the operating system
              </Link>
              <Link href="/living-site/dog-training" className={styles.ctaGhost}>
                see the sample website
              </Link>
              <Link href="/pricing" className={styles.ctaGhost}>
                pricing
              </Link>
              <Link href="/" className={styles.ctaGhost}>
                back to the front door
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
