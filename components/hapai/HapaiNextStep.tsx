import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HapaiNextStep() {
  return (
    <section className="rounded-[8px] border border-[rgba(212,168,83,0.42)] bg-white/60 p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--assembl-pounamu)]">
        Next step
      </p>
      <h2 className="mt-3 font-display text-3xl leading-none text-[color:var(--assembl-pounamu)]">
        What should your team build first?
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
        Answer three follow-up questions and HAPAI will rank three practical
        project candidates for your tier, function, and team size.
      </p>
      <Link href="/hapai/projects" className="mt-5 inline-flex items-center text-sm font-medium text-[color:var(--assembl-pounamu)]">
        Open the project picker <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
      </Link>
    </section>
  );
}
