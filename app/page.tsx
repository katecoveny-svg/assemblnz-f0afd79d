import type { Metadata } from 'next';
import Link from 'next/link';
import { palette, motto } from '@assembl/canvas/tokens';
import { BundleCard, KpiTrio, MicroLabel } from '@assembl/canvas';
import { V2Nav } from '@/components/v2/V2Chrome';
import { HomeHero } from '@/components/v2/home/HomeHero';
import { LivingSiteEvolution } from '@/components/v2/home/LivingSiteEvolution';
import { Reveal } from '@/components/site/Reveal';
import { MagneticButton } from '@/components/site/MagneticButton';
import { AssemblWordmark } from '@/components/site/AssemblWordmark';
import { getLiveAgentCounts } from '@/lib/v2/live-counts';
import { orderedBundles } from '@/lib/marketplace/bundles';
import { reo, footerDisclaimer } from '@/lib/site-config';
import styles from '@/components/v2/home/home.module.css';
import { HAPAI_TOOLS } from '@/lib/hapai/shareable-tools';

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
  const counts = await getLiveAgentCounts();
  const bundles = orderedBundles();
  const freeTools = HAPAI_TOOLS.filter((t) => t.brand === 'dash' && t.status === 'live').length;
  return (
    <div className={styles.page}>
      <V2Nav />

      {/* ── hero — live 3D particulate landscape ─────────────────────── */}
      <HomeHero
        agentsLive={counts.total}
        collections={bundles.length}
        freeTools={freeTools}
      />

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
              const live = counts.byBundle[b.slug] ?? 0;
              const floatClass = styles[`float${(i % 4) + 1}` as keyof typeof styles] as
                | string
                | undefined;
              return (
                <Link
                  key={b.slug}
                  href={`/bundles/${b.slug}`}
                  className={`${styles.cardLink} ${floatClass ?? ''} rise`}
                >
                  <BundleCard
                    title={b.name}
                    description={`${b.shortPitch.split('. ')[0].toLowerCase().replace(/\.$/, '')}.`}
                    tags={[b.category]}
                    gold={i % 3 === 1}
                    meta={live > 0 ? `${live} agents live` : b.standalone ? 'standalone' : undefined}
                    style={{ maxWidth: 'none', height: '100%' }}
                  />
                </Link>
              );
            })}
          </div>

          <Reveal>
            <Link href="/agents" className={styles.sectionLink} style={{ marginTop: 44 }}>
              explore the marketplace
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
                <Link href="/agents" className={styles.ctaGhost}>
                  try an agent free
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
                    { label: 'agents live', value: counts.total, hint: 'across the marketplace' },
                    { label: 'collections', value: bundles.length, hint: 'purpose-built bundles' },
                    { label: 'free tools', value: freeTools, hint: 'open and use — no login' },
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
