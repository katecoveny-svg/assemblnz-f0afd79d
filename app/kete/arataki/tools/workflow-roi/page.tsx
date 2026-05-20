import { CalculatorShell } from '@/components/arataki/CalculatorShell';
import { WorkflowRoi } from '@/components/arataki/calculators/WorkflowRoi';

export const metadata = { title: 'Workflow ROI' };

export default function Page() {
  return (
    <CalculatorShell slug="workflow-roi" title="Workflow ROI" description="A general payback model for any assembl workflow: labour saved, revenue unlocked, annual cost, net value, and payback period." timeToRun="90 seconds">
      <WorkflowRoi />
    </CalculatorShell>
  );
}
