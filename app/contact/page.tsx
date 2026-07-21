import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Clock, MapPin } from 'lucide-react';
import { ContactForm } from '@/components/site/contact-form';
import publicStyles from '@/components/public/public-pages.module.css';
import styles from './contact.module.css';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Whether you are ready for a pilot or just want to understand what assembl does for your industry — we would like to hear from you.',
};

export default function ContactPage() {
  return (
    <div className={publicStyles.page}>
      <section className={`${publicStyles.hero} ${styles.hero}`}>
        <div>
            <p className={publicStyles.eyebrow}>get in touch · one useful conversation</p>
            <h1>Let&apos;s<br /><em>talk.</em></h1>
            <p className={publicStyles.lede}>
              Whether you are ready for a pilot or just want to understand what assembl does for
              your industry — we would like to hear from you.
            </p>
        </div>
        <aside className={publicStyles.heroAside} aria-label="Contact expectations">
          <div className={publicStyles.heroFact}><span>01</span><div><strong>Tell us the job</strong><p>The repeated task, decision or handoff you want to make clearer.</p></div></div>
          <div className={publicStyles.heroFact}><span>02</span><div><strong>We reply ourselves</strong><p>A person reads every enquiry and responds within one working day.</p></div></div>
          <div className={publicStyles.heroFact}><span>03</span><div><strong>No hard sell</strong><p>We will say plainly whether assembl fits the work and what the next step would be.</p></div></div>
        </aside>
      </section>

      <section className={`${publicStyles.section} ${styles.formSection}`}>
          <div className={styles.formGrid}>
            <ContactForm />

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
                  'Customer data hosted in NZ-resident regions by default.',
                ]}
              />

              <div className={styles.contactCard}>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                  Success message
                </p>
                <p className="mt-3 text-sm text-[color:var(--text-body)]">
                  Thank you. Kate will be in touch within one business day.
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
            background: '#252d31',
            border: '1px solid #252d31',
          }}
        >
          <Icon
            className="h-4 w-4 text-white"
            aria-hidden
          />
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
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
