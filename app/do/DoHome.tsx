"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./do-home.module.css";

/**
 * Public /do — Kate craft 2026-09-17.
 * Short explanation of DO + daylight atelier still.
 * No Meeting/Household shelf, no Identity D theatre, no vendor names.
 */
export function DoHome() {
  return (
    <div className={`do-craft ${styles.page}`}>
      <a className={styles.skip} href="#do-explain">
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

      <main className={styles.layout} id="do-explain">
        <div className={styles.copy}>
          <p className={styles.eyebrow}>DO</p>
          <h1 className={styles.title}>
            Work from the place
            <br />
            you’re already in.
          </h1>
          <p className={styles.lede}>
            DO is a small agent that sits where you already work. Click it when
            you need help with that context. Pick or tweak a template. Connect a
            tool only when you want to. The surface is not the agent — you stay
            in your own work.
          </p>
          <ol className={styles.steps} aria-label="How DO works">
            <li>
              <span>01</span>
              <div>
                <strong>Click DO where you are</strong>
                <p>Browser, desktop, or share surface — same agent, same context.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Pick or tweak a template</strong>
                <p>Start from a useful shape for the job in front of you.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Connect only if you need to</strong>
                <p>Optional connectors. You review before anything consequential.</p>
              </div>
            </li>
          </ol>
          <p className={styles.promise}>
            You can DO the work from the place you’re already in.
          </p>
          <div className={styles.actions}>
            <Link href="/contact?product=do" className={styles.primary}>
              Talk to us about DO
            </Link>
            <Link href="/" className={styles.ghost}>
              Back to assembl
            </Link>
            <Link href="/pursuit" className={styles.ghost}>
              Open Pursuit
            </Link>
            <Link href="/creative-studio" className={styles.ghost}>
              Open Studio
            </Link>
          </div>
        </div>

        <figure className={styles.visual}>
          <Image
            src="/do/world/atelier-poster.png"
            alt="Daylight Auckland atelier — paper field with plum and rose accents"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 52vw"
            className={styles.visualImage}
          />
          <figcaption className={styles.visualCaption}>
            Auckland atelier · imagined workspace · not live agent activity
          </figcaption>
        </figure>
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
