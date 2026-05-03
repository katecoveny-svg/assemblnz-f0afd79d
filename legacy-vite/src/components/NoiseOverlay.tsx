/**
 * SVG noise texture overlay at 3% opacity — kills the flat AI look.
 */
export default function NoiseOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[100]"
      style={{ opacity: 0.03, mixBlendMode: "overlay" }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
}
