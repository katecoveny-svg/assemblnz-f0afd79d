/**
 * BrandColourwayStrip — "Dash in your brand's colours." Shows the per-brand
 * recoloured mascots (public/dash/dash-mascot-{airnz,bp,seek,woolworths}.png)
 * as white-label proof. Presentational. See the components brief.
 */
const BRANDS = [
  { name: 'Air NZ', src: '/dash/dash-mascot-airnz.png' },
  { name: 'Woolworths', src: '/dash/dash-mascot-woolworths.png' },
  { name: 'SEEK', src: '/dash/dash-mascot-seek.png' },
  { name: 'BP', src: '/dash/dash-mascot-bp.png' },
] as const;

export function BrandColourwayStrip() {
  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {BRANDS.map(({ name, src }) => (
          <figure
            key={name}
            style={{
              margin: 0,
              background: 'var(--surface)',
              border: '2px solid var(--accent)',
              borderRadius: 'var(--r-lg)',
              overflow: 'hidden',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`The Dash dachshund in ${name}'s colourway`}
              loading="lazy"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            <figcaption
              style={{
                padding: '12px 16px',
                fontFamily: 'var(--ff-mono)',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.04em',
                borderTop: '2px solid var(--accent)',
              }}
            >
              {name}
            </figcaption>
          </figure>
        ))}
      </div>
      <p
        className="body"
        style={{ marginTop: 18, color: 'var(--muted)', maxWidth: 560, fontStyle: 'italic' }}
      >
        “Your agents, your branding, our reward layer.”
      </p>
    </div>
  );
}
