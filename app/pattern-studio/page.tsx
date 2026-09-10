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
    <div
      className="pattern-studio-canon"
      style={{
        minHeight: '100vh',
        background: '#FFFDFB',
        color: '#240B21',
        // Scope plum canon onto the --a-* layer this studio still reads.
        ['--a-paper' as string]: '#FFFDFB',
        ['--a-paper-2' as string]: '#F5F1F2',
        ['--a-text' as string]: '#240B21',
        ['--a-text-dim' as string]: '#654A4E',
        ['--a-text-faint' as string]: 'rgba(36,11,33,0.45)',
        ['--a-accent' as string]: '#240B21',
        ['--a-accent-deep' as string]: '#3a1336',
        ['--a-accent-soft' as string]: 'rgba(145,106,112,0.14)',
        ['--a-gold' as string]: '#916A70',
        ['--a-gold-soft' as string]: 'rgba(145,106,112,0.16)',
        ['--a-glass' as string]: 'rgba(245,241,242,0.72)',
        ['--a-glass-border' as string]: 'rgba(36,11,33,0.14)',
      }}
    >
      <header
        style={{
          padding: '28px clamp(20px, 5vw, 40px) 20px',
          borderBottom: '1px solid rgba(36, 11, 33, 0.12)',
        }}
      >
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
          One engine · five generators
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
          Pattern Studio
        </h1>
      </header>
      <PatternStudioClient />
    </div>
  );
}
