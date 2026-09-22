'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, FileText, Search, PenLine } from 'lucide-react';
import styles from './pursuit-story.module.css';

const SOURCES = [
  { name: 'Parliament', detail: 'Bills & progress', href: 'https://bills.parliament.nz/' },
  { name: 'NZBN', detail: 'Business records', href: 'https://www.nzbn.govt.nz/using-the-nzbn/nzbn-services/api/' },
  { name: 'Legislation', detail: 'Acts & regulations', href: 'https://www.legislation.govt.nz/' },
  { name: 'Beehive', detail: 'Government announcements', href: 'https://www.beehive.govt.nz/releases' },
  { name: 'Waka Kotahi', detail: 'Roads & disruption', href: 'https://www.journeys.nzta.govt.nz/' },
  { name: 'GeoNet', detail: 'Quakes & hazards', href: 'https://api.geonet.org.nz/' },
];
const STEPS = [
  { label: 'Signals', icon: Search, heading: 'A policy change reaches a whole sector.', body: 'Follow a bill through Parliament. Check the legislation, identify businesses through NZBN and read what they’ve published.', note: 'An example research path across public APIs, official records and company news.' },
  { label: 'Context', icon: FileText, heading: 'Which businesses could be affected?', body: 'Connect policy, business records and current announcements. Check dates, relevance and what each source actually supports.', note: 'A bill is a proposal. Check its stage before treating it as a new obligation.' },
  { label: 'Proposal', icon: PenLine, heading: 'An evidence brief. A proposal to review.', body: 'Prepare the source links, relevant businesses and a specific piece of work. Take the brief into DO or build the first version in Studio.', note: 'Research the implications, review the proposal and decide what to do next.' },
];

function KnowledgeFigures() {
  const [figures, setFigures] = useState<{ documents: number; changes: number } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/home/live', { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]) })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (!Array.isArray(data?.figures)) return;
        const documents = data.figures.find((figure: { label: string }) => figure.label === 'documents tracked')?.value;
        const changes = data.figures.find((figure: { label: string }) => figure.label === 'changes recorded')?.value;
        if (Number.isFinite(documents) && Number.isFinite(changes) && !controller.signal.aborted) setFigures({ documents, changes });
      }).catch(() => undefined);
    return () => controller.abort();
  }, []);
  return figures && <p className={styles.figures} aria-label="Current knowledge base totals"><span>In Assembl’s knowledge base</span><strong>{figures.documents.toLocaleString('en-NZ')} documents</strong><span>{figures.changes.toLocaleString('en-NZ')} recorded changes</span></p>;
}

export function PursuitCanvasHero() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  return <div className={styles.story}>
    <div className={styles.scene}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/do/world/atelier-poster.png" alt="Assembl’s sculptural atelier, with plum furniture and softly lit paper surfaces" />
      <span className={styles.caption}>Aotearoa / connected sources</span>
      <nav className={styles.sources} aria-label="Explore the public sources">{SOURCES.map(source => <a key={source.name} href={source.href} target="_blank" rel="noopener noreferrer"><span>{source.name}<ArrowUpRight size={12} /></span><small>{source.detail}</small></a>)}</nav>
      <article className={styles.sheet} aria-live="polite" aria-atomic="true">
        <div className={styles.sheetTop}><span><Icon size={16} />{current.label}</span><span>0{step + 1} / 03</span></div>
        <h2>{current.heading}</h2>
        <p>{current.body}</p>
      </article>
    </div>
    <div className={styles.steps} aria-label="Explore the Pursuit example">{STEPS.map((item, index) => <button type="button" key={item.label} aria-pressed={step === index} onClick={() => setStep(index)}><span>0{index + 1}</span>{item.label}<ArrowRight size={14} /></button>)}</div>
    <p className={styles.note}>{current.note}</p>
    <KnowledgeFigures />
    <p className={styles.connectionNote}>NZBN and some feeds require a configured connection. The public trial below searches the web.</p>
  </div>;
}
