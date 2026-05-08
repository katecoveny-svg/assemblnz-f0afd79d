import Image from 'next/image';

export function FounderSection() {
  return (
    <section className="relative bg-[color:var(--assembl-paper)] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="order-2 lg:order-1 lg:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              assembl · founder note
            </p>

            <h2
              className="mt-6 font-display leading-[1.02] tracking-tight text-[color:var(--text-primary)]"
              style={{ fontWeight: 300, fontSize: 'clamp(2rem, 4.6vw, 3.6rem)' }}
            >
              Built by a founder who knows what time costs.
            </h2>

            <p className="mt-8 max-w-2xl text-base leading-relaxed text-[color:var(--text-body)] md:text-lg">
              Kate Hudson built assembl after watching small NZ businesses lose their best people
              to admin no one signed up for. The promise of intelligent automation shouldn&apos;t
              be speed. It should be time — for the work that actually matters, the people who
              depend on you, and the moments you&apos;d otherwise miss.
            </p>

            <figure className="mt-12 max-w-2xl">
              <blockquote
                className="font-display italic leading-[1.15] text-[color:var(--text-primary)]"
                style={{ fontWeight: 300, fontSize: 'clamp(1.6rem, 3.2vw, 2.5rem)' }}
              >
                &ldquo;The best thing intelligent automation can give us isn&apos;t speed. It&apos;s
                time. Time for people. Time for family. Time for what matters.&rdquo;
              </blockquote>
              <span
                aria-hidden
                className="mt-6 block h-px w-24"
                style={{ backgroundColor: 'var(--assembl-gold-thread)', opacity: 0.7 }}
              />
            </figure>

            <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
              quiet intelligence. more presence. time returned.
            </p>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-5">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-sm bg-[color:var(--assembl-mist)]/40">
              <Image
                src="/img/founder/founder-portrait.png"
                alt="Kate Hudson — founder of assembl."
                fill
                loading="lazy"
                sizes="(min-width: 1024px) 36vw, (min-width: 640px) 60vw, 90vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
