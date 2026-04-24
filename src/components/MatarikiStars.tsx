import { motion } from "framer-motion";

/**
 * Matariki (Pleiades) star cluster — 9 stars of Matariki
 * positioned in the traditional cluster pattern with glow effects.
 * Each star pulses independently with Kōwhai gold radiance.
 */

const MATARIKI_STARS = [
  // Name, x%, y%, size, delay — based on Pleiades layout
  { name: "Matariki",    x: 50, y: 28, r: 5,   delay: 0,    glow: 1.4 },
  { name: "Pōhutukawa", x: 42, y: 38, r: 3.5, delay: 0.3,  glow: 1.0 },
  { name: "Tupuānuku",  x: 56, y: 36, r: 3.8, delay: 0.5,  glow: 1.1 },
  { name: "Tupuārangi", x: 38, y: 48, r: 3.2, delay: 0.7,  glow: 0.9 },
  { name: "Waipuna-ā-Rangi", x: 60, y: 46, r: 3.4, delay: 0.9, glow: 1.0 },
  { name: "Waitī",      x: 46, y: 54, r: 3.0, delay: 1.1,  glow: 0.85 },
  { name: "Waitā",      x: 54, y: 56, r: 3.2, delay: 1.3,  glow: 0.9 },
  { name: "Ururangi",   x: 48, y: 64, r: 2.8, delay: 1.5,  glow: 0.8 },
  { name: "Hiwa-i-te-Rangi", x: 52, y: 44, r: 4.2, delay: 0.2, glow: 1.2 },
];

// Constellation lines connecting the stars
const CONNECTIONS = [
  [0, 1], [0, 2], [0, 8], [1, 3], [2, 4], [3, 5], [4, 6], [5, 7], [6, 7], [8, 5], [8, 6],
];

interface Props {
  className?: string;
  showLabels?: boolean;
  size?: number;
}

const MatarikiStars = ({ className = "", showLabels = false, size = 400 }: Props) => {
  const scale = size / 100;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* SVG constellation lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        fill="none"
      >
        <defs>
          <linearGradient id="matariki-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4AA5A8" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#3A7D6E" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4AA5A8" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        {CONNECTIONS.map(([from, to], i) => (
          <motion.line
            key={i}
            x1={MATARIKI_STARS[from].x}
            y1={MATARIKI_STARS[from].y}
            x2={MATARIKI_STARS[to].x}
            y2={MATARIKI_STARS[to].y}
            stroke="url(#matariki-line)"
            strokeWidth="0.3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 1.5, delay: 0.5 + i * 0.1, ease: "easeOut" }}
          />
        ))}
      </svg>

      {/* Stars */}
      {MATARIKI_STARS.map((star) => (
        <motion.div
          key={star.name}
          className="absolute"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            transform: "translate(-50%, -50%)",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: star.delay, ease: "easeOut" }}
        >
          {/* Outer glow */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: star.r * scale * 4,
              height: star.r * scale * 4,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle, rgba(74,165,168,${0.15 * star.glow}) 0%, rgba(58,125,110,${0.05 * star.glow}) 50%, transparent 100%)`,
              filter: `blur(${star.r * 1.5}px)`,
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2.5 + star.delay * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: star.delay * 0.5,
            }}
          />

          {/* Core star */}
          <motion.div
            className="relative rounded-full"
            style={{
              width: star.r * scale * 0.8,
              height: star.r * scale * 0.8,
              background: `radial-gradient(circle, #FFFFFF 0%, #A8DDDB 40%, #4AA5A8 80%, rgba(74,165,168,0) 100%)`,
              boxShadow: `0 0 ${star.r * 2}px rgba(74,165,168,${0.6 * star.glow}), 0 0 ${star.r * 6}px rgba(74,165,168,${0.3 * star.glow})`,
            }}
            animate={{
              boxShadow: [
                `0 0 ${star.r * 2}px rgba(74,165,168,${0.6 * star.glow}), 0 0 ${star.r * 6}px rgba(74,165,168,${0.3 * star.glow})`,
                `0 0 ${star.r * 4}px rgba(255,220,80,${0.9 * star.glow}), 0 0 ${star.r * 10}px rgba(74,165,168,${0.5 * star.glow})`,
                `0 0 ${star.r * 2}px rgba(74,165,168,${0.6 * star.glow}), 0 0 ${star.r * 6}px rgba(74,165,168,${0.3 * star.glow})`,
              ],
            }}
            transition={{
              duration: 3 + star.delay * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: star.delay * 0.3,
            }}
          />

          {/* Label */}
          {showLabels && (
            <motion.span
              className="absolute whitespace-nowrap font-mono text-[7px] tracking-widest uppercase"
              style={{
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                marginTop: 6,
                color: "rgba(74,165,168,0.4)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: star.delay + 1 }}
            >
              {star.name}
            </motion.span>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default MatarikiStars;
