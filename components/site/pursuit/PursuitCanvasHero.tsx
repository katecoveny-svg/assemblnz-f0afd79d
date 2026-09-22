'use client';

import { useState } from 'react';
import { ArrowRight, FileText, Search, PenLine } from 'lucide-react';
import styles from './pursuit-story.module.css';

const STEPS = [
  { label: 'The signal', icon: Search, heading: 'A bakery is opening a second shop.', body: 'A public announcement gives a shopfitter a reason to look closer.', note: 'Start with something a business has actually published.' },
  { label: 'The fit', icon: FileText, heading: 'Could the new space need a fit-out?', body: 'Check the location, timing and who is already involved before proposing work.', note: 'An expansion is a clue. It does not prove they need a supplier.' },
  { label: 'The draft', icon: PenLine, heading: '“Would a layout sketch help?”', body: 'I saw your second shop announcement. Are you still planning the space? We fit out bakeries and could prepare a first layout for you to review.', note: 'Review the claim, add your details and decide whether to make contact.' },
];

export function PursuitCanvasHero() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  return <div className={styles.story}>
    <div className={styles.scene}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/do/world/atelier-poster.png" alt="Assembl’s sculptural atelier, with plum furniture and softly lit paper surfaces" />
      <span className={styles.caption}>Illustrative example · fictional businesses</span>
      <div className={styles.marker}><Search size={16} /><span>A new location</span><ArrowRight size={15} /></div>
      <article className={styles.sheet} aria-live="polite" aria-atomic="true">
        <div className={styles.sheetTop}><span><Icon size={16} />{current.label}</span><span>0{step + 1} / 03</span></div>
        <h2>{current.heading}</h2>
        <p>{current.body}</p>
      </article>
    </div>
    <div className={styles.steps} aria-label="Explore the Pursuit example">{STEPS.map((item, index) => <button type="button" key={item.label} aria-pressed={step === index} onClick={() => setStep(index)}><span>0{index + 1}</span>{item.label}<ArrowRight size={14} /></button>)}</div>
    <p className={styles.note}>{current.note}</p>
  </div>;
}
