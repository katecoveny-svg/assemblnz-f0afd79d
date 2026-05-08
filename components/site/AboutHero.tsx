import Image from 'next/image';
import Link from 'next/link';
import { FadeUp } from '@/components/motion/FadeUp';
import { VESSEL_ASSETS } from '@/lib/site-config';

interface AboutHeroProps {
  eyebrow: string;
  headline: string | string[];
  body?: string;
}

/**
 * PAINTERLY canon hero — /about only.
 * Warm olive/khaki gradient background (NOT cream paper).
 * Vessel image replaces Kate portrait — painterly anchor.
 * Per Interactive Web Canon: softer, more atmospheric, emotional register.
 */
export function AboutHero({ eyebrow, headline, body }: AboutHeroProps) {
  const lines = Array.isArray(headline) ? headline : [headline];

  return (
    <section
      className="relative min-h-[70vh] overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #A89970 0%, #C7B991 50%, #B8A878 100%)',
      }}
      aria-label="About assembl"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-12 md:py-36">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 lg:gap-20">
          {/* Copy */}
          <FadeUp>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#FAF7F2] opacity-70">
              {eyebrow}
            </p>
            <h1
              className="mt-6 font-display leading-[0.96] tracking-tight text-[#FAF7F2]"
              style={{ fontWeight: 300, fontSize: 'clamp(2.4rem, 4.4vw, 5rem)' }}
            >
              {lines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h1>
            {body && (
              <p className="mt-6 max-w-prose font-body text-[1.05rem] leading-relaxed text-[#FAF7F2] opacity-85">
                {body}
              </p>
            )}
            <div className="mt-8">
              <Link
                href="/pilot-sprint"
                className="inline-flex h-12 items-center rounded-full border border-[#FAF7F2] border-opacity-60 px-7 text-sm text-[#FAF7F2] transition-all hover:border-opacity-100 hover:bg-[#FAF7F2] hover:text-[#A89970] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FAF7F2] md:text-base"
              >
                Book a Pilot Sprint →
              </Link>
            </div>
          </FadeUp>

          {/* Painterly vessel */}
          <FadeUp delay={0.15}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl">
              <Image
                src={VESSEL_ASSETS.painterlyAnchor}
                alt="assembl Evidence Vessel — painterly interpretation"
                fill
                className="object-cover"
                priority
              />
              {/* Warm overlay */}
              <div
                className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-20"
                style={{ background: 'linear-gradient(180deg, transparent 50%, #7A6040 100%)' }}
                aria-hidden="true"
              />
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
