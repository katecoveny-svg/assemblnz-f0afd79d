import { ImageResponse } from 'next/og';

export const alt = 'Mana Receipts — the honest trust page';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// CANON palette (locked 2026-06-23).
const GOLD_ACCENT = '#BFA37A';
const INK = '#3A3832';
const BODY = '#56544B';
const CREAM = '#FFF7EC';
const GOLD = '#BFA37A';
const HAIRLINE = '#EFEADC';

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

export default async function ManaReceiptsOgImage() {
  const headline = 'The receipt is the proof.';
  const italic = 'Every run gets one.';
  const eyebrow = 'TRUST · KAITIAKITANGA · MANA RECEIPTS · ASSEMBL.CO.NZ';

  const [cormorant, cormorantItalic, mono] = await Promise.all([
    loadGoogleFont('Cormorant Garamond', '500', headline),
    loadGoogleFont('Cormorant Garamond', '700', italic),
    loadGoogleFont('Space Mono', '700', eyebrow),
  ]);

  const fonts: {
    name: string;
    data: ArrayBuffer;
    weight: 500 | 700;
    style: 'normal' | 'italic';
  }[] = [];
  if (cormorant) fonts.push({ name: 'Cormorant', data: cormorant, weight: 500, style: 'normal' });
  if (cormorantItalic)
    fonts.push({ name: 'Cormorant', data: cormorantItalic, weight: 700, style: 'italic' });
  if (mono) fonts.push({ name: 'Mono', data: mono, weight: 700, style: 'normal' });

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: CREAM,
          padding: '72px 80px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 12,
            background: `linear-gradient(90deg, ${GOLD_ACCENT} 0%, #D9B87A 50%, #8A6B4E 100%)`,
          }}
        />
        <div
          style={{
            fontFamily: 'Mono',
            fontSize: 22,
            letterSpacing: 4,
            color: GOLD,
            fontWeight: 700,
          }}
        >
          {eyebrow}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'Cormorant', fontSize: 96, color: INK, lineHeight: 1 }}>
            {headline}
          </div>
          <div
            style={{
              fontFamily: 'Cormorant',
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: 96,
              color: GOLD,
              lineHeight: 1.05,
            }}
          >
            {italic}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontFamily: 'Mono',
            fontSize: 24,
            color: BODY,
            borderTop: `1px solid ${HAIRLINE}`,
            paddingTop: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <span style={{ fontFamily: 'Cormorant', fontSize: 44, color: INK, fontWeight: 500 }}>
              assembl
            </span>
            <div
              style={{ width: 34, height: 11, borderRadius: 4, background: GOLD_ACCENT, marginBottom: 12 }}
            />
          </div>
          <span style={{ color: BODY }}>·  Aligned with the Privacy Act 2020 + IPP 3A</span>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
