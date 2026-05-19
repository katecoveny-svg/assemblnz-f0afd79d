import Link from 'next/link';
import { ArrowRight, Eye, Plug } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { Workflow } from '@/lib/workflows';
import { getKete } from '@/lib/kete';

type WorkflowCardProps = {
  workflow: Workflow;
  compact?: boolean;
};

export function WorkflowCard({ workflow, compact = false }: WorkflowCardProps) {
  const kete = getKete(workflow.kete);

  return (
    <article
      className="group flex h-full flex-col rounded-[8px] border border-[rgba(35,33,31,0.10)] bg-white/65 p-5 shadow-[0_10px_40px_rgba(35,33,31,0.05)] backdrop-blur transition-all hover:-translate-y-1 hover:border-[color:var(--workflow-accent)] hover:bg-white hover:shadow-[0_18px_60px_rgba(35,33,31,0.10)]"
      style={{ '--workflow-accent': kete.accent } as CSSProperties}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--workflow-accent)]" aria-hidden />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
          {kete.name}
        </span>
        {!workflow.live && (
          <span className="ml-auto rounded-full border border-[rgba(35,33,31,0.10)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
            Preview
          </span>
        )}
      </div>
      <h3 className="font-display text-[28px] font-light italic leading-none text-[color:var(--text-primary)]">
        {workflow.title}
      </h3>
      <p className="mt-3 line-clamp-3 text-[14.5px] leading-relaxed text-[#2A2825]">
        {workflow.description}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px]">
        <span className="text-[color:var(--text-secondary)]">
          ~{workflow.timeSavedMin} min saved per run
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--assembl-pounamu)]">
          {workflow.priceLabel}
        </span>
      </div>
      <div className={compact ? 'mt-5 flex gap-2' : 'mt-auto flex gap-2 pt-6'}>
        <Link
          href={`/workflows/${workflow.slug}`}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-[color:var(--workflow-accent)] px-4 text-sm font-medium text-white"
        >
          <Plug className="mr-2 h-4 w-4" aria-hidden />
          Install
        </Link>
        <Link
          href={`/workflows/${workflow.slug}#preview`}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-[rgba(35,33,31,0.14)] px-4 text-sm font-medium text-[color:var(--text-primary)]"
        >
          <Eye className="mr-2 h-4 w-4" aria-hidden />
          Preview
        </Link>
      </div>
      <Link
        href={`/workflows/${workflow.slug}`}
        className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--workflow-accent)]"
      >
        View details <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </article>
  );
}
