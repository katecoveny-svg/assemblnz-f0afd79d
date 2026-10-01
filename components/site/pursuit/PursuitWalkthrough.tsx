'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import styles from './pursuit-walkthrough.module.css';

const STEPS = [
  { name: 'Read the brief', caption: 'Read the drainage brief. Check the scope and what information is missing.' },
  { name: 'Match your services', caption: 'Match drainage design and site planning to the brief. Check eligibility and capacity.' },
  { name: 'Build a pitch you can edit', caption: 'Draft the approach, attach the sources and edit the pitch before sharing.' },
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
    <header className={styles.intro}><p className={styles.eyebrow}>Pursuit · find it. Studio · show it.</p><h2>Find the work.<br />Build the pitch.</h2><p>A construction brief, your services and an editable proposal. Step through an example.</p></header>
    <div className={styles.example}><span className={styles.sample}>Illustrated example · no live research</span><span>Fictional construction brief</span></div>
    <div className={styles.stage}>
      <article className={styles.source} data-active={step === 0}>
        <span className={styles.number}>01 / READ THE BRIEF</span><div className={styles.sourceMark} aria-hidden="true">↗</div><h3>School drainage<br />upgrade.</h3><p>Example brief: assess water pooling, outline drainage options and plan the site works.</p><div className={styles.question}>What is missing? <span>Site survey · scope · programme</span></div><small>Fictional brief · no real tender, buyer or deadline.</small>
      </article>
      <article className={styles.opportunity} data-active={step === 1}>
        <span className={styles.number}>02 / MATCH YOUR SERVICES</span><h3>Drainage design.<br />Site planning.</h3><p>Match this brief to an example civil contractor’s drainage design, site assessment and construction planning services.</p><div className={styles.question}>Check before pitching <span>Requirements · eligibility · capacity</span></div><small>Proposed fit · for review.</small>
      </article>
      <article className={styles.pitch} data-active={step === 2}>
        <span className={styles.number}>03 / EDITABLE PITCH</span><strong className={styles.wordmark}>assembl</strong><h3>School drainage.<br />Our approach.</h3><p>A proposed site assessment, drainage plan and questions for the project team.</p><div className={styles.concept}><span>Interactive Studio concept · sample</span><div role="group" aria-label="Try the sample drainage proposal">{['Site assessment', 'Drainage plan', 'Review the pitch'].map((name, index) => <button key={name} type="button" aria-pressed={concept === index} onClick={() => setConcept(index)}>{name}</button>)}</div><p aria-live="polite">{['Record ponding locations and missing survey data.', 'Outline options to check with the project engineer.', 'Edit the scope, sources and questions before sharing.'][concept]}</p></div>
      </article>
    </div>
    <div className={styles.transport} onKeyDown={keyboard} role="group" aria-label="Walkthrough controls">
      <button type="button" className={styles.play} disabled={reduced} aria-pressed={playing} onClick={() => { if (!playing && step === 2) setStep(0); setPlaying(value => !value); }}>{playing ? <Pause size={16} /> : <Play size={16} />}{reduced ? 'Still view' : playing ? 'Pause' : 'Play walkthrough'}</button>
      <div className={styles.steps}>{STEPS.map((item, index) => <button type="button" key={item.name} aria-pressed={index === step} onClick={() => choose(index)}><span>0{index + 1}</span>{item.name}</button>)}</div>
      <div className={styles.arrows}><button type="button" disabled={step === 0} aria-label="Previous walkthrough step" onClick={() => choose(step - 1)}><ArrowLeft size={18} /></button><button type="button" disabled={step === 2} aria-label="Next walkthrough step" onClick={() => choose(step + 1)}><ArrowRight size={18} /></button></div>
    </div>
    <p className={styles.caption} aria-live="polite">{reduced ? 'Still view: all three stages are shown. ' : ''}{STEPS[step].caption}</p>
    <footer className={styles.boundary}><div><strong>Live public research</strong><p>Check sources. Export an editable HTML pitch.</p><a href="https://www.gets.govt.nz/" target="_blank" rel="noopener noreferrer">Find actual tenders on GETS <ArrowUpRight size={14} /></a></div><div><strong>Private hubs</strong><p>Saved research, tender responses and Studio demos. Sign-in required; migration under way.</p></div>{!compact && <Link href="/pursuit#try-pursuit">Try Pursuit <ArrowUpRight size={18} /></Link>}</footer>
  </section>;
}
