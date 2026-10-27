import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { ContactForm } from '@/components/site/contact-form';
import { initialProjectTopic } from '@/lib/contact/email-draft';
import styles from './contact.module.css';

export const metadata: Metadata = {
  title: { absolute: 'Contact assembl | Discuss your project' },
  description: 'Bring assembl a brief for strategy, design, software or customer experiences. Agree the outcome and the first useful piece of work.',
  alternates: { canonical: '/contact' },
  openGraph: { title: 'Contact assembl | Discuss your project', description: 'Start with a brief, an opportunity or a piece of work that could be better.', url: 'https://www.assembl.co.nz/contact', type: 'website', locale: 'en_NZ', siteName: 'assembl' },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const { product } = await searchParams;
  return <div className={styles.page}>
    <section className={styles.hero} aria-labelledby="contact-title">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>A conversation is a good start.</p>
        <h1 id="contact-title">Bring us<br />the <span>work.</span></h1>
        <p className={styles.lede}>A brief. A possibility. Something that could work better. Let’s find the first useful thing to make.</p>
        <a className={styles.primary} href="#project-brief">Tell us about it <ArrowDown size={18} aria-hidden="true" /></a>
        <p className={styles.quiet}>No finished brief needed.</p>
      </div>
      <figure className={styles.coast}>
        <Image src="/direction-4c/assets/footage/coast-gen-c-poster.jpg" alt="" fill priority sizes="(max-width: 760px) 100vw, 43vw" />
        <figcaption><span>Some assembly required.</span><p>Good work starts with<br />a little shared context.</p></figcaption>
      </figure>
    </section>
    <section className={styles.briefSection} aria-labelledby="brief-title">
      <aside className={styles.briefIntro}>
        <p className={styles.eyebrow}>Your starting point</p>
        <h2 id="brief-title">A few words.<br />A clearer next step.</h2>
        <p>Tell us what matters. We’ll discuss the outcome, the scope and what to make first.</p>
        <ol className={styles.steps} aria-label="How to get in touch">
          <li><span>01</span><div><strong>Sketch the work</strong><p>Choose a starting point and add a few sentences.</p></div></li>
          <li><span>02</span><div><strong>Review your draft</strong><p>See exactly what you’re about to share.</p></div></li>
          <li><span>03</span><div><strong>Send from your email</strong><p>Your email app opens. You decide when to send.</p></div></li>
        </ol>
        <div className={styles.direct}><p>Prefer to start directly?</p><a href="mailto:assembl@assembl.co.nz">assembl@assembl.co.nz <ArrowUpRight size={16} aria-hidden="true" /></a><span>Based in Aotearoa New Zealand.</span></div>
      </aside>
      <ContactForm initialInterest={initialProjectTopic(product)} />
    </section>
    <section className={styles.explore} aria-labelledby="explore-title"><div><p className={styles.eyebrow}>Still shaping the idea?</p><h2 id="explore-title">See what a possibility can look like.</h2></div><Link href="/lab">Explore Lab <ArrowUpRight size={20} aria-hidden="true" /></Link></section>
  </div>;
}
