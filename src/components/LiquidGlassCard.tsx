import { motion } from "framer-motion";
import React from "react";

/**
 * LiquidGlassCard — Apple-tier glass morphism card
 * Features specular highlight, refraction border, accent glow
 */
interface Props {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  /** Higher = more blur */
  glassIntensity?: "subtle" | "medium" | "strong";
  /** Animate on scroll */
  animate?: boolean;
  delay?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const GLASS = {
  subtle: { blur: 12, bg: 0.03, border: 0.08, specular: 0.03 },
  medium: { blur: 24, bg: 0.05, border: 0.12, specular: 0.05 },
  strong: { blur: 40, bg: 0.07, border: 0.15, specular: 0.08 },
};

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const LiquidGlassCard: React.FC<Props> = ({
  children,
  className = "",
  accentColor,
  glassIntensity = "medium",
  animate = true,
  delay = 0,
  onClick,
  style = {},
}) => {
  const g = GLASS[glassIntensity];

  const inner = (
    <div
      className={`rounded-2xl relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{
        background: `rgba(255,255,255,${g.bg})`,
        backdropFilter: `blur(${g.blur}px) saturate(1.2)`,
        WebkitBackdropFilter: `blur(${g.blur}px) saturate(1.2)`,
        border: `1px solid rgba(255,255,255,${g.border})`,
        boxShadow: `
          0 8px 32px rgba(0,0,0,0.3),
          inset 0 1px 0 rgba(255,255,255,${g.specular}),
          inset 0 -1px 0 rgba(255,255,255,${g.specular * 0.3})
        `,
        ...style,
      }}
      onClick={onClick}
    >
      {/* Specular highlight — top edge refraction */}
      <div
        className="absolute top-0 left-[10%] right-[10%] h-[1px] opacity-60 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,${g.specular * 2}), transparent)`,
        }}
      />

      {/* Accent glow on hover */}
      {accentColor && (
        <>
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${accentColor}15 0%, transparent 60%)`,
            }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
              boxShadow: `0 0 20px ${accentColor}40`,
            }}
          />
        </>
      )}

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

export default LiquidGlassCard;
