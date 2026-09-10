import type { Metadata } from 'next';
import { AdStudioClient } from '@/components/ad-studio/AdStudioClient';
import { PatternBackdrop } from '@/components/pattern-studio/PatternBackdrop';

export const metadata: Metadata = {
  title: 'assembl — Ad Studio',
  description:
    'On-brand ad campaigns from your Business Genome: copy in your brand voice, an on-brand image, laid out in every size — all drafts.',
  alternates: { canonical: '/ad-studio' },
};

/**
 * Ad Studio — the genome-driven ad generator. Reads a sample business's
 * Business Genome, writes the ad copy (Muse), generates the image (Prism),
 * and composes the campaign at every size. Exempted in middleware.ts.
 */
export default function AdStudioPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FFFDFB',
        color: '#240B21',
        ['--a-paper' as string]: '#FFFDFB',
        ['--a-paper-2' as string]: '#F5F1F2',
        ['--a-text' as string]: '#240B21',
        ['--a-accent' as string]: '#240B21',
        ['--a-gold' as string]: '#916A70',
        ['--a-glass-border' as string]: 'rgba(36,11,33,0.14)',
      }}
    >
      <header
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '48px clamp(20px, 5vw, 40px) 40px',
          borderBottom: '1px solid rgba(36, 11, 33, 0.12)',
        }}
      >
        <PatternBackdrop
          className="absolute inset-0"
          mode="particles"
          colorRole="gold"
          count={150}
          connectLines
          connectDistance={140}
          glow
          opacity={0.45}
          speed={0.8}
          lazyMount={false}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-mono), "IBM Plex Mono", monospace',
            fontSize: 12,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#916A70',
          }}
        >
          Reads your Genome · writes the ad
        </p>
        <h1
          style={{
            margin: '8px 0 0',
            fontFamily: 'var(--font-display), "Instrument Sans", system-ui, sans-serif',
            fontWeight: 500,
            fontSize: 'clamp(30px, 5vw, 46px)',
            letterSpacing: '-0.02em',
          }}
        >
          Ad Studio
        </h1>
        </div>
      </header>
      <AdStudioClient />
    </div>
  );
}
