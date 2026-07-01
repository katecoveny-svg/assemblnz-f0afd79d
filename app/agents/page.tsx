import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MessageCircle, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import {
  PUBLIC_MARKETPLACE_AGENTS,
  DASH_MOTIF,
  PALETTE,
  marketplaceAgentBySlug,
} from '@/lib/marketplace/agents';
import { orderedBundles, type BundleMeta } from '@/lib/marketplace/bundles';
import { HAPAI_TOOLS } from '@/lib/hapai/shareable-tools';
import { AgentIcon } from '@/components/marketplace/AgentIcon';
import { MarketplaceFooter, MarketplaceHeader } from '@/components/marketplace/MarketplaceChrome';

const FEATURED = PUBLIC_MARKETPLACE_AGENTS.find((a) => a.featured);

// The free, single-use HAPAI tools — no install, no chat, just open and use.
const FREE_TOOLS = HAPAI_TOOLS.filter((t) => t.brand === 'dash' && t.status === 'live');

const BUNDLE_CARDS = orderedBundles();

export const metadata: Metadata = {
  title: 'Agents — assembl',
  description:
    'Eight bundles and one standalone. Pick a bundle, meet the lead, install the specialists you need. Every reply is a draft for a human to check.',
};

export default function AgentsMarketplacePage() {
  return (
    <div className="mk-root min-h-screen" style={{ backgroundColor: PALETTE.cream }}>
      <MarketplaceHeader />

      {/* Hero */}
      <section className="px-5 pb-10 pt-12 md:px-8 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <p
            className="mk-mono text-xs font-bold uppercase tracking-[0.18em]"
            style={{ color: PALETTE.gold }}
          >
            The agent shelf
          </p>
          <h1
            className="mt-3 max-w-3xl text-4xl leading-[1.02] md:text-6xl"
            style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em', color: PALETTE.ink }}
          >
            Pick a bundle. Meet the lead. Install the specialists.
          </h1>
          {/* dash motif underline */}
          <div className="mt-5 h-1.5 w-40 rounded-full" style={{ background: DASH_MOTIF }} aria-hidden />
          <p className="mt-5 max-w-2xl text-lg leading-relaxed" style={{ color: PALETTE.body }}>
            Eight bundles for the work New Zealanders actually do — construction, automotive,
            creative, health, animal care, whānau, legal — plus one standalone for visas. One
            front-door agent, real specialists behind it.
          </p>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold" style={{ color: PALETTE.ink }}>
            <span className="inline-flex items-center gap-2">
              <Sparkles size={16} style={{ color: PALETTE.gold }} aria-hidden /> {BUNDLE_CARDS.length}{' '}
              front doors, one shelf
            </span>
            <span className="inline-flex items-center gap-2">
              <Zap size={16} style={{ color: PALETTE.gold }} aria-hidden /> Free to try
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={16} style={{ color: PALETTE.gold }} aria-hidden /> Drafts you review,
              data in Sydney
            </span>
          </div>
        </div>
      </section>

      {/* Featured — Atlas, the free coach, leads the shelf */}
      {FEATURED ? (
        <section className="px-5 pb-4 md:px-8">
          <div className="mx-auto max-w-6xl">
            <Link
              href="/atlas"
              className="group flex flex-col gap-5 rounded-[28px] border p-6 transition hover:-translate-y-0.5 md:flex-row md:items-center md:p-8"
              style={{
                borderColor: PALETTE.hairline,
                backgroundColor: PALETTE.ink,
                boxShadow: '0 22px 50px rgba(58,56,50,.22)',
              }}
            >
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: 'rgba(255,212,42,0.16)' }}
              >
                <AgentIcon name={FEATURED.icon} className="h-9 w-9" tone="ink" />
              </div>
              <div className="flex-1">
                <p
                  className="mk-mono text-[11px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: PALETTE.canary }}
                >
                  Start here · free
                </p>
                <h2
                  className="mt-2 text-2xl md:text-3xl"
                  style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em', color: PALETTE.paper }}
                >
                  New to this? Talk to Atlas.
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: 'rgba(255,247,236,0.82)' }}>
                  The free AI coach. It maps your week, points you to the agents that fit, and tells you straight
                  where AI will not help. Voice-enabled, no message cap.
                </p>
              </div>
              <span
                className="inline-flex shrink-0 items-center gap-2 self-start rounded-full px-5 py-2.5 text-sm font-bold transition group-hover:brightness-95 md:self-center"
                style={{ backgroundColor: PALETTE.canary, color: PALETTE.ink }}
              >
                <MessageCircle size={16} aria-hidden /> Meet Atlas
                <ArrowRight size={15} aria-hidden />
              </span>
            </Link>
          </div>
        </section>
      ) : null}

      {/* The 8 bundles + Visa standalone. Nine cards, one shelf. */}
      <section className="px-5 pb-16 pt-6 md:px-8">
        <div className="mx-auto max-w-6xl">
          <header className="mb-6">
            <p
              className="mk-mono text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: PALETTE.gold }}
            >
              Bundles · a whole vertical behind one lead
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: PALETTE.body }}>
              Eight bundles plus Visa as a standalone. Meet the lead agent, then open the specialists
              inside. Free to try, then a monthly bundle price for the ones you keep.
            </p>
          </header>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BUNDLE_CARDS.map((bundle) => (
              <BundleCard key={bundle.slug} bundle={bundle} />
            ))}
          </div>
        </div>
      </section>

      {/* HAPAI tools — free, single-use, no install. */}
      <section className="px-5 pb-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-t pt-12" style={{ borderColor: PALETTE.hairline }}>
            <div>
              <p
                className="mk-mono text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: PALETTE.gold }}
              >
                HAPAI tools · free, no install
              </p>
              <h2
                className="mt-2 text-3xl md:text-4xl"
                style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em', color: PALETTE.ink }}
              >
                Need something quick? Use a free tool.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: PALETTE.body }}>
                No sign-up, no install — open one, do the one job, share the result. The rates notice,
                the school newsletter, your rental, the bus fare, the holiday pay.
              </p>
            </div>
            <Link
              href="/hapai"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold transition hover:opacity-70"
              style={{ color: PALETTE.ink }}
            >
              See all free tools
              <ArrowRight size={15} aria-hidden />
            </Link>
          </header>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FREE_TOOLS.map((tool) => (
              <Link
                key={tool.slug}
                href={tool.href}
                className="group flex flex-col rounded-[26px] border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(180,150,40,0.12)]"
                style={{ borderColor: PALETTE.hairline }}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <span
                    className="mk-mono rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
                    style={{ backgroundColor: PALETTE.ink, color: PALETTE.canary }}
                  >
                    HAPAI tool
                  </span>
                  <span
                    className="mk-mono rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
                    style={{ backgroundColor: PALETTE.cream, color: PALETTE.gold }}
                  >
                    Free
                  </span>
                </div>
                <h3
                  className="text-xl leading-tight"
                  style={{ fontFamily: 'var(--mk-display), sans-serif', fontWeight: 900, letterSpacing: '-0.02em', color: PALETTE.ink }}
                >
                  {tool.name}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed" style={{ color: PALETTE.body }}>
                  {tool.description}
                </p>
                <span
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold transition group-hover:gap-2.5"
                  style={{ color: PALETTE.ink }}
                >
                  Open tool
                  <ArrowRight size={15} aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <MarketplaceFooter />
    </div>
  );
}

