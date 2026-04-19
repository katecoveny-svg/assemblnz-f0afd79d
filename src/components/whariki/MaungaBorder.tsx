/**
 * Maunga Border — mountain peak pattern inspired by the user's sketch.
 * Groups of filled and outlined triangles sitting on a baseline,
 * alternating pounamu green and dawn gold.
 */
const MaungaBorder = ({
  className = "",
  height = 16,
  variant = "top",
  accentColor,
}: {
  className?: string;
  height?: number;
  variant?: "top" | "bottom";
  accentColor?: string;
}) => {
  const flip = variant === "bottom";
  const primary = accentColor || "#3A7D6E";
  const gold = "#4AA5A8";

  // Each "cluster" is a group of peaks: mix of filled (▲) and outlined (△) triangles
  // Pattern from sketch: baseline with clusters of 2-3 peaks, some filled some outline
  return (
    <svg
      className={className}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      viewBox="0 0 400 16"
      style={{ transform: flip ? "scaleY(-1)" : undefined, display: "block" }}
    >
      {/* Baseline */}
      <line x1="0" y1="13" x2="400" y2="13" stroke={primary} strokeWidth="0.8" opacity="0.3" />

      {/* Cluster 1 — left */}
      <polygon points="30,13 37,4 44,13" fill={primary} opacity="0.5" />
      <polygon points="42,13 49,5 56,13" fill="none" stroke={primary} strokeWidth="0.8" opacity="0.4" />
      <polygon points="52,13 58,6 64,13" fill={primary} opacity="0.4" />

      {/* Cluster 2 */}
      <polygon points="110,13 116,5 122,13" fill="none" stroke={gold} strokeWidth="0.8" opacity="0.5" />
      <polygon points="120,13 127,3 134,13" fill={gold} opacity="0.35" />
      <polygon points="132,13 138,6 144,13" fill="none" stroke={gold} strokeWidth="0.8" opacity="0.4" />

      {/* Cluster 3 — center */}
      <polygon points="185,13 192,4 199,13" fill={primary} opacity="0.45" />
      <polygon points="196,13 203,2 210,13" fill={primary} opacity="0.55" />
      <polygon points="208,13 214,6 220,13" fill="none" stroke={primary} strokeWidth="0.8" opacity="0.35" />

      {/* Cluster 4 */}
      <polygon points="268,13 274,5 280,13" fill="none" stroke={gold} strokeWidth="0.8" opacity="0.45" />
      <polygon points="278,13 285,3 292,13" fill={gold} opacity="0.4" />

      {/* Cluster 5 — right */}
      <polygon points="340,13 346,6 352,13" fill={primary} opacity="0.4" />
      <polygon points="350,13 357,4 364,13" fill="none" stroke={primary} strokeWidth="0.8" opacity="0.35" />
      <polygon points="362,13 368,5 374,13" fill={primary} opacity="0.5" />

      {/* Diagonal connector lines from sketch (bottom-left to first cluster, etc.) */}
      <line x1="0" y1="13" x2="30" y2="13" stroke={primary} strokeWidth="0.6" opacity="0.2" />
      <line x1="374" y1="13" x2="400" y2="13" stroke={primary} strokeWidth="0.6" opacity="0.2" />
    </svg>
  );
};

export default MaungaBorder;
