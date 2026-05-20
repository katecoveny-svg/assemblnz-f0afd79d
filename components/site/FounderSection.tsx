import { TeReo } from './TeReo';

export function FounderSection() {
  return (
    <section className="bg-[color:var(--assembl-paper)] py-24 md:py-32">
      <article className="mx-auto max-w-[70ch] px-6 md:px-12">
        <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
          assembl · founder note
        </p>
        <h2 className="mt-6 font-display text-display-md font-light">
          Why I&apos;m building assembl in Aotearoa.
        </h2>
        <div className="mt-8 space-y-6 text-body-lg leading-[1.7] text-[color:var(--text-body)]">
          {/* TODO(Kate): Replace this placeholder with the final first-person founder note. Keep it plain, specific, and around 400 words. */}
          <p>
            I am building assembl in Aotearoa because small operators deserve tools that understand the rules, the place, and the human cost of getting compliance wrong. The work is not abstract here. It is the building consent that lets a crew keep moving, the licence renewal that keeps a venue open, the customs entry that keeps stock from sitting at the port, the family routine that lets a week feel less brittle.
          </p>
          <p>
            I do not want assembl to perform intelligence as theatre. I want it to return time and leave proof. Every specialist agent has to show its working. Every consequential draft has to be reviewed by a named person. Every workflow has to end with an evidence pack that can be filed, forwarded, or questioned later without asking someone to reconstruct the trail from memory.
          </p>
          <p>
            Building this in Aotearoa matters. <TeReo title="guardianship">Kaitiakitanga</TeReo>, <TeReo title="authority">mana</TeReo>, Te Tiriti, privacy, and practical operator trust are not decorative words to me. They are constraints on how the product should behave when the work is messy and the stakes are real.
          </p>
        </div>
        <p className="mt-10 font-display text-xl italic tracking-[0.08em] text-[color:var(--text-primary)]">
          — Kate Hudson, founder, assembl
        </p>
      </article>
    </section>
  );
}
