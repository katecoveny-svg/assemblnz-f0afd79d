import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, Gauge, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "hapai project picker · assembl",
  description:
    "Answer three questions and get three ranked candidate projects for your team’s next intelligent automation build.",
  openGraph: {
    images: ["/hapai/projects/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/hapai/projects/opengraph-image"],
  },
};

const tiers = [
  ["akoranga", "akoranga · early curiosity"],
  ["kaimahi", "kaimahi · regular users"],
  ["tohunga", "tohunga · confident builders"],
  ["rangatira", "rangatira · lead-user culture"],
  ["pou", "pou · operating model"],
] as const;

const sizes = [
  ["solo", "1"],
  ["small", "2-5"],
  ["medium", "6-20"],
  ["large", "20+"],
] as const;

const functions = [
  ["ops", "Operations"],
  ["hr", "HR / people"],
  ["marketing", "Marketing"],
  ["finance", "Finance"],
  ["sales", "Sales"],
  ["support", "Customer support"],
  ["other", "Other"],
] as const;

export default function HapaiProjectsPage() {
  return (
    <main className="bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <section className="border-b border-[rgba(35,33,31,0.10)] px-6 py-16 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <header>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--assembl-pounamu)]">
              hapai · project picker
            </p>
            <h1
              className="mt-6 font-display leading-[0.9] text-[color:var(--assembl-pounamu)]"
              style={{ fontWeight: 300, fontSize: "clamp(3.4rem, 7vw, 6.6rem)" }}
            >
              Now here’s what to build first.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
              HAPAI tells you where your team sits. This picker turns that into
              three practical candidate projects, ranked for your tier, function,
              and team size.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#picker" className="cta-primary inline-flex h-12 items-center px-6">
                Pick a project <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </a>
              <Link href="/hapai" className="btn-ghost inline-flex h-12 items-center px-6">
                Back to HAPAI
              </Link>
            </div>
          </header>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <Signal icon={Gauge} title="Tier-aware" body="Akoranga gets foundations. Rangatira gets system-level builds." />
            <Signal icon={ClipboardCheck} title="Concrete recipes" body="Each result links to tools, prompts, time, and failure modes." />
            <Signal icon={Sparkles} title="No model call" body="Curated recommendations, reproducible every time." />
          </div>
        </div>
      </section>

      <section id="picker" className="px-6 py-12 lg:px-10 lg:py-16">
        <form
          action="/api/hapai/project-picker"
          method="POST"
          className="mx-auto max-w-4xl rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-5 shadow-[0_20px_70px_rgba(35,33,31,0.06)] md:p-8"
        >
          <Field label="Where did the assessment place you?">
            <select name="tier" required defaultValue="kaimahi" className="min-h-11 w-full rounded-md border border-taupe-300 bg-mist-50 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-pounamu-500">
              {tiers.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Field label="Team size">
              <select name="teamSize" required defaultValue="small" className="min-h-11 w-full rounded-md border border-taupe-300 bg-mist-50 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-pounamu-500">
                {sizes.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Primary function">
              <select name="primaryFunction" required defaultValue="ops" className="min-h-11 w-full rounded-md border border-taupe-300 bg-mist-50 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-pounamu-500">
                {functions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="What does your team spend most time on?" className="mt-6">
            <textarea
              name="focus"
              rows={5}
              maxLength={500}
              placeholder="Two plain-English sentences. e.g. We spend a lot of time turning meeting notes into actions, chasing approvals, and rewriting customer updates."
              className="min-h-11 w-full rounded-md border border-taupe-300 bg-mist-50 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-pounamu-500"
            />
          </Field>

          <button type="submit" className="mt-7 cta-primary inline-flex h-12 items-center px-7">
            Show my three projects <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
        {label}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function Signal({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Gauge;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/55 p-5">
      <Icon className="h-5 w-5 text-[color:var(--assembl-pounamu)]" aria-hidden />
      <h2 className="mt-4 font-display text-3xl leading-none text-[color:var(--assembl-pounamu)]">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">{body}</p>
    </article>
  );
}
