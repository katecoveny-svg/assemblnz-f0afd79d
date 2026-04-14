/**
 * Maunga Border — mountain range silhouette inspired by NZ Southern Alps.
 * Replaces the zigzag tāniko pattern with an organic mountain ridge line.
 */
const MaungaBorder = ({
  className = "",
  height = 12,
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

  return (
    <svg
      className={className}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      viewBox="0 0 400 12"
      style={{ transform: flip ? "scaleY(-1)" : undefined, display: "block" }}
    >
      <defs>
        <linearGradient id={`maunga-grad-${variant}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={primary} stopOpacity="0" />
          <stop offset="20%" stopColor={primary} stopOpacity="0.5" />
          <stop offset="50%" stopColor="#D4A853" stopOpacity="0.6" />
          <stop offset="80%" stopColor={primary} stopOpacity="0.5" />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`maunga-fill-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={primary} stopOpacity="0.12" />
          <stop offset="100%" stopColor={primary} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Mountain silhouette fill */}
      <path
        d="M0 12 L10 8 L22 10 L35 5 L48 9 L58 3 L68 7 L80 2 L92 6 L105 1 L118 5 L128 3 L140 7 L152 2 L165 6 L175 4 L188 8 L200 1 L212 6 L222 3 L235 7 L245 2 L258 5 L270 3 L280 7 L292 4 L305 8 L315 2 L328 6 L340 4 L352 8 L365 3 L378 7 L390 5 L400 9 L400 12 Z"
        fill={`url(#maunga-fill-${variant})`}
      />
      {/* Mountain ridge line */}
      <path
        d="M0 12 L10 8 L22 10 L35 5 L48 9 L58 3 L68 7 L80 2 L92 6 L105 1 L118 5 L128 3 L140 7 L152 2 L165 6 L175 4 L188 8 L200 1 L212 6 L222 3 L235 7 L245 2 L258 5 L270 3 L280 7 L292 4 L305 8 L315 2 L328 6 L340 4 L352 8 L365 3 L378 7 L390 5 L400 9"
        fill="none"
        stroke={`url(#maunga-grad-${variant})`}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Dawn gold highlight on the peaks */}
      <path
        d="M80 2 L92 6 M105 1 L118 5 M152 2 L165 6 M200 1 L212 6 M245 2 L258 5 M315 2 L328 6"
        fill="none"
        stroke="#D4A853"
        strokeWidth="0.8"
        opacity="0.4"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default MaungaBorder;
