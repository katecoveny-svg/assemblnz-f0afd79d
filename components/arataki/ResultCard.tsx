'use client';

import { useMemo, useState } from 'react';
import { Copy } from 'lucide-react';
import type { BreakdownRow } from '@/lib/arataki/calculators';

type ResultCardProps = {
  eyebrow?: string;
  headline: string;
  tone?: 'pounamu' | 'amber';
  rows: BreakdownRow[];
  params: Record<string, number | string | boolean>;
  children?: React.ReactNode;
};

export function ResultCard({
  eyebrow = 'Estimated result',
  headline,
  tone = 'pounamu',
  rows,
  params,
  children,
}: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const accent = tone === 'amber' ? '#D9A85A' : '#2B6B57';
  const link = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
    return url.toString();
  }, [params]);

  async function copyLink() {
    if (!link || !navigator.clipboard) return;
    await navigator.clipboard.writeText(link);
    window.history.replaceState(null, '', link);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <aside className="min-w-0 rounded-[8px] border bg-white/78 p-5 shadow-[0_20px_70px_rgba(61,66,80,0.08)]" style={{ borderColor: `${accent}66` }}>
      <p className="font-mono text-[10px] uppercase tracking-[0.24em]" style={{ color: accent }}>
        {eyebrow}
      </p>
      <p className="mt-4 break-words font-display text-[2rem] font-light leading-none text-[#3D4250] [overflow-wrap:anywhere] md:text-[clamp(3rem,8vw,5rem)]">
        {headline}
      </p>
      <div className="mt-6 divide-y divide-[#C8BBA9]/60 rounded-[8px] border border-[#C8BBA9]/60 bg-[#FAF7F2]/80">
        {rows.map((row) => (
          <div key={`${row.label}-${row.value}`} className="grid gap-1 px-4 py-3 text-sm md:grid-cols-[1fr_auto] md:items-center">
            <span className="text-[#5C6273]">{row.label}</span>
            <span className="font-medium text-[#3D4250]">{row.value}</span>
          </div>
        ))}
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
      <button
        type="button"
        onClick={copyLink}
        className="mt-5 inline-flex h-10 items-center rounded-full border border-[#C8BBA9] px-4 text-sm font-medium text-[#3D4250] transition hover:border-[#2B6B57] hover:text-[#2B6B57]"
      >
        <Copy className="mr-2 h-4 w-4" aria-hidden />
        {copied ? 'Copied' : 'Copy result link'}
      </button>
    </aside>
  );
}
