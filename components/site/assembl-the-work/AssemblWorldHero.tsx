'use client';

/** The accepted WorldAtelierStage, with a readable HTML layer and chapter controls. */
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import { HERO } from './copy';
import { WorldAtelierStage, useAtelierMotionGate, useAtelierVisibility } from './WorldAtelierStage';
import styles from './assembl-world-hero.module.css';

const chapters = [
  { product: 'Pursuit', verb: 'find it.', input: 'A signal. A source. A question.', output: 'An opportunity worth reviewing.', href: '/pursuit', action: 'Explore Pursuit' },
  { product: 'DO', verb: 'DO it.', input: 'Context, tools and permission for a bounded job.', output: 'Prepared work with the next action clear.', href: '/do', action: 'Open DO' },
  { product: 'Studio', verb: 'show it.', input: 'A brief. An idea. A piece of work.', output: 'Something people can see, try and understand.', href: '/creative-studio', action: 'Explore Studio' },
] as const;

export function AssemblWorldHero({ preview = false }: { preview?: boolean }) {
  const progress = useRef(0);
  const rail = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const [, setSceneReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [chapter, setChapter] = useState(0);
  const reduced = useAtelierMotionGate();
  const visible = useAtelierVisibility(rail);
  const onFailure = useCallback(() => { setSceneReady(false); setFailed(true); }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = rail.current;
      if (!el || paused) return;
      if (reduced || failed) { progress.current = 0; setChapter(0); return; }
      const sceneFrame = el.firstElementChild as HTMLElement | null;
      const travel = Math.max(1, el.offsetHeight - (sceneFrame?.offsetHeight ?? innerHeight));
      progress.current = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / travel));
      setChapter(Math.min(2, Math.floor(progress.current * 3)));
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', scroll, { passive: true });
    addEventListener('resize', scroll);
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', scroll); removeEventListener('resize', scroll); };
  }, [paused, reduced, failed]);

  const jump = (index: number) => {
    const el = rail.current;
    if (!el || reduced || failed) return;
    const frame = el.firstElementChild as HTMLElement | null;
    const travel = Math.max(1, el.offsetHeight - (frame?.offsetHeight ?? innerHeight));
    setPaused(false);
    scrollTo({ top: scrollY + el.getBoundingClientRect().top + travel * ((index + 0.08) / 3), behavior: 'smooth' });
  };
  const current = chapters[chapter];
  return (
    <section ref={rail} className={styles.rail} aria-labelledby="atw-hero-title" data-preview={preview || undefined} data-static={reduced || failed || undefined} data-chapter={chapter}>
      <div className={styles.frame}>
        <WorldAtelierStage progress={progress} paused={paused} reduced={reduced} visible={visible} failed={failed} onReady={setSceneReady} onFailure={onFailure} priority />
        <div className={styles.scrim} aria-hidden="true" />
        <header className={styles.nav}>
          <Link className={styles.wordmark} href="/" aria-label="assembl home">assembl</Link>
          <nav aria-label="Primary"><Link href="/pursuit">Pursuit</Link><Link href="/do">DO</Link><Link href="/creative-studio">Studio</Link></nav>
          <button type="button" className={styles.motion} onClick={() => setPaused(v => !v)} disabled={reduced || failed} aria-pressed={paused} aria-label={paused ? 'Resume scene motion' : 'Pause scene motion'}>
            {paused || reduced ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}{reduced || failed ? 'Still view' : paused ? 'Resume' : 'Pause'}
          </button>
        </header>
        <div className={styles.copy}>
          <p className={styles.overline}>GOOD WORK COMES TOGETHER.</p>
          <h1 id="atw-hero-title">assembl <br />the work.</h1>
          <p className={styles.sub}>{HERO.subhead}</p><p className={styles.body}>{HERO.body}</p>
          <div className={styles.actions}><a className={styles.pill} href="#products">See the whole system <ArrowRight size={20} aria-hidden="true" /></a><Link className={styles.link} href="/do">Open DO <ArrowDown size={16} aria-hidden="true" /></Link></div>
        </div>
        <aside className={styles.chapter} aria-label="The work, step by step">
          <div className={styles.chapterSteps} aria-label="Choose a scene chapter">{chapters.map((item,index) => <button type="button" key={item.product} onClick={() => jump(index)} aria-label={`View ${item.product} scene`} aria-pressed={chapter === index} data-active={chapter === index}><small>0{index + 1}</small><span>{item.product}</span></button>)}</div>
          <div className={styles.chapterBody}><span className={styles.chapterLabel}>{current.product}</span><h2>{current.verb}</h2><p>{current.input}<br /><strong>{current.output}</strong></p><Link href={current.href}>{current.action}<ArrowUpRight size={16} aria-hidden="true" /></Link></div>
        </aside>
        <div className={styles.job} id="do-input"><p className={styles.jobNote}>Start with <Link href="/pursuit">Pursuit</Link>, <Link href="/do">DO</Link> or <Link href="/creative-studio">Studio</Link>. Connect them when the work needs the full loop.</p></div>
        <p className={styles.honesty}>{failed ? 'Still view. ' : reduced ? '' : 'Scroll or choose a chapter. '}An imagined workspace, not live agent activity.</p>
      </div>
      <div className={styles.stillSummary} aria-label="The complete work loop">{chapters.map(item => <article key={item.product}><span>{item.product}</span><h2>{item.verb}</h2><p>{item.input}</p><p>{item.output}</p><Link href={item.href}>{item.action}<ArrowUpRight size={16} aria-hidden="true" /></Link></article>)}</div>
    </section>
  );
}
