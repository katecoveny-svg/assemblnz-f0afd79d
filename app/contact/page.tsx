import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Clock, MapPin } from 'lucide-react';
import { ContactForm } from '@/components/site/contact-form';
import publicStyles from '@/components/public/public-pages.module.css';
import styles from './contact.module.css';
import company from '@/components/public/company-pages.module.css';

export const metadata: Metadata = {
  title: { absolute: "Contact assembl | Discuss your project" },
  description: "Bring assembl a brief for strategy, design, software or customer experiences. Agree the outcome and the first useful piece of work.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact assembl | Discuss your project", description: "Bring assembl a brief for strategy, design, software or customer experiences. Agree the outcome and the first useful piece of work.", url: "https://www.assembl.co.nz/contact", type: 'website', locale: 'en_NZ', siteName: 'assembl' },
  twitter: { card: 'summary_large_image', title: "Contact assembl | Discuss your project", description: "Bring assembl a brief for strategy, design, software or customer experiences. Agree the outcome and the first useful piece of work." },
};

export default async function ContactPage({searchParams}:{searchParams:Promise<{product?:string}>}) {
  const {product} = await searchParams;
  const interest = ["pursuit","do","studio","system"].includes(product || "") ? product : "";
  return (
    <div className={`${publicStyles.page} ${company.page}`}>
      <section className={`${publicStyles.hero} ${styles.hero}`}>
        <div>
            <p className={publicStyles.eyebrow}>Your project</p>
            <h1>What would you<br /><em>like to make?</em></h1>
            <p className={publicStyles.lede}>
              Tell us what you’re working on and where you need help. We bring strategy, design and AI together to find opportunities, create better customer experiences and get useful work done.
            </p>
        </div>
        <aside className={publicStyles.heroAside} aria-label="Contact expectations">
          <div className={publicStyles.heroFact}><span>01</span><div><strong>Start with the project</strong><p>A business opportunity, customer experience, website, product or idea.</p></div></div>
          <div className={publicStyles.heroFact}><span>02</span><div><strong>Bring what you have</strong><p>A few sentences are enough. Add a brief or link if it helps.</p></div></div>
          <div className={publicStyles.heroFact}><span>03</span><div><strong>Work out the next step</strong><p>We’ll discuss the outcome, scope and what to make first.</p></div></div>
        </aside>
      </section>

      <section className={`${publicStyles.section} ${styles.formSection}`}>
          <div className={styles.formGrid}>
            <ContactForm initialInterest={interest} />

            <aside className={styles.contactRail}>
              <ContactCard
                icon={Mail}
                title="Email"
                lines={[
                  <Link
                    key="email"
                    href="mailto:assembl@assembl.co.nz"
                    className="text-[color:var(--text-primary)] underline-offset-4 hover:underline"
                  >
                    assembl@assembl.co.nz
                  </Link>,
                  'We read every message ourselves.',
                ]}
              />
              <ContactCard
                icon={Clock}
                title="Response time"
                lines={[
                  'One working day, NZ time.',
                  'Mon–Fri, 9am–5pm. Pacific public holidays observed.',
                ]}
              />
              <ContactCard
                icon={MapPin}
                title="Where we are"
                lines={[
                  'Aotearoa New Zealand.',
                  'Data handling and hosting are agreed for each engagement.',
                ]}
              />

              <div className={styles.contactCard}>
                <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                  Your email draft
                </p>
                <p className="mt-3 text-sm text-[color:var(--text-body)]">
                  The form opens your email app. Review the draft and press Send to contact assembl.
                </p>
              </div>
            </aside>
          </div>
      </section>
    </div>
  );
}

function ContactCard({
  icon: Icon,
  title,
  lines,
}: {
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  title: string;
  lines: React.ReactNode[];
}) {
  return (
    <div className={styles.contactCard}>
      <div className="flex items-start gap-4">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center"
          style={{
            background: '#240B21',
            border: '1px solid #240B21',
          }}
        >
          <Icon
            className="h-4 w-4 text-white"
            aria-hidden
          />
        </div>
        <div>
          <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
            {title}
          </p>
          <div className="mt-2 space-y-1 text-sm text-[color:var(--text-body)]">
            {lines.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
