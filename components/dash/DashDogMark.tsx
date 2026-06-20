/**
 * The dash dachshund as a static mark, with a parametric number of body grooves
 * — the brand kit's Pup (3) / Classic (5) / Stretch (7) variations. Its
 * segmented body is the loading bar; here it's drawn at rest.
 */
export function DashDogMark({
  segments = 5,
  coat = '#A6BA9E',
  groove = '#8DA382',
  className,
}: {
  segments?: number;
  coat?: string;
  groove?: string;
  className?: string;
}) {
  // Body spans x 185 → 733 (width 548). Grooves divide it into `segments`.
  const x0 = 185;
  const w = 548;
  const grooves = Array.from({ length: Math.max(0, segments - 1) }, (_, i) => x0 + (w * (i + 1)) / segments - 4);
  return (
    <svg viewBox="0 0 1040 470" role="img" aria-label="the dash dachshund" className={className}>
      <ellipse cx="560" cy="432" rx="372" ry="20" fill="#1a2a1c" opacity="0.06" />
      <path d="M206 250 C 158 252 128 228 120 190" stroke={coat} strokeWidth="26" strokeLinecap="round" />
      <rect x="214" y="298" width="48" height="118" rx="22" fill={coat} />
      <rect x="650" y="298" width="48" height="118" rx="22" fill={coat} />
      <rect x={x0} y="206" width={w} height="128" rx="22" fill={coat} />
      <g fill={groove}>
        {grooves.map((gx) => (
          <rect key={gx} x={gx} y="206" width="8" height="128" />
        ))}
      </g>
      <rect x="712" y="156" width="150" height="178" rx="52" fill={coat} />
      <rect x="842" y="214" width="156" height="84" rx="34" fill={coat} />
      <path
        d="M768 166 C 732 168 714 204 718 250 C 720 290 740 320 776 322 C 812 320 822 290 822 248 C 822 202 804 166 768 166 Z"
        fill={coat}
        stroke="#F2EFE6"
        strokeWidth="7"
      />
      <rect x="962" y="222" width="38" height="48" rx="19" fill="#14301A" />
      <circle cx="838" cy="200" r="13" fill="#14301A" />
    </svg>
  );
}
