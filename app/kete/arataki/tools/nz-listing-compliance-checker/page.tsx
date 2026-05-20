import { CalculatorShell } from '@/components/arataki/CalculatorShell';
import { NzListingComplianceChecker } from '@/components/arataki/calculators/NzListingComplianceChecker';

export const metadata = { title: 'NZ Listing Compliance Checker' };

export default function Page() {
  return (
    <CalculatorShell slug="nz-listing-compliance-checker" title="NZ Listing Compliance Checker" description="Check a vehicle listing before it goes live. The result flags pass, warnings, or blockers with the relevant NZ compliance reference." timeToRun="3 minutes" legislationCites={['Consumer Guarantees Act 1993', 'Fair Trading Act 1986', 'Motor Vehicle Sales Act 2003', 'PPSR Act 1999']}>
      <NzListingComplianceChecker />
    </CalculatorShell>
  );
}
