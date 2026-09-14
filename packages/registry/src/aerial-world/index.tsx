/** @assembl/aerial-world — stub. Top-down fine-art field. */
export interface AerialWorldProps {
  caption?: string;
  demo?: boolean;
}

export function AerialWorld({
  caption = 'Aerial field — flocking into one plan',
  demo = true,
}: AerialWorldProps) {
  return (
    <section
      data-assembl-block="aerial-world"
      data-demo={demo ? 'true' : undefined}
      style={{
        minHeight: '60vh',
        background:
          'radial-gradient(circle at 40% 45%, rgba(145,106,112,0.35), transparent 40%), #240B21',
        color: '#FFFDFB',
        display: 'grid',
        placeItems: 'end center',
        padding: '1.5rem',
      }}
    >
      <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: '#F5F1F2', margin: 0 }}>
        @assembl/aerial-world · {caption}
        {demo ? ' · DEMO stub' : ''}
      </p>
    </section>
  );
}

export default AerialWorld;
