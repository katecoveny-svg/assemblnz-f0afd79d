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
import { featuredWorkflowSlugs, getWorkflow } from '@/lib/workflows';
import { KETES, getKete } from '@/lib/kete';
import { ketes as keteImagery, reo, footerDisclaimer } from '@/lib/site-config';
import { homeCopy, keteOneLiners } from '@/lib/home-copy';
import styles from '@/components/v2/home/home.module.css';
import { HAPAI_TOOLS } from '@/lib/hapai/shareable-tools';

export const metadata: Metadata = {
  title: 'assembl — purpose-built agents. limitless potential.',
  description:
    'purpose-built agents for the work New Zealand teams actually do. Agents draft, your people approve, and every output carries the record of how it was made. Built in Aotearoa.',
  alternates: { canonical: '/' },
};

/** Shared section header — eyebrow + lowercase Cormorant headline + lede. */
function SectionHead({
  eyebrow,
  headline,
  lede,
}: {
  eyebrow: string;
  headline: React.ReactNode;
  lede?: string;
}) {
  return (
    <Reveal>
      <div className={styles.sectionHead}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
            •
          </span>
          <MicroLabel as="h2">{eyebrow}</MicroLabel>
        </div>
        <p className={styles.h2} style={{ marginTop: 16 }}>
          {headline}
        </p>
        {lede ? <p className={styles.sectionLede}>{lede}</p> : null}
      </div>
    </Reveal>
  );
}

function SectionLink({ label, href }: { label: string; href: string }) {
  return (
    <Reveal>
      <Link href={href} className={styles.sectionLink} style={{ marginTop: 44 }}>
        {label}
        <span aria-hidden style={{ color: palette.accentGold }}>
          →
        </span>
      </Link>
    </Reveal>
  );
}

const GoldStop = () => (
  <span aria-hidden style={{ color: palette.accentGold }}>
    .
  </span>
);

/**
 * Homepage — DIRECTION-LOCKED-2026-07-01. One paper canvas, one visual
 * family (particulate + matted vessel set), copy in lib/home-copy.ts so
 * every line is editable in one place. Story order: what you get
 * (collections) → how it works (pipeline) → what you keep (evidence) →
 * what is live today (workflows, kete) → one clear ask.
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

      {/* ── collections — what you get ───────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionRuled}`}>
        <div className={styles.inner}>
          <SectionHead
            eyebrow={homeCopy.collections.eyebrow}
            headline={
              <>
                {homeCopy.collections.headline}
                <GoldStop />
              </>
            }
            lede={homeCopy.collections.lede}
          />

          <div className={styles.cardGrid}>
            {bundles.map((b, i) => {
              const live = counts.byBundle[b.slug] ?? 0;
              return (
                <Link
                  key={b.slug}
                  href={`/bundles/${b.slug}`}
                  className={`${styles.cardLink} rise`}
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

          <SectionLink {...homeCopy.collections.link} />
        </div>
      </section>

      {/* ── the pipeline — how it works ──────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionRuled}`}>
        <div className={styles.inner}>
          <SectionHead
            eyebrow={homeCopy.pipeline.eyebrow}
            headline={
              <>
                {reo.howItWorksHeadline[0]}
                <br />
                {reo.howItWorksHeadline[1]}
              </>
            }
          />

          <PipelineThread />

          <SectionLink {...homeCopy.pipeline.link} />
        </div>
      </section>

      {/* ── the evidence pack — what you keep ────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionRuled}`}>
        <div className={styles.inner}>
          <SectionHead
            eyebrow={homeCopy.evidence.eyebrow}
            headline={
              <>
                {reo.evidencePackHeadline[0]}
                <br />
                {reo.evidencePackHeadline[1]}
              </>
            }
            lede={homeCopy.evidence.lede}
          />

          <EvidenceStory />

          <SectionLink {...homeCopy.evidence.link} />
        </div>
      </section>

      {/* ── featured workflows — live today ──────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionRuled}`}>
        <div className={styles.inner}>
          <SectionHead
            eyebrow={homeCopy.workflows.eyebrow}
            headline={
              <>
                {homeCopy.workflows.headline}
                <GoldStop />
              </>
            }
            lede={homeCopy.workflows.lede}
          />

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
                            {homeCopy.workflows.savesLabel(w.timeSavedMin)}
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

          <SectionLink {...homeCopy.workflows.link} />
        </div>
      </section>

      {/* ── the nine kete — matted editorial set ─────────────────────── */}
      <section className={`${styles.section} ${styles.sectionRuled}`}>
        <div className={styles.inner}>
          <SectionHead
            eyebrow={homeCopy.kete.eyebrow}
            headline={
              <>
                {homeCopy.kete.headline}
                <GoldStop />
              </>
            }
            lede={homeCopy.kete.lede}
          />

          <div className={styles.keteGrid}>
            {KETES.map((kete, i) => (
              <Reveal key={kete.slug} delay={(i % 3) * 0.07}>
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
                    <p className={styles.keteTagline}>{keteOneLiners[kete.slug]}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <SectionLink {...homeCopy.kete.link} />
        </div>
      </section>

      {/* ── closing — one clear ask ──────────────────────────────────── */}
      <section
        className={`${styles.section} ${styles.closing}`}
        style={{ background: palette.paperDeep }}
      >
        <div className={styles.inner}>
          <div className={styles.closingInner}>
            <Reveal>
              <p className={styles.h2}>
                {homeCopy.closing.headlineLine1}
                <br />
                {homeCopy.closing.headlineLine2}
                <GoldStop />
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className={styles.ctaRow} style={{ justifyContent: 'center', marginTop: 34 }}>
                <MagneticButton>
                  <Link href={homeCopy.closing.ctaPrimary.href} className={styles.ctaPrimary}>
                    {homeCopy.closing.ctaPrimary.label}
                    <span
                      aria-hidden
                      style={{ color: palette.goldSoft, fontSize: 15, lineHeight: 1 }}
                    >
                      •
                    </span>
                  </Link>
                </MagneticButton>
                <Link href={homeCopy.closing.ctaSecondary.href} className={styles.ctaGhost}>
                  {homeCopy.closing.ctaSecondary.label}
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
                      label: homeCopy.hero.stats.agents,
                      value: counts.total,
                      hint: 'across the marketplace',
                    },
                    {
                      label: homeCopy.hero.stats.collections,
                      value: bundles.length,
                      hint: 'purpose-built bundles',
                    },
                    {
                      label: homeCopy.hero.stats.tools,
                      value: freeTools,
                      hint: 'open and use — no login',
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
            <Link
              href="/"
              aria-label="assembl — home"
              style={{ textDecoration: 'none', color: palette.ink }}
            >
              <AssemblWordmark
                className="text-[24px] leading-none"
                style={{ letterSpacing: '0.14em' }}
              />
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
