import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionReveal } from '@/components/SectionReveal';
import { ShaderHeroBackdrop } from '@/components/site/ShaderHeroBackdrop';

export const metadata: Metadata = {
  title: 'Pilot Sprint',
  description:
    'Bring one real, messy workflow. In ten working days we turn it into draft-ready output with the evidence pack attached — on your data, not a demo. $5,000 + GST.',
};

const HOW_IT_RUNS = [
  'We pick one workflow with you — something your team does often, by hand.',
  'We build the agent for it, wired to your rules and your sources.',
  'You get draft-ready outputs, the evidence pack, and a clear read on the hours it saves.',
] as const;

export default function PilotSprintPage() {
  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="relative overflow-hidden border-b border-[rgba(35,33,31,0.08)] bg-[radial-gradient(120%_90%_at_30%_28%,#f7f0e3_0%,#ece3d2_52%,#ddd2bd_100%)] py-28 lg:py-36">
        <ShaderHeroBackdrop />
        <div className="container relative z-10">
          <SectionReveal>
            <p className="font-mono text-eyebrow uppercase text-[color:var(--assembl-pounamu)]">Pilot Sprint</p>
            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.75rem,7vw,5.5rem)] font-light leading-[0.92] tracking-[-0.03em]">
              See assembl on <em className="not-italic text-[color:var(--assembl-pounamu)]">your own work.</em>
            </h1>
            <p className="mt-8 max-w-2xl text-body-lg text-[color:var(--text-body)]">
              Bring one real, messy workflow. In ten working days we turn it into draft-ready output
              with the evidence pack attached — on your data, not a demo.
            </p>
          </SectionReveal>
        </div>
      </section>

      <section className="py-24 lg:py-32">
        <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <SectionReveal>
            <h2 className="font-display text-display-lg font-light">How it runs</h2>
          </SectionReveal>
          <SectionReveal delay={0.05}>
            <ol className="grid gap-4">
              {HOW_IT_RUNS.map((step, index) => (
                <li
                  key={step}
                  className="flex gap-5 rounded-[8px] border border-[rgba(35,33,31,0.12)] bg-white/55 p-6"
                >
                  <span className="font-mono text-eyebrow uppercase text-[color:var(--assembl-pounamu)]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="text-body-lg text-[color:var(--text-body)]">{step}</p>
                </li>
              ))}
            </ol>
          </SectionReveal>
        </div>
      </section>

      <section className="border-t border-[rgba(212,168,83,0.36)] py-20 lg:py-28">
        <div className="container">
          <SectionReveal>
            <p className="font-display text-display-md font-light">$5,000 + GST · ten working days.</p>
            <div className="mt-10">
              <Link href="/contact" className="cta-primary inline-flex h-12 items-center px-7">
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
