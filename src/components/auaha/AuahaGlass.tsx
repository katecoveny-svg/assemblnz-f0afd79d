import React, { useRef, useCallback } from "react";
import {
  AUAHA_ACCENT,
  AUAHA_BORDER,
  AUAHA_BORDER_ACCENT,
} from "./auahaTheme";

interface AuahaGlassProps {
  children: React.ReactNode;
  className?: string;
  /** Visual emphasis tier */
  variant?: "default" | "accent" | "glow";
  onClick?: () => void;
  style?: React.CSSProperties;
}

/**
 * Unified Auaha light-glass surface.
 * - Bright white surface (no greys)
 * - Soft dual shadow + inner specular for depth
 * - Optional ochre accent border / outer glow
 * - Mouse-follow ochre highlight
 */
const AuahaGlass: React.FC<AuahaGlassProps> = ({
  children,
  className = "",
  variant = "default",
  onClick,
  style,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      ref.current.style.setProperty("--mx", `${x}%`);
      ref.current.style.setProperty("--my", `${y}%`);
    },
    [],
  );

  const border =
    variant === "accent" || variant === "glow"
      ? AUAHA_BORDER_ACCENT
      : AUAHA_BORDER;

  const shadow =
    variant === "glow"
      ? `0 14px 44px rgba(26,29,41,0.10),
         0 2px 6px rgba(26,29,41,0.05),
         inset 0 1px 0 rgba(255,255,255,0.95),
         0 0 36px ${AUAHA_ACCENT}28`
      : `0 8px 28px rgba(26,29,41,0.07),
         0 1px 3px rgba(26,29,41,0.04),
         inset 0 1px 0 rgba(255,255,255,0.9)`;

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      className={`relative rounded-2xl transition-all duration-300 group/agc ${
        onClick ? "cursor-pointer hover:-translate-y-1" : "hover:-translate-y-0.5"
      } ${className}`}
      style={{
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(255,255,255,0.82))",
        backdropFilter: "blur(22px) saturate(160%)",
        border: `1px solid ${border}`,
        boxShadow: shadow,
        ...style,
      }}
    >
      {/* Specular top edge */}
      <div
        className="absolute top-0 left-[10%] right-[10%] h-[1px] rounded-full opacity-60 group-hover/agc:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)",
        }}
      />

      {/* Accent line on hover */}
      <div
        className="absolute top-0 left-[18%] right-[18%] h-[2px] rounded-full opacity-0 group-hover/agc:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${AUAHA_ACCENT}66, transparent)`,
          boxShadow: `0 0 12px ${AUAHA_ACCENT}40`,
        }}
      />

      {/* Mouse-follow ochre */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover/agc:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), ${AUAHA_ACCENT}14, transparent 42%)`,
        }}
      />

      <div className="relative">{children}</div>
    </div>
  );
};

export default AuahaGlass;
