import { DemoRibbon } from '@/components/ops/DemoRibbon';
import {
  HappyTailsDaycareOS,
  HT_OS_TABS,
  type HtOsTab,
} from '@/components/ops/happy-tails/HappyTailsDaycareOS';

/**
 * Happy Tails Daycare OS console — mirrors Fred OS layers for doggy daycare
 * (enrolment, bus, welcome packs, invoices, capacity) — not training.
 */

type SearchParams = { tab?: string | string[] };

const TAB_KEYS: ReadonlySet<string> = new Set(HT_OS_TABS.map((t) => t.key));

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function HappyTailsDaycareOsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const raw = first(sp?.tab);
  const tab: HtOsTab = TAB_KEYS.has(raw ?? '') ? (raw as HtOsTab) : 'week';

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8">
      <DemoRibbon />
      <HappyTailsDaycareOS tab={tab} />
    </div>
  );
}
