import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PITCH_DEMOS, PITCH_SLUGS } from '@/lib/pitch-demos';
import styles from './pitchHub.module.css';

export const metadata: Metadata = {
  title: 'Pitch demos · assembl',
  description: 'Four bounded customer journey concepts prepared by assembl.',
  robots: { index: false, follow: false },
};

export default function PitchHub() {
  return (
    <main className={styles.page}>
      <header className={styles.nav}><Link href="/">assembl</Link><span>pitch studio · 24 august 2026</span></header>
      <section className={styles.hero}>
        <p>ACTIVE CUSTOMER JOURNEYS</p>
        <h1>Four waits worth fixing.</h1>
        <div className={styles.grid}>
          {PITCH_SLUGS.map((slug, index) => {
            const demo = PITCH_DEMOS[slug];
            return (
              <Link key={slug} href={`/pitch/${slug}`} className={styles.card} style={{ '--client': demo.accent } as CSSProperties}>
                <span>0{index + 1} · {demo.sector}</span>
                <h2>{demo.company}</h2>
                <p>{demo.headline}</p>
                <b>open concept →</b>
              </Link>
            );
          })}
        </div>
      </section>
      <footer>Independent concepts. Not commissioned by or affiliated with the organisations named.</footer>
    </main>
  );
}
