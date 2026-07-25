import { ImageResponse } from 'next/og';
import { readBlueprint } from '@/lib/build-an-agent/blueprint-store';

/**
 * The link preview for a kept Blueprint — the business's own colour, their
 * name, and the honest count. A bare URL previews as nothing; this is what
 * makes the link worth sending.
 */

export const alt = 'Business Blueprint by assembl';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kept = await readBlueprint(slug);

  const accent = kept?.brief.brand?.primary ?? '#B8964F';
  const second = kept?.brief.brand?.secondary ?? null;
  const name = (kept?.domain ?? 'assembl').replace(/^www\./, '');
  const total = kept?.brief.questions.length ?? 0;
  const answered = typeof kept?.brief.answered === 'number' ? kept.brief.answered : null;
  const gaps = kept?.brief.blindSpots.length ?? 0;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#FDFBF7' }}>
        <div style={{ background: accent, padding: '56px 64px 44px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ fontSize: 21, letterSpacing: 6, color: 'rgba(255,255,255,0.85)' }}>
            BUSINESS BLUEPRINT · ASSEMBL
          </div>
          <div style={{ fontSize: 78, color: '#fff', marginTop: 26, lineHeight: 1.05 }}>{name}</div>
          {answered !== null && total > 0 ? (
            <div style={{ fontSize: 34, color: 'rgba(255,255,255,0.92)', marginTop: 'auto', lineHeight: 1.3 }}>
              Answers {answered} of the {total} questions its customers ask
              {gaps > 0 ? ` · ${gaps} gaps found` : ''}
            </div>
          ) : (
            <div style={{ fontSize: 34, color: 'rgba(255,255,255,0.92)', marginTop: 'auto' }}>
              Read from its own website
            </div>
          )}
        </div>
        {second ? <div style={{ background: second, height: 12, display: 'flex' }} /> : null}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '26px 64px', background: '#FDFBF7' }}>
          <div style={{ fontSize: 26, color: '#1A1918' }}>assembl.co.nz</div>
          <div style={{ fontSize: 20, color: '#8A867E', letterSpacing: 3 }}>
            AOTEAROA NEW ZEALAND
          </div>
        </div>
      </div>
    ),
    size,
  );
}
