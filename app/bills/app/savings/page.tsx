import { Card, PageHeading, SectionLabel, CategoryTag, money } from '@/components/bills/kit';
import { SavingsBarChart } from '@/components/bills/charts';
import { ActionButton } from '@/components/bills/ActionButton';
import { savings, savingsTotal } from '@/lib/bills/data';

export default function SavingsPage() {
  return (
    <div>
      <PageHeading title="Savings" lead="What switching could return to your pocket this year — matched to your actual usage, grounded in Powerswitch and Consumer NZ. Each figure is indicative; you approve every switch." />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <Card>
          <SectionLabel>Found for you</SectionLabel>
          <p className="text-4xl font-bold" style={{ fontFamily: 'var(--font-bills-display)', color: 'var(--b-teal-deep)' }}>
            {money(savingsTotal)}<span className="text-lg font-normal" style={{ color: 'var(--b-faint)' }}> /yr</span>
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--b-muted)' }}>across {savings.length} alternatives</p>
          <div className="mt-5">
            <SectionLabel>By alternative</SectionLabel>
            <SavingsBarChart />
          </div>
        </Card>

        <Card>
          <SectionLabel>Switch options</SectionLabel>
          <div className="space-y-3">
            {savings.map((s) => (
              <div key={s.id} className="rounded-2xl p-4" style={{ background: 'var(--b-surface-alt)' }}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <CategoryTag category={s.category} />
                      <span className="text-xs" style={{ color: 'var(--b-faint)' }}>{s.fromProvider}</span>
                    </div>
                    <p className="mt-1.5 font-semibold" style={{ fontFamily: 'var(--font-bills-display)', color: 'var(--b-ink)' }}>
                      → {s.toProvider} · {s.toPlan}
                    </p>
                  </div>
                  <span className="rounded-lg px-2.5 py-1 text-sm font-bold" style={{ background: 'var(--b-teal-soft)', color: 'var(--b-teal-deep)' }}>
                    +{money(s.annualSaving)}/yr
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--b-muted)' }}>{s.note}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px]" style={{ color: 'var(--b-faint)' }}>Source: {s.source}</span>
                  <ActionButton
                    kind="switch"
                    label="Switch"
                    target={`${s.fromProvider} → ${s.toProvider}`}
                    detail={`Estimated saving ${money(s.annualSaving)}/yr. ${s.note}`}
                    amount={`${money(s.annualSaving)}/yr`}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-relaxed" style={{ color: 'var(--b-faint)' }}>
            “Switch” prepares a draft switching request for your approval at /admin/approvals. Nothing is switched automatically — always confirm current rates on the provider’s site or Powerswitch first.
          </p>
        </Card>
      </div>
    </div>
  );
}
