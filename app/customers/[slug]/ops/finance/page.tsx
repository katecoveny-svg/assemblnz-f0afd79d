import { FinancePanel } from '@/components/ops/widgets/FinancePanel';
import { DemoRibbon } from '@/components/ops/DemoRibbon';

export default function FinancePage() {
  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <FinancePanel summary={{ revenue: 0, expenses: 0 }} />
    </div>
  );
}
