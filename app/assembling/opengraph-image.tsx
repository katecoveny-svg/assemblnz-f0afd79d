import { ImageResponse } from 'next/og';

export const alt = 'assembling — Get paid for the wait. The reward layer for the agentic wait, by assembl.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Assembling brand palette (locked): white + canary + charcoal. No black, no green.
// See docs/dash-design-system.md.
const CANARY = '#BFA37A';
const INK = '#3A3832'; // charcoal text + dash bar
const GOLD = '#5A4A00'; // mono eyebrow on canary
const WHITE = '#FFFFFF';

async function loadGoogleFont(
  family: string,
  weight: string,
  text: string,
): Promise<ArrayBuffer | null> {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&text=${encodeURIComponent(text)}`;
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

export default async function DashOpengraphImage() {
  // Subset each font on the union of every string rendered below.
  const latoText = 'assembling Get paid for the wait. The reward layer for the agentic wait, by assembl.';
  const monoText = 'by assembl earn while your AI agent works · opt-in · NZ-built assembl.co.nz/assembling';

  const [lato900, lato700, mono400] = await Promise.all([
    loadGoogleFont('Lato', '900', latoText),
    loadGoogleFont('Lato', '700', latoText),
    loadGoogleFont('Space Mono', '400', monoText),
  ]);

  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 700 | 900; style: 'normal' }[] = [];
  if (lato900) fonts.push({ name: 'Lato', data: lato900, weight: 900, style: 'normal' });
  if (lato700) fonts.push({ name: 'Lato', data: lato700, weight: 700, style: 'normal' });
  if (mono400) fonts.push({ name: 'Space Mono', data: mono400, weight: 400, style: 'normal' });

  const sans = lato900 || lato700 ? 'Lato' : 'sans-serif';
  const mono = mono400 ? 'Space Mono' : 'monospace';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: CANARY,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          fontFamily: sans,
          color: INK,
        }}
      >
        {/* Top row: wordmark + eyebrow */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <span style={{ fontWeight: 900, fontSize: 46, letterSpacing: '-0.045em', color: INK }}>
              assembling
            </span>
            <span
              style={{
                display: 'flex',
                width: 44,
                height: 13,
                borderRadius: 7,
                background: INK,
                marginBottom: 9,
                marginLeft: 11,
              }}
            />
          </div>
          <span
            style={{
              fontFamily: mono,
              fontSize: 17,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: GOLD,
            }}
          >
            by assembl
          </span>
        </div>

        {/* Centre block: headline + white sub */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div
            style={{
              display: 'flex',
              fontWeight: 900,
              fontSize: 100,
              lineHeight: 0.95,
              letterSpacing: '-0.045em',
              color: INK,
              maxWidth: 820,
            }}
          >
            Get paid for the wait.
          </div>
          <div
            style={{
              display: 'flex',
              fontWeight: 700,
              fontSize: 31,
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
              color: WHITE,
              marginTop: 28,
              maxWidth: 760,
            }}
          >
            The reward layer for the agentic wait, by assembl.
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            fontFamily: mono,
            fontSize: 20,
            color: INK,
          }}
        >
          <span style={{ display: 'flex' }}>earn while your AI agent works · opt-in · NZ-built</span>
          <span style={{ display: 'flex', letterSpacing: '0.06em' }}>assembl.co.nz/assembling</span>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length > 0 ? fonts : undefined },
  );
}
