import { ImageResponse } from 'next/og';
import type { DashToolConfig } from '@/lib/hapai/dash/tools';

/**
 * Dash-brand HAPAI share card (locked palette, 2026-06-23).
 *
 * Cream canvas, charcoal Lato 900 headline, one champagne accent (the pill-dash
 * under the tool name). Numbers tools lead with one giant figure — that figure
 * is the share asset (brand note in viral-hapai-shortlist.md).
 */

export const dashOgSize = { width: 1200, height: 630 };
export const dashOgContentType = 'image/png';
export const dashOgAlt = 'assembl HAPAI — Dash share card';

// Locked Dash palette.
const CREAM = '#FFF7EC';
const PAPER = '#FFFFFF';
const INK = '#3A3832'; // charcoal
const BODY = '#56544B';
const CHAMPAGNE = '#BFA37A';
const GOLD = '#C79B1F';
const MUTED = '#8A8678';
const HAIRLINE = '#EFEADC';

async function loadGoogleFont(url: string): Promise<ArrayBuffer | null> {
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

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
}

export async function renderDashToolOgImage(tool: DashToolConfig) {
  const route = `assembl.co.nz/hapai/${tool.slug}`;
  const fontText = `${tool.name} ${tool.description} ${tool.eyebrow} ${tool.ogFigure ?? ''} ${tool.ogFigureLabel ?? ''} ${route} HAPAI tool live assembl`;
  const [lato900, lato700, mono] = await Promise.all([
    loadGoogleFont(`https://fonts.googleapis.com/css2?family=Lato:wght@900&text=${encodeURIComponent(fontText)}`),
    loadGoogleFont(`https://fonts.googleapis.com/css2?family=Lato:wght@400;700&text=${encodeURIComponent(fontText)}`),
    loadGoogleFont(`https://fonts.googleapis.com/css2?family=Space+Mono:wght@700&text=${encodeURIComponent(fontText)}`),
  ]);
  const display = lato900 || lato700 ? 'Lato' : 'sans-serif';
  const monoFont = mono ? 'Space Mono' : 'monospace';
  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 700 | 900; style: 'normal' }[] = [];
  if (lato900) fonts.push({ name: 'Lato', data: lato900, weight: 900, style: 'normal' });
  if (lato700) {
    fonts.push({ name: 'Lato', data: lato700, weight: 400, style: 'normal' });
    fonts.push({ name: 'Lato', data: lato700, weight: 700, style: 'normal' });
  }
  if (mono) fonts.push({ name: 'Space Mono', data: mono, weight: 700, style: 'normal' });

  const numbersLed = Boolean(tool.numbersLed && tool.ogFigure);

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
          color: INK,
          fontFamily: display,
          padding: '64px 72px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* faint champagne wash, top-right */}
        <div
          style={{
            position: 'absolute',
            right: -120,
            top: -120,
            width: 460,
            height: 460,
            borderRadius: 999,
            background: 'radial-gradient(circle, rgba(191,163,122,0.22), transparent 68%)',
          }}
        />

        {/* header — wordmark + eyebrow */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontFamily: display, fontWeight: 900, fontSize: 34, letterSpacing: '-0.02em', color: INK }}>
              assembl
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: 12,
                fontFamily: monoFont,
                fontWeight: 700,
                fontSize: 17,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: GOLD,
              }}
            >
              {tool.eyebrow}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: monoFont,
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: INK,
              background: CHAMPAGNE,
              borderRadius: 999,
              padding: '10px 18px',
            }}
          >
            HAPAI
          </div>
        </div>

        {/* centre — numbers tools lead with the giant figure */}
        {numbersLed ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontFamily: monoFont, fontWeight: 700, fontSize: 20, letterSpacing: '0.16em', textTransform: 'uppercase', color: MUTED }}>
              {tool.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: 8 }}>
              <div style={{ display: 'flex', fontFamily: display, fontWeight: 900, fontSize: 220, lineHeight: 0.9, letterSpacing: '-0.03em', color: INK }}>
                {tool.ogFigure}
              </div>
            </div>
            {/* champagne pill-dash beneath the figure */}
            <div style={{ display: 'flex', width: 280, height: 12, background: CHAMPAGNE, borderRadius: 999, marginTop: 18 }} />
            <div style={{ display: 'flex', marginTop: 20, maxWidth: 900, fontFamily: display, fontWeight: 700, fontSize: 34, color: BODY }}>
              {tool.ogFigureLabel}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 960 }}>
            <div style={{ display: 'flex', fontFamily: monoFont, fontWeight: 700, fontSize: 20, letterSpacing: '0.16em', textTransform: 'uppercase', color: MUTED }}>
              {tool.name}
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: 18,
                fontFamily: display,
                fontWeight: 900,
                fontSize: tool.title.length > 30 ? 76 : 92,
                lineHeight: 0.96,
                letterSpacing: '-0.02em',
                color: INK,
              }}
            >
              {tool.title}
            </div>
            <div style={{ display: 'flex', width: 240, height: 12, background: CHAMPAGNE, borderRadius: 999, marginTop: 22 }} />
            <div style={{ display: 'flex', marginTop: 22, maxWidth: 880, fontFamily: display, fontWeight: 400, fontSize: 30, lineHeight: 1.28, color: BODY }}>
              {truncate(tool.description, 130)}
            </div>
          </div>
        )}

        {/* footer — posture + route */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: `1px solid ${HAIRLINE}`, paddingTop: 22 }}>
          <div style={{ display: 'flex', maxWidth: 760, fontFamily: display, fontWeight: 400, fontSize: 18, color: MUTED }}>
            {truncate(tool.posture, 120)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', background: PAPER, border: `1px solid ${HAIRLINE}`, borderRadius: 8, padding: '8px 14px', fontFamily: monoFont, fontWeight: 700, fontSize: 16, letterSpacing: '0.08em', color: INK }}>
              {route}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...dashOgSize, fonts },
  );
}
