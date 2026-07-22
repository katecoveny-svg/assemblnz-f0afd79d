'use client';

/**
 * Progressive disclosure (design constitution §10). The wow-factors are not
 * stacked down the page — they are depths you open one at a time. By default
 * the scene stays calm; a quiet row of affordances lets the reader pull on
 * whichever thread they want, and it takes shape in place. Only one is open at
 * once, so the page never becomes a wall again.
 */

import { useState, type ReactNode } from 'react';
import type { ScenarioRun } from '@/lib/concepts/woolworths-assembled';
import { Eyebrow } from '@/components/customers/everyday-rewards/ui';
import styles from '@/app/customers/everyday-rewards/assembled/assembled.module.css';
import { AgentNegotiation } from './AgentNegotiation';
import { DirectorsCut } from './DirectorsCut';
import { LiveSignal } from './LiveSignal';
import { MemoryPassport } from './MemoryPassport';
import { CrossSurface } from './CrossSurface';
import { CommercialHypothesis } from './CommercialHypothesis';
import { BeforeWith } from './BeforeWith';
import { HumanRescue } from './HumanRescue';
import { AskThisJourney } from './AskThisJourney';
import { PilotSimulator } from './PilotSimulator';
import { Constellation } from './Constellation';
import { KaimahiAgent } from './KaimahiAgent';

type Depth = { key: string; label: string; render: (data: ScenarioRun) => ReactNode };

const DEPTHS: Depth[] = [
  { key: 'agents', label: 'how the agents decided', render: (d) => <AgentNegotiation data={d} /> },
  { key: 'memory', label: 'what it remembers', render: (d) => <MemoryPassport data={d} /> },
  { key: 'surfaces', label: 'across every surface', render: (d) => <CrossSurface data={d} /> },
  { key: 'constellation', label: 'the journey in space', render: (d) => <Constellation data={d} /> },
  { key: 'rescue', label: 'when a human steps in', render: (d) => <HumanRescue data={d} /> },
  { key: 'commercial', label: 'the commercial hypothesis', render: (d) => <CommercialHypothesis data={d} /> },
  { key: 'signal', label: 'the one live signal', render: () => <LiveSignal /> },
  { key: 'before', label: 'before / with assembl', render: () => <BeforeWith /> },
  { key: 'directors', label: "the director's cut", render: (d) => <DirectorsCut data={d} /> },
  { key: 'ask', label: 'ask this journey anything', render: (d) => <AskThisJourney data={d} /> },
  { key: 'kaimahi', label: 'talk to the in-app agent', render: () => <KaimahiAgent /> },
  { key: 'pilot', label: 'design the pilot', render: () => <PilotSimulator /> },
];

export function Depths({ data }: { data: ScenarioRun }) {
  const [open, setOpen] = useState<string | null>(null);
  const active = DEPTHS.find((d) => d.key === open) ?? null;

  return (
    <div>
      <Eyebrow>Go deeper · only if you want to</Eyebrow>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: '#3a474e', maxWidth: 560, margin: '0 0 20px' }}>
        The proof behind this shop, the agents, the economics — each is here when you want it, and
        out of the way when you don&rsquo;t.
      </p>

      <div className={styles.depthRow} role="tablist" aria-label="Go deeper">
        {DEPTHS.map((d) => (
          <button
            key={d.key}
            type="button"
            role="tab"
            aria-selected={open === d.key}
            className={styles.depthLink}
            data-open={open === d.key}
            onClick={() => setOpen((cur) => (cur === d.key ? null : d.key))}
          >
            {d.label}
          </button>
        ))}
      </div>

      {active ? (
        <div className={`${styles.depthPanel} ${styles.assemble}`} key={active.key}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button type="button" className={styles.depthLink} onClick={() => setOpen(null)} aria-label="Close">
              close ✕
            </button>
          </div>
          {active.render(data)}
        </div>
      ) : null}
    </div>
  );
}
