"use client";

import Link from "next/link";
import styles from "./do-home.module.css";

/**
 * Public /do holding page — Kate 2026-09-17.
 * No Meeting/Household shelf, no Identity D theatre, no vendor names.
 * Meeting/Household runtimes remain in-repo under /do/meetings and /do/household
 * as PREVIEW/internal; they are not the public product face.
 */
export function DoHome() {
  return (
    <div className={`do-craft ${styles.page}`}>
      <a className={styles.skip} href="#do-holding">
        Skip to content
      </a>

      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          assembl
        </Link>
        <span className={styles.product}>/ DO</span>
        <nav aria-label="assembl products">
          <Link href="/pursuit">Pursuit</Link>
          <Link href="/creative-studio">Studio</Link>
        </nav>
      </header>

      <main className={styles.holding} id="do-holding">
        <p className={styles.eyebrow}>DO · HOLDING</p>
        <h1 className={styles.holdingTitle}>DO is paused on the public site.</h1>
        <p className={styles.holdingLede}>
          The portable execution layer stays part of assembl — find it, DO it,
          show it. Public try-it tools are off this door for now.
        </p>
        <p className={styles.boundary}>
          DEMO honesty · no public tool shelf · nothing is running for you here
        </p>
        <div className={styles.holdingActions}>
          <Link href="/" className={styles.heroPrimary}>
            Back to assembl
          </Link>
          <Link href="/pursuit" className={styles.heroGhost}>
            Open Pursuit
          </Link>
          <Link href="/creative-studio" className={styles.heroGhost}>
            Open Studio
          </Link>
          <Link href="/contact?product=do" className={styles.heroGhost}>
            Talk to us about DO
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <Link className={styles.brand} href="/">
          assembl
        </Link>
        <p>Find it. DO it. Show it.</p>
        <nav aria-label="Footer">
          <Link href="/pursuit">Pursuit</Link>
          <Link href="/creative-studio">Studio</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </footer>
    </div>
  );
}
