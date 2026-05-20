import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ScorecardResult } from '@/components/arataki/ScorecardResult';
import { encodeScores, parseScores } from '@/lib/arataki/scorecard';

export const metadata = {
  title: 'Arataki diagnostic result',
  description: 'Shareable Arataki dealer operations scorecard result.',
};

export default async function AratakiDiagnosticResultPage({
  searchParams,
}: {
  searchParams: Promise<{ scores?: string }>;
}) {
  const { scores: encodedFromUrl } = await searchParams;
  const scores = parseScores(encodedFromUrl);
  const encoded = encodeScores(scores);
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_16%_0%,rgba(217,168,90,0.16),transparent_38%),radial-gradient(ellipse_at_86%_10%,rgba(43,107,87,0.13),transparent_34%),#FAF7F2] px-6 py-12 text-[#3D4250] md:px-12 md:py-16">
      <div className="mx-auto max-w-[1180px]">
        <Link href="/kete/arataki/diagnostic" className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#5C6273] hover:text-[#2B6B57]">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Retake diagnostic
        </Link>
        <header className="mb-10 max-w-4xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#2B6B57]">Arataki · diagnostic result</p>
          <h1 className="mt-5 font-display text-[clamp(3.4rem,8vw,6rem)] font-light italic leading-none text-[#3D4250]">
            Your dealer operations score.
          </h1>
        </header>
        <ScorecardResult scores={scores} encoded={encoded} />
      </div>
    </main>
  );
}
