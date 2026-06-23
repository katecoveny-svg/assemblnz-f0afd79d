import Image from 'next/image';

/**
 * Aotearoa landscape divider — Kate's canonical full-bleed coast band.
 *
 * Full viewport width, ≥400px tall on desktop, sitting as a substantial
 * mid-page or pre-footer divider that grounds the page in place. Hairline gold
 * threads top and bottom tie it to the rest of the site. Decorative by default
 * (aria-hidden, empty alt) so it reads as texture, not content.
 *
 * Default asset: the Tapeka Point, Bay of Islands golden-hour image
 * (pōhutukawa in bloom) — the strongest landscape in the brand set.
 */
export function LandscapeBand({
  src = '/images/site/landscape-tapeka-bay-of-islands.png',
  className = '',
}: {
  src?: string;
  className?: string;
}) {
  return (
    <section
      aria-hidden
      className={`relative h-[58vw] max-h-[560px] min-h-[400px] w-full overflow-hidden ${className}`}
    >
      <Image src={src} alt="" fill sizes="100vw" className="object-cover object-center" />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(199,155,31,0.5),transparent)]" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(199,155,31,0.5),transparent)]" />
    </section>
  );
}
