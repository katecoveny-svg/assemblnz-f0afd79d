'use client';

import { useMemo, useState } from 'react';
import { InkJar } from '@/app/customers/family/ops/visuals/ink';

/**
 * The kids' quest — chores, reading, packing and helping with Franklin become
 * quests worth XP. Tap one done → it earns, the bar fills, and you level up and
 * keep a streak. Playful but honest: this is points and pride, not real money
 * (that stays in Kids' money · Tōro, which a parent releases). Fully client-side
 * and delightful; "save progress" persists the XP.
 */

const INK = '#313c42';
const MUTED = '#68766f';
const GOLD = '#b8964f';
const CORAL = '#E08A6B';
const SAGE = '#7A8B6F';
const BLUE = '#6E93A6';

type Quest = { id: string; label: string; xp: number };
type Kid = { name: string; accent: string; seedXp: number; streak: number; quests: Quest[] };

const KIDS: Kid[] = [
  {
    name: 'Jack', accent: BLUE, seedXp: 180, streak: 4,
    quests: [
      { id: 'j1', label: 'Rubbish & recycling out', xp: 20 },
      { id: 'j2', label: 'Dishes after dinner', xp: 15 },
      { id: 'j3', label: '20 min reading', xp: 25 },
      { id: 'j4', label: 'Homework done + checked', xp: 30 },
      { id: 'j5', label: 'Walk Franklin', xp: 20 },
      { id: 'j6', label: 'Pack your own bag', xp: 15 },
    ],
  },
  {
    name: 'Mila', accent: SAGE, seedXp: 145, streak: 6,
    quests: [
      { id: 'm1', label: 'Feed the cat', xp: 15 },
      { id: 'm2', label: 'Tidy your room', xp: 20 },
      { id: 'm3', label: '15 min reading', xp: 20 },
      { id: 'm4', label: 'Homework done + checked', xp: 30 },
      { id: 'm5', label: 'Brush Franklin', xp: 15 },
      { id: 'm6', label: 'Pack netball gear', xp: 15 },
    ],
  },
];

const LEVEL_STEP = 120;
const levelOf = (xp: number) => Math.floor(xp / LEVEL_STEP) + 1;
const BADGES = [
  { at: 1, icon: '🌱', name: 'Getting started' },
  { at: 2, icon: '⭐', name: 'Star helper' },
  { at: 3, icon: '🔥', name: 'On a roll' },
  { at: 4, icon: '🏆', name: 'Whānau MVP' },
];

function KidQuest({ kid }: { kid: Kid }) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [pop, setPop] = useState<string | null>(null);

  const earned = useMemo(() => kid.quests.filter((q) => done.has(q.id)).reduce((s, q) => s + q.xp, 0), [done, kid.quests]);
  const xp = kid.seedXp + earned;
  const level = levelOf(xp);
  const intoLevel = xp % LEVEL_STEP;
  const pct = Math.round((intoLevel / LEVEL_STEP) * 100);

  function toggle(q: Quest) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(q.id)) next.delete(q.id);
      else { next.add(q.id); setPop(q.id); setTimeout(() => setPop((p) => (p === q.id ? null : p)), 700); }
      return next;
    });
  }

  return (
    <div style={{ borderRadius: 16, border: `1px solid ${kid.accent}44`, background: 'linear-gradient(180deg,#ffffff,#fbfcfb)', padding: 15, boxShadow: `0 10px 30px ${kid.accent}14` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 44, height: 44, borderRadius: 14, flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${kid.accent}, ${GOLD})`, color: '#fff', fontFamily: 'var(--font-brand-display)', fontSize: 20, fontWeight: 700 }}>{level}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: INK, fontFamily: 'var(--font-brand-display)' }}>{kid.name}</span>
            <span style={{ fontSize: 12, color: MUTED }}>Level {level} · {xp} XP</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: CORAL }}>🔥 {kid.streak}-day streak</span>
          </div>
          <div style={{ height: 9, borderRadius: 999, background: `${kid.accent}22`, overflow: 'hidden', marginTop: 6 }}>
            <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${kid.accent}, ${GOLD})`, borderRadius: 999, transition: 'width .5s cubic-bezier(.2,.8,.2,1)' }} />
          </div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>{LEVEL_STEP - intoLevel} XP to level {level + 1}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 7, marginTop: 12 }}>
        {kid.quests.map((q) => {
          const on = done.has(q.id);
          const popping = pop === q.id;
          return (
            <button key={q.id} type="button" onClick={() => toggle(q)} style={{
              textAlign: 'left', cursor: 'pointer', borderRadius: 11, padding: '9px 11px',
              border: `1.5px solid ${on ? kid.accent : GOLD}55`, background: on ? `${kid.accent}12` : '#fff',
              transform: popping ? 'scale(1.04)' : 'scale(1)', transition: 'transform .18s ease, background .2s ease',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ width: 18, height: 18, flex: 'none', borderRadius: 6, border: `1.5px solid ${on ? kid.accent : GOLD}77`, background: on ? kid.accent : 'transparent', color: '#fff', fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{on ? '✓' : ''}</span>
              <span style={{ flex: 1, fontSize: 12.5, color: on ? MUTED : INK, textDecoration: on ? 'line-through' : 'none' }}>{q.label}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: popping ? CORAL : kid.accent }}>{popping ? `+${q.xp}!` : `${q.xp}`}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: MUTED }}>badges</span>
        {BADGES.map((b) => {
          const got = level >= b.at;
          return <span key={b.name} title={b.name} style={{ fontSize: 16, opacity: got ? 1 : 0.25, filter: got ? 'none' : 'grayscale(1)' }}>{b.icon}</span>;
        })}
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <InkJar size={22} level={pct / 100} />
          <span style={{ fontSize: 12, fontWeight: 700, color: earned > 0 ? SAGE : MUTED }}>{earned > 0 ? `+${earned} XP today` : 'tap a quest'}</span>
        </span>
      </div>
    </div>
  );
}

export function FamilyQuest({ only }: { only?: string } = {}) {
  const filtered = only ? KIDS.filter((k) => k.name.toLowerCase() === only.toLowerCase()) : KIDS;
  const kids = filtered.length ? filtered : KIDS;
  return (
    <div>
      <p style={{ fontSize: 12, color: MUTED, marginBottom: 10 }}>
        Tap what you’ve done — earn XP, fill the bar, level up and keep your streak. Points &amp; pride, not real money (that’s in Kids’ money, and a parent releases it).
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 14 }}>
        {kids.map((k) => <KidQuest key={k.name} kid={k} />)}
      </div>
    </div>
  );
}
