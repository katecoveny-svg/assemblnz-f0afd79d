'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Plus } from 'lucide-react';
import type { Agent } from '@/lib/agents';
import { KETES } from '@/lib/kete';
import { CANON_TRANSITION, hoverLift } from '@/components/motion';

const KETE_BY_SLUG = Object.fromEntries(KETES.map((k) => [k.slug, k])) as Record<
  Agent['kete'],
  (typeof KETES)[number]
>;

export function AgentCard({
  agent,
  index = 0,
  selected = false,
  onToggle,
  className = '',
  href,
}: {
  agent: Agent;
  index?: number;
  selected?: boolean;
  onToggle?: () => void;
  className?: string;
  href?: string;
}) {
  const kete = KETE_BY_SLUG[agent.kete];
  const agentHref = href ?? `/agents/${agent.slug}`;
  const showRole = agent.role.trim().toLowerCase() !== agent.name.trim().toLowerCase();

  return (
    <motion.article
      layout
      initial={{ opacity: 0.6, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverLift}
      transition={{ ...CANON_TRANSITION, delay: Math.min(index * 0.035, 0.28) }}
      className={`group relative flex h-full flex-col overflow-hidden rounded-card border bg-white/55 p-7 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_18px_44px_rgba(58,56,50,0.12)] focus-within:-translate-y-1 focus-within:scale-[1.01] focus-within:shadow-[0_18px_44px_rgba(58,56,50,0.12)] ${
        selected
          ? 'border-[color:var(--assembl-sage-mist)] ring-2 ring-inset ring-[color:var(--assembl-sage-mist)]'
          : 'border-[rgba(35,33,31,0.10)]'
      } ${className}`}
      style={{ ['--kete-accent' as string]: kete.accent }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-full w-1 transition-all duration-300 group-hover:w-1.5 group-focus-within:w-1.5"
        style={{ backgroundColor: kete.accent }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-40 group-focus-within:opacity-40"
        style={{ background: kete.accent }}
      />

      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: kete.accent }} aria-hidden />
        <Link
          href={`/kete/${kete.slug}`}
          className="rounded-sm font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        >
          {kete.name} · {kete.industry}
        </Link>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <Link href={agentHref} className="rounded-sm focus-visible:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2">
          <h3 className="font-display text-3xl font-light leading-none text-[color:var(--text-primary)]">
            {agent.name}
          </h3>
        </Link>
        <span className="rounded-full border border-[rgba(58,56,50,0.28)] bg-[rgba(58,56,50,0.08)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--assembl-pounamu)]">
          {agent.status ?? 'live'}
        </span>
      </div>
      {showRole && (
        <p className="mt-1 font-mono text-xs text-[color:var(--text-secondary)]">{agent.role}</p>
      )}

      <p className="mt-4 flex-1 text-sm leading-relaxed text-[color:var(--text-body)]">
        {agent.oneLiner}
      </p>

      {agent.legislation.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {agent.legislation.slice(0, 3).map((law) => (
            <span
              key={law}
              className="rounded-full border border-[rgba(35,33,31,0.12)] bg-white/60 px-2.5 py-1 font-mono text-[10px] text-[color:var(--text-secondary)]"
            >
              § {law}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 grid gap-1.5 border-t border-[rgba(35,33,31,0.08)] pt-4 text-xs text-[color:var(--text-body)]">
        {agent.buyingOptions.subscribe && (
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[color:var(--text-secondary)]">Subscribe</span>
            <Check className="h-3.5 w-3.5 text-[color:var(--assembl-sage-mist)]" aria-hidden />
          </div>
        )}
        {agent.buyingOptions.perOutput !== null && (
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[color:var(--text-secondary)]">Per output</span>
            <span className="font-mono text-xs">from NZ${agent.buyingOptions.perOutput}</span>
          </div>
        )}
        {agent.buyingOptions.perResolution !== null && (
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-[color:var(--text-secondary)]">Per resolution</span>
            <span className="font-mono text-xs">NZ${agent.buyingOptions.perResolution}</span>
          </div>
        )}
      </div>

      {onToggle && (
        <button
          onClick={onToggle}
          className={`mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 ${
            selected
              ? 'border-[color:var(--assembl-sage-mist)] bg-[color:var(--assembl-sage-mist)] text-[color:var(--assembl-paper)]'
              : 'border-[rgba(35,33,31,0.18)] bg-white/40 text-[color:var(--text-primary)] hover:border-[color:var(--text-primary)]'
          }`}
          aria-pressed={selected}
        >
          {selected ? (
            <>
              <Check className="h-4 w-4" aria-hidden />
              Added
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" aria-hidden />
              Add agent
            </>
          )}
        </button>
      )}
    </motion.article>
  );
}
