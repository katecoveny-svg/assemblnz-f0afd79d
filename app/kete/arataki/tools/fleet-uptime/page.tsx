import { CalculatorShell } from '@/components/arataki/CalculatorShell';
import { FleetUptime } from '@/components/arataki/calculators/FleetUptime';

export const metadata = { title: 'Fleet Uptime' };

export default function Page() {
  return (
    <CalculatorShell slug="fleet-uptime" title="Fleet Uptime" description="For commercial customers, downtime is hard cost. This estimates annual savings from reducing vehicle downtime across a fleet." timeToRun="90 seconds">
      <FleetUptime />
    </CalculatorShell>
  );
}
