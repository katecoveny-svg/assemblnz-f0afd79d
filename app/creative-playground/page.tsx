import type { Metadata } from 'next';
import { GenerativeArtCanvas } from '@/components/studios/GenerativeArtCanvas';

export const metadata: Metadata = {
  title: 'creative playground — assembl',
  description:
    'A generative art studio. Every piece begins as a seed. Sliders shape it. Firefly-quality render finishes it. Yours to keep.',
};

export default function CreativePlaygroundPage() {
  return (
    <main className="min-h-screen bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)]">
      <header className="mx-auto max-w-[1180px] px-5 pt-8 md:px-10 md:pt-14">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
          assembl <span className="mx-1.5 text-[color:var(--assembl-gold-thread)]">·</span> studios
        </p>
        <h1 className="mt-4 font-display text-[42px] font-light lowercase leading-[0.95] tracking-[-0.005em] md:text-[64px]">
          creative playground.
        </h1>
        <p className="mt-4 max-w-[560px] text-[15px] leading-[1.55] text-[color:var(--text-secondary)] md:text-[17px]">
          Every piece begins as a seed. Sliders shape it. Firefly finishes it. Yours to keep.
        </p>
      </header>

      <section className="mx-auto max-w-[1180px] px-5 pb-16 pt-8 md:px-10 md:pb-24 md:pt-10">
        <GenerativeArtCanvas />
      </section>

      <footer className="mx-auto max-w-[1180px] px-5 pb-10 text-[10.5px] font-mono uppercase tracking-[0.2em] text-[color:var(--text-secondary)] md:px-10">
        <div className="border-t border-[color:var(--assembl-cloud)] pt-6">
          algorithmic mode runs entirely in your browser · a render pass to fal flux is next
        </div>
      </footer>
    </main>
  );
}
