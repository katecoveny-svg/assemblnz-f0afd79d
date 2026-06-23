import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, ExternalLink, MessageCircle } from 'lucide-react';
import {
  CATEGORY_LABELS,
  DASH_MOTIF,
  MODEL_TIER_LABELS,
  PALETTE,
  priceLabel,
  type MarketplaceAgent,
} from '@/lib/marketplace/agents';
import { AgentIcon } from '@/components/marketplace/AgentIcon';
import { MarketplaceFooter, MarketplaceHeader } from '@/components/marketplace/MarketplaceChrome';

const DISPLAY: React.CSSProperties = {
  fontFamily: 'var(--mk-display), sans-serif',
  fontWeight: 900,
  letterSpacing: '-0.02em',
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
          className="mt-6 flex flex-col gap-6 rounded-[26px] border bg-white p-6 md:flex-row md:items-center md:p-8"
          style={{ borderColor: PALETTE.hairline }}
        >
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[20px]"
            style={{ backgroundColor: `${agent.accent}55` }}
          >
            <AgentIcon name={agent.icon} className="h-10 w-10" />
          </div>
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
                {priceLabel(agent)}
              </span>
            </div>
            <h1 className="mt-3 text-4xl leading-tight md:text-5xl" style={{ ...DISPLAY, color: PALETTE.ink }}>
              {agent.name}
            </h1>
            <p className="mt-3 text-lg leading-relaxed" style={{ color: PALETTE.body }}>
              {agent.description}
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/agents/${agent.slug}/chat`}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-bold transition hover:brightness-95"
            style={{ backgroundColor: PALETTE.canary, color: PALETTE.ink }}
          >
            <MessageCircle size={18} aria-hidden /> Open chat
          </Link>
          <Link
            href={`/agents/${agent.slug}/chat`}
            className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-base font-bold transition hover:bg-white"
            style={{ borderColor: PALETTE.ink, color: PALETTE.ink }}
          >
            Install <ArrowRight size={16} aria-hidden />
          </Link>
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

        {/* Pricing + meta */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Meta label="Pricing" value={priceLabel(agent)} />
          <Meta label="Model" value={MODEL_TIER_LABELS[agent.modelTier]} />
          <Meta label="Category" value={CATEGORY_LABELS[agent.category]} />
        </div>

        <p className="mt-8 text-sm" style={{ color: PALETTE.muted }}>
          Every reply is a draft for a human to check before it is sent, filed, or lodged. Not legal,
          financial, or medical advice.
        </p>
      </div>

      <MarketplaceFooter />
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[26px] border bg-white p-6" style={{ borderColor: PALETTE.hairline }}>
      <h2 className="text-2xl" style={{ ...DISPLAY, color: PALETTE.ink }}>
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
    <div className="rounded-2xl border bg-white px-4 py-3" style={{ borderColor: PALETTE.hairline }}>
      <p className="mk-mono text-[11px] font-bold uppercase tracking-wide" style={{ color: PALETTE.muted }}>
        {label}
      </p>
      <p className="mt-1 text-base font-bold" style={{ color: PALETTE.ink }}>
        {value}
      </p>
    </div>
  );
}
