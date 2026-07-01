import { RosterTable } from '@/components/ops/widgets/RosterTable';
import { DemoRibbon } from '@/components/ops/DemoRibbon';

export default function RosterPage() {
  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <RosterTable rows={[]} />
    </div>
  );
}
