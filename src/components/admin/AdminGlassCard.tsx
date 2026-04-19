/**
 * AdminGlassCard — Neumorphic glass surface card for admin dashboards.
 * Raised with soft dual shadows and pounamu green accent glow.
 */
import React from "react";

interface AdminGlassCardProps {
  children: React.ReactNode;
  className?: string;
  accent?: string;
  noPadding?: boolean;
}

const AdminGlassCard: React.FC<AdminGlassCardProps> = ({
  children,
  className = "",
  accent = "#3A7D6E",
  noPadding = false,
}) => {
  const rgb = hexToRgb(accent);
  return (
    <div
      className={`rounded-2xl relative overflow-hidden group ${className}`}
      style={{
        background: "transparent",
        boxShadow: `
          6px 6px 16px rgba(166,166,180,0.35),
          -6px -6px 16px rgba(255,255,255,0.85),
          inset 0 1px 0 rgba(255,255,255,0.6)
        `,
      }}
    >
      {/* Top accent glow */}
      <span
        className="absolute top-0 left-[10%] right-[10%] h-[2px] opacity-40 group-hover:opacity-80 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          boxShadow: `0 0 12px rgba(${rgb},0.15)`,
        }}
      />
      {/* Inner specular */}
      <span
        className="absolute top-0 left-[5%] right-[5%] h-px opacity-60"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)" }}
      />
      <div className={noPadding ? "" : "p-5"}>
        {children}
      </div>
    </div>
  );
};

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export default AdminGlassCard;
