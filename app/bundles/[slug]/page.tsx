import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, MessageCircle, ShieldCheck, Clock } from 'lucide-react';
import {
  DASH_MOTIF,
  PALETTE,
  agentPriceLabel,
  bundleAgents,
  marketplaceAgentBySlug,
  type PublicMarketplaceAgent,
} from '@/lib/marketplace/agents';
import { bundleBySlug, BUNDLES } from '@/lib/marketplace/bundles';
import { AgentIcon } from '@/components/marketplace/AgentIcon';
import { MarketplaceFooter, MarketplaceHeader } from '@/components/marketplace/MarketplaceChrome';
import orb from '@/components/marketplace/orbGrid.module.css';

const HEADLINE: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
  fontWeight: 600,
  letterSpacing: '-0.02em',
};

const SURFACE: React.CSSProperties = {
  backgroundColor: PALETTE.paper,
  border: `1px solid ${PALETTE.hairline}`,
  boxShadow: '0 16px 44px rgba(180, 140, 0, 0.08)',
};

// Kaitiaki has a bespoke landing page at /bundles/kaitiaki so the dynamic route
// intentionally does not answer for that slug (Next.js prefers the static route
// but we bounce here as a belt-and-braces check).
const HANDLED_ELSEWHERE = new Set(['kaitiaki']);

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return Object.keys(BUNDLES)
    .filter((slug) => !HANDLED_ELSEWHERE.has(slug))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bundle = bundleBySlug(slug);
  if (!bundle || HANDLED_ELSEWHERE.has(slug)) {
    return { title: 'Bundle — assembl' };
  }
  return {
    title: `${bundle.name} — ${bundle.category} bundle — assembl`,
    description: bundle.subtitle,
  };
}

