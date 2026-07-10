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
  title: 'assembl — less admin. more mahi. The Living Business Operating System.',
  description:
    'Most software gives you another dashboard. Most AI gives you another chatbot. assembl gives you a business that learns, organises itself, and gets better every day — one Business Genome powering your website, CRM, knowledge, bookings, and agents. Built in Aotearoa.',
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

      {/* ── the problem — twenty apps, one out-of-date business ───────── */}
      <section className={styles.section} style={{ paddingTop: 40 }}>
        <div className={styles.inner}>
          <Reveal>
            <div className={styles.sectionHead}>
              <p className={styles.h2}>
                your business shouldn&apos;t live across 20 different apps
                <span aria-hidden style={{ color: palette.accentGold }}>
                  .
                </span>
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div style={{ maxWidth: 560, margin: '26px 0 0' }}>
              {[
                'Your website says one thing.',
                'Your CRM says another.',
                'Your documents are out of date.',
                'Your team answers the same questions over and over.',
                'Your AI doesn’t know your business.',
              ].map((line) => (
                <p
                  key={line}
                  style={{
                    margin: '0 0 10px',
                    fontSize: 16.5,
                    lineHeight: 1.5,
                    color: palette.bodyGrey,
                  }}
                >
                  {line}
                </p>
              ))}
              <p style={{ margin: '26px 0 0', fontSize: 17.5, lineHeight: 1.55, color: palette.ink }}>
                assembl changes that. Every part of your business connects to one shared
                understanding of how your business works.
              </p>
              <p style={{ margin: '14px 0 0', fontSize: 17.5, lineHeight: 1.55, color: palette.ink }}>
                We call it your <strong>Business Genome</strong>
                <span aria-hidden style={{ color: palette.accentGold }}>
                  .
                </span>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── one business. one brain. ───────────────────────────────────── */}
      <section className={styles.section} style={{ paddingTop: 28, background: palette.paperDeep }}>
        <div className={styles.inner}>
          <Reveal>
            <div className={styles.sectionHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
                  •
                </span>
                <MicroLabel as="h2">the business genome</MicroLabel>
              </div>
              <p className={styles.h2} style={{ marginTop: 16 }}>
                one business. one brain
                <span aria-hidden style={{ color: palette.accentGold }}>
                  .
                </span>
              </p>
              <p className={styles.sectionLede}>
                Your Business Genome becomes the single source of truth for everything.
                From one place, assembl powers:
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                marginTop: 24,
                maxWidth: 720,
              }}
            >
              {[
                'your website',
                'your CRM',
                'your knowledge base',
                'your customer portal',
                'your bookings',
                'your assistants',
                'your voice agents',
                'your dashboards',
                'your automations',
                'your marketing',
              ].map((surface) => (
                <span
                  key={surface}
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    padding: '9px 16px',
                    borderRadius: 999,
                    background: palette.paper,
                    border: `1px solid ${palette.hairline}`,
                    color: palette.ink,
                  }}
                >
                  {surface}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <p style={{ margin: '28px 0 0', fontSize: 17.5, lineHeight: 1.55, color: palette.ink, maxWidth: 560 }}>
              Update something once. It updates everywhere
              <span aria-hidden style={{ color: palette.accentGold }}>
                .
              </span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── the living site — a business assembling itself on scroll ─── */}
      <LivingSiteEvolution />

      {/* ── meet your living site — it evolves with the business ──────── */}
      <section className={styles.section} style={{ paddingTop: 28 }}>
        <div className={styles.inner}>
          <Reveal>
            <div className={styles.sectionHead}>
              <p className={styles.h2}>
                meet your living site
                <span aria-hidden style={{ color: palette.accentGold }}>
                  .
                </span>
              </p>
              <p className={styles.sectionLede}>
                Your website shouldn&apos;t be something you remember to update. It should
                evolve with your business.
              </p>
            </div>
          </Reveal>
          <div
            style={{
              display: 'grid',
              gap: 14,
              marginTop: 26,
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            }}
          >
            {[
              { when: 'When you add a new service…', then: 'your website knows.' },
              { when: 'When your pricing changes…', then: 'your proposals know.' },
              { when: 'When customers ask new questions…', then: 'your assistants learn.' },
              { when: 'When your business grows…', then: 'everything grows with it.' },
            ].map((pair) => (
              <Reveal key={pair.when}>
                <div
                  style={{
                    height: '100%',
                    padding: '20px 22px',
                    borderRadius: 18,
                    background: palette.paper,
                    border: `1px solid ${palette.hairline}`,
                    boxShadow: '0 14px 34px rgba(24, 28, 38, 0.06)',
                  }}
                >
                  <p style={{ margin: 0, fontSize: 14.5, color: palette.bodyGrey, lineHeight: 1.5 }}>
                    {pair.when}
                  </p>
                  <p
                    style={{
                      margin: '8px 0 0',
                      fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                      fontSize: 21,
                      lineHeight: 1.25,
                      color: palette.ink,
                    }}
                  >
                    {pair.then}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p style={{ margin: '26px 0 0', fontSize: 16, lineHeight: 1.55, color: palette.bodyGrey, maxWidth: 560 }}>
              Your Living Site is simply one window into a living business.
            </p>
            <div className={styles.ctaRow} style={{ marginTop: 18 }}>
              <MagneticButton>
                <Link href="/living-site" className={styles.ctaPrimary}>
                  step inside one
                  <span aria-hidden style={{ color: palette.goldSoft, fontSize: 15, lineHeight: 1 }}>
                    •
                  </span>
                </Link>
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── less software. more momentum. ─────────────────────────────── */}
      <section className={styles.section} style={{ paddingTop: 28, background: palette.paperDeep }}>
        <div className={styles.inner}>
          <Reveal>
            <div className={styles.sectionHead}>
              <p className={styles.h2}>
                less software. more momentum
                <span aria-hidden style={{ color: palette.accentGold }}>
                  .
                </span>
              </p>
              <p className={styles.sectionLede}>
                assembl takes care of the repetitive work that slows businesses down.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div style={{ maxWidth: 560, margin: '24px 0 0' }}>
              {[
                'Following up with customers.',
                'Keeping information consistent.',
                'Answering common questions.',
                'Organising knowledge.',
                'Finding opportunities.',
                'Surfacing improvements.',
              ].map((line) => (
                <p
                  key={line}
                  style={{ margin: '0 0 10px', fontSize: 16.5, lineHeight: 1.5, color: palette.bodyGrey }}
                >
                  {line}
                </p>
              ))}
              <p style={{ margin: '24px 0 0', fontSize: 17.5, lineHeight: 1.55, color: palette.ink }}>
                So you can spend more time doing the work that matters
                <span aria-hidden style={{ color: palette.accentGold }}>
                  .
                </span>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

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
                One template per industry — the agents, bookings, knowledge and website that
                business actually needs.
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

      {/* ── built for new zealand businesses ──────────────────────────── */}
      <section className={styles.section} style={{ paddingTop: 28 }}>
        <div className={styles.inner}>
          <Reveal>
            <div className={styles.sectionHead}>
              <p className={styles.h2}>
                built for new zealand businesses
                <span aria-hidden style={{ color: palette.accentGold }}>
                  .
                </span>
              </p>
              <p className={styles.sectionLede}>
                assembl is designed around the way Kiwi businesses actually work. Simple.
                Practical. No unnecessary complexity. Just software that earns its place
                every day.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── closing — the vision, trust strip, one clear ask ─────────── */}
      <section className={`${styles.section} ${styles.closing}`} style={{ background: palette.paperDeep }}>
        <div className={styles.inner}>
          <div className={styles.closingInner}>
            <Reveal>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 18 }}>
                <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
                  •
                </span>
                <MicroLabel as="h2">our vision</MicroLabel>
              </div>
              <p className={styles.sectionLede} style={{ margin: '0 auto', maxWidth: 620 }}>
                We don&apos;t believe the future is a collection of disconnected AI agents.
                We believe every business should have one connected operating system that
                understands how it works and helps it improve over time. That&apos;s the
                future we&apos;re building.
              </p>
              <p className={styles.h2} style={{ marginTop: 28 }}>
                a living business
                <span aria-hidden style={{ color: palette.accentGold }}>
                  .
                </span>
                <br />
                welcome to assembl.
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
              <a href="mailto:assembl@assembl.co.nz" className={styles.footerLink}>
                assembl@assembl.co.nz
              </a>
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
