import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * LiquidPanel — primary Mārama dashboard surface.
 * 24px rounded, dual neumorphic shadow, top rim highlight, refraction
 * (backdrop blur + saturate + brightness), animated shimmer band, and
 * an ambient accent glow halo. Cursor-tracking specular blob for the
 * "wet glass" feel.
 */
interface Props {
  children: React.ReactNode;
  className?: string;
  accent?: string; // hex like "#4AA5A8"
  intensity?: "subtle" | "medium" | "strong";
  delay?: number;
  animate?: boolean;
  onClick?: () => void;
  as?: "div" | "section" | "article";
}

const STR = {
  subtle: { drop: 0.18, light: 0.85, glow: 0.10 },
  medium: { drop: 0.28, light: 0.95, glow: 0.18 },
  strong: { drop: 0.40, light: 1.0,  glow: 0.28 },
};

export default function LiquidPanel({
  children, className, accent = "#4AA5A8", intensity = "medium",
  delay = 0, animate = true, onClick, as = "div",
}: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const s = STR[intensity];
  const rgb = hexRgb(accent);

  const onMove = React.useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--lx", `${((e.clientX - r.left) / r.width) * 100}%`);
    ref.current.style.setProperty("--ly", `${((e.clientY - r.top) / r.height) * 100}%`);
  }, []);

  const Tag = as as any;

  const panel = (
    <Tag
      ref={ref as any}
      onMouseMove={onMove}
      onClick={onClick}
      className={cn(
        "liquid-panel relative overflow-hidden rounded-[24px] group",
        "transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(.2,.8,.2,1)]",
        onClick && "cursor-pointer hover:-translate-y-[2px]",
        className,
      )}
      style={{
        background:
          "linear-gradient(150deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.62) 60%, rgba(255,255,255,0.72) 100%)",
        backdropFilter: "blur(26px) saturate(170%) brightness(1.03)",
        WebkitBackdropFilter: "blur(26px) saturate(170%) brightness(1.03)",
        border: "1px solid rgba(255,255,255,0.7)",
        boxShadow: `
          12px 14px 36px rgba(166,166,180,${s.drop}),
          -10px -10px 28px rgba(255,255,255,${s.light}),
          inset 0 2px 0 rgba(255,255,255,0.95),
          inset 0 -1px 0 rgba(0,0,0,0.04),
          0 0 56px rgba(${rgb},${s.glow})
        `,
      }}
    >
      {/* Animated diagonal shimmer band */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.40) 48%, rgba(255,255,255,0.62) 50%, rgba(255,255,255,0.40) 52%, transparent 70%)",
          backgroundSize: "260% 260%",
          animation: "liquidShimmer 9s ease-in-out infinite",
          mixBlendMode: "overlay",
        }}
      />
      {/* Top rim highlight */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 left-[6%] right-[6%] h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)",
        }}
      />
      {/* Cursor-tracking specular blob */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(560px circle at var(--lx,50%) var(--ly,50%), rgba(${rgb},0.16) 0%, rgba(255,255,255,0.18) 28%, transparent 58%)`,
        }}
      />
      {/* Accent glow line top */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 left-[14%] right-[14%] h-[2px] rounded-t-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          boxShadow: `0 0 22px rgba(${rgb},0.50)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </Tag>
  );

  if (!animate) return panel;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {panel}
    </motion.div>
  );
}

function hexRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
