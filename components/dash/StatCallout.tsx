/**
 * StatCallout — a big mono number + label. Presentational. Yellow-on-black or
 * black-on-yellow per section (set via the `dark` prop). See the components brief.
 */
interface StatCalloutProps {
  value: string;
  label: string;
  dark?: boolean;
}

export function StatCallout({ value, label, dark = false }: StatCalloutProps) {
  return (
    <div
      style={{
        background: dark ? 'var(--accent)' : 'var(--surface)',
        color: dark ? 'var(--surface)' : 'var(--fg)',
        border: '2px solid var(--accent)',
        borderRadius: 'var(--r-lg)',
        padding: '24px 26px',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--ff-mono)',
          fontSize: 'clamp(2.2rem, 5vw, 3rem)',
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color: dark ? 'var(--hivis)' : 'var(--fg)',
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: dark ? 'var(--surface)' : 'var(--muted)',
        }}
      >
        {label}
      </div>
    </div>
  );
}
