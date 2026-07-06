'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

/**
 * Ambient motion for Family OS (visual direction B). Subtle, load-bearing, never
 * attention-seeking. Everything here respects prefers-reduced-motion — with it
 * on, motion strips back to a calm still.
 *
 * - SkyBar: a soft time-of-day gradient that shifts with real Auckland local
 *   time (dawn peach → midday cream → afternoon amber → dusk violet → night ink).
 * - InkArrive: new items settle in with a soft ink-flourish, not a hard bounce.
 * - NameGlow: a family member's name gets a barely-there gold underline when
 *   their next event is imminent (within the hour).
 */

const GOLD = '#BFA37A';

// Time-of-day palettes — paper-warm, champagne canon, never canary.
type Sky = { a: string; b: string; label: string };
function skyFor(hour: number): Sky {
  if (hour >= 5 && hour < 8) return { a: '#F6D9C4', b: '#FBF0E6', label: 'dawn' };       // peach
  if (hour >= 8 && hour < 16) return { a: '#FBF6EC', b: '#FDFAF3', label: 'midday' };     // cream
  if (hour >= 16 && hour < 19) return { a: '#F3D8A9', b: '#FBEFD8', label: 'afternoon' }; // amber
  if (hour >= 19 && hour < 21) return { a: '#D9C4DE', b: '#EFE6E9', label: 'dusk' };      // violet
  return { a: '#3A3550', b: '#5A5468', label: 'night' };                                   // ink
}

function aucklandHour(): number {
  try {
    const s = new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', hour: 'numeric', hour12: false }).format(new Date());
    const h = parseInt(s, 10);
    return Number.isFinite(h) ? h % 24 : 12;
  } catch {
    return 12;
  }
}

/** Injects the ambient keyframes + reduced-motion guard once. */
export function AmbientStyles() {
  return (
    <style>{`
      @keyframes fam-ink-arrive { 0%{opacity:0;transform:translateY(4px)} 60%{opacity:1} 100%{opacity:1;transform:none} }
      @keyframes fam-sky-drift { 0%{background-position:0% 50%} 100%{background-position:100% 50%} }
      @keyframes fam-sun-breathe { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:.8;transform:scale(1.04)} }
      .fam-ink-arrive { animation: fam-ink-arrive .6s ease-out both; }
      .fam-name-glow { position:relative; }
      .fam-name-glow::after { content:''; position:absolute; left:0; right:0; bottom:-2px; height:2px;
        background:linear-gradient(90deg, transparent, ${GOLD}, transparent); border-radius:2px;
        opacity:.85; animation: fam-sun-breathe 3.2s ease-in-out infinite; }
      .fam-sun { animation: fam-sun-breathe 6s ease-in-out infinite; transform-origin:center; }
      @media (prefers-reduced-motion: reduce) {
        .fam-ink-arrive { animation:none; }
        .fam-name-glow::after { animation:none; opacity:.7; }
        .fam-sun { animation:none; opacity:.6; }
        .fam-sky { animation:none !important; }
      }
    `}</style>
  );
}

/** A soft time-of-day sky gradient bar. Weather glyph is illustrative (a drawn
 *  sun); a live NZ weather feed is the documented next step. */
export function SkyBar({ height = 84, radius = 16, showWeather = true }: { height?: number; radius?: number; showWeather?: boolean }) {
  const [sky, setSky] = useState<Sky>(() => skyFor(12));
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const tick = () => setSky(skyFor(aucklandHour()));
    tick();
    const id = setInterval(tick, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);
  const night = mounted && sky.label === 'night';
  return (
    <div aria-hidden style={{
      position: 'absolute', inset: 0, borderRadius: radius, overflow: 'hidden',
      height, pointerEvents: 'none',
    }}>
      <div className="fam-sky" style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(105deg, ${sky.a}, ${sky.b} 70%)`,
        backgroundSize: '160% 160%',
        animation: 'fam-sky-drift 40s ease-in-out infinite alternate',
        transition: 'background 2s ease',
      }} />
      {showWeather ? (
        <svg className="fam-sun" width={54} height={54} viewBox="0 0 54 54" aria-hidden
          style={{ position: 'absolute', right: 18, top: height / 2 - 27, opacity: 0.6 }}>
          <circle cx="27" cy="27" r="9" fill="none" stroke={night ? '#EFE6E9' : GOLD} strokeWidth="1.6" />
          {Array.from({ length: 8 }).map((_, i) => {
            const ang = (i / 8) * Math.PI * 2;
            const x1 = 27 + Math.cos(ang) * 13, y1 = 27 + Math.sin(ang) * 13;
            const x2 = 27 + Math.cos(ang) * 17, y2 = 27 + Math.sin(ang) * 17;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={night ? '#EFE6E9' : GOLD} strokeWidth="1.4" strokeLinecap="round" />;
          })}
        </svg>
      ) : null}
    </div>
  );
}

/** Wrap a freshly-added item so it settles in with an ink-flourish. */
export function InkArrive({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div className="fam-ink-arrive" style={style}>{children}</div>;
}

/** A family member's name — glows gold when `imminent` (next event within the hour). */
export function NameGlow({ name, imminent }: { name: string; imminent?: boolean }) {
  return <span className={imminent ? 'fam-name-glow' : undefined}>{name}</span>;
}
