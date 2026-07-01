import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { FinancePanel } from '@/components/ops/widgets/FinancePanel';

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <div className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5">
        <h3 className="text-lg font-semibold text-[color:var(--brand-ink)]">Reports</h3>
        <p className="mt-1 text-sm text-[color:var(--brand-muted)]">
          Weekly and monthly rollups — connect data sources to populate.
        </p>
      </div>
      <FinancePanel summary={{ revenue: 0, expenses: 0 }} />
    </div>
  );
}
