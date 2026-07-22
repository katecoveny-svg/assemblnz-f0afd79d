'use client';

import type { ScenarioRun } from '@/lib/concepts/woolworths-assembled';
import { Card, Eyebrow, DisplayHeading } from '@/components/customers/everyday-rewards/ui';
import styles from '@/app/customers/everyday-rewards/assembled/assembled.module.css';

const NAVY = '#22303c';
const CHARCOAL = '#3a474e';
const GREY = '#8a959c';
const ORANGE = '#fd6400';

export function AgentNegotiation({ data }: { data: ScenarioRun }) {
  const { negotiation } = data;
  return (
    <div>
      <Eyebrow>Specialist agents, one decision</Eyebrow>
      <DisplayHeading size={30}>How the agents resolved it</DisplayHeading>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: CHARCOAL, maxWidth: 620, margin: '12px 0 22px' }}>
        Not one generic assistant — specialists that each hold one part of the problem,
        assembling a single call. Every figure below comes from the same run above.
      </p>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table className={styles.table}>
          <tbody>
            {negotiation.voices.map((v) => {
              const isResolution = v.agent === 'Resolution';
              return (
                <tr key={v.agent}>
                  <td style={{ width: 150 }}>
                    <div style={{ fontWeight: 700, color: isResolution ? ORANGE : NAVY }}>{v.agent}</div>
                    <div style={{ fontSize: 12, color: GREY }}>{v.role}</div>
                  </td>
                  <td>{v.position}</td>
                  <td style={{ width: 90, textAlign: 'right', fontWeight: 700, color: isResolution ? ORANGE : NAVY, fontVariantNumeric: 'tabular-nums' }}>
                    {v.figure ?? ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <div
        className={styles.statusStrip}
        style={{ background: '#f2f2f2', color: CHARCOAL, marginTop: 14 }}
      >
        modelled decision · illustrative
      </div>
    </div>
  );
}
