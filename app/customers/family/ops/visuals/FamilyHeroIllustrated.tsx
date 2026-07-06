'use client';

import { SkyBar } from './ambient';

/**
 * FamilyHeroIllustrated — the ambient, hand-drawn hero for Family OS (visual
 * direction B). Replaces the old WebGL orb hero (no 3D on family/ops). A soft
 * time-of-day sky, a paper-grain wash, and a warm line-art domestic still-life:
 * a home, a wee whānau, the day drifting past. Ink strokes, gold accents,
 * champagne canon. Motion is ambient and respects prefers-reduced-motion.
 *
 * This is a placeholder illustration — the API (fills the hero panel behind the
 * text) is stable, so a commissioned NZ illustrator or a Vessel Studio line-art
 * pass can drop straight in.
 */

const INK = '#1A1918';
const GOLD = '#BFA37A';

export default function FamilyHeroIllustrated() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 62% 20%, #ffffff, #FBFAF6 72%)' }}>
      {/* time-of-day sky, tucked to the top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, opacity: 0.9 }}>
        <SkyBar height={120} radius={0} />
      </div>

      {/* paper grain */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, opacity: 0.06, mixBlendMode: 'multiply',
        backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'120\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\'/></filter><rect width=\'120\' height=\'120\' filter=\'url(%23n)\'/></svg>")',
      }} />

      {/* line-art still-life, right-weighted so hero text sits clear on the left */}
      <svg viewBox="0 0 520 460" preserveAspectRatio="xMaxYMid slice" aria-hidden
        style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '68%' }}
        fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {/* rolling ground line */}
        <path d="M40 372c80-26 150-26 230-6s170 20 250-8" opacity={0.5} />
        {/* the house */}
        <g className="fam-ink-arrive">
          <path d="M250 250l70-58 70 58" />
          <path d="M268 238v112h104V238" />
          <path d="M300 350v-46h40v46" />
          <rect x="345" y="262" width="18" height="18" rx="1" />
          <path d="M378 214v-16h14v26" stroke={GOLD} />
          <path d="M300 292l4 4M320 292l4 4" stroke={GOLD} />
        </g>
        {/* a small fence */}
        <path d="M120 352v-30M140 352v-34M160 352v-30M110 336h58" opacity={0.55} />
        {/* two wee figures — whānau */}
        <g strokeWidth={2.2}>
          <circle cx="176" cy="300" r="11" />
          <path d="M176 311v34M176 320l-16 10M176 320l16 10M176 345l-11 20M176 345l11 20" />
          <circle cx="212" cy="312" r="8" stroke={GOLD} />
          <path d="M212 320v24M212 326l-11 7M212 326l11 7M212 344l-8 15M212 344l8 15" stroke={GOLD} />
        </g>
        {/* a drifting sun already lives in SkyBar; add a couple of ink birds */}
        <path d="M150 150c6-6 10-6 16 0 6-6 10-6 16 0" opacity={0.5} />
        <path d="M196 128c5-5 8-5 13 0 5-5 8-5 13 0" opacity={0.4} />
        {/* a kite string to the corner — a little joy */}
        <path d="M330 150l58-58" stroke={GOLD} opacity={0.7} />
        <path d="M388 92l10-6-2 12-10 4 2-10Z" fill={GOLD} stroke={GOLD} opacity={0.85} />
      </svg>
    </div>
  );
}
