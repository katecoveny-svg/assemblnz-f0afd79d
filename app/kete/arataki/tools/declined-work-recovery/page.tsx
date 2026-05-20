import { CalculatorShell } from '@/components/arataki/CalculatorShell';
import { DeclinedWorkRecovery } from '@/components/arataki/calculators/DeclinedWorkRecovery';

export const metadata = { title: 'Declined Work Recovery' };

export default function Page() {
  return (
    <CalculatorShell slug="declined-work-recovery" title="Declined Work Recovery" description="Declined workshop quotes often disappear without a structured follow-up. This estimates the annual revenue recoverable from a better follow-up rhythm." timeToRun="90 seconds">
      <DeclinedWorkRecovery />
    </CalculatorShell>
  );
}
