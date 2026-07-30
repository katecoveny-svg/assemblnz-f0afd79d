import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

/**
 * GET /ai-ready/share — the result as a PNG, sized for social.
 *
 * Kate, 30 July 2026: "can the downloaded document be available in png as well
 * so they can share on soacial?"
 *
 * Deliberately NOT a PNG of the whole document. That document is a long, narrow
 * page; rasterised it becomes an unreadable strip nobody stops scrolling for.
 * What people actually share is a card, so this is a card: 1200 × 630, the ratio
 * LinkedIn and X both want, with the score at a size that survives a phone feed
 * and the address on it so the image carries its own attribution.
 *
 *   /ai-ready/share?site=trademe.co.nz&score=40&passed=3&of=8
 *
 * It holds no state and takes everything from the query string, so the same
 * route can back an OG tag on a shared ?u= result later.
 *
 * ⚠️ TRAP, and it cost a long bisect: satori will not render a RAW NUMBER as a
 * JSX child. `{score}` throws
 *
 *     Expected <div> to have explicit "display: flex" … if it has more than one
 *     child node
 *
 * which points at the wrong thing entirely — the tree is fine and every div here
 * already declares its display. `{String(score)}` renders. So every interpolated
 * value below is stringified and any new one must be too. Satori also counts
 * each interpolation as its own child, so a sentence built from several values
 * has to be one template literal rather than mixed nodes.
 */

export const runtime = 'edge';

const NAVY = '#050F1C';
const NAVY_2 = '#0A1728';
const PAPER = '#F0EEE9';
const CHAMP = '#D4A843';
const CHAMP_HI = '#F6E7B5';

/** Score bands. The wording never scolds: a low score is the reason to share
 *  this, so the card has to be safe to post about your own site. */
function band(score: number): { verdict: string; tone: string } {
  if (score >= 85) return { verdict: 'Ready', tone: '#7FCBA4' };
  if (score >= 60) return { verdict: 'Mostly there', tone: CHAMP };
  if (score >= 35) return { verdict: 'Half the doors are shut', tone: '#D9C68A' };
  return { verdict: 'AI cannot read this site', tone: '#E8A0A0' };
}

export function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const site = (q.get('site') ?? 'your site')
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
    .slice(0, 46);
  const score = Math.max(0, Math.min(100, Number(q.get('score') ?? 0) || 0));
  const passed = Math.max(0, Math.min(99, Number(q.get('passed') ?? 0) || 0));
  const of = Math.max(1, Math.min(99, Number(q.get('of') ?? 8) || 8));
  const { verdict, tone } = band(score);

  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: NAVY, padding: '64px 72px', position: 'relative' }}>
      {/* a pool of champagne behind the score, so the card has depth without an
          image asset the edge runtime would have to fetch */}
      <div style={{ position: 'absolute', right: -160, top: 40, width: 620, height: 620, borderRadius: 620, background: `radial-gradient(circle at center, ${CHAMP}38 0%, ${NAVY}00 70%)` }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 16, height: 16, borderRadius: 16, background: CHAMP }} />
        <div style={{ fontSize: 32, fontWeight: 700, color: PAPER, letterSpacing: -0.6 }}>assembl</div>
        <div style={{ fontSize: 21, color: `${PAPER}88`, marginLeft: 6 }}>intuitive agentic customer journeys</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 22, letterSpacing: 4, textTransform: 'uppercase', color: CHAMP, marginBottom: 10 }}>AI-readiness score</div>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <div style={{ fontSize: 210, fontWeight: 800, color: CHAMP_HI, lineHeight: 0.86, letterSpacing: -10 }}>{String(score)}</div>
            <div style={{ fontSize: 60, fontWeight: 400, color: `${PAPER}66`, marginLeft: 8 }}>/100</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 22, maxWidth: 470 }}>
          <div style={{ fontSize: 42, fontWeight: 700, color: tone, lineHeight: 1.08, letterSpacing: -1 }}>{verdict}</div>
          <div style={{ fontSize: 27, color: PAPER, marginTop: 14, lineHeight: 1.3 }}>{`${String(passed)} of ${String(of)} checks passed on ${site}`}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${PAPER}22`, paddingTop: 26 }}>
        <div style={{ fontSize: 25, color: `${PAPER}bb` }}>Eight checks on whether AI assistants can find, read and cite you.</div>
        <div style={{ fontSize: 25, color: CHAMP, fontWeight: 700 }}>assembl.co.nz/ai-ready</div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 8, background: `linear-gradient(90deg, ${CHAMP} 0%, ${CHAMP_HI} 34%, ${NAVY_2} 100%)` }} />
    </div>,
    { width: 1200, height: 630 },
  );
}
