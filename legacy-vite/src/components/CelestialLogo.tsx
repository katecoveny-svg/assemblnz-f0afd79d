import { motion } from "framer-motion";

/**
 * Small celestial constellation mark for the nav header.
 * White luminous aesthetic with radiant halos and sparkle dust.
 */
const CelestialLogo = ({ size = 36 }: { size?: number }) => {
  const s = size;
  return (
    <motion.div style={{ width: s, height: s, flexShrink: 0 }}>
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <defs>
          <radialGradient id="nav-gold" cx="40%" cy="32%" r="50%">
            <stop offset="0%" stopColor="#7ECFC2" />
            <stop offset="45%" stopColor="#3A7D6E" />
            <stop offset="100%" stopColor="#1B4D43" />
          </radialGradient>
          <radialGradient id="nav-pd" cx="40%" cy="35%" r="50%">
            <stop offset="0%" stopColor="#6BBFAE" />
            <stop offset="50%" stopColor="#3A7D6E" />
            <stop offset="100%" stopColor="#1B4D43" />
          </radialGradient>
          <radialGradient id="nav-pl" cx="40%" cy="35%" r="50%">
            <stop offset="0%" stopColor="#7ED4C5" />
            <stop offset="50%" stopColor="#5AADA0" />
            <stop offset="100%" stopColor="#2E6B5E" />
          </radialGradient>
          <radialGradient id="nav-hi" cx="38%" cy="28%" r="30%">
            <stop offset="0%" stopColor="white" stopOpacity="0.75" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nav-hg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5AADA0" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#3A7D6E" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#3A7D6E" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nav-ht" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5AADA0" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#3A7D6E" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#3A7D6E" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Connection lines */}
        <motion.line x1="24" y1="10" x2="10" y2="34" stroke="white" strokeWidth="0.6"
          animate={{ strokeOpacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.line x1="24" y1="10" x2="38" y2="34" stroke="white" strokeWidth="0.6"
          animate={{ strokeOpacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        <motion.line x1="10" y1="34" x2="38" y2="34" stroke="white" strokeWidth="0.6"
          animate={{ strokeOpacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />

        {/* Halos */}
        <motion.circle cx="24" cy="10" r="10" fill="url(#nav-hg)"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle cx="10" cy="34" r="9" fill="url(#nav-ht)"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <motion.circle cx="38" cy="34" r="9" fill="url(#nav-ht)"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Orbs */}
        <circle cx="24" cy="10" r="4.5" fill="url(#nav-gold)" />
        <circle cx="24" cy="10" r="4.5" fill="url(#nav-hi)" />
        <circle cx="10" cy="34" r="4.5" fill="url(#nav-pd)" />
        <circle cx="10" cy="34" r="4.5" fill="url(#nav-hi)" />
        <circle cx="38" cy="34" r="4.5" fill="url(#nav-pl)" />
        <circle cx="38" cy="34" r="4.5" fill="url(#nav-hi)" />

        {/* Sparkle dust */}
        {[
          { cx: 17, cy: 7, d: 0 }, { cx: 31, cy: 7, d: 0.5 },
          { cx: 6, cy: 28, d: 1.0 }, { cx: 42, cy: 28, d: 1.5 },
          { cx: 24, cy: 22, d: 0.3 }, { cx: 16, cy: 38, d: 0.8 },
          { cx: 32, cy: 38, d: 1.3 }, { cx: 24, cy: 42, d: 0.6 },
        ].map((dot, i) => (
          <motion.circle
            key={i}
            cx={dot.cx} cy={dot.cy} r="0.4"
            fill="white"
            animate={{ opacity: [0, 0.85, 0] }}
            transition={{ duration: 1.6 + (i % 3) * 0.5, repeat: Infinity, ease: "easeInOut", delay: dot.d }}
          />
        ))}
      </svg>
    </motion.div>
  );
};

export default CelestialLogo;
