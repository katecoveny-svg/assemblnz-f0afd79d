import { ImageResponse } from 'next/og';

/**
 * Shared OG image template for the v2 marketing site —
 * DIRECTION-LOCKED-2026-07-01: warm paper, lowercase Cormorant headline with
 * the champagne-gold full stop, sparse gold constellation, tiny lowercase wordmark.
 */

const PAPER = '#FBFAF6';
const INK = '#1A1918';
const BODY = '#5A5850';
const GOLD_BRIGHT = '#C8A876';
const GOLD_SOFT = '#D9B87A';
const SILVER = '#B5B0A2';

export const OG_SIZE = { width: 1200, height: 630 };

async function loadGoogleFont(
  family: string,
  weights: string,
  text: string,
): Promise<ArrayBuffer | null> {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weights}&text=${encodeURIComponent(text)}`;
  try {
    const cssRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    const match = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype|woff2?)'\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

// Fixed constellation geometry (no randomness — deterministic output).
const STARS: Array<[number, number, number, boolean?]> = [
  [1010, 120, 7, true],
  [930, 78, 4],
  [1085, 74, 5, true],
  [1130, 140, 4],
  [1058, 190, 5],
  [968, 176, 4, true],
  [900, 132, 3],
];
const LINKS: Array<[number, number]> = [
  [0, 1],
  [0, 2],
  [0, 4],
  [0, 5],
  [1, 6],
  [2, 3],
  [3, 4],
  [5, 6],
];

export async function v2OgImage({
  eyebrow,
  headline,
  sub,
}: {
  eyebrow: string;
  headline: string;
  sub?: string;
}) {
  const text = `${headline}.assembl${sub ?? ''}${eyebrow}`;
  const [cormorant] = await Promise.all([loadGoogleFont('Cormorant Garamond', '500', text)]);

  const fonts: Array<{ name: string; data: ArrayBuffer; weight: 500; style: 'normal' }> = [];
  if (cormorant) fonts.push({ name: 'Cormorant', data: cormorant, weight: 500, style: 'normal' });

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: PAPER,
          padding: '72px 84px 56px',
          position: 'relative',
        }}
      >
        {/* constellation */}
        <svg
          width="1200"
          height="630"
          viewBox="0 0 1200 630"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {LINKS.map(([a, b], i) => (
            <line
              key={`l${i}`}
              x1={STARS[a][0]}
              y1={STARS[a][1]}
              x2={STARS[b][0]}
              y2={STARS[b][1]}
              stroke={GOLD_SOFT}
              strokeWidth="1"
              opacity="0.45"
            />
          ))}
          {STARS.map(([x, y, r, bright], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={bright ? GOLD_BRIGHT : GOLD_SOFT} opacity="0.85" />
          ))}
          {/* quiet particulate ridge along the bottom */}
          {Array.from({ length: 60 }).map((_, i) => {
            const x = 20 + i * 20;
            const y = 560 - Math.abs(Math.sin(i / 6.5)) * 60 - (i % 5) * 4;
            return (
              <circle
                key={`d${i}`}
                cx={x}
                cy={y}
                r={i % 7 === 0 ? 3 : 2}
                fill={i % 9 === 0 ? GOLD_SOFT : SILVER}
                opacity={0.35}
              />
            );
          })}
        </svg>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 20,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: BODY,
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{ width: 10, height: 10, borderRadius: 10, backgroundColor: GOLD_BRIGHT }}
          />
          {eyebrow}
        </div>

        <div
          style={{
            display: 'flex',
            fontFamily: cormorant ? 'Cormorant' : 'serif',
            fontSize: 88,
            lineHeight: 1.05,
            color: INK,
            maxWidth: 860,
            textTransform: 'lowercase',
          }}
        >
          {headline}
          <span style={{ color: GOLD_BRIGHT }}>.</span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', fontSize: 24, color: BODY, fontFamily: 'sans-serif', maxWidth: 760 }}>
            {sub ?? ''}
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: cormorant ? 'Cormorant' : 'serif',
              fontSize: 34,
              letterSpacing: '0.3em',
              color: INK,
            }}
          >
            assembl
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined },
  );
}
