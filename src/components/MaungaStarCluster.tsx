import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Maunga motif with 3D glowing star cluster overlay.
 * Renders an SVG maunga (mountain) silhouette with animated white-glow orbs
 * hovering above it like a cosmic star cluster / Matariki.
 */

const STARS = [
  { cx: 50, cy: 18, r: 4, delay: 0, glow: 18 },
  { cx: 38, cy: 24, r: 3, delay: 0.3, glow: 14 },
  { cx: 62, cy: 22, r: 3.5, delay: 0.5, glow: 16 },
  { cx: 44, cy: 14, r: 2.5, delay: 0.8, glow: 12 },
  { cx: 56, cy: 12, r: 2.5, delay: 1.0, glow: 12 },
  { cx: 50, cy: 8, r: 3, delay: 0.2, glow: 14 },
  { cx: 34, cy: 16, r: 2, delay: 1.2, glow: 10 },
  { cx: 66, cy: 16, r: 2, delay: 0.7, glow: 10 },
  { cx: 50, cy: 28, r: 2, delay: 1.5, glow: 10 },
];

const CONNECTIONS = [
  [0, 1], [0, 2], [0, 5], [1, 3], [2, 4], [3, 5], [4, 5],
  [1, 6], [2, 7], [0, 8],
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
          <radialGradient id="star-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="maunga-fill" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.01" />
          </linearGradient>
          <filter id="star-blur">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
          <filter id="big-glow">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Maunga (mountain) silhouette */}
        {showMaunga && (
          <>
            {/* Main peak */}
            <path
              d="M5 65 L30 38 L42 42 L50 32 L58 42 L70 38 L95 65 Z"
              fill="url(#maunga-fill)"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="0.3"
            />
            {/* Ridge detail */}
            <path
              d="M20 55 L35 42 L50 35 L65 42 L80 55"
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="0.3"
            />
          </>
        )}

        {/* Constellation lines */}
        {CONNECTIONS.map(([a, b], i) => (
          <motion.line
            key={`line-${i}`}
            x1={STARS[a].cx}
            y1={STARS[a].cy}
            x2={STARS[b].cx}
            y2={STARS[b].cy}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="0.3"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}

        {/* Star glow halos (big, blurred) */}
        {STARS.map((star, i) => (
          <motion.circle
            key={`halo-${i}`}
            cx={star.cx}
            cy={star.cy}
            r={star.glow}
            fill="url(#star-glow)"
            filter="url(#big-glow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.08, 0.2, 0.08] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: star.delay, ease: "easeInOut" }}
          />
        ))}

        {/* Star cores */}
        {STARS.map((star, i) => (
          <motion.circle
            key={`core-${i}`}
            cx={star.cx}
            cy={star.cy}
            r={star.r}
            fill="white"
            filter="url(#star-blur)"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [0.9, 1.15, 0.9],
            }}
            transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, delay: star.delay, ease: "easeInOut" }}
          />
        ))}

        {/* Bright centre dots */}
        {STARS.map((star, i) => (
          <motion.circle
            key={`dot-${i}`}
            cx={star.cx}
            cy={star.cy}
            r={star.r * 0.4}
            fill="white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, delay: star.delay + 0.5 }}
          />
        ))}
      </svg>
    </div>
  );
};

export default MaungaStarCluster;
