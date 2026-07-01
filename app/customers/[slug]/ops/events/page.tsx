import { EventsPlanner } from '@/components/ops/widgets/EventsPlanner';
import { DemoRibbon } from '@/components/ops/DemoRibbon';

export default function EventsPage() {
  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <EventsPlanner events={[]} />
    </div>
  );
}
