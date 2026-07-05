import type { Metadata } from 'next';
import Link from 'next/link';
import { palette, typography } from '@assembl/canvas/tokens';
import { BundleCard, KpiTrio, MicroLabel } from '@assembl/canvas';
import { LandscapeBackdrop } from '@/components/v2/HeroArt';
import { MottoStrip, V2Nav } from '@/components/v2/V2Chrome';
import { getLiveAgentCounts } from '@/lib/v2/live-counts';
import { orderedBundles, bundleBySlug } from '@/lib/marketplace/bundles';
import { PUBLIC_MARKETPLACE_AGENTS, CATEGORY_LABELS } from '@/lib/marketplace/agents';
import { capabilityProfileFor, CAPABILITY_BADGES } from '@/lib/marketplace/agent-capabilities';
import { AgentPickAndMix, type AgentCard } from '@/components/marketplace/AgentPickAndMix';
import { HAPAI_TOOLS } from '@/lib/hapai/shareable-tools';
import styles from '@/components/v2/v2.module.css';

export const metadata: Metadata = {
  title: 'agent marketplace — assembl',
  description:
    'discover agents. explore purpose-built collections — construction, automotive, creative, health, animal care, whānau, legal and immigration, built for the work new zealand teams actually do.',
  alternates: { canonical: '/agents' },
};

/**
 * /agents — the marketplace from DIRECTION-LOCKED-2026-07-01: floating bundle
 * cards over the particulate landscape, a quiet left rail, live agent counts
 * (real numbers from Supabase, code-registry fallback — never invented).
 *
 * Ships its own chrome (the global SiteHeader/Footer are suppressed on
 * /agents by isAgentMarketplace). /agents/[slug], /agents/[slug]/chat and the
 * checkout flow keep their existing surfaces.
 */

const RAIL_LINKS: Array<{ label: string; href?: string; active?: boolean }> = [
  { label: 'marketplace', href: '/agents', active: true },
  { label: 'collections', href: '/agents#collections' },
  { label: 'activity' }, // quiet coming-soon
  { label: 'integrations' }, // quiet coming-soon
  { label: 'knowledge', href: '/trust' },
  { label: 'settings' }, // quiet coming-soon
];

