'use client';

import { useEffect, useRef, useState } from 'react';
import type { Scenario } from '@/lib/concepts/woolworths-assembled';
import { BASE_SCENARIO } from '@/lib/concepts/woolworths-assembled';
import styles from '@/app/customers/everyday-rewards/assembled/assembled.module.css';
import { Eyebrow, DisplayHeading } from '@/components/customers/everyday-rewards/ui';

const TRAIL = [
  'household changed',
  'plan reconsidered',
  'basket rebalanced',
  'budget resolved',
  'approval updated',
  'proof recalculated',
];

type Preset = { key: string; label: string; next: (s: Scenario) => Scenario; active: (s: Scenario) => boolean };

const PRESETS: Preset[] = [
  {
    key: 'guests',
    label: 'Jack brings 2 friends',
    next: (s) => ({ ...s, extraGuests: s.extraGuests === 2 ? 0 : 2 }),
    active: (s) => s.extraGuests === 2,
  },
  {
    key: 'budget',
    label: 'Budget drops to $190',
    next: (s) => ({ ...s, budgetNzd: s.budgetNzd === 190 ? 240 : 190 }),
    active: (s) => s.budgetNzd === 190,
  },
  {
    key: 'gf',
    label: 'One guest is gluten-free',
    next: (s) => ({ ...s, glutenFree: !s.glutenFree }),
    active: (s) => s.glutenFree,
  },
  {
    key: 'night',
    label: 'Wednesday dinner cancelled',
    next: (s) => ({ ...s, nights: s.nights === 2 ? 3 : 2 }),
    active: (s) => s.nights === 2,
  },
];

export function ChangeOneThing({
  scenario,
  onChange,
}: {
  scenario: Scenario;
  onChange: (next: Scenario) => void;
}) {
  const [pulse, setPulse] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 900);
    return () => clearTimeout(t);
  }, [scenario]);

  const isBase =
    scenario.extraGuests === BASE_SCENARIO.extraGuests &&
    scenario.budgetNzd === BASE_SCENARIO.budgetNzd &&
    scenario.glutenFree === BASE_SCENARIO.glutenFree &&
    scenario.nights === BASE_SCENARIO.nights;

  return (
    <div>
      <Eyebrow>Change what happens</Eyebrow>
      <DisplayHeading size={34}>
        Change one thing. Watch the whole shop reassemble.
      </DisplayHeading>
      <p style={{ fontSize: 15.5, lineHeight: 1.6, color: '#3a474e', maxWidth: 640, margin: '14px 0 26px' }}>
        This is one live journey, not a slideshow. Every control below rebuilds the
        prepared shop from the same engine the customer would use — plan, basket, budget,
        approval and proof, recomputed in front of you.
      </p>

      <div className={styles.chipRow}>
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            className={styles.chip}
            data-active={p.active(scenario)}
            aria-pressed={p.active(scenario)}
            onClick={() => onChange(p.next(scenario))}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          className={styles.chip}
          onClick={() => onChange(BASE_SCENARIO)}
          disabled={isBase}
          style={{ opacity: isBase ? 0.4 : 1, cursor: isBase ? 'default' : 'pointer' }}
        >
          Reset
        </button>
      </div>

      <div className={styles.reassembleTrail} aria-live="polite">
        {TRAIL.map((t, i) => (
          <span key={t} data-on={pulse ? 'true' : 'false'}>
            {t}
            {i < TRAIL.length - 1 ? '  →' : ''}
          </span>
        ))}
      </div>
    </div>
  );
}
