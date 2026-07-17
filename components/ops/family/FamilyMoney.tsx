import type { CSSProperties } from 'react';
import { draftAllowanceAction } from '@/app/customers/family/ops/actions';
import { InkJar } from '@/app/customers/family/ops/visuals/ink';

/**
 * Kids' money — Tōro, the flagship family agent.
 *
 * Chores → allowance → savings goal, per child. The agent tracks and proposes
 * the weekly payout; the parent approves the release. DRAFT-ONLY: no real money
 * moves — "release" files a pending approval, and dispatch stays off.
 */

const INK = '#313c42';
const MUTED = '#68766f';
const GOLD = '#b8964f';
const CORAL = '#E08A6B';
const SAGE = '#7A8B6F';

type Kid = {
  name: string;
  age: number;
  allowance: number;
  balance: number;
  chores: Array<{ label: string; done: boolean; bonus?: number }>;
  goal: { label: string; target: number; saved: number };
};

const KIDS: Kid[] = [
  {
    name: 'Mila', age: 8, allowance: 5, balance: 23.5,
    chores: [
      { label: 'Feed the cat', done: true },
      { label: 'Tidy room', done: false },
      { label: 'Put washing away', done: false },
    ],
    goal: { label: 'Scooter grips', target: 18, saved: 14 },
  },
  {
    name: 'Jack', age: 13, allowance: 12, balance: 64.2,
    chores: [
      { label: 'Rubbish & recycling out', done: true },
      { label: 'Dishes (weeknights)', done: false },
      { label: 'Mow the lawns', done: false, bonus: 10 },
    ],
    goal: { label: 'Switch game', target: 59, saved: 52 },
  },
];

const card: CSSProperties = {
  borderRadius: 14,
  border: `1px solid ${GOLD}33`,
  background: 'linear-gradient(180deg,#ffffff,#fbfcfb)',
  padding: 14,
};
const label: CSSProperties = { fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED };

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 7, borderRadius: 999, background: `${color}22`, overflow: 'hidden', marginTop: 6 }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: color, borderRadius: 999 }} />
    </div>
  );
}

export function FamilyMoney({ readOnly = false }: { readOnly?: boolean }) {
  const payout = KIDS.reduce((sum, k) => sum + k.allowance, 0);
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12 }}>
        {KIDS.map((k) => {
          const pct = Math.round((k.goal.saved / k.goal.target) * 100);
          return (
            <div key={k.name} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: INK }}>{k.name} <span style={{ fontSize: 11.5, color: MUTED, fontWeight: 400 }}>· {k.age}</span></div>
                <div style={{ fontSize: 15, fontWeight: 800, color: SAGE }}>${k.balance.toFixed(2)}</div>
              </div>
              <div style={{ fontSize: 11, color: MUTED }}>${k.allowance}/week allowance · balance</div>

              <p style={{ ...label, marginTop: 12 }}>this week’s chores</p>
              <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {k.chores.map((c) => (
                  <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5 }}>
                    <span style={{ width: 14, height: 14, borderRadius: 4, border: `1.5px solid ${c.done ? SAGE : GOLD}66`, background: c.done ? SAGE : 'transparent', color: '#fff', fontSize: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{c.done ? '✓' : ''}</span>
                    <span style={{ color: c.done ? MUTED : INK, textDecoration: c.done ? 'line-through' : 'none' }}>{c.label}</span>
                    {c.bonus ? <span style={{ fontSize: 10.5, color: CORAL, fontWeight: 600 }}>+${c.bonus}</span> : null}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12, borderTop: `1px solid ${GOLD}22`, paddingTop: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
                <InkJar size={34} level={pct / 100} title={`${k.name}'s savings jar`} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                    <span style={{ color: INK, fontWeight: 600 }}>Saving for {k.goal.label}</span>
                    <span style={{ color: MUTED }}>${k.goal.saved} / ${k.goal.target} · {pct}%</span>
                  </div>
                  <Bar pct={pct} color={CORAL} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ ...card, marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>Sunday payout ready · ${payout.toFixed(2)}</div>
          <div style={{ fontSize: 11.5, color: MUTED, marginTop: 2 }}>Allowances for the chores marked done. {readOnly ? 'A parent releases it' : 'You release it'} — Tōro never moves real money.</div>
        </div>
        {readOnly ? (
          <span style={{ fontSize: 11.5, color: MUTED, fontStyle: 'italic' }}>waiting on a parent</span>
        ) : (
          <form action={draftAllowanceAction}>
            <input type="hidden" name="amount" value={payout.toFixed(2)} />
            <button type="submit" style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', background: CORAL, border: 'none', borderRadius: 999, padding: '9px 16px', cursor: 'pointer' }}>Release Sunday’s allowance (draft)</button>
          </form>
        )}
      </div>
    </div>
  );
}
