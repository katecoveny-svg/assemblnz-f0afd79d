import { getBrandConfig } from '@/lib/brand/configs';
import { notFound } from 'next/navigation';
import { Brand3DHero } from '@/components/ops/Brand3DHero';
import { FinancePanel } from '@/components/ops/widgets/FinancePanel';
import { RosterTable } from '@/components/ops/widgets/RosterTable';
import { CommsDrafts } from '@/components/ops/widgets/CommsDrafts';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import {
  happyTailsRoster,
  happyTailsFinance,
  happyTailsComms,
} from '@/lib/customers/happy-tails/demo-data';

/**
 * Reference implementation — Happy Tails ops landing wired to the demo data set.
 * The [slug]/ops route already handles routing + shell for us. Because Next.js
 * takes the more specific route first, this file is what renders at
 * /customers/happy-tails/ops.
 */
export default function HappyTailsOpsHome() {
  const config = getBrandConfig('happy-tails');
  if (!config) notFound();

  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <Brand3DHero config={config} />
      <FinancePanel summary={happyTailsFinance} />
      <RosterTable rows={happyTailsRoster} />
      <CommsDrafts drafts={happyTailsComms} />
    </div>
  );
}
