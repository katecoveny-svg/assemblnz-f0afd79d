import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ScorecardForm } from '@/components/arataki/ScorecardForm';

export const metadata = {
  title: 'Arataki diagnostic',
  description: 'A 20-question dealer operations scorecard for Arataki.',
};

export default function AratakiDiagnosticPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_16%_0%,rgba(217,168,90,0.16),transparent_38%),radial-gradient(ellipse_at_86%_10%,rgba(43,107,87,0.13),transparent_34%),#FAF7F2] px-6 py-12 text-[#3D4250] md:px-12 md:py-16">
      <div className="mx-auto max-w-[1180px]">
        <Link href="/kete/arataki/tools" className="mb-8 inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.18em] text-[#5C6273] hover:text-[#2B6B57]">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Arataki tools
        </Link>
        <header className="mb-10 max-w-4xl">
          <p className="font-mono text-[12px] uppercase tracking-[0.32em] text-[#2B6B57]">Arataki · diagnostic</p>
          <h1 className="mt-5 font-display text-[clamp(3.4rem,8vw,6rem)] font-light leading-none text-[#3D4250]">
            Twenty questions. One operator read.
          </h1>
          <p className="mt-6 max-w-3xl text-[17px] leading-relaxed text-[#5C6273] md:text-xl">
            Score the dealership across service conversion, workshop capacity, customer retention, lead response, F&I, and compliance.
          </p>
        </header>
        <ScorecardForm />
      </div>
    </main>
  );
}
