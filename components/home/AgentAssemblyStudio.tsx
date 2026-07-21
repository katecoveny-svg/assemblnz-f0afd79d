'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownRight,
  ArrowRight,
  Blocks,
  BookOpenText,
  BrainCircuit,
  Check,
  CircleGauge,
  LockKeyhole,
  MessageCircle,
  ScanSearch,
  Wrench,
} from 'lucide-react';

import {
  AgentGalleryRoom,
  type AgentGalleryPartId,
} from '@/components/site/editorial/AgentGalleryRoom';
import styles from './agent-assembly-studio.module.css';

type Part = {
  id: AgentGalleryPartId;
  index: string;
  name: string;
  short: string;
  question: string;
  value: string;
  access: string;
  Icon: typeof BookOpenText;
};

const PARTS: Part[] = [
  {
    id: 'memory',
    index: '01',
    name: 'Working memory',
    short: 'memory',
    question: 'What can it remember?',
    value: 'The conversation and approved context needed for the current piece of work.',
    access: 'defined retention · visible history',
    Icon: CircleGauge,
  },
  {
    id: 'knowledge',
    index: '02',
    name: 'Business knowledge',
    short: 'knowledge',
    question: 'What does it know?',
    value: 'Approved offers, prices, FAQs and business rules from the Business Genome.',
    access: 'read only · confirmed sources',
    Icon: BookOpenText,
  },
  {
    id: 'intelligence',
    index: '03',
    name: 'Intelligence core',
    short: 'intelligence',
    question: 'How does it make a judgement?',
    value: 'A clear role, model and set of instructions shaped around one useful job.',
    access: 'one role · versioned instructions',
    Icon: BrainCircuit,
  },
  {
    id: 'voice',
    index: '04',
    name: 'Business voice',
    short: 'voice',
    question: 'How should it sound?',
    value: 'Plain-language guidance for tone, phrasing and how it represents the business.',
    access: 'approved voice · editable',
    Icon: MessageCircle,
  },
  {
    id: 'abilities',
    index: '05',
    name: 'Abilities',
    short: 'abilities',
    question: 'What can it do?',
    value: 'Prepare useful drafts, compare details and explain the work before a person acts.',
    access: 'draft · compare · explain',
    Icon: Wrench,
  },
  {
    id: 'boundaries',
    index: '06',
    name: 'Approval boundaries',
    short: 'boundaries',
    question: 'Where do people stay in control?',
    value: 'Named approvals and hard limits travel with the work from the beginning.',
    access: 'human approval required',
    Icon: LockKeyhole,
  },
];

export function AgentAssemblyStudio() {
  const [activeId, setActiveId] = useState<AgentGalleryPartId>('knowledge');
  const [xray, setXray] = useState(false);
  const active = PARTS.find((part) => part.id === activeId) ?? PARTS[1];
  const ActiveIcon = active.Icon;

  return (
    <section className={styles.root} aria-labelledby="studio-hero-title">
      <div className={styles.indexLine}>
        <span>assembl / visual systems studio</span>
        <span>agent study 01 · visible architecture</span>
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
            <a href="#agent-gallery">see how it works <ArrowDownRight aria-hidden /></a>
          </div>
        </div>
      </div>

      <div id="agent-gallery" className={`${styles.studio} ${xray ? styles.xray : ''}`}>
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
            <div><span className={styles.liveDot} />the assembl agent</div>
            <span>{xray ? 'focus view' : 'gallery view'}</span>
            <span>study / 01</span>
          </div>

          <div className={styles.assembly} aria-label="Explorable white-room gallery of the six parts of an assembl agent">
            <AgentGalleryRoom
              activePart={activeId}
              embedded
              focus={xray}
              onActivePartChange={(part) => {
                setActiveId(part);
                setXray(true);
              }}
            />
          </div>

          <div className={styles.canvasControls}>
            <button type="button" className={!xray ? styles.selectedView : ''} onClick={() => setXray(false)}>
              <Check aria-hidden /> gallery
            </button>
            <button type="button" className={xray ? styles.selectedView : ''} onClick={() => setXray(true)}>
              <ScanSearch aria-hidden /> focus
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
        <p>Memory / knowledge / intelligence / voice / abilities / boundaries</p>
      </div>
    </section>
  );
}
