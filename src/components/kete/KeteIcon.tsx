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

  const hRows =
    variant === "organic" ? [100, 120, 140, 160] :
    variant === "dense" ? [90, 105, 120, 135, 150, 165] :
    [100, 125, 150, 175];

  const vCols =
    variant === "dense" ? [65, 80, 95, 110, 125, 140, 155] :
    variant === "tricolor" ? [70, 100, 130] :
    [65, 100, 135];

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
          const inset = Math.max(0, i * 2);
          const col = variant === "tricolor" ? tricolors[i % tricolors.length] : accentColor;
          const delay = animated ? `${0.1 + i * 0.08}s` : undefined;

          return variant === "organic" ? (
            <path
              key={`h-${y}`}
              d={`M ${50 - inset} ${y} Q 100 ${y - 2} ${150 + inset} ${y}`}
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
              x1={50 - inset} y1={y}
              x2={150 + inset} y2={y}
              stroke={col}
              strokeWidth="1.5"
              opacity={variant === "dense" ? 0.75 : 0.85}
              className={animated ? "kete-weave-in" : ""}
              style={animated ? { strokeDasharray: 120, animationDelay: delay } : undefined}
            />
          );
        })}

        {/* Vertical weave strands */}
        {vCols.map((x, i) => {
          const col = variant === "tricolor" ? tricolors[i % tricolors.length] : accentColor;
          const delay = animated ? `${0.4 + i * 0.1}s` : undefined;

          return (
            <line
              key={`v-${x}`}
              x1={x} y1="85"
              x2={x} y2="175"
              stroke={col}
              strokeWidth="1.5"
              opacity={variant === "dense" ? 0.75 : 0.85}
              className={animated ? "kete-weave-in" : ""}
              style={animated ? { strokeDasharray: 100, animationDelay: delay } : undefined}
            />
          );
        })}

        {/* Constellation nodes — larger r=3 as specified */}
        {hRows.map((y, yi) =>
          vCols.map((x, xi) => (
            <circle
              key={`d-${x}-${y}`}
              cx={x} cy={y}
              r={variant === "dense" ? 2 : 3}
              fill={accentColor}
              opacity="0.8"
              className={animated ? "kete-glow-dot" : ""}
              style={animated ? { animationDelay: `${(yi * vCols.length + xi) * 0.15}s` } : undefined}
            />
          ))
        )}

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

        {/* Albatross silhouette for Tōroa */}
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
