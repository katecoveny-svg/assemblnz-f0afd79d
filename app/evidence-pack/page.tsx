import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'What’s an evidence pack?',
  description:
    'The evidence pack is the receipt for a piece of work — what was asked, the sources used, the assumptions made, what changed in review, and who signed it off. One file to keep or forward.',
};

const EXAMPLE = [
  ['The request', '“Draft a response to a guest’s nut-allergy query for Saturday’s set menu.”'],
  ['Sources used', 'your current menu, supplier allergen sheets, Food Act guidance.'],
  ['Assumptions made', 'kitchen follows its documented separation process.'],
  ['Reviewed and signed off by', '[named person], with date.'],
] as const;

export default function EvidencePackPage() {
  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="border-b border-[rgba(35,33,31,0.08)] py-24 lg:py-32">
        <div className="container">
          <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">Evidence pack</p>
          <h1 className="mt-6 max-w-4xl font-display text-display-xl font-light">What’s an evidence pack?</h1>
          <p className="mt-8 max-w-3xl text-body-lg text-[color:var(--text-body)]">
            It’s the receipt for a piece of work. When an agent drafts something and a person signs
            it off, the evidence pack records what was asked, the sources it drew on, the assumptions
            it made, what changed in review, and who approved it — with a date.
          </p>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="container grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="font-display text-display-lg font-light">Why it matters.</h2>
            <p className="mt-6 max-w-xl text-body-lg text-[color:var(--text-body)]">
              Document-heavy work gets questioned later — by a client, an auditor, a regulator, a
              parent. The evidence pack means you answer in one file, instead of reconstructing what
              happened from memory.
            </p>
            <div className="mt-10">
              <Link href="/pilot-sprint" className="cta-primary inline-flex h-12 items-center px-7">
                Book a Pilot Sprint
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>

          <div className="glass-card p-6 lg:p-8">
            <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
              What’s inside · example — a hospitality allergen response
            </p>
            <dl className="mt-6 divide-y divide-[rgba(35,33,31,0.08)]">
              {EXAMPLE.map(([label, value]) => (
                <div key={label} className="py-4">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--assembl-pounamu)]">
                    {label}
                  </dt>
                  <dd className="mt-2 text-body-md text-[color:var(--text-body)]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </main>
  );
}
