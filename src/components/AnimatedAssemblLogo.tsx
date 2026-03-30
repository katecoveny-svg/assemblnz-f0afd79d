import { motion } from "framer-motion";

const AnimatedAssemblLogo = ({ size = 64 }: { size?: number }) => {
  const s = size;

  return (
    <motion.div
      className="relative inline-flex items-center justify-center gap-3"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {/* Constellation mark */}
      <motion.div
        style={{ width: s, height: s, flexShrink: 0 }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
          <defs>
            <radialGradient id="al-g" cx="40%" cy="35%" r="50%">
              <stop offset="0%" stopColor="#F0D078" />
              <stop offset="50%" stopColor="#D4A843" />
              <stop offset="100%" stopColor="#8B6020" />
            </radialGradient>
            <radialGradient id="al-p" cx="40%" cy="35%" r="50%">
              <stop offset="0%" stopColor="#7ACFC2" />
              <stop offset="50%" stopColor="#3A7D6E" />
              <stop offset="100%" stopColor="#1E5044" />
            </radialGradient>
            <radialGradient id="al-pl" cx="40%" cy="35%" r="50%">
              <stop offset="0%" stopColor="#5AADA0" />
              <stop offset="50%" stopColor="#2E6B5E" />
              <stop offset="100%" stopColor="#153D35" />
            </radialGradient>
            <radialGradient id="al-hi" cx="35%" cy="30%" r="28%">
              <stop offset="0%" stopColor="white" stopOpacity="0.65" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="al-l" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4A843" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#3A7D6E" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          <motion.line
            x1="18" y1="8" x2="8" y2="26"
            stroke="url(#al-l)" strokeWidth="1.2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.line
            x1="18" y1="8" x2="28" y2="26"
            stroke="url(#al-l)" strokeWidth="1.2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
          <motion.line
            x1="8" y1="26" x2="28" y2="26"
            stroke="url(#al-l)" strokeWidth="1.2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          />

          <circle cx="18" cy="8" r="4.5" fill="url(#al-g)" />
          <circle cx="18" cy="8" r="4.5" fill="url(#al-hi)" />
          <circle cx="8" cy="26" r="4.5" fill="url(#al-p)" />
          <circle cx="8" cy="26" r="4.5" fill="url(#al-hi)" />
          <circle cx="28" cy="26" r="4.5" fill="url(#al-pl)" />
          <circle cx="28" cy="26" r="4.5" fill="url(#al-hi)" />
        </svg>
      </motion.div>

      {/* ASSEMBL wordmark */}
      <motion.span
        style={{
          fontFamily: "'Lato', sans-serif",
          fontWeight: 900,
          fontSize: s * 0.30,
          letterSpacing: "0.25em",
          textTransform: "uppercase" as const,
          background: "linear-gradient(90deg, #FFFFFF 0%, #FFFFFF 45%, #D4A843 72%, #3A7D6E 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
        animate={{
          filter: [
            "drop-shadow(0 0 10px rgba(212,168,67,.5)) drop-shadow(0 0 28px rgba(212,168,67,.2))",
            "drop-shadow(0 0 22px rgba(212,168,67,.95)) drop-shadow(0 0 55px rgba(212,168,67,.45)) drop-shadow(0 0 80px rgba(58,125,110,.2))",
            "drop-shadow(0 0 10px rgba(212,168,67,.5)) drop-shadow(0 0 28px rgba(212,168,67,.2))",
          ],
        }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      >
        ASSEMBL
      </motion.span>
    </motion.div>
  );
};

export default AnimatedAssemblLogo;
