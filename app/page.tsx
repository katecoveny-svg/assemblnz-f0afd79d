import type { Metadata } from 'next';
import Link from 'next/link';
import { palette, motto } from '@assembl/canvas/tokens';
import { BundleCard, KpiTrio, MicroLabel } from '@assembl/canvas';
import { V2Nav } from '@/components/v2/V2Chrome';
import { HomeHero } from '@/components/v2/home/HomeHero';
import { PipelineThread } from '@/components/v2/home/PipelineThread';
import { TiltCard } from '@/components/v2/home/TiltCard';
import { EvidenceStory } from '@/components/v2/home/EvidenceStory';
import { Reveal } from '@/components/site/Reveal';
import { MagneticButton } from '@/components/site/MagneticButton';
import { AssemblWordmark } from '@/components/site/AssemblWordmark';
import { getLiveAgentCounts } from '@/lib/v2/live-counts';
import { orderedBundles } from '@/lib/marketplace/bundles';
import { workflows, featuredWorkflowSlugs, getWorkflow } from '@/lib/workflows';
import { KETES, getKete } from '@/lib/kete';
import { ketes as keteImagery, reo, footerDisclaimer } from '@/lib/site-config';
import styles from '@/components/v2/home/home.module.css';
import { HAPAI_TOOLS } from '@/lib/hapai/shareable-tools';

export const metadata: Metadata = {
  title: 'assembl — mahi that earns its proof.',
  description:
    'Purpose-built agents for the work New Zealand teams actually do. Agents draft, your people approve, and every output carries the record of how it was made. Built in Aotearoa.',
  alternates: { canonical: '/' },
};

/**
 * Homepage — DIRECTION-LOCKED-2026-07-01, imagery + copy rework 2026-07-07:
 * the sculptural evidence-vessel film as the hero, floating collections, the
 * five-stage pipeline on a gold thread, featured workflows, the nine kete,
 * and the evidence pack assembling itself on scroll. Ships its own chrome
 * (the global SiteHeader/Footer suppress themselves on "/").
 */
