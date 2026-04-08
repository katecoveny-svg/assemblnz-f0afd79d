import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Maunga motif — layered triangle mountain range with glowing
 * Mārama constellation nodes (Electric Blue / Aurora Green / Ocean Teal).
 * Stars act as data-nodes connected by luminous filaments above the peaks.
 */

const ELECTRIC = "#00CFFF";
const AURORA = "#00FF9C";
const OCEAN = "#1B5E6B";

const STARS = [
  { cx: 50, cy: 10, r: 4.5, delay: 0, glow: 20, color: ELECTRIC },
  { cx: 36, cy: 18, r: 3, delay: 0.3, glow: 14, color: AURORA },
  { cx: 64, cy: 16, r: 3.5, delay: 0.5, glow: 16, color: ELECTRIC },
  { cx: 42, cy: 6, r: 2.5, delay: 0.8, glow: 12, color: AURORA },
  { cx: 58, cy: 4, r: 2.5, delay: 1.0, glow: 12, color: ELECTRIC },
  { cx: 50, cy: -2, r: 3, delay: 0.2, glow: 14, color: AURORA },
  { cx: 28, cy: 12, r: 2, delay: 1.2, glow: 10, color: OCEAN },
  { cx: 72, cy: 12, r: 2, delay: 0.7, glow: 10, color: OCEAN },
  { cx: 50, cy: 22, r: 2.2, delay: 1.5, glow: 11, color: ELECTRIC },
];

const CONNECTIONS = [
  [0, 1], [0, 2], [0, 5], [1, 3], [2, 4], [3, 5], [4, 5],
  [1, 6], [2, 7], [0, 8], [6, 3], [7, 4],
];

/* Triangle mountain layers — back to front */
const MOUNTAINS = [
  // Far range — subtle
  { d: "M0 70 L15 42 L28 52 L40 36 L52 48 L65 34 L78 46 L90 38 L100 70 Z", opacity: 0.03, stroke: 0.04 },
  // Mid range
  { d: "M5 70 L25 40 L38 48 L50 30 L62 48 L75 38 L95 70 Z", opacity: 0.06, stroke: 0.08 },
  // Front range — strongest
  { d: "M10 70 L30 44 L42 50 L50 36 L58 50 L70 44 L90 70 Z", opacity: 0.10, stroke: 0.14 },
];

/* Triangular facets within the main peak for geometric detail */
const FACETS = [
  { d: "M50 36 L42 50 L58 50 Z", opacity: 0.08 },
  { d: "M50 36 L38 48 L42 50 Z", opacity: 0.05 },
  { d: "M50 36 L58 50 L62 48 Z", opacity: 0.05 },
  { d: "M30 44 L38 48 L42 50 L35 55 Z", opacity: 0.04 },
  { d: "M70 44 L62 48 L58 50 L65 55 Z", opacity: 0.04 },
];

interface Props {
  className?: string;
  size?: number;
  showMaunga?: boolean;
}

