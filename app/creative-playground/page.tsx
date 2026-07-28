import type { Metadata } from 'next';
import { GenerativeArtCanvas } from '@/components/studios/GenerativeArtCanvas';
import './creative-playground.css';

export const metadata: Metadata = {
  title: 'creative playground — assembl',
  description:
    'A generative art studio. Every piece runs entirely in your browser — line art, chrome shapes, or particle flow. Yours to keep as PNG, SVG, or self-contained code.',
};

/**
 * /creative-playground — on the Instrument canon.
 *
 * Was paper-white with the Cormorant display cut and grey secondary text: the
 * pre-2026-07-26 skin, which read as a different site once the rest of the
 * marketing surface moved to navy. Canon here is Lato on #050F1C, hierarchy by
 * weight rather than by opacity, and brass for accents only.
 */
export default function CreativePlaygroundPage() {
  return (
    <main className="cp-root min-h-screen">
      <header className="mx-auto max-w-[1180px] px-5 pt-10 md:px-10 md:pt-16">
        <p className="cp-kicker">
          assembl <span className="cp-dot">·</span> studios
        </p>
        <h1 className="cp-h1">creative playground.</h1>
        <p className="cp-lede">
          Every piece begins as a seed. Sliders shape it. Everything runs in your browser — no
          keys, no upload, no cloud. Yours to keep as PNG, SVG, or self-contained code.
        </p>
      </header>

      <section className="mx-auto max-w-[1180px] px-5 pb-16 pt-10 md:px-10 md:pb-24 md:pt-12">
        <GenerativeArtCanvas />
      </section>

      <footer className="cp-foot mx-auto max-w-[1180px] px-5 pb-10 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <span>every family runs in your browser — line via p5, chrome via three.js, flow via curl noise</span>
          <a href="/creative-playground/avatars" className="cp-link">
            agent avatars →
          </a>
        </div>
      </footer>
    </main>
  );
}
