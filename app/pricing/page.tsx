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
  title: 'Living Site pricing',
  description:
    'Explore an assembl Living Site free, or commission a ten-working-day Founding Pilot for NZ$1,500 plus GST. One real workflow, installed around your business.',
  alternates: { canonical: '/pricing' },
};

const PILOT_INCLUDES = [
  'One agreed workflow, mapped against the way your team works now',
  'A Business Genome containing the facts that workflow is allowed to use',
  'The relevant website, intake, desk and draft tools needed to prove the loop',
  'Human approval gates, source notes and a practical handover',
] as const;

const OPERATE_INCLUDES = [
  'Hosting, monitoring and support scoped to the system you keep',
  'Additional workflows, integrations and team access added in agreed stages',
  'Third-party usage shown separately before you approve it',
  'A monthly price agreed before the pilot moves into ongoing operation',
] as const;

export default function PricingPage() {
  const checkoutConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  return (
    <div className={styles.page}>
      <section className={styles.hero} style={{ position: 'relative' }}>
        {/* Pattern Studio motion — decorative, behind the hero grid. */}
        <PatternBackdrop
          className="absolute inset-0"
          mode="particles"
          colorRole="gold"
          count={110}
          connectLines
          connectDistance={130}
          glow
          opacity={0.3}
          speed={0.55}
          lazyMount={false}
        />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Living Site pricing · NZD</p>
          <h1>Buy the working loop first<span>.</span></h1>
          <p className={styles.lede}>
            See the system working in a fictional business for free. When you are ready,
            a Founding Pilot installs one valuable workflow around the facts, approvals and
            tools your business actually uses.
          </p>
          <div className={styles.heroActions}>
            <Link href="/pilot-sprint" className={styles.primaryCta}>
              Start a founding pilot <ArrowRight aria-hidden />
            </Link>
            <Link href="/living-site" className={styles.secondaryCta}>Explore the live demos</Link>
          </div>
          <div className={styles.priceLine}>
            <strong>NZ${PILOT_SPRINT_EX_GST_NZD.toLocaleString('en-NZ')}</strong>
            <span>+ NZ${PILOT_SPRINT_GST_NZD.toLocaleString('en-NZ')} GST · ten working days</span>
          </div>
        </div>
        <div className={styles.domeCard} aria-label="Interactive Auckland Business Genome">
          <GenomeDomeVisual label="Explore the live genome" />
          <div className={styles.domeStatus}>
            <span />
            website · desk · workflow · evidence
          </div>
        </div>
      </section>

      <section className={styles.pathSection} aria-labelledby="pricing-path-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>A practical path to live</p>
          <h2 id="pricing-path-title">Three clear stages. No mystery platform fee.</h2>
          <p>Each stage has a different job: understand it, prove it, then decide what is worth keeping.</p>
        </div>
        <div className={styles.pathGrid}>
          <article className={styles.stageCard}>
            <div className={styles.stageIcon}><Sparkles aria-hidden /></div>
            <p className={styles.stageNumber}>01 · explore</p>
            <h3>See a Living Site work</h3>
            <p className={styles.stagePrice}>Free</p>
            <p>Use the fictional vertical demos to test the website, booking request, customer desk, proposal, invoice, voice desk and marketing studio.</p>
            <ul>
              <li><Check aria-hidden /> No card</li>
              <li><Check aria-hidden /> Fictional sample data</li>
              <li><Check aria-hidden /> Nothing connects to your business</li>
            </ul>
            <Link href="/living-site">Open the demos <ArrowRight aria-hidden /></Link>
          </article>

          <article className={`${styles.stageCard} ${styles.featuredCard}`}>
            <div className={styles.stageIcon}><Layers3 aria-hidden /></div>
            <p className={styles.stageNumber}>02 · founding pilot</p>
            <h3>Prove one real workflow</h3>
            <p className={styles.stagePrice}>NZ${PILOT_SPRINT_EX_GST_NZD.toLocaleString('en-NZ')} <small>+ GST</small></p>
            <p>Ten working days to install one agreed workflow against your own rules and sources, with a named person retaining control.</p>
            <ul>
              {PILOT_INCLUDES.map((item) => <li key={item}><Check aria-hidden /> {item}</li>)}
            </ul>
            <Link href="/pilot-sprint">See the pilot scope <ArrowRight aria-hidden /></Link>
          </article>

          <article className={styles.stageCard}>
            <div className={styles.stageIcon}><ShieldCheck aria-hidden /></div>
            <p className={styles.stageNumber}>03 · operate</p>
            <h3>Keep only what earns its place</h3>
            <p className={styles.stagePrice}>Agreed after the pilot</p>
            <p>The pilot gives us enough evidence to price the live system honestly. You see the ongoing scope and cost before choosing to continue.</p>
            <ul>
              {OPERATE_INCLUDES.map((item) => <li key={item}><Check aria-hidden /> {item}</li>)}
            </ul>
            <Link href="/contact">Talk through your workflow <ArrowRight aria-hidden /></Link>
          </article>
        </div>
      </section>

      <section className={styles.checkoutSection}>
        <div className={styles.checkoutCopy}>
          <p className={styles.eyebrow}>For approved founding pilots</p>
          <h2>Ready to fund the build?</h2>
          <p>
            Use secure checkout only after the workflow, success measure and start date are agreed.
            Stripe charges NZ${PILOT_SPRINT_TOTAL_NZD.toLocaleString('en-NZ')} including GST and creates the payment record.
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
