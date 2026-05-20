import { CalculatorShell } from '@/components/arataki/CalculatorShell';
import { LeadResponseLeakage } from '@/components/arataki/calculators/LeadResponseLeakage';

export const metadata = { title: 'Lead Response Leakage' };

export default function Page() {
  return (
    <CalculatorShell slug="lead-response-leakage" title="Lead Response Leakage" description="Dealer sales leads that are handled quickly convert better. This estimates the gross-profit gap between current response speed and a five-minute target." timeToRun="90 seconds">
      <LeadResponseLeakage />
    </CalculatorShell>
  );
}
