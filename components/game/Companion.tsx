/**
 * The journey companion — a small canary dachshund (the dash mascot, locked
 * canon 2026-06-23). Travels the map beside the player. Flat vector, charcoal
 * line on a canary body; size comes from className.
 */
const INK = '#3A3832';
const CAN = '#FFD42A';
const CREAM = '#FFF7EC';

export function Companion({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 84" fill="none" className={className} aria-hidden>
      {/* shadow */}
      <ellipse cx="60" cy="76" rx="40" ry="5" fill={INK} opacity={0.12} />
      {/* ears */}
      <path d="M30 30c-8-4-15-2-16 6 6 3 13 2 17-2z" fill={INK} />
      {/* body — the long sausage */}
      <path
        d="M28 44c0-9 8-15 20-15 10 0 14 5 26 5s18-3 24 1c5 3 6 9 1 13-4 3-10 3-15 3H44c-9 0-16-2-16-7z"
        fill={CAN}
        stroke={INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* legs */}
      <rect x="40" y="52" width="6" height="16" rx="3" fill={CAN} stroke={INK} strokeWidth={3} />
      <rect x="86" y="52" width="6" height="16" rx="3" fill={CAN} stroke={INK} strokeWidth={3} />
      {/* head */}
      <path d="M22 38c-6 1-10 5-10 10 0 6 5 9 12 9 6 0 10-4 10-10 0-6-5-10-12-9z" fill={CAN} stroke={INK} strokeWidth={3} />
      {/* snout */}
      <path d="M10 46c-4 0-6 2-6 5s2 4 6 4h6v-9z" fill={CREAM} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <circle cx="9" cy="50" r="2.2" fill={INK} />
      {/* eye */}
      <circle cx="22" cy="44" r="2.4" fill={INK} />
      {/* tail, up and happy */}
      <path d="M99 40c6-3 9-9 8-15" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
    </svg>
  );
}
