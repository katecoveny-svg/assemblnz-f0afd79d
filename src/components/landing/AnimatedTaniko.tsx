import { motion } from "framer-motion";

/** Animated tāniko zigzag pattern — use as section divider or card decoration */
export const TanikoDivider = ({ color = "#D4A843", width = 300, className = "" }: { color?: string; width?: number; className?: string }) => (
  <motion.svg
    width={width}
    height="12"
    viewBox={`0 0 ${width} 12`}
    fill="none"
    aria-hidden="true"
    className={`mx-auto opacity-60 ${className}`}
    initial={{ scaleX: 0, opacity: 0 }}
    whileInView={{ scaleX: 1, opacity: 0.6 }}
    viewport={{ once: true }}
    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
  >
    <defs>
      <linearGradient id={`taniko-${color.replace("#", "")}`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="transparent" />
        <stop offset="20%" stopColor={color} stopOpacity="0.7" />
        <stop offset="50%" stopColor={color} stopOpacity="1" />
        <stop offset="80%" stopColor={color} stopOpacity="0.7" />
        <stop offset="100%" stopColor="transparent" />
      </linearGradient>
    </defs>
    {/* Traditional tāniko zigzag pattern */}
    <path
      d={Array.from({ length: Math.floor(width / 20) }, (_, i) => {
        const x = i * 20;
        return i === 0 ? `M${x} 6L${x + 10} 1L${x + 20} 6` : `L${x + 10} 1L${x + 20} 6`;
      }).join("")}
      stroke={`url(#taniko-${color.replace("#", "")})`}
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d={Array.from({ length: Math.floor(width / 20) }, (_, i) => {
        const x = i * 20;
        return i === 0 ? `M${x} 6L${x + 10} 11L${x + 20} 6` : `L${x + 10} 11L${x + 20} 6`;
      }).join("")}
      stroke={`url(#taniko-${color.replace("#", "")})`}
      strokeWidth="1.5"
      fill="none"
    />
  </motion.svg>
);

/** Animated koru spiral — decorative corner/accent element */
export const KoruAccent = ({ color = "#D4A843", size = 60, className = "", delay = 0 }: { color?: string; size?: number; className?: string; delay?: number }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 60 60"
    fill="none"
    className={className}
    initial={{ opacity: 0, rotate: -90 }}
    whileInView={{ opacity: 0.4, rotate: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    <motion.path
      d="M30 55 C30 40, 15 30, 15 20 C15 10, 22 5, 30 5 C38 5, 45 10, 45 20 C45 28, 40 33, 35 33 C30 33, 28 30, 28 27 C28 24, 30 22, 33 23"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 2, delay: delay + 0.3, ease: "easeOut" }}
    />
  </motion.svg>
);

/** Background koru pattern — subtle repeated koru shapes as section texture */
export const KoruBackground = ({ color = "#D4A843", opacity = 0.03 }: { color?: string; opacity?: number }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity }}>
    <svg width="100%" height="100%" className="absolute inset-0">
      <defs>
        <pattern id={`koru-bg-${color.replace("#", "")}`} x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
          <path d="M50 100 C50 80, 35 70, 35 55 C35 40, 42 35, 50 35 C58 35, 65 40, 65 55 C65 65, 60 70, 55 70 C50 70, 48 67, 48 63" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
          <path d="M150 50 C150 30, 135 20, 135 5 C135 -10, 142 -15, 150 -15 C158 -15, 165 -10, 165 5 C165 15, 160 20, 155 20" stroke={color} strokeWidth="0.8" fill="none" opacity="0.3" />
          <path d="M130 170 C130 155, 120 148, 120 138 C120 128, 125 125, 130 125 C135 125, 140 128, 140 138" stroke={color} strokeWidth="0.8" fill="none" opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#koru-bg-${color.replace("#", "")})`} />
    </svg>
  </div>
);

