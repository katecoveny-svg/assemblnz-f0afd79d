import { ComplianceCalendar } from '@/components/ops/widgets/ComplianceCalendar';
import { DemoRibbon } from '@/components/ops/DemoRibbon';

export default function CompliancePage() {
  const monthLabel = new Date().toLocaleString('en-NZ', {
    month: 'long',
    year: 'numeric',
  });
  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <ComplianceCalendar items={[]} monthLabel={monthLabel} />
    </div>
  );
}
