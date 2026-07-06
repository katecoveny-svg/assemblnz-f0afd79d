import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { palette, typography } from '@assembl/canvas/tokens';
import { MicroLabel } from '@assembl/canvas';
import { V2Nav, MottoStrip } from '@/components/v2/V2Chrome';
import { marketplaceAgentBySlug, toPublicAgent, CATEGORY_LABELS } from '@/lib/marketplace/agents';
import { bundleBySlug } from '@/lib/marketplace/bundles';
import {
  capabilityProfileFor,
  TIER_LABELS,
  type AgentChannel,
  type AgentDeploymentOption,
  type AgentKnowledgeCapability,
  type AgentToolCapability,
} from '@/lib/marketplace/agent-capabilities';
import {
  TOOL_ACTION_CATALOGUE,
  TOOL_STATUS_LABELS,
  type AgentToolActionType,
} from '@/lib/marketplace/agent-connectors';
import { DEFAULT_VOICE_CHANNEL, VOICE_READY_COPY } from '@/lib/marketplace/agent-voice-channel';
import styles from '@/components/v2/v2.module.css';

export const dynamic = 'force-dynamic';

/**
 * /agents/[slug]/studio — the product surface for configuring an agent.
 *
 * Not a backend builder yet: the left rail and right rail show, honestly,
 * what this agent can be configured to do (capability layer), while the
 * centre pane is the REAL live chat — the same /api/agents/[slug]/chat
 * runtime the marketplace uses, embedded same-origin so paywall, receipts,
 * trust footers and draft-mode all keep working untouched.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const agent = marketplaceAgentBySlug(slug);
  if (!agent) return {};
  return {
    title: `${agent.name} studio — assembl`,
    description: `configure ${agent.name}: knowledge, tools, channels and deployment — then test it live.`,
    robots: { index: false, follow: false },
  };
}

const KNOWLEDGE_LABELS: Record<AgentKnowledgeCapability, string> = {
  business_profile: 'your business profile',
  faqs: 'FAQs',
  uploaded_files: 'uploaded files',
  website_text: 'your website text',
  policies: 'policies',
  pricing: 'your pricing',
  locations: 'locations and hours',
  tone_of_voice: 'tone of voice',
  supabase_knowledge: 'assembl NZ knowledge base — live',
  tier_a_sources: 'cited official sources (Tier A) — live',
  manual_setup: 'shaped with the assembl team in a pilot',
};

const CHANNEL_LABELS: Record<AgentChannel, string> = {
  chat: 'chat — live',
  voice_ready: 'voice — ready, enabled per pilot',
  web_widget: 'website widget — can be configured',
  shareable_link: 'shareable link — live',
  pwa_mini_app: 'mini app (installable) — live',
  phone_ready: 'phone — with provider setup',
  sms_ready: 'SMS — with provider setup',
  email: 'email — being wired',
};

const DEPLOYMENT_LABELS: Record<AgentDeploymentOption, string> = {
  marketplace: 'marketplace profile',
  agent_chat: 'agent chat',
  website_widget: 'website widget',
  shareable_link: 'shareable link',
  mini_app: 'internal or customer mini app',
  voice_agent: 'voice agent',
  phone_agent: 'phone agent',
  admin_console: 'admin console',
};

/** Catalogue action type → the capability name an agent profile declares. */
const ACTION_CAPABILITY: Record<AgentToolActionType, AgentToolCapability> = {
  send_email: 'send_email',
  create_lead: 'create_lead',
  create_row: 'add_sheet_row',
  book_calendar: 'book_calendar',
  create_task: 'create_task',
  send_sms: 'send_sms',
  handoff: 'human_handoff',
  webhook: 'webhook',
  mcp_tool: 'connector_ready',
};

