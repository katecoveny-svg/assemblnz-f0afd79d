import type { Metadata } from 'next';
import Link from 'next/link';
import { palette, typography } from '@assembl/canvas/tokens';
import { MicroLabel } from '@assembl/canvas';
import { HeroArt } from '@/components/v2/HeroArt';
import { MottoStrip } from '@/components/v2/V2Chrome';
import styles from '@/components/v2/v2.module.css';

export const metadata: Metadata = {
  title: 'pricing — assembl',
  description:
    'the full assembl ladder: tōro for whānau, operator, leader and enterprise for teams, and outcome — a pilot in 30 days. every agent is free to try, and a person approves every output.',
  alternates: { canonical: '/pricing' },
};

/**
 * /pricing — the May-11 LOCKED ladder (project_brand_pricing_locked_may11).
 * Full ladder, not monthly-only. Deny-list obeyed: agents "cite current NZ
 * legislation" (never "trained on"), automation is human-in-the-loop (never
 * unqualified "autonomous agents"), no "enterprise-grade", no "50+ Acts".
 *
 * The old /agents pricing route now 301s here (next.config) — this page is
 * canonical.
 */

type Tier = {
  name: string;
  price: string;
  setup?: string;
  blurb: string;
  points: string[];
  cta: { label: string; href: string };
  featured?: boolean;
};

const TIERS: Tier[] = [
  {
    name: 'tōro',
    price: '$29/mo',
    blurb: 'the whānau navigator — home, school and everyday admin.',
    points: [
      'the household front door, plus the family specialists',
      'school notices, the calendar, meals and check-ins',
      'every reply is a draft a person confirms',
    ],
    cta: { label: 'meet tōro', href: '/agents/toro' },
  },
  {
    name: 'operator',
    price: '$1,490/mo',
    setup: '+ $590 setup',
    blurb: 'one team, one workflow that runs every week.',
    points: [
      'one purpose-built collection, tuned to your work',
      'agents cite current NZ legislation with retrieval dates',
      'a named reviewer approves before anything ships',
    ],
    cta: { label: 'book a demo', href: '/contact' },
  },
  {
    name: 'leader',
    price: '$1,990/mo',
    setup: '+ $1,290 setup',
    blurb: 'several workflows across the business, one calm surface.',
    points: [
      'multiple collections working together',
      'mana receipts on every output — the record of how it was made',
      'human-in-the-loop by design, at every step',
    ],
    cta: { label: 'book a demo', href: '/contact' },
    featured: true,
  },
  {
    name: 'enterprise',
    price: '$2,990/mo',
    setup: '+ $2,890 setup',
    blurb: 'the whole operation, with governance to match.',
    points: [
      'organisation-wide rollout with named owners',
      'privacy designed to the Privacy Act 2020, including IPP 3A',
      'audit-pack exports your board and auditor can read',
    ],
    cta: { label: 'book a demo', href: '/contact' },
  },
  {
    name: 'outcome',
    price: 'from $5,000',
    blurb: 'a pilot in 30 days — one result, priced as the outcome.',
    points: [
      'one workflow, built and proven inside a month',
      'you keep the evidence pack either way',
      'the anchor for everything above',
    ],
    cta: { label: 'start a pilot', href: '/pilot-sprint' },
  },
];

export default function PricingPage() {
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
              <span aria-hidden style={{ color: palette.canary, fontSize: 12, lineHeight: 1 }}>
                •
              </span>
              <MicroLabel>pricing</MicroLabel>
            </div>
            <h1 className={styles.h1} style={{ marginTop: 18, maxWidth: 700 }}>
              one ladder. no surprises
              <span aria-hidden style={{ color: palette.canary }}>
                .
              </span>
            </h1>
            <p style={{ ...body, marginTop: 18, maxWidth: 440 }}>
              All prices in NZD. Every agent is free to try. A person approves every output.
            </p>

            {/* the full ladder */}
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
                      <span aria-hidden style={{ color: palette.canary, fontSize: 13 }}>
                        •
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <span
                      style={{
                        fontFamily: typography.display.fontFamily,
                        fontWeight: typography.display.fontWeight,
                        fontSize: 32,
                        color: palette.ink,
                      }}
                    >
                      {t.price}
                    </span>
                    {t.setup ? (
                      <MicroLabel style={{ display: 'block', marginTop: 4 }}>{t.setup}</MicroLabel>
                    ) : null}
                  </div>
                  <p style={{ ...body, fontSize: 13.5, margin: 0 }}>{t.blurb}</p>
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
                  <Link
                    href={t.cta.href}
                    className={styles.navCta}
                    style={{ marginTop: 'auto', justifyContent: 'center' }}
                  >
                    {t.cta.label}
                    <span aria-hidden style={{ color: palette.canary, fontSize: 15, lineHeight: 1 }}>
                      •
                    </span>
                  </Link>
                </div>
              ))}
            </div>

            {/* marketplace note — keeps the self-serve funnel honest + alive */}
            <p className="rise" style={{ ...body, fontSize: 13, marginTop: 44, maxWidth: 620 }}>
              Trying before buying: every agent in the{' '}
              <Link href="/agents" style={{ color: palette.ink }}>
                marketplace
              </Link>{' '}
              answers three messages free, no card. Bundles and single seats are priced on each
              collection page.
            </p>
          </div>
        </div>
      </section>

      <MottoStrip />
    </div>
  );
}
