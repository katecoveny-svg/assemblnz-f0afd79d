import type { Metadata } from 'next';
import Link from 'next/link';
import { palette, motto } from '@assembl/canvas/tokens';
import { KpiTrio, MicroLabel } from '@assembl/canvas';
import { V2Nav } from '@/components/v2/V2Chrome';
import { HomeHero } from '@/components/v2/home/HomeHero';
import { LivingSiteEvolution } from '@/components/v2/home/LivingSiteEvolution';
import { Reveal } from '@/components/site/Reveal';
import { MagneticButton } from '@/components/site/MagneticButton';
import { AssemblWordmark } from '@/components/site/AssemblWordmark';
import { orderedBundles } from '@/lib/marketplace/bundles';
import {
  GENOME_FACTS,
  GENOME_SURFACES,
} from '@/lib/customers/auckland-dog-trainer/genome';
import { reo, footerDisclaimer } from '@/lib/site-config';
import styles from '@/components/v2/home/home.module.css';

export const metadata: Metadata = {
  title: 'assembl — grows your business while you run it. Less admin. More mahi.',
  description:
    'One Living Site for your whole business — website, CRM, bookings, knowledge, and agents on a single source of truth, improving itself every morning. You say yes. Built in Aotearoa.',
  alternates: { canonical: '/' },
};

/**
 * Homepage — the Living Site front door (concept pivot 2026-07-10): the
 * particulate hero, a business assembling itself on scroll, industry
 * templates, and one clear ask — step inside a living site. Ships its own
 * chrome (the global SiteHeader/Footer suppress themselves on "/").
 */
export default async function HomePage() {
  const bundles = orderedBundles();
  return (
    <div className={styles.page}>
      <V2Nav />

      {/* ── hero — live 3D particulate landscape ─────────────────────── */}
      <HomeHero genomeFacts={GENOME_FACTS.length} surfaces={GENOME_SURFACES.length} />

      {/* ── the living site — a business assembling itself on scroll ─── */}
      <LivingSiteEvolution />

      {/* ── collections — floating bundle cards ──────────────────────── */}
      <section className={styles.section} style={{ paddingTop: 40 }}>
        <div className={styles.inner}>
          <Reveal>
            <div className={styles.sectionHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
                  •
                </span>
                <MicroLabel as="h2">industry templates</MicroLabel>
              </div>
              <p className={styles.h2} style={{ marginTop: 16 }}>
                your industry, ready to install
                <span aria-hidden style={{ color: palette.accentGold }}>
                  .
                </span>
              </p>
              <p className={styles.sectionLede}>
                Choose a template and the Living Site assembles around it — the agents, bookings,
                knowledge, and website your industry actually needs, consistent across all of them.
              </p>
            </div>
          </Reveal>

          <div className={styles.cardGrid}>
            {bundles.map((b, i) => {
              const floatClass = styles[`float${(i % 4) + 1}` as keyof typeof styles] as
                | string
                | undefined;
              return (
                <Link
                  key={b.slug}
                  href="/install"
                  className={`${styles.cardLink} ${floatClass ?? ''} rise`}
                  style={{ textDecoration: 'none' }}
                >
                  <article
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      padding: '20px 22px',
                      borderRadius: 18,
                      background: palette.paper,
                      border: `1px solid ${palette.hairline}`,
                      boxShadow: '0 14px 34px rgba(24, 28, 38, 0.06)',
                    }}
                  >
                    <MicroLabel style={{ color: palette.bodyGrey }}>{b.category}</MicroLabel>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                        fontSize: 21,
                        lineHeight: 1.2,
                        color: palette.ink,
                      }}
                    >
                      {b.name}
                    </p>
                    <p
                      style={{
                        margin: 'auto 0 0',
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: palette.accentGold,
                      }}
                    >
                      install →
                    </p>
                  </article>
                </Link>
              );
            })}
          </div>

          <Reveal>
            <Link href="/install" className={styles.sectionLink} style={{ marginTop: 44 }}>
              choose yours — ten questions and it assembles
              <span aria-hidden style={{ color: palette.accentGold }}>
                →
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── closing — real numbers, trust strip, one clear ask ───────── */}
      <section className={`${styles.section} ${styles.closing}`} style={{ background: palette.paperDeep }}>
        <div className={styles.inner}>
          <div className={styles.closingInner}>
            <Reveal>
              <p className={styles.h2}>
                your business, alive
                <span aria-hidden style={{ color: palette.accentGold }}>
                  .
                </span>
                <br />
                see one running today.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className={styles.ctaRow} style={{ justifyContent: 'center', marginTop: 34 }}>
                <MagneticButton>
                  <Link href="/living-site" className={styles.ctaPrimary}>
                    step inside a living site
                    <span
                      aria-hidden
                      style={{ color: palette.goldSoft, fontSize: 15, lineHeight: 1 }}
                    >
                      •
                    </span>
                  </Link>
                </MagneticButton>
                <Link href="/install" className={styles.ctaGhost}>
                  install your industry
                </Link>
                <Link href="/pricing" className={styles.ctaGhost}>
                  see pricing
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.18}>
              <div className={styles.trustStrip}>
                {reo.trustStrip.map((item) => (
                  <span key={item} className={styles.trustItem}>
                    <span
                      aria-hidden
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 999,
                        background: palette.gold,
                        display: 'inline-block',
                      }}
                    />
                    {item}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <div style={{ marginTop: 52, width: '100%' }}>
                <KpiTrio
                  stats={[
                    {
                      label: 'source of truth',
                      value: 1,
                      hint: 'the Business Genome — every fact once',
                    },
                    {
                      label: 'surfaces reading it',
                      value: GENOME_SURFACES.length,
                      hint: 'website, CRM, bookings, agents…',
                    },
                    {
                      label: 'improvement a morning',
                      value: 1,
                      hint: 'already built — you say yes',
                    },
                  ]}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── footer — own chrome (global footer suppressed on "/") ────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <Link href="/" aria-label="assembl — home" style={{ textDecoration: 'none', color: palette.ink }}>
              <AssemblWordmark className="text-[24px] leading-none" style={{ letterSpacing: '0.14em' }} />
              <span aria-hidden style={{ color: palette.accentGold }}>
                .
              </span>
            </Link>
            <nav className={styles.footerLinks} aria-label="Footer">
              <Link href="/agents" className={styles.footerLink}>
                agents
              </Link>
              <Link href="/pricing" className={styles.footerLink}>
                pricing
              </Link>
              <Link href="/trust" className={styles.footerLink}>
                trust
              </Link>
              <Link href="/about" className={styles.footerLink}>
                about
              </Link>
              <Link href="/mana-receipts" className={styles.footerLink}>
                mana receipts
              </Link>
              <Link href="/te-tiriti" className={styles.footerLink}>
                te tiriti
              </Link>
              <Link href="/contact" className={styles.footerLink}>
                contact
              </Link>
            </nav>
          </div>
          <p className={styles.footerDisclaimer}>{footerDisclaimer}</p>
          <div className={styles.footerMotto}>
            <MicroLabel>{motto}</MicroLabel>
            <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
              •
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