function BundleCard({ bundle }: { bundle: BundleMeta }) {
  const lead = marketplaceAgentBySlug(bundle.leadSlug);
  const leadName = lead?.name ?? formatSlugName(bundle.leadSlug);
  const isStandalone = bundle.standalone === true;
  const priceLine = isStandalone
    ? `Pack · $${bundle.monthlyNzd}`
    : `Bundle · $${bundle.monthlyNzd}/mo`;
  const href = `/bundles/${bundle.slug}`;

  return (
    <Link
      href={href}
      className="group flex flex-col rounded-[26px] border bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(180,150,40,0.14)]"
      style={{ borderColor: PALETTE.hairline }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${PALETTE.canary}22` }}
        >
          <AgentIcon name={bundle.icon} className="h-8 w-8" />
        </div>
        <div>
          <p className="mk-mono text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: PALETTE.gold }}>
            {isStandalone ? 'Standalone' : 'Bundle'}
            {bundle.teReo ? ` · ${bundle.teReo}` : ''}
          </p>
          <h3
            className="mt-0.5 text-2xl leading-tight"
            style={{
              fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: PALETTE.ink,
            }}
          >
            {bundle.name}
          </h3>
        </div>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: PALETTE.body }}>
        {bundle.shortPitch}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: PALETTE.muted }}>
        <span className="mk-mono">Lead · {leadName}</span>
        <span aria-hidden>·</span>
        <span className="mk-mono">{priceLine}</span>
      </div>

      <span
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold transition group-hover:gap-2.5"
        style={{ color: PALETTE.ink }}
      >
        See specialists
        <ArrowRight size={15} aria-hidden />
      </span>
    </Link>
  );
}

function formatSlugName(slug: string): string {
  return slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}
