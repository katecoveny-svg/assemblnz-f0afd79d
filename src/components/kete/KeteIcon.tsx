import React from "react";

interface KeteIconProps {
  name: string;
  accentColor: string;
  accentLight: string;
  variant: "standard" | "dense" | "organic" | "tricolor" | "warm";
  size?: "small" | "medium" | "large";
  animated?: boolean;
}

const KeteIcon: React.FC<KeteIconProps> = ({
  accentColor,
  accentLight,
  variant = "standard",
  size = "medium",
  animated = true,
}) => {
  const sizeMap = { small: "w-20 h-20", medium: "w-40 h-44", large: "w-56 h-64" };

  // Helper: get the x-extent of the basket at a given y
  // Basket path: M 40 80 Q 40 180 100 190 Q 160 180 160 80
  // Left edge: quadratic from (40,80) ctrl (40,180) to (100,190)
  // Right edge: quadratic from (100,190) ctrl (160,180) to (160,80)
  const basketX = (y: number): [number, number] => {
    if (y <= 80) return [40, 160];
    if (y >= 190) return [100, 100];
    // Solve for t: y = (1-t)^2*80 + 2*(1-t)*t*180 + t^2*190
    // Approximate with linear interpolation for simplicity
    const t = (y - 80) / (190 - 80);
    const leftX = (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * 40 + t * t * 100;
    const rightX = (1 - t) * (1 - t) * 160 + 2 * (1 - t) * t * 160 + t * t * 100;
    return [leftX + 4, rightX - 4];
  };

  const hRows =
    variant === "organic" ? [95, 115, 135, 155] :
    variant === "dense" ? [90, 105, 120, 135, 150, 165] :
    [95, 120, 145, 170];

  const vCols =
    variant === "dense" ? [65, 80, 95, 110, 125, 140, 155] :
    variant === "tricolor" ? [75, 100, 125] :
    [75, 100, 125];

  const tricolors = [accentColor, accentLight, "#3A7D6E", accentColor];

  const animClass = animated
    ? variant === "dense" ? "kete-float-dense" : "kete-float"
    : "";

  return (
    <div className={`${sizeMap[size]} flex items-center justify-center`}>
      <svg
        viewBox="0 0 200 220"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${animClass}`}
        style={{ willChange: animated ? "transform" : undefined }}
        role="img"
        aria-label={`Kete basket icon`}
      >
        {/* Background glow ring — larger, more prominent */}
        <circle
          cx="100" cy="110" r="95"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
          opacity="0.25"
          className={animated ? "kete-glow-pulse" : ""}
        />
        {/* Inner glow ring */}
        <circle
          cx="100" cy="110" r="80"
          fill="none"
          stroke={accentLight}
          strokeWidth="0.5"
          opacity="0.15"
        />

        {/* Basket body — curved bottom, thicker stroke */}
        <path
          d="M 40 80 Q 40 180 100 190 Q 160 180 160 80"
          fill="none"
          stroke={accentColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animated ? "kete-weave-in" : ""}
          style={animated ? { strokeDasharray: 300, animationDelay: "0s" } : undefined}
        />

        {/* Horizontal weave strands — 1.5px as specified */}
        {hRows.map((y, i) => {
          const [lx, rx] = basketX(y);
          const col = variant === "tricolor" ? tricolors[i % tricolors.length] : accentColor;
          const delay = animated ? `${0.1 + i * 0.08}s` : undefined;

          return variant === "organic" ? (
            <path
              key={`h-${y}`}
              d={`M ${lx} ${y} Q 100 ${y - 2} ${rx} ${y}`}
              stroke={col}
              strokeWidth="1.5"
              fill="none"
              opacity="0.85"
              className={animated ? "kete-weave-in" : ""}
              style={animated ? { strokeDasharray: 120, animationDelay: delay } : undefined}
            />
          ) : (
            <line
              key={`h-${y}`}
              x1={lx} y1={y}
              x2={rx} y2={y}
              stroke={col}
              strokeWidth="1.5"
              opacity={variant === "dense" ? 0.75 : 0.85}
              className={animated ? "kete-weave-in" : ""}
              style={animated ? { strokeDasharray: 120, animationDelay: delay } : undefined}
            />
          );
        })}

        {/* Vertical weave strands — clipped to basket */}
        {vCols.map((x, i) => {
          const col = variant === "tricolor" ? tricolors[i % tricolors.length] : accentColor;
          const delay = animated ? `${0.4 + i * 0.1}s` : undefined;
          // Find the y range where this x is inside the basket
          const yStart = 82;
          // Find bottom y where basket edge reaches this x
          const yEnd = Math.min(185, 80 + ((x >= 100 ? (160 - x) : (x - 40)) / 60) * 110);

          return (
            <line
              key={`v-${x}`}
              x1={x} y1={yStart}
              x2={x} y2={yEnd}
              stroke={col}
              strokeWidth="1.5"
              opacity={variant === "dense" ? 0.75 : 0.85}
              className={animated ? "kete-weave-in" : ""}
              style={animated ? { strokeDasharray: 100, animationDelay: delay } : undefined}
            />
          );
        })}

        {/* Constellation nodes — only render if inside basket */}
        {hRows.map((y, yi) => {
          const [lx, rx] = basketX(y);
          return vCols.map((x, xi) => {
            if (x < lx || x > rx) return null;
            return (
              <circle
                key={`d-${x}-${y}`}
                cx={x} cy={y}
                r={variant === "dense" ? 2 : 3}
                fill={accentColor}
                opacity="0.8"
                className={animated ? "kete-glow-dot" : ""}
                style={animated ? { animationDelay: `${(yi * vCols.length + xi) * 0.15}s` } : undefined}
              />
            );
          });
        })}

        {/* Outer constellation marks — decorative stars */}
        <circle cx="30" cy="60" r="2" fill={accentLight} opacity="0.4" className={animated ? "kete-glow-dot" : ""} />
        <circle cx="170" cy="65" r="1.5" fill={accentColor} opacity="0.35" className={animated ? "kete-glow-dot" : ""} />
        <circle cx="25" cy="130" r="1.5" fill={accentLight} opacity="0.3" className={animated ? "kete-glow-dot" : ""} />
        <circle cx="175" cy="140" r="2" fill={accentColor} opacity="0.35" className={animated ? "kete-glow-dot" : ""} />
        {/* Connecting constellation lines */}
        <line x1="30" y1="60" x2="65" y2="100" stroke={accentColor} strokeWidth="0.5" opacity="0.2" />
        <line x1="170" y1="65" x2="135" y2="100" stroke={accentColor} strokeWidth="0.5" opacity="0.2" />

        {/* Handle — animated breathing, thicker */}
        <path
          d="M 70 80 Q 100 30 130 80"
          fill="none"
          stroke={accentColor}
          strokeWidth="3"
          strokeLinecap="round"
          className={animated ? (variant === "warm" ? "kete-handle-warm" : "kete-handle") : ""}
        />

        {/* Albatross silhouette for Toro */}
        {variant === "warm" && (
          <g opacity="0.5" className={animated ? "kete-albatross" : ""}>
            <ellipse cx="100" cy="110" rx="14" ry="9" fill={accentColor} />
            <path d="M 83 110 Q 66 107 55 112" stroke={accentColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M 117 110 Q 134 107 145 112" stroke={accentColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <circle cx="95" cy="107" r="2" fill={accentColor} />
          </g>
        )}
      </svg>
    </div>
  );
};

export default KeteIcon;
