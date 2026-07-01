import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, MessageCircle, ShieldCheck, Clock } from 'lucide-react';
import {
  DASH_MOTIF,
  PALETTE,
  agentPriceLabel,
  bundleAgents,
  marketplaceAgentBySlug,
  type PublicMarketplaceAgent,
} from '@/lib/marketplace/agents';
import { KAITIAKI_BUNDLE } from '@/lib/marketplace/bundles';
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

export const metadata: Metadata = {
  title: 'Kaitiaki — the animal-care bundle — assembl',
  description: KAITIAKI_BUNDLE.subtitle,
};

const lead = marketplaceAgentBySlug(KAITIAKI_BUNDLE.leadSlug);
const members = bundleAgents(KAITIAKI_BUNDLE.slug);
const bySlug = new Map(members.map((a) => [a.slug, a]));

export default function KaitiakiBundlePage() {
  const specialtyCount = members.filter((a) => a.slug !== KAITIAKI_BUNDLE.leadSlug).length;

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
            <AgentIcon name={KAITIAKI_BUNDLE.icon} className="relative h-12 w-12" />
          </span>
          <div className="flex-1">
            <p className="mk-mono text-xs font-bold uppercase tracking-[0.18em]" style={{ color: PALETTE.gold }}>
              The eighth bundle · {KAITIAKI_BUNDLE.teReo}
            </p>
            <h1 className="mt-2 text-5xl leading-[1.02] md:text-6xl" style={{ ...HEADLINE, color: PALETTE.ink }}>
              Kaitiaki
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed" style={{ color: PALETTE.body }}>
              {KAITIAKI_BUNDLE.subtitle}
            </p>
            <div className="mt-5 h-1.5 w-40 rounded-full" style={{ background: DASH_MOTIF }} aria-hidden />
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href={`/agents/${KAITIAKI_BUNDLE.leadSlug}/chat`} className={orb.installPill} style={{ padding: '13px 26px', fontSize: 15 }}>
                <MessageCircle size={18} aria-hidden /> Talk to Keeper
              </Link>
              <span
                className="mk-mono rounded-full px-3 py-2 text-[12px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: `${PALETTE.canary}66`, color: PALETTE.ink }}
              >
                Bundle ${KAITIAKI_BUNDLE.monthlyNzd}/mo · seat ${KAITIAKI_BUNDLE.seatNzd}/mo
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: PALETTE.body }}>
                <ShieldCheck size={15} style={{ color: PALETTE.gold }} aria-hidden /> {specialtyCount} specialists,
                one front door
              </span>
            </div>
          </div>
        </section>

        {/* Lead — Keeper */}
        {lead ? (
          <section className="mt-6 rounded-[26px] p-6 md:p-8" style={{ ...SURFACE, backgroundColor: PALETTE.ink }}>
            <p className="mk-mono text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: PALETTE.canary }}>
              The lead agent
            </p>
            <h2 className="mt-2 text-3xl" style={{ ...HEADLINE, color: PALETTE.paper }}>
              Kia ora, I&rsquo;m your Keeper.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed" style={{ color: 'rgba(255,247,236,0.82)' }}>
              {lead.description}
            </p>
            <Link
              href={`/agents/${lead.slug}/chat`}
              className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition hover:brightness-95"
              style={{ backgroundColor: PALETTE.canary, color: PALETTE.ink }}
            >
              <MessageCircle size={16} aria-hidden /> Meet Keeper <ArrowRight size={15} aria-hidden />
            </Link>
          </section>
        ) : null}

        {/* Groups of specialties */}
        {KAITIAKI_BUNDLE.groups.map((group) => (
          <section key={group.label} className="mt-10">
            <header className="mb-5">
              <h2 className="text-3xl md:text-4xl" style={{ ...HEADLINE, color: PALETTE.ink }}>
                {group.label}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed" style={{ color: PALETTE.body }}>
                {group.blurb}
              </p>
            </header>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.slugs.map((slug) => {
                const agent = bySlug.get(slug);
                return agent ? <SpecialtyCard key={slug} agent={agent} /> : null;
              })}
            </div>
          </section>
        ))}

        {/* Design partners — honest positioning */}
        <section className="mt-12 rounded-[26px] p-6 md:p-8" style={SURFACE}>
          <p className="mk-mono text-[11px] font-bold uppercase tracking-wide" style={{ color: PALETTE.muted }}>
            Design partners · concept · pilot pending
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed" style={{ color: PALETTE.body }}>
            The Doggy Daycare specialty is being shaped with Happy Tails Daycare, and the Zoo Vet
            specialty with Auckland Zoo. Both are early design partnerships — no partnership is signed,
            and nothing here claims one. Conservation specialties that touch taonga species ship only
            with kaumātua and DOC sign-off; until then they read as &ldquo;coming soon&rdquo;.
          </p>
        </section>

        <p className="mt-8 text-sm" style={{ color: PALETTE.muted }}>
          Every reply is a draft for a registered veterinarian, an authorised welfare inspector, a
          licensed daycare operator, or a named kaitiaki reviewer to review and sign before it is real
          care. Not veterinary, legal or welfare-enforcement advice.
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
            <Clock size={13} aria-hidden /> Pending iwi + DOC sign-off
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
