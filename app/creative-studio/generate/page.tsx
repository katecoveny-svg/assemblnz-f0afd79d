import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { GenerativeArtCanvas } from '@/components/studios/GenerativeArtCanvas';
import '../../creative-playground/creative-playground.css';

export const metadata: Metadata = {
  title: 'Generative assembly · Studio',
  description:
    'A flock of terns, kererū, tāmure or plankton assembles into any assembl object or any word. Nineteen generative families, all running in your browser. Export PNG, MP4, WebM or GIF with a receipt that regenerates the piece.',
};

/**
 * /creative-studio/generate: Generative assembly.
 *
 * The playground's TypeScript studio with the homepage tide engine mounted as
 * the first family. /creative-playground and /generative-studio redirect here.
 */
export default function GenerateAssemblyPage() {
  return (
    <main className="cp-root min-h-screen">
      <header className="mx-auto max-w-[1180px] px-5 pt-10 md:px-10 md:pt-16">
        <p className="cp-kicker">
          <Link href="/creative-studio" className="cp-link">studio</Link> <span className="cp-dot">·</span> generate
        </p>
        <h1 className="cp-h1">generative assembly.</h1>
        <p className="cp-lede">
          Choose a species and a shape. The flock gathers, organises and holds it. Every piece starts
          from a seed and runs in your browser, with no upload and no outside service. Each export
          carries a receipt line naming the seed, species and formation, and the share link
          regenerates it exactly.
        </p>
      </header>

      <section className="mx-auto max-w-[1180px] px-5 pb-16 pt-10 md:px-10 md:pb-24 md:pt-12">
        <Suspense fallback={<p className="cp-foot">gathering the studio</p>}>
          <GenerativeArtCanvas defaultFamily="assembly" />
        </Suspense>
      </section>

      <footer className="cp-foot mx-auto max-w-[1180px] px-5 pb-10 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <span>assembly runs the homepage tide engine · the other families run on p5, three.js and canvas</span>
          <Link href="/creative-playground/avatars" className="cp-link">
            agent avatars →
          </Link>
        </div>
      </footer>
    </main>
  );
}
