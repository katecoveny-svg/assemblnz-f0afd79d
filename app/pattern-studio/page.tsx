import type { Metadata } from 'next';
import { PatternStudioClient } from '@/components/pattern-studio/PatternStudioClient';

export const metadata: Metadata = {
  title: 'assembl — Pattern Studio',
  description:
    'Five generators, one engine: halftone, dither, ASCII, particles and particle text. Tune a mode and export a frame or the code.',
  alternates: { canonical: '/pattern-studio' },
};

/**
 * Public Pattern Studio — the full generator, live. Exempted in middleware.ts
 * (splash + demo-auth lists) so it serves on the apex instead of the splash.
 */
export default function PatternStudioPage() {
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
            fontSize: 12,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#3f7373',
          }}
        >
          One engine · five generators
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
          Pattern Studio
        </h1>
      </header>
      <PatternStudioClient />
    </div>
  );
}
