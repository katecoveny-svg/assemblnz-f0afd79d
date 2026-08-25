'use client';

/**
 * #8 — Cross-surface continuity. The journey begins on one surface and carries
 * its context to the next without asking the household to repeat anything:
 *
 *   voice note → app journey → approval notification → household shared view
 *   → operator proof
 *
 * The thread across the surfaces is the SAME run the rest of the page shows —
 * the run id and prepared total are carried through, so it reads as one journey
 * moving between surfaces, not five screens.
 */

import type { ScenarioRun } from '@/lib/concepts/woolworths-assembled';
import { Eyebrow, DisplayHeading } from '@/components/customers/everyday-rewards/ui';
import styles from '@/app/customers/everyday-rewards/assembled/assembled.module.css';

const NAVY = '#22303c';
const CHARCOAL = '#3a474e';
const GREY = '#8a959c';
const ORANGE = '#fd6400';

type Surface = {
  id: string;
  surface: string;
  actor: string;
  moment: string;
  carried: string;
};

export function CrossSurface({ data }: { data: ScenarioRun }) {
  const { plan, run } = data;
  const total = `$${plan.estimatedTotalNzd.toFixed(0)}`;
  const surfaces: Surface[] = [
    { id: 's1', surface: 'voice note', actor: 'Aroha', moment: 'Says the week aloud on the drive home.', carried: 'the week, in her words' },
    { id: 's2', surface: 'app journey', actor: 'Everyday Rewards', moment: `Assembles the shop around the household — ${total} prepared.`, carried: `run ${run.id}` },
    { id: 's3', surface: 'approval notification', actor: 'Adrian', moment: 'Approves two substitutions from a notification, without opening the app.', carried: 'the same basket + swaps' },
    { id: 's4', surface: 'household shared view', actor: 'The household', moment: 'Sees what is coming this week — no one re-enters anything.', carried: 'approved plan' },
    { id: 's5', surface: 'operator proof', actor: 'Woolworths', moment: 'The same event, with consent, cost and audit trail attached.', carried: 'signed run record' },
  ];

  return (
    <div>
      <Eyebrow>Cross-surface continuity · one journey, many surfaces</Eyebrow>
      <DisplayHeading size={30}>It moves with the household — and never asks twice</DisplayHeading>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: CHARCOAL, maxWidth: 640, margin: '12px 0 24px' }}>
        The journey starts as a spoken note and carries its context across every surface it touches.
        Each step inherits what came before — the same run, the same basket — so nobody repeats
        themselves.
      </p>

      <ol className={styles.timeline} style={{ listStyle: 'none', margin: 0 }}>
        {surfaces.map((s, i) => (
          <li key={s.id} className={`${styles.tEvent} ${styles.assemble}`} data-muted={i === surfaces.length - 1} style={{ width: 232 }}>
            <div className={styles.tDot} />
            <div style={{ fontFamily: 'var(--edr-mono), monospace', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: ORANGE, marginBottom: 6 }}>
              {i + 1} · {s.surface}
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: NAVY }}>{s.actor}</div>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: CHARCOAL, margin: '6px 0 10px' }}>{s.moment}</p>
            <div style={{ fontSize: 12, color: GREY, borderTop: '1px solid rgba(34,48,60,0.1)', paddingTop: 8 }}>
              carries → <span style={{ color: CHARCOAL }}>{s.carried}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
