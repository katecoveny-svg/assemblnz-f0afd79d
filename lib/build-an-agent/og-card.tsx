import { ImageResponse } from 'next/og';

import type { BuildConfig } from './config';

/**
 * The shareable agent card — one renderer used by both the static
 * opengraph-image (default card) and the /build-an-agent/og route
 * (personalised card from ?c=). New canon (2026-07-20): paper/ink/fog/
 * silver-chrome + one restrained sea-glass accent; every form on the card
 * means something (identity core, boundaries shell, labelled modules) —
 * "see what your AI is made of."
 */

export const OG_SIZE = { width: 1200, height: 630 };

const PAPER = '#FBFAF6';
const INK = '#1A1918';
const MUTED = '#6a6560';
const FOG = '#ECECE8';
const SEAGLASS = '#7FA8A0';
const HAIRLINE = 'rgba(26, 25, 24, 0.14)';

/**
 * Satori supports TTF/OTF/WOFF — NOT woff2. A legacy user-agent makes Google
 * Fonts return woff/truetype URLs. (The first version fetched woff2 and
 * silently fell back to the default font on every card.)
 */
async function loadFont(family: string, weight: string, text: string): Promise<ArrayBuffer | null> {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&text=${encodeURIComponent(text)}`;
  try {
    const css = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; rv:10.0) Gecko/20100101 Firefox/10.0' },
    }).then((r) => (r.ok ? r.text() : ''));
    const m = css.match(/src: url\((.+?)\) format\('(?:woff|truetype|opentype)'\)/);
    if (!m) return null;
    return await fetch(m[1]).then((r) => (r.ok ? r.arrayBuffer() : null));
  } catch {
    return null;
  }
}

function Module({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      {children}
      <div
        style={{
          display: 'flex',
          fontFamily: 'Mono',
          fontSize: 13,
          letterSpacing: 2.5,
          color: MUTED,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export async function renderAgentCard(config: Partial<BuildConfig> | null): Promise<ImageResponse> {
  const name = ((config?.name ?? '').trim() || 'your assembl agent').slice(0, 42).toLowerCase();
  const business = ((config?.business ?? '').trim() || 'a NZ business').slice(0, 80);

  const eyebrow = 'SEE WHAT YOUR AI IS MADE OF';
  const forLine = `for ${business.toLowerCase()}`;
  const url = 'assembl.co.nz/build-an-agent';
  const labels = 'IDENTITY KNOWLEDGE ABILITIES CONNECTED APPS BOUNDARIES APPROVALS TESTS';

  const [cormorant, cormorantIt, mono, lato] = await Promise.all([
    loadFont('Cormorant Garamond', '500', 'assembl' + forLine),
    loadFont('Cormorant Garamond', '600', name + 'assembl'),
    loadFont('Space Mono', '400', eyebrow + url + labels + '·'),
    loadFont('Lato', '400', forLine),
  ]);

  const fonts: Array<{ name: string; data: ArrayBuffer; weight: 400 | 500 | 600; style: 'normal' | 'italic' }> = [];
  if (cormorant) fonts.push({ name: 'Cormorant', data: cormorant, weight: 500, style: 'normal' });
  if (cormorantIt) fonts.push({ name: 'Cormorant', data: cormorantIt, weight: 600, style: 'italic' });
  if (mono) fonts.push({ name: 'Mono', data: mono, weight: 400, style: 'normal' });
  if (lato) fonts.push({ name: 'Lato', data: lato, weight: 400, style: 'normal' });

  // Silver chrome — the agent identity core. Not gold; not iridescent.
  const chrome =
    'radial-gradient(circle at 34% 28%, #FFFFFF 0%, #EDEFF1 26%, #C6CBD0 52%, #83898F 78%, #43484D 100%)';
  const chromeLite = 'linear-gradient(135deg, #F6F7F8 0%, #D9DDE0 55%, #AEB4B9 100%)';
  const frost = 'linear-gradient(145deg, rgba(255,255,255,0.85) 0%, rgba(236,236,232,0.55) 100%)';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: PAPER,
          padding: '56px 64px',
          position: 'relative',
        }}
      >
        {/* Soft fog wash, top — airy, never dark. */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 200,
            background: `linear-gradient(180deg, ${FOG} 0%, ${PAPER} 100%)`,
            opacity: 0.5,
          }}
        />

        {/* ── LEFT · editorial column ── */}
        <div
          style={{
            flex: '1.02 1 0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            paddingRight: 24,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
            <div
              style={{
                display: 'flex',
                fontFamily: 'Cormorant',
                fontSize: 46,
                color: INK,
                letterSpacing: -0.8,
              }}
            >
              assembl
            </div>
            <div
              style={{
                display: 'flex',
                fontFamily: 'Mono',
                fontSize: 17,
                letterSpacing: 4,
                color: MUTED,
              }}
            >
              {eyebrow}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                display: 'flex',
                fontFamily: 'Cormorant',
                fontStyle: 'italic',
                fontWeight: 600,
                fontSize: name.length > 22 ? 62 : 78,
                lineHeight: 1.02,
                color: INK,
                letterSpacing: -1,
              }}
            >
              {name}
            </div>
            <div style={{ display: 'flex', fontFamily: 'Lato', fontSize: 27, color: MUTED }}>
              {forLine}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontFamily: 'Mono',
              fontSize: 17,
              letterSpacing: 2,
              color: MUTED,
              borderTop: `1px solid ${HAIRLINE}`,
              paddingTop: 22,
            }}
          >
            <div style={{ display: 'flex', width: 9, height: 9, borderRadius: 99, background: SEAGLASS }} />
            {url}
          </div>
        </div>

        {/* ── RIGHT · the assembly — every form means something ── */}
        <div
          style={{
            flex: '0 0 520px',
            display: 'flex',
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* boundaries — the clear outer shell around everything */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              width: 480,
              height: 480,
              borderRadius: 999,
              border: `1.5px solid ${HAIRLINE}`,
            }}
          />
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 6,
              fontFamily: 'Mono',
              fontSize: 13,
              letterSpacing: 2.5,
              color: MUTED,
              background: PAPER,
              padding: '2px 10px',
            }}
          >
            BOUNDARIES
          </div>

          {/* connection lines from the core (sea-glass = the active one) */}
          <div style={{ display: 'flex', position: 'absolute', width: 120, height: 1.5, background: HAIRLINE, transform: 'translate(-120px, -92px) rotate(-32deg)' }} />
          <div style={{ display: 'flex', position: 'absolute', width: 120, height: 1.5, background: SEAGLASS, transform: 'translate(122px, -70px) rotate(24deg)' }} />
          <div style={{ display: 'flex', position: 'absolute', width: 104, height: 1.5, background: HAIRLINE, transform: 'translate(-116px, 92px) rotate(30deg)' }} />
          <div style={{ display: 'flex', position: 'absolute', width: 104, height: 1.5, background: HAIRLINE, transform: 'translate(118px, 96px) rotate(-26deg)' }} />

          {/* identity — the chrome core */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                display: 'flex',
                width: 190,
                height: 190,
                borderRadius: 999,
                background: chrome,
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  position: 'absolute',
                  top: 26,
                  left: 44,
                  width: 62,
                  height: 34,
                  borderRadius: 999,
                  background:
                    'radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)',
                }}
              />
            </div>
            <div style={{ display: 'flex', fontFamily: 'Mono', fontSize: 14, letterSpacing: 3, color: INK }}>
              IDENTITY
            </div>
          </div>

          {/* knowledge — translucent cube */}
          <div style={{ display: 'flex', position: 'absolute', top: 64, left: 40 }}>
            <Module label="KNOWLEDGE">
              <div
                style={{
                  display: 'flex',
                  width: 62,
                  height: 62,
                  borderRadius: 14,
                  background: frost,
                  border: `1px solid ${HAIRLINE}`,
                }}
              />
            </Module>
          </div>

          {/* connected apps — orbiting tile (active · sea-glass) */}
          <div style={{ display: 'flex', position: 'absolute', top: 58, right: 22 }}>
            <Module label="CONNECTED APPS">
              <div
                style={{
                  display: 'flex',
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: '#FFFFFF',
                  border: `1.5px solid ${SEAGLASS}`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ display: 'flex', width: 18, height: 18, borderRadius: 99, background: SEAGLASS, opacity: 0.75 }} />
              </div>
            </Module>
          </div>

          {/* abilities — chrome capsule */}
          <div style={{ display: 'flex', position: 'absolute', bottom: 74, left: 34 }}>
            <Module label="ABILITIES">
              <div
                style={{
                  display: 'flex',
                  width: 84,
                  height: 40,
                  borderRadius: 999,
                  background: chromeLite,
                  border: '1px solid rgba(26,25,24,0.08)',
                }}
              />
            </Module>
          </div>

          {/* approvals — small attached cube · tests — inspection ring */}
          <div style={{ display: 'flex', position: 'absolute', bottom: 66, right: 30, gap: 26 }}>
            <Module label="APPROVALS">
              <div
                style={{
                  display: 'flex',
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: INK,
                  opacity: 0.85,
                }}
              />
            </Module>
            <Module label="TESTS">
              <div
                style={{
                  display: 'flex',
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  border: `2.5px solid ${SEAGLASS}`,
                }}
              />
            </Module>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined },
  );
}
