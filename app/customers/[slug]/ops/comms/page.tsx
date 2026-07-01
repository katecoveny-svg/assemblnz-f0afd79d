import { CommsDrafts } from '@/components/ops/widgets/CommsDrafts';
import { DemoRibbon } from '@/components/ops/DemoRibbon';

export default function CommsPage() {
  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <CommsDrafts drafts={[]} />
    </div>
  );
}
