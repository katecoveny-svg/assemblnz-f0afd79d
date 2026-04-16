import React, { useRef, useCallback } from "react";

interface DashboardGlassCardProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  glow?: boolean;
  onClick?: () => void;
}

/**
 * Premium glass card — light mode.
 * White glass floating on light bg with soft pastel shadows.
 */
const DashboardGlassCard: React.FC<DashboardGlassCardProps> = ({
  children,
  className = "",
  accentColor,
  glow = false,
  onClick,
}) => {
  const rgb = accentColor ? hexToRgb(accentColor) : "74,165,168";
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
      className={`relative rounded-3xl border backdrop-blur-xl transition-all duration-300 group/card ${onClick ? "cursor-pointer hover:-translate-y-1" : "hover:-translate-y-0.5"} ${className}`}
      style={{
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(20px) saturate(140%)",
        borderColor: glow ? `rgba(${rgb}, 0.2)` : "rgba(255,255,255,0.9)",
        boxShadow: glow
          ? `0 10px 40px -10px rgba(${rgb},0.15), 0 4px 12px rgba(0,0,0,0.04)`
          : "0 10px 40px -10px rgba(74,165,168,0.10), 0 4px 12px rgba(0,0,0,0.03)",
      }}
    >
      {/* Specular top edge */}
      <div
        className="absolute top-0 left-[10%] right-[10%] h-[1px] rounded-full opacity-60 group-hover/card:opacity-100 transition-opacity duration-500"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,1), transparent)",
        }}
      />
      {/* Mouse-follow radial highlight */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(${rgb},0.06), transparent 40%)`,
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
