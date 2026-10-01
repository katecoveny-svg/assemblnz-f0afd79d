'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import styles from './pursuit-walkthrough.module.css';

const STEPS = [
  { name: 'Read the signal', caption: 'Start with the source. Check what changed and what the evidence actually says.' },
  { name: 'Find the fit', caption: 'Connect the signal to a business question. Keep the opportunity a hypothesis until it is checked.' },
  { name: 'Show the possibility', caption: 'Make a source-linked pitch to review. A Studio concept can help people try the idea before committing.' },
] as const;

/** A local illustrative sequence: controls never submit research or spend trial quota. */
export function PursuitWalkthrough({ compact = false }: { compact?: boolean }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [concept, setConcept] = useState(0);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReduced(query.matches); setPlaying(false); };
    update(); query.addEventListener('change', update);
    const hide = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener('visibilitychange', hide);
    const observer = new IntersectionObserver(entries => { if (!entries[0].isIntersecting) setPlaying(false); });
    if (root.current) observer.observe(root.current);
    return () => { query.removeEventListener('change', update); document.removeEventListener('visibilitychange', hide); observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (!playing || reduced) return;
    const timer = setTimeout(() => {
      if (step === STEPS.length - 1) setPlaying(false);
      else setStep(value => value + 1);
    }, 4500);
    return () => clearTimeout(timer);
  }, [playing, reduced, step]);

  const choose = (index: number) => { setPlaying(false); setStep(Math.max(0, Math.min(2, index))); };
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = event.key === 'ArrowRight' ? step + 1 : event.key === 'ArrowLeft' ? step - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : null;
    if (next !== null) { event.preventDefault(); choose(next); }
  };

  return <section ref={root} className={`${styles.walkthrough} ${compact ? styles.compact : ''}`} aria-label="Pursuit illustrated walkthrough" data-step={step} data-reduced={reduced}>
    <header className={styles.intro}><p className={styles.eyebrow}>Pursuit · find it. Studio · show it.</p><h2>Turn a signal into<br />something you can show.</h2><p>See the evidence. Find a relevant opening. Make the next conversation tangible.</p></header>
    <div className={styles.example}><span className={styles.sample}>Illustrated example · no live research</span><span>Fictional construction brief</span></div>
    <div className={styles.stage}>
      <article className={styles.source} data-active={step === 0}>
        <span className={styles.number}>01 / SOURCE</span><div className={styles.sourceMark} aria-hidden="true">↗</div><h3>A change worth checking.</h3><p>Imagine a proposal for more consistent project reporting in New Zealand.</p><a href="https://bills.parliament.nz/" target="_blank" rel="noopener noreferrer">Explore Parliament sources <ArrowUpRight size={14} /></a><small>Sample scenario, not a claim about a current bill. Publication date unknown.</small>
      </article>
      <article className={styles.opportunity} data-active={step === 1}>
        <span className={styles.number}>02 / OPPORTUNITY</span><h3>Could reporting<br />be easier?</h3><p>For an example civil contractor: could site notes become a clearer handover for an engineer?</p><div className={styles.question}>Still to check <span>Actual requirements · demand · workflow</span></div><small>A proposed fit. No verified buyer or commissioned work.</small>
      </article>
      <article className={styles.pitch} data-active={step === 2}>
        <span className={styles.number}>03 / REVIEWABLE PITCH</span><strong className={styles.wordmark}>assembl</strong><h3>A clearer<br />project handover.</h3><p>One small concept. A source trail. A question for the team.</p><div className={styles.concept}><span>Interactive Studio concept · sample</span><div role="group" aria-label="Try the sample handover">{['Site note', 'Engineer review', 'Discuss a pilot'].map((name, index) => <button key={name} type="button" aria-pressed={concept === index} onClick={() => setConcept(index)}>{name}</button>)}</div><p aria-live="polite">{['Capture an observation and attach evidence.', 'Check the context, ownership and missing facts.', 'Agree a small test before building or sending.'][concept]}</p></div>
      </article>
    </div>
    <div className={styles.transport} onKeyDown={keyboard} role="group" aria-label="Walkthrough controls">
      <button type="button" className={styles.play} disabled={reduced} aria-pressed={playing} onClick={() => { if (!playing && step === 2) setStep(0); setPlaying(value => !value); }}>{playing ? <Pause size={16} /> : <Play size={16} />}{reduced ? 'Still view' : playing ? 'Pause' : 'Play walkthrough'}</button>
      <div className={styles.steps}>{STEPS.map((item, index) => <button type="button" key={item.name} aria-pressed={index === step} onClick={() => choose(index)}><span>0{index + 1}</span>{item.name}</button>)}</div>
      <div className={styles.arrows}><button type="button" disabled={step === 0} aria-label="Previous walkthrough step" onClick={() => choose(step - 1)}><ArrowLeft size={18} /></button><button type="button" disabled={step === 2} aria-label="Next walkthrough step" onClick={() => choose(step + 1)}><ArrowRight size={18} /></button></div>
    </div>
    <p className={styles.caption} aria-live="polite">{reduced ? 'Still view: all three stages are shown. ' : ''}{STEPS[step].caption}</p>
    <footer className={styles.boundary}><div><strong>Try public research</strong><p>Bring your own brief. Review the sources and export an editable HTML pitch.</p></div><div><strong>Go further in a private hub</strong><p>Saved research, tenders and richer Studio demonstrations. Sign-in required; these workspaces are being brought into this site.</p></div>{!compact && <Link href="/pursuit#try-pursuit">Try Pursuit <ArrowUpRight size={18} /></Link>}</footer>
  </section>;
}
