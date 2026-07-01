/**
 * Placeholder Aironaut mark — a compass rose over a freight/koru motif.
 *
 * This is a generic silhouette, NOT the real Aironaut Customs Brokers logo.
 * The pilot never reproduces the client's actual logo; the handoff step is to
 * drop in their supplied wordmark/logo once approved.
 */
export function AironautMark({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="Aironaut mark (placeholder)"
      className="air-compass"
    >
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
      <circle cx="24" cy="24" r="15.5" stroke="currentColor" strokeWidth="0.75" opacity="0.45" />
      {/* Compass star */}
      <path
        d="M24 6 L27 21 L42 24 L27 27 L24 42 L21 27 L6 24 L21 21 Z"
        fill="currentColor"
        opacity="0.92"
      />
      {/* Inner koru-freight curl */}
      <path
        d="M24 18 a6 6 0 1 0 5.6 8"
        stroke="#071B33"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      <circle cx="24" cy="24" r="2" fill="#071B33" />
    </svg>
  );
}
