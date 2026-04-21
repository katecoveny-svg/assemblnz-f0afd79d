import { motion } from "framer-motion";

/**
 * Celestial Mārama constellation mark — pure white luminous aesthetic.
 * Three orbs (gold top, pounamu-dark left, pounamu-light right) with
 * massive radiant halos, sparkle dust, and subtle twinkle animations.
 */
const AnimatedAssemblLogo = ({ size = 64, showWordmark = true }: { size?: number; showWordmark?: boolean }) => {
  const s = size;

  return (
    <motion.div
      className="relative inline-flex items-center justify-center gap-3"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <motion.div
        style={{ width: s, height: s, flexShrink: 0 }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
          <defs>
            {/* Gold orb gradient */}
            <radialGradient id="cel-gold" cx="40%" cy="32%" r="50%">
              <stop offset="0%" stopColor="#F5D98A" />
              <stop offset="45%" stopColor="#4AA5A8" />
              <stop offset="100%" stopColor="#8B6020" />
            </radialGradient>
            {/* Pounamu dark */}
            <radialGradient id="cel-pd" cx="40%" cy="35%" r="50%">
              <stop offset="0%" stopColor="#6BBFAE" />
              <stop offset="50%" stopColor="#3A7D6E" />
              <stop offset="100%" stopColor="#1B4D43" />
            </radialGradient>
            {/* Pounamu light */}
            <radialGradient id="cel-pl" cx="40%" cy="35%" r="50%">
              <stop offset="0%" stopColor="#7ED4C5" />
              <stop offset="50%" stopColor="#5AADA0" />
              <stop offset="100%" stopColor="#2E6B5E" />
            </radialGradient>
            {/* Specular highlight */}
            <radialGradient id="cel-hi" cx="38%" cy="28%" r="30%">
              <stop offset="0%" stopColor="white" stopOpacity="0.75" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            {/* Gold halo glow */}
            <radialGradient id="halo-gold" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4AA5A8" stopOpacity="0.6" />
              <stop offset="40%" stopColor="#4AA5A8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#4AA5A8" stopOpacity="0" />
            </radialGradient>
            {/* Teal halo glow */}
            <radialGradient id="halo-teal" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#5AADA0" stopOpacity="0.5" />
              <stop offset="40%" stopColor="#3A7D6E" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#3A7D6E" stopOpacity="0" />
            </radialGradient>
            {/* White marama glow for connection lines */}
            <filter id="cel-glow">
              <feGaussianBlur stdDeviation="0.8" />
            </filter>
          </defs>

          {/* Connection lines — bright white */}
          <motion.line x1="24" y1="10" x2="10" y2="34" stroke="white" strokeWidth="0.7" strokeOpacity="0.18"
            animate={{ strokeOpacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.line x1="24" y1="10" x2="38" y2="34" stroke="white" strokeWidth="0.7" strokeOpacity="0.18"
            animate={{ strokeOpacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          />
          <motion.line x1="10" y1="34" x2="38" y2="34" stroke="white" strokeWidth="0.7" strokeOpacity="0.18"
            animate={{ strokeOpacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          />

          {/* === HALOS (massive radiant) === */}
          <motion.circle cx="24" cy="10" r="12" fill="url(#halo-gold)"
            animate={{ opacity: [0.6, 1, 0.6], r: [11, 13, 11] as any }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle cx="10" cy="34" r="11" fill="url(#halo-teal)"
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
          <motion.circle cx="38" cy="34" r="11" fill="url(#halo-teal)"
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          {/* === ORBS === */}
          {/* Gold top */}
          <circle cx="24" cy="10" r="5" fill="url(#cel-gold)" />
          <circle cx="24" cy="10" r="5" fill="url(#cel-hi)" />
          {/* Pounamu dark left */}
          <circle cx="10" cy="34" r="5" fill="url(#cel-pd)" />
          <circle cx="10" cy="34" r="5" fill="url(#cel-hi)" />
          {/* Pounamu light right */}
          <circle cx="38" cy="34" r="5" fill="url(#cel-pl)" />
          <circle cx="38" cy="34" r="5" fill="url(#cel-hi)" />

          {/* === SPARKLE DUST — tiny twinkling white dots === */}
          {[
            { cx: 17, cy: 6, d: 0 }, { cx: 30, cy: 7, d: 0.3 }, { cx: 6, cy: 28, d: 0.6 },
            { cx: 14, cy: 38, d: 0.9 }, { cx: 34, cy: 28, d: 1.2 }, { cx: 42, cy: 38, d: 1.5 },
            { cx: 20, cy: 14, d: 0.2 }, { cx: 28, cy: 14, d: 0.8 }, { cx: 24, cy: 22, d: 1.1 },
            { cx: 16, cy: 30, d: 0.4 }, { cx: 32, cy: 30, d: 0.7 }, { cx: 24, cy: 38, d: 1.3 },
            { cx: 8, cy: 18, d: 1.6 }, { cx: 40, cy: 18, d: 1.0 }, { cx: 4, cy: 34, d: 0.5 },
            { cx: 44, cy: 34, d: 1.4 }, { cx: 24, cy: 4, d: 1.7 }, { cx: 24, cy: 42, d: 0.1 },
          ].map((dot, i) => (
            <motion.circle
              key={i}
              cx={dot.cx} cy={dot.cy} r="0.5"
              fill="white"
              animate={{ opacity: [0, 0.9, 0], r: [0.3, 0.7, 0.3] as any }}
              transition={{ duration: 1.8 + (i % 3) * 0.6, repeat: Infinity, ease: "easeInOut", delay: dot.d }}
            />
          ))}
        </svg>
      </motion.div>

      {showWordmark && (
        <motion.span
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 300,
            fontSize: s * 0.32,
            letterSpacing: "0.18em",
            textTransform: "lowercase" as const,
            color: "rgba(255,255,255,0.9)",
          }}
          animate={{
            textShadow: [
              "0 0 8px rgba(255,255,255,0.15)",
              "0 0 20px rgba(255,255,255,0.35), 0 0 40px rgba(255,255,255,0.1)",
              "0 0 8px rgba(255,255,255,0.15)",
            ],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          assembl
        </motion.span>
      )}
    </motion.div>
  );
};

export default AnimatedAssemblLogo;
