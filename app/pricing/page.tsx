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
  title: 'pricing — see it work free, then build one workflow',
  description:
    'Try assembl in public for free. A founding pilot builds one agreed workflow around your rules, sources and review steps for NZ$1,500 plus GST.',
  alternates: { canonical: '/pricing' },
};

const PILOT_INCLUDES = [
  'One agreed job with a clear success measure',
  'Your confirmed rules, sources and current tools',
  'A working draft flow with a named human reviewer',
  'A handover showing what is live, what is manual and what comes next',
] as const;

const OPERATE_INCLUDES = [
  'Keep the workflow only if the evidence shows useful time saved',
  'Add integrations, agents or team access in agreed stages',
  'Confirm the ongoing scope and price before anything continues',
] as const;

export default function PricingPage() {
  const checkoutConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Clear pricing · New Zealand dollars</p>
          <h1>See it work free<span>.</span><br />Build one job.</h1>
          <p className={styles.lede}>
            Use the public demos before you buy anything. If one real job is worth solving,
            a founding pilot builds it around your facts, tools and review rules.
          </p>
          <div className={styles.heroActions}>
            <Link href="/pilot-sprint" className={styles.primaryCta}>
              Scope one workflow <ArrowRight aria-hidden />
            </Link>
            <Link href="/concept-studio" className={styles.secondaryCta}>Try the public tools</Link>
          </div>
          <div className={styles.priceLine}>
            <strong>NZ${PILOT_SPRINT_EX_GST_NZD.toLocaleString('en-NZ')}</strong>
            <span>+ NZ${PILOT_SPRINT_GST_NZD.toLocaleString('en-NZ')} GST · one agreed workflow · ten working days</span>
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
          <h2 id="pricing-path-title">Try it. Build one. Keep it only if it helps.</h2>
          <p>No long transformation programme. No invented saving. No ongoing commitment hidden inside the pilot.</p>
        </div>
        <div className={styles.pathGrid}>
          <article className={styles.stageCard}>
            <div className={styles.stageIcon}><Sparkles aria-hidden /></div>
            <p className={styles.stageNumber}>01 · try</p>
            <h3>Explore before you buy</h3>
            <p className={styles.stagePrice}>Free</p>
            <p>Try the Business Genome, a public agent or a shareable tool and inspect the result yourself.</p>
            <ul>
              <li><Check aria-hidden /> No card</li>
              <li><Check aria-hidden /> Fictional sample data</li>
              <li><Check aria-hidden /> Nothing is sent or published</li>
            </ul>
            <Link href="/concept-studio">Open the Concept Studio <ArrowRight aria-hidden /></Link>
          </article>

          <article className={`${styles.stageCard} ${styles.featuredCard}`}>
            <div className={styles.stageIcon}><Layers3 aria-hidden /></div>
            <p className={styles.stageNumber}>02 · pilot</p>
            <h3>Build one real job</h3>
            <p className={styles.stagePrice}>NZ${PILOT_SPRINT_EX_GST_NZD.toLocaleString('en-NZ')} <small>+ GST</small></p>
            <p>Ten working days to turn one repetitive job into a working result your team can review.</p>
            <ul>
              {PILOT_INCLUDES.map((item) => <li key={item}><Check aria-hidden /> {item}</li>)}
            </ul>
            <Link href="/pilot-sprint">Start a pilot <ArrowRight aria-hidden /></Link>
          </article>

          <article className={styles.stageCard}>
            <div className={styles.stageIcon}><ShieldCheck aria-hidden /></div>
            <p className={styles.stageNumber}>03 · decide</p>
            <h3>Decide from the evidence</h3>
            <p className={styles.stagePrice}>Agreed after the pilot</p>
            <p>Use the working result, time saved and review burden to decide whether to keep, change or stop.</p>
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
          <h2>Ready to scope the job?</h2>
          <p>
            Checkout opens only after we agree the workflow, success measure, reviewer and start date.
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
        <p><strong>What the founding price covers:</strong> one tightly scoped workflow, not a promise to replace every system in ten days. Any extra integration or data work is agreed before it begins.</p>
        <p><strong>What stays with you:</strong> your business data, your approvals and the decision to continue. Payment never grants assembl permission to publish, send, charge a customer or confirm a booking.</p>
      </section>
    </div>
  );
}
