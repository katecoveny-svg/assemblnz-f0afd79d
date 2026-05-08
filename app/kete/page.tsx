import { FadeUp } from '@/components/motion/FadeUp';
import { KeteCard } from '@/components/site/KeteCard';
import { KETES, VESSEL_ASSETS } from '@/lib/site-config';
import Image from 'next/image';
import Link from 'next/link';

/**
 * /kete — 8 kete index page.
 * Full-width hero with vessel image, then 2-column card grid (index variant with taglines).
 * Per Interactive Web Canon §6: all cards use KeteCard with vessel imagery.
 */

export const metadata = {
  title: 'Industry kete — assembl',
  description:
    'Eight intelligent agent workflows built for New Zealand industries — construction, freight, hospitality, retail, creative, early childhood, automotive, and whānau.',
};

export default function KeteIndexPage() {
  const pilotKetes = KETES.filter((k) => k.status === 'pilot');
  const soonKetes = KETES.filter((k) => k.status === 'shortly');
  const roadmapKetes = KETES.filter((k) => k.status === 'roadmap');

  return (
    <>
      {/* Page hero */}
      <section
        className="border-b border-[color:var(--assembl-gold-thread)] border-opacity-30 bg-[color:var(--assembl-paper)] py-24 md:py-32"
        aria-label="Kete index"
      >
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 lg:gap-20">
            <FadeUp>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                03 — INDUSTRY KETE
              </p>
              <h1
                className="mt-6 font-display leading-[0.96] tracking-tight text-[color:var(--text-primary)]"
                style={{ fontWeight: 300, fontSize: 'clamp(2.4rem, 4.4vw, 5rem)' }}
              >
                <span className="block">Built the way</span>
                <span className="block">Aotearoa works.</span>
              </h1>
              <p className="mt-6 max-w-prose font-body text-[1.05rem] leading-relaxed text-[color:var(--text-body)]">
                Every kete is grounded in the New Zealand legislation that governs its industry. Eight industries. Forty-six specialist agents. One consistent evidence standard.
              </p>
              <div className="mt-8">
                <Link
                  href="/pilot-sprint"
                  className="inline-flex h-12 items-center rounded-full border border-[color:var(--assembl-gold-thread)] px-7 text-sm text-[color:var(--text-primary)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--assembl-gold-thread)] md:text-base"
                >
                  Start a Pilot Sprint →
                </Link>
              </div>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl shadow-xl">
                <Image
                  src={VESSEL_ASSETS.hero16x9}
                  alt="assembl Evidence Vessel — industry kete"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* PILOT LIVE */}
      <section className="bg-[color:var(--assembl-mist)] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <FadeUp>
            <div className="mb-10 flex items-center gap-4">
              <span className="inline-flex items-center rounded-full bg-[color:var(--assembl-pounamu-paper)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--assembl-pounamu)]">
                Pilot live
              </span>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-tertiary)]">
                Active pilots with NZ businesses
              </p>
            </div>
          </FadeUp>
          <div className="grid gap-6 sm:grid-cols-2">
            {pilotKetes.map((kete) => (
              <KeteCard key={kete.slug} kete={kete} variant="index" />
            ))}
          </div>
        </div>
      </section>

      {/* SHORTLY */}
      <section className="border-t border-[color:var(--assembl-gold-thread)] border-opacity-30 bg-[color:var(--assembl-paper)] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <FadeUp>
            <div className="mb-10 flex items-center gap-4">
              <span className="inline-flex items-center rounded-full bg-[color:var(--assembl-mist)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
                Shortly
              </span>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-tertiary)]">
                In final build · pilots opening soon
              </p>
            </div>
          </FadeUp>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {soonKetes.map((kete) => (
              <KeteCard key={kete.slug} kete={kete} variant="home" />
            ))}
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="border-t border-[color:var(--assembl-gold-thread)] border-opacity-30 bg-[color:var(--assembl-mist)] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <FadeUp>
            <div className="mb-10 flex items-center gap-4">
              <span className="inline-flex items-center rounded-full bg-transparent px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-tertiary)] ring-1 ring-[color:var(--assembl-gold-thread)] ring-opacity-40">
                Roadmap
              </span>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-tertiary)]">
                Interest list open
              </p>
            </div>
          </FadeUp>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {roadmapKetes.map((kete) => (
              <KeteCard key={kete.slug} kete={kete} variant="home" />
            ))}
          </div>

          <FadeUp className="mt-16">
            <div className="rounded-xl border border-[color:var(--assembl-gold-thread)] border-opacity-30 bg-[color:var(--assembl-paper)] p-8 md:p-12">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[color:var(--text-secondary)]">
                YOUR INDUSTRY NOT LISTED
              </p>
              <h3
                className="mt-4 font-display leading-tight text-[color:var(--text-primary)]"
                style={{ fontWeight: 300, fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)' }}
              >
                Tell us what workflow is eating your time.
              </h3>
              <p className="mt-4 max-w-prose font-body text-base leading-relaxed text-[color:var(--text-body)]">
                Every kete starts with a real business problem. If your industry isn't on the list, the Pilot Sprint still applies — one workflow, two weeks, evidence Friday.
              </p>
              <div className="mt-6">
                <Link
                  href="/pilot-sprint"
                  className="inline-flex h-12 items-center rounded-full border border-[color:var(--assembl-gold-thread)] px-7 text-sm text-[color:var(--text-primary)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--assembl-gold-thread)] md:text-base"
                >
                  Start a Pilot Sprint →
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
