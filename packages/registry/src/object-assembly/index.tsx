/** @assembl/object-assembly — stub. MANY→COORDINATION→ONE object. */
export interface ObjectAssemblyProps {
  label?: string;
  pieceCount?: number;
  demo?: boolean;
}

export function ObjectAssembly({
  label = 'Plan object',
  pieceCount = 7,
  demo = true,
}: ObjectAssemblyProps) {
  return (
    <div
      data-assembl-block="object-assembly"
      data-demo={demo ? 'true' : undefined}
      role="img"
      aria-label={`${label}: ${pieceCount} pieces assembling`}
      style={{
        aspectRatio: '1',
        maxWidth: 360,
        margin: '0 auto',
        background: '#FFFDFB',
        border: '1px solid rgba(36,11,33,0.12)',
        display: 'grid',
        placeItems: 'center',
        position: 'relative',
      }}
    >
      <div style={{ position: 'relative', width: '55%', height: '55%' }}>
        {Array.from({ length: pieceCount }).map((_, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              width: 18,
              height: 18,
              borderRadius: 2,
              background: i === pieceCount - 1 ? '#916A70' : '#240B21',
              top: `${(i * 13) % 80}%`,
              left: `${(i * 17) % 80}%`,
              opacity: 0.85,
            }}
          />
        ))}
      </div>
      <p
        style={{
          position: 'absolute',
          bottom: 12,
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: 11,
          color: '#654A4E',
        }}
      >
        @assembl/object-assembly{demo ? ' · DEMO' : ''}
      </p>
    </div>
  );
}

export default ObjectAssembly;
