import React, { useRef, useCallback } from "react";

interface DashboardGlassCardProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  glow?: boolean;
  onClick?: () => void;
}

/**
 * Premium glass card for kete dashboards.
 * Mouse-follow radial glow, specular top-edge, subtle lift on hover.
 */
const DashboardGlassCard: React.FC<DashboardGlassCardProps> = ({
  children,
  className = "",
  accentColor,
  glow = false,
  onClick,
}) => {
  const rgb = accentColor ? hexToRgb(accentColor) : "212,168,67";
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    ref.current.style.setProperty("--mouse-x", `${x}%`);
    ref.current.style.setProperty("--mouse-y", `${y}%`);
  }, []);

  const borderColor = accentColor
    ? `rgba(${rgb}, ${glow ? 0.3 : 0.15})`
    : glow
    ? "rgba(212,168,67,0.3)"
    : "rgba(255,255,255,0.1)";

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      className={`relative rounded-2xl border backdrop-blur-xl transition-all duration-300 group/card ${onClick ? "cursor-pointer hover:scale-[1.02] hover:-translate-y-1" : "hover:-translate-y-0.5"} ${className}`}
      style={{
        background:
          "linear-gradient(135deg, rgba(22,22,38,0.85), rgba(18,18,30,0.7))",
        borderColor,
        boxShadow: glow
          ? `0 0 40px rgba(${rgb},0.08), 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)`
          : "0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Specular top edge */}
      <div
        className="absolute top-0 left-[10%] right-[10%] h-[1px] rounded-full opacity-40 group-hover/card:opacity-80 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)`,
        }}
      />
      {/* Top accent shimmer line */}
      {glow && (
        <div
          className="absolute top-0 left-4 right-4 h-px rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(${rgb},0.5), transparent)`,
          }}
        />
      )}
      {/* Mouse-follow radial glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(${rgb},0.06), transparent 40%)`,
        }}
      />
      {/* Hover border brightening */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
        style={{
          border: `1px solid rgba(${rgb},0.2)`,
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
