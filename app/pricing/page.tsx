import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Layers3, ShieldCheck, Sparkles } from 'lucide-react';
import { PilotSprintCheckout } from '@/components/billing/PilotSprintCheckout';
import { GenomeDomeVisual } from '@/components/genome-dome/GenomeDomeVisual';
import { PatternBackdrop } from '@/components/pattern-studio/PatternBackdrop';
import {
  PILOT_SPRINT_EX_GST_NZD,
  PILOT_SPRINT_GST_NZD,
  PILOT_SPRINT_TOTAL_NZD,
} from '@/lib/billing/pilot-sprint';
import styles from './pricing.module.css';

export const metadata: Metadata = {
  title: 'pricing — start with one workflow',
  description:
    'Try the assembl demo free, then build one real workflow in a ten-working-day pilot for NZ$1,500 plus GST.',
  alternates: { canonical: '/pricing' },
};

const PILOT_INCLUDES = [
  'One agreed workflow',
  'Your rules, sources and current tools',
  'A working result your team can review',
] as const;

const OPERATE_INCLUDES = [
  'Keep the workflow only if it saves useful time',
  'Add integrations or team access in stages',
  'Agree the ongoing cost before anything continues',
] as const;

export default function PricingPage() {
  const checkoutConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Simple pricing · NZD</p>
          <h1>Start with one workflow<span>.</span></h1>
          <p className={styles.lede}>
            Try the demo for free. If it fits, a ten-working-day pilot builds one useful
            workflow around your rules, tools and approvals.
          </p>
          <div className={styles.heroActions}>
            <Link href="/pilot-sprint" className={styles.primaryCta}>
              Start a pilot <ArrowRight aria-hidden />
            </Link>
            <Link href="/genome" className={styles.secondaryCta}>Try the live demo</Link>
          </div>
          <div className={styles.priceLine}>
            <strong>NZ${PILOT_SPRINT_EX_GST_NZD.toLocaleString('en-NZ')}</strong>
            <span>+ NZ${PILOT_SPRINT_GST_NZD.toLocaleString('en-NZ')} GST · ten working days</span>
          </div>
        </div>
        <div className={styles.domeCard} aria-label="Interactive Auckland Business Genome">
          <PatternBackdrop
            className={styles.domePattern}
            mode="particles"
            colorRole="accent"
            count={135}
            particleShape="spark"
            connectLines
            connectDistance={128}
            glow
            opacity={0.72}
            speed={0.65}
            lazyMount={false}
          />
          <div className={styles.domeVisual}>
            <GenomeDomeVisual label="Explore the live genome" />
          </div>
          <div className={styles.domeStatus}>
            <span />
            website · desk · workflow · evidence
          </div>
        </div>
      </section>

      <section className={styles.pathSection} aria-labelledby="pricing-path-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>A clear path</p>
          <h2 id="pricing-path-title">Try it. Build one. Decide.</h2>
          <p>No long transformation programme and no hidden platform commitment.</p>
        </div>
        <div className={styles.pathGrid}>
          <article className={styles.stageCard}>
            <div className={styles.stageIcon}><Sparkles aria-hidden /></div>
            <p className={styles.stageNumber}>01 · try</p>
            <h3>Try the live demo</h3>
            <p className={styles.stagePrice}>Free</p>
            <p>Change one business fact and see connected work update.</p>
            <ul>
              <li><Check aria-hidden /> No card</li>
              <li><Check aria-hidden /> Fictional sample data</li>
              <li><Check aria-hidden /> Nothing is sent or published</li>
            </ul>
            <Link href="/genome">Open the demo <ArrowRight aria-hidden /></Link>
          </article>

          <article className={`${styles.stageCard} ${styles.featuredCard}`}>
            <div className={styles.stageIcon}><Layers3 aria-hidden /></div>
            <p className={styles.stageNumber}>02 · pilot</p>
            <h3>Build one real workflow</h3>
            <p className={styles.stagePrice}>NZ${PILOT_SPRINT_EX_GST_NZD.toLocaleString('en-NZ')} <small>+ GST</small></p>
            <p>Ten working days to turn one repetitive job into a working, reviewable result.</p>
            <ul>
              {PILOT_INCLUDES.map((item) => <li key={item}><Check aria-hidden /> {item}</li>)}
            </ul>
            <Link href="/pilot-sprint">Start a pilot <ArrowRight aria-hidden /></Link>
          </article>

          <article className={styles.stageCard}>
            <div className={styles.stageIcon}><ShieldCheck aria-hidden /></div>
            <p className={styles.stageNumber}>03 · decide</p>
            <h3>Keep only what earns its place</h3>
            <p className={styles.stagePrice}>Agreed after the pilot</p>
            <p>Use the evidence from the pilot to decide whether to keep, change or stop.</p>
            <ul>
              {OPERATE_INCLUDES.map((item) => <li key={item}><Check aria-hidden /> {item}</li>)}
            </ul>
            <Link href="/contact">Ask a question <ArrowRight aria-hidden /></Link>
          </article>
        </div>
      </section>

      <section className={styles.checkoutSection}>
        <div className={styles.checkoutCopy}>
          <p className={styles.eyebrow}>Secure checkout</p>
          <h2>Ready to start?</h2>
          <p>
            Use checkout after we agree the workflow, success measure and start date.
            The total is NZ${PILOT_SPRINT_TOTAL_NZD.toLocaleString('en-NZ')} including GST.
          </p>
          <div className={styles.checkoutFact}>
            <strong>NZ${PILOT_SPRINT_EX_GST_NZD.toLocaleString('en-NZ')}</strong>
            <span>build</span>
            <strong>NZ${PILOT_SPRINT_GST_NZD.toLocaleString('en-NZ')}</strong>
            <span>GST</span>
            <strong>NZ${PILOT_SPRINT_TOTAL_NZD.toLocaleString('en-NZ')}</strong>
            <span>charged</span>
          </div>
        </div>
        <PilotSprintCheckout configured={checkoutConfigured} />
      </section>

      <section className={styles.finePrint}>
        <p><strong>What the founding price is for:</strong> an early, tightly scoped pilot where both sides learn quickly. It is not a promise to replace every system in ten days.</p>
        <p><strong>What stays with you:</strong> your business data, your approvals and the decision to continue. Checkout does not grant assembl permission to publish, send, charge your customers or confirm bookings.</p>
      </section>
    </div>
  );
}
