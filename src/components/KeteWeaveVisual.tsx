import { motion } from "framer-motion";

/**
 * KeteWeaveVisual — Animated SVG kete basket with liquid glass glow
 * Used as the hero visual and section dividers
 */

interface Props {
  size?: number;
  accentColor?: string;
  accentLight?: string;
  className?: string;
  /** Shows data nodes at weave intersections */
  showNodes?: boolean;
  /** Pulsing glow ring */
  showGlow?: boolean;
}

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function KeteWeaveVisual({
  size = 200,
  accentColor = "#D4A843",
  accentLight = "#F0D078",
  className = "",
  showNodes = true,
  showGlow = true,
}: Props) {
  const hRows = [95, 115, 135, 155, 175];
  const vCols = [60, 80, 100, 120, 140];

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size * 1.15 }}>
      {/* Ambient glow ring */}
      {showGlow && (
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: "-20%",
            background: `radial-gradient(circle, ${accentColor}12 0%, ${accentColor}04 40%, transparent 65%)`,
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <svg
        viewBox="0 0 200 230"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        role="img"
        aria-label="Kete basket — woven knowledge container"
      >
        {/* Outer glow circle */}
        <circle cx="100" cy="115" r="98" fill="none" stroke={accentColor} strokeWidth="0.5" opacity="0.15" />

        {/* Glass fill — subtle gradient */}
        <path
          d="M 35 80 Q 35 190 100 200 Q 165 190 165 80"
          fill={`url(#glass-fill-${accentColor.replace('#', '')})`}
          opacity="0.06"
        />

        {/* Basket body — main form */}
        <motion.path
          d="M 35 80 Q 35 190 100 200 Q 165 190 165 80"
          fill="none"
          stroke={accentColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease }}
        />

        {/* Horizontal weave strands */}
        {hRows.map((y, i) => {
          const inset = i * 2;
          return (
            <motion.line
              key={`h-${y}`}
              x1={45 - inset} y1={y}
              x2={155 + inset} y2={y}
              stroke={i % 2 === 0 ? accentColor : accentLight}
              strokeWidth="1.2"
              opacity="0.7"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.7 }}
              transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease }}
            />
          );
        })}

        {/* Vertical weave strands */}
        {vCols.map((x, i) => (
          <motion.line
            key={`v-${x}`}
            x1={x} y1="85"
            x2={x} y2="185"
            stroke={i % 2 === 0 ? accentColor : accentLight}
            strokeWidth="1.2"
            opacity="0.6"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 0.8, delay: 0.6 + i * 0.08, ease }}
          />
        ))}

        {/* Data nodes at intersections */}
        {showNodes && hRows.map((y, yi) =>
          vCols.map((x, xi) => (
            <motion.circle
              key={`n-${x}-${y}`}
              cx={x} cy={y}
              r={2.5}
              fill={accentColor}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.85 }}
              transition={{ delay: 1 + (yi * vCols.length + xi) * 0.04, duration: 0.3 }}
            />
          ))
        )}

        {/* Connection lines between nodes — data flow */}
        {showNodes && !window.matchMedia("(prefers-reduced-motion: reduce)").matches && (
          <g opacity="0.15">
            {hRows.slice(0, -1).map((y, yi) =>
              vCols.slice(0, -1).map((x, xi) => (
                <motion.line
                  key={`c-${x}-${y}`}
                  x1={x} y1={y}
                  x2={vCols[xi + 1]} y2={hRows[yi + 1]}
                  stroke={accentLight}
                  strokeWidth="0.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1.5 + (yi * 4 + xi) * 0.05, duration: 0.5 }}
                />
              ))
            )}
          </g>
        )}

        {/* Handle with liquid glow */}
        <motion.path
          d="M 65 80 Q 100 25 135 80"
          fill="none"
          stroke={accentColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.2, ease }}
        />

        {/* Specular highlight on handle */}
        <motion.path
          d="M 72 76 Q 100 32 128 76"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        />

        <defs>
          <radialGradient id={`glass-fill-${accentColor.replace('#', '')}`} cx="50%" cy="40%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
