import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { Brand3DHero } from '@/components/ops/Brand3DHero';
import { FinancePanel } from '@/components/ops/widgets/FinancePanel';
import { RosterTable } from '@/components/ops/widgets/RosterTable';
import { DemoRibbon } from '@/components/ops/DemoRibbon';

export default async function OpsHome({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = getBrandConfig(slug);
  if (!config) notFound();

  return (
    <div className="flex flex-col gap-6">
      <DemoRibbon />
      <Brand3DHero config={config} />
      <FinancePanel summary={{ revenue: 0, expenses: 0 }} />
      <RosterTable rows={[]} />
    </div>
  );
}
