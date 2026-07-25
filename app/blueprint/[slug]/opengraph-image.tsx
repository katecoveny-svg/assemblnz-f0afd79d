import { ImageResponse } from 'next/og';

/**
 * The link preview for a kept Blueprint — the business's own colour, their
 * name, and the honest count. A bare URL previews as nothing; this is what
 * makes the link worth sending.
 *
 * Reads the row over Supabase's REST endpoint rather than through the shared
 * server-only store: this file renders inside satori's own constrained context,
 * and every request 500'd while it pulled the full client in. Anything that
 * goes wrong falls back to a plain assembl card, because a preview that throws
 * is worse than a generic one.
 */

export const alt = 'Business Blueprint by assembl';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Card = {
  name: string;
  accent: string;
  second: string | null;
  answered: number | null;
  total: number;
  gaps: number;
};

const FALLBACK: Card = {
  name: 'Business Blueprint',
  accent: '#B8964F',
  second: null,
  answered: null,
  total: 0,
  gaps: 0,
};

async function loadCard(slug: string): Promise<Card> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !/^[a-z0-9-]{4,40}$/.test(slug)) return FALLBACK;
  try {
    const res = await fetch(
      `${url}/rest/v1/blueprint_shares?slug=eq.${encodeURIComponent(slug)}&select=domain,brief,expires_at`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store' },
    );
    if (!res.ok) return FALLBACK;
    const rows = (await res.json()) as Array<{ domain: string; brief: Record<string, unknown>; expires_at: string }>;
    const row = rows?.[0];
    if (!row || new Date(row.expires_at).getTime() < Date.now()) return FALLBACK;
    const brief = row.brief ?? {};
    const brand = brief.brand as { primary?: string; secondary?: string | null } | null;
    const questions = Array.isArray(brief.questions) ? brief.questions : [];
    const blindSpots = Array.isArray(brief.blindSpots) ? brief.blindSpots : [];
    return {
      name: String(row.domain).replace(/^www\./, ''),
      accent: brand?.primary ?? '#B8964F',
      second: brand?.secondary ?? null,
      answered: typeof brief.answered === 'number' ? brief.answered : null,
      total: questions.length,
      gaps: blindSpots.length,
    };
  } catch {
    return FALLBACK;
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  let card = FALLBACK;
  try {
    const { slug } = await params;
    card = await loadCard(slug);
  } catch {
    card = FALLBACK;
  }

  const headline =
    card.answered !== null && card.total > 0
      ? `Answers ${card.answered} of the ${card.total} questions its customers ask${card.gaps > 0 ? ` · ${card.gaps} gaps found` : ''}`
      : 'Read from its own website';

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#FDFBF7' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: card.accent, padding: '56px 64px 44px' }}>
          <div style={{ display: 'flex', fontSize: 21, letterSpacing: 6, color: 'rgba(255,255,255,0.85)' }}>
            BUSINESS BLUEPRINT · ASSEMBL
          </div>
          <div style={{ display: 'flex', fontSize: 76, color: '#ffffff', marginTop: 26 }}>{card.name}</div>
          <div style={{ display: 'flex', fontSize: 32, color: 'rgba(255,255,255,0.92)', marginTop: 'auto' }}>
            {headline}
          </div>
        </div>
        {card.second ? <div style={{ display: 'flex', backgroundColor: card.second, height: 12 }} /> : null}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '26px 64px' }}>
          <div style={{ display: 'flex', fontSize: 26, color: '#1A1918' }}>assembl.co.nz</div>
          <div style={{ display: 'flex', fontSize: 20, color: '#8A867E', letterSpacing: 3 }}>AOTEAROA NEW ZEALAND</div>
        </div>
      </div>
    ),
    size,
  );
}
