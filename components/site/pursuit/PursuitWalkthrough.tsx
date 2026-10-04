'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, FileText, Pause, Play } from 'lucide-react';
import { PURSUIT_EXAMPLES } from './pursuit-examples';
import styles from './pursuit-walkthrough.module.css';

const STEPS = ['The signal', 'The businesses', 'The opportunity', 'The pitch'] as const;

/** Source → affected businesses → proposed opening → local Studio concept. No requests. */
export function PursuitWalkthrough({ compact = false }: { compact?: boolean }) {
  const [industry, setIndustry] = useState(0);
  const [company, setCompany] = useState(0);
  const [concept, setConcept] = useState(0);
  const [step, setStep] = useState(3);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [ready, setReady] = useState(false);
  const root = useRef<HTMLElement>(null);
  const id = useId();
  const example = PURSUIT_EXAMPLES[industry];
  const business = example.companies[company];
  const choice = example.choices[concept];

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReduced(query.matches); setPlaying(false); setReady(true); };
    update(); query.addEventListener('change', update);
    const hide = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener('visibilitychange', hide);
    const observer = new IntersectionObserver(entries => { if (!entries[0].isIntersecting) setPlaying(false); });
    if (root.current) observer.observe(root.current);
    return () => { query.removeEventListener('change', update); document.removeEventListener('visibilitychange', hide); observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (!playing || reduced) return;
    const timer = setTimeout(() => { if (step === 3) setPlaying(false); else setStep(value => value + 1); }, 4500);
    return () => clearTimeout(timer);
  }, [playing, reduced, step]);

  const choose = (index: number) => { setPlaying(false); setStep(Math.max(0, Math.min(3, index))); };
  const selectIndustry = (index: number) => { setIndustry(index); setCompany(0); setConcept(0); choose(3); };
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = event.key === 'ArrowRight' ? step + 1 : event.key === 'ArrowLeft' ? step - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? 3 : null;
    if (next !== null) { event.preventDefault(); choose(next); }
  };
  const industryKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = event.key === 'ArrowRight' ? (industry + 1) % 3 : event.key === 'ArrowLeft' ? (industry + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : null;
    if (next !== null) {
      event.preventDefault(); selectIndustry(next);
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role=tab]')[next]?.focus();
    }
  };

  return <section ref={root} className={`${styles.walkthrough} ${compact ? styles.compact : ''}`} aria-label="Pursuit illustrated walkthrough" data-step={step} data-ready={ready} data-reduced={reduced} data-industry={example.id}>
    <header className={styles.intro}><p className={styles.eyebrow}>Pursuit → Studio</p><h2>One signal.<br />Many possibilities.</h2><p>Find the businesses it matters to.<br />Show them a better way.</p></header>
    <div className={styles.industries} role="tablist" aria-label="Choose an example industry" onKeyDown={industryKeyboard}>{PURSUIT_EXAMPLES.map((item, index) => <button type="button" role="tab" id={`${id}-${item.id}`} aria-controls={`${id}-example`} aria-selected={industry === index} tabIndex={industry === index ? 0 : -1} key={item.id} onClick={() => selectIndustry(index)}>{item.name}<ArrowUpRight size={14} aria-hidden="true" /></button>)}</div>
    <div className={styles.example}><span>Illustrated example · no live research</span><span>Fictional sources, businesses and brands</span></div>
    <div id={`${id}-example`} role="tabpanel" aria-labelledby={`${id}-${example.id}`} className={styles.stage}>
      <div className={styles.research}>
        <article className={styles.signal} data-active={step === 0}>
          <div className={styles.cardLabel}><span>01 / THE SIGNAL</span><FileText size={17} aria-hidden="true" /></div>
          <h3>{example.signal}</h3><p>{example.source}</p><small>Fictional source card. A real run must check the original.</small>
        </article>
        <article className={styles.businesses} data-active={step === 1}>
          <div className={styles.cardLabel}><span>02 / WHO COULD IT MATTER TO?</span><span>Fictional businesses</span></div>
          <div className={styles.accounts}>{example.companies.map((item,index) => <button type="button" aria-pressed={company === index} key={item.name} onClick={() => { setCompany(index); setConcept(0); setPlaying(false); }}><span className={styles.monogram}>{item.mark.slice(0,1)}</span><span><strong>{item.name}</strong><small>{item.role}</small></span><ArrowRight size={15} aria-hidden="true" /></button>)}</div>
        </article>
        <article className={styles.opportunity} data-active={step === 2}>
          <div className={styles.cardLabel}><span>03 / AN OPENING TO EXPLORE</span><span>Hypothesis</span></div>
          <h3>{business.opportunity}</h3><p>{example.opening}</p><small>Still to check: {example.unknown}</small>
        </article>
      </div>
      <article className={styles.pitch} data-active={step === 3} data-template={example.template}>
        <div className={styles.browserBar}><span><i /><i /><i /></span><span>04 / BRANDED CONCEPT</span><ArrowUpRight size={15} aria-hidden="true" /></div>
        <div className={styles.conceptHeader}><strong>{business.mark}</strong><span>Fictional brand<br />Studio concept</span></div>
        <div className={styles.conceptBody}>
          <h3>{business.headline}</h3><p>{business.support}</p>
          {example.template === 'place' && <div className={styles.place} aria-label="Illustrated neighbourhood concept"><svg viewBox="0 0 400 170" role="img" aria-label="A sample place plan"><path d="M0 117 C90 80 155 170 400 83 M40 0 C130 40 210 40 250 170" fill="none" stroke="currentColor" strokeWidth="14" opacity=".22" /><path d="M0 117 C90 80 155 170 400 83" fill="none" stroke="#fffdfb" strokeWidth="2" strokeDasharray="6 7" /><g className={styles.buildings} data-choice={concept}><rect x="36" y="32" width="70" height="40" rx="4" /><rect x="133" y="68" width="54" height="42" rx="4" /><rect x="261" y="26" width="80" height="54" rx="4" /><rect x="270" y="118" width="63" height="36" rx="4" /></g><circle cx="214" cy="45" r="22" fill="#916a70" /><circle cx="350" cy="119" r="13" fill="#916a70" /></svg><span>{concept === 0 ? 'Explore the place' : concept === 1 ? 'Shape the approach' : 'Prepare the conversation'}</span></div>}
          {example.template === 'journey' && <div className={styles.journey}><div className={styles.journeyTop}><span>Sample order</span><span>Preparing</span></div><div className={styles.journeyLine} aria-label="Sample collection journey"><span><Check size={12} />Received</span><span>Preparing</span><span>Collection</span></div><strong>{concept === 2 ? 'Your choice. Your pace.' : 'While you wait…'}</strong><p>{concept === 0 ? 'Check one useful detail for your project.' : concept === 1 ? 'Get the collection details together.' : 'Keep the original journey unchanged.'}</p><span className={styles.localPill}>Optional preparation · local example</span></div>}
          {example.template === 'brief' && <div className={styles.brief}><span>PROPOSED ENGAGEMENT</span><div className={styles.briefPages} aria-hidden="true"><i /><i /><i /></div><strong>{concept === 0 ? 'Understand the change.' : concept === 1 ? 'Make the scope clear.' : 'Ready for a conversation.'}</strong><div className={styles.briefSequence}><span>Brief</span><ArrowRight size={12} /><span>Scope</span><ArrowRight size={12} /><span>Review</span></div></div>}
          <div className={styles.choices} role="group" aria-label="Try the sample concept">{example.choices.map((item,index) => <button type="button" aria-pressed={concept === index} key={item.name} onClick={() => { setConcept(index); setPlaying(false); }}>{item.name}</button>)}</div>
          <div className={styles.prepared} aria-live="polite"><p>{choice.caption}</p><ul>{choice.items.map(item => <li key={item}><Check size={13} aria-hidden="true" />{item}</li>)}</ul></div>
        </div>
        <footer>Interactive local concept. Nothing is sent, connected or published.</footer>
      </article>
    </div>
    <div className={styles.transport}><button type="button" className={styles.play} disabled={reduced} onClick={() => { if (!playing) setStep(0); setPlaying(value => !value); }}>{playing ? <Pause size={14} /> : <Play size={14} />}{reduced ? 'Still view' : playing ? 'Pause walkthrough' : 'Play walkthrough'}</button><div className={styles.steps} aria-label="Walkthrough steps" onKeyDown={keyboard}>{STEPS.map((name,index) => <button type="button" aria-pressed={step === index} onClick={() => choose(index)} key={name}><span>0{index + 1}</span>{name}</button>)}</div><div className={styles.arrows}><button type="button" aria-label="Previous walkthrough step" disabled={step === 0} onClick={() => choose(step - 1)}><ArrowLeft size={16} /></button><button type="button" aria-label="Next walkthrough step" disabled={step === 3} onClick={() => choose(step + 1)}><ArrowRight size={16} /></button></div></div>
    <p className={styles.caption} role="status">{step === 0 ? 'Start with a source. Check what actually changed.' : step === 1 ? 'Find who may be affected. Check identity and fit.' : step === 2 ? 'Frame a proposed opening, with the gaps attached.' : 'Show a tailored possibility someone can try.'}</p>
    <footer className={styles.boundary}><p><strong>Try live public research.</strong> Review sources. Export an editable pitch.<br /><span>Private hubs add saved context and richer Studio work; sign-in and migration apply.</span></p>{!compact && <Link href="/pursuit#try-pursuit">Bring an opportunity<ArrowUpRight size={16} /></Link>}</footer>
  </section>;
}
