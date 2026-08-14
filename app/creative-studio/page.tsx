import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'creative studio',
  description: 'Create and export on-brand assembl imagery, motion studies and client demonstrator assets in your browser.',
  alternates: { canonical: '/creative-studio' },
  openGraph: {
    title: 'assembl | creative studio',
    description: 'A browser-based studio for assembl imagery, motion studies and client demonstrator assets.',
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.assembl.co.nz/creative-studio',
    siteName: 'assembl',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'assembl | creative studio',
    description: 'A browser-based studio for assembl imagery, motion studies and client demonstrator assets.',
  },
};

export default function CreativeStudioPage() {
  return (
    <div className="flex h-[100svh] min-h-[620px] flex-col overflow-hidden bg-[#120510] text-[#F5F1F2]">
      <header className="flex min-h-14 flex-none items-center justify-between gap-5 border-b border-white/10 bg-[#240B21] px-4 py-3 md:min-h-16 md:px-7">
        <Link
          href="/"
          aria-label="assembl home"
          className="rounded-sm text-[22px] font-medium tracking-[-0.055em] text-[#FFFDFB] outline-none focus-visible:ring-2 focus-visible:ring-[#E9BCA9] focus-visible:ring-offset-4 focus-visible:ring-offset-[#240B21]"
        >
          assembl<span className="text-[#E9BCA9]">·</span>
        </Link>
        <div className="min-w-0 text-center">
          <p className="font-mono text-[8px] font-medium uppercase tracking-[0.16em] text-[#FFFDFB] md:text-[10px]">
            Creative studio
          </p>
          <p className="mt-1 hidden font-mono text-[7px] uppercase tracking-[0.12em] text-[#B6ACB3] sm:block md:text-[8px]">
            Runs locally in this browser · exports download to your device
          </p>
        </div>
        <Link
          href="/"
          className="rounded-sm font-mono text-[8px] font-medium uppercase tracking-[0.12em] text-[#F5F1F2] outline-none hover:text-[#E9BCA9] focus-visible:ring-2 focus-visible:ring-[#E9BCA9] focus-visible:ring-offset-4 focus-visible:ring-offset-[#240B21] md:text-[9px]"
        >
          Back to site <span aria-hidden="true">↙</span>
        </Link>
      </header>

      <iframe
        src="/tools/assembl-creative-studio.html"
        title="assembl creative studio"
        className="min-h-0 w-full flex-1 border-0 bg-[#120510]"
        sandbox="allow-scripts allow-downloads"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
