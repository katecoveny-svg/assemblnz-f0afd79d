import type { Metadata } from "next";
import Link from "next/link";
import { SectionReveal } from "@/components/SectionReveal";

export const metadata: Metadata = {
  title: "AI Use Disclosure | assembl",
  description:
    "How assembl uses models, retrieval, human review, and audit trails in draft-only agent workflows.",
};

const commitments = [
  "No external action is sent automatically. Every material output remains draft-only until a named human reviews and approves it.",
  "No customer workflow input is used to train public foundation models.",
  "Personally identifiable information is minimised or masked before model calls where the workflow permits it.",
  "Every evidence pack records sources, assumptions, reviewer decisions, timestamps, and audit metadata.",
  "Users can see when output is grounded in live data, static policy, uploaded files, or model reasoning.",
];

export default function AIUseDisclosurePage() {
  return (
    <main className="bg-[color:var(--assembl-paper)]">
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-4xl">
          <SectionReveal>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
              Compliance · Model Use
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-[clamp(3rem,7vw,6rem)] font-light leading-[0.92] text-[color:var(--text-primary)]">
              AI use, plainly.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[color:var(--text-secondary)]">
              assembl uses language models as drafting and retrieval tools. The
              product promise is not autonomy. It is a better first pass, grounded
              in sources, reviewed by people, and sealed with proof.
            </p>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {commitments.map((item) => (
                <div
                  key={item}
                  className="border border-[rgba(157,140,125,0.22)] bg-[rgba(255,255,255,0.45)] p-5"
                >
                  <p className="text-sm leading-7 text-[color:var(--text-secondary)]">{item}</p>
                </div>
              ))}
            </div>
          </SectionReveal>

          <div className="mt-14 grid gap-10 md:grid-cols-2">
            <SectionReveal delay={0.15}>
              <h2 className="font-display text-2xl font-light italic md:text-3xl">Models we may call</h2>
              <p className="mt-3 text-base leading-8 text-[color:var(--text-secondary)]">
                Current production workflows may call Claude Sonnet 4.6, Gemini 2.5
                Flash, Gemini embedding models, OpenAI models where configured, or
                deterministic retrieval and scoring code. Model choice depends on
                task risk, latency, and whether citations are required.
              </p>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <h2 className="font-display text-2xl font-light italic md:text-3xl">The four pou</h2>
              <p className="mt-3 text-base leading-8 text-[color:var(--text-secondary)]">
                Rangatiratanga means people keep agency. Kaitiakitanga means data is
                cared for. Manaakitanga means tools are useful without being pushy.
                Whanaungatanga means handoffs are visible and accountable.
              </p>
            </SectionReveal>
            <SectionReveal delay={0.25}>
              <h2 className="font-display text-2xl font-light italic md:text-3xl">What we do not do</h2>
              <p className="mt-3 text-base leading-8 text-[color:var(--text-secondary)]">
                assembl does not make final legal, financial, employment, health, or
                entitlement decisions. It does not auto-send messages, auto-file
                documents, or replace professional judgement. It prepares drafts for
                review and records the reasoning trail.
              </p>
            </SectionReveal>
            <SectionReveal delay={0.3}>
              <h2 className="font-display text-2xl font-light italic md:text-3xl">Public-sector posture</h2>
              <p className="mt-3 text-base leading-8 text-[color:var(--text-secondary)]">
                Our AI use is shaped by New Zealand public-service expectations for
                safe, transparent, and responsible use of generative AI. We design
                for review, source visibility, record keeping, and clear user
                accountability.
              </p>
            </SectionReveal>
          </div>

          <SectionReveal delay={0.35}>
            <p className="mt-12 text-sm leading-7 text-[color:var(--text-secondary)]">
              Reference:{" "}
              <a
                className="underline-offset-2 hover:underline"
                href="https://www.digital.govt.nz/standards-and-guidance/technology-and-architecture/artificial-intelligence"
                rel="noreferrer"
                target="_blank"
              >
                New Zealand Digital Government guidance on artificial intelligence
              </a>
              . Related: <Link className="underline-offset-2 hover:underline" href="/privacy">Privacy Statement</Link>.
            </p>
          </SectionReveal>
        </div>
      </section>
    </main>
  );
}
