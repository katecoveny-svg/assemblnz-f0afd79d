import type { Metadata } from 'next';
import { BeatLeadForm } from '@/components/site/beat/BeatLeadForm';
import styles from './beat.module.css';

export const metadata: Metadata = {
  title: 'Beat by assembl — get paid for the wait.',
  description:
    "An NZ-built ad network for the 'thinking…' moment inside NZ software. Publishers earn 55%. Privacy Act 2020 native. Built by Kate Hudson, Aotearoa.",
  alternates: { canonical: '/beat' },
  openGraph: {
    title: 'Beat by assembl — get paid for the wait.',
    description:
      "An NZ-built ad network for the 'thinking…' moment inside NZ software. Publishers earn 55%.",
    type: 'website',
    url: 'https://assembl.co.nz/beat',
    locale: 'en_NZ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beat by assembl — get paid for the wait.',
    description:
      "An NZ-built ad network for the 'thinking…' moment inside NZ software. Publishers earn 55%.",
  },
};

export default function BeatPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.eyebrow}>Built in Aotearoa</div>
        <h1 className={styles.heroTitle}>Get paid for the wait.</h1>
        <p className={styles.heroSub}>
          When your software says &ldquo;thinking…&rdquo;, we turn it into NZ ad revenue.{' '}
          <strong>Publishers keep 55%.</strong>
        </p>

        <div className={styles.demo}>
          <div className={`${styles.demoCard} ${styles.before}`}>
            <div className={styles.label}>Without Beat</div>
            <div className={styles.line}>Drafting your reply</div>
          </div>
          <div className={`${styles.demoCard} ${styles.after}`}>
            <div className={styles.label}>With Beat</div>
            <div className={styles.line}>
              Drafting your reply
              <span className={styles.sep}>·</span>
              <span className={styles.brand}>Westpac — visit our small business hubs</span>
            </div>
          </div>
        </div>

        <div className={styles.install}>
          <div className={styles.installLabel}>
            Two lines of code. Live in seven days.{' '}
            <span className={styles.installFlag}>Public 27 Jun 2026</span>
          </div>
          <div className={styles.installCmd}>
            <span>
              <span className={styles.pkg}>npm</span> install @assembl/beat-sdk
            </span>
            <a href="#contact" className={styles.copy}>
              Reserve a pilot
            </a>
          </div>
        </div>
      </section>

      <section className={styles.pillars}>
        <div className={styles.pillarsGrid}>
          <div className={styles.pillar}>
            <h3>NZ-only</h3>
            <p>NZ brands. NZ attention. NZ rates.</p>
          </div>
          <div className={styles.pillar}>
            <h3>Privacy-first</h3>
            <p>We never read prompts, content, code or files.</p>
          </div>
          <div className={styles.pillar}>
            <h3>Named accountability</h3>
            <p>Kate Hudson signs the rules. Not a click-through.</p>
          </div>
        </div>
      </section>

      <section className={styles.how}>
        <h2 className={styles.sectionTitle}>How a 7-day publisher pilot works</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.num}>01</div>
            <h4>You install</h4>
            <p>Two lines. Two minutes.</p>
          </div>
          <div className={styles.step}>
            <div className={styles.num}>02</div>
            <h4>We serve</h4>
            <p>One NZ-brand line in the spinner. Five seconds max.</p>
          </div>
          <div className={styles.step}>
            <div className={styles.num}>03</div>
            <h4>You earn</h4>
            <p>55% of net rev, paid monthly. First three anchors get 60% for life.</p>
          </div>
        </div>
      </section>

      <section className={styles.bulletin}>
        <div className={styles.bulletinBox}>
          <h3>Updates from Kate</h3>
          <div className={styles.from}>Founder · ASSEMBL NZ LIMITED · last updated 17 June 2026</div>
          <ul>
            <li>
              <span className={styles.date}>17 Jun</span>SDK shipping into our own HAPAI tools first
              — we&rsquo;re publisher zero.
            </li>
            <li>
              <span className={styles.date}>17 Jun</span>NZ tool founders: 3 anchor slots open. 60%
              rev share for life.
            </li>
            <li>
              <span className={styles.date}>17 Jun</span>NZ advertisers: NZ$45 average CPM. Five
              pilot slots open in July.
            </li>
            <li>
              <span className={styles.date}>17 Jun</span>Built in Aotearoa. No marketplace politics.
              No middleman.
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.cta} id="contact">
        <h2>First three publishers earn 60%. Forever.</h2>
        <p className={styles.sub}>Build NZ software? Market a NZ brand? Let&rsquo;s talk this week.</p>
        <BeatLeadForm />
      </section>
    </>
  );
}
