import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { GlowDoWidget } from '@/components/site/assembl-the-work/GlowDoWidget';
import styles from '@/components/public/public-pages.module.css';
import company from '@/components/public/company-pages.module.css';

export const metadata: Metadata = {
  title: { absolute: "About assembl | Intelligence, strategy and software" },
  description: "Business intelligence, strategy and software from assembl in Aotearoa New Zealand. Research opportunities, prepare useful work and develop customer experiences.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About assembl | Intelligence, strategy and software", description: "Business intelligence, strategy and software from assembl in Aotearoa New Zealand. Research opportunities, prepare useful work and develop customer experiences.", url: "https://www.assembl.co.nz/about", type: 'website', locale: 'en_NZ', siteName: 'assembl' },
  twitter: { card: 'summary_large_image', title: "About assembl | Intelligence, strategy and software", description: "Business intelligence, strategy and software from assembl in Aotearoa New Zealand. Research opportunities, prepare useful work and develop customer experiences." },
};

const products = [
  {
    name: 'Pursuit',
    text: 'Find evidence-backed opportunities, understand why they matter and prepare the next move.',
    href: '/pursuit',
  },
  {
    name: 'DO',
    text: 'Bring the right agent, context, tools and permissions to bounded work, with approvals and evidence kept visible.',
    href: '/do',
  },
  {
    name: 'Studio',
    text: 'Turn the opportunity or completed work into a demonstrator, website, pitch, campaign, film or experience.',
    href: '/creative-studio',
  },
] as const;

export default function AboutPage() {
  return <div className={`${styles.page} ${company.page}`}>
    <GlowDoWidget />
    <section className={styles.hero}>
      <div>
        <p className={styles.eyebrow}>assembl / Aotearoa New Zealand</p>
        <h1>Good thinking.<br />Useful work.</h1>
        <p className={styles.lede}>assembl brings business intelligence, strategy and software together. Specialist agents help research, draft and build. People review important decisions and approve consequential actions.</p>
      </div>
      <aside className={styles.heroAside} aria-label="Three connected products">
        {products.map((product, i) => (
          <div className={styles.heroFact} key={product.name}>
            <span>0{i + 1}</span>
            <div>
              <strong>
                <Link href={product.href}>{product.name} <ArrowUpRight size={16} aria-hidden="true" /></Link>
              </strong>
              <p>{product.text}</p>
            </div>
          </div>
        ))}
      </aside>
    </section>

    <section className={styles.section}>
      <p className={styles.eyebrow}>One connected system</p>
      <h2>Agree the outcome.<br />Assemble the work.</h2>
      <p className={styles.lede}>Pursuit finds what is worth doing. DO moves the work forward. Studio makes the result tangible. The shared operating layer keeps context, tools, permissions, evidence and learning connected underneath.</p>
      <p>Commission a customer journey map, service blueprint, CX, UX or UI design, business case, strategic recommendation, working software, demo, proposal or pitch. Agree the scope and the first useful result.</p>
      <p>Customer journeys, useful waits, loyalty, rewards and sponsorship are capabilities inside this system. They belong where they improve the outcome, not as the definition of the company.</p>
      <p>Preparation is labelled as preparation. A preview is not a live integration. Consequential actions require the appropriate authority, and completed actions should leave evidence.</p>
      <Link href="/contact?product=system">Talk about your work <ArrowUpRight size={18} aria-hidden="true" /></Link>
    </section>
  </div>;
}
