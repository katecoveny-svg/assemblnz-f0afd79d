import type { ReactNode } from 'react';

/**
 * GlassCard — the Moana translucent card. Foam/sand tint over the navy shell,
 * backdrop-blur, soft shadow, champagne hairline border. Used across the
 * section pages so the aesthetic stays consistent.
 */
export function GlassCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[#bfa37a]/40 p-5 ${className}`}
      style={{
        background:
          'linear-gradient(180deg, rgba(242,239,230,0.12), rgba(242,239,230,0.05))',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 12px 32px rgba(10,42,67,0.18)',
      }}
    >
      {children}
    </div>
  );
}

/** Section heading in the brand display face. */
export function SectionHead({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--brand-muted)]">
        {eyebrow}
      </p>
      <h1
        className="mt-1 text-2xl font-semibold leading-tight text-[color:var(--brand-ink)]"
        style={{ fontFamily: 'var(--font-brand-display)' }}
      >
        {title}
      </h1>
      {intro ? (
        <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-[color:var(--brand-muted)]">
          {intro}
        </p>
      ) : null}
    </div>
  );
}

/**
 * SourceLink — the honesty affordance. Renders an external link to the OFFICIAL
 * live source with a "check the live source" framing, so the pilot never
 * fabricates live weather / tide / rules numbers.
 */
export function SourceLink({
  href,
  label,
  note,
}: {
  href: string;
  label: string;
  note?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="flex flex-col rounded-xl border border-[#2E7D74]/40 px-4 py-3 transition hover:border-[#2E7D74]/70"
      style={{ background: 'rgba(30,122,140,0.08)' }}
    >
      <span className="text-[13px] font-medium text-[color:var(--brand-ink)]">
        {label} <span className="text-[#2E7D74]">↗ check the live source</span>
      </span>
      {note ? (
        <span className="mt-0.5 text-[11.5px] leading-relaxed text-[color:var(--brand-muted)]">
          {note}
        </span>
      ) : null}
    </a>
  );
}
