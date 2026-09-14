/** @assembl/cinema-hero — stub. Full-bleed cinematic hero plane. */
export interface CinemaHeroProps {
  title?: string;
  posterSrc?: string;
  /** DEMO honesty — real video authoring lands later. */
  demo?: boolean;
}

export function CinemaHero({
  title = 'Cinema hero',
  posterSrc,
  demo = true,
}: CinemaHeroProps) {
  return (
    <section
      data-assembl-block="cinema-hero"
      data-demo={demo ? 'true' : undefined}
      style={{
        position: 'relative',
        minHeight: '70vh',
        background: '#240B21',
        color: '#FFFDFB',
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
      }}
    >
      {posterSrc ? (
        <div
          role="img"
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${posterSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.55,
          }}
        />
      ) : null}
      <div style={{ position: 'relative', textAlign: 'center', padding: '2rem' }}>
        <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: '#916A70' }}>
          @assembl/cinema-hero{demo ? ' · DEMO stub' : ''}
        </p>
        <h2 style={{ fontFamily: 'Instrument Sans, sans-serif', fontWeight: 450, fontSize: 'clamp(1.8rem,4vw,3rem)', margin: '0.5rem 0 0' }}>
          {title}
        </h2>
      </div>
    </section>
  );
}

export default CinemaHero;
