import type { Metadata } from 'next';
import Link from 'next/link';
import { palette, typography } from '@assembl/canvas/tokens';
import { BundleCard, MicroLabel } from '@assembl/canvas';
import { HeroArt } from '@/components/v2/HeroArt';
import { V2Nav } from '@/components/v2/V2Chrome';
import { CAPABILITY_CARDS } from '@/lib/v2/capability-cards';
import { getLiveAgentCounts } from '@/lib/v2/live-counts';
import styles from '@/components/v2/v2.module.css';

export const metadata: Metadata = {
  title: 'assembl — purpose-built agents. limitless potential.',
  description:
    'purpose-built agents for the work new zealand teams actually do. agents draft, your people approve, every output carries its receipt. built in aotearoa by assembl.',
  alternates: { canonical: '/' },
};

/**
 * Homepage — DIRECTION-LOCKED-2026-07-01 (supersedes the golden-orb canon).
 *
 * Cormorant lowercase hero on warm paper, the silvery-gold particulate
 * landscape filling the right half, six capability cards below, a TEXT-ONLY
 * trust bar (no client logos — none are signed), and the locked motto.
 *
 * Server component; the art + card motion are client leaves from
 * `@assembl/canvas`. Scroll reveals use the pure-CSS `.rise` pattern so a
 * hydration failure can never blank the page.
 */
export default async function HomePage() {
  const counts = await getLiveAgentCounts();

  const body: React.CSSProperties = {
    fontFamily: typography.body.fontFamily,
    fontSize: 15,
    lineHeight: typography.body.lineHeight,
    color: palette.bodyGrey,
  };

  return (
    <div className={styles.page}>
      <V2Nav current="/" />

      {/* ── hero ─────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span aria-hidden style={{ color: palette.canary, fontSize: 12, lineHeight: 1 }}>
              •
            </span>
            <MicroLabel>built in aotearoa</MicroLabel>
          </div>
          {/* exactly two lines, per the locked composition rule */}
          <h1
            className={styles.h1}
            style={{ marginTop: 22, fontSize: 'clamp(2.2rem, 4vw, 3.6rem)' }}
          >
            purpose-built agents.
            <br />
            limitless potential
            <span aria-hidden style={{ color: palette.canary }}>
              .
            </span>
          </h1>
          <p style={{ ...body, marginTop: 24, maxWidth: 420 }}>
            Specialist agents draft the work. Your people review and approve. Every output
            carries its receipt.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 26, marginTop: 32 }}>
            <Link href="/agents" className={styles.navCta} style={{ padding: '11px 22px' }}>
              explore marketplace
              <span aria-hidden style={{ color: palette.canary, fontSize: 15, lineHeight: 1 }}>
                •
              </span>
            </Link>
            <Link
              href="/how-it-works"
              className={styles.navLink}
              style={{ borderBottom: `1px solid ${palette.hairline}`, paddingBottom: 2 }}
            >
              how it works
            </Link>
          </div>
        </div>
        <div className={styles.heroArt}>
          <HeroArt />
        </div>
      </section>

      {/* ── six capability cards ─────────────────────────────────────── */}
      <section className={styles.section} style={{ paddingTop: 24 }}>
        <div className={styles.inner}>
          <div className="rise" style={{ marginBottom: 28 }}>
            <MicroLabel as="h2">purpose-built collections</MicroLabel>
            {counts.total > 0 ? (
              <p style={{ ...body, marginTop: 10 }}>
                {counts.total} agents live across the marketplace today.
              </p>
            ) : null}
          </div>
          <div className={styles.cardGrid}>
            {CAPABILITY_CARDS.map((c, i) => {
              const liveCount = c.bundleSlug ? counts.byBundle[c.bundleSlug] ?? 0 : 0;
              return (
                <Link key={c.slug} href={c.href} className={`${styles.cardLink} rise`}>
                  <BundleCard
                    title={c.title}
                    description={c.description}
                    tags={c.tags}
                    gold={i % 2 === 1}
                    meta={liveCount > 0 ? `${liveCount} agents live` : undefined}
                    style={{ maxWidth: 'none', height: '100%' }}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── trust bar — TEXT ONLY (no client logos; none are signed) ─── */}
      <section className={styles.section} style={{ paddingTop: 8, paddingBottom: 40 }}>
        <div
          className={`${styles.inner} rise`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderTop: `1px solid ${palette.hairline}`,
            paddingTop: 36,
          }}
        >
          <span aria-hidden style={{ color: palette.canary, fontSize: 12, lineHeight: 1 }}>
            •
          </span>
          <MicroLabel>trusted by teams across aotearoa</MicroLabel>
        </div>
      </section>
    </div>
  );
}
