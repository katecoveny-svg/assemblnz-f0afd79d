import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { graph, articleNode, breadcrumbNode, personNode, SITE_URL } from '@/lib/seo/schema';
import publicStyles from '@/components/public/public-pages.module.css';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'about — built in Aotearoa for work that needs judgement',
  description:
    'assembl builds Living Sites: one confirmed Business Genome feeding your website, desk, bookings and agents. Agents prepare the work, people approve it and the proof stays attached.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'about assembl',
    description: 'Built in Aotearoa. Agents prepare the work, people decide and the proof stays attached.',
    url: `${SITE_URL}/about`,
    type: 'article',
  },
};

const ABOUT_SCHEMA = graph(
  articleNode({
    headline: 'About assembl — the Living Site company built in Aotearoa New Zealand',
    description:
      'assembl connects a business website, customer desk, bookings, drafts and specialist agents to one confirmed Business Genome, with named human review and evidence attached.',
    path: '/about',
    datePublished: '2026-07-01',
  }),
  personNode(),
  breadcrumbNode([
    { name: 'assembl', path: '/' },
    { name: 'About', path: '/about' },
  ]),
);

const BUILDING_BLOCKS = [
  {
    number: '01',
    title: 'A Business Genome',
    copy: 'Your confirmed offers, prices, rules, people and voice live once. Every approved surface reads the same facts.',
  },
  {
    number: '02',
    title: 'Agents with a job',
    copy: 'Each agent prepares one kind of work: a meeting record, customer reply, customs draft, campaign or operating brief.',
  },
  {
    number: '03',
    title: 'Evidence that travels',
    copy: 'Sources, assumptions, model mode, checks and reviewer stay attached to the result so someone else can understand it.',
  },
] as const;

export default function AboutPage() {
  return (
    <div className={publicStyles.page}>
      <JsonLd data={ABOUT_SCHEMA} />

      <section className={publicStyles.hero}>
        <div>
          <p className={publicStyles.eyebrow}>about assembl · built in Aotearoa</p>
          <h1>Work prepared.<br /><em>Judgement kept human.</em></h1>
          <p className={publicStyles.lede}>
            assembl builds Living Sites: one confirmed source of truth feeding the website, customer desk, bookings, drafts and specialist agents around a business.
          </p>
          <div className={publicStyles.actions}>
            <Link href="/genome" className={publicStyles.primary}>See the system live <ArrowRight aria-hidden size={16} /></Link>
            <Link href="/concept-studio" className={publicStyles.secondary}>Explore the Concept Studio</Link>
          </div>
        </div>
        <aside className={publicStyles.heroAside} aria-label="What assembl stands for">
          <div className={publicStyles.heroFact}><span>01</span><div><strong>One source of truth</strong><p>A fact changes once, then every approved surface reads the update.</p></div></div>
          <div className={publicStyles.heroFact}><span>02</span><div><strong>Named human review</strong><p>Agents prepare. A person checks, edits and decides what happens next.</p></div></div>
          <div className={publicStyles.heroFact}><span>03</span><div><strong>Proof with the work</strong><p>Sources and decisions remain visible after the impressive part is over.</p></div></div>
        </aside>
      </section>

      <section className={publicStyles.section}>
        <div className={publicStyles.sectionHeader}>
          <div><p className={publicStyles.eyebrow}>what we are building</p><h2>A business that can <em>stay coherent.</em></h2></div>
          <p>Most teams do not need another blank tool. They need their facts to stay aligned and the repetitive work to arrive ready for review.</p>
        </div>
        <div className={publicStyles.stepGrid}>
          {BUILDING_BLOCKS.map((item) => (
            <article key={item.number} className={publicStyles.stepCard}>
              <span className={publicStyles.number}>{item.number}</span>
              <h3>{item.title}</h3>
              <p className={publicStyles.summary}>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${publicStyles.section} ${styles.founderSection}`}>
        <div className={styles.founderGrid}>
          <div className={styles.portrait}>
            <Image
              src="/img/about/kate-hudson-portrait-tan-blazer-art.webp"
              alt="Kate Hudson, founder of assembl"
              fill
              sizes="(min-width: 900px) 420px, 92vw"
              quality={75}
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className={styles.founderCopy}>
            <p className={publicStyles.eyebrow}>from the founder</p>
            <blockquote>“I started assembl because capable people were losing too much of their week to work a system should have prepared for them.”</blockquote>
            <p>
              Kate Hudson founded assembl in Aotearoa to make useful automation easier to trust. The company is built around a simple operating boundary: the system can read, organise, compare and prepare; a person owns the decision.
            </p>
            <p>
              New Zealand law, privacy and the realities of small teams are part of the product design from the start. They are not a localisation pass added later.
            </p>
            <div className={styles.founderLinks}>
              <Link href="/trust">How trust works</Link>
              <Link href="/te-tiriti">Te Tiriti statement</Link>
              <Link href="/ai-use">Responsible use</Link>
            </div>
          </div>
        </div>
      </section>

      <div className={publicStyles.darkWrap}>
        <section className={publicStyles.darkSection}>
          <div className={publicStyles.sectionHeader}>
            <div><p className={publicStyles.eyebrow}>the operating promise</p><h2>Mahi that earns <em>its proof.</em></h2></div>
            <p>A polished result is not enough. It should be possible to see what the system used, what it assumed and who approved it.</p>
          </div>
          <div className={publicStyles.stepGrid}>
            <article className={publicStyles.stepCard}><CheckCircle2 aria-hidden /><h3>Prepare, do not pretend</h3><p>Public and pilot tools say clearly when data, integrations or outputs are simulated.</p></article>
            <article className={publicStyles.stepCard}><CheckCircle2 aria-hidden /><h3>Review before action</h3><p>No auto-send, auto-file, auto-book or auto-decide promise without a named human approval step.</p></article>
            <article className={publicStyles.stepCard}><CheckCircle2 aria-hidden /><h3>Keep the receipt</h3><p>The useful output and the record of how it was made belong together.</p></article>
          </div>
          <div className={publicStyles.actions}>
            <Link href="/pricing" className={publicStyles.primary}>See the pilot price</Link>
            <Link href="/contact" className={publicStyles.secondary}>Talk about one workflow</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
