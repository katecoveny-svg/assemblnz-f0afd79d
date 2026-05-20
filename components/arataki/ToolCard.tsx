import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ToolLink } from '@/lib/arataki/calculators';

export function ToolCard({ tool }: { tool: ToolLink }) {
  return (
    <Link
      href={tool.href}
      className="group flex h-full flex-col rounded-[8px] border border-[#C8BBA9]/70 bg-white/62 p-5 transition hover:-translate-y-1 hover:border-[#2B6B57] hover:bg-white"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#2B6B57]">{tool.eyebrow}</p>
        <span className="rounded-full border border-[#C8BBA9]/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#5C6273]">
          {tool.timeToRun}
        </span>
      </div>
      <h2 className="mt-5 font-display text-4xl font-light italic leading-none text-[#3D4250]">
        {tool.title}
      </h2>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-[#5C6273]">{tool.description}</p>
      <span className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#2B6B57]">
        Open tool <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" aria-hidden />
      </span>
      <span className="mt-4 h-px w-12 bg-[#2B6B57] transition group-hover:w-full" aria-hidden />
    </Link>
  );
}
