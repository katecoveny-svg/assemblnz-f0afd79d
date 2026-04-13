import React from "react";

interface DashboardGlassCardProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  glow?: boolean;
  onClick?: () => void;
}

/**
 * Shared glass card for all kete dashboards.
 * Premium glassmorphism matching the Mārama marketing page aesthetic.
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
    ? `rgba(${rgb}, ${glow ? 0.25 : 0.12})`
    : glow
    ? "rgba(212,168,67,0.25)"
    : "rgba(255,255,255,0.06)";

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl border backdrop-blur-xl transition-all duration-300 ${onClick ? "cursor-pointer hover:scale-[1.01]" : ""} ${className}`}
      style={{
        background:
          "linear-gradient(135deg, rgba(15,15,26,0.75), rgba(15,15,26,0.55))",
        borderColor,
        boxShadow: glow
          ? `0 0 40px rgba(${rgb},0.06), inset 0 1px 0 rgba(255,255,255,0.04)`
          : "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Top accent shimmer line */}
      {glow && (
        <div
          className="absolute top-0 left-4 right-4 h-px rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(${rgb},0.4), transparent)`,
          }}
        />
      )}
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
