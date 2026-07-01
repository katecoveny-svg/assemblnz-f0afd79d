import Link from 'next/link';
import { EDR_BRAND, EDR_TENANT, WAIT_MOMENTS } from '@/lib/customers/everyday-rewards/config';
import { Container, Eyebrow, DisplayHeading, Card, Stat } from '@/components/customers/everyday-rewards/ui';
import { TrolleyMascot, Watermark } from '@/components/customers/everyday-rewards/marks';

const BASE = '/customers/everyday-rewards/dash';

const SECTIONS = [
  {
    href: `${BASE}/partners`,
    label: 'Partners rail',
    blurb:
      'How assembl slots into the native “Collect points with our partners” list — the same rail as ASB.',
  },
  {
    href: `${BASE}/wait-states`,
    label: 'Wait moments',
    blurb:
      'Six real waits in the app, each turned into a sponsored earn surface. Click through the interaction.',
  },
  {
    href: `${BASE}/journey`,
    label: 'Shopping journey',
    blurb:
      'Browse → checkout scan → points earned → 2,000 points → $15 voucher or a travel reward.',
  },
  {
    href: `${BASE}/economics`,
    label: 'The economics',
    blurb:
      'A live model — adjust shopper base, fill rate and split, watch the revenue move.',
  },
];

export default function EverydayRewardsOverview() {
  return (
    <>
      {/* hero */}
      <section
        style={{
          position: 'relative',
          background: EDR_BRAND.orange,
          color: EDR_BRAND.white,
          overflow: 'hidden',
        }}
      >
        <Container style={{ padding: '56px 24px 64px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
              gap: 40,
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--edr-mono), monospace',
                  fontSize: 10.5,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.85)',
                  marginBottom: 18,
                }}
              >
                assembl-as-an-everyday-rewards-partner
              </div>
              <h1
                style={{
                  fontFamily: 'var(--edr-display), Georgia, serif',
                  fontWeight: 500,
                  fontSize: 54,
                  lineHeight: 1.02,
                  letterSpacing: '-0.02em',
                  margin: '0 0 18px',
                }}
              >
                Turn the small waits into{' '}
                <em style={{ fontStyle: 'italic', color: EDR_BRAND.canary }}>
                  earned points
                </em>
              </h1>
              <p
                style={{
                  fontSize: 17,
                  lineHeight: 1.55,
                  color: 'rgba(255,255,255,0.92)',
                  maxWidth: 540,
                  margin: '0 0 28px',
                }}
              >
                The Everyday Rewards app is full of small wait moments — offers
                loading, a checkout queue, a delivery ETA. assembl turns those
                seconds into a new attribution surface, with the money flowing
                straight into the shopper’s points balance. Nothing to sit
                through. Nothing to click. Same voucher rail.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link
                  href={`${BASE}/wait-states`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px 24px',
                    borderRadius: 12,
                    background: EDR_BRAND.white,
                    color: EDR_BRAND.orange,
                    fontWeight: 700,
                    fontSize: 15,
                    textDecoration: 'none',
                    boxShadow: '0 8px 20px rgba(34,48,60,0.2)',
                  }}
                >
                  See a wait moment →
                </Link>
                <Link
                  href={`${BASE}/economics`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px 24px',
                    borderRadius: 12,
                    background: 'transparent',
                    color: EDR_BRAND.white,
                    fontWeight: 700,
                    fontSize: 15,
                    textDecoration: 'none',
                    border: '2px solid rgba(255,255,255,0.5)',
                  }}
                >
                  Run the model
                </Link>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  background: EDR_BRAND.white,
                  borderRadius: 24,
                  padding: '28px 24px 20px',
                  boxShadow: '0 24px 60px rgba(34,48,60,0.28)',
                  width: '100%',
                  maxWidth: 320,
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--edr-mono), monospace',
                    fontSize: 10,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: EDR_BRAND.greyMid,
                    marginBottom: 8,
                  }}
                >
                  ◊ wait moment · live tally
                </div>
                <div
                  style={{
                    fontFamily: 'var(--edr-body), Roboto, sans-serif',
                    fontWeight: 700,
                    fontSize: 19,
                    color: EDR_BRAND.navy,
                    marginBottom: 8,
                  }}
                >
                  +12 points while your basket loaded
                </div>
                <TrolleyMascot frame="filling" width={260} />
                <div
                  style={{
                    marginTop: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 14px',
                    background: EDR_BRAND.orangeLight,
                    borderRadius: 12,
                    fontSize: 12.5,
                    color: EDR_BRAND.charcoal,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: EDR_BRAND.orange,
                      flexShrink: 0,
                    }}
                  />
                  <span>
                    Earned via{' '}
                    <strong
                      style={{
                        fontFamily: 'var(--edr-display), Georgia, serif',
                        fontWeight: 600,
                        color: EDR_BRAND.navy,
                      }}
                    >
                      assembl
                    </strong>{' '}
                    · your points, same voucher rail
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Container>
        <Watermark onDark />
      </section>

      {/* proof stats */}
      <Container style={{ padding: '48px 24px 8px' }}>
        <Eyebrow>Why a loyalty team should care</Eyebrow>
        <DisplayHeading size={34}>
          A new earn surface — from airtime you already have
        </DisplayHeading>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 28,
            marginTop: 32,
          }}
        >
          <Stat value="6" label="Native wait moments become earn surfaces" accent />
          <Stat value="0 taps" label="Nothing for the shopper to sit through or click" />
          <Stat value="2,000 pts" label="Same native threshold → $15 voucher or travel" />
          <Stat value="1 balance" label="Every point lands in the existing Everyday Rewards balance" />
        </div>
      </Container>

      {/* section cards */}
      <Container style={{ padding: '40px 24px 8px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} style={{ textDecoration: 'none' }}>
              <Card style={{ height: '100%', transition: 'transform 120ms' }}>
                <div
                  style={{
                    fontFamily: 'var(--edr-body), Roboto, sans-serif',
                    fontWeight: 700,
                    fontSize: 18,
                    color: EDR_BRAND.navy,
                    marginBottom: 8,
                  }}
                >
                  {s.label}
                </div>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: EDR_BRAND.charcoal,
                    margin: '0 0 14px',
                  }}
                >
                  {s.blurb}
                </p>
                <span style={{ color: EDR_BRAND.orange, fontWeight: 700, fontSize: 14 }}>
                  Open →
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </Container>

      {/* honest note */}
      <Container style={{ padding: '32px 24px 0' }}>
        <div
          style={{
            borderLeft: `3px solid ${EDR_BRAND.orange}`,
            paddingLeft: 18,
            maxWidth: 720,
          }}
        >
          <p style={{ fontSize: 14.5, lineHeight: 1.65, color: EDR_BRAND.charcoal, margin: 0 }}>
            <strong>This is a concept, not a live integration.</strong> We never
            invent a new currency — no “assembl points”, no “kai coins”.
            Everything earned via the {WAIT_MOMENTS.length} wait moments flows to
            the same {EDR_TENANT.displayName} balance and redeems the same way.
            assembl slots into the exact partner rail ASB already sits in.
          </p>
        </div>
      </Container>
    </>
  );
}