/** Maunga ridge divider — mountain silhouette as section break */
export const MaungaDivider = ({ color = "#D4A843", width = 300, className = "" }: { color?: string; width?: number; className?: string }) => (
  <motion.svg
    width={width}
    height="16"
    viewBox={`0 0 ${width} 16`}
    fill="none"
    aria-hidden="true"
    className={`mx-auto opacity-50 ${className}`}
    initial={{ scaleX: 0, opacity: 0 }}
    whileInView={{ scaleX: 1, opacity: 0.5 }}
    viewport={{ once: true }}
    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
  >
    <defs>
      <linearGradient id={`maunga-${color.replace("#", "")}`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="transparent" />
        <stop offset="15%" stopColor={color} stopOpacity="0.5" />
        <stop offset="50%" stopColor={color} stopOpacity="0.8" />
        <stop offset="85%" stopColor={color} stopOpacity="0.5" />
        <stop offset="100%" stopColor="transparent" />
      </linearGradient>
    </defs>
    <path
      d={`M0 14 Q${width*0.08} 6 ${width*0.15} 10 Q${width*0.22} 3 ${width*0.3} 8 Q${width*0.38} 1 ${width*0.45} 7 Q${width*0.52} 2 ${width*0.58} 6 Q${width*0.65} 0 ${width*0.72} 5 Q${width*0.8} 3 ${width*0.87} 9 Q${width*0.93} 5 ${width} 12`}
      stroke={`url(#maunga-${color.replace("#", "")})`}
      strokeWidth="1.2"
      fill="none"
      strokeLinecap="round"
    />
  </motion.svg>
);

/** Animated section gradient border — replaces plain `borderTop: 1px solid` */
export const GradientBorder = ({ colors = ["#D4A843", "#3A7D6E", "#5B8FA8"] }: { colors?: string[] }) => (
  <motion.div
    className="absolute top-0 left-0 right-0 h-px overflow-hidden"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
  >
    <motion.div
      className="h-full w-[200%]"
      style={{
        background: `linear-gradient(90deg, transparent, ${colors.join(", ")}, transparent)`,
      }}
      animate={{ x: ["-50%", "0%"] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    />
  </motion.div>
);

/** Full-width maunga ridge section divider — jagged mountain peaks as a visual break */
export const MaungaRidgeDivider = ({ color = "#D4A843", flip = false, className = "" }: { color?: string; flip?: boolean; className?: string }) => (
  <motion.div
    className={`absolute ${flip ? "bottom-0" : "top-0"} left-0 right-0 pointer-events-none ${className}`}
    style={{ height: "40px", transform: flip ? "scaleY(-1)" : undefined }}
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 1.5 }}
  >
    <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="w-full h-full">
      {/* Filled mountain shape */}
      <path
        d="M0 40 L0 28 Q40 18 80 24 Q120 10 160 20 Q200 6 240 16 Q280 8 320 18 Q360 4 400 14 Q440 7 480 16 Q520 2 560 12 Q600 6 640 15 Q680 3 720 13 Q760 0 800 10 Q840 5 880 14 Q920 2 960 11 Q1000 6 1040 15 Q1080 4 1120 13 Q1160 8 1200 17 Q1240 6 1280 14 Q1320 10 1360 20 Q1400 14 1440 22 L1440 40 Z"
        fill="#0F1623"
      />
      {/* Glowing ridge line along peaks */}
      <path
        d="M0 28 Q40 18 80 24 Q120 10 160 20 Q200 6 240 16 Q280 8 320 18 Q360 4 400 14 Q440 7 480 16 Q520 2 560 12 Q600 6 640 15 Q680 3 720 13 Q760 0 800 10 Q840 5 880 14 Q920 2 960 11 Q1000 6 1040 15 Q1080 4 1120 13 Q1160 8 1200 17 Q1240 6 1280 14 Q1320 10 1360 20 Q1400 14 1440 22"
        fill="none"
        stroke={color}
        strokeWidth="1"
        opacity="0.3"
      />
    </svg>
  </motion.div>
);

/** Subtle maunga watermark for card backgrounds */
export const MaungaWatermark = ({ color = "#D4A843" }: { color?: string }) => (
  <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden rounded-b-[20px]" style={{ height: "40%" }}>
    <svg viewBox="0 0 400 80" preserveAspectRatio="none" className="w-full h-full">
      <path
        d="M0 80 L0 50 Q40 30 80 45 Q120 20 160 38 Q200 15 240 35 Q280 22 320 40 Q360 28 400 42 L400 80 Z"
        fill={color}
        opacity="0.04"
      />
    </svg>
  </div>
);
