/**
 * Marquee — the birdie-style scrolling announcement bar. Yellow, black text,
 * dash (–) separators. Presentational; CSS-driven (gated on reduced-motion in
 * dash-kit.css). Items are duplicated so the loop is seamless.
 */
const DEFAULT_ITEMS = [
  'Get paid to wait',
  'Long dog, short wait',
  'Sit. Stay. Get paid.',
  'Airpoints · KiwiSaver · charity',
  'Two lines of SDK',
  'Rewards, not cash',
  'Publishers keep 55%',
  'Privacy Act 2020 native',
];

export function Marquee({ items = DEFAULT_ITEMS }: { items?: string[] }) {
  const row = (
    <span aria-hidden>
      {items.map((t, i) => (
        <span key={i}>
          {t}
          <span style={{ opacity: 0.55 }}>—</span>
        </span>
      ))}
    </span>
  );
  return (
    <div className="dashMarquee" role="region" aria-label="Announcements">
      <div className="dashMarquee__track">
        {row}
        {row}
      </div>
    </div>
  );
}
