import type { Metadata } from 'next';
import Link from 'next/link';

import { AGENT_PAID_TOOLS } from '@/lib/tools/registry';

export const metadata: Metadata = {
  title: 'assembl agent tools',
  description:
    'Registry of agent-paid single-job HTTP tools: URL + key + daily cap + receipt. Sandbox via test_ keys.',
};

export const dynamic = 'force-dynamic';

export default function ToolsRegistryPage() {
  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper,#FFFDFB)] text-[color:var(--assembl-deep-plum,#240B21)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(145,106,112,0.14),_transparent_55%),linear-gradient(180deg,_#F5F1F2_0%,_#FFFDFB_42%)]" />
      <div className="relative mx-auto max-w-3xl px-6 pb-20 pt-14 md:px-8">
        <p className="font-mono text-[11px] tracking-[0.28em] text-[color:var(--assembl-muted-plum,#654A4E)]">
          assembl · agent tools
        </p>
        <h1 className="mt-3 text-4xl leading-tight tracking-tight md:text-5xl">Tool registry</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
          Skills-style index of single-job paid HTTP tools. Each tool is a URL that does one useful
          job: clear in/out, API key, daily cap, receipt. Prefer jobs humans pay for that frontier
          models cannot do alone. Auth:{' '}
          <code className="font-mono text-[13px]">Authorization: Bearer</code> or{' '}
          <code className="font-mono text-[13px]">X-Assembl-Tool-Key</code>. Keys starting with{' '}
          <code className="font-mono text-[13px]">test_</code> stay in sandbox.
        </p>

        <ul className="mt-12 space-y-8">
          {AGENT_PAID_TOOLS.map((tool) => (
            <li
              key={tool.slug}
              className="border-t border-[rgba(36,11,33,0.12)] pt-6 first:border-t-0 first:pt-0"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="text-xl font-medium">
                  <Link href={tool.docs} className="underline-offset-2 hover:underline">
                    {tool.slug}
                  </Link>
                </h2>
                <span className="font-mono text-[11px] text-[color:var(--assembl-muted-plum,#654A4E)]">
                  {tool.status}
                </span>
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
                {tool.oneJob}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
                <span className="font-medium text-[color:var(--assembl-deep-plum,#240B21)]">
                  Use when:{' '}
                </span>
                {tool.useWhen}
              </p>
              <p className="mt-2 font-mono text-[12px] text-[color:var(--assembl-muted-plum,#654A4E)]">
                {tool.endpoint}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--assembl-muted-plum,#654A4E)]">
                {tool.liveNote}
              </p>
              <p className="mt-3 text-sm">
                <Link href={tool.docs} className="underline-offset-2 hover:underline">
                  docs
                </Link>
                {' · '}
                <Link
                  href={tool.endpoint.replace('POST ', '')}
                  className="underline-offset-2 hover:underline"
                >
                  health
                </Link>
              </p>
            </li>
          ))}
        </ul>

        <footer className="mt-14 border-t border-[rgba(36,11,33,0.12)] pt-6 text-sm text-[color:var(--assembl-muted-plum,#654A4E)]">
          Markdown index: <code className="font-mono text-[12px]">docs/tools/README.md</code>
        </footer>
      </div>
    </main>
  );
}
