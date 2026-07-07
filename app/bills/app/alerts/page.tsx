import { PageHeading } from '@/components/bills/kit';
import { ActionButton } from '@/components/bills/ActionButton';
import { alerts, type AlertType } from '@/lib/bills/data';
import { TrendingDown, Lock, Landmark, Home, ArrowUpRight, EyeOff } from 'lucide-react';
import { BILLS } from '@/app/bills/theme';

const META: Record<AlertType, { Icon: typeof Lock; accent: string; soft: string; actionKind: 'switch' | 'cancel' | 'apply'; tone: 'teal' | 'coral' | 'ghost' }> = {
  savings: { Icon: TrendingDown, accent: BILLS.tealDeep, soft: BILLS.tealSoft, actionKind: 'switch', tone: 'teal' },
  'loyalty-trap': { Icon: Lock, accent: BILLS.ochre, soft: BILLS.ochreSoft, actionKind: 'switch', tone: 'ghost' },
  subsidy: { Icon: Home, accent: BILLS.tealDeep, soft: BILLS.tealSoft, actionKind: 'apply', tone: 'teal' },
  'mortgage-refix': { Icon: Landmark, accent: BILLS.ochre, soft: BILLS.ochreSoft, actionKind: 'apply', tone: 'ghost' },
  'price-increase': { Icon: ArrowUpRight, accent: BILLS.coralDeep, soft: BILLS.coralSoft, actionKind: 'switch', tone: 'coral' },
  'hidden-cost': { Icon: EyeOff, accent: BILLS.coralDeep, soft: BILLS.coralSoft, actionKind: 'cancel', tone: 'coral' },
};

const TYPE_LABEL: Record<AlertType, string> = {
  savings: 'Savings opportunity',
  'loyalty-trap': 'Loyalty trap',
  subsidy: 'Government subsidy',
  'mortgage-refix': 'Mortgage refix',
  'price-increase': 'Price increase',
  'hidden-cost': 'Hidden cost',
};

export default function AlertsPage() {
  return (
    <div>
      <PageHeading title="Alerts" lead="What Assembl Bills surfaced without being asked — savings, loyalty traps, subsidies you may qualify for, and price rises. Each is a recommendation; you decide." />

      <div className="grid gap-3">
        {alerts.map((a) => {
          const m = META[a.type];
          return (
            <div key={a.id} className="rounded-2xl p-5" style={{ background: 'var(--b-surface)', border: '1px solid var(--b-line)' }}>
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: m.soft, color: m.accent }}>
                  <m.Icon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ background: m.soft, color: m.accent }}>
                      {TYPE_LABEL[a.type]}
                    </span>
                    {a.amount && (
                      <span className="text-sm font-bold" style={{ color: m.accent }}>{a.amount}</span>
                    )}
                  </div>
                  <p className="mt-1.5 font-semibold" style={{ fontFamily: 'var(--font-bills-display)', color: 'var(--b-ink)' }}>{a.title}</p>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--b-muted)' }}>{a.body}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    {a.source && <span className="text-[11px]" style={{ color: 'var(--b-faint)' }}>Source: {a.source}</span>}
                    <ActionButton
                      kind={m.actionKind}
                      label={a.cta}
                      target={a.title}
                      detail={a.body}
                      amount={a.amount}
                      tone={m.tone}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
