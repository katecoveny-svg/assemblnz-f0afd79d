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
        {/* Background glow ring */}
        <circle
          cx="100" cy="110" r="95"
          fill="none"
          stroke={accentLight}
          strokeWidth="1"
          opacity="0.3"
          className={animated ? "kete-glow-pulse" : ""}
        />

        {/* Basket body — curved bottom */}
        <path
          d="M 40 80 Q 40 180 100 190 Q 160 180 160 80"
          fill="none"
          stroke={accentColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animated ? "kete-weave-in" : ""}
          style={animated ? { strokeDasharray: 300, animationDelay: "0s" } : undefined}
        />

        {/* Horizontal weave strands */}
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
              opacity="0.8"
              className={animated ? "kete-weave-in" : ""}
              style={animated ? { strokeDasharray: 120, animationDelay: delay } : undefined}
            />
          ) : (
            <line
              key={`h-${y}`}
              x1={50 - inset} y1={y}
              x2={150 + inset} y2={y}
              stroke={col}
              strokeWidth={variant === "dense" ? 1 : 1.5}
              opacity={variant === "dense" ? 0.7 : 0.8}
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
              strokeWidth={variant === "dense" ? 1 : 1.5}
              opacity={variant === "dense" ? 0.7 : 0.8}
              className={animated ? "kete-weave-in" : ""}
              style={animated ? { strokeDasharray: 100, animationDelay: delay } : undefined}
            />
          );
        })}

        {/* Glowing dot intersections */}
        {hRows.map((y, yi) =>
          vCols.map((x, xi) => (
            <circle
              key={`d-${x}-${y}`}
              cx={x} cy={y}
              r={variant === "dense" ? 1.2 : 1.5}
              fill={accentLight}
              opacity="0.6"
              className={animated ? "kete-glow-dot" : ""}
              style={animated ? { animationDelay: `${(yi * vCols.length + xi) * 0.15}s` } : undefined}
            />
          ))
        )}

        {/* Handle — animated breathing */}
        <path
          d="M 70 80 Q 100 30 130 80"
          fill="none"
          stroke={accentColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          className={animated ? (variant === "warm" ? "kete-handle-warm" : "kete-handle") : ""}
        />

        {/* Albatross silhouette for Tōroa */}
        {variant === "warm" && (
          <g opacity="0.4" className={animated ? "kete-albatross" : ""}>
            <ellipse cx="100" cy="110" rx="12" ry="8" fill={accentColor} />
            <path d="M 85 110 Q 70 108 60 112" stroke={accentColor} strokeWidth="1" fill="none" strokeLinecap="round" />
            <path d="M 115 110 Q 130 108 140 112" stroke={accentColor} strokeWidth="1" fill="none" strokeLinecap="round" />
            <circle cx="96" cy="108" r="1.5" fill={accentColor} />
          </g>
        )}
      </svg>
    </div>
  );
};

export default KeteIcon;
