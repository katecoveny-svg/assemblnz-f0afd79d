import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Clock, MapPin } from 'lucide-react';
import { ContactForm } from '@/components/site/contact-form';
import { Eyebrow } from '@/components/site/Eyebrow';
import { PatternBackdrop } from '@/components/pattern-studio/PatternBackdrop';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Whether you are ready for a pilot or just want to understand what assembl does for your industry — we would like to hear from you.',
};

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Pattern Studio backdrop — the canonical generative layer, replacing
            the old warm ambient photo + sand gradient. Faint gold, static. */}
        <PatternBackdrop
          className="absolute inset-0"
          mode="halftone"
          colorRole="gold"
          opacity={0.3}
          speed={0.5}
          lazyMount={false}
        />
        <div className="container relative z-10 py-20 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow label="Get in touch" className="justify-center" />
            <h1 className="mt-6 font-display text-display-xl font-light">
              Let&apos;s <em className="not-italic text-[color:var(--assembl-pounamu)]">talk.</em>
            </h1>
            <p className="mt-6 text-lg text-[color:var(--text-body)]">
              Whether you are ready for a pilot or just want to understand what assembl does for
              your industry — we would like to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="relative">
        <div className="container pb-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[2fr_1fr]">
            <ContactForm />

            <aside className="space-y-6">
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

              <div className="glass-card p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                  Success message
                </p>
                <p className="mt-3 text-sm text-[color:var(--text-body)]">
                  Thank you. Kate will be in touch within one business day.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
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
    <div className="glass-card p-6">
      <div className="flex items-start gap-4">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
          style={{
            background: 'rgba(58,56,50, 0.10)',
            border: '1px solid rgba(58,56,50, 0.20)',
          }}
        >
          <Icon
            className="h-4 w-4 text-[color:var(--assembl-sage-mist)]"
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
