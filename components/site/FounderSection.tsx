import Image from 'next/image';

export function FounderSection() {
  return (
    <section className="relative bg-[color:var(--assembl-paper)] py-24 md:py-32">
      <div className="container">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
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
              Kate Harland built assembl after watching small NZ businesses lose their best people
              to admin no one signed up for. The promise of AI shouldn&apos;t be speed. It should
              be time — for the work that actually matters, the people who depend on you, and the
              moments you&apos;d otherwise miss.
            </p>

            <figure className="mt-12 max-w-2xl">
              <blockquote
                className="font-display italic leading-[1.15] text-[color:var(--text-primary)]"
                style={{ fontWeight: 300, fontSize: 'clamp(1.6rem, 3.2vw, 2.5rem)' }}
              >
                &ldquo;The best thing AI can give us isn&apos;t speed. It&apos;s time. Time for
                people. Time for family. Time for what matters.&rdquo;
              </blockquote>
              <span
                aria-hidden
                className="mt-6 block h-px w-24"
                style={{ backgroundColor: 'var(--assembl-gold-thread)', opacity: 0.7 }}
              />
            </figure>
          </div>

          <div className="lg:col-span-5">
            <div className="grid grid-cols-5 gap-4 md:gap-5">
              <div className="relative col-span-3 aspect-[4/5] overflow-hidden rounded-sm bg-[color:var(--assembl-mist)]/40">
                <Image
                  src="/img/founder/founder-portrait.png"
                  alt="Kate Harland — founder of assembl."
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 30vw, 60vw"
                  className="object-cover"
                />
              </div>
              <div className="col-span-2 flex flex-col gap-4 md:gap-5">
                <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[color:var(--assembl-mist)]/40">
                  <Image
                    src="/img/founder/founder-human.png"
                    alt="Founder portrait — quieter moment."
                    fill
                    loading="lazy"
                    sizes="(min-width: 1024px) 18vw, 40vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[color:var(--assembl-mist)]/40">
                  <Image
                    src="/img/founder/founder-pair.png"
                    alt="Founder with collaborator."
                    fill
                    loading="lazy"
                    sizes="(min-width: 1024px) 18vw, 40vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-sm bg-[color:var(--assembl-mist)]/40">
            <Image
              src="/img/founder/founder-triptych-a.png"
              alt="Founder triptych — frame one."
              fill
              loading="lazy"
              sizes="(min-width: 768px) 45vw, 90vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-sm bg-[color:var(--assembl-mist)]/40">
            <Image
              src="/img/founder/founder-triptych-b.png"
              alt="Founder triptych — frame two."
              fill
              loading="lazy"
              sizes="(min-width: 768px) 45vw, 90vw"
              className="object-cover"
            />
          </div>
        </div>

        <p className="mx-auto mt-16 max-w-7xl font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
          quiet intelligence. more presence. time returned.
        </p>
      </div>
    </section>
  );
}
