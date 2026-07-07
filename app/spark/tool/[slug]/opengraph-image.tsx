import { ImageResponse } from 'next/og';
import { getSparkToolBySlug } from '@/lib/spark/store';

export const alt = 'A tool built with SPARK on assembl.co.nz';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Hangarau teal into warm off-white — SPARK's own identity.
export default async function SparkToolOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await getSparkToolBySlug(slug);
  const title = tool?.title ?? 'A tool built with SPARK';
  const summary = tool?.summary ?? 'Describe it in plain English, SPARK builds it in seconds.';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background: 'linear-gradient(135deg, #f7f3ee 0%, #e7f0ed 55%, #cfe6e0 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 22, height: 22, borderRadius: 999, background: '#5aada0' }} />
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 6, color: '#1f4f48' }}>SPARK</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 68, fontWeight: 800, color: '#23211f', lineHeight: 1.05, maxWidth: 980 }}>
            {title}
          </div>
          <div style={{ fontSize: 30, color: '#5c544b', marginTop: 20, maxWidth: 900 }}>{summary}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 26, color: '#3d8478', fontWeight: 700 }}>Built with SPARK · assembl.co.nz</div>
          <div style={{ fontSize: 24, color: '#7c7268' }}>Build your own →</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
