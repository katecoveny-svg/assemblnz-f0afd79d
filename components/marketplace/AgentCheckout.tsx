'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Search } from 'lucide-react';
import { PALETTE, DASH_MOTIF } from '@/lib/marketplace/agents';
import {
  PRO_STACK_EVERYDAY_COUNT,
  PRO_STACK_SPECIALIST_COUNT,
} from '@/lib/billing/agent-pricing';
import { AgentIcon } from '@/components/marketplace/AgentIcon';
import { MarketplaceFooter, MarketplaceHeader } from '@/components/marketplace/MarketplaceChrome';

type SlimAgent = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  accent: string;
  priceNzd: number;
  vertical: boolean;
};

type PlanProps = {
  id: string;
  name: string;
  monthlyNzd: number;
  /** null = all-access (no pick); 1 = per-agent; N = bundle. */
  agentCount: number | null;
};

// assembl marketplace headline (CANON-LOCKED-2026-06-23): Cormorant Garamond.
const DISPLAY: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
  fontWeight: 600,
  letterSpacing: '-0.02em',
};

const isEverydayAgent = (a: SlimAgent) => !a.vertical && a.priceNzd < 100;
const isSpecialistAgent = (a: SlimAgent) => !a.vertical && a.priceNzd >= 100;

export function AgentCheckout({
  plan,
  agents,
  preselect,
  promo,
}: {
  plan: PlanProps;
  agents: SlimAgent[];
  preselect: string | null;
  /** Active promo code (JULYLAUNCH50) to ride through to checkout, or null. */
  promo?: string | null;
}) {
  const allAccess = plan.agentCount == null;
  const proStack = plan.id === 'pro_stack';
  const required = plan.agentCount ?? 0;

  const bySlug = useMemo(() => new Map(agents.map((a) => [a.slug, a])), [agents]);

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(preselect ? [preselect] : []),
  );
  const [query, setQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedAgents = useMemo(
    () => Array.from(selected).map((s) => bySlug.get(s)).filter(Boolean) as SlimAgent[],
    [selected, bySlug],
  );
  const everydayPicked = selectedAgents.filter(isEverydayAgent).length;
  const specialistPicked = selectedAgents.filter(isSpecialistAgent).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter(
      (a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q),
    );
  }, [agents, query]);

  // Whether a not-yet-selected agent can still be added under the plan's rules.
  function canAdd(a: SlimAgent): boolean {
    if (proStack) {
      if (a.vertical) return false; // verticals aren't part of Pro Stack
      if (isSpecialistAgent(a)) return specialistPicked < PRO_STACK_SPECIALIST_COUNT;
      return everydayPicked < PRO_STACK_EVERYDAY_COUNT;
    }
    return selected.size < required;
  }

  function toggle(slug: string) {
    setErrorMsg(null);
    const agent = bySlug.get(slug);
    if (!agent) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else if (canAdd(agent)) {
        next.add(slug);
      }
      return next;
    });
  }

  const mixOk = proStack
    ? everydayPicked === PRO_STACK_EVERYDAY_COUNT &&
      specialistPicked === PRO_STACK_SPECIALIST_COUNT
    : selected.size === required;
  const canSubmit = allAccess || mixOk;

  async function submit() {
    if (submitting || !canSubmit) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/agents/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          plan: plan.id,
          agents: allAccess ? [] : Array.from(selected),
          ...(promo ? { promo } : {}),
        }),
      });

      if (res.status === 401) {
        const back = `/agents/checkout?plan=${plan.id}${promo ? `&promo=${promo}` : ''}`;
        window.location.href = `/login?redirect=${encodeURIComponent(back)}`;
        return;
      }

      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setErrorMsg(
        res.status === 503
          ? 'Payments are not switched on yet — check back shortly.'
          : data.error || 'Could not start checkout. Please try again.',
      );
    } catch {
      setErrorMsg('Could not reach the checkout. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mk-root min-h-screen" style={{ backgroundColor: PALETTE.cream }}>
      <MarketplaceHeader />

      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 text-sm font-bold hover:opacity-70"
          style={{ color: PALETTE.body }}
        >
          <ArrowLeft size={15} aria-hidden /> Back to pricing
        </Link>

        <h1 className="mt-5 text-3xl leading-tight md:text-4xl" style={{ ...DISPLAY, color: PALETTE.ink }}>
          {allAccess ? `Confirm ${plan.name}` : `Pick your agents — ${plan.name}`}
        </h1>
        <p className="mt-2 text-lg" style={{ color: PALETTE.body }}>
          {allAccess
            ? 'All-Access unlocks every agent in the marketplace, now and as we add them.'
            : proStack
              ? `Choose ${PRO_STACK_EVERYDAY_COUNT} everyday agents and ${PRO_STACK_SPECIALIST_COUNT} specialist. Change them any month.`
              : required === 1
                ? 'Choose the agent you want to subscribe to.'
                : `Choose ${required} agents. You can change them later from your account.`}{' '}
          <span className="font-bold" style={{ color: PALETTE.ink }}>
            NZ${plan.monthlyNzd}/mo.
          </span>
        </p>

        {promo ? (
          <p className="mt-2 text-sm font-bold" style={{ color: PALETTE.gold }}>
            Promo {promo} applied — 50% off your first month.
          </p>
        ) : null}

        <div className="mt-5 h-1.5 w-full rounded-full" style={{ background: DASH_MOTIF }} aria-hidden />

        {!allAccess ? (
          <>
            {/* Count + search */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-bold" style={{ color: PALETTE.ink }}>
                {proStack
                  ? `${everydayPicked}/${PRO_STACK_EVERYDAY_COUNT} everyday · ${specialistPicked}/${PRO_STACK_SPECIALIST_COUNT} specialist`
                  : `${selected.size} of ${required} selected`}
              </p>
              <div
                className="flex items-center gap-2 rounded-full border bg-white px-3 py-2"
                style={{ borderColor: PALETTE.hairline }}
              >
                <Search size={15} style={{ color: PALETTE.muted }} aria-hidden />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search agents…"
                  className="w-44 bg-transparent text-sm outline-none"
                  style={{ color: PALETTE.ink }}
                />
              </div>
            </div>

            {/* Grid */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a) => {
                const on = selected.has(a.slug);
                const atCap = !on && !canAdd(a);
                return (
                  <button
                    key={a.slug}
                    type="button"
                    onClick={() => toggle(a.slug)}
                    disabled={atCap}
                    aria-pressed={on}
                    className="flex items-start gap-3 rounded-[20px] border bg-white p-4 text-left transition disabled:opacity-45"
                    style={{
                      borderColor: on ? PALETTE.canary : PALETTE.hairline,
                      boxShadow: on ? `0 0 0 2px ${PALETTE.canary}` : undefined,
                    }}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${a.accent}55` }}
                    >
                      <AgentIcon name={a.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold" style={{ color: PALETTE.ink }}>
                          {a.name}
                        </span>
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border"
                          style={{
                            borderColor: on ? PALETTE.canary : PALETTE.hairline,
                            backgroundColor: on ? PALETTE.canary : 'transparent',
                          }}
                        >
                          {on ? <Check size={12} style={{ color: PALETTE.ink }} aria-hidden /> : null}
                        </span>
                      </span>
                      {proStack ? (
                        <span
                          className="mt-0.5 block text-[10.5px] font-bold uppercase tracking-[0.12em]"
                          style={{
                            fontFamily: 'var(--font-space-mono), ui-monospace, monospace',
                            color: PALETTE.muted,
                          }}
                        >
                          {a.vertical ? 'Not in Pro Stack' : isSpecialistAgent(a) ? 'Specialist' : 'Everyday'}
                        </span>
                      ) : null}
                      <span className="mt-1 block text-xs leading-snug" style={{ color: PALETTE.body }}>
                        {a.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {errorMsg ? (
          <p
            className="mt-6 rounded-2xl border px-4 py-3 text-sm"
            style={{ borderColor: 'rgba(180,60,40,0.3)', backgroundColor: 'rgba(180,60,40,0.06)', color: '#7a2a1a' }}
          >
            {errorMsg}
          </p>
        ) : null}

        {/* Sticky-ish action bar */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit || submitting}
            className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-base font-bold transition hover:brightness-95 disabled:opacity-45"
            style={{ backgroundColor: PALETTE.canary, color: PALETTE.ink }}
          >
            {submitting ? 'Starting checkout…' : `Continue to payment · NZ$${plan.monthlyNzd}/mo`}
          </button>
          {!allAccess && !canSubmit ? (
            <span className="text-sm" style={{ color: PALETTE.muted }}>
              {proStack
                ? 'Pick 3 everyday agents and 1 specialist to continue.'
                : `Pick ${required - selected.size} more to continue.`}
            </span>
          ) : null}
        </div>

        <p className="mt-8 text-sm" style={{ color: PALETTE.muted }}>
          You&apos;ll be taken to Stripe to enter payment. Prices in NZD, GST inclusive. Cancel any
          time.
        </p>
      </div>

      <MarketplaceFooter />
    </div>
  );
}
