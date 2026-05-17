import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Press kit',
  description: 'Logos, wordmarks, and brand assets for media use.',
};

export default function PressPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <p className="font-mono text-eyebrow uppercase text-[color:var(--text-secondary)]">
        Media
      </p>
      <h1 className="mt-3 font-display text-display-lg text-[color:var(--assembl-pounamu)]">
        Press kit
      </h1>
      <p className="mt-4 text-body-md text-[color:var(--text-body)]">
        Logos, wordmarks, and brand assets for media use. Please attribute as
        &quot;assembl&quot; (lowercase). For interviews or commentary, email{' '}
        <a
          href="mailto:hello@assembl.co.nz"
          className="text-[color:var(--assembl-pounamu)] underline-offset-2 hover:underline"
        >
          hello@assembl.co.nz
        </a>
        .
      </p>

      <section className="mt-12 grid gap-12 md:grid-cols-2">
        <div>
          <h2 className="font-display text-display-sm">assembl wordmark</h2>
          <Image
            src="/img/press/assembl-wordmark.png"
            alt="assembl wordmark"
            width={600}
            height={200}
            className="mt-4 rounded-md bg-[#FAF7F2] p-8"
          />
          <a
            href="/img/press/assembl-wordmark.png"
            download
            className="mt-2 inline-block text-sm underline underline-offset-2"
          >
            Download PNG
          </a>
        </div>
        <div>
          <h2 className="font-display text-display-sm">tōro wordmark</h2>
          <Image
            src="/img/press/toro-wordmark.png"
            alt="tōro wordmark"
            width={600}
            height={200}
            className="mt-4 rounded-md bg-[#FAF7F2] p-8"
          />
          <a
            href="/img/press/toro-wordmark.png"
            download
            className="mt-2 inline-block text-sm underline underline-offset-2"
          >
            Download PNG
          </a>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-display-sm">One-page pitch</h2>
        <p className="mt-3 text-body-md text-[color:var(--text-body)]">
          A printable one-pager covering the headline, kete, pricing, and
          contact details.
        </p>
        <a
          href="/downloads/assembl-one-page-pitch.pdf"
          className="mt-3 inline-block text-sm underline underline-offset-2"
        >
          Download PDF
        </a>
      </section>
    </main>
  );
}
