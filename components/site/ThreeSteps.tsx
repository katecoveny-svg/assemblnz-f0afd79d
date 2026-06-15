import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    title: 'Pick the workflow.',
    body: 'Open the kete that matches your industry. Browse the pre-made workflows. RFIs, allergen reports, customs entries, school notices, variation packs - every one is a job your team is already doing manually today.',
  },
  {
    number: '02',
    title: 'Install it.',
    body: 'A shareable link. A single line of code to embed. Or open it standalone in your assembl workspace. No platform to learn. No training week.',
  },
  {
    number: '03',
    title: 'Your team reviews and signs off.',
    body: 'The agent drafts. A named person on your team accepts, edits, or rejects. The signed-off result is sealed with the trail of how it was made. Filed, dated, ready when someone asks.',
  },
] as const;

export function ThreeSteps() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="max-w-4xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
          HOW IT WORKS
        </p>
        <h2 className="mt-4 font-display text-[clamp(3rem,7vw,5.8rem)] font-normal leading-tight">
          Three steps to a working agent on your team.
        </h2>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {STEPS.map((step) => (
          <article
            key={step.number}
            className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-6 backdrop-blur"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
              {step.number}
            </p>
            <h3 className="mt-5 font-display text-4xl font-light leading-none">
              {step.title}
            </h3>
            <p className="mt-5 text-sm leading-relaxed text-[color:var(--text-body)]">
              {step.body}
            </p>
          </article>
        ))}
      </div>
      <Link
        href="/workflows"
        className="mt-8 inline-flex h-12 items-center rounded-full bg-[color:var(--assembl-pounamu)] px-6 font-medium text-[#FAF7F2]"
      >
        Browse the marketplace <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}
