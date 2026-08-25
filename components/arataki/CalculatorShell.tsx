import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type CalculatorShellProps = {
  slug: string;
  title: string;
  description: string;
  timeToRun: string;
  legislationCites?: string[];
  children: ReactNode;
};

export function CalculatorShell({
  title,
  description,
  timeToRun,
  legislationCites = [],
  children,
}: CalculatorShellProps) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(ellipse_at_14%_0%,rgba(217,168,90,0.16),transparent_38%),radial-gradient(ellipse_at_86%_6%,rgba(58,56,50,0.14),transparent_34%),#FFF7EC] px-6 py-12 text-[#3D4250] md:px-12 md:py-16">
      <div className="mx-auto w-full max-w-[calc(100vw-3rem)] md:max-w-[1180px]">
        <Link
          href="/kete/arataki/tools"
          className="mb-8 inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.18em] text-[#5C6273] hover:text-[#3A3832]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Arataki tools
        </Link>
        <header className="max-w-4xl">
          <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#3A3832]">
            Arataki · calculator
          </p>
          <h1 className="mt-4 max-w-[19rem] break-words font-display text-[2.25rem] font-light leading-[0.92] text-[#3D4250] [overflow-wrap:anywhere] md:max-w-full md:text-[clamp(3.2rem,8vw,6rem)]">
            {title}
          </h1>
          <p className="mt-5 max-w-[19rem] text-[17px] leading-relaxed text-[#5C6273] md:max-w-3xl md:text-xl">
            {description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-[#C8BBA9]/70 bg-white/58 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.18em] text-[#5C6273]">
              {timeToRun}
            </span>
            {legislationCites.map((cite) => (
              <span
                key={cite}
                className="rounded-full border border-[#D9A85A]/45 bg-[#D9A85A]/10 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.18em] text-[#3D4250]"
              >
                {cite}
              </span>
            ))}
          </div>
        </header>
        <section className="mt-10">{children}</section>
        <footer className="mt-10 rounded-[8px] border border-[#C8BBA9]/70 bg-white/60 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="max-w-2xl text-sm leading-relaxed text-[#5C6273]">
              This is an estimate. Real numbers come from your DMS data once we onboard you.
            </p>
            <Link href="/pilot-sprint" className="cta-primary inline-flex h-11 items-center px-5">
              See this surface in action <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
