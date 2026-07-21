'use client';

import Link from 'next/link';
import { ArrowDownRight, ArrowRight, Blocks, ScanSearch } from 'lucide-react';

import { AgentGalleryRoom } from '@/components/site/editorial/AgentGalleryRoom';
import styles from './agent-assembly-studio.module.css';

export function AgentAssemblyStudio() {
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
          <h1 id="studio-hero-title">
            Build intelligence<br />you can understand.
          </h1>
        </div>
        <div className={styles.introCopy}>
          <p>See what each agent knows, what it can do and exactly where you stay in control.</p>
          <div className={styles.introActions}>
            <Link href="/a">assemble an agent <ArrowRight aria-hidden /></Link>
            <a href="#agent-gallery">enter the gallery <ArrowDownRight aria-hidden /></a>
          </div>
        </div>
      </div>

      <div id="agent-gallery" className={styles.galleryStudio}>
        <div className={styles.galleryBar}>
          <span><Blocks aria-hidden /> parts / 06</span>
          <span><i aria-hidden /> the assembl agent</span>
          <span>assembled view</span>
          <span><ScanSearch aria-hidden /> select an exhibit</span>
        </div>
        <AgentGalleryRoom />
      </div>

      <div className={styles.captionLine}>
        <span>see what your agent is made of.</span>
        <p>Memory / knowledge / intelligence / voice / abilities / boundaries</p>
      </div>
    </section>
  );
}