const MaungaStarCluster = ({ className = "", size = 400, showMaunga = true }: Props) => {
  const isMobile = useIsMobile();
  const s = isMobile ? size * 0.65 : size;

  return (
    <div className={`relative ${className}`} style={{ width: s, height: s * 0.7 }}>
      <svg
        viewBox="0 0 100 70"
        fill="none"
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          {/* Per-star radial glow gradients */}
          {STARS.map((star, i) => (
            <radialGradient key={`sg-${i}`} id={`star-glow-${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={star.color} stopOpacity="0.9" />
              <stop offset="35%" stopColor={star.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={star.color} stopOpacity="0" />
            </radialGradient>
          ))}

          {/* Mountain fill gradients */}
          <linearGradient id="maunga-electric" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor={ELECTRIC} stopOpacity="0.12" />
            <stop offset="60%" stopColor={OCEAN} stopOpacity="0.04" />
            <stop offset="100%" stopColor={OCEAN} stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="maunga-aurora" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor={AURORA} stopOpacity="0.08" />
            <stop offset="100%" stopColor={OCEAN} stopOpacity="0.01" />
          </linearGradient>

          <filter id="star-blur-m">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <filter id="big-glow-m">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="mountain-glow">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* ── Mountain layers ── */}
        {showMaunga && (
          <>
            {/* Glow aura behind mountains */}
            <motion.path
              d={MOUNTAINS[2].d}
              fill={ELECTRIC}
              filter="url(#mountain-glow)"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.03, 0.07, 0.03] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Layered mountain silhouettes */}
            {MOUNTAINS.map((m, i) => (
              <path
                key={`mtn-${i}`}
                d={m.d}
                fill={i === 2 ? "url(#maunga-electric)" : "url(#maunga-aurora)"}
                stroke={ELECTRIC}
                strokeOpacity={m.stroke}
                strokeWidth="0.3"
                opacity={1}
              />
            ))}

            {/* Geometric triangle facets */}
            {FACETS.map((f, i) => (
              <motion.path
                key={`facet-${i}`}
                d={f.d}
                fill={i % 2 === 0 ? ELECTRIC : AURORA}
                stroke={ELECTRIC}
                strokeWidth="0.15"
                strokeOpacity={0.15}
                initial={{ opacity: 0 }}
                animate={{ opacity: [f.opacity * 0.5, f.opacity, f.opacity * 0.5] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
              />
            ))}

            {/* Ridge lines — electric glow edges */}
            <path
              d="M30 44 L42 50 L50 36 L58 50 L70 44"
              fill="none"
              stroke={ELECTRIC}
              strokeWidth="0.4"
              strokeOpacity={0.2}
              strokeLinecap="round"
            />
            <path
              d="M25 40 L38 48 L50 30 L62 48 L75 38"
              fill="none"
              stroke={AURORA}
              strokeWidth="0.25"
              strokeOpacity={0.1}
              strokeLinecap="round"
            />
          </>
        )}

        {/* ── Constellation connection lines ── */}
        {CONNECTIONS.map(([a, b], i) => {
          const colA = STARS[a].color;
          return (
            <motion.line
              key={`line-${i}`}
              x1={STARS[a].cx}
              y1={STARS[a].cy}
              x2={STARS[b].cx}
              y2={STARS[b].cy}
              stroke={colA}
              strokeWidth="0.3"
              strokeOpacity={0.25}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.08, 0.25, 0.08] }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 0.18 }}
            />
          );
        })}

        {/* ── Star glow halos ── */}
        {STARS.map((star, i) => (
          <motion.circle
            key={`halo-${i}`}
            cx={star.cx}
            cy={star.cy}
            r={star.glow}
            fill={`url(#star-glow-${i})`}
            filter="url(#big-glow-m)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.28, 0.1] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: star.delay, ease: "easeInOut" }}
          />
        ))}

        {/* ── Star cores ── */}
        {STARS.map((star, i) => (
          <motion.circle
            key={`core-${i}`}
            cx={star.cx}
            cy={star.cy}
            r={star.r}
            fill={star.color}
            filter="url(#star-blur-m)"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [0.9, 1.15, 0.9],
            }}
            transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, delay: star.delay, ease: "easeInOut" }}
          />
        ))}

        {/* ── Bright centre dots ── */}
        {STARS.map((star, i) => (
          <motion.circle
            key={`dot-${i}`}
            cx={star.cx}
            cy={star.cy}
            r={star.r * 0.35}
            fill="white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, delay: star.delay + 0.5 }}
          />
        ))}

        {/* ── Floating particle motes ── */}
        {[
          { cx: 18, cy: 30, color: ELECTRIC },
          { cx: 82, cy: 28, color: AURORA },
          { cx: 45, cy: 55, color: OCEAN },
          { cx: 75, cy: 58, color: ELECTRIC },
          { cx: 22, cy: 50, color: AURORA },
        ].map((p, i) => (
          <motion.circle
            key={`mote-${i}`}
            cx={p.cx}
            cy={p.cy}
            r={1}
            fill={p.color}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.4, 0],
              cy: [p.cy, p.cy - 4, p.cy],
            }}
            transition={{ duration: 5 + i, repeat: Infinity, delay: i * 1.2, ease: "easeInOut" }}
          />
        ))}
      </svg>
    </div>
  );
};

export default MaungaStarCluster;
