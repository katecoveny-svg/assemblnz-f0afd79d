'use client';

/**
 * #10 — The journey constellation. A quiet spatial composition instead of a
 * flowchart: the customer at the centre, the journey's stages as editorial
 * nodes around them, specialist agents gathering at the active stage, and proof
 * accumulating behind the run. It is derived from real journey state — the
 * stage list, the current stage, the agents that acted, the checks passed — not
 * a background video. Pull a lever above and it reorganises around the new run.
 *
 * Motion is a single quiet settle keyed to the run (design canon §11), disabled
 * under prefers-reduced-motion. Geometry is deterministic (index-based), so it
 * renders identically on the server and the client.
 */

import { useMemo } from 'react';
import type { ScenarioRun } from '@/lib/concepts/woolworths-assembled';
import { Eyebrow, DisplayHeading } from '@/components/customers/everyday-rewards/ui';
import styles from '@/app/customers/everyday-rewards/assembled/assembled.module.css';

const NAVY = '#22303c';
const CHARCOAL = '#3a474e';
const GREY = '#8a959c';
const ORANGE = '#fd6400';
const GOLD = '#b8964f';

const STAGE_LABEL: Record<string, string> = {
  entry: 'told us',
  intent: 'understood',
  context: 'asked',
  recommendation: 'assembled',
  commitment: 'your call',
  action: 'prepared',
  wait: 'assembling',
  fulfilment: 'ready',
  resolution: 'resolved',
  continuation: 'next time',
};

const W = 720;
const H = 460;
const CX = W / 2;
const CY = H / 2;
const R = 168;

export function Constellation({ data }: { data: ScenarioRun }) {
  const { run } = data;

  const model = useMemo(() => {
    const stageIds = Object.keys(STAGE_LABEL).filter((id) => run.timeline.some((e) => e.stageId === id) || id === run.currentStageId);
    const ids = stageIds.length ? stageIds : Object.keys(STAGE_LABEL);
    const nodes = ids.map((id, i) => {
      const angle = (i / ids.length) * Math.PI * 2 - Math.PI / 2;
      return {
        id,
        label: STAGE_LABEL[id] ?? id,
        x: CX + Math.cos(angle) * R,
        y: CY + Math.sin(angle) * R,
        active: id === run.currentStageId,
        done: run.timeline.some((e) => e.stageId === id),
      };
    });
    const agents = [...new Set(run.timeline.map((e) => e.agentId).filter(Boolean))] as string[];
    const active = nodes.find((n) => n.active) ?? nodes[nodes.length - 1];
    const passed = run.verifications.filter((v) => v.status === 'passed').length;
    return { nodes, agents, active, passed };
  }, [run]);

  return (
    <div>
      <Eyebrow>The journey constellation · real-time from run state</Eyebrow>
      <DisplayHeading size={30}>The journey, assembled in space</DisplayHeading>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: CHARCOAL, maxWidth: 620, margin: '12px 0 22px' }}>
        Not a map — a composition. The household at the centre, the journey&rsquo;s stages around
        them, the agents gathering where the work is, proof settling behind. Change a lever above and
        it reorganises around the new run.
      </p>

      <div style={{ overflowX: 'auto' }}>
        <svg
          key={run.id}
          className={styles.assemble}
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ maxWidth: W, display: 'block', margin: '0 auto' }}
          role="img"
          aria-label="A spatial composition of the journey: the household at the centre, its stages around them, and the agents gathering at the active stage."
        >
          {/* proof arc gathering behind the run */}
          <circle cx={CX} cy={CY} r={R + 34} fill="none" stroke={GOLD} strokeOpacity={0.18} strokeWidth={1} />
          <circle cx={CX} cy={CY} r={R + 34} fill="none" stroke={GOLD} strokeOpacity={0.5} strokeWidth={2}
            strokeDasharray={`${(model.passed / Math.max(1, run.verifications.length)) * 2 * Math.PI * (R + 34)} ${2 * Math.PI * (R + 34)}`}
            transform={`rotate(-90 ${CX} ${CY})`} />

          {/* hairlines from centre to each stage */}
          {model.nodes.map((n) => (
            <line key={`l-${n.id}`} x1={CX} y1={CY} x2={n.x} y2={n.y} stroke={NAVY} strokeOpacity={n.done ? 0.16 : 0.07} strokeWidth={1} />
          ))}

          {/* stage nodes */}
          {model.nodes.map((n) => (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r={n.active ? 9 : 5} fill={n.active ? ORANGE : n.done ? NAVY : '#fff'} stroke={n.done || n.active ? 'none' : 'rgba(34,48,60,0.3)'} strokeWidth={1} />
              <text x={n.x} y={n.y + (n.y < CY ? -14 : 20)} textAnchor="middle" fontSize={12} fontFamily="var(--edr-mono), monospace" fill={n.active ? ORANGE : GREY} style={{ letterSpacing: '0.04em' }}>
                {n.label}
              </text>
            </g>
          ))}

          {/* agents gathering at the active stage */}
          {model.agents.slice(0, 6).map((a, i) => {
            const ang = (i / Math.max(1, Math.min(6, model.agents.length))) * Math.PI * 2;
            const ax = model.active.x + Math.cos(ang) * 26;
            const ay = model.active.y + Math.sin(ang) * 26;
            return <circle key={a} cx={ax} cy={ay} r={3} fill={GOLD} opacity={0.9} />;
          })}

          {/* customer at the centre */}
          <circle cx={CX} cy={CY} r={30} fill="#fbfaf7" stroke={NAVY} strokeOpacity={0.14} />
          <text x={CX} y={CY - 2} textAnchor="middle" fontSize={13} fontWeight={700} fill={NAVY} fontFamily="var(--edr-display), Georgia, serif">
            the
          </text>
          <text x={CX} y={CY + 15} textAnchor="middle" fontSize={13} fontWeight={700} fill={NAVY} fontFamily="var(--edr-display), Georgia, serif">
            household
          </text>
        </svg>
      </div>

      <div className={styles.reassembleTrail} style={{ justifyContent: 'center' }}>
        <span style={{ color: ORANGE, fontWeight: 600 }}>● active: {STAGE_LABEL[model.active.id] ?? model.active.id}</span>
        <span>● {model.agents.length} agents acted</span>
        <span style={{ color: GOLD }}>● {model.passed}/{run.verifications.length} checks proven</span>
      </div>
    </div>
  );
}
