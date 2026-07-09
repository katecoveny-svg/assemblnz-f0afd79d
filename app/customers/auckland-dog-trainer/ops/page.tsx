import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import {
  FredDashboard,
  FRED_TABS,
  type FredTabKey,
} from '@/components/ops/fred/FredDashboard';

/**
 * Fred OS — Auckland Dog Trainer / Learn To Talk Dog concept ops.
 *
 * Standalone working demo hosted with the other /customers pilots. Hero
 * interaction is the Session Notes → Client Plan engine; tabs cover the MVP
 * modules from the brief (intake, programmes, course, support, hiring).
 */

type OpsSearchParams = { tab?: string | string[] };

const TAB_KEYS: ReadonlySet<string> = new Set(FRED_TABS.map((t) => t.key));

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AucklandDogTrainerOpsHome({
  searchParams,
}: {
  searchParams?: Promise<OpsSearchParams>;
}) {
  const config = getBrandConfig('auckland-dog-trainer');
  if (!config) notFound();

  const sp = await searchParams;
  const rawTab = first(sp?.tab);
  const tab: FredTabKey = TAB_KEYS.has(rawTab ?? '') ? (rawTab as FredTabKey) : 'overview';

  return (
    <div className="flex flex-col gap-4">
      <DemoRibbon />
      <FredDashboard tab={tab} />
    </div>
  );
}
