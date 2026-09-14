/** @assembl/particle-field — stub. Organic particulate coordination. */
export interface ParticleFieldProps {
  count?: number;
  demo?: boolean;
}

export function ParticleField({ count = 24, demo = true }: ParticleFieldProps) {
  return (
    <div
      data-assembl-block="particle-field"
      data-demo={demo ? 'true' : undefined}
      role="img"
      aria-label="Particle field assembling"
      style={{
        position: 'relative',
        height: 180,
        background: '#240B21',
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            width: 3,
            height: 3,
            borderRadius: '50%',
            background: i % 5 === 0 ? '#916A70' : '#F5F1F2',
            top: `${(i * 37) % 100}%`,
            left: `${(i * 53) % 100}%`,
            opacity: 0.55 + (i % 3) * 0.1,
          }}
        />
      ))}
      {demo ? (
        <span
          style={{
            position: 'absolute',
            right: 10,
            bottom: 8,
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: 10,
            color: '#916A70',
          }}
        >
          @assembl/particle-field · DEMO
        </span>
      ) : null}
    </div>
  );
}

export default ParticleField;