export default async function BundlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (HANDLED_ELSEWHERE.has(slug)) notFound();
  const bundle = bundleBySlug(slug);
  if (!bundle) notFound();

  const lead = marketplaceAgentBySlug(bundle.leadSlug);
  const members = bundleAgents(bundle.slug);
  const bySlug = new Map(members.map((a) => [a.slug, a]));
  const specialtyCount = members.filter((a) => a.slug !== bundle.leadSlug).length;
  const isStandalone = bundle.standalone === true;
  const priceLine = isStandalone
    ? `Pack · $${bundle.monthlyNzd}`
    : `Bundle $${bundle.monthlyNzd}/mo · seat $${bundle.seatNzd}/mo`;

  return (
    <div className="mk-root min-h-screen" style={{ backgroundColor: PALETTE.cream }}>
      <MarketplaceHeader />

      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        <Link
          href="/agents"
          className="inline-flex items-center gap-1.5 text-sm font-bold hover:opacity-70"
          style={{ color: PALETTE.body }}
        >
          <ArrowLeft size={15} aria-hidden /> All agents
        </Link>

        {/* Hero */}
        <section className="mt-6 flex flex-col gap-6 rounded-[28px] p-6 md:flex-row md:items-center md:p-9" style={SURFACE}>
          <span
            className={`${orb.orb} shrink-0`}
            style={{
              width: 96,
              height: 96,
              background: 'radial-gradient(circle at 33% 26%, #FFFDF7 0%, #FFD42A 52%, #E0A800 100%)',
            }}
            aria-hidden
          >
            <span className={orb.orbSpec} aria-hidden />
            <AgentIcon name={bundle.icon} className="relative h-12 w-12" />
          </span>
          <div className="flex-1">
            <p className="mk-mono text-xs font-bold uppercase tracking-[0.18em]" style={{ color: PALETTE.gold }}>
              {isStandalone ? 'Standalone' : 'Bundle'}
              {bundle.teReo ? ` · ${bundle.teReo}` : ''}
            </p>
            <h1 className="mt-2 text-5xl leading-[1.02] md:text-6xl" style={{ ...HEADLINE, color: PALETTE.ink }}>
              {bundle.name}
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed" style={{ color: PALETTE.body }}>
              {bundle.subtitle}
            </p>
            <div className="mt-5 h-1.5 w-40 rounded-full" style={{ background: DASH_MOTIF }} aria-hidden />
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {lead ? (
                <Link
                  href={`/agents/${lead.slug}/chat`}
                  className={orb.installPill}
                  style={{ padding: '13px 26px', fontSize: 15 }}
                >
                  <MessageCircle size={18} aria-hidden /> Talk to {lead.name}
                </Link>
              ) : (
                <span
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold"
                  style={{ backgroundColor: `${PALETTE.canary}66`, color: PALETTE.ink }}
                >
                  <Clock size={16} aria-hidden /> Lead agent coming soon
                </span>
              )}
              <span
                className="mk-mono rounded-full px-3 py-2 text-[12px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: `${PALETTE.canary}66`, color: PALETTE.ink }}
              >
                {priceLine}
              </span>
              {specialtyCount > 0 ? (
                <span
                  className="inline-flex items-center gap-1.5 text-sm font-bold"
                  style={{ color: PALETTE.body }}
                >
                  <ShieldCheck size={15} style={{ color: PALETTE.gold }} aria-hidden /> {specialtyCount}{' '}
                  specialists, one front door
                </span>
              ) : null}
            </div>
          </div>
        </section>

        {/* Lead agent */}
        {lead ? (
          <section className="mt-6 rounded-[26px] p-6 md:p-8" style={{ ...SURFACE, backgroundColor: PALETTE.ink }}>
            <p className="mk-mono text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: PALETTE.canary }}>
              The lead agent
            </p>
            <h2 className="mt-2 text-3xl" style={{ ...HEADLINE, color: PALETTE.paper }}>
              Meet {lead.name}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed" style={{ color: 'rgba(255,247,236,0.82)' }}>
              {lead.description}
            </p>
            <Link
              href={`/agents/${lead.slug}/chat`}
              className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition hover:brightness-95"
              style={{ backgroundColor: PALETTE.canary, color: PALETTE.ink }}
            >
              <MessageCircle size={16} aria-hidden /> Talk to {lead.name} <ArrowRight size={15} aria-hidden />
            </Link>
          </section>
        ) : (
          <section className="mt-6 rounded-[26px] p-6 md:p-8" style={SURFACE}>
            <p className="mk-mono text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: PALETTE.muted }}>
              Coming soon
            </p>
            <h2 className="mt-2 text-3xl" style={{ ...HEADLINE, color: PALETTE.ink }}>
              The lead agent is being built.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed" style={{ color: PALETTE.body }}>
              {bundle.name}&rsquo;s front-door agent is on the roadmap. In the meantime, the
              specialists below are what ships today.
            </p>
          </section>
        )}

        {/* Groups of specialties */}
        {bundle.groups.map((group) => (
          <section key={group.label} className="mt-10">
            <header className="mb-5">
              <h2 className="text-3xl md:text-4xl" style={{ ...HEADLINE, color: PALETTE.ink }}>
                {group.label}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed" style={{ color: PALETTE.body }}>
                {group.blurb}
              </p>
            </header>
            {group.slugs.length === 0 ? (
              <div
                className="rounded-[20px] border p-6 text-sm"
                style={{ borderColor: PALETTE.hairline, color: PALETTE.muted, backgroundColor: PALETTE.paper }}
              >
                Specialists here are still being built. Watch this space.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.slugs.map((s) => {
                  const agent = bySlug.get(s);
                  return agent ? <SpecialtyCard key={s} agent={agent} /> : null;
                })}
              </div>
            )}
          </section>
        ))}

        <p className="mt-12 text-sm" style={{ color: PALETTE.muted }}>
          Every reply is a draft for a registered practitioner, licensed operator, or named reviewer to
          check and sign before it is acted on. Not legal, financial, medical or professional advice.
        </p>
      </div>

      <MarketplaceFooter />
    </div>
  );
}

function SpecialtyCard({ agent }: { agent: PublicMarketplaceAgent }) {
  const comingSoon = agent.status === 'coming_soon';
  return (
    <div className={orb.card}>
      <span className={orb.cardGlow} aria-hidden />
      <Link href={`/agents/${agent.slug}`} className={orb.head} aria-label={`${agent.name} — details`}>
        <span
          className={orb.orb}
          style={{ background: 'radial-gradient(circle at 33% 26%, #FFFDF7 0%, #FFCF3A 52%, #E0A800 100%)' }}
          aria-hidden
        >
          <span className={orb.orbSpec} aria-hidden />
          <AgentIcon name={agent.icon} className={orb.orbIcon} />
        </span>
        <span className={orb.nameWrap}>
          <span className={orb.name}>{agent.name}</span>
          <span className={orb.tag}>
            {comingSoon ? 'Coming soon' : agentPriceLabel(agent)}
          </span>
        </span>
      </Link>

      <Link href={`/agents/${agent.slug}`} className={orb.blurb}>
        {agent.description}
      </Link>

      <div className={orb.foot}>
        {comingSoon ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: PALETTE.muted }}>
            <Clock size={13} aria-hidden /> Coming soon
          </span>
        ) : (
          <span className={orb.price}>{agentPriceLabel(agent)}</span>
        )}
        <span className={orb.footActions}>
          <Link href={`/agents/${agent.slug}`} className={orb.details}>
            Details
          </Link>
          {comingSoon ? null : (
            <Link href={`/agents/${agent.slug}/chat`} className={orb.installPill}>
              Open
              <ArrowRight size={14} aria-hidden />
            </Link>
          )}
        </span>
      </div>
    </div>
  );
}
