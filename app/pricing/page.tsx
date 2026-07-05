import type { Metadata } from 'next';
import Link from 'next/link';
import { palette, typography } from '@assembl/canvas/tokens';
import { MicroLabel } from '@assembl/canvas';
import { HeroArt } from '@/components/v2/HeroArt';
import { MottoStrip } from '@/components/v2/V2Chrome';
import { orderedBundles } from '@/lib/marketplace/bundles';
import { PRICING_TIERS as TIERS, tierForBundle } from '@/lib/registry/pricing';
import styles from '@/components/v2/v2.module.css';

export const metadata: Metadata = {
  title: 'pricing — assembl',
  description:
    'benefit first, price second: try any agent free, take one for $9.99, run a pro stack for $49, a specialist collection for $199, everything for $250 — or buy the outcome from $5,000. NZD, GST inclusive.',
  alternates: { canonical: '/pricing' },
};

/**
 * /pricing — the LIVE marketplace ladder (Free / $9.99 / Pro Stack $49 pick
 * 3+1 / Specialist $199 / All-Access $250 / enterprise custom / outcome from
 * $5,000), replacing the pre-marketplace May-11 ladder ($29/$1,490/$1,990/
 * $2,990) that no longer matched what checkout actually charges.
 *
 * Kept identical to the marketing site's /pricing (2026-07-05 consolidation:
 * pricing must read the same on every surface). Benefit-first copy, then the
 * price. Every V4 bundle maps to a tier below. All NZD, GST-inclusive.
 * Deny-list obeyed: agents "cite current NZ legislation" (never "trained
 * on"), human-in-the-loop always, no "enterprise-grade".
 */

export default function PricingPage() {
  const bundles = orderedBundles();

  const body: React.CSSProperties = {
    fontFamily: typography.body.fontFamily,
    fontSize: 15,
    lineHeight: typography.body.lineHeight,
    color: palette.bodyGrey,
  };

  return (
    <div className={styles.page}>
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.45 }}>
          <HeroArt constellation />
        </div>

        <div className={styles.section} style={{ position: 'relative' }}>
          <div className={styles.inner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
                •
              </span>
              <MicroLabel>pricing · nzd, gst inclusive</MicroLabel>
            </div>
            <h1 className={styles.h1} style={{ marginTop: 18, maxWidth: 700 }}>
              start free. pay when it earns its keep
              <span aria-hidden style={{ color: palette.accentGold }}>
                .
              </span>
            </h1>
            <p style={{ ...body, marginTop: 18, maxWidth: 440 }}>
              Every agent is free to try. A person approves every output. All prices NZD,
              GST inclusive.
            </p>

            {/* the four tiers */}
            <div
              className={styles.cardGrid}
              style={{ marginTop: 48, gridTemplateColumns: undefined }}
            >
              {TIERS.map((t) => (
                <div
                  key={t.name}
                  className="rise"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    padding: '26px 26px 24px',
                    borderRadius: 16,
                    border: `1px solid ${t.featured ? palette.goldSoft : palette.hairline}`,
                    background: '#FFFFFF',
                    boxShadow: t.featured
                      ? '0 14px 36px rgba(26, 25, 24, 0.08)'
                      : '0 8px 28px rgba(26, 25, 24, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2
                      style={{
                        fontFamily: typography.display.fontFamily,
                        fontWeight: typography.display.fontWeight,
                        fontSize: 26,
                        textTransform: 'lowercase',
                        margin: 0,
                        color: palette.ink,
                      }}
                    >
                      {t.name}
                    </h2>
                    {t.featured ? (
                      <span aria-hidden style={{ color: palette.accentGold, fontSize: 13 }}>
                        •
                      </span>
                    ) : null}
                  </div>

                  {/* benefit first — the price follows */}
                  <p
                    style={{
                      fontFamily: typography.display.fontFamily,
                      fontWeight: typography.display.fontWeightMin,
                      fontSize: 18,
                      lineHeight: 1.35,
                      color: palette.ink,
                      margin: 0,
                    }}
                  >
                    {t.benefit}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {t.rows.map((r) => (
                      <div
                        key={r.label}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          gap: 12,
                          borderTop: `1px solid ${palette.hairline}`,
                          paddingTop: 8,
                        }}
                      >
                        <span style={{ ...body, fontSize: 13 }}>{r.label}</span>
                        <span
                          style={{
                            fontFamily: typography.display.fontFamily,
                            fontWeight: typography.display.fontWeight,
                            fontSize: 20,
                            whiteSpace: 'nowrap',
                            color: palette.ink,
                          }}
                        >
                          {r.price}
                        </span>
                      </div>
                    ))}
                  </div>

                  <ul
                    style={{
                      listStyle: 'none',
                      margin: 0,
                      padding: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    {t.points.map((p) => (
                      <li key={p} style={{ ...body, fontSize: 13, display: 'flex', gap: 8 }}>
                        <span
                          aria-hidden
                          style={{ color: palette.goldSoft, fontSize: 11, lineHeight: '20px' }}
                        >
                          •
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={t.cta.href}
                    className={styles.navCta}
                    style={{ marginTop: 'auto', justifyContent: 'center' }}
                  >
                    {t.cta.label}
                    <span
                      aria-hidden
                      style={{ color: palette.accentGold, fontSize: 15, lineHeight: 1 }}
                    >
                      •
                    </span>
                  </a>
                </div>
              ))}
            </div>

            {/* every V4 bundle mapped to a tier — what you're buying */}
            <div className="rise" style={{ marginTop: 56 }}>
              <MicroLabel as="h2">which tier buys which collection</MicroLabel>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  marginTop: 16,
                  border: `1px solid ${palette.hairline}`,
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.92)',
                  overflow: 'hidden',
                }}
              >
                {bundles.map((b, i) => (
                  <div
                    key={b.slug}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px 18px',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      padding: '13px 18px',
                      borderTop: i === 0 ? 'none' : `1px solid ${palette.hairline}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                      <Link
                        href={`/bundles/${b.slug}`}
                        style={{
                          fontFamily: typography.display.fontFamily,
                          fontWeight: typography.display.fontWeight,
                          fontSize: 19,
                          textTransform: 'lowercase',
                          color: palette.ink,
                          textDecoration: 'none',
                        }}
                      >
                        {b.name}
                      </Link>
                      <MicroLabel style={{ fontSize: 9 }}>{b.category}</MicroLabel>
                    </div>
                    <span style={{ ...body, fontSize: 12.5 }}>
                      {tierForBundle(b.slug, b.standalone)}
                    </span>
                  </div>
                ))}
              </div>
              <p style={{ ...body, fontSize: 13, marginTop: 14, maxWidth: 620 }}>
                All-access ($250/mo) includes every collection above. Team pricing for a whole
                bundle is on each collection page.
              </p>
            </div>

            {/* the honest footnote */}
            <p className="rise" style={{ ...body, fontSize: 13, marginTop: 32, maxWidth: 620 }}>
              Not sure where to start? Every agent in the{' '}
              <Link href="/agents" style={{ color: palette.ink }}>
                marketplace
              </Link>{' '}
              answers three messages free, no card — or start with a{' '}
              <Link href="/pilot-sprint" style={{ color: palette.ink }}>
                pilot
              </Link>{' '}
              and buy the outcome, not the software.
            </p>
          </div>
        </div>
      </section>

      <MottoStrip />
    </div>
  );
}
