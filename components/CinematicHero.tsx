import Image from 'next/image';
import { heroVessel } from '@/lib/site-config';

/**
 * CinematicHero — two-column desktop layout: copy on the left, contained
 * vessel still on the right. Stacks on mobile.
 *
 * Previous version used a full-bleed background still (heroVessel.wide) with
 * a cream gradient wash; on wide desktops the vessel's sculptural form fell
 * across the headline and overlapped the lede. This layout puts the imagery
 * in its own column with bounded width, so the type never collides with the
 * vessel and the visual hierarchy stays clear at 1280 / 1440 / 1920 widths.
 */
export function CinematicHero({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-[color:var(--assembl-paper)]">
      <div className="mx-auto grid min-h-[80vh] max-w-7xl items-center gap-12 px-6 py-20 md:min-h-[88vh] md:grid-cols-12 md:gap-12 md:px-10 md:py-28 lg:gap-16">
        {/* Copy column — first in DOM so screen readers and mobile get it first */}
        <div className="md:col-span-7">
          {children}
        </div>

        {/* Vessel column — bounded by max-width so the still never sprawls.
            Portrait crop (4:5) keeps the sculptural form readable without
            cropping it the way full-bleed object-cover did. */}
        <div className="relative md:col-span-5">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[440px] md:max-w-[480px] lg:max-w-[540px]">
            <Image
              src={heroVessel.portrait}
              alt=""
              aria-hidden
              fill
              priority
              sizes="(min-width: 1280px) 40vw, (min-width: 768px) 42vw, 85vw"
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
