import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CalculatorGallery } from '@/components/arataki/CalculatorGallery';
import { KeteAgentWidget } from '@/components/chat/KeteAgentWidget';
import { aratakiTools } from '@/lib/arataki/calculators';

export const metadata = {
  title: 'Arataki tools',
  description: 'Dealer calculators and diagnostic tools for the Arataki kete.',
};

export default function AratakiToolsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_16%_0%,rgba(217,168,90,0.16),transparent_38%),radial-gradient(ellipse_at_86%_10%,rgba(43,107,87,0.13),transparent_34%),#FAF7F2] px-6 py-16 text-[#3D4250] md:px-12 md:py-24">
      <KeteAgentWidget kete="arataki" accent="#2B6B57" />
      <div className="mx-auto max-w-[1280px]">
        <header className="max-w-5xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#2B6B57]">
            Arataki · dealer toolkit
          </p>
          <h1 className="mt-5 font-display text-[clamp(3.8rem,8vw,7rem)] font-light leading-none text-[#3D4250]">
            Where the money leaks.
          </h1>
          <p className="mt-6 max-w-3xl text-[17px] leading-[1.65] text-[#5C6273] md:text-xl">
            Eight fast calculators and one diagnostic scorecard for dealer operators who need a screenshotable number before a Pilot Sprint conversation.
          </p>
        </header>
        <section className="mt-12">
          <CalculatorGallery tools={aratakiTools} />
        </section>
        <section className="mt-14 rounded-[8px] border border-[#C8BBA9]/70 bg-white/62 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#2B6B57]">
                Operator surface
              </p>
              <h2 className="mt-2 font-display text-4xl font-light leading-none">
                See the full Arataki operator dashboard.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/operator/arataki/loan-cars" className="cta-primary inline-flex h-11 items-center px-5">
                Loan car overlay <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
              <Link href="/pilot-sprint" className="btn-ghost inline-flex h-11 items-center px-5">
                Book a Pilot Sprint
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
