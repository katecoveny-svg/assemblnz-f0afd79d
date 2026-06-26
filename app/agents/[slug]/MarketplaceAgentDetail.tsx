import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, ExternalLink, MessageCircle, CalendarClock } from 'lucide-react';
import {
  CATEGORY_LABELS,
  DASH_MOTIF,
  MODEL_TIER_LABELS,
  PALETTE,
  agentPriceLabel,
  agentCheckoutHref,
  type MarketplaceAgent,
} from '@/lib/marketplace/agents';
import { AgentIcon } from '@/components/marketplace/AgentIcon';
import { MarketplaceFooter, MarketplaceHeader } from '@/components/marketplace/MarketplaceChrome';
import orb from '@/components/marketplace/orbGrid.module.css';
import { agentEmailAddress } from '@/lib/agent-email/addresses';
import { EmailAgentLine } from './EmailAgentLine';

// Headline + name face: the assembl display, Cormorant Garamond — matches the
// homepage orb cards and the restyled marketplace grid so an agent reads the
// same on its card, detail and chat header (one continuous glass surface).
const HEADLINE: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
  fontWeight: 600,
  letterSpacing: '-0.02em',
};

// Soft gold-glow card surface — the orb-card look, reused for the detail panels.
const SURFACE: React.CSSProperties = {
  backgroundColor: PALETTE.paper,
  border: `1px solid ${PALETTE.hairline}`,
  boxShadow: '0 16px 44px rgba(180, 140, 0, 0.08)',
};

