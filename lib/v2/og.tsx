import { ImageResponse } from 'next/og';

/** Shared OG image template for current assembl company surfaces. */

const PAPER = '#FFFDFB';
const CHALK = '#F5F1F2';
const DEEP_PLUM = '#240B21';
const MUTED_PLUM = '#654A4E';
const DUSTY_ROSE = '#916A70';

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

// Deterministic assembly field: individual pieces move toward one coherent line.
const PIECES: Array<[number, number, number, number]> = [
  [900, 96, 22, 10],
  [946, 128, 14, 14],
  [1001, 88, 30, 8],
  [1044, 146, 16, 16],
  [1094, 104, 20, 10],
  [1138, 162, 10, 10],
  [918, 194, 13, 13],
  [974, 210, 26, 8],
  [1034, 224, 12, 12],
  [1090, 236, 32, 8],
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
  const text = `${headline}assembl${sub ?? ''}${eyebrow}`;
  const instrument = await loadGoogleFont('Instrument Sans', '600', text);

  const fonts: Array<{ name: string; data: ArrayBuffer; weight: 600; style: 'normal' }> = [];
  if (instrument) fonts.push({ name: 'Instrument Sans', data: instrument, weight: 600, style: 'normal' });

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
          padding: '68px 78px 54px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -90,
            width: 520,
            height: 520,
            borderRadius: 520,
            background: CHALK,
          }}
        />

        {PIECES.map(([x, y, w, h], i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: w,
              height: h,
              borderRadius: 99,
              backgroundColor: i % 3 === 0 ? DUSTY_ROSE : i % 3 === 1 ? MUTED_PLUM : DEEP_PLUM,
              opacity: i < 6 ? 0.86 : 0.56,
              transform: `rotate(${i % 2 === 0 ? -8 : 8}deg)`,
            }}
          />
        ))}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 18,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: MUTED_PLUM,
            fontFamily: instrument ? 'Instrument Sans' : 'sans-serif',
            fontWeight: 600,
          }}
        >
          <div style={{ width: 26, height: 6, borderRadius: 99, backgroundColor: DUSTY_ROSE }} />
          {eyebrow}
        </div>

        <div
          style={{
            display: 'flex',
            maxWidth: 875,
            fontFamily: instrument ? 'Instrument Sans' : 'sans-serif',
            fontSize: 86,
            lineHeight: 0.98,
            letterSpacing: '-0.055em',
            color: DEEP_PLUM,
            fontWeight: 600,
          }}
        >
          {headline}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%',
            gap: 28,
          }}
        >
          <div
            style={{
              display: 'flex',
              maxWidth: 760,
              fontSize: 23,
              lineHeight: 1.35,
              color: MUTED_PLUM,
              fontFamily: instrument ? 'Instrument Sans' : 'sans-serif',
            }}
          >
            {sub ?? ''}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              fontFamily: instrument ? 'Instrument Sans' : 'sans-serif',
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: '-0.04em',
              color: DEEP_PLUM,
            }}
          >
            assembl
            <span style={{ display: 'flex', width: 18, height: 6, borderRadius: 99, backgroundColor: DUSTY_ROSE }} />
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined },
  );
}
