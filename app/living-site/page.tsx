import type { Metadata } from 'next';
import Link from 'next/link';
import { palette } from '@assembl/canvas/tokens';
import { MicroLabel } from '@assembl/canvas';
import { BusinessGenome } from '@/components/ops/fred/BusinessGenome';
import { MorningBrief } from '@/components/ops/fred/MorningBrief';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { Reveal } from '@/components/site/Reveal';
import { MagneticButton } from '@/components/site/MagneticButton';
import { getBrandFonts } from '@/lib/brand/fonts';
import styles from '@/components/v2/home/home.module.css';

export const metadata: Metadata = {
  title: 'a living site, live — inside a real business OS · assembl',
  description:
    'Step inside a Living Site: an Auckland dog-training business running on one source of truth. Touch the Business Genome, approve the morning brief — everything here is interactive.',
  alternates: { canonical: '/living-site' },
};

/**
 * The public, ungated slice of the Fred demo — where the homepage's
 * "watch a business come alive" story ends in something a visitor can touch.
 * Sample data only; the full console stays behind guided-demo invites.
 */
export default function LivingSitePage() {
  const fonts = getBrandFonts('auckland-dog-trainer');
  const brandVars = `${fonts.display.variable} ${fonts.body.variable} ${fonts.mono.variable}`;

  const frame: React.CSSProperties = {
    background: '#F7EEF1',
    border: `1px solid ${palette.hairline}`,
    borderRadius: 22,
    padding: 'clamp(14px, 3vw, 34px)',
    boxShadow: '0 24px 60px rgba(24, 28, 38, 0.07)',
  };

  return (
    <div style={{ background: palette.paper }}>
      {/* ── intro ─────────────────────────────────────────────────────── */}
      <section className={styles.section} style={{ paddingBottom: 24 }}>
        <div className={styles.inner}>
          <Reveal>
            <div className={styles.sectionHead}>
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
                Fred trains dogs in Auckland. Below is his business running as one system —
                services, pricing, FAQs, bookings, and agents reading a single source of truth,
                improving itself every morning. Everything here is interactive. Go on — change a
                price, approve the brief.
              </p>
            </div>
          </Reveal>
          <DemoRibbon />
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
            <BusinessGenome />
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
            <MorningBrief />
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
                The full console — CRM, programme journeys, course studio, hiring — opens in
                guided demos. The system installs from an industry template and ten questions;
                nothing sends without your yes.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className={styles.ctaRow} style={{ marginTop: 8 }}>
              <MagneticButton>
                <Link href="/how-it-works" className={styles.ctaPrimary}>
                  how it works
                  <span
                    aria-hidden
                    style={{ color: palette.goldSoft, fontSize: 15, lineHeight: 1 }}
                  >
                    •
                  </span>
                </Link>
              </MagneticButton>
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