export default async function AgentsMarketplacePage() {
  const counts = await getLiveAgentCounts();
  const bundles = orderedBundles();
  const liveAgents = PUBLIC_MARKETPLACE_AGENTS.filter((a) => a.status === 'live');
  const freeTools = HAPAI_TOOLS.filter((t) => t.brand === 'dash' && t.status === 'live');

  // Pick-and-mix card model — capability layer merged over the registry,
  // serialized for the client grid (system prompts never leave the server).
  const agentCards: AgentCard[] = liveAgents.map((a) => {
    const profile = capabilityProfileFor(a);
    const knowledgeBacked =
      profile.knowledge.includes('tier_a_sources') || profile.knowledge.includes('supabase_knowledge');
    const connectorReady = profile.tools.includes('connector_ready');
    const miniApp = profile.channels.includes('pwa_mini_app');
    const badges = [
      ...(profile.voiceReady ? [CAPABILITY_BADGES.voice] : []),
      ...(knowledgeBacked ? [CAPABILITY_BADGES.knowledge] : []),
      ...(connectorReady ? [CAPABILITY_BADGES.connector] : []),
      ...(miniApp ? [CAPABILITY_BADGES.miniApp] : []),
      CAPABILITY_BADGES.humanReview,
    ];
    const oneLiner = a.description.length > 96 ? `${a.description.slice(0, 93).trimEnd()}…` : a.description;
    return {
      slug: a.slug,
      name: a.name,
      oneLiner,
      collection: a.bundle ? (bundleBySlug(a.bundle)?.name ?? a.bundle) : CATEGORY_LABELS[a.category],
      badges,
      voiceReady: profile.voiceReady,
      connectorReady,
      knowledgeBacked,
      miniApp,
      pilotReady: profile.pilotReady,
      tier: profile.recommendedTier,
    };
  });

  const body: React.CSSProperties = {
    fontFamily: typography.body.fontFamily,
    fontSize: 15,
    lineHeight: typography.body.lineHeight,
    color: palette.bodyGrey,
  };

  return (
    <div className={styles.page}>
      <V2Nav current="/agents" />

      <div className={styles.shell}>
        {/* ── left rail ────────────────────────────────────────────── */}
        <aside className={styles.rail} aria-label="Marketplace navigation">
          {RAIL_LINKS.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className={item.active ? styles.railItemActive : styles.railItem}
                aria-current={item.active ? 'page' : undefined}
              >
                {item.active ? (
                  <span aria-hidden style={{ color: palette.accentGold, fontSize: 11, lineHeight: 1 }}>
                    •
                  </span>
                ) : null}
                {item.label}
              </Link>
            ) : (
              <span key={item.label} className={styles.railSoon}>
                {item.label}
                <MicroLabel style={{ marginLeft: 'auto', fontSize: 9 }}>soon</MicroLabel>
              </span>
            ),
          )}

          {/* the network — REAL live count or nothing */}
          {counts.total > 0 ? (
            <div style={{ marginTop: 'auto', paddingTop: 24 }}>
              <div
                style={{
                  border: `1px solid ${palette.hairline}`,
                  borderRadius: 14,
                  background: '#FFFFFF',
                  padding: '16px 16px',
                }}
              >
                <MicroLabel>the network</MicroLabel>
                <div
                  style={{
                    fontFamily: typography.display.fontFamily,
                    fontWeight: typography.display.fontWeight,
                    fontSize: 30,
                    lineHeight: 1.1,
                    marginTop: 6,
                    color: palette.ink,
                  }}
                >
                  {counts.total} agents
                </div>
                <div style={{ ...body, fontSize: 12.5, marginTop: 2 }}>live today</div>
              </div>
            </div>
          ) : null}
        </aside>

        {/* ── canvas ───────────────────────────────────────────────── */}
        <main style={{ position: 'relative', overflow: 'hidden' }}>
          <LandscapeBackdrop opacity={0.85} />

          <div style={{ position: 'relative', padding: '48px 28px 40px', maxWidth: 1180 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span aria-hidden style={{ color: palette.accentGold, fontSize: 12, lineHeight: 1 }}>
                •
              </span>
              <MicroLabel>agent marketplace</MicroLabel>
            </div>
            <h1
              className={styles.h1}
              style={{ marginTop: 18, fontSize: 'clamp(2.2rem, 4.6vw, 3.4rem)' }}
            >
              discover agents.
              <br />
              explore purpose-built collections
              <span aria-hidden style={{ color: palette.accentGold }}>
                .
              </span>
            </h1>
            <p style={{ ...body, marginTop: 18, maxWidth: 380 }}>
              Purpose-built agents that work together across your business.
            </p>

            {/* floating bundle cards */}
            <div
              id="collections"
              className={styles.cardGrid}
              style={{ marginTop: 44, scrollMarginTop: 90 }}
            >
              {bundles.map((b, i) => {
                const live = counts.byBundle[b.slug] ?? 0;
                const floatClass = styles[`float${(i % 6) + 1}` as keyof typeof styles] as
                  | string
                  | undefined;
                return (
                  <Link
                    key={b.slug}
                    href={`/bundles/${b.slug}`}
                    className={`${styles.cardLink} ${floatClass ?? ''} rise`}
                  >
                    <BundleCard
                      title={b.name}
                      description={`${b.shortPitch.split('. ')[0].toLowerCase().replace(/\.$/, '')}.`}
                      tags={[b.category]}
                      gold={i % 3 === 1}
                      meta={
                        live > 0 ? `${live} agents live` : b.standalone ? 'standalone' : undefined
                      }
                      style={{ maxWidth: 'none', height: '100%' }}
                    />
                  </Link>
                );
              })}
            </div>

            {/* all live agents — pick and mix by capability */}
            <div className="rise" style={{ marginTop: 64 }}>
              <MicroLabel as="h2">pick and mix — all live agents</MicroLabel>
              <p style={{ ...body, marginTop: 10, maxWidth: 460 }}>
                Filter by what an agent can do. Every one drafts; a person you name approves.
              </p>
              <div style={{ marginTop: 18 }}>
                <AgentPickAndMix agents={agentCards} />
              </div>
            </div>

            {/* bottom KPI trio — real numbers only */}
            <div className="rise" style={{ marginTop: 56 }}>
              <KpiTrio
                stats={[
                  {
                    label: 'agents live',
                    value: counts.total > 0 ? counts.total : liveAgents.length,
                    hint: 'across the marketplace',
                  },
                  { label: 'collections', value: bundles.length, hint: 'purpose-built bundles' },
                  { label: 'free tools', value: freeTools.length, hint: 'open and use — no login' },
                ]}
              />
            </div>
          </div>

          <MottoStrip />
        </main>
      </div>
    </div>
  );
}
