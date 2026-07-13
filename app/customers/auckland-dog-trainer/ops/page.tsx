import { notFound } from 'next/navigation';
import { getBrandConfig } from '@/lib/brand/configs';
import { DemoRibbon } from '@/components/ops/DemoRibbon';
import { FredDashboard } from '@/components/ops/fred/FredDashboard';
import { PilotAgentChat } from '@/components/customers/PilotAgentChat';
import { OsWowStage } from '@/components/ops/shared/OsWowStage';
import { OsScrollReveal } from '@/components/ops/shared/OsMotion';
import { OsDashboard } from '@/components/os/OsDashboard';
import osStyles from '@/components/os/os.module.css';
import {
  FRED_TABS,
  type FredTabKey,
} from '@/lib/customers/auckland-dog-trainer/tabs';
import {
  FRED_AGENT_GREETING,
  FRED_AGENT_NAME,
  FRED_TRY_ME,
} from '@/lib/customers/auckland-dog-trainer/agent';
import { GENOME_SURFACES } from '@/lib/customers/auckland-dog-trainer/genome';
import {
  GENOME_TENANT,
  getLiveGenomeFacts,
  getLiveGenomeFactsForReview,
  getRecentEnquiries,
} from '@/lib/customers/auckland-dog-trainer/genome-store';
import { loadWorkView } from '@/lib/os/work-view';
import { loadConnectionsView } from '@/lib/os/connections';
import { loadIntelligenceView } from '@/lib/os/intelligence';

type OpsSearchParams = { tab?: string | string[] };

const TAB_KEYS: ReadonlySet<string> = new Set(FRED_TABS.map((t) => t.key));

const OPS = '/customers/auckland-dog-trainer/ops';

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/**
 * Today — the console's front door IS the assembl operating system: the same
 * pearl OsDashboard as /os, with every link staying inside the gated console.
 * The live desk agent sits below it, one scroll away from "ask assembl".
 */
async function PearlToday({ accent }: { accent: string }) {
  const [{ facts, live }, enquiries] = await Promise.all([
    getLiveGenomeFacts(),
    getRecentEnquiries(20),
  ]);
  const services = facts.filter((f) => f.section === 'services').length;

  return (
    <div className={`${osStyles.shell} ${osStyles.shellEmbedded}`}>
      <OsDashboard
        greeting="Mōrena, Sam."
        greetingSub="Here's what's happening in your business today."
        askHref="#desk-agent"
        tiles={[
          {
            label: 'new enquiries',
            value: String(enquiries.length),
            hint: enquiries.length > 0 ? 'replies drafted' : 'the desk is quiet',
          },
          { label: 'facts in your genome', value: String(facts.length), hint: live ? 'live' : 'sample' },
          { label: 'services live', value: String(services), hint: 'priced once, shown everywhere' },
          { label: 'improvement ready', value: '1', hint: 'waiting for your yes' },
        ]}
        actions={[
          enquiries.length > 0
            ? {
                text: `Reply to ${enquiries.length} new enquir${enquiries.length === 1 ? 'y' : 'ies'} — drafts are ready`,
                impact: 'high' as const,
                href: `${OPS}?tab=leads`,
              }
            : {
                text: 'Send yourself a test enquiry from the website',
                impact: 'high' as const,
                href: '/living-site/dog-training#book',
              },
          {
            text: 'Review the page rebuild assembl prepared overnight',
            impact: 'high',
            href: `${OPS}?tab=brief`,
          },
          {
            text: 'Update a price once — every surface follows',
            impact: 'medium',
            href: `${OPS}?tab=genome`,
          },
        ]}
        orbImage="/brand/genome/sphere-genome-alpha.png"
        orbInitial="h"
        orbSurfaces={GENOME_SURFACES.slice(0, 10).map((s) =>
          s.name.toLowerCase().replace('public ', '').replace(' & chat agent', '').replace(' assistant', ''),
        )}
        genomeHref={`${OPS}?tab=genome`}
        assistantLede="I've found a few opportunities to bring in more bookings this week. Want to see them?"
        assistantCta="show me"
        assistantHref={`${OPS}?tab=brief`}
        insightName="Top performing service"
        insightDelta="↑ steady"
        insightPoints={[22, 30, 26, 44, 38, 52, 47, 64, 58, 76]}
        quietLinks={FRED_TABS.filter((t) => t.key !== 'week').map((t) => ({
          label: t.label.toLowerCase(),
          href: `${OPS}?tab=${t.key}`,
        }))}
      />

      {/* the desk — same live agent, pearl skin, anchored for "ask assembl" */}
      <div id="desk-agent" className={osStyles.frame} style={{ paddingTop: 0 }}>
        <section className={osStyles.card}>
          <p className={osStyles.cardLabel}>the desk · {FRED_AGENT_NAME}</p>
          <PilotAgentChat
            apiPath="/api/customers/auckland-dog-trainer/chat"
            agentName={FRED_AGENT_NAME}
            greeting={FRED_AGENT_GREETING}
            tryMe={FRED_TRY_ME}
            accent={accent}
            draftNote="Draft-only: the desk never emails a client or books a session without your yes."
          />
        </section>
      </div>
    </div>
  );
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

  // Today is the assembl OS itself — the pearl screen, links gated.
  if (tab === 'week') return <PearlToday accent={config.colours.accent} />;

  // The review read: the owner's grid also shows suggested/unverified facts.
  const genome = tab === 'genome' ? await getLiveGenomeFactsForReview() : null;
  // The enquiry loop: public-website submissions land in living_site_enquiries
  // and surface here — full rows on the triage tab, the count on the brief.
  // Same limit as the Today tile so the two never show different numbers.
  const enquiries = tab === 'leads' || tab === 'brief' ? await getRecentEnquiries(20) : null;
  // Work & proof: what the OS is carrying and the evidence trail behind it.
  const work = tab === 'work' ? await loadWorkView(GENOME_TENANT) : null;
  // Connections: connected systems and capabilities, honestly reported.
  const connections = tab === 'connections' ? loadConnectionsView() : null;
  // Intelligence: signals computed from real activity, never invented.
  const intel = tab === 'intelligence' ? await loadIntelligenceView(GENOME_TENANT) : null;

  return (
    <OsWowStage
      config={config}
      heroHeightClass="min-h-64 md:min-h-80"
      patternOpacity={0.08}
      heroEyebrow="harbourside dog training · auckland"
      heroTitle="Harbourside Dog Training"
      heroBlurb="calm, method-first, operating at scale — session notes to homework, programmes, course, and social from the field."
    >
      <div className="flex flex-col gap-5">
        <DemoRibbon />
        <FredDashboard
          tab={tab}
          genomeFacts={genome?.facts}
          genomeLive={genome?.live ?? false}
          liveEnquiries={enquiries ?? undefined}
          liveEnquiryCount={enquiries ? enquiries.length : undefined}
          work={work}
          connections={connections}
          intel={intel}
        />
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
              draftNote="Draft-only: the desk never emails a client or books a session without your yes."
            />
          </section>
        </OsScrollReveal>
      </div>
    </OsWowStage>
  );
}
