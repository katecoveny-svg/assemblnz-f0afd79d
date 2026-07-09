import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import {
  HappyTailsDaycareOS,
  HT_OS_TABS,
  type HtOsTab,
} from '@/components/ops/happy-tails/HappyTailsDaycareOS';
import { OsWowStage } from '@/components/ops/shared/OsWowStage';
import { PilotAgentChat } from '@/components/customers/PilotAgentChat';
import {
  HAPPY_TAILS_AGENT_GREETING,
  HAPPY_TAILS_AGENT_NAME,
  HAPPY_TAILS_TRY_ME,
} from '@/lib/customers/happy-tails/agent';
import { OsScrollReveal } from '@/components/ops/shared/OsMotion';

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
  const config = getBrandConfig('happy-tails');
  if (!config) notFound();

  const sp = await searchParams;
  const raw = first(sp?.tab);
  const tab: HtOsTab = TAB_KEYS.has(raw ?? '') ? (raw as HtOsTab) : 'week';

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <OsWowStage config={config} heroHeightClass="h-56 md:h-72" patternOpacity={0.14}>
        <div className="flex flex-col gap-5">
          <DemoRibbon />
          <HappyTailsDaycareOS tab={tab} />
          <OsScrollReveal delay={0.1}>
            <section className="rounded-3xl border border-black/10 bg-white/90 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl">
              <p
                className="mb-3 text-[10px] uppercase"
                style={{ letterSpacing: '0.16em', color: 'var(--brand-muted)' }}
              >
                live agent · {HAPPY_TAILS_AGENT_NAME}
              </p>
              <PilotAgentChat
                apiPath="/api/customers/happy-tails/chat"
                agentName={HAPPY_TAILS_AGENT_NAME}
                greeting={HAPPY_TAILS_AGENT_GREETING}
                tryMe={HAPPY_TAILS_TRY_ME}
                accent={config.colours.accent}
                draftNote="Draft-only: Keeper never sends — Mathis approves texts, Liana approves emails."
              />
            </section>
          </OsScrollReveal>
        </div>
      </OsWowStage>
    </div>
  );
}
