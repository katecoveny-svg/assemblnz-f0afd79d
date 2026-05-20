import { CalculatorShell } from '@/components/arataki/CalculatorShell';
import { ServiceLaneTradeIn } from '@/components/arataki/calculators/ServiceLaneTradeIn';

export const metadata = { title: 'Service Lane Trade-In' };

export default function Page() {
  return (
    <CalculatorShell slug="service-lane-trade-in" title="Service Lane Trade-In" description="Customers in for service who are three to five years into ownership are often prime trade-up opportunities. This estimates the annual gross profit from surfacing them to sales." timeToRun="2 minutes">
      <ServiceLaneTradeIn />
    </CalculatorShell>
  );
}
