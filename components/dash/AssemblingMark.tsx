/**
 * The assembling mark — a brass ring that closes as the agent works.
 *
 * Replaces the Birdie dachshund. The dog was the old assembling identity and
 * it survived here long after the rest of the microsite moved to the champagne
 * canon, so the one place a visitor actually watched a wait still had a
 * cartoon in it. This is the same object language as the 3D scenes: a navy
 * core, a brass ring accruing around it, a chrome hairline.
 *
 * `pct` is 0…100. At 100 the ring is closed and the core lights.
 */
export function AssemblingMark({
  pct = 0,
  title = 'Assembling',
}: {
  pct?: number;
  title?: string;
}) {
  const p = Math.max(0, Math.min(100, pct));
  const R = 30;
  const C = 2 * Math.PI * R;
  const done = p >= 100;

  return (
    <svg viewBox="0 0 80 80" role="img" aria-label={title} style={{ display: 'block', width: '100%' }}>
      <title>{title}</title>
      {/* the track the ring accrues along */}
      <circle cx="40" cy="40" r={R} fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth="3" />
      {/* the ring itself — starts at twelve o'clock */}
      <circle
        cx="40"
        cy="40"
        r={R}
        fill="none"
        stroke="#BFA37A"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${(C * p) / 100} ${C}`}
        transform="rotate(-90 40 40)"
        style={{ transition: 'stroke-dasharray 0.6s var(--ease, ease)' }}
      />
      {/* chrome hairline, just inside — the same detail the 3D route carries */}
      <circle cx="40" cy="40" r={R - 7} fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.75" />
      {/* the core: navy while it works, brass once it is done */}
      <circle
        cx="40"
        cy="40"
        r={done ? 9 : 6}
        fill={done ? '#BFA37A' : '#0A1626'}
        style={{ transition: 'r 0.4s var(--ease, ease), fill 0.4s var(--ease, ease)' }}
      />
    </svg>
  );
}
