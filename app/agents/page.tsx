import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { PUBLIC_MARKETPLACE_AGENTS } from '@/lib/marketplace/agents';
import { V2Nav } from '@/components/v2/V2Chrome';
import { V2Footer } from '@/components/v2/V2Footer';
import styles from '@/components/public/public-pages.module.css';

export const metadata: Metadata = {
  title: 'agents — try one clear job',
  description:
    'Try a small set of assembl agents on real work. Each prepares a draft, shows its sources and waits for a person to review it.',
  alternates: { canonical: '/agents' },
};

const CURATED_SLUGS = ['atlas', 'dawn', 'hui', 'pikau', 'auaha', 'sweep'] as const;
const CURATED_AGENTS = CURATED_SLUGS.map((slug) =>
  PUBLIC_MARKETPLACE_AGENTS.find((agent) => agent.slug === slug),
).filter((agent): agent is NonNullable<typeof agent> => Boolean(agent));

const CURATED_COPY: Record<(typeof CURATED_SLUGS)[number], { label: string; summary: string; result: string }> = {
  atlas: {
    label: 'workflow guide',
    summary: 'Looks at the repetitive work in your week and finds one sensible place to start.',
    result: 'A ranked shortlist, one first step and an honest note on what should stay human.',
  },
  dawn: {
    label: 'day brief',
    summary: 'Pulls the day into one calm view before the work starts.',
    result: 'A two-minute brief with priorities, timings and the decisions that need you.',
  },
  hui: {
    label: 'meeting record',
    summary: 'Turns a meeting transcript or rough notes into a record people can actually use.',
    result: 'Draft minutes with decisions, actions, owners, dates and open questions.',
  },
  pikau: {
    label: 'customs draft',
    summary: 'Prepares an import-entry draft from an invoice and packing list.',
    result: 'Structured line items, values and origin notes for a licensed broker to check.',
  },
  auaha: {
    label: 'creative draft',
    summary: 'Takes a clear campaign brief and prepares a practical first creative direction.',
    result: 'Several on-brand copy and asset options for a person to choose and clear.',
  },
  sweep: {
    label: 'inbox triage',
    summary: 'Sorts the morning inbox into what needs a reply now, later or not at all.',
    result: 'Three clear buckets and a short reply plan for the messages that matter.',
  },
};

export default function AgentsPage() {
  return (
    <div className={styles.page}>
      <V2Nav current="/agents" />
      <div>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>assembl agents · public demos</p>
            <h1>One agent.<br /><em>One clear job.</em></h1>
            <p className={styles.lede}>
              Pick the work in front of you. The agent prepares a draft, shows what it relied on and stops for your review. You do not need to learn prompting first.
            </p>
            <div className={styles.actions}>
              <Link href="/agents/dawn/chat" className={styles.primary}>Try an agent now <ArrowRight aria-hidden size={16} /></Link>
              <Link href="/a" className={styles.secondary}>Build a small agent</Link>
            </div>
          </div>
          <aside className={styles.heroAside} aria-label="How public agent demos work">
            <div className={styles.heroFact}><span>01</span><div><strong>Choose a starter</strong><p>Begin with a plain example instead of an empty chat box.</p></div></div>
            <div className={styles.heroFact}><span>02</span><div><strong>Get a draft</strong><p>The reply is practical, bounded and specific to the job.</p></div></div>
            <div className={styles.heroFact}><span>03</span><div><strong>Check the proof</strong><p>Sources and the human approval step stay visible before anything is used.</p></div></div>
          </aside>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div><p className={styles.eyebrow}>start here</p><h2>Six agents that are <em>easy to understand.</em></h2></div>
            <p>A smaller front shelf makes the product easier to try. The broader specialist fleet still exists behind each Living Site and pilot.</p>
          </div>
          <div className={styles.agentGrid}>
            {CURATED_AGENTS.map((agent, index) => {
              const copy = CURATED_COPY[agent.slug as (typeof CURATED_SLUGS)[number]];
              return (
              <article key={agent.slug} className={`${styles.agentCard} ${index < 3 ? styles.featured : ''}`}>
                <div className={styles.cardTop}><span className={`${styles.status} ${styles.live}`}>live demo</span><span className={styles.number}>{String(index + 1).padStart(2, '0')}</span></div>
                <h3>{agent.name}</h3>
                <p className={styles.label}>{copy.label}</p>
                <p className={styles.summary}>{copy.summary}</p>
                <p className={styles.proof}><strong>You get:</strong> {copy.result}</p>
                <p className={styles.boundary}>Draft only. A named person checks the result before it is sent, filed, lodged or relied on.</p>
                <div className={styles.cardActions}>
                  <Link href={`/agents/${agent.slug}/chat`} className={styles.cardLink}>Try {agent.name} <ArrowRight aria-hidden size={14} /></Link>
                  <Link href={`/agents/${agent.slug}`} className={styles.cardLink}>See how it works</Link>
                </div>
              </article>
              );
            })}
          </div>
        </section>

        <div className={styles.darkWrap}>
          <section className={styles.darkSection}>
            <div className={styles.sectionHeader}>
              <div><p className={styles.eyebrow}>when it earns trust</p><h2>Then connect it to <em>your Business Genome.</em></h2></div>
              <p>The public version proves the job. A private assembl installation adds your confirmed facts, connected tools, permissions and named reviewers.</p>
            </div>
            <div className={styles.stepGrid}>
              <article className={styles.stepCard}><ShieldCheck aria-hidden /><h3>Your facts</h3><p>Offers, prices, people, rules and voice live once in the Genome.</p></article>
              <article className={styles.stepCard}><ShieldCheck aria-hidden /><h3>Your review rules</h3><p>Every workflow names who checks it and what the agent may never do alone.</p></article>
              <article className={styles.stepCard}><ShieldCheck aria-hidden /><h3>Your evidence</h3><p>Sources, assumptions and decisions stay attached to the result.</p></article>
            </div>
            <div className={styles.actions}>
              <Link href="/genome" className={styles.primary}>Try the Business Genome</Link>
              <Link href="/pricing" className={styles.secondary}>See the pilot price</Link>
            </div>
          </section>
        </div>
      </div>
      <V2Footer />
    </div>
  );
}
