'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowRight,
  Blocks,
  BookOpenText,
  BrainCircuit,
  Cable,
  Check,
  CircleGauge,
  LockKeyhole,
  ScanSearch,
  Wrench,
} from 'lucide-react';
import styles from './agent-assembly-studio.module.css';

type Part = {
  id: string;
  index: string;
  name: string;
  short: string;
  question: string;
  value: string;
  access: string;
  className: string;
  Icon: typeof BookOpenText;
};

const PARTS: Part[] = [
  {
    id: 'knowledge',
    index: '01',
    name: 'Business knowledge',
    short: 'knowledge',
    question: 'What does it know?',
    value: 'Approved offers, prices, FAQs and business rules from the Genome.',
    access: 'read only · 18 confirmed facts',
    className: styles.knowledge,
    Icon: BookOpenText,
  },
  {
    id: 'instructions',
    index: '02',
    name: 'Instruction core',
    short: 'instructions',
    question: 'What is its job?',
    value: 'Prepare clear customer replies using confirmed facts and the Assembl voice.',
    access: 'one job · version 03',
    className: styles.instructions,
    Icon: BrainCircuit,
  },
  {
    id: 'memory',
    index: '03',
    name: 'Working memory',
    short: 'memory',
    question: 'What can it remember?',
    value: 'The current conversation and the facts selected for this draft—nothing more.',
    access: 'session only · clears after review',
    className: styles.memory,
    Icon: CircleGauge,
  },
  {
    id: 'abilities',
    index: '04',
    name: 'Abilities',
    short: 'abilities',
    question: 'What can it do?',
    value: 'Read the Genome, compare details and prepare a reply ready for a person to check.',
    access: 'draft · compare · explain',
    className: styles.abilities,
    Icon: Wrench,
  },
  {
    id: 'connections',
    index: '05',
    name: 'Connected apps',
    short: 'connections',
    question: 'Where can it work?',
    value: 'A Gmail hand-off can receive an approved draft. The demo never sends it.',
    access: 'handoff preview · no send permission',
    className: styles.connections,
    Icon: Cable,
  },
  {
    id: 'approval',
    index: '06',
    name: 'Approval boundary',
    short: 'approval',
    question: 'Where do people stay in control?',
    value: 'A named reviewer checks every factual claim and chooses whether anything is sent.',
    access: 'human approval required',
    className: styles.approval,
    Icon: LockKeyhole,
  },
];

export function AgentAssemblyStudio() {
  const [activeId, setActiveId] = useState('knowledge');
  const [xray, setXray] = useState(false);
  const active = PARTS.find((part) => part.id === activeId) ?? PARTS[0];
  const ActiveIcon = active.Icon;

  return (
    <section className={styles.root} aria-labelledby="studio-hero-title">
      <div className={styles.indexLine}>
        <span>assembl / visual systems studio</span>
        <span>agent study 01 · customer response</span>
        <span>Aotearoa · 2026</span>
      </div>

      <div className={styles.intro}>
        <div className={styles.introTitle}>
          <p className={styles.eyebrow}>Visual operating systems for intelligent work</p>
          <h1 id="studio-hero-title">Build intelligence<br />you can understand.</h1>
        </div>
        <div className={styles.introCopy}>
          <p>See what each agent knows, what it can do and exactly where you stay in control.</p>
          <div className={styles.introActions}>
            <Link href="/a">assemble an agent <ArrowRight aria-hidden /></Link>
            <a href="#live-business-demo">see how it works <ArrowDownRight aria-hidden /></a>
          </div>
        </div>
      </div>

      <div className={`${styles.studio} ${xray ? styles.xray : ''}`}>
        <aside className={styles.library} aria-label="Agent parts">
          <div className={styles.panelLabel}><Blocks aria-hidden /><span>parts / 06</span></div>
          <div className={styles.libraryList}>
            {PARTS.map((part) => (
              <button
                key={part.id}
                type="button"
                className={active.id === part.id ? styles.activePart : ''}
                aria-pressed={active.id === part.id}
                onClick={() => setActiveId(part.id)}
              >
                <span>{part.index}</span>
                <part.Icon aria-hidden />
                <strong>{part.short}</strong>
              </button>
            ))}
          </div>
          <p className={styles.libraryHint}>Select a part to inspect what is real, connected and permitted.</p>
        </aside>

        <div className={styles.canvas}>
          <div className={styles.canvasBar}>
            <div><span className={styles.liveDot} />customer response agent</div>
            <span>{xray ? 'x-ray view' : 'assembled view'}</span>
            <span>draft / v03</span>
          </div>

          <div className={styles.assembly} aria-label="Explorable anatomy of a customer response agent">
            <div className={styles.axisX} aria-hidden />
            <div className={styles.axisY} aria-hidden />
            <div className={styles.orbit} aria-hidden />
            <div className={styles.orbitInner} aria-hidden />
            <div className={styles.core} aria-hidden>
              <div className={styles.coreHalo} />
              <div className={styles.coreObject}><span>agent</span><b>01</b></div>
              <div className={styles.coreTag}>instruction core / active</div>
            </div>

            {PARTS.map((part) => (
              <button
                key={part.id}
                type="button"
                className={`${styles.module} ${part.className} ${active.id === part.id ? styles.moduleActive : ''}`}
                onClick={() => setActiveId(part.id)}
                aria-label={`Inspect ${part.name}`}
              >
                <span className={styles.moduleIndex}>{part.index}</span>
                <span className={styles.moduleShape} aria-hidden><part.Icon /></span>
                <span className={styles.moduleName}>{part.short}</span>
              </button>
            ))}
          </div>

          <div className={styles.canvasControls}>
            <button type="button" className={!xray ? styles.selectedView : ''} onClick={() => setXray(false)}>
              <Check aria-hidden /> assembled
            </button>
            <button type="button" className={xray ? styles.selectedView : ''} onClick={() => setXray(true)}>
              <ScanSearch aria-hidden /> x-ray
            </button>
            <span>nothing sends without approval</span>
          </div>
        </div>

        <aside className={styles.inspector} aria-live="polite">
          <div className={styles.panelLabel}><ScanSearch aria-hidden /><span>inspector</span></div>
          <div className={styles.inspectorTitle}>
            <span>{active.index}</span>
            <ActiveIcon aria-hidden />
            <h2>{active.name}</h2>
          </div>
          <dl>
            <div><dt>question</dt><dd>{active.question}</dd></div>
            <div><dt>configured value</dt><dd>{active.value}</dd></div>
            <div><dt>access</dt><dd>{active.access}</dd></div>
          </dl>
          <div className={styles.inspectorProof}>
            <LockKeyhole aria-hidden />
            <div><strong>Approval stays visible</strong><p>The rule travels with the work—not in a hidden settings screen.</p></div>
          </div>
        </aside>
      </div>

      <div className={styles.captionLine}>
        <span>see what your agent is made of.</span>
        <p>Knowledge / abilities / connected apps / boundaries / approvals / tests</p>
      </div>
    </section>
  );
}
