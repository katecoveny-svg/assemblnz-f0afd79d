import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

/**
 * Community-agent share-card renderer (/a/[slug]/opengraph-image).
 *
 * Forked from the SPARK renderer (lib/hapai/og-image.tsx): pearl ground,
 * the agent's name in the display serif, an accent-tinted mark, the assembl
 * wordmark and the builder line. Font loading is the same contract — Google
 * Fonts subset first, the bundled TTFs (lib/hapai/og-fonts) as the floor so
 * a build can never fail on fonts.
 */

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';
export const ogAlt = 'assembl community agent share card';

const CREAM = '#ffffff';
const CREAM2 = '#f3f5f3';
const POUNAMU = '#3f7373';
const INK = '#313c42';
const TAUPE = '#68766f';
const LINE = '#e8ecea';
const AMBER = '#b8964f';

export interface AgentOgInput {
  name: string;
  description: string;
  shareSlug: string;
  accent: string;
}

async function loadGoogleFont(url: string): Promise<ArrayBuffer | null> {
  // Test hook: force the bundled-font fallback (OG_FORCE_LOCAL_FONTS=1 pnpm build).
  if (process.env.OG_FORCE_LOCAL_FONTS) return null;
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

const HEX = /^#[0-9a-fA-F]{6}$/;

export async function renderAgentOgImage(agent: AgentOgInput) {
  const accent = HEX.test(agent.accent) ? agent.accent : POUNAMU;
  const route = `assembl.co.nz/a/${agent.shareSlug}`;
  const fontText = `assembl community agent ${agent.name} ${agent.description} made with the assembl agent builder ${route} Mahi that earns its proof.`;
  const [serifNormal, serifItalic, sans] = await Promise.all([
    loadGoogleFont(`https://fonts.googleapis.com/css2?family=Fraunces:wght@400&text=${encodeURIComponent(fontText)}`),
    loadGoogleFont(`https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,400&text=${encodeURIComponent(fontText)}`),
    loadGoogleFont(`https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500&text=${encodeURIComponent(fontText)}`),
  ]);
  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 500; style: 'normal' | 'italic' }[] = [];

  if (serifNormal) fonts.push({ name: 'Fraunces', data: serifNormal, weight: 400, style: 'normal' });
  if (serifItalic) fonts.push({ name: 'Fraunces', data: serifItalic, weight: 400, style: 'italic' });
  if (sans) {
    fonts.push({ name: 'Plus Jakarta Sans', data: sans, weight: 400, style: 'normal' });
    fonts.push({ name: 'Plus Jakarta Sans', data: sans, weight: 500, style: 'normal' });
  }

  // Bundled TTFs are the floor — Satori throws on an empty fonts array.
  if (fonts.length === 0) {
    const local = (file: string) =>
      readFileSync(join(process.cwd(), 'lib/hapai/og-fonts', file)).buffer as ArrayBuffer;
    fonts.push({ name: 'Fraunces', data: local('fraunces-400.ttf'), weight: 400, style: 'normal' });
    fonts.push({
      name: 'Plus Jakarta Sans',
      data: local('plus-jakarta-sans-400.ttf'),
      weight: 400,
      style: 'normal',
    });
  }

  const headlineFont = fonts.some((f) => f.name === 'Fraunces') ? 'Fraunces' : 'serif';
  const bodyFont = fonts.some((f) => f.name === 'Plus Jakarta Sans') ? 'Plus Jakarta Sans' : 'sans-serif';

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
            background: `radial-gradient(circle at 78% 26%, ${accent}29, transparent 36%), radial-gradient(circle at 86% 82%, rgba(184,150,79,0.16), transparent 30%)`,
          }}
        />
        {/* accent-tinted mark: a quiet ring of dots echoing the pattern signature */}
        <div
          style={{
            position: 'absolute',
            right: 96,
            top: 96,
            width: 300,
            height: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${LINE}`,
            borderRadius: 999,
          }}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const angle = (i / 8) * Math.PI * 2;
            const r = 108;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 150 + Math.cos(angle) * r - (i % 2 === 0 ? 13 : 8),
                  top: 150 + Math.sin(angle) * r - (i % 2 === 0 ? 13 : 8),
                  width: i % 2 === 0 ? 26 : 16,
                  height: i % 2 === 0 ? 26 : 16,
                  borderRadius: 999,
                  background: i % 2 === 0 ? accent : CREAM2,
                  border: i % 2 === 0 ? 'none' : `1px solid ${LINE}`,
                  display: 'flex',
                }}
              />
            );
          })}
          <div style={{ display: 'flex', width: 46, height: 46, borderRadius: 999, background: accent }} />
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
              <div style={{ display: 'flex', color: INK, fontFamily: headlineFont, fontStyle: 'italic', fontSize: 58, lineHeight: 1 }}>
                assembl
              </div>
              <div style={{ display: 'flex', marginTop: 10, color: TAUPE, fontSize: 20 }}>
                Mahi that earns its proof.
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                border: '1px solid rgba(43,107,87,0.24)',
                background: 'rgba(250,247,242,0.84)',
                color: POUNAMU,
                borderRadius: 999,
                padding: '11px 17px',
                fontSize: 16,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              community agent
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 760 }}>
            <div
              style={{
                display: 'flex',
                color: INK,
                fontFamily: headlineFont,
                fontSize: agent.name.length > 23 ? 78 : 100,
                lineHeight: 0.94,
              }}
            >
              {truncate(agent.name, 44)}
            </div>
            <div style={{ display: 'flex', marginTop: 26, maxWidth: 690, color: INK, fontSize: 30, lineHeight: 1.26 }}>
              {truncate(agent.description, 126)}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', color: TAUPE, fontSize: 18, lineHeight: 1.42 }}>
              <span>made with the assembl agent builder</span>
              <span style={{ marginTop: 10, color: POUNAMU, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {route}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                width: 132,
                height: 5,
                background: accent,
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
