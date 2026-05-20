import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { categoryLabels, parseScores, type ScoreCategory } from '@/lib/arataki/scorecard';

export const runtime = 'edge';

export function GET(req: NextRequest) {
  const scores = parseScores(req.nextUrl.searchParams.get('scores') ?? undefined);
  const total = (Object.keys(categoryLabels) as ScoreCategory[]).reduce((sum, category) => sum + scores[category], 0);
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#FAF7F2',
          color: '#3D4250',
          padding: 72,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 28, letterSpacing: 6, textTransform: 'uppercase', color: '#2B6B57' }}>Arataki diagnostic</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 128, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>{total} / 80</div>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(Object.keys(categoryLabels) as ScoreCategory[]).map((category) => (
              <div key={category} style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 24 }}>
                <div style={{ display: 'flex', width: 340 }}>{categoryLabels[category]}</div>
                <div style={{ display: 'flex', flex: 1, height: 18, borderRadius: 999, background: '#C8BBA9' }}>
                  <div style={{ display: 'flex', width: `${(scores[category] / 16) * 100}%`, height: 18, borderRadius: 999, background: '#2B6B57' }} />
                </div>
                <div style={{ display: 'flex', width: 90, justifyContent: 'flex-end' }}>{scores[category]} / 16</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: '#2B6B57', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>assembl</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
