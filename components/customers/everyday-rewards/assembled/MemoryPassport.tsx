'use client';

/**
 * #7 — Customer memory passport. Only useful, permissioned context, and every
 * memory is something the customer can act on: view it, correct it, make it
 * one-time, remove it, or stop it being stored. "Personalisation you can see
 * and control."
 *
 * Memories are illustrative for the concept. A few are derived from the shared
 * run's scenario (household size, usual budget range) so they stay consistent
 * with the "change one thing" levers; the rest are fixed sample facts. Controls
 * are local to this preview — nothing is persisted, matching the draft-only
 * posture of the whole concept.
 */

import { useMemo, useState } from 'react';
import type { ScenarioRun } from '@/lib/concepts/woolworths-assembled';
import { Eyebrow, DisplayHeading, Card } from '@/components/customers/everyday-rewards/ui';
import styles from '@/app/customers/everyday-rewards/assembled/assembled.module.css';

const NAVY = '#22303c';
const CHARCOAL = '#3a474e';
const GREY = '#8a959c';
const ORANGE_DARK = '#c65100';

type Source = 'you told us' | 'bought regularly' | 'inferred';
type Memory = {
  id: string;
  key: string;
  value: string;
  source: Source;
};
type Mode = 'stored' | 'one-time' | 'removed' | 'never';

const MODE_LABEL: Record<Mode, string> = {
  stored: 'remembered',
  'one-time': 'this time only',
  removed: 'removed',
  never: 'never stored',
};

function memoriesFor(data: ScenarioRun): Memory[] {
  const people = 2 + 5 + data.scenario.extraGuests;
  const lo = data.scenario.budgetNzd - 50;
  const hi = data.scenario.budgetNzd + 20;
  return [
    { id: 'household', key: 'usual household', value: `${people} people`, source: 'you told us' },
    { id: 'pescatarian', key: 'pescatarian guest', value: 'Mila', source: 'you told us' },
    { id: 'weekday', key: 'weekday preference', value: 'low preparation', source: 'inferred' },
    { id: 'olive-oil', key: 'do not repurchase', value: 'olive oil (still have plenty)', source: 'you told us' },
    { id: 'budget', key: 'usual budget range', value: `$${lo}–$${hi}`, source: 'bought regularly' },
  ];
}

export function MemoryPassport({ data }: { data: ScenarioRun }) {
  const base = useMemo(() => memoriesFor(data), [data]);
  const [modes, setModes] = useState<Record<string, Mode>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const modeOf = (id: string): Mode => modes[id] ?? 'stored';
  const setMode = (id: string, mode: Mode) => setModes((m) => ({ ...m, [id]: mode }));
  const valueOf = (mem: Memory) => drafts[mem.id] ?? mem.value;

  return (
    <div>
      <Eyebrow>Memory passport · you decide what is kept</Eyebrow>
      <DisplayHeading size={30}>Personalisation you can see and control</DisplayHeading>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: CHARCOAL, maxWidth: 620, margin: '12px 0 24px' }}>
        Only useful, permissioned context — and every memory is yours to change. View it, correct
        it, keep it just this once, remove it, or stop it being stored at all. Nothing here is kept
        without you saying so.
      </p>

      <div style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
        {base.map((mem) => {
          const mode = modeOf(mem.id);
          const muted = mode === 'removed' || mode === 'never';
          return (
            <Card key={mem.id} className={styles.assemble} style={{ opacity: muted ? 0.55 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 240, flex: 1 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: GREY }}>
                    {mem.key} · {mem.source}
                  </div>
                  {editing === mem.id ? (
                    <input
                      autoFocus
                      value={valueOf(mem)}
                      onChange={(e) => setDrafts((d) => ({ ...d, [mem.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setEditing(null);
                      }}
                      onBlur={() => setEditing(null)}
                      aria-label={`Correct ${mem.key}`}
                      style={{ marginTop: 4, width: '100%', maxWidth: 320, padding: '7px 10px', borderRadius: 8, border: '1.5px solid rgba(34,48,60,0.2)', fontSize: 15, fontFamily: 'inherit', color: NAVY }}
                    />
                  ) : (
                    <div style={{ fontSize: 16, fontWeight: 600, color: muted ? GREY : NAVY, marginTop: 3, textDecoration: mode === 'removed' ? 'line-through' : 'none' }}>
                      {valueOf(mem)}
                    </div>
                  )}
                </div>
                <span style={{ fontFamily: 'var(--edr-mono), monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: mode === 'stored' ? ORANGE_DARK : GREY }}>
                  {MODE_LABEL[mode]}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                <MemButton active={editing === mem.id} onClick={() => setEditing((e) => (e === mem.id ? null : mem.id))}>
                  correct
                </MemButton>
                <MemButton active={mode === 'one-time'} onClick={() => setMode(mem.id, mode === 'one-time' ? 'stored' : 'one-time')}>
                  this time only
                </MemButton>
                <MemButton active={mode === 'removed'} onClick={() => setMode(mem.id, mode === 'removed' ? 'stored' : 'removed')}>
                  remove
                </MemButton>
                <MemButton active={mode === 'never'} onClick={() => setMode(mem.id, mode === 'never' ? 'stored' : 'never')}>
                  never store
                </MemButton>
              </div>
            </Card>
          );
        })}
      </div>
      <p style={{ fontSize: 12, color: GREY, marginTop: 16, maxWidth: 620 }}>
        Illustrative memories for this concept · controls are a preview and store nothing.
      </p>
    </div>
  );
}

function MemButton({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button type="button" className={styles.chip} data-active={active} onClick={onClick} style={{ fontSize: 12.5, padding: '6px 12px' }}>
      {children}
    </button>
  );
}
