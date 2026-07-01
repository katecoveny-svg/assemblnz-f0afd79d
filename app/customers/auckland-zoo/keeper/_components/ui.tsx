import type { ReactNode } from 'react';
import type { WelfareStatus } from '@/lib/customers/auckland-zoo/data';

// Original, simple species SILHOUETTES — placeholder marks only. We never use a
// real Auckland Zoo photo or any taonga-species imagery we don't hold rights to.
// A silhouette reads as "concept placeholder", which is exactly the posture.

export function SpeciesSilhouette({ slug, className }: { slug: string; className?: string }) {
  const common = {
    className,
    viewBox: '0 0 64 64',
    fill: 'currentColor',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true as const,
  };
  switch (slug) {
    case 'kiwi':
      return (
        <svg {...common}>
          <path d="M40 20c-9 0-16 6-17 14-4 1-9 4-11 9-1 2 1 3 3 2 3-2 6-3 9-3 2 5 7 9 14 9 10 0 17-7 17-16 0-4-2-8-5-11 3-1 6-3 8-6 1-2-1-3-3-2-2 2-5 3-8 4-2-1-5-1-7 0z m10 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
        </svg>
      );
    case 'tuatara':
      return (
        <svg {...common}>
          <path d="M6 40c6-2 10-3 14-3 1-4 2-7 3-10 1 3 2 5 4 5s3-2 4-5c1 3 2 6 3 9 6 0 12 2 17 6 2 2 0 5-3 4-4-2-8-3-12-3-3 3-8 5-13 5-6 0-11-2-15-5-2 0-4 1-6 2-2 1-3-2-1-3 2-2 4-4 5-5z" />
          <circle cx="46" cy="34" r="1.5" />
        </svg>
      );
    case 'orangutan':
      return (
        <svg {...common}>
          <path d="M32 10c8 0 14 6 14 14 0 3-1 6-3 8 3 2 6 6 6 11 0 6-4 10-9 10-2 0-4-1-5-2-1 1-2 2-3 2s-2-1-3-2c-1 1-3 2-5 2-5 0-9-4-9-10 0-5 3-9 6-11-2-2-3-5-3-8 0-8 6-14 14-14z m-6 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z m12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        </svg>
      );
    case 'giraffe':
      return (
        <svg {...common}>
          <path d="M26 8c0-2 4-2 4 0l1 6c3 1 5 3 6 6l3 22c0 2 3 3 3 6l1 8c0 2-4 2-4 0l-1-7-3-1-1 8c0 2-4 2-4 0l-1-9-4-14c-3-1-5-4-5-8V16c0-3 2-5 5-6z m2 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        </svg>
      );
    case 'rhino':
      return (
        <svg {...common}>
          <path d="M10 34c0-3 2-5 4-6 1-4 4-7 8-8 1-2 3-3 5-2l3-4c1-2 4-1 4 1 3 1 5 3 6 6 6 1 12 5 14 11 1 2-1 4-3 3-1 3-3 5-6 6l1 6c0 2-4 2-4 0l-1-5h-4l-1 5c0 2-4 2-4 0l-1-5c-6-1-11-5-13-11-4-1-8-1-11 1-2 1-3-1-2-3 1-2 3-4 6-4z m30-4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="20" />
        </svg>
      );
  }
}

export function Card({
  children,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li';
}) {
  return (
    <Tag
      className={`rounded-2xl border p-5 ${className}`}
      style={{ borderColor: 'var(--tenant-line)', background: 'var(--tenant-surface)' }}
    >
      {children}
    </Tag>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p
      className="font-mono text-[11px] uppercase tracking-[0.22em]"
      style={{ color: 'var(--tenant-muted)' }}
    >
      {children}
    </p>
  );
}

export function PageHeading({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <header className="mb-8 max-w-3xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1
        className="mt-2 font-[family-name:var(--font-display)] text-[34px] leading-[1.05] tracking-[-0.01em] md:text-[42px]"
        style={{ color: 'var(--tenant-ink)' }}
      >
        {title}
      </h1>
      {intro ? (
        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: 'var(--tenant-muted)' }}>
          {intro}
        </p>
      ) : null}
    </header>
  );
}

const WELFARE_LABEL: Record<WelfareStatus, string> = {
  compliant: 'Compliant',
  'review-due': 'Review due',
  'gap-flagged': 'Gap flagged',
};

export function WelfarePill({ status }: { status: WelfareStatus }) {
  const styles: Record<WelfareStatus, { bg: string; fg: string }> = {
    compliant: { bg: 'rgba(31,81,50,0.12)', fg: 'var(--tenant-primary-deep)' },
    'review-due': { bg: 'rgba(181,115,46,0.16)', fg: '#8A5418' },
    'gap-flagged': { bg: 'rgba(176,44,44,0.12)', fg: '#9A2B2B' },
  };
  const s = styles[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
      style={{ background: s.bg, color: s.fg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.fg }} />
      {WELFARE_LABEL[status]}
    </span>
  );
}

export function StatusDot({ tone }: { tone: 'ok' | 'watch' | 'urgent' }) {
  const color = tone === 'urgent' ? '#9A2B2B' : tone === 'watch' ? '#8A5418' : 'var(--tenant-primary)';
  return <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />;
}

/** Generic status pill used across the ops modules. */
export function TonePill({ tone, children }: { tone: 'ok' | 'watch' | 'urgent'; children: ReactNode }) {
  const styles = {
    ok: { bg: 'rgba(31,81,50,0.12)', fg: 'var(--tenant-primary-deep)' },
    watch: { bg: 'rgba(181,115,46,0.16)', fg: '#8A5418' },
    urgent: { bg: 'rgba(176,44,44,0.12)', fg: '#9A2B2B' },
  }[tone];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
      style={{ background: styles.bg, color: styles.fg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: styles.fg }} />
      {children}
    </span>
  );
}

/** Draft-for-review chip — reinforces that every output is an unsigned draft. */
export function DraftChip({ children = 'Draft for review' }: { children?: ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]"
      style={{ background: 'rgba(181,115,46,0.14)', color: '#8A5418' }}
    >
      {children}
    </span>
  );
}

/** Provenance chip — always visible so no record can be mistaken for live data. */
export function DemoTag({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]"
      style={{ background: 'var(--tenant-primary-soft)', color: 'var(--tenant-primary-deep)' }}
    >
      {children}
    </span>
  );
}

export function TaongaBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
      style={{ background: 'rgba(181,115,46,0.14)', color: '#8A5418' }}
    >
      Taonga species · kaumātua-gated
    </span>
  );
}

/** The kaumātua-hold notice — shown wherever whakapapa/cultural content would
 *  otherwise sit. Content behind this gate is never model-generated. */
export function KaumatuaHold({ note }: { note: string }) {
  return (
    <div
      className="rounded-xl border-l-4 p-4 text-[13px] leading-relaxed"
      style={{ borderColor: 'var(--tenant-accent)', background: 'rgba(181,115,46,0.07)', color: 'var(--tenant-ink)' }}
    >
      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: '#8A5418' }}>
        Kaumātua hold · whakapapa held for iwi
      </p>
      {note}
    </div>
  );
}
