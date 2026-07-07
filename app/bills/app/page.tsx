import Link from 'next/link';
import { EyeOff, PiggyBank, ReceiptText, Search, ArrowRight } from 'lucide-react';
import { Card, PageHeading, SectionLabel, CategoryTag, TrendChip, money } from '@/components/bills/kit';
import { SpendTrendChart, CategoryDonut, CategoryLegend } from '@/components/bills/charts';
import { stats, bills, hiddenCostsTotal, savingsTotal, household } from '@/lib/bills/data';

const quickActions = [
  { href: '/bills/app/savings', Icon: PiggyBank, title: 'Review savings', body: `$${savingsTotal.toLocaleString('en-NZ')} found across 6 alternatives` },
  { href: '/bills/app/hidden-costs', Icon: EyeOff, title: 'Cut hidden costs', body: `$${hiddenCostsTotal.toLocaleString('en-NZ')} flagged for review` },
  { href: '/bills/app/bills', Icon: ReceiptText, title: 'Add a bill', body: 'Upload a PDF or photo, or connect email' },
  { href: '/bills/app/providers', Icon: Search, title: 'Compare providers', body: '14 NZ plans across power, broadband, insurance' },
];

const toneStyle: Record<string, { fg: string }> = {
  good: { fg: 'var(--b-teal-deep)' },
  cost: { fg: 'var(--b-coral-deep)' },
  neutral: { fg: 'var(--b-ink)' },
};

export default function OverviewPage() {
  const recent = bills.slice(0, 4);
  return (
    <div>
      <PageHeading
        title="Good evening, Kate"
        lead={`Here’s where ${household.name} stands this month — ${household.billsTracked} bills tracked across ${household.suburb}.`}
      />

      {/* 5-stat row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.key} className="!p-4">
            <p className="text-xs" style={{ color: 'var(--b-faint)' }}>{s.label}</p>
            <p className="mt-1 text-2xl font-bold" style={{ fontFamily: 'var(--font-bills-display)', color: (toneStyle[s.tone] ?? toneStyle.neutral).fg }}>
              {s.value}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug" style={{ color: 'var(--b-muted)' }}>{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* Trend + donut */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="mb-1 flex items-center justify-between">
            <SectionLabel>7-month spend trend</SectionLabel>
            <span className="text-[11px]" style={{ color: 'var(--b-faint)' }}>teal = total · coral = electricity</span>
          </div>
          <SpendTrendChart />
        </Card>
        <Card>
          <SectionLabel>This month by category</SectionLabel>
          <div className="grid items-center gap-2 sm:grid-cols-2">
            <CategoryDonut />
            <CategoryLegend />
          </div>
        </Card>
      </div>

      {/* Hidden cost callout */}
      <Link href="/bills/app/hidden-costs" className="mt-4 block">
        <div className="flex items-center justify-between gap-4 rounded-2xl p-5 transition hover:opacity-95" style={{ background: 'var(--b-coral-soft)', border: '1px solid #F0CFC3' }}>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: 'var(--b-coral)' }}>
              <EyeOff size={18} />
            </span>
            <div>
              <p className="font-semibold" style={{ fontFamily: 'var(--font-bills-display)', color: 'var(--b-ink)' }}>
                {money(hiddenCostsTotal)}/yr in hidden costs detected
              </p>
              <p className="mt-0.5 text-sm" style={{ color: 'var(--b-muted)' }}>
                Unused subscriptions, a duplicate debit, an ACC overpayment and high KiwiSaver fees — all reviewable, none acted on without you.
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="hidden shrink-0 sm:block" style={{ color: 'var(--b-coral-deep)' }} />
        </div>
      </Link>

      {/* Recent bills + quick actions */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <SectionLabel>Recent bills</SectionLabel>
            <Link href="/bills/app/bills" className="text-xs font-semibold" style={{ color: 'var(--b-teal-deep)' }}>View all →</Link>
          </div>
          <div className="space-y-2.5">
            {recent.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold" style={{ color: 'var(--b-ink)' }}>{b.provider}</span>
                    <CategoryTag category={b.category} />
                  </div>
                  {b.trend && <div className="mt-1"><TrendChip trend={b.trend} note={b.trendNote} /></div>}
                </div>
                <span className="shrink-0 text-sm font-bold" style={{ color: 'var(--b-ink)' }}>{money(b.amount)}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((a) => (
            <Link key={a.href} href={a.href}>
              <Card className="!p-4 h-full transition hover:opacity-95">
                <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'var(--b-teal-soft)', color: 'var(--b-teal-deep)' }}>
                  <a.Icon size={17} />
                </span>
                <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-bills-display)', color: 'var(--b-ink)' }}>{a.title}</p>
                <p className="mt-1 text-[11px] leading-snug" style={{ color: 'var(--b-muted)' }}>{a.body}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
