'use client';

import { useState } from 'react';
import { Eyebrow, DisplayHeading, Stat } from '@/components/customers/everyday-rewards/ui';
import styles from '@/app/customers/everyday-rewards/assembled/assembled.module.css';

const CHARCOAL = '#3a474e';
const GREY = '#8a959c';

const BEFORE = [
  'open the app',
  'search products',
  'check the calendar',
  'message the family',
  'work out the meals',
  'compare the total',
  'remove items to fit budget',
  'check rewards',
  'confirm the order',
];

const WITH = ['describe the week', 'review the prepared plan', 'approve'];

export function BeforeWith() {
  const [assembled, setAssembled] = useState(true);

  return (
    <div>
      <Eyebrow>Before assembl / with assembl</Eyebrow>
      <DisplayHeading size={30}>Nine steps become three</DisplayHeading>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: CHARCOAL, maxWidth: 620, margin: '12px 0 22px' }}>
        The same weekend shop, the same household. On the left, the journey a shopper does
        today. On the right, the journey assembl runs around them.
      </p>

      <div className={styles.grid2}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: GREY, marginBottom: 10 }}>
            today · {BEFORE.length} steps
          </div>
          <ul className={styles.beforeList}>
            {BEFORE.map((b, i) => (
              <li key={b} style={{ opacity: assembled && i >= WITH.length ? 0.45 : 1 }}>{b}</li>
            ))}
          </ul>
        </div>
        <div>
          <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c65100', marginBottom: 10 }}>
            with assembl · {WITH.length} steps
          </div>
          <ul className={`${styles.withList} ${assembled ? styles.assemble : ''}`} key={String(assembled)}>
            {WITH.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 28 }}>
        <Stat value={`${BEFORE.length - WITH.length} fewer`} label="steps the shopper takes" accent />
        <Stat value="1" label="place it happens — no app-hopping" />
        <Stat value="~18 min" label="customer minutes saved (estimated)" />
      </div>

      <button
        type="button"
        className={styles.chip}
        style={{ marginTop: 22 }}
        onClick={() => setAssembled((v) => !v)}
      >
        {assembled ? 'Show the full manual journey' : 'Collapse it with assembl'}
      </button>
    </div>
  );
}
