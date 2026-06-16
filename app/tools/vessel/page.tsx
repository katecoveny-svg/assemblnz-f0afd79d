import type { Metadata } from 'next';
import Link from 'next/link';
import { VesselGenerator } from '@/components/tools/VesselGenerator';

export const metadata: Metadata = {
  title: 'vessel generator',
  description:
    'Generate an on-brand vessel image. Five per IP per day — assembl covers generation.',
};

export const dynamic = 'force-dynamic';

export default function VesselToolPage() {
  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)]">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-12 md:px-10 md:pt-16">
        <header className="mb-10 max-w-3xl">
          <p className="font-mono text-[10px] tracking-[0.28em] text-[color:var(--text-secondary)]">
            assembl · tools
          </p>
          <h1 className="font-display mt-2 text-4xl leading-tight text-[color:var(--text-primary)] md:text-5xl">
            Cast a vessel for your brand.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[color:var(--text-secondary)]">
            Pick a colour, name your brand, describe what should sit inside the vessel. The
            generator returns an editorial, paper-backdrop image you can share. Five per IP per
            day — assembl covers generation.
          </p>
        </header>

        <VesselGenerator />

        <footer className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(35,33,31,0.10)] pt-6 text-xs text-[color:var(--text-secondary)]">
          <span>
            Made by{' '}
            <Link href="/" className="underline-offset-2 hover:underline">
              assembl
            </Link>
            . Images generated via Fal.ai Flux 1.1 Pro.
          </span>
          <Link href="/pilot-sprint" className="underline-offset-2 hover:underline">
            Run this on your real work in a Pilot Sprint →
          </Link>
        </footer>
      </div>
    </main>
  );
}
