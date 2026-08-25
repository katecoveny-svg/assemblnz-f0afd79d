/**
 * Presentational primitives shared across the Aironaut customs routes.
 * Server-safe (no client hooks) so pages stay server components.
 */
import Link from 'next/link';
import type { ReactNode } from 'react';
import type {
  ComplianceStatus,
  EntryStatus,
  InvoiceStatus,
} from '@/lib/customs/types';

type Tone = 'ok' | 'warn' | 'hold' | 'navy' | 'brass';

const TONE_CLASS: Record<Tone, string> = {
  ok: 'air-pill air-pill-ok',
  warn: 'air-pill air-pill-warn',
  hold: 'air-pill air-pill-hold',
  navy: 'air-pill air-pill-navy',
  brass: 'air-pill air-pill-brass',
};

export function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={TONE_CLASS[tone]}>{children}</span>;
}

const ENTRY_STATUS: Record<EntryStatus, { tone: Tone; label: string }> = {
  draft: { tone: 'navy', label: 'Draft' },
  missing_information: { tone: 'warn', label: 'Missing info' },
  hold_for_compliance: { tone: 'hold', label: 'Held — compliance' },
  ready_for_broker_review: { tone: 'ok', label: 'Ready for broker' },
  lodged_by_broker: { tone: 'navy', label: 'Lodged by broker' },
  assessed: { tone: 'brass', label: 'Assessed' },
  cleared: { tone: 'ok', label: 'Cleared' },
};

export function EntryStatusPill({ status }: { status: EntryStatus }) {
  const s = ENTRY_STATUS[status];
  return <Pill tone={s.tone}>{s.label}</Pill>;
}

const COMPLIANCE_STATUS: Record<ComplianceStatus, { tone: Tone; label: string }> = {
  upcoming: { tone: 'navy', label: 'Upcoming' },
  due_soon: { tone: 'warn', label: 'Due soon' },
  overdue: { tone: 'hold', label: 'Overdue' },
  done: { tone: 'ok', label: 'Done' },
};

export function ComplianceStatusPill({ status }: { status: ComplianceStatus }) {
  const s = COMPLIANCE_STATUS[status];
  return <Pill tone={s.tone}>{s.label}</Pill>;
}

const INVOICE_STATUS: Record<InvoiceStatus, { tone: Tone; label: string }> = {
  draft: { tone: 'navy', label: 'Draft' },
  awaiting_xero_sync: { tone: 'warn', label: 'Awaiting Xero sync' },
  sent: { tone: 'brass', label: 'Sent' },
  paid: { tone: 'ok', label: 'Paid' },
  overdue: { tone: 'hold', label: 'Overdue' },
};

export function InvoiceStatusPill({ status }: { status: InvoiceStatus }) {
  const s = INVOICE_STATUS[status];
  return <Pill tone={s.tone}>{s.label}</Pill>;
}

export function PageHeader({
  eyebrow,
  title,
  lead,
  action,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="air-eyebrow mb-1">{eyebrow}</p>
        <h1 className="air-display text-3xl sm:text-[2.1rem]">{title}</h1>
        {lead ? <p className="mt-2 max-w-2xl text-sm text-[color:var(--air-slate)]">{lead}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = '',
  mist = false,
}: {
  children: ReactNode;
  className?: string;
  mist?: boolean;
}) {
  return (
    <div className={`air-card ${mist ? 'air-card-mist' : ''} p-5 ${className}`}>{children}</div>
  );
}

export function StatTile({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: Tone;
}) {
  const accent =
    tone === 'hold'
      ? 'var(--air-hold)'
      : tone === 'warn'
        ? 'var(--air-warn)'
        : tone === 'ok'
          ? 'var(--air-ok)'
          : 'var(--air-navy)';
  return (
    <div className="air-card p-5">
      <p className="text-[0.75rem] uppercase tracking-[0.14em] text-[color:var(--air-slate)]">{label}</p>
      <p className="air-display mt-1 text-3xl" style={{ color: accent }}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-[color:var(--air-slate)]">{hint}</p> : null}
    </div>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="air-display text-xl">{children}</h2>
      {right}
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1 text-xs text-[color:var(--air-slate)] hover:text-[color:var(--air-navy)]"
    >
      <span aria-hidden>←</span> {children}
    </Link>
  );
}

export function CitationList({
  items,
}: {
  items: { source: string; ref?: string; note?: string; url?: string; retrievedAt?: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <ul className="space-y-2 text-xs text-[color:var(--air-slate)]">
      {items.map((c, i) => (
        <li key={i} className="border-l-2 border-[color:var(--air-brass)] pl-3">
          <span className="font-semibold text-[color:var(--air-navy)]">{c.source}</span>
          {c.ref ? <span> — {c.ref}</span> : null}
          {c.note ? <span className="block">{c.note}</span> : null}
          {c.retrievedAt ? (
            <span className="block text-[0.75rem] opacity-80">Retrieved {c.retrievedAt}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
