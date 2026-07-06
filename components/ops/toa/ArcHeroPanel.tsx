'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

/**
 * ArcHeroPanel — TOA's luminous hero: the ethereal glass-massing 3D scene
 * (ArcEtherHero) behind an overlaid title, in the "glass + gold" direction.
 * Client-only (R3F ssr:false) with a pale fallback; reduced-motion freezes it.
 */

const ArcEtherHero = dynamic(() => import('@/components/ops/toa/ArcEtherHero'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', background: 'radial-gradient(120% 90% at 60% 20%, #fff, #eff1ee 70%)' }} />,
});

const PALE = '#eff1ee';
const GOLD = '#bfa37a';
const INK = '#161516';

export function ArcHeroPanel({ waiting }: { waiting?: number }) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => setAnimate(!window.matchMedia('(prefers-reduced-motion: reduce)').matches), []);

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        height: 380,
        borderRadius: 20,
        border: `1px solid ${GOLD}55`,
        boxShadow: '0 16px 44px rgba(54,58,53,0.12), inset 0 1px 0 rgba(255,255,255,0.7)',
      }}
    >
      <div style={{ position: 'absolute', inset: 0 }}>
        <ArcEtherHero animate={animate} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${PALE}f2 0%, ${PALE}99 38%, transparent 66%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 clamp(24px,4vw,52px)', maxWidth: 580, pointerEvents: 'none' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD }}>
          toa architects × arc · concept
        </p>
        <h1 style={{ fontFamily: 'var(--font-brand-display)', fontSize: 'clamp(2rem,4.2vw,3.2rem)', fontWeight: 700, color: INK, margin: '10px 0 0', lineHeight: 1.04 }}>
          The practice, drafted overnight<span style={{ color: GOLD }}>.</span>
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: '#4a4a42', margin: '14px 0 0', maxWidth: 420 }}>
          ARC reads your projects, consents and consultants and answers with its sources — a live
          draft, held for you to approve.{typeof waiting === 'number' ? ` ${waiting} waiting this morning.` : ''}
        </p>
        <p style={{ fontSize: 11, color: '#8a8a7e', marginTop: 16 }}>drag the model · concept demo</p>
      </div>
    </div>
  );
}
