import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { Brand3DHero } from '@/components/ops/Brand3DHero';
import { FredDashboard } from '@/components/ops/fred/FredDashboard';
import { PilotAgentChat } from '@/components/customers/PilotAgentChat';
import { OsReveal } from '@/components/ops/shared/OsMotion';
import {
  FRED_TABS,
  type FredTabKey,
} from '@/lib/customers/auckland-dog-trainer/tabs';
import {
  FRED_AGENT_GREETING,
  FRED_AGENT_NAME,
  FRED_TRY_ME,
} from '@/lib/customers/auckland-dog-trainer/agent';

/**
 * Fred OS — Auckland Dog Trainer / Learn To Talk Dog concept ops.
 *
 * Standalone working demo hosted with the other /customers pilots. Hero
 * interaction is the Session Notes → Client Plan engine; live Fred desk agent
 * is wired beside the tabs. 3D hero + framer motion come from shared OS chrome.
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
    <div className="flex flex-col gap-5">
      <DemoRibbon />
      <OsReveal>
        <div className="h-56 overflow-hidden rounded-2xl md:h-64">
          <Brand3DHero config={config} />
        </div>
      </OsReveal>
      <OsReveal delay={0.08}>
        <FredDashboard tab={tab} />
      </OsReveal>
      <OsReveal delay={0.14}>
        <section className="rounded-2xl border border-[#1B2A4A]/12 bg-[color:var(--brand-surface)]/90 p-4 backdrop-blur-sm">
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
      </OsReveal>
    </div>
  );
}
