'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { palette, typography } from '@assembl/canvas/tokens';
import type { RecommendedTier } from '@/lib/marketplace/agent-capabilities';

/**
 * Pick-and-mix agent grid — the client leaf of /agents.
 *
 * Receives a serializable card model (computed server-side from the registry
 * + capability layer; the locked system prompts never cross to the browser)
 * and renders capability filters over floating cards. Filters are AND-ed;
 * the tier filter is single-select. Everything degrades to "show all".
 */

export type AgentCard = {
  slug: string;
  name: string;
  oneLiner: string;
  collection: string;
  badges: string[];
  voiceReady: boolean;
  connectorReady: boolean;
  knowledgeBacked: boolean;
  miniApp: boolean;
  pilotReady: boolean;
  tier: RecommendedTier;
};

const CAPABILITY_FILTERS = [
  { key: 'voiceReady', label: 'voice-ready' },
  { key: 'connectorReady', label: 'connector-ready' },
  { key: 'knowledgeBacked', label: 'knowledge-backed' },
  { key: 'miniApp', label: 'mini app' },
  { key: 'pilotReady', label: 'pilot-ready' },
] as const;

type CapabilityKey = (typeof CAPABILITY_FILTERS)[number]['key'];

const TIER_FILTERS: Array<{ key: RecommendedTier | 'all'; label: string }> = [
  { key: 'all', label: 'any tier' },
  { key: 'individual', label: 'individual' },
  { key: 'operator', label: 'operator' },
  { key: 'enterprise', label: 'enterprise' },
  { key: 'outcome', label: 'outcome' },
];

export function AgentPickAndMix({ agents }: { agents: AgentCard[] }) {
  const [active, setActive] = useState<Set<CapabilityKey>>(new Set());
  const [tier, setTier] = useState<RecommendedTier | 'all'>('all');

  const filtered = useMemo(
    () =>
      agents.filter((a) => {
        if (tier !== 'all' && a.tier !== tier) return false;
        for (const key of active) if (!a[key]) return false;
        return true;
      }),
    [agents, active, tier],
  );

  const toggle = (key: CapabilityKey) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const body: React.CSSProperties = {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 1.55,
    color: palette.bodyGrey,
  };

  const chip = (selected: boolean): React.CSSProperties => ({
    ...body,
    fontSize: 12,
    cursor: 'pointer',
    padding: '6px 13px',
    borderRadius: 999,
    border: `1px solid ${selected ? palette.accentGold : palette.hairline}`,
    background: selected ? 'rgba(191,163,122,0.13)' : 'rgba(255,255,255,0.85)',
    color: selected ? palette.ink : palette.bodyGrey,
    transition: 'border-color 200ms ease, background 200ms ease',
  });

  return (
    <div>
      {/* capability filters — AND-ed toggles */}
      <div
        role="group"
        aria-label="Filter agents by capability"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
      >
        {CAPABILITY_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={active.has(f.key)}
            onClick={() => toggle(f.key)}
            style={chip(active.has(f.key))}
          >
            {f.label}
          </button>
        ))}
        <span aria-hidden style={{ ...body, fontSize: 12, alignSelf: 'center', opacity: 0.5 }}>
          ·
        </span>
        {TIER_FILTERS.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-pressed={tier === t.key}
            onClick={() => setTier(t.key)}
            style={chip(tier === t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p style={{ ...body, marginTop: 12 }} aria-live="polite">
        {filtered.length} of {agents.length} agents
        {active.size > 0 || tier !== 'all' ? ' match' : ''}
      </p>

      {/* floating agent cards */}
      <div
        style={{
          marginTop: 18,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: 16,
        }}
      >
        {filtered.map((a) => (
          <div
            key={a.slug}
            className="agent-mix-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: '20px 20px 16px',
              borderRadius: 16,
              border: `1px solid ${palette.hairline}`,
              background: 'rgba(255,255,255,0.92)',
              boxShadow: '0 8px 28px rgba(26, 25, 24, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
              <span
                style={{
                  fontFamily: typography.display.fontFamily,
                  fontWeight: typography.display.fontWeight,
                  fontSize: 21,
                  textTransform: 'lowercase',
                  color: palette.ink,
                }}
              >
                {a.name}
              </span>
              <span
                style={{
                  ...body,
                  fontSize: 9.5,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                {a.collection}
              </span>
            </div>

            <p style={{ ...body, margin: 0, minHeight: 40 }}>{a.oneLiner}</p>

            {a.badges.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {a.badges.map((b) => (
                  <span
                    key={b}
                    style={{
                      ...body,
                      fontSize: 10.5,
                      padding: '3px 9px',
                      borderRadius: 999,
                      border: `1px solid rgba(191,163,122,0.4)`,
                      color: palette.ink,
                      background: 'rgba(191,163,122,0.08)',
                    }}
                  >
                    {b}
                  </span>
                ))}
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: 14, marginTop: 'auto', paddingTop: 10, alignItems: 'center' }}>
              <Link
                href={`/agents/${a.slug}`}
                style={{ ...body, fontSize: 12.5, color: palette.ink, textDecoration: 'none' }}
              >
                open agent
                <span aria-hidden style={{ color: palette.accentGold }}> •</span>
              </Link>
              {a.pilotReady ? (
                <>
                  <Link
                    href={`/agents/${a.slug}/chat`}
                    style={{ ...body, fontSize: 12.5, color: palette.ink, textDecoration: 'none' }}
                  >
                    chat now
                  </Link>
                  <Link
                    href={`/agents/${a.slug}/studio`}
                    style={{ ...body, fontSize: 12.5, color: palette.bodyGrey, textDecoration: 'none' }}
                  >
                    studio
                  </Link>
                </>
              ) : (
                <span style={{ ...body, fontSize: 12.5, opacity: 0.6 }}>coming soon</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* hover levitation, canon motion; still under prefers-reduced-motion */}
      <style jsx global>{`
        .agent-mix-card {
          transition: transform 400ms ease, box-shadow 400ms ease;
        }
        .agent-mix-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 36px rgba(26, 25, 24, 0.09);
        }
        @media (prefers-reduced-motion: reduce) {
          .agent-mix-card,
          .agent-mix-card:hover {
            transform: none;
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