export default async function HomePage() {
  const counts = await getLiveAgentCounts();
  const bundles = orderedBundles();
  const freeTools = HAPAI_TOOLS.filter((t) => t.brand === 'dash' && t.status === 'live').length;
  const featured = featuredWorkflowSlugs
    .map((slug) => getWorkflow(slug))
    .filter((w): w is NonNullable<typeof w> => Boolean(w));

  return (
    <div className={styles.page}>
      <V2Nav />

      {/* ── hero — live 3D particulate landscape ─────────────────────── */}
      <HomeHero
        agentsLive={counts.total}
        collections={bundles.length}
        freeTools={freeTools}
      />

      {/* ── collections — floating bundle cards ──────────────────────── */}
      <section className={styles.section} style={{ paddingTop: 40 }}>
        <div className={styles.inner}>
          <Reveal>
            <div className={styles.sectionHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
                  •
                </span>
                <MicroLabel as="h2">purpose-built collections</MicroLabel>
              </div>
              <p className={styles.h2} style={{ marginTop: 16 }}>
                one front door per industry
                <span aria-hidden style={{ color: palette.accentGold }}>
                  .
                </span>
              </p>
              <p className={styles.sectionLede}>
                Pick your industry&rsquo;s front door. A lead agent routes the work to specialists,
                and every output comes back with proof attached.
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
                    description={b.cardLine}
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

      {/* ── the pipeline — five stages on a gold thread ──────────────── */}
      <section className={styles.section} style={{ background: palette.paperDeep }}>
        <div className={styles.inner}>
          <Reveal>
            <div className={styles.sectionHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
                  •
                </span>
                <MicroLabel as="h2">how it works</MicroLabel>
              </div>
              <p className={styles.h2} style={{ marginTop: 16 }}>
                {reo.howItWorksHeadline[0]}
                <br />
                {reo.howItWorksHeadline[1]}
              </p>
            </div>
          </Reveal>

          <PipelineThread />

          <Reveal>
            <Link href="/how-it-works" className={styles.sectionLink} style={{ marginTop: 40 }}>
              see the full pipeline
              <span aria-hidden style={{ color: palette.accentGold }}>
                →
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── featured workflows — tilt cards with kete accents ────────── */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <Reveal>
            <div className={styles.sectionHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
                  •
                </span>
                <MicroLabel as="h2">workflows</MicroLabel>
              </div>
              <p className={styles.h2} style={{ marginTop: 16 }}>
                one job in. minutes back
                <span aria-hidden style={{ color: palette.accentGold }}>
                  .
                </span>
              </p>
              <p className={styles.sectionLede}>
                {workflows.length} live workflows, each built on New Zealand legislation and sealed
                with a record you can file.
              </p>
            </div>
          </Reveal>

          <div className={styles.workflowGrid}>
            {featured.map((w, i) => {
              const kete = getKete(w.kete);
              return (
                <Reveal key={w.slug} delay={(i % 3) * 0.08} className={styles.fillHeight}>
                  <Link
                    href={`/w/${w.slug}`}
                    className={`${styles.cardLink} ${styles.fillHeight}`}
                  >
                    <TiltCard>
                      <div className={styles.workflowCard}>
                        <span className={styles.workflowKete}>
                          <span
                            aria-hidden
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: 999,
                              background: kete.accent,
                              display: 'inline-block',
                            }}
                          />
                          {kete.name} · {kete.industry}
                        </span>
                        <h3 className={styles.workflowTitle}>{w.title}</h3>
                        <p className={styles.workflowBody}>{w.description}</p>
                        <div className={styles.workflowFoot}>
                          <span className={styles.workflowChip}>
                            <span aria-hidden style={{ color: palette.gold }}>
                              ↺
                            </span>
                            saves ~{w.timeSavedMin} min
                          </span>
                          <span className={styles.workflowPrice}>{w.priceLabel}</span>
                        </div>
                      </div>
                    </TiltCard>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          <Reveal>
            <Link href="/workflows" className={styles.sectionLink} style={{ marginTop: 44 }}>
              browse all workflows
              <span aria-hidden style={{ color: palette.accentGold }}>
                →
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── the nine kete — vessel gallery ───────────────────────────── */}
      <section className={styles.section} style={{ background: palette.paperDeep }}>
        <div className={styles.inner}>
          <Reveal>
            <div className={styles.sectionHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
                  •
                </span>
                <MicroLabel as="h2">the nine kete</MicroLabel>
              </div>
              <p className={styles.h2} style={{ marginTop: 16 }}>
                nine kete, woven for the work
                <span aria-hidden style={{ color: palette.accentGold }}>
                  .
                </span>
              </p>
              <p className={styles.sectionLede}>{reo.nineKeteIntro}</p>
            </div>
          </Reveal>

          <div className={styles.keteGrid}>
            {KETES.map((kete, i) => (
              <Reveal key={kete.slug} delay={(i % 3) * 0.08}>
                <Link href={`/kete/${kete.slug}`} className={styles.keteCard}>
                  <div className={styles.keteImageWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- locked vessel stills, art-directed crop */}
                    <img
                      src={keteImagery[kete.slug].wide}
                      alt={`${kete.name} — ${kete.englishName}`}
                      className={styles.keteImage}
                      loading="lazy"
                    />
                    <span
                      className={styles.keteAccentBar}
                      style={{ background: kete.accent }}
                      aria-hidden
                    />
                  </div>
                  <div className={styles.keteBody}>
                    <div className={styles.keteNameRow}>
                      <h3 className={styles.keteName}>{kete.name}</h3>
                      <span className={styles.keteEnglish}>{kete.englishName}</span>
                    </div>
                    <span className={styles.keteMeaning}>{kete.meaning}</span>
                    <p className={styles.keteTagline}>{kete.tagline}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── the evidence pack — assembles itself on scroll ───────────── */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <Reveal>
            <div className={styles.sectionHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
                  •
                </span>
                <MicroLabel as="h2">the evidence pack</MicroLabel>
              </div>
              <p className={styles.h2} style={{ marginTop: 16 }}>
                {reo.evidencePackHeadline[0]}
                <br />
                {reo.evidencePackHeadline[1]}
              </p>
              <p className={styles.sectionLede}>{reo.evidenceLedgerSubcopy}</p>
            </div>
          </Reveal>

          <EvidenceStory />

          <Reveal>
            <Link href="/trust" className={styles.sectionLink} style={{ marginTop: 40 }}>
              how we earn trust
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
                bring one workflow.
                <br />
                leave with proof
                <span aria-hidden style={{ color: palette.accentGold }}>
                  .
                </span>
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className={styles.ctaRow} style={{ justifyContent: 'center', marginTop: 34 }}>
                <MagneticButton>
                  <Link href="/agents" className={styles.ctaPrimary}>
                    browse agents
                    <span
                      aria-hidden
                      style={{ color: palette.goldSoft, fontSize: 15, lineHeight: 1 }}
                    >
                      •
                    </span>
                  </Link>
                </MagneticButton>
                <Link href="/contact" className={styles.ctaGhost}>
                  book a demo
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
