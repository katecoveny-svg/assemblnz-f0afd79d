import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import {
  CONCEPT_DEMOS,
  PROMOTION_TOOL_SLUGS,
  STATUS_LABELS,
  type ConceptDemo,
} from '@/lib/public-site';
import styles from '@/components/public/public-pages.module.css';

export const metadata: Metadata = {
  title: 'Concept Studio — live demos and public experiments',
  description:
    'Try assembl products, public tools and carefully labelled concept previews. Live means working now; preview and concept boundaries stay visible.',
  alternates: { canonical: '/concept-studio' },
};

const promotable = PROMOTION_TOOL_SLUGS.map((slug) =>
  CONCEPT_DEMOS.find((demo) => demo.slug === slug),
).filter((demo): demo is ConceptDemo => Boolean(demo));

function DemoLink({ demo, children }: { demo: ConceptDemo; children: React.ReactNode }) {
  if (demo.external) {
    return (
      <a href={demo.href} target="_blank" rel="noreferrer" className={styles.cardLink}>
        {children} <ArrowUpRight aria-hidden size={14} />
      </a>
    );
  }
  return (
    <Link href={demo.href} className={styles.cardLink}>
      {children} <ArrowUpRight aria-hidden size={14} />
    </Link>
  );
}

function DemoCard({ demo }: { demo: ConceptDemo }) {
  return (
    <article className={`${styles.demoCard} ${demo.featured ? styles.featured : ''}`}>
      <div className={styles.cardTop}>
        <span className={`${styles.status} ${styles[demo.status]}`}>{STATUS_LABELS[demo.status]}</span>
        <span className={styles.number}>{demo.external ? '↗' : 'assembl'}</span>
      </div>
      <h3>{demo.title}</h3>
      <p className={styles.label}>{demo.label}</p>
      <p className={styles.summary}>{demo.summary}</p>
      <p className={styles.proof}>{demo.tryCopy}</p>
      <p className={styles.boundary}>{demo.boundary}</p>
      <div className={styles.cardActions}>
        <DemoLink demo={demo}>{demo.status === 'concept' ? 'Explore concept' : 'Open demo'}</DemoLink>
      </div>
    </article>
  );
}

export default function ConceptStudioPage() {
  const live = CONCEPT_DEMOS.filter((demo) => demo.status === 'live');
  const previews = CONCEPT_DEMOS.filter((demo) => demo.status === 'preview');
  const concepts = CONCEPT_DEMOS.filter((demo) => demo.status === 'concept');

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>assembl · Concept Studio</p>
          <h1>Try the work.<br /><em>See what is real.</em></h1>
          <p className={styles.lede}>
            Working products, public experiments and early concepts in one place. Every card says what you can try today and where the boundary still sits.
          </p>
          <div className={styles.actions}>
            <a href="#promote" className={styles.primary}>Start with the shareable tools</a>
            <Link href="/genome" className={styles.secondary}>Open the Business Genome</Link>
          </div>
        </div>
        <aside className={styles.heroAside} aria-label="Concept Studio status guide">
          <div className={styles.heroFact}><span>01</span><div><strong>Live now</strong><p>The interaction works on assembl.co.nz and produces a real draft, export or result.</p></div></div>
          <div className={styles.heroFact}><span>02</span><div><strong>Public preview</strong><p>The core experience works, but a provider, polish pass or production connection is still being proven.</p></div></div>
          <div className={styles.heroFact}><span>03</span><div><strong>Concept</strong><p>A product direction you can explore. Data and integrations are deliberately labelled as fictional or simulated.</p></div></div>
        </aside>
      </section>

      <div className={styles.truthBar}>
        <div><strong>{live.length} live experiences</strong><span>Open and use them now.</span></div>
        <div><strong>{previews.length} public previews</strong><span>Useful, with visible production limits.</span></div>
        <div><strong>{concepts.length} concept products</strong><span>Explore the direction without mistaking it for a connected service.</span></div>
      </div>

      <section id="promote" className={styles.section}>
        <div className={styles.sectionHeader}>
          <div><p className={styles.eyebrow}>promotion-ready</p><h2>Small tools people can <em>use and share.</em></h2></div>
          <p>These are the best starting links for social posts, conversations and press outreach. Each gives the visitor something of their own to keep or remix.</p>
        </div>
        <div className={styles.demoGrid}>{promotable.map((demo) => <DemoCard key={demo.slug} demo={demo} />)}</div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div><p className={styles.eyebrow}>working now</p><h2>Live demos with a <em>clear result.</em></h2></div>
          <p>Use the tool, inspect the proof and share the output. Nothing auto-sends, auto-files or acts outside the page.</p>
        </div>
        <div className={styles.demoGrid}>{live.map((demo) => <DemoCard key={demo.slug} demo={demo} />)}</div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div><p className={styles.eyebrow}>still being proven</p><h2>Previews and <em>concept products.</em></h2></div>
          <p>The useful idea is visible, along with the missing connection or approval step. That honesty is part of the product.</p>
        </div>
        <div className={styles.demoGrid}>{[...previews, ...concepts].map((demo) => <DemoCard key={demo.slug} demo={demo} />)}</div>
      </section>

      <div className={styles.darkWrap}>
        <section className={styles.darkSection}>
          <div className={styles.sectionHeader}>
            <div><p className={styles.eyebrow}>the rule</p><h2>A demo should prove <em>one real job.</em></h2></div>
            <p>Not a feature tour. Not a promise that an integration exists. A visitor should understand the job, try it, receive a useful result and know what still needs human review.</p>
          </div>
          <div className={styles.stepGrid}>
            <article className={styles.stepCard}><CheckCircle2 aria-hidden /><h3>Useful in a minute</h3><p>Paste, choose, record or describe. The first useful action stays obvious.</p></article>
            <article className={styles.stepCard}><CheckCircle2 aria-hidden /><h3>Proof attached</h3><p>Sources, assumptions, model mode and review boundary travel with the result.</p></article>
            <article className={styles.stepCard}><CheckCircle2 aria-hidden /><h3>Made to travel</h3><p>A link, card, file or loop carries the assembl mark and a reason to pass it on.</p></article>
          </div>
        </section>
      </div>
    </div>
  );
}
