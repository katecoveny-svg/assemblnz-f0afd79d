import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { TimeSavingsCalculator } from '@/components/home/TimeSavingsCalculator';
import { AgentAssemblyStudio } from '@/components/home/AgentAssemblyStudio';
import { OneMinuteBusiness } from '@/components/one-minute-business/OneMinuteBusiness';
import { HOME } from '@/lib/copy/homepage';
import publicStyles from '@/components/public/public-pages.module.css';
import styles from './home-simplified.module.css';

export const metadata: Metadata = {
  title: 'assembl — build intelligence you can understand',
  description: 'Assemble business agents visually. See their knowledge, abilities, connected apps, boundaries and approvals—then try a live Business Genome.',
  alternates: { canonical: '/' },
};

type HomeSearchParams = Promise<Record<string, string | string[] | undefined>>;

function sharedNumber(
  value: string | string[] | undefined,
  allowed: (candidate: number) => boolean,
  fallback: number,
) {
  const candidate = Number(Array.isArray(value) ? value[0] : value);
  return allowed(candidate) ? candidate : fallback;
}

export default async function HomePage({ searchParams }: { searchParams: HomeSearchParams }) {
  const query = await searchParams;
  const initialSavings = {
    people: sharedNumber(query.team, (value) => Number.isInteger(value) && value >= 1 && value <= 25, 3),
    adminHours: sharedNumber(query.admin, (value) => Number.isInteger(value) && value >= 1 && value <= 20, 6),
    repeatableShare: sharedNumber(
      query.repeatable,
      (value) => HOME.savings.repeatableOptions.some((option) => option.value === value),
      35,
    ),
  };

  return (
    <div className={styles.page}>
      <AgentAssemblyStudio />
      <div id="live-business-demo">
        <OneMinuteBusiness />
      </div>
      <TimeSavingsCalculator initialValues={initialSavings} />

      <section className={publicStyles.section}>
        <div className={publicStyles.sectionHeader}>
          <div>
            <p className={publicStyles.eyebrow}>what assembl is</p>
            <h2>One business.<br /><em>One confirmed source.</em></h2>
          </div>
          <p>
            Your offers, prices, people, rules and voice live in a Business Genome. The website, customer desk, bookings and agents read the same approved facts.
          </p>
        </div>
        <div className={publicStyles.stepGrid}>
          <article className={publicStyles.stepCard}><span className={publicStyles.number}>01</span><h3>The Genome</h3><p className={publicStyles.summary}>Change a fact once and see the connected work update.</p><div className={publicStyles.cardActions}><Link href="/genome" className={publicStyles.cardLink}>Try the live demo <ArrowRight aria-hidden size={14} /></Link></div></article>
          <article className={publicStyles.stepCard}><span className={publicStyles.number}>02</span><h3>The agents</h3><p className={publicStyles.summary}>Give one clear job to a specialist and receive a draft with its review boundary.</p><div className={publicStyles.cardActions}><Link href="/agents" className={publicStyles.cardLink}>Try an agent <ArrowRight aria-hidden size={14} /></Link></div></article>
          <article className={publicStyles.stepCard}><span className={publicStyles.number}>03</span><h3>The evidence</h3><p className={publicStyles.summary}>Sources, assumptions, model mode and the named reviewer stay attached.</p><div className={publicStyles.cardActions}><Link href="/trust" className={publicStyles.cardLink}>See how trust works <ArrowRight aria-hidden size={14} /></Link></div></article>
        </div>
      </section>

      <section className={publicStyles.section}>
        <div className={publicStyles.sectionHeader}>
          <div><p className={publicStyles.eyebrow}>try it in public</p><h2>Useful before you <em>book a call.</em></h2></div>
          <p>Start with something that gives you a result: build a small agent, make a moving visual, or see a Business Genome ripple through a fictional company.</p>
        </div>
        <div className={publicStyles.demoGrid}>
          <article className={`${publicStyles.demoCard} ${publicStyles.featured}`}><span className={`${publicStyles.status} ${publicStyles.live}`}>live now</span><h3>Business Genome</h3><p className={publicStyles.label}>connected system demo</p><p className={publicStyles.summary}>Change one business fact, run an agent and export a branded result card.</p><p className={publicStyles.boundary}>Fictional data. Nothing is sent.</p><div className={publicStyles.cardActions}><Link href="/genome" className={publicStyles.cardLink}>Open the demo</Link></div></article>
          <article className={publicStyles.demoCard}><span className={`${publicStyles.status} ${publicStyles.live}`}>live now</span><h3>Agent Maker</h3><p className={publicStyles.label}>build and share</p><p className={publicStyles.summary}>Create a small public agent for one job and send its recipe to someone else.</p><p className={publicStyles.boundary}>Draft-only. Shared recipes never carry a private task or result.</p><div className={publicStyles.cardActions}><Link href="/a" className={publicStyles.cardLink}>Build an agent</Link></div></article>
          <article className={publicStyles.demoCard}><span className={`${publicStyles.status} ${publicStyles.live}`}>live now</span><h3>Motion Studio</h3><p className={publicStyles.label}>make something move</p><p className={publicStyles.summary}>Art-direct a particle form and export a still or five-second loop.</p><p className={publicStyles.boundary}>Your image stays in your browser.</p><div className={publicStyles.cardActions}><Link href="/motion-studio" className={publicStyles.cardLink}>Open the studio</Link></div></article>
        </div>
        <div className={publicStyles.actions}><Link href="/concept-studio" className={publicStyles.secondary}>See every demo and concept</Link></div>
      </section>

      <div className={publicStyles.darkWrap}>
        <section className={publicStyles.darkSection}>
          <div className={publicStyles.sectionHeader}>
            <div><p className={publicStyles.eyebrow}>the operating boundary</p><h2>Agents prepare.<br /><em>People decide.</em></h2></div>
            <p>The system can read, organise, compare and draft. It does not send, file, book or make a commitment without the approval path the workflow names.</p>
          </div>
          <div className={publicStyles.stepGrid}>
            <article className={publicStyles.stepCard}><CheckCircle2 aria-hidden /><h3>Start with a real job</h3><p>Pick the repeat work that costs time or creates avoidable risk.</p></article>
            <article className={publicStyles.stepCard}><CheckCircle2 aria-hidden /><h3>Build it around your facts</h3><p>Use your sources, rules, voice and current tools instead of a generic prompt.</p></article>
            <article className={publicStyles.stepCard}><CheckCircle2 aria-hidden /><h3>Keep it only if it earns trust</h3><p>Review the result, the evidence and the time saved before deciding what continues.</p></article>
          </div>
          <div className={publicStyles.actions}><Link href="/pricing" className={publicStyles.primary}>See the founding pilot</Link><Link href="/about" className={publicStyles.secondary}>Why assembl exists</Link></div>
        </section>
      </div>
    </div>
  );
}
