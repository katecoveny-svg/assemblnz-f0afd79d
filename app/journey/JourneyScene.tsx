'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Flame, MapPin, Sparkles, Trophy } from 'lucide-react';
import { PALETTE, PUBLIC_MARKETPLACE_AGENTS } from '@/lib/marketplace/agents';
import { AgentIcon } from '@/components/marketplace/AgentIcon';
import { Companion } from '@/components/game/Companion';
import { LEVELS, BADGES } from '@/lib/game/points';

type GameState = {
  signedIn: boolean;
  points: number;
  level: string;
  levelProgress: number;
  nextLevel: { key: string; label: string; at: number } | null;
  streak: number;
  badges: { id: string; label: string; note: string }[];
  towns: { slug: string; uses: number }[];
  activity: { action: string; label: string; points: number; at: string }[];
  stats: { hoursSaved: number; tasksAutomated: number; agentsBuilt: number };
  mission: { id: string | null; title: string; detail: string; points: number; completed: boolean } | null;
};

const AGENT_BY_SLUG = Object.fromEntries(PUBLIC_MARKETPLACE_AGENTS.map((a) => [a.slug, a]));

// Map milestones, bottom (start) → top (destination), in a 0–100 × 0–150 space.
const MILESTONES = [
  { x: 22, y: 140 },
  { x: 75, y: 116 },
  { x: 25, y: 92 },
  { x: 78, y: 68 },
  { x: 22, y: 44 },
  { x: 75, y: 18 },
];
const TOWN_SLOTS = [
  { x: 52, y: 128 }, { x: 40, y: 104 }, { x: 58, y: 80 }, { x: 45, y: 56 },
  { x: 55, y: 30 }, { x: 36, y: 118 }, { x: 64, y: 94 }, { x: 48, y: 40 },
];
const BADGE_SLOTS = [
  { x: 11, y: 124 }, { x: 90, y: 100 }, { x: 12, y: 76 }, { x: 88, y: 52 },
  { x: 60, y: 10 }, { x: 14, y: 30 }, { x: 86, y: 128 }, { x: 38, y: 64 },
];
const PATH_D =
  'M22 140 C 50 132 62 124 75 116 C 92 108 40 100 25 92 C 8 84 64 76 78 68 C 95 60 38 52 22 44 C 6 36 60 26 75 18';

function pos(p: { x: number; y: number }) {
  return { left: `${p.x}%`, top: `${(p.y / 150) * 100}%` };
}

