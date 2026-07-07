import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, DollarSign } from "lucide-react";
import { annualRoiNzd, findProject } from "@/lib/hapai/project-recommender";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);
  return {
    title: project ? `${project.title} recipe · hapai · assembl` : "hapai recipe · assembl",
    description: project?.summary ?? "A one-page SPARK project recipe.",
  };
}

function fmtNzd(value: number): string {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function HapaiRecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();

  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="border-b border-[rgba(35,33,31,0.10)] px-6 py-14 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <Link href="/hapai/projects" className="inline-flex items-center text-sm text-[color:var(--assembl-pounamu)]">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            Back to project picker
          </Link>
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--assembl-pounamu)]">
            hapai · one-page recipe
          </p>
          <h1
            className="mt-5 font-display leading-[0.9] text-[color:var(--assembl-pounamu)]"
            style={{ fontWeight: 300, fontSize: "clamp(3rem, 7vw, 6rem)" }}
          >
            {project.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
            {project.summary}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Pill icon={Clock} label={`${project.effortHours} build hours`} />
            <Pill icon={DollarSign} label={`${fmtNzd(annualRoiNzd(project))} annual value`} />
          </div>
        </div>
      </section>

      <section className="px-6 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.72fr_1fr]">
          <aside className="space-y-4">
            <RecipeCard title="Tools required" items={project.tools} />
            <RecipeCard title="Common failure modes" items={project.failureModes} />
          </aside>

          <article className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-6 md:p-8">
            <h2 className="font-display text-4xl text-[color:var(--assembl-pounamu)]">
              How to build it.
            </h2>
            <ol className="mt-6 space-y-5 text-sm leading-relaxed text-[color:var(--text-body)]">
              <li>
                <strong>1. Pick one real workflow.</strong> Use a live example
                from this week. Do not design for every possible edge case on
                day one.
              </li>
              <li>
                <strong>2. Lock the input and output.</strong> Write down what
                the user gives the tool and what a good result looks like.
              </li>
              <li>
                <strong>3. Draft the first prompt or form.</strong> Use the copy
                below as a starting point, then test against three real examples.
              </li>
              <li>
                <strong>4. Add human review.</strong> Name the person who checks
                the output before it leaves the team.
              </li>
              <li>
                <strong>5. Measure time back.</strong> Compare the old process
                against three runs of the new one. Keep the proof.
              </li>
            </ol>

            <h3 className="mt-8 font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--assembl-pounamu)]">
              Prompt to copy
            </h3>
            <div className="mt-3 space-y-3">
              {project.prompts.map((prompt) => (
                <pre
                  key={prompt}
                  className="whitespace-pre-wrap rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-mist-50 p-4 text-sm leading-relaxed text-[color:var(--text-primary)]"
                >
                  {prompt}
                </pre>
              ))}
            </div>

            <div className="mt-8 rounded-[8px] bg-pounamu-50 p-5 text-sm leading-relaxed text-[color:var(--text-body)]">
              <strong className="text-pounamu-900">Build hint:</strong>{" "}
              {project.buildHint}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/pilot-sprint" className="cta-primary inline-flex h-12 items-center px-6">
                Build with assembl
              </Link>
              <Link href="/hapai/projects" className="btn-ghost inline-flex h-12 items-center px-6">
                Pick another project
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

function Pill({ icon: Icon, label }: { icon: typeof Clock; label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[rgba(35,33,31,0.12)] bg-white/55 px-4 py-2 text-sm">
      <Icon className="mr-2 h-4 w-4 text-[color:var(--assembl-pounamu)]" aria-hidden />
      {label}
    </span>
  );
}

function RecipeCard({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/55 p-5">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--assembl-pounamu)]">
        {title}
      </h2>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[color:var(--text-body)]">
        {items.map((item) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>
    </section>
  );
}
