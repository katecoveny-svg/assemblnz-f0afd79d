'use client';

/**
 * Client half of the /dev/canvas smoke test. Imports EVERY export of
 * `@assembl/canvas` (and the `/motion` subpath) so a green Next build
 * proves the whole package surface compiles for consumers.
 */

import {
  AssemblingLoader,
  BundleCard,
  Constellation,
  KpiTrio,
  MicroLabel,
  ParticulateLandscape,
  RightRail,
  motto,
  palette,
  tokens,
  typography,
} from '@assembl/canvas';
import { assemblingLoader, drift, levitate, pulse } from '@assembl/canvas/motion';

// The motion variants are consumed here so the /motion entry is exercised
// by the smoke test even though the components already use them internally.
const motionPrimitives = { drift, pulse, levitate, assemblingLoader } as const;

const display = {
  fontFamily: typography.display.fontFamily,
  fontWeight: typography.display.fontWeight,
  letterSpacing: typography.display.letterSpacing,
  textTransform: 'lowercase',
  color: palette.ink,
  margin: 0,
} as const;

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <MicroLabel as="h2">{label}</MicroLabel>
      {children}
    </section>
  );
}

export function CanvasDemo() {
  // Real counts derived from the package itself — never invented metrics.
  const primitiveCount = Object.keys(motionPrimitives).length;
  const swatches = Object.entries(tokens.palette);

  return (
    <div style={{ color: palette.ink, fontFamily: typography.body.fontFamily }}>
      {/* hero band: the particulate landscape with type floating over it */}
      <div style={{ position: 'relative', height: 380, overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <ParticulateLandscape />
        </div>
        <div aria-hidden style={{ position: 'absolute', top: 28, right: 40 }}>
          <Constellation size={110} />
        </div>
        <div style={{ position: 'relative', padding: '72px 48px 0', maxWidth: 640 }}>
          <MicroLabel>assembl · design system</MicroLabel>
          <h1 style={{ ...display, fontSize: 56, lineHeight: 1.05, marginTop: 16 }}>
            the canvas<span style={{ color: palette.accentGold }}>.</span>
          </h1>
          <p style={{ color: palette.bodyGrey, fontSize: 15, lineHeight: 1.55, maxWidth: 420 }}>
            every export of @assembl/canvas, rendered once. direction locked
            2026-07-01.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 56,
          padding: '48px 48px 96px',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <Section label="assembling loader — the branded typing state">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 40,
              padding: 24,
              borderRadius: 16,
              border: `1px solid ${palette.hairline}`,
              background: '#FFFFFF',
            }}
          >
            <AssemblingLoader />
            <AssemblingLoader size={28} />
            <AssemblingLoader label="thinking…" size={16} />
          </div>
        </Section>

        <Section label="bundle cards — levitate on hover">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            <BundleCard
              title="trust"
              description="monitors risk, ensures compliance, builds confidence."
              tags={['risk', 'compliance']}
              meta="bundle"
              gold
            />
            <BundleCard
              title="insights"
              description="turns data and signals into actionable insight."
              tags={['analytics', 'intelligence']}
              meta="bundle"
            />
            <BundleCard
              title="workflow"
              description="designs, runs, and optimises end-to-end processes."
              tags={['automation', 'orchestration']}
              meta="bundle"
            />
          </div>
        </Section>

        <Section label="right rail + kpi trio">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 480px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              <KpiTrio
                stats={[
                  { label: 'exported components', value: 7, hint: 'plus tokens' },
                  { label: 'motion primitives', value: primitiveCount, hint: 'drift · pulse · levitate · loader' },
                  { label: 'palette tokens', value: swatches.length, hint: 'verbatim from the locked canon' },
                ]}
              />
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 10,
                  padding: 20,
                  borderRadius: 14,
                  border: `1px solid ${palette.hairline}`,
                  background: '#FFFFFF',
                }}
              >
                {swatches.map(([name, hex]) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      aria-hidden
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 6,
                        background: hex,
                        border: `1px solid ${palette.hairline}`,
                        display: 'inline-block',
                      }}
                    />
                    <span style={{ fontSize: 11, color: palette.bodyGrey }}>
                      {name} {hex}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <RightRail
              eyebrow="collection"
              title="trust"
              subtitle="compliance & risk"
              footer={<span>view collection →</span>}
            >
              {['risk monitor', 'policy enforcer', 'audit trail'].map((agent) => (
                <div
                  key={agent}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: `1px solid ${palette.hairline}`,
                    background: '#FFFFFF',
                    fontSize: 13,
                  }}
                >
                  <span>{agent}</span>
                  <span aria-hidden style={{ color: palette.accentGold }}>•</span>
                </div>
              ))}
            </RightRail>
          </div>
        </Section>

        <Section label="reduced-motion static fallback">
          <div
            style={{
              position: 'relative',
              height: 200,
              overflow: 'hidden',
              borderRadius: 16,
              border: `1px solid ${palette.hairline}`,
              background: palette.paperDeep,
            }}
          >
            <ParticulateLandscape seed={42} />
          </div>
          <p style={{ color: palette.bodyGrey, fontSize: 13, margin: 0 }}>
            alternate seed — deterministic, so server and client always agree.
            under prefers-reduced-motion everything above holds still.
          </p>
        </Section>

        <footer
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            paddingTop: 40,
            borderTop: `1px solid ${palette.hairline}`,
          }}
        >
          <Constellation size={48} />
          <MicroLabel>{motto}</MicroLabel>
        </footer>
      </div>
    </div>
  );
}
