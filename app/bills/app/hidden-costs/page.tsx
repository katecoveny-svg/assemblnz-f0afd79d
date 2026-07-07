import { Card, PageHeading, SectionLabel, CategoryTag, money } from '@/components/bills/kit';
import { ActionButton } from '@/components/bills/ActionButton';
import { hiddenCosts, hiddenCostsTotal } from '@/lib/bills/data';
import { EyeOff } from 'lucide-react';

// Which draft a given hidden cost prepares when actioned.
const ACTION: Record<string, { kind: 'cancel' | 'refund'; label: string }> = {
  'h-sky': { kind: 'cancel', label: 'Queue cancellation' },
  'h-gym': { kind: 'cancel', label: 'Draft cancellation notice' },
  'h-spotify': { kind: 'cancel', label: 'Queue cancellation' },
  'h-acc': { kind: 'refund', label: 'Draft refund request' },
  'h-kiwisaver': { kind: 'refund', label: 'Compare & prepare switch' },
};

export default function HiddenCostsPage() {
  return (
    <div>
      <PageHeading title="Hidden costs" lead="Charges quietly draining the account — unused subscriptions, a duplicate debit, an ACC overpayment and high fund fees. Each has an NZ-specific next step, and none is actioned without you." />

      <Card className="mb-4">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ background: 'var(--b-coral)' }}>
            <EyeOff size={22} />
          </span>
          <div>
            <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-bills-display)', color: 'var(--b-coral-deep)' }}>
              {money(hiddenCostsTotal)}<span className="text-lg font-normal" style={{ color: 'var(--b-faint)' }}> /yr</span>
            </p>
            <p className="text-sm" style={{ color: 'var(--b-muted)' }}>detected across {hiddenCosts.length} items, ready for your review</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-3">
        {hiddenCosts.map((h) => {
          const act = ACTION[h.id] ?? { kind: 'cancel' as const, label: 'Review' };
          return (
            <div key={h.id} className="rounded-2xl p-5" style={{ background: 'var(--b-surface)', border: '1px solid var(--b-line)' }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold" style={{ fontFamily: 'var(--font-bills-display)', color: 'var(--b-ink)' }}>{h.name}</span>
                    <CategoryTag category={h.category} />
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--b-muted)' }}>{h.detail}</p>
                </div>
                <span className="rounded-lg px-2.5 py-1 text-sm font-bold" style={{ background: 'var(--b-coral-soft)', color: 'var(--b-coral-deep)' }}>
                  {money(h.annual)}/yr
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2.5" style={{ background: 'var(--b-surface-alt)' }}>
                <p className="text-[13px]" style={{ color: 'var(--b-muted)' }}>
                  <strong style={{ color: 'var(--b-ink)' }}>Next step:</strong> {h.action}
                </p>
                <ActionButton kind={act.kind} label={act.label} target={h.name} detail={`${h.detail} ${h.action}`} amount={`${money(h.annual)}/yr`} tone="coral" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
