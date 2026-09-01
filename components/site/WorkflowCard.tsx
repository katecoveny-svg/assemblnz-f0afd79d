import Link from 'next/link';
import { Eye, Play } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { Workflow } from '@/lib/workflows';
import { getKete } from '@/lib/kete';

type WorkflowCardProps = {
  workflow: Workflow;
  compact?: boolean;
};

export function WorkflowCard({ workflow, compact = false }: WorkflowCardProps) {
  const kete = getKete(workflow.kete);
  const style = {
    '--workflow-accent': kete.accent,
    background:
      'radial-gradient(circle at 16% 0%, color-mix(in srgb, var(--workflow-accent) 14%, transparent), transparent 38%), linear-gradient(145deg, rgba(255,255,255,0.78), rgba(250,247,242,0.58) 48%, rgba(255,255,255,0.62))',
  } as CSSProperties;

  return (
    <article
      className="group relative flex h-full min-h-[330px] flex-col overflow-hidden rounded-[18px] border border-white/70 p-6 shadow-[0_18px_70px_rgba(35,33,31,0.07)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white hover:shadow-[0_28px_100px_rgba(35,33,31,0.11)] focus-within:-translate-y-1 focus-within:border-white focus-within:shadow-[0_28px_100px_rgba(35,33,31,0.11)] active:translate-y-0"
      style={style}
    >
      <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" aria-hidden />
      <span className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-white/30 blur-3xl" aria-hidden />

      <div className="relative mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--workflow-accent)] shadow-[0_0_18px_rgba(58,56,50,0.22)]" aria-hidden />
          <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
            {kete.name} · {kete.englishName}
          </span>
        </div>
        <span className="rounded-full border border-white/68 bg-white/48 px-2.5 py-1 font-mono text-[12px] uppercase tracking-[0.13em] text-[color:var(--text-secondary)] shadow-sm backdrop-blur-md">
          {workflow.live ? 'live' : 'preview'}
        </span>
      </div>
      <h3 className="relative font-display text-[clamp(2rem,4vw,2.65rem)] font-light leading-[0.98] text-[color:var(--text-primary)]">
        {workflow.title}
      </h3>
      <p className="relative mt-4 line-clamp-3 text-[15px] leading-relaxed text-[#2A2825]">
        {workflow.description}
      </p>
      <div className="relative mt-5 flex flex-wrap items-center gap-2 text-[12.5px]">
        <span className="rounded-full border border-white/64 bg-white/42 px-3 py-1 font-mono text-[12px] uppercase tracking-[0.12em] text-[color:var(--workflow-accent)] backdrop-blur-md">
          {workflow.priceLabel === 'Industry Pack' ? 'Kete pack' : workflow.priceLabel}
        </span>
      </div>
      <div className={compact ? 'relative mt-6 grid gap-2 sm:grid-cols-2' : 'relative mt-auto grid gap-2 pt-7 sm:grid-cols-2'}>
        <Link
          href={`/workflows/${workflow.slug}`}
          aria-label={`Open workflow ${workflow.title}`}
          title={`Open workflow ${workflow.title}`}
          className="group/btn inline-flex h-11 items-center justify-center rounded-full border border-[rgba(255,255,255,0.70)] bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(232,239,233,0.62))] px-4 text-sm font-medium text-[#23211F] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_14px_36px_rgba(35,33,31,0.08)] transition hover:border-[color:var(--workflow-accent)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.94),0_18px_48px_rgba(58,56,50,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 active:scale-[0.98] active:translate-y-0"
        >
          <Play className="h-4 w-4" aria-hidden />
          <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover/btn:ml-2 group-hover/btn:max-w-[8rem] group-hover/btn:opacity-100 group-focus-visible/btn:ml-2 group-focus-visible/btn:max-w-[8rem] group-focus-visible/btn:opacity-100">Open workflow</span>
        </Link>
        <Link
          href={`/workflows/${workflow.slug}#preview`}
          aria-label={`Preview ${workflow.title}`}
          title={`Preview ${workflow.title}`}
          className="group/btn inline-flex h-11 items-center justify-center rounded-full border border-[rgba(35,33,31,0.12)] bg-white/38 px-4 text-sm font-medium text-[color:var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-md transition hover:border-[color:var(--workflow-accent)] hover:bg-white/58 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 active:scale-[0.98] active:translate-y-0"
        >
          <Eye className="h-4 w-4" aria-hidden />
          <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover/btn:ml-2 group-hover/btn:max-w-[8rem] group-hover/btn:opacity-100 group-focus-visible/btn:ml-2 group-focus-visible/btn:max-w-[8rem] group-focus-visible/btn:opacity-100">Preview sample</span>
        </Link>
      </div>
    </article>
  );
}
