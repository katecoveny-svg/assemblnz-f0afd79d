import type { Metadata } from 'next';
import SparkBuilder from './SparkBuilder';
import styles from './spark.module.css';

export const metadata: Metadata = {
  title: 'SPARK — build your own business tool in plain English | assembl',
  description:
    'Describe the tool your business needs — a quote calculator, an intake form, a checklist — and SPARK builds a working tool in seconds. No code, no developer, no $5K invoice. Part of assembl.',
  openGraph: {
    title: 'SPARK — describe it in plain English, SPARK builds it',
    description:
      'Need a quote calculator for your painting business? Describe it in plain English, SPARK builds it in seconds — no code, no developer, no $5K invoice.',
    url: 'https://assembl.co.nz/spark',
    siteName: 'assembl',
    type: 'website',
  },
};

export default function SparkPage() {
  return (
    <main className={styles.surface}>
      <div className={styles.wordmarkTop}>
        <span className={styles.dot} aria-hidden />
        SPARK
      </div>

      <header className={styles.hero}>
        <span className={styles.eyebrow}>ASM-042 · App builder</span>
        <h1 className={styles.wordmark}>SPARK</h1>
        <p className={styles.tagline}>
          Need a quote calculator for your painting business? <b>Describe it in plain English, SPARK builds it
          in seconds</b> — no code, no developer, no $5K invoice.
        </p>
      </header>

      <SparkBuilder />

      {/* Below the fold — the promise */}
      <section className={styles.promise}>
        <h2 className={styles.promiseTitle}>Built by you, in plain English</h2>
        <p className={styles.promiseBody}>
          Everyone has a &ldquo;we should build a tool for that&rdquo; list. SPARK pulls one off it. You describe
          what you need; SPARK builds it. You decide what it does, check it&rsquo;s right, and run it — SPARK
          empowers you, it doesn&rsquo;t replace you.
        </p>
      </section>

      {/* Three honest reassurances */}
      <section className={styles.reassurances} aria-label="How SPARK builds">
        <div className={styles.rcard}>
          <div className={styles.rIcon} aria-hidden>🔒</div>
          <p className={styles.rTitle}>Privacy Act 2020</p>
          <p className={styles.rBody}>
            Tools that collect personal details are built toward the Privacy Act 2020, including the collection
            notice most operators don&rsquo;t know they need. You own the data.
          </p>
        </div>
        <div className={styles.rcard}>
          <div className={styles.rIcon} aria-hidden>💳</div>
          <p className={styles.rTitle}>Stripe NZ payments</p>
          <p className={styles.rBody}>
            Booking and deposit tools scaffold Stripe NZ deposit fields, ready for you to connect your own
            Stripe account when you&rsquo;re happy with the tool.
          </p>
        </div>
        <div className={styles.rcard}>
          <div className={styles.rIcon} aria-hidden>♿</div>
          <p className={styles.rTitle}>WCAG 2.1 AA</p>
          <p className={styles.rBody}>
            Every tool is built toward WCAG 2.1 AA accessibility — labelled inputs, keyboard use, and readable
            contrast — so everyone can use what you build.
          </p>
        </div>
      </section>

      <footer className={styles.footerStrip}>
        <div className={styles.assemblMark}>
          <span className={styles.dot} aria-hidden />
          part of assembl
        </div>
        <div style={{ marginTop: '0.4rem' }}>Kate Hudson · assembl.co.nz</div>
      </footer>
    </main>
  );
}
