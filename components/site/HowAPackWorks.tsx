import { SectionReveal } from '@/components/SectionReveal';
import { Eyebrow } from '@/components/site/Eyebrow';
import { KeteDefinition } from '@/components/site/KeteDefinition';

/**
 * "How a pack works in your business" — Kate's verbatim 3-step section.
 * Used on /pricing and /how-it-works. Copy is exact; do not reword.
 *
 * `defineKete` wraps the first "kete" mention in <KeteDefinition /> so the page
 * gets exactly one first-mention definition. Set it false if the host page has
 * already introduced "kete" higher up.
 */
const STEPS = [
  {
    when: 'Day 1',
    title: 'Install.',
    body: (defineKete: boolean) => (
      <>
        A shareable link or one line of code. Your team opens the workflow they need from the{' '}
        {defineKete ? <KeteDefinition /> : 'kete'}. No training week.
      </>
    ),
  },
  {
    when: 'Daily',
    title: 'Run.',
    body: () => (
      <>
        Someone drafts a job (RFI, allergen report, customs entry, board minutes). The agent does the
        first pass. Your named reviewer signs it off. It goes out.
      </>
    ),
  },
  {
    when: 'Quarterly',
    title: 'Show.',
    body: () => (
      <>
        Every output sealed in an evidence pack. File it. Forward to your auditor. Footnote for the
        board.
      </>
    ),
  },
] as const;

export function HowAPackWorks({ defineKete = true }: { defineKete?: boolean }) {
  return (
    <section className="border-y border-[rgba(35,33,31,0.08)] bg-[rgba(43,107,87,0.03)] py-20 lg:py-28">
      <div className="container">
        <SectionReveal>
          <Eyebrow label="How a pack works in your business" accent="var(--assembl-pounamu)" />
          <h2 className="mt-6 max-w-3xl font-display text-display-lg font-light">
            Install once. Run every day. <em className="text-[color:var(--assembl-pounamu)]">Show the proof.</em>
          </h2>
        </SectionReveal>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <SectionReveal key={step.when} delay={index * 0.05}>
              <article className="glass-card h-full p-7">
                <p className="font-mono text-eyebrow uppercase text-[color:var(--assembl-pounamu)]">
                  {step.when} — {step.title}
                </p>
                <p className="mt-5 text-body-md text-[color:var(--text-body)]">
                  {step.body(defineKete && index === 0)}
                </p>
              </article>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
