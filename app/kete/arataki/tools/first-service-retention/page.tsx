import { CalculatorShell } from '@/components/arataki/CalculatorShell';
import { FirstServiceRetention } from '@/components/arataki/calculators/FirstServiceRetention';

export const metadata = { title: 'First-Service Retention' };

export default function Page() {
  return (
    <CalculatorShell slug="first-service-retention" title="First-Service Retention" description="Customers who miss their first scheduled service are far more likely to leave the brand. This estimates the lifetime value recovered by lifting first-service retention." timeToRun="2 minutes">
      <FirstServiceRetention />
    </CalculatorShell>
  );
}
