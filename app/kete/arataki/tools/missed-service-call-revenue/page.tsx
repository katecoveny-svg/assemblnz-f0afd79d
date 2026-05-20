import { CalculatorShell } from '@/components/arataki/CalculatorShell';
import { MissedServiceCallRevenue } from '@/components/arataki/calculators/MissedServiceCallRevenue';

export const metadata = { title: 'Missed Service Call Revenue' };

export default function Page() {
  return (
    <CalculatorShell slug="missed-service-call-revenue" title="Missed Service Call Revenue" description="When the workshop phones go to voicemail, some callers go to another dealer instead of leaving a message. This turns the leak into an annual service revenue number." timeToRun="90 seconds">
      <MissedServiceCallRevenue />
    </CalculatorShell>
  );
}
