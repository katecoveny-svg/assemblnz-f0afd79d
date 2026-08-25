import { EDR_BRAND, PARTNERS } from '@/lib/customers/everyday-rewards/config';
import { Container, Eyebrow, DisplayHeading, Card } from '@/components/customers/everyday-rewards/ui';
import { PhoneFrame } from '@/components/customers/everyday-rewards/PhoneFrame';
import { RLeafMark } from '@/components/customers/everyday-rewards/marks';

/** A placeholder partner logo — silhouette monogram, never a real logo. */
function PartnerGlyph({ name, isAssembl }: { name: string; isAssembl?: boolean }) {
  if (isAssembl) {
    return (
      <span
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: EDR_BRAND.assemblCharcoal,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--edr-display), Georgia, serif',
            fontWeight: 600,
            fontSize: 22,
            color: EDR_BRAND.canary,
          }}
        >
          a
        </span>
      </span>
    );
  }
  return (
    <span
      aria-label={`${name} (logo placeholder)`}
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: EDR_BRAND.greyLight,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: `1px dashed ${EDR_BRAND.greyMid}`,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--edr-body), Roboto, sans-serif',
          fontWeight: 700,
          fontSize: 15,
          color: EDR_BRAND.greyMid,
          letterSpacing: '0.02em',
        }}
      >
        {name
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()}
      </span>
    </span>
  );
}

function PartnerRow({ p }: { p: (typeof PARTNERS)[number] }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 14px',
        borderRadius: 14,
        background: p.isAssembl ? EDR_BRAND.orangeLight : EDR_BRAND.white,
        border: p.isAssembl
          ? `1.5px solid ${EDR_BRAND.orange}`
          : `1px solid ${EDR_BRAND.greyLight}`,
      }}
    >
      <PartnerGlyph name={p.name} isAssembl={p.isAssembl} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: p.isAssembl
              ? 'var(--edr-display), Georgia, serif'
              : 'var(--edr-body), Roboto, sans-serif',
            fontWeight: p.isAssembl ? 600 : 700,
            fontSize: p.isAssembl ? 17 : 15,
            color: EDR_BRAND.navy,
          }}
        >
          {p.name}
          {p.isAssembl ? (
            <span
              style={{
                fontFamily: 'var(--edr-mono), monospace',
                fontSize: 12,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: EDR_BRAND.orangeDark,
                background: EDR_BRAND.white,
                border: `1px solid ${EDR_BRAND.orange}`,
                padding: '2px 6px',
                borderRadius: 999,
              }}
            >
              new
            </span>
          ) : null}
        </div>
        <div style={{ fontSize: 12.5, color: EDR_BRAND.greyMid, marginTop: 2 }}>
          {p.category} · {p.earnLine}
        </div>
      </div>
      <span style={{ color: EDR_BRAND.greyMid, fontSize: 20, lineHeight: 1 }}>›</span>
    </div>
  );
}

export default function PartnersPage() {
  return (
    <Container style={{ padding: '48px 24px 0' }}>
      <Eyebrow>The native partner rail</Eyebrow>
      <DisplayHeading size={38}>
        assembl slots in beside ASB — no new surface required
      </DisplayHeading>
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.6,
          color: EDR_BRAND.charcoal,
          maxWidth: 640,
          margin: '16px 0 40px',
        }}
      >
        Everyday Rewards already runs a multi-partner earn model. “Collect points
        with our partners” is a native list at <code>/partners</code>, with ASB
        and others live today. assembl doesn’t need a new place in the app — it
        becomes another row in the same rail. This is the entire positioning.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto minmax(0, 1fr)',
          gap: 48,
          alignItems: 'start',
        }}
      >
        {/* phone mockup */}
        <div>
          <PhoneFrame width={340}>
            <div style={{ padding: '10px 18px 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <RLeafMark size={30} />
                <span
                  style={{
                    fontFamily: 'var(--edr-body), Roboto, sans-serif',
                    fontWeight: 700,
                    fontSize: 15,
                    color: EDR_BRAND.orange,
                  }}
                >
                  everyday rewards
                </span>
              </div>
            </div>
            <div style={{ padding: '4px 18px 12px' }}>
              <h3
                style={{
                  fontFamily: 'var(--edr-display), Georgia, serif',
                  fontWeight: 600,
                  fontSize: 22,
                  color: EDR_BRAND.navy,
                  margin: '4px 0 4px',
                }}
              >
                Collect points with our partners
              </h3>
              <p style={{ fontSize: 12.5, color: EDR_BRAND.greyMid, margin: '0 0 14px', lineHeight: 1.45 }}>
                Scan your Everyday Rewards Card to collect points when you shop
                with a partner.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PARTNERS.map((p) => (
                  <PartnerRow key={p.name} p={p} />
                ))}
              </div>
            </div>
          </PhoneFrame>
        </div>

        {/* explanation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <div style={{ fontWeight: 700, fontSize: 17, color: EDR_BRAND.navy, marginBottom: 6 }}>
              Same rail, same balance
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: EDR_BRAND.charcoal, margin: 0 }}>
              Points earned through assembl land in the shopper’s existing balance
              and redeem the same way — 2,000 points to a $15 voucher or a travel
              reward. No parallel currency, no separate wallet.
            </p>
          </Card>
          <Card>
            <div style={{ fontWeight: 700, fontSize: 17, color: EDR_BRAND.navy, marginBottom: 6 }}>
              Cross-brand, done honestly
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: EDR_BRAND.charcoal, margin: 0 }}>
              The assembl row carries a subtle canary attribution mark — enough to
              signal “earned via assembl” without competing with the Everyday
              Rewards system. Every earn moment is auditable via a Mana Receipt.
            </p>
          </Card>
          <Card style={{ background: EDR_BRAND.navy }}>
            <div
              style={{
                fontFamily: 'var(--edr-mono), monospace',
                fontSize: 12,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: EDR_BRAND.canary,
                marginBottom: 8,
              }}
            >
              placeholder note
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
              Partner logos above are silhouette placeholders (monograms in dashed
              tiles). No real ASB, BP, or Everyday Rewards artwork is used — the
              real marks go in only with each partner’s sign-off.
            </p>
          </Card>
        </div>
      </div>
    </Container>
  );
}
