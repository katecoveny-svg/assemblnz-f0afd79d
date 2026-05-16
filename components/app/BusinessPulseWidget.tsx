import Link from 'next/link';
import { ArrowRight, CalendarClock, CheckCircle2, CircleAlert, WalletCards } from 'lucide-react';
import type { BusinessPulseBrief } from '@/lib/business-pulse/types';

function money(value: number | null | undefined): string {
  if (value == null) return 'n/a';
  return `NZ$${Math.round(value).toLocaleString('en-NZ')}`;
}

export function BusinessPulseWidget({
  brief,
  tenantSlug,
}: {
  brief: BusinessPulseBrief | null;
  tenantSlug: string;
}) {
  if (!brief) {
    return (
      <section className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          Business Pulse
        </p>
        <h2 className="mt-3 font-display text-3xl font-light leading-none">
          No pulse has run yet.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
          Monday 07:00 NZT runs appear here once the tenant has Business Pulse enabled.
        </p>
        <Link
          href={`/app/${tenantSlug}/pulse`}
          className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--assembl-pounamu)]"
        >
          Open pulse <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-[8px] border border-[rgba(43,107,87,0.18)] bg-white/70 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
            Business Pulse · {brief.briefDate}
          </p>
          <h2 className="mt-3 font-display text-3xl font-light leading-none">
            Three things, not thirty.
          </h2>
        </div>
        {brief.checks.privacy.passed && brief.checks.tikanga.passed ? (
          <CheckCircle2 className="h-5 w-5 text-[color:var(--assembl-pounamu)]" aria-label="Checks passed" />
        ) : (
          <CircleAlert className="h-5 w-5 text-[color:var(--assembl-gold-thread)]" aria-label="Review required" />
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <PulseMetric
          icon={WalletCards}
          label="14-day forecast"
          value={money(brief.cashPosition.fourteenDayForecast)}
          warn={brief.cashPosition.belowThreshold}
        />
        <PulseMetric
          icon={CalendarClock}
          label="Meetings"
          value={brief.weeklyCommitments.externalMeetings.length}
        />
      </div>

      <ol className="mt-4 space-y-3">
        {brief.threeThings.map((item, index) => (
          <li key={`${item.source}-${index}`} className="rounded-[8px] border border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)] p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
              {item.source}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[color:var(--text-primary)]">
              {item.thing}
            </p>
            {item.approvalRequired ? (
              <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--assembl-gold-thread)]">
                Approval required
              </p>
            ) : null}
          </li>
        ))}
      </ol>

      <Link
        href={`/app/${tenantSlug}/pulse`}
        className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--assembl-pounamu)]"
      >
        Open full brief <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </section>
  );
}

function PulseMetric({
  icon: Icon,
  label,
  value,
  warn = false,
}: {
  icon: typeof WalletCards;
  label: string;
  value: string | number;
  warn?: boolean;
}) {
  return (
    <div className="rounded-[8px] border border-[rgba(35,33,31,0.08)] bg-[color:var(--assembl-paper)] p-3">
      <Icon className={warn ? 'h-4 w-4 text-[color:var(--assembl-gold-thread)]' : 'h-4 w-4 text-[color:var(--assembl-pounamu)]'} aria-hidden />
      <p className="mt-2 font-display text-2xl font-light leading-none">{value}</p>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
        {label}
      </p>
    </div>
  );
}
