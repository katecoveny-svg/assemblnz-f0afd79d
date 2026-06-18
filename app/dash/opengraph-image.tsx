import { ImageResponse } from 'next/og';

export const alt = 'Dash by assembl — they wait. You earn. Publishers keep 55%.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Dash microsite palette (locked).
const CREAM = '#FAF7F2';
const CREAM_2 = '#F4EFE6';
const INK = '#1B1F1D';
const INK_SOFT = '#3A413D';
const POUNAMU = '#2B6B57';
const POUNAMU_DARK = '#1F4F40';
const AMBER = '#D9A85A';
const AMBER_DIM = '#B88A45';

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

export default async function DashOpengraphImage() {
  // Subset BOTH fonts on the full union of every string rendered below, so no
  // glyph silently falls back to the other family.
  const allText =
    'Dash by assembl BUILT IN AOTEAROA Built in Aotearoa They wait. You earn. ' +
    'When your software says “thinking…”, we turn it into NZ ad revenue. ' +
    'Drafting your reply · Westpac — visit our small business hubs ' +
    'Publishers keep 55% assembl.co.nz/dash';

  const [cormorant, inter] = await Promise.all([
    loadGoogleFont('Cormorant Garamond', '600', allText),
    loadGoogleFont('Inter', '400;500;600', allText),
  ]);

  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 500 | 600; style: 'normal' }[] = [];
  if (cormorant) fonts.push({ name: 'Cormorant Garamond', data: cormorant, weight: 600, style: 'normal' });
  if (inter) {
    fonts.push({ name: 'Inter', data: inter, weight: 400, style: 'normal' });
    fonts.push({ name: 'Inter', data: inter, weight: 500, style: 'normal' });
    fonts.push({ name: 'Inter', data: inter, weight: 600, style: 'normal' });
  }

  const display = cormorant ? 'Cormorant Garamond' : 'serif';
  const sans = inter ? 'Inter' : 'sans-serif';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: CREAM,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          fontFamily: sans,
          color: INK,
        }}
      >
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontFamily: display, fontSize: 34, fontWeight: 600, color: INK }}>Dash</span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: INK_SOFT,
            }}
          >
            by
          </span>
          <span style={{ fontFamily: display, fontSize: 34, fontWeight: 600, color: POUNAMU }}>
            assembl
          </span>
        </div>

        {/* Centre block */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 17,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: POUNAMU,
              fontWeight: 600,
              marginBottom: 18,
            }}
          >
            Built in Aotearoa
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: display,
              fontSize: 104,
              lineHeight: 0.98,
              fontWeight: 600,
              letterSpacing: '-0.025em',
              color: INK,
            }}
          >
            They wait. You earn.
          </div>
          <div style={{ display: 'flex', marginTop: 18 }}>
            <div style={{ display: 'flex', width: 280, height: 4, background: POUNAMU }} />
            <div style={{ display: 'flex', width: 96, height: 4, background: AMBER, marginLeft: -40, marginTop: 0 }} />
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 27,
              lineHeight: 1.3,
              color: INK_SOFT,
              marginTop: 26,
              maxWidth: 940,
              fontWeight: 400,
            }}
          >
            When your software says &ldquo;thinking…&rdquo;, we turn it into NZ ad revenue.
          </div>
        </div>

        {/* Demo chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: POUNAMU_DARK,
            borderRadius: 14,
            padding: '18px 24px',
            fontSize: 22,
            color: CREAM,
          }}
        >
          <span style={{ display: 'flex' }}>Drafting your reply</span>
          <span style={{ display: 'flex', color: 'rgba(250,247,242,0.45)', margin: '0 10px' }}>·</span>
          <span style={{ display: 'flex', color: AMBER, fontWeight: 600 }}>
            Westpac — visit our small business hubs
          </span>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            fontSize: 22,
            color: INK_SOFT,
            fontWeight: 500,
          }}
        >
          <span style={{ display: 'flex', color: AMBER_DIM, fontWeight: 600 }}>
            Publishers keep 55%
          </span>
          <span style={{ display: 'flex', letterSpacing: '0.06em' }}>assembl.co.nz/dash</span>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length > 0 ? fonts : undefined },
  );
}
