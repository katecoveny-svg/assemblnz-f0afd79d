import { motion } from "framer-motion";
import React from "react";

/**
 * LiquidGlassCard — Real liquid-motion glass with animated shimmer band,
 * cursor-following specular blob, dual-shadow neumorphic depth, and
 * accent ambient glow. Light mode only — charcoal text on white glass.
 */
interface Props {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  glassIntensity?: "subtle" | "medium" | "strong";
  animate?: boolean;
  delay?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const NEU = {
  subtle: { drop: 0.22, light: 0.85, glow: 0.10 },
  medium: { drop: 0.32, light: 0.95, glow: 0.15 },
  strong: { drop: 0.42, light: 1.0, glow: 0.22 },
};

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const LiquidGlassCard: React.FC<Props> = ({
  children,
  className = "",
  accentColor = "#4AA5A8",
  glassIntensity = "medium",
  animate = true,
  delay = 0,
  onClick,
  style = {},
}) => {
  const n = NEU[glassIntensity];
  const ref = React.useRef<HTMLDivElement>(null);
  const rgb = hexToRgb(accentColor);

  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--lx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    ref.current.style.setProperty("--ly", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  }, []);

  const inner = (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`liquid-glass-card rounded-2xl relative overflow-hidden group transition-all duration-400 hover:-translate-y-1 ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.78), rgba(255,255,255,0.62))",
        backdropFilter: "blur(22px) saturate(160%)",
        WebkitBackdropFilter: "blur(22px) saturate(160%)",
        border: "1px solid rgba(255,255,255,0.65)",
        boxShadow: `
          10px 10px 28px rgba(166,166,180,${n.drop}),
          -8px -8px 24px rgba(255,255,255,${n.light}),
          inset 0 2px 0 rgba(255,255,255,0.95),
          inset 0 -1px 0 rgba(0,0,0,0.04),
          0 0 40px rgba(${rgb},${n.glow})
        `,
        ...style,
      }}
      onClick={onClick}
    >
      {/* Animated shimmer band — diagonal liquid drift */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.45) 48%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0.45) 52%, transparent 70%)",
          backgroundSize: "250% 250%",
          animation: "liquidShimmer 8s ease-in-out infinite",
          mixBlendMode: "overlay",
        }}
      />

      {/* Specular highlight — top edge */}
      <div
        className="absolute top-0 left-[6%] right-[6%] h-[1px] opacity-80 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)",
        }}
      />

      {/* Cursor-following accent specular blob — gives wet/gloss feel */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(420px circle at var(--lx, 50%) var(--ly, 50%), rgba(${rgb},0.14) 0%, rgba(255,255,255,0.18) 25%, transparent 55%)`,
        }}
      />

      {/* Secondary smaller specular dot */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: `radial-gradient(120px circle at var(--lx, 50%) var(--ly, 50%), rgba(255,255,255,0.5) 0%, transparent 60%)`,
          mixBlendMode: "overlay",
        }}
      />

      {/* Accent glow line top */}
      <div
        className="absolute top-0 left-[12%] right-[12%] h-[2px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}80, transparent)`,
          boxShadow: `0 0 18px rgba(${rgb},0.35)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );

  if (!animate) return inner;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay, ease }}
    >
      {inner}
    </motion.div>
  );
};

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export default LiquidGlassCard;