export function MarketplaceAgentDetail({ agent }: { agent: MarketplaceAgent }) {
  return (
    <div className="mk-root min-h-screen" style={{ backgroundColor: PALETTE.cream }}>
      <MarketplaceHeader />

      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
        <Link
          href="/agents"
          className="inline-flex items-center gap-1.5 text-sm font-bold hover:opacity-70"
          style={{ color: PALETTE.body }}
        >
          <ArrowLeft size={15} aria-hidden /> All agents
        </Link>

        {/* Header card */}
        <div
          className="mt-6 flex flex-col gap-6 rounded-[26px] p-6 md:flex-row md:items-center md:p-8"
          style={SURFACE}
        >
          <span
            className={`${orb.orb} shrink-0`}
            style={{
              width: 88,
              height: 88,
              background: 'radial-gradient(circle at 33% 26%, #FFFDF7 0%, #FFD42A 52%, #E0A800 100%)',
            }}
            aria-hidden
          >
            <span className={orb.orbSpec} aria-hidden />
            <AgentIcon name={agent.icon} className="relative h-11 w-11" />
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="mk-mono rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: PALETTE.cream, color: PALETTE.body }}
              >
                {CATEGORY_LABELS[agent.category]}
              </span>
              <span
                className="mk-mono rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: `${PALETTE.canary}66`, color: PALETTE.ink }}
              >
                {agentPriceLabel(agent)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-3">
              <h1 className="text-4xl leading-tight md:text-5xl" style={{ ...HEADLINE, color: PALETTE.ink }}>
                {agent.name}
              </h1>
            </div>
            <p className="mt-3 text-lg leading-relaxed" style={{ color: PALETTE.body }}>
              {agent.description}
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href={`/agents/${agent.slug}/chat`} className={orb.installPill} style={{ padding: '13px 26px', fontSize: 15 }}>
            <MessageCircle size={18} aria-hidden /> Try free
          </Link>
          {agent.priceNzd > 0 ? (
            <Link
              href={agentCheckoutHref(agent)}
              className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-base font-bold transition hover:bg-white"
              style={{ borderColor: PALETTE.ink, color: PALETTE.ink }}
            >
              {agent.vertical ? 'Get' : 'Subscribe ·'} {agentPriceLabel(agent)} <ArrowRight size={16} aria-hidden />
            </Link>
          ) : null}
          {agent.vertical ? (
            <a
              href={pilotBriefMailto(agent.name)}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-bold transition hover:brightness-95"
              style={{ backgroundColor: PALETTE.canary, color: PALETTE.ink }}
            >
              <CalendarClock size={17} aria-hidden /> Book a pilot brief
            </a>
          ) : null}
          {agent.toolHref ? (
            <Link
              href={agent.toolHref}
              className="inline-flex items-center gap-1.5 text-sm font-bold hover:opacity-70"
              style={{ color: PALETTE.body }}
            >
              See the full tool <ExternalLink size={14} aria-hidden />
            </Link>
          ) : null}
        </div>

        {agentEmailAddress(agent.slug) ? (
          <EmailAgentLine address={agentEmailAddress(agent.slug)!} />
        ) : null}

        <div className="mt-6 h-1.5 w-full rounded-full" style={{ background: DASH_MOTIF }} aria-hidden />

        {/* What it does / what you get */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card title="What it does">
            <BulletList items={agent.whatItDoes} />
          </Card>
          <Card title="What you get">
            <BulletList items={agent.whatYouGet} />
          </Card>
        </div>

        {/* Sample outputs */}
        <div className="mt-6">
          <Card title="Sample outputs">
            <div className="space-y-3">
              {agent.sampleOutputs.map((sample, i) => (
                <p
                  key={i}
                  className="rounded-2xl border px-4 py-3 text-sm"
                  style={{ borderColor: PALETTE.hairline, backgroundColor: PALETTE.cream, color: PALETTE.body }}
                >
                  “{sample}”
                </p>
              ))}
            </div>
          </Card>
        </div>

        {/* Pilot brief — for vertical agents, a way for a group to talk through
            a custom deployment before subscribing. */}
        {agent.vertical ? (
          <div className="mt-6">
            <section className="rounded-[26px] p-6 md:p-8" style={SURFACE}>
              <p className="mk-mono text-[11px] font-bold uppercase tracking-wide" style={{ color: PALETTE.muted }}>
                For groups
              </p>
              <h2 className="mt-2 text-2xl" style={{ ...HEADLINE, color: PALETTE.ink }}>
                Run {agent.name} across your group
              </h2>
              <p className="mt-3 text-base leading-relaxed" style={{ color: PALETTE.body }}>
                {agent.name} is a whole-business agent, set up per rooftop with your own data,
                users and compliance trail. Book a pilot brief and we will scope a deployment for
                your group — what it connects to, who reviews each draft, and how it proves its work.
              </p>
              <a
                href={pilotBriefMailto(agent.name)}
                className="mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-bold transition hover:brightness-95"
                style={{ backgroundColor: PALETTE.canary, color: PALETTE.ink }}
              >
                <CalendarClock size={17} aria-hidden /> Book a pilot brief
              </a>
            </section>
          </div>
        ) : null}

        {/* Meta — per-agent price (the first 3 messages with any agent are free) */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Meta label="Price" value={agentPriceLabel(agent)} />
          <Meta label="Model" value={MODEL_TIER_LABELS[agent.modelTier]} />
          <Meta label="Category" value={CATEGORY_LABELS[agent.category]} />
        </div>
        <p className="mt-3 text-sm" style={{ color: PALETTE.muted }}>
          The first 3 messages with any agent are free. Bundles available on the{' '}
          <Link href="/agents/pricing" className="font-bold underline" style={{ color: PALETTE.ink }}>
            pricing page
          </Link>
          .
        </p>

        <p className="mt-8 text-sm" style={{ color: PALETTE.muted }}>
          Every reply is a draft for a human to check before it is sent, filed, or lodged. Not legal,
          financial, or medical advice.
        </p>
      </div>

      <MarketplaceFooter />
    </div>
  );
}

/** Prefilled mailto for a vertical agent's "Book a pilot brief" CTA. */
function pilotBriefMailto(agentName: string): string {
  const subject = `Pilot brief — ${agentName}`;
  const body = [
    `Hello,`,
    ``,
    `We would like to talk through running ${agentName} across our group.`,
    ``,
    `Business / group name:`,
    `Number of sites / rooftops:`,
    `What we would want it to handle first:`,
    `Best contact + phone:`,
  ].join('\n');
  return `mailto:assembl@assembl.co.nz?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[26px] p-6" style={SURFACE}>
      <h2 className="text-2xl" style={{ ...HEADLINE, color: PALETTE.ink }}>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed" style={{ color: PALETTE.body }}>
          <span
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: PALETTE.canary }}
          >
            <Check size={13} style={{ color: PALETTE.ink }} aria-hidden />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl px-4 py-3" style={SURFACE}>
      <p className="mk-mono text-[11px] font-bold uppercase tracking-wide" style={{ color: PALETTE.muted }}>
        {label}
      </p>
      <p className="mt-1 text-base font-bold" style={{ color: PALETTE.ink }}>
        {value}
      </p>
    </div>
  );
}
