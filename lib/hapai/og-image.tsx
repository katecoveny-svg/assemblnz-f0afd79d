import { ImageResponse } from 'next/og';
import type { HapaiTool } from '@/lib/hapai/shareable-tools';

/**
 * Shared HAPAI share-card renderer.
 *
 * Used by both the dynamic `/hapai/[slug]/opengraph-image` route and any tool
 * that lives outside `/hapai/` and needs its own same-path OG route (e.g.
 * `/electrify/opengraph-image`). Keeping one renderer means every tool's share
 * card and its tool page stay visually consistent and on the same slug.
 */

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';
export const ogAlt = 'assembl HAPAI share card';

const CREAM = '#FAF7F2';
const CREAM2 = '#EFE3CE'; // ceramic disc tone, shows against the cream field
const POUNAMU = '#2B6B57';
const POUNAMU_DARK = '#103F35';
const INK = '#23211F';
const TAUPE = '#7C7268';
const LINE = '#DED7CD';
const AMBER = '#D9A85A';

// One accent per category — the same map the on-site tool cover uses, so the
// share card's vessel mark matches the card a visitor sees on /hapai.
const CATEGORY_ACCENT = {
  adoption: '#C9A24B',
  operations: '#2B6B57',
  marketing: '#AC5838',
  record: '#5B4FA0',
  lifestyle: '#D4842A',
  education: '#3B7CB5',
} as const;

const categoryLabels = {
  adoption: 'adoption',
  operations: 'operations',
  marketing: 'marketing',
  record: 'records',
  lifestyle: 'lifestyle',
  education: 'education',
} as const;

async function loadGoogleFont(url: string): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
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

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
}

export async function renderHapaiToolOgImage(tool: HapaiTool) {
  const route = `assembl.co.nz${tool.href}`;
  const accent = CATEGORY_ACCENT[tool.category] ?? POUNAMU;
  const fontText = `assembl HAPAI live tool ${tool.name} ${tool.description} ${tool.posture} ${route}`;
  const [cormorantNormal, cormorantItalic, inter] = await Promise.all([
    loadGoogleFont(`https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400&text=${encodeURIComponent(fontText)}`),
    loadGoogleFont(`https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,400&text=${encodeURIComponent(fontText)}`),
    loadGoogleFont(`https://fonts.googleapis.com/css2?family=Inter:wght@400;500&text=${encodeURIComponent(fontText)}`),
  ]);
  const headlineFont = cormorantNormal || cormorantItalic ? 'Cormorant Garamond' : 'serif';
  const bodyFont = inter ? 'Inter' : 'sans-serif';
  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 500; style: 'normal' | 'italic' }[] = [];

  if (cormorantNormal) {
    fonts.push({ name: 'Cormorant Garamond', data: cormorantNormal, weight: 400, style: 'normal' });
  }

  if (cormorantItalic) {
    fonts.push({ name: 'Cormorant Garamond', data: cormorantItalic, weight: 400, style: 'italic' });
  }

  if (inter) {
    fonts.push({ name: 'Inter', data: inter, weight: 400, style: 'normal' });
    fonts.push({ name: 'Inter', data: inter, weight: 500, style: 'normal' });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: CREAM,
          color: INK,
          fontFamily: bodyFont,
          padding: 58,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 76% 27%, rgba(43,107,87,0.16), transparent 34%), radial-gradient(circle at 86% 82%, rgba(217,168,90,0.18), transparent 30%)',
          }}
        />
        {/* soft accent ring behind the mark */}
        <div
          style={{
            position: 'absolute',
            right: 78,
            top: 70,
            width: 320,
            height: 320,
            border: `1px solid ${LINE}`,
            borderRadius: 999,
            opacity: 0.8,
          }}
        />
        {/* Vessel mark — the flat echo of the on-site tool cover, tinted by the
            tool's category accent so the share card matches the live card. */}
        <div
          style={{
            position: 'absolute',
            right: 96,
            top: 96,
            width: 284,
            height: 300,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 9,
          }}
        >
          {[
            { w: 22, h: 22, bg: accent, border: false },
            { w: 86, h: 42, bg: CREAM2, border: true },
            { w: 152, h: 28, bg: accent, border: false },
            { w: 130, h: 24, bg: CREAM2, border: true },
            { w: 170, h: 28, bg: accent, border: false },
            { w: 150, h: 26, bg: CREAM2, border: true },
            { w: 180, h: 34, bg: CREAM2, border: true },
          ].map((d, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                width: d.w,
                height: d.h,
                background: d.bg,
                borderRadius: 999,
                border: d.border ? `1px solid ${LINE}` : 'none',
              }}
            />
          ))}
          {/* gold easel base line */}
          <div style={{ display: 'flex', width: 150, height: 4, background: AMBER, borderRadius: 999, marginTop: 6 }} />
        </div>

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            border: `1px solid ${LINE}`,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.54)',
            padding: '44px 52px',
            boxShadow: '0 32px 90px rgba(35,33,31,0.10)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', color: INK, fontFamily: headlineFont, fontSize: 58, lineHeight: 1 }}>
                assembl
              </div>
              <div
                style={{
                  display: 'flex',
                  marginTop: 16,
                  color: TAUPE,
                  fontSize: 19,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                }}
              >
                HAPAI · {categoryLabels[tool.category]}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                border: `1px solid rgba(43,107,87,0.24)`,
                background: 'rgba(250,247,242,0.84)',
                color: POUNAMU,
                borderRadius: 999,
                padding: '11px 17px',
                fontSize: 16,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              live tool
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 780 }}>
            <div
              style={{
                display: 'flex',
                color: POUNAMU_DARK,
                fontFamily: headlineFont,
                fontStyle: 'italic',
                fontSize: tool.name.length > 23 ? 82 : 104,
                lineHeight: 0.92,
              }}
            >
              {tool.name}
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: 26,
                maxWidth: 710,
                color: INK,
                fontSize: 32,
                lineHeight: 1.24,
              }}
            >
              {truncate(tool.description, 126)}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', color: TAUPE, fontSize: 18, lineHeight: 1.42 }}>
              <span>{truncate(tool.posture, 118)}</span>
              <span style={{ marginTop: 10, color: POUNAMU, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {route}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                width: 132,
                height: 5,
                background: POUNAMU,
                boxShadow: `28px 0 0 ${AMBER}`,
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...ogSize, fonts },
  );
}
