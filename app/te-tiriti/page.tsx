import type { Metadata } from "next";
import Link from "next/link";
import { SectionReveal } from "@/components/SectionReveal";

export const metadata: Metadata = {
  title: "Te Tiriti Statement | assembl",
  description:
    "assembl's Te Tiriti o Waitangi commitment and product decision posture.",
};

const pou = [
  {
    name: "Rangatiratanga",
    text:
      "People and communities should retain control over decisions that affect them. assembl agents draft; named humans decide.",
  },
  {
    name: "Kaitiakitanga",
    text:
      "Data, evidence, and cultural knowledge are treated as taonga requiring care, stewardship, and clear permission boundaries.",
  },
  {
    name: "Manaakitanga",
    text:
      "Tools should reduce burden without creating hidden pressure. We design for usefulness, dignity, and respectful handoff.",
  },
  {
    name: "Whanaungatanga",
    text:
      "Workflows should make relationships visible: who asked, who reviewed, who signs, who is affected, and who needs to be told.",
  },
];

export default function TeTiritiPage() {
  return (
    <main className="bg-[color:var(--assembl-paper)]">
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-4xl">
          <SectionReveal>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
              Compliance · Te Tiriti
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-[clamp(3rem,7vw,6rem)] font-light leading-[0.92] text-[color:var(--text-primary)]">
              Te Tiriti statement.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[color:var(--text-secondary)]">
              assembl is built in Aotearoa. We treat Te Tiriti o Waitangi as a
              product responsibility, not a decorative line in the footer.
            </p>
          </SectionReveal>

          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {pou.map((item, index) => (
              <SectionReveal key={item.name} delay={0.06 * index}>
                <article className="h-full border border-[rgba(157,140,125,0.22)] bg-[rgba(255,255,255,0.45)] p-6">
                  <h2 className="font-display text-2xl font-light italic text-[color:var(--text-primary)]">
                    {item.name}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">{item.text}</p>
                </article>
              </SectionReveal>
            ))}
          </div>

          <SectionReveal delay={0.3}>
            <div className="mt-12 space-y-8 text-base leading-8 text-[color:var(--text-secondary)]">
              <section>
                <h2 className="font-display text-2xl font-light italic text-[color:var(--text-primary)] md:text-3xl">
                  Product gates
                </h2>
                <p className="mt-3">
                  We will not ship iwi-co-authored or Māori-public-sector specific
                  surfaces without the right conversations, permissions, and review
                  relationships. Public Assembly remains pilot-preview only until
                  the Māori-elder and iwi sponsorship gate has happened.
                </p>
              </section>
              <section>
                <h2 className="font-display text-2xl font-light italic text-[color:var(--text-primary)] md:text-3xl">
                  MEADS-alignment posture
                </h2>
                <p className="mt-3">
                  assembl is not claiming formal MEADS certification. Our current
                  posture is alignment-by-design: data minimisation, source
                  visibility, human approval, clear governance, and cultural review
                  before sensitive product surfaces are promoted.
                </p>
              </section>
              <section>
                <h2 className="font-display text-2xl font-light italic text-[color:var(--text-primary)] md:text-3xl">
                  Truth before polish
                </h2>
                <p className="mt-3">
                  We will say what is live, what is pilot-ready, and what still
                  needs review. Where a tool touches whakapapa, whānau, tamariki,
                  iwi relationships, welfare, justice, or health, the care bar is
                  higher.
                </p>
              </section>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.4}>
            <p className="mt-12 text-sm leading-7 text-[color:var(--text-secondary)]">
              Reference:{" "}
              <a
                className="underline-offset-2 hover:underline"
                href="https://www.justice.govt.nz/about/learn-about-the-justice-system/how-the-justice-system-works/the-basis-for-all-law/treaty-of-waitangi/"
                rel="noreferrer"
                target="_blank"
              >
                Ministry of Justice overview of Te Tiriti o Waitangi
              </a>
              . Related: <Link className="underline-offset-2 hover:underline" href="/ai-use">AI use disclosure</Link>.
            </p>
          </SectionReveal>
        </div>
      </section>
    </main>
  );
}
