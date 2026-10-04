'use client';

import Link from 'next/link';
import { DoEntryObject } from '@/components/do/DoEntryObject';
import { DoActionIcon } from '@/components/do/DoBrand';
import styles from './assembl-entry.module.css';

export function AssemblEntry() {
  return <section className={styles.entry} aria-labelledby="assembl-entry-title">
    <header className={styles.nav}>
      <Link href="/" className={styles.wordmark} aria-label="assembl home">assembl</Link>
      <nav aria-label="Primary"><Link href="/do">DO</Link><Link href="/pursuit">Pursuit</Link><Link href="/creative-studio">Studio</Link><Link href="/about">About</Link></nav>
    </header>
    <div className={styles.hero}>
      <DoEntryObject />
      <p className={styles.endorsement}>DO <span>by assembl</span></p>
      <h1 id="assembl-entry-title">What needs doing?</h1>
      <p className={styles.lede}>Start with one thing. Work out the next step.</p>
      <Link className={styles.open} href="/do">Open DO <DoActionIcon kind="arrow" /></Link>
      <a className={styles.example} href="#products">Find your way in <span aria-hidden="true">↓</span></a>
    </div>
    <p className={styles.caption}>A little help with everyday jobs. Made in Aotearoa.</p>
  </section>;
}
