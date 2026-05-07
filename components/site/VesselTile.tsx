import Image from 'next/image';
import type { KeteSlug } from '@/lib/kete';

const LOCKED: Partial<Record<KeteSlug, { src: string; alt: string }>> = {
  waihanga: {
    src: '/img/hero/waihanga-vessel-cream.jpg',
    alt: 'Waihanga evidence vessel — silk-organza pounamu bloom on cream backdrop.',
  },
  manaaki: {
    src: '/img/kete/manaaki-vessel.png',
    alt: 'Manaaki evidence vessel — terracotta silk bloom on cream backdrop.',
  },
  pikau: {
    src: '/img/kete/pikau-vessel.jpg',
    alt: 'Pīkau evidence vessel — cobalt and peach silk-organza drift on cream paper.',
  },
  toro: {
    src: '/img/kete/toro-vessel.png',
    alt: 'Tōro evidence vessel — smoky grey and cream sculptural form with thin gold wires.',
  },
};

type Aspect = '4/5' | '1/1' | '16/9' | '3/2';

const ASPECT_CLASS: Record<Aspect, string> = {
  '4/5': 'aspect-[4/5]',
  '1/1': 'aspect-square',
  '16/9': 'aspect-video',
  '3/2': 'aspect-[3/2]',
};

export function VesselTile({
  slug,
  name,
  accent,
  aspect = '4/5',
  priority = false,
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw',
  className = '',
}: {
  slug: KeteSlug;
  name: string;
  accent: string;
  aspect?: Aspect;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const locked = LOCKED[slug];
  const aspectClass = ASPECT_CLASS[aspect];

  if (locked) {
    return (
      <div
        className={`relative w-full overflow-hidden rounded-sm bg-[color:var(--assembl-mist)]/40 ${aspectClass} ${className}`}
        style={{ border: '1px solid rgba(43,107,87,0.18)' }}
      >
        <Image
          src={locked.src}
          alt={locked.alt}
          fill
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          sizes={sizes}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex w-full flex-col items-center justify-center overflow-hidden rounded-sm bg-[color:var(--assembl-paper)] ${aspectClass} ${className}`}
      style={{ border: '1px solid rgba(212,168,83,0.32)' }}
      aria-label={`${name} vessel — placeholder`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${accent} 0%, transparent 65%)`,
          opacity: 0.08,
        }}
      />
      <p
        className="relative z-10 font-display italic"
        style={{
          color: 'var(--text-primary)',
          fontWeight: 300,
          fontSize: 'clamp(2rem, 5vw, 3.6rem)',
          letterSpacing: '-0.005em',
        }}
      >
        {name}
      </p>
      <p
        className="relative z-10 mt-3 font-mono text-[10px] uppercase tracking-[0.32em]"
        style={{ color: 'var(--text-secondary)' }}
      >
        vessel forthcoming
      </p>
    </div>
  );
}
