import Image from 'next/image';
import { heroVessel } from '@/lib/site-config';

/**
 * CinematicHero — full-bleed static 16:9 vessel still as the hero background.
 * The previous cinematic video (720p, scroll-scrubbed) rendered fuzzy when
 * stretched to full-bleed; the static PNG is crisp at any size.
 */
export function CinematicHero({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative min-h-[100vh] overflow-hidden bg-[color:var(--assembl-paper)]">
      <div className="absolute inset-0">
        <Image
          src={heroVessel.wide}
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Sculptural cream wash so type stays readable on cream paper canon */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(250,247,242,0.55) 0%, rgba(250,247,242,0.35) 35%, rgba(250,247,242,0.85) 80%, rgba(250,247,242,1) 100%)',
          }}
        />
      </div>
      <div className="relative z-10 mx-auto flex min-h-[100vh] max-w-6xl flex-col justify-center px-6 py-32 md:px-10">
        {children}
      </div>
    </section>
  );
}
