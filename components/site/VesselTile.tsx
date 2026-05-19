import Image from 'next/image';
import type { KeteSlug } from '@/lib/kete';

const LOCKED: Partial<Record<KeteSlug, { src: string; alt: string }>> = {
  waihanga: {
    src: '/img/kete/heroes-vessel/waihanga-hero-vessel.jpg',
    alt: 'Waihanga evidence vessel — pounamu stacked vessel on warm paper.',
  },
  manaaki: {
    src: '/img/kete/heroes-vessel/manaaki-hero-vessel.jpg',
    alt: 'Manaaki evidence vessel — clay-toned vessel on warm paper.',
  },
  pikau: {
    src: '/img/kete/heroes-vessel/pikau-hero-vessel.jpg',
    alt: 'Pīkau evidence vessel — blue stacked vessel on warm paper.',
  },
  arataki: {
    src: '/img/kete/heroes-vessel/arataki-hero-vessel.jpg',
    alt: 'Arataki evidence vessel — amber stacked vessel on warm paper.',
  },
  auaha: {
    src: '/img/kete/heroes-vessel/auaha-hero-vessel.jpg',
    alt: 'Auaha evidence vessel — violet sculptural vessel on warm paper.',
  },
  ako: {
    src: '/img/kete/heroes-vessel/ako-hero-vessel.jpg',
    alt: 'Ako evidence vessel — amber folded vessel on warm paper.',
  },
  matauranga: {
    src: '/img/kete/heroes-vessel/matauranga-hero-vessel.jpg',
    alt: 'Mātauranga evidence vessel — layered vessel with gold thread on warm paper.',
  },
  hoko: {
    src: '/img/kete/heroes-vessel/hoko-hero-vessel.jpg',
    alt: 'Hoko evidence vessel — violet sculptural vessel on warm paper.',
  },
  toro: {
    src: '/img/brand/toro-brand-square-bird.png',
    alt: 'Tōro bird-form family vessel on warm paper.',
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
