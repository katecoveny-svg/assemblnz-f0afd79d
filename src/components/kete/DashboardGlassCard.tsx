import React from "react";

interface DashboardGlassCardProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  glow?: boolean;
  onClick?: () => void;
}

/**
 * Premium glass card for kete dashboards.
 * Elevated surface with visible layering on the lighter #0F1018 base.
 */
const DashboardGlassCard: React.FC<DashboardGlassCardProps> = ({
  children,
  className = "",
  accentColor,
  glow = false,
  onClick,
}) => {
  const rgb = accentColor ? hexToRgb(accentColor) : "212,168,67";
  const borderColor = accentColor
    ? `rgba(${rgb}, ${glow ? 0.3 : 0.15})`
    : glow
    ? "rgba(212,168,67,0.3)"
    : "rgba(255,255,255,0.1)";

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl border backdrop-blur-xl transition-all duration-300 group/card ${onClick ? "cursor-pointer hover:scale-[1.01]" : ""} ${className}`}
      style={{
        background:
          "linear-gradient(135deg, rgba(22,22,38,0.85), rgba(18,18,30,0.7))",
        borderColor,
        boxShadow: glow
          ? `0 0 40px rgba(${rgb},0.08), 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)`
          : "0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Top accent shimmer line */}
      {glow && (
        <div
          className="absolute top-0 left-4 right-4 h-px rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(${rgb},0.5), transparent)`,
          }}
        />
      )}
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(${rgb},0.04), transparent 40%)`,
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
