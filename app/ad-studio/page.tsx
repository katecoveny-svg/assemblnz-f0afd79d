import type { Metadata } from 'next';
import { AdStudioClient } from '@/components/ad-studio/AdStudioClient';

export const metadata: Metadata = {
  title: 'assembl — Ad Studio',
  description:
    'On-brand ad campaigns from your Business Genome: copy in the kete voice, an on-brand image, laid out in every size — all drafts.',
  alternates: { canonical: '/ad-studio' },
};

/**
 * Ad Studio — the genome-driven ad generator. Reads a sample business's
 * Business Genome, writes the ad copy (Muse), generates the image (Prism),
 * and composes the campaign at every size. Exempted in middleware.ts.
 */
export default function AdStudioPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#313c42' }}>
      <header
        style={{
          padding: '28px clamp(20px, 5vw, 40px) 20px',
          borderBottom: '1px solid rgba(49, 60, 66, 0.1)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-mono), Space Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#3f7373',
          }}
        >
          Reads your Genome · writes the ad
        </p>
        <h1
          style={{
            margin: '8px 0 0',
            fontFamily: 'var(--font-display), Cormorant Garamond, Georgia, serif',
            fontWeight: 500,
            fontSize: 'clamp(30px, 5vw, 46px)',
            letterSpacing: '-0.02em',
          }}
        >
          Ad Studio
        </h1>
      </header>
      <AdStudioClient />
    </div>
  );
}
