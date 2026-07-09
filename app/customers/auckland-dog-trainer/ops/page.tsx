import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { FredDashboard } from '@/components/ops/fred/FredDashboard';
import { PilotAgentChat } from '@/components/customers/PilotAgentChat';
import { OsWowStage } from '@/components/ops/shared/OsWowStage';
import { OsScrollReveal } from '@/components/ops/shared/OsMotion';
import {
  FRED_TABS,
  type FredTabKey,
} from '@/lib/customers/auckland-dog-trainer/tabs';
import {
  FRED_AGENT_GREETING,
  FRED_AGENT_NAME,
  FRED_TRY_ME,
} from '@/lib/customers/auckland-dog-trainer/agent';

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
  const tab: FredTabKey = TAB_KEYS.has(rawTab ?? '') ? (rawTab as FredTabKey) : 'week';

  return (
    <OsWowStage
      config={config}
      heroHeightClass="min-h-64 md:min-h-80"
      patternOpacity={0.18}
      heroEyebrow="learn to talk dog · auckland"
      heroTitle="Auckland Dog Trainer"
      heroBlurb="Fred’s method, operating at scale — session notes to homework, programmes, course, and social from the field."
    >
      <div className="flex flex-col gap-5">
        <DemoRibbon />
        <FredDashboard tab={tab} />
        <OsScrollReveal delay={0.08}>
          <section className="rounded-3xl border border-[#1B2A4A]/12 bg-[color:var(--brand-surface)]/90 p-5 shadow-[0_20px_50px_rgba(27,42,74,0.08)] backdrop-blur-xl">
            <p
              className="mb-3 text-[10px] uppercase"
              style={{ letterSpacing: '0.16em', color: 'var(--brand-muted)' }}
            >
              live agent · {FRED_AGENT_NAME}
            </p>
            <PilotAgentChat
              apiPath="/api/customers/auckland-dog-trainer/chat"
              agentName={FRED_AGENT_NAME}
              greeting={FRED_AGENT_GREETING}
              tryMe={FRED_TRY_ME}
              accent={config.colours.accent}
              draftNote="Draft-only: the Fred desk never emails a client or books a session without Fred’s yes."
            />
          </section>
        </OsScrollReveal>
      </div>
    </OsWowStage>
  );
}
