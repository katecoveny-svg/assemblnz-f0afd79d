import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionReveal } from '@/components/SectionReveal';

export const metadata: Metadata = {
  title: 'How assembl works',
  description:
    'Specialist agents draft it first. A person signs it off. You get a record of how it was made — the evidence pack. Here’s what that looks like.',
};

const STEPS = [
  {
    n: '1',
    title: 'Agents draft it.',
    body:
      'Bring a job your team does by hand — an RFI, an allergen report, a customs entry. The agent for that work writes the first draft in seconds, trained on your industry’s rules and your way of doing things.',
  },
  {
    n: '2',
    title: 'You review and sign off.',
    body:
      'The draft lands with a named person who accepts, edits, or rejects it. Nothing leaves your team — nothing sends, publishes, or gets lodged — without that sign-off.',
  },
  {
    n: '3',
    title: 'You get the evidence pack.',
    body:
      'Every signed output comes with its receipt: the sources used, the assumptions made, what changed in review, and who approved it. One file, dated and filed, ready when someone asks.',
  },
] as const;

export default function HowItWorksPage() {
  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="border-b border-[rgba(35,33,31,0.08)] py-24 lg:py-32">
        <div className="container">
          <SectionReveal>
            <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">How it works</p>
            <h1 className="mt-6 max-w-4xl font-display text-display-xl font-light">How assembl works.</h1>
            <p className="mt-8 max-w-2xl text-body-lg text-[color:var(--text-body)]">
              Specialist agents do the first draft. A person signs it off. You get a record of how it
              was made. Here’s what that looks like.
            </p>
          </SectionReveal>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="container grid gap-6 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <SectionReveal key={step.n} delay={index * 0.05}>
              <article className="glass-card h-full p-7">
                <p className="font-mono text-eyebrow uppercase text-[color:var(--assembl-pounamu)]">{step.n}</p>
                <h2 className="mt-5 font-display text-display-md font-light">{step.title}</h2>
                <p className="mt-5 text-body-md text-[color:var(--text-body)]">{step.body}</p>
              </article>
            </SectionReveal>
          ))}
        </div>
      </section>

      <section className="border-t border-[rgba(212,168,83,0.36)] py-20 lg:py-28">
        <div className="container">
          <SectionReveal>
            <p className="max-w-2xl text-body-lg text-[color:var(--text-body)]">
              <span className="font-medium text-[color:var(--text-primary)]">Built for NZ.</span> Each
              pack has NZ law, council and sector rules, and tikanga built in from the start.
            </p>
            <div className="mt-10">
              <Link href="/pilot-sprint" className="cta-primary inline-flex h-12 items-center px-7">
                Book a Pilot Sprint
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </main>
  );
}
