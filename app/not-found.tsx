import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PatternBackdrop } from '@/components/pattern-studio/PatternBackdrop';

export default function NotFound() {
  return (
    <main className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <PatternBackdrop
        className="z-0"
        mode="particles"
        count={90}
        connectLines
        connectDistance={130}
        particleShape="circle"
        glow={false}
        speed={0.7}
        colorRole="accent"
        opacity={0.5}
        lazyMount={false}
      />
      <span className="relative z-10 font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
        404
      </span>
      <h1 className="relative z-10 mt-4 font-display text-6xl md:text-7xl">
        This page does not exist <em className="not-italic text-gradient-hero">yet</em>.
      </h1>
      <p className="relative z-10 mt-6 max-w-md text-base text-[color:var(--text-body)]">
        It might be coming. Or it might have moved. Either way, the homepage is the best place to
        start.
      </p>
      <div className="relative z-10 mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="cta-primary inline-flex h-12 items-center px-7 text-sm md:text-base"
        >
          Back to home
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
        </Link>
        <Link
          href="/living-site"
          className="btn-ghost inline-flex h-12 items-center px-7 text-sm md:text-base"
        >
          See a living site
        </Link>
      </div>
    </main>
  );
}