export function JourneyScene() {
  const [state, setState] = useState<GameState | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/game/state');
      if (res.ok) setState(await res.json());
    } catch {
      /* leave the scene in its loading shell */
    }
  }, []);
  useEffect(() => {
    // Mount-time sync from the game-state API; setState runs inside the fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const completeMission = useCallback(async () => {
    if (!state?.mission?.id || state.mission.completed || busy) return;
    setBusy(true);
    try {
      await fetch('/api/game/mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId: state.mission.id }),
      });
      await load();
    } finally {
      setBusy(false);
    }
  }, [state, busy, load]);

  const s = state;
  const levelIndex = s ? Math.max(0, LEVELS.findIndex((l) => l.key === s.level)) : 0;
  const current = LEVELS[levelIndex];

  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: PALETTE.cream, color: PALETTE.ink }}>
      {/* Chrome */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ borderColor: PALETTE.hairline, backgroundColor: 'rgba(255,247,236,0.82)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 md:px-8">
          <Link href="/atlas" className="flex items-end gap-2" aria-label="assembl">
            <span style={{ fontFamily: 'var(--font-display), Georgia, serif', fontWeight: 600, fontSize: 26, letterSpacing: '-0.01em', lineHeight: 1 }}>
              assembl
            </span>
            <span style={{ width: 20, height: 6, borderRadius: 4, background: PALETTE.accentGold, marginBottom: 5 }} />
          </Link>
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold"
              style={{ backgroundColor: PALETTE.ink, color: PALETTE.cream, fontFamily: 'var(--font-body), sans-serif' }}
            >
              <Trophy size={13} style={{ color: PALETTE.accentGold }} aria-hidden />
              {s ? s.points.toLocaleString('en-NZ') : '—'} pts
            </span>
            <Link href="/atlas" className="text-sm font-bold hover:opacity-70" style={{ fontFamily: 'var(--font-body), sans-serif', color: PALETTE.body }}>
              Atlas
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-5 py-8 md:px-8 lg:grid-cols-[1.2fr_1fr]">
        {/* ── The map ──────────────────────────────────────────────────── */}
        <section>
          <p className="text-[11px] font-bold uppercase" style={{ fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.2em', color: PALETTE.gold }}>
            Your journey
          </p>
          <h1 className="mt-1 text-4xl md:text-5xl" style={{ fontFamily: 'var(--font-display), Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 0.98 }}>
            Learn AI by doing
          </h1>
          <p className="mt-2 max-w-md text-sm" style={{ fontFamily: 'var(--font-body), sans-serif', color: PALETTE.body }}>
            Every agent you use is a town on the map. Every badge, a landmark. Climb from Beginner to Kaitiaki.
          </p>

          {/* Parchment map */}
          <div
            className="relative mt-5 w-full overflow-hidden rounded-[26px] border"
            style={{
              aspectRatio: '100 / 150',
              borderColor: PALETTE.hairline,
              backgroundColor: '#FFFBF2',
              backgroundImage:
                'radial-gradient(rgba(199,155,31,0.10) 1px, transparent 1px), radial-gradient(rgba(58,56,50,0.04) 1px, transparent 1px)',
              backgroundSize: '22px 22px, 11px 11px',
              backgroundPosition: '0 0, 6px 6px',
            }}
          >
            {/* path */}
            <svg viewBox="0 0 100 150" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
              <path d={PATH_D} fill="none" stroke={PALETTE.hairline} strokeWidth={4.5} strokeLinecap="round" />
              <path d={PATH_D} fill="none" stroke={PALETTE.accentGold} strokeWidth={2.4} strokeLinecap="round" strokeDasharray="0.5 4" />
            </svg>

            {/* milestones */}
            {LEVELS.map((lvl, i) => {
              const m = MILESTONES[i];
              const reached = s ? s.points >= lvl.at : i === 0;
              const isCurrent = i === levelIndex;
              return (
                <div key={lvl.key} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={pos(m)}>
                  <span
                    className="mx-auto flex items-center justify-center rounded-full"
                    style={{
                      width: 30,
                      height: 30,
                      backgroundColor: reached ? PALETTE.accentGold : '#FFFBF2',
                      border: `2.5px solid ${isCurrent ? PALETTE.ink : reached ? PALETTE.gold : PALETTE.hairline}`,
                      boxShadow: isCurrent ? '0 0 0 4px rgba(255,212,42,0.35)' : 'none',
                      color: PALETTE.ink,
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                  </span>
                  <span
                    className="mt-1 block whitespace-nowrap"
                    style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 8.5, letterSpacing: '0.06em', color: reached ? PALETTE.ink : PALETTE.muted, fontWeight: 700 }}
                  >
                    {lvl.label.toUpperCase()}
                  </span>
                </div>
              );
            })}

            {/* towns (agents used) */}
            {(s?.towns ?? []).slice(0, TOWN_SLOTS.length).map((t, i) => {
              const agent = AGENT_BY_SLUG[t.slug];
              const slot = TOWN_SLOTS[i];
              return (
                <Link
                  key={t.slug}
                  href={`/agents/${t.slug}`}
                  className="group absolute -translate-x-1/2 -translate-y-1/2"
                  style={pos(slot)}
                  title={`${agent?.name ?? t.slug} — ${t.uses} ${t.uses === 1 ? 'visit' : 'visits'}`}
                >
                  <span
                    className="flex items-center justify-center rounded-xl border shadow-sm transition group-hover:-translate-y-0.5"
                    style={{ width: 34, height: 34, backgroundColor: PALETTE.paper, borderColor: PALETTE.hairline }}
                  >
                    {agent ? <AgentIcon name={agent.icon} className="h-5 w-5" tone={agent.tile} /> : <MapPin size={16} aria-hidden />}
                  </span>
                </Link>
              );
            })}

            {/* badges (landmarks) */}
            {(s?.badges ?? []).slice(0, BADGE_SLOTS.length).map((b, i) => {
              const slot = BADGE_SLOTS[i];
              return (
                <div key={b.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={pos(slot)} title={`${b.label} — ${b.note}`}>
                  <span className="flex items-center justify-center rounded-full" style={{ width: 22, height: 22, backgroundColor: PALETTE.accentGold, border: `2px solid ${PALETTE.ink}` }}>
                    <Sparkles size={11} style={{ color: PALETTE.ink }} aria-hidden />
                  </span>
                </div>
              );
            })}

            {/* companion at the current milestone */}
            <div className="absolute -translate-x-1/2 translate-y-[-130%]" style={pos(MILESTONES[levelIndex])}>
              <Companion className="h-10 w-auto drop-shadow" />
            </div>
          </div>
        </section>

        {/* ── Panels ───────────────────────────────────────────────────── */}
        <aside className="flex flex-col gap-4">
          {/* Level + progress */}
          <div className="rounded-[22px] border p-5" style={{ borderColor: PALETTE.hairline, backgroundColor: PALETTE.paper }}>
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase" style={{ fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.18em', color: PALETTE.gold }}>
                  Level {levelIndex + 1} of 6
                </p>
                <p className="text-3xl" style={{ fontFamily: 'var(--font-display), Georgia, serif', fontWeight: 600 }}>
                  {current?.label ?? 'Beginner'}
                </p>
              </div>
              <p className="text-right text-3xl font-black" style={{ fontFamily: 'var(--font-body), sans-serif', color: PALETTE.ink }}>
                {s ? s.points.toLocaleString('en-NZ') : '—'}
                <span className="block text-[11px] font-bold uppercase" style={{ color: PALETTE.muted, letterSpacing: '0.1em' }}>points</span>
              </p>
            </div>
            <p className="mt-2 text-sm" style={{ fontFamily: 'var(--font-body), sans-serif', color: PALETTE.body }}>{current?.note}</p>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: PALETTE.cream }}>
              <div className="h-full rounded-full" style={{ width: `${Math.round((s?.levelProgress ?? 0) * 100)}%`, backgroundColor: PALETTE.accentGold }} />
            </div>
            <p className="mt-1.5 text-[11px]" style={{ fontFamily: 'var(--font-mono), monospace', color: PALETTE.muted }}>
              {s?.nextLevel ? `${(s.nextLevel.at - s.points).toLocaleString('en-NZ')} pts to ${s.nextLevel.label}` : 'Top level — kaitiaki.'}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Streak" value={s ? `${s.streak}` : '—'} icon={<Flame size={15} style={{ color: PALETTE.gold }} aria-hidden />} suffix="days" />
            <Stat label="Hours saved" value={s ? `${s.stats.hoursSaved}` : '—'} />
            <Stat label="Agents built" value={s ? `${s.stats.agentsBuilt}` : '—'} />
          </div>

          {/* Today's mission */}
          {s?.mission ? (
            <div className="rounded-[22px] border p-5" style={{ borderColor: PALETTE.hairline, backgroundColor: PALETTE.cream }}>
              <p className="text-[11px] font-bold uppercase" style={{ fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.18em', color: PALETTE.gold }}>
                Today’s mission · +{s.mission.points}
              </p>
              <h3 className="mt-1 text-2xl" style={{ fontFamily: 'var(--font-display), Georgia, serif', fontWeight: 600, letterSpacing: '-0.01em' }}>
                {s.mission.title}
              </h3>
              <p className="mt-1 text-sm" style={{ fontFamily: 'var(--font-body), sans-serif', color: PALETTE.body }}>{s.mission.detail}</p>
              <button
                type="button"
                onClick={completeMission}
                disabled={!s.signedIn || s.mission.completed || busy || !s.mission.id}
                className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition disabled:opacity-45"
                style={{
                  backgroundColor: s.mission.completed ? PALETTE.cream : PALETTE.accentGold,
                  color: PALETTE.ink,
                  border: s.mission.completed ? `1px solid ${PALETTE.hairline}` : 'none',
                  fontFamily: 'var(--font-body), sans-serif',
                }}
              >
                {s.mission.completed ? 'Done today ✓' : busy ? 'Marking…' : 'Mark done'}
              </button>
              {!s.signedIn ? (
                <p className="mt-2 text-[11px]" style={{ fontFamily: 'var(--font-mono), monospace', color: PALETTE.muted }}>
                  Sign in to save progress and earn points.
                </p>
              ) : null}
            </div>
          ) : null}

          {/* Badges */}
          <div className="rounded-[22px] border p-5" style={{ borderColor: PALETTE.hairline, backgroundColor: PALETTE.paper }}>
            <p className="text-[11px] font-bold uppercase" style={{ fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.18em', color: PALETTE.gold }}>
              Badges {s ? `· ${s.badges.length}/${Object.keys(BADGES).length}` : ''}
            </p>
            {s && s.badges.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {s.badges.map((b) => (
                  <span key={b.id} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold" style={{ backgroundColor: PALETTE.cream, color: PALETTE.ink, border: `1px solid ${PALETTE.hairline}`, fontFamily: 'var(--font-body), sans-serif' }} title={b.note}>
                    <Sparkles size={13} style={{ color: PALETTE.gold }} aria-hidden /> {b.label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm" style={{ fontFamily: 'var(--font-body), sans-serif', color: PALETTE.muted }}>
                No landmarks yet. Talk to Atlas to earn your first.
              </p>
            )}
          </div>

          {/* Activity */}
          {s && s.activity.length > 0 ? (
            <div className="rounded-[22px] border p-5" style={{ borderColor: PALETTE.hairline, backgroundColor: PALETTE.paper }}>
              <p className="text-[11px] font-bold uppercase" style={{ fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.18em', color: PALETTE.gold }}>
                Recent
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {s.activity.map((a, i) => (
                  <li key={i} className="flex items-center justify-between text-sm" style={{ fontFamily: 'var(--font-body), sans-serif', color: PALETTE.body }}>
                    <span>{a.label}</span>
                    <span className="font-bold" style={{ color: a.points > 0 ? PALETTE.gold : PALETTE.muted }}>{a.points > 0 ? `+${a.points}` : '—'}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link href="/atlas" className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold" style={{ backgroundColor: PALETTE.accentGold, color: PALETTE.ink, fontFamily: 'var(--font-body), sans-serif' }}>
              Keep going with Atlas
            </Link>
            <Link href="/agents" className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold" style={{ border: `2px solid ${PALETTE.ink}`, color: PALETTE.ink, fontFamily: 'var(--font-body), sans-serif' }}>
              Browse agents
            </Link>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Stat({ label, value, suffix, icon }: { label: string; value: string; suffix?: string; icon?: ReactNode }) {
  return (
    <div className="rounded-[18px] border p-3 text-center" style={{ borderColor: PALETTE.hairline, backgroundColor: PALETTE.paper }}>
      <p className="flex items-center justify-center gap-1 text-2xl font-black" style={{ fontFamily: 'var(--font-body), sans-serif', color: PALETTE.ink }}>
        {icon} {value}
      </p>
      <p className="text-[10px] font-bold uppercase" style={{ fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.1em', color: PALETTE.muted }}>
        {label}
        {suffix ? ` (${suffix})` : ''}
      </p>
    </div>
  );
}
