import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { GlowDoWidget } from '@/components/site/assembl-the-work/GlowDoWidget';
import styles from '@/components/public/public-pages.module.css';
import company from '@/components/public/company-pages.module.css';

export const metadata: Metadata = {
  title: 'About assembl',
  description: 'Pursuit finds the work. DO does the work. Studio shows the possibility. The shared Factory keeps context, tools, permissions and proof together.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return <div className={`${styles.page} ${company.page}`}>
    <GlowDoWidget />
    <section className={styles.hero}>
      <div><p className={styles.eyebrow}>assembl / Aotearoa New Zealand</p><h1>assembl<br />the work.</h1><p className={styles.lede}>Find worthwhile work. Bring together the agents, tools and context to do it. Make the result visible enough to review, approve or experience.</p></div>
      <aside className={styles.heroAside} aria-label="Three connected products">
        {[['Pursuit', 'Find evidence-backed opportunities and prepare the next step.', 'https://assembl-pursuit.katecoveny.chatgpt.site', true], ['DO', 'Meeting notes and a generic Household chores board — drafts only.', '/do', false], ['Studio', 'Turn the possibility into a demonstrator, website, pitch, film or experience.', '/creative-studio', false]].map(([name, text, href, external], i) => <div className={styles.heroFact} key={name as string}><span>0{i + 1}</span><div><strong>{external ? <a href={href as string} target="_blank" rel="noopener noreferrer">{name as string} <ArrowUpRight size={16} aria-hidden="true" /></a> : <Link href={href as string}>{name as string} <ArrowUpRight size={16} aria-hidden="true" /></Link>}</strong><p>{text as string}</p></div></div>)}
      </aside>
    </section>
    <section className={styles.section}>
      <p className={styles.eyebrow}>The shared Factory</p>
      <h2>Build once. Keep the useful parts.</h2>
      <p className={styles.lede}>The Factory provides reusable context, agents, tools, permissions, design, tests and proof beneath Pursuit, DO and Studio. Evidence and learning from each job improve the next one.</p>
      <p>Use one. Connect two. Run the whole loop.</p>
      <p>Customer journeys, productive waits, rewards and sponsorship are capabilities inside this system. They are used where they improve the work, not added to every task.</p>
      <p>Preparation is labelled as preparation. A preview is not a live integration. Consequential actions require the appropriate authority, and completed actions need evidence.</p>
      <Link href="/contact?product=system">Talk about your work <ArrowUpRight size={18} aria-hidden="true" /></Link>
    </section>
  </div>;
}
