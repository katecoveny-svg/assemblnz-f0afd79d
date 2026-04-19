import { motion } from "framer-motion";

/**
 * MatarikiCluster — A cluster of 7-9 stars arranged like the Matariki (Pleiades)
 * constellation. Each cluster represents connected intelligence / a kete of data.
 *
 * Props:
 * - color: accent colour for the stars
 * - size: bounding box size
 * - starCount: 7-9 stars
 * - showLines: draw connecting lines between nearby stars
 * - delay: animation start delay
 * - pulse: continuous gentle pulse animation
 */

interface Props {
  color?: string;
  size?: number;
  starCount?: number;
  showLines?: boolean;
  delay?: number;
  pulse?: boolean;
  className?: string;
}

// Fixed cluster layouts — natural-looking groupings (normalised 0-1)
const LAYOUTS: [number, number][][] = [
  // Classic Matariki — tight central cluster
  [[0.45, 0.35], [0.55, 0.30], [0.50, 0.50], [0.40, 0.55], [0.60, 0.52], [0.35, 0.42], [0.52, 0.40]],
  // Spread diamond
  [[0.50, 0.20], [0.35, 0.38], [0.65, 0.38], [0.45, 0.50], [0.55, 0.50], [0.40, 0.65], [0.60, 0.65], [0.50, 0.75]],
  // Compact triangle
  [[0.50, 0.25], [0.38, 0.40], [0.62, 0.40], [0.44, 0.55], [0.56, 0.55], [0.50, 0.68], [0.48, 0.42]],
];

const MatarikiCluster = ({
  color = "#A8DDDB",
  size = 120,
  starCount = 7,
  showLines = true,
  delay = 0,
  pulse = true,
  className = "",
}: Props) => {
  // Pick layout based on starCount
  const layoutIdx = starCount >= 8 ? 1 : starCount <= 6 ? 2 : 0;
  const stars = LAYOUTS[layoutIdx].slice(0, starCount);

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`pointer-events-none ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      {/* Connecting lines — white/silver moonlit */}
      {showLines && stars.map((s, i) =>
        stars.slice(i + 1).map((t, j) => {
          const dx = (s[0] - t[0]) * size;
          const dy = (s[1] - t[1]) * size;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > size * 0.35) return null;
          return (
            <motion.line
              key={`l-${i}-${j}`}
              x1={s[0] * size} y1={s[1] * size}
              x2={t[0] * size} y2={t[1] * size}
              stroke="rgba(220,230,245,0.6)"
              strokeWidth="0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              transition={{ duration: 0.3, delay: delay + 0.2 + i * 0.05 }}
            />
          );
        })
      )}

      {/* Stars — mostly white, lead star picks up accent tint */}
      {stars.map(([x, y], i) => {
        const cx = x * size;
        const cy = y * size;
        const r = i === 0 ? 2.5 : 1.5 + Math.random() * 0.8;
        const starColor = i === 0 ? color : "rgba(240,240,255,1)"; // lead star = accent, rest = white
        return (
          <g key={`s-${i}`}>
            {/* Glow halo — white */}
            <motion.circle
              cx={cx} cy={cy} r={r * 4}
              fill="rgba(255,255,255,0.8)"
              initial={{ opacity: 0 }}
              animate={pulse
                ? { opacity: [0, 0.1, 0.05, 0.1, 0] }
                : { opacity: 0.07 }
              }
              transition={pulse
                ? { duration: 3 + i * 0.3, repeat: Infinity, delay: delay + i * 0.15 }
                : { duration: 0.3, delay: delay + i * 0.08 }
              }
            />
            {/* Star core */}
            <motion.circle
              cx={cx} cy={cy} r={r}
              fill={starColor}
              initial={{ opacity: 0, scale: 0 }}
              animate={pulse
                ? { opacity: [0.6, 1, 0.6], scale: 1 }
                : { opacity: 0.85, scale: 1 }
              }
              transition={pulse
                ? { opacity: { duration: 2 + i * 0.2, repeat: Infinity, delay: delay + i * 0.1 }, scale: { duration: 0.3, delay: delay + i * 0.08 } }
                : { duration: 0.3, delay: delay + i * 0.08 }
              }
            />
          </g>
        );
      })}
    </motion.svg>
  );
};

export default MatarikiCluster;
