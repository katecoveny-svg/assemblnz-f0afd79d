/**
 * Marquee — the birdie-style scrolling announcement bar. Yellow, black text,
 * dash (–) separators. Presentational; CSS-driven (gated on reduced-motion in
 * dash-kit.css). Items are duplicated so the loop is seamless.
 */
const DEFAULT_ITEMS = [
  'Get paid to wait',
  'Airpoints · KiwiSaver · charity',
  'Two lines of SDK',
  'Opt-in, NZ-built',
  'Privacy Act 2020 native',
  'Publishers keep 55%',
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