export default async function AgentStudioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const full = marketplaceAgentBySlug(slug);
  if (!full) notFound();
  const agent = toPublicAgent(full);
  const profile = capabilityProfileFor(agent);
  const actions = TOOL_ACTION_CATALOGUE.filter((t) =>
    profile.tools.includes(ACTION_CAPABILITY[t.actionType]),
  );
  const collection = agent.bundle ? bundleBySlug(agent.bundle)?.name : CATEGORY_LABELS[agent.category];

  const body: React.CSSProperties = {
    fontFamily: typography.body.fontFamily,
    fontSize: 13.5,
    lineHeight: 1.6,
    color: palette.bodyGrey,
  };
  const panel: React.CSSProperties = {
    border: `1px solid ${palette.hairline}`,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.94)',
    padding: '18px 20px',
  };
  const h3: React.CSSProperties = {
    fontFamily: typography.display.fontFamily,
    fontWeight: typography.display.fontWeight,
    fontSize: 19,
    textTransform: 'lowercase',
    margin: 0,
    color: palette.ink,
  };
  const dot = (state: 'live' | 'ready' | 'soon'): React.CSSProperties => ({
    display: 'inline-block',
    width: 7,
    height: 7,
    borderRadius: 999,
    marginRight: 8,
    background:
      state === 'live' ? palette.accentGold : state === 'ready' ? 'rgba(191,163,122,0.45)' : 'rgba(26,25,24,0.15)',
  });

  const liveChannels = profile.channels.filter((c) => CHANNEL_LABELS[c].includes('— live')).length;

  return (
    <div className={styles.page}>
      <V2Nav current="/agents" />

      <div className={styles.section} style={{ paddingTop: 34 }}>
        <div className={styles.inner} style={{ maxWidth: 1280 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
              •
            </span>
            <MicroLabel>agent studio · {collection}</MicroLabel>
          </div>
          <h1 className={styles.h1} style={{ marginTop: 14, fontSize: 'clamp(2rem, 4vw, 2.9rem)' }}>
            build an agent that knows your business
            <span aria-hidden style={{ color: palette.accentGold }}>
              .
            </span>
          </h1>
          <p style={{ ...body, fontSize: 15, marginTop: 12, maxWidth: 560 }}>
            Give {agent.name} a role, connect knowledge, choose the tools, then test before it
            goes live. Every output stays a draft until a person you name approves it.
          </p>

          {/* three panes ≥1100px, single column below (server component — plain
              style tag rather than styled-jsx) */}
          <style>{`
            .studio-grid { display: grid; grid-template-columns: 1fr; gap: 18px; margin-top: 34px; align-items: start; }
            @media (min-width: 1100px) {
              .studio-grid { grid-template-columns: minmax(230px, 280px) minmax(360px, 1fr) minmax(250px, 320px); }
            }
          `}</style>
          <div className="studio-grid">
            {/* ── left · profile + setup rail ─────────────────────── */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={panel}>
                <h2 style={h3}>{agent.name}</h2>
                <p style={{ ...body, marginTop: 8 }}>{agent.description}</p>
                <MicroLabel style={{ marginTop: 12, display: 'block' }}>
                  {agent.status === 'live' ? 'live in the marketplace' : 'coming soon'}
                </MicroLabel>
              </div>

              <div style={panel}>
                <MicroLabel as="h2">setup</MicroLabel>
                <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                  <li style={body}>
                    <span aria-hidden style={dot('live')} />
                    persona — role locked, human review always on
                  </li>
                  <li style={body}>
                    <span aria-hidden style={dot(profile.knowledge.includes('tier_a_sources') ? 'live' : 'ready')} />
                    knowledge —{' '}
                    {profile.knowledge.includes('tier_a_sources')
                      ? 'grounded, cites live sources'
                      : 'shaped with you in a pilot'}
                  </li>
                  <li style={body}>
                    <span aria-hidden style={dot('ready')} />
                    tools — {actions.length} actions can be configured
                  </li>
                  <li style={body}>
                    <span aria-hidden style={dot('live')} />
                    channels — {liveChannels} live today
                  </li>
                  <li style={body}>
                    <span aria-hidden style={dot('ready')} />
                    deploy — {profile.deployment.length} options
                  </li>
                </ul>
              </div>

              <div style={panel}>
                <MicroLabel as="h2">deploy as</MicroLabel>
                <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {profile.deployment.map((d) => (
                    <li key={d} style={body}>
                      {DEPLOYMENT_LABELS[d]}
                    </li>
                  ))}
                </ul>
                <p style={{ ...body, fontSize: 12, marginTop: 12 }}>
                  Deploy as a mini app — one simple app-like surface for intake, booking, FAQs,
                  reports, support or follow-up.
                </p>
              </div>
            </aside>

            {/* ── centre · the REAL chat ──────────────────────────── */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ ...panel, padding: 0, overflow: 'hidden' }}>
                {agent.status === 'live' ? (
                  <iframe
                    src={`/agents/${agent.slug}/chat`}
                    title={`test ${agent.name} — live chat`}
                    style={{ width: '100%', height: 620, border: 0, display: 'block' }}
                  />
                ) : (
                  <p style={{ ...body, padding: 24 }}>
                    {agent.name} isn&rsquo;t live yet — the test panel opens when it ships.
                  </p>
                )}
              </div>
              <p style={{ ...body, fontSize: 12 }}>
                This is the live runtime — the same chat, receipts and trust rules the
                marketplace runs. Test as a customer would, or as the owner reviewing drafts.
              </p>
              {agent.starters.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {agent.starters.slice(0, 4).map((s) => (
                    <span
                      key={s}
                      style={{
                        ...body,
                        fontSize: 12,
                        padding: '5px 12px',
                        borderRadius: 999,
                        border: `1px solid ${palette.hairline}`,
                        background: 'rgba(255,255,255,0.85)',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : null}
              {profile.voiceReady ? (
                <div style={panel}>
                  <MicroLabel as="h2">voice test</MicroLabel>
                  <p style={{ ...body, marginTop: 8 }}>
                    {VOICE_READY_COPY} Recording notice{' '}
                    {DEFAULT_VOICE_CHANNEL.recordingNoticeRequired ? 'required' : 'optional'};
                    configured with your provider during a pilot.
                  </p>
                </div>
              ) : null}
            </section>

            {/* ── right · capability summary ──────────────────────── */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={panel}>
                <MicroLabel as="h2">knowledge</MicroLabel>
                <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {profile.knowledge.map((k) => (
                    <li key={k} style={body}>
                      <span aria-hidden style={dot(KNOWLEDGE_LABELS[k].includes('— live') ? 'live' : 'ready')} />
                      {KNOWLEDGE_LABELS[k]}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={panel}>
                <MicroLabel as="h2">tools</MicroLabel>
                <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {actions.map((t) => (
                    <li key={t.id} style={body}>
                      <span style={{ color: palette.ink }}>{t.name}</span>
                      <span style={{ fontSize: 11.5 }}> · {TOOL_STATUS_LABELS[t.status]}</span>
                      <div style={{ ...body, fontSize: 12 }}>{t.description}</div>
                    </li>
                  ))}
                </ul>
                <p style={{ ...body, fontSize: 11.5, marginTop: 10 }}>
                  One connector layer for the apps you already run — scoped and connected during
                  a pilot, never behind your back.
                </p>
              </div>

              <div style={panel}>
                <MicroLabel as="h2">channels</MicroLabel>
                <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {profile.channels.map((c) => (
                    <li key={c} style={body}>
                      <span aria-hidden style={dot(CHANNEL_LABELS[c].includes('— live') ? 'live' : 'ready')} />
                      {CHANNEL_LABELS[c]}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ ...panel, borderColor: palette.goldSoft }}>
                <MicroLabel as="h2">the honest bit</MicroLabel>
                <p style={{ ...body, marginTop: 8 }}>
                  human review — always on. {agent.name} drafts; a person you name approves.
                </p>
                <p style={{ ...body, marginTop: 8 }}>
                  <span style={{ color: palette.ink }}>fits: </span>
                  {TIER_LABELS[profile.recommendedTier]}
                </p>
                <p style={{ ...body, fontSize: 11.5, marginTop: 8 }}>
                  Usage costs (voice minutes, SMS, premium models, third-party tools) are
                  separate and approved before launch.
                </p>
                <Link
                  href="/pilot-sprint"
                  className={styles.navCta}
                  style={{ marginTop: 14, justifyContent: 'center', display: 'flex' }}
                >
                  book a pilot
                  <span aria-hidden style={{ color: palette.accentGold, fontSize: 15, lineHeight: 1 }}>
                    •
                  </span>
                </Link>
              </div>
            </aside>
          </div>

          <p style={{ ...body, fontSize: 12.5, marginTop: 28 }}>
            Start with one useful agent. Prove the workflow. Add more when the work is earning
            its proof.{' '}
            <Link href={`/agents/${agent.slug}`} style={{ color: palette.ink }}>
              back to {agent.name}
            </Link>
          </p>
        </div>
      </div>

      <MottoStrip />
    </div>
  );
}
