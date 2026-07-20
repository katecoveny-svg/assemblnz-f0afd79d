import { ImageResponse } from 'next/og';

import { decodeConfig } from '@/lib/build-an-agent/share';

export const runtime = 'nodejs';
export const alt = 'Build an AI agent · assembl';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// assembl brand canon
const PAPER = '#FBFAF6';
const INK = '#1A1918';
const MUTED = '#6a6560';
const CHAMPAGNE = '#BFA37A';
const CHAMPAGNE_SOFT = '#EBD9B8';

async function loadFont(family: string, weight: string, text: string): Promise<ArrayBuffer | null> {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&text=${encodeURIComponent(text)}`;
  try {
    const css = await fetch(url).then((r) => (r.ok ? r.text() : ''));
    const m = css.match(/src: url\((.+?)\) format\('woff2'\)/);
    if (!m) return null;
    const font = await fetch(m[1]).then((r) => (r.ok ? r.arrayBuffer() : null));
    return font;
  } catch {
    return null;
  }
}

export default async function OG({ searchParams }: { searchParams?: Record<string, string> }) {
  const encoded = searchParams?.c ?? '';
  const config = decodeConfig(encoded);
  const name = ((config?.name ?? '').trim() || 'your assembl agent').slice(0, 42);
  const business = ((config?.business ?? '').trim() || 'a NZ business').slice(0, 90);

  const wordmark = 'assembl';
  const eyebrow = 'AN AI AGENT, BUILT ON ASSEMBL';
  const tagline = 'assembl.co.nz/build-an-agent';
  const forLine = `for ${business.toLowerCase()}`;

  const glyphText = wordmark + eyebrow + tagline + name + forLine;
  const [cormorant, cormorantIt, mono] = await Promise.all([
    loadFont('Cormorant Garamond', '500', glyphText),
    loadFont('Cormorant Garamond', '600', name),
    loadFont('Space Mono', '400', eyebrow + tagline),
  ]);

  const fonts: Array<{ name: string; data: ArrayBuffer; weight: 400 | 500 | 600; style: 'normal' | 'italic' }> = [];
  if (cormorant)   fonts.push({ name: 'Cormorant', data: cormorant,   weight: 500, style: 'normal' });
  if (cormorantIt) fonts.push({ name: 'Cormorant', data: cormorantIt, weight: 600, style: 'italic' });
  if (mono)        fonts.push({ name: 'Mono',      data: mono,        weight: 400, style: 'normal' });

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: PAPER,
          padding: '64px 72px',
          position: 'relative',
        }}
      >
        {/* Warm horizon gradient at the top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 220,
            background: `linear-gradient(180deg, ${CHAMPAGNE_SOFT}44 0%, ${PAPER}00 100%)`,
            display: 'flex',
          }}
        />

        <div style={{ display: 'flex', flex: 1, gap: 48 }}>
          {/* LEFT: copy */}
          <div
            style={{
              flex: '1 1 0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              paddingTop: 8,
            }}
          >
            <div
              style={{
                display: 'flex',
                fontFamily: 'Cormorant',
                fontSize: 64,
                color: INK,
                letterSpacing: -1.2,
                lineHeight: 0.95,
              }}
            >
              {wordmark}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div
                style={{
                  display: 'flex',
                  fontFamily: 'Mono',
                  fontSize: 20,
                  letterSpacing: 3,
                  color: MUTED,
                }}
              >
                {eyebrow}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontFamily: 'Cormorant',
                  fontSize: 88,
                  color: INK,
                  lineHeight: 1,
                  letterSpacing: -1.4,
                  fontStyle: 'italic',
                  fontWeight: 600,
                }}
              >
                {name.toLowerCase()}
              </div>
              <div
                style={{
                  display: 'flex',
                  fontFamily: 'Cormorant',
                  fontSize: 34,
                  color: MUTED,
                  lineHeight: 1.2,
                  maxWidth: 560,
                }}
              >
                {forLine}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontFamily: 'Mono',
                fontSize: 20,
                color: MUTED,
                letterSpacing: 2,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: CHAMPAGNE,
                }}
              />
              {tagline}
            </div>
          </div>

          {/* RIGHT: chrome sphere over a shadow disc */}
          <div
            style={{
              flex: '0 0 460px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                position: 'absolute',
                bottom: 100,
                width: 360,
                height: 40,
                borderRadius: '50%',
                background:
                  'radial-gradient(ellipse at center, rgba(26,25,24,0.18) 0%, rgba(26,25,24,0) 70%)',
              }}
            />
            <div
              style={{
                display: 'flex',
                width: 360,
                height: 360,
                borderRadius: '50%',
                background: `radial-gradient(circle at 30% 28%, #ffffff 0%, ${CHAMPAGNE_SOFT} 22%, #d5c39a 45%, #86754c 78%, #3a3125 100%)`,
                position: 'relative',
                boxShadow: `inset -30px -50px 90px rgba(26,25,24,0.35), inset 40px 40px 100px ${CHAMPAGNE_SOFT}55`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  position: 'absolute',
                  top: 42,
                  left: 92,
                  width: 100,
                  height: 60,
                  borderRadius: '50%',
                  background:
                    'radial-gradient(ellipse at center, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%)',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) rotate(-8deg)',
                  width: 440,
                  height: 96,
                  borderRadius: '50%',
                  border: `3px solid ${CHAMPAGNE}`,
                  opacity: 0.7,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fonts.length ? fonts : undefined,
    },
  );
}
