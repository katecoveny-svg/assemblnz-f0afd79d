'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Pause, Play } from 'lucide-react';
import styles from './studio-assembly-hero.module.css';

/** Generated concept art, with restrained camera movement. Not a captured 3D scene. */
export function StudioAssemblyHero() {
  const ref = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1.025, 1.12]);
  const still = reduced || paused;

  return <section className={styles.hero} ref={ref} aria-labelledby="studio-heading">
    <motion.div className={styles.art} style={{ y: still ? 0 : y, scale: still ? 1 : scale }} aria-hidden="true">
      <Image src="/studio/assembly/creative-work-taking-shape.webp" alt="" fill priority sizes="100vw" quality={75} />
    </motion.div>
    <div className={styles.shade} aria-hidden="true" />
    <header className={styles.nav}>
      <Link href="/" className={styles.wordmark}>assembl</Link>
      <nav aria-label="Primary"><Link href="/pursuit">Pursuit</Link><Link href="/do">DO</Link><Link href="/creative-studio" aria-current="page">Studio</Link></nav>
    </header>
    <div className={styles.copy}>
      <p className={styles.kicker}>STUDIO / SHOW IT.</p>
      <h1 id="studio-heading">Give the idea<br />a world<br /><span>of its own.</span></h1>
      <p className={styles.lede}>A brief becomes a place to explore.<br />A story to watch. Something to try.</p>
      <div className={styles.actions}>
        <Link href="/creative-studio/assembl?tool=image">Make an image<ArrowUpRight size={18} aria-hidden="true" /></Link>
        <a href="#studio-work">See the work<ArrowDown size={18} aria-hidden="true" /></a>
      </div>
    </div>
    <div className={styles.foot}>
      <p>01 / WORK TAKING SHAPE <span>Assembl concept artwork</span></p>
      {!reduced && <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? <Play size={14} /> : <Pause size={14} />}{paused ? 'Resume motion' : 'Pause motion'}</button>}
      <Link href="/preview/do-world">Enter the 3D atelier<ArrowUpRight size={16} aria-hidden="true" /></Link>
    </div>
  </section>;
}
