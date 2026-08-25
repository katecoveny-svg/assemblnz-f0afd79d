import { PageHeading } from '@/components/bills/kit';
import { ActionButton } from '@/components/bills/ActionButton';
import { LiveState } from '@/components/bills/LiveState';
import { alerts, type AlertType } from '@/lib/bills/data';
import {
  warmerKiwiHomes,
  WKH_SOURCE_URL,
  WKH_CHECK_URL,
  WKH_VERIFIED_AT,
  WKH_HEADLINE,
} from '@/lib/bills/warmer-kiwi-homes';
import { TrendingDown, Lock, Landmark, Home, ArrowUpRight, EyeOff, ExternalLink, Check } from 'lucide-react';
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
      <PageHeading title="Alerts" lead="What assembl bills surfaced without being asked — savings, loyalty traps, subsidies you may qualify for, and price rises. Each is a recommendation; you decide." />

      {/* Warmer Kiwi Homes — REAL, sourced from EECA */}
      <div className="mb-4 rounded-2xl p-5" style={{ background: 'var(--b-teal-soft)', border: '1px solid var(--b-teal-line)' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: 'var(--b-teal)' }}>
              <Home size={18} />
            </span>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--b-teal-deep)' }}>Government subsidy · {WKH_HEADLINE}</p>
              <p className="font-semibold" style={{ fontFamily: "var(--font-bills-display), 'Cormorant Garamond', Georgia, serif", color: 'var(--b-ink)' }}>You may qualify for Warmer Kiwi Homes</p>
            </div>
          </div>
          <LiveState state="live" note="EECA" />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <WkhCol title="Who qualifies" items={warmerKiwiHomes.whoQualifies} />
          <WkhCol title="Insulation grant" items={warmerKiwiHomes.insulation} />
          <WkhCol title="Heat pump grant" items={warmerKiwiHomes.heatPump} />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3" style={{ borderColor: 'var(--b-teal-line)' }}>
          <span className="text-[12px]" style={{ color: 'var(--b-faint)' }}>
            Source: eeca.govt.nz · verified {new Date(WKH_VERIFIED_AT).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <a href={WKH_CHECK_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ background: 'var(--b-teal)' }}>
            Check eligibility <ExternalLink size={12} />
          </a>
        </div>
        <p className="sr-only">{WKH_SOURCE_URL}</p>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--b-faint)' }}>More alerts</p>
        <LiveState state="sample" note="illustrative" />
      </div>

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
                    <span className="rounded-full px-2 py-0.5 text-[12px] font-semibold uppercase tracking-wide" style={{ background: m.soft, color: m.accent }}>
                      {TYPE_LABEL[a.type]}
                    </span>
                    {a.amount && (
                      <span className="text-sm font-bold" style={{ color: m.accent }}>{a.amount}</span>
                    )}
                  </div>
                  <p className="mt-1.5 font-semibold" style={{ fontFamily: "var(--font-bills-display), 'Cormorant Garamond', Georgia, serif", color: 'var(--b-ink)' }}>{a.title}</p>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--b-muted)' }}>{a.body}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    {a.source && <span className="text-[12px]" style={{ color: 'var(--b-faint)' }}>Source: {a.source}</span>}
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

function WkhCol({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div className="rounded-xl p-3" style={{ background: 'var(--b-surface)' }}>
      <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--b-faint)' }}>{title}</p>
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-1.5 text-[12px] leading-snug" style={{ color: 'var(--b-muted)' }}>
            <Check size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--b-teal-deep)' }} /> {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
