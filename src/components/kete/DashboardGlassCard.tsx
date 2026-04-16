import React, { useRef, useCallback } from "react";

interface DashboardGlassCardProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  glow?: boolean;
  onClick?: () => void;
}

/**
 * Neumorphic glass card — light mode.
 * Raised surface with soft dual shadows (light/dark), inner specular,
 * mouse-following accent glow. Pounamu green default.
 */
const DashboardGlassCard: React.FC<DashboardGlassCardProps> = ({
  children,
  className = "",
  accentColor,
  glow = false,
  onClick,
}) => {
  const rgb = accentColor ? hexToRgb(accentColor) : "58,125,110";
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    ref.current.style.setProperty("--mouse-x", `${x}%`);
    ref.current.style.setProperty("--mouse-y", `${y}%`);
  }, []);

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      className={`relative rounded-2xl transition-all duration-300 group/card ${onClick ? "cursor-pointer hover:-translate-y-1" : "hover:-translate-y-0.5"} ${className}`}
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(255,255,255,0.82))",
        backdropFilter: "blur(22px) saturate(160%)",
        border: `1px solid ${glow ? `rgba(${rgb},0.22)` : "rgba(74,165,168,0.12)"}`,
        boxShadow: glow
          ? `0 12px 40px rgba(26,29,41,0.10),
             0 2px 6px rgba(26,29,41,0.05),
             inset 0 1px 0 rgba(255,255,255,0.95),
             0 0 36px rgba(${rgb},0.18)`
          : `0 8px 28px rgba(26,29,41,0.07),
             0 1px 3px rgba(26,29,41,0.04),
             inset 0 1px 0 rgba(255,255,255,0.85)`,
      }}
    >
      {/* Specular top edge — neumorphic inner light */}
      <div
        className="absolute top-0 left-[8%] right-[8%] h-[1px] rounded-full opacity-70 group-hover/card:opacity-100 transition-opacity duration-500"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)",
        }}
      />

      {/* Subtle accent glow line on hover */}
      <div
        className="absolute top-0 left-[15%] right-[15%] h-[2px] rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${rgb},0.4), transparent)`,
          boxShadow: `0 0 12px rgba(${rgb},0.2)`,
        }}
      />

      {/* Mouse-follow radial highlight */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(350px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(${rgb},0.06), transparent 40%)`,
        }}
      />

      {children}
    </div>
  );
};

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export default DashboardGlassCard;
