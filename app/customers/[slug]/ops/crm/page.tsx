import { CustomerCRM } from '@/components/ops/widgets/CustomerCRM';
import { DemoRibbon } from '@/components/ops/DemoRibbon';

export default function CRMPage() {
  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <CustomerCRM customers={[]} />
    </div>
  );
}
