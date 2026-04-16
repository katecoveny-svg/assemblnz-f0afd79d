/**
 * AdminGlassCard — Mārama-branded glass surface card for admin dashboards.
 */
import React from "react";

interface AdminGlassCardProps {
  children: React.ReactNode;
  className?: string;
  /** Top accent glow color (default: pounamu) */
  accent?: string;
  /** Optional padding override */
  noPadding?: boolean;
}

const AdminGlassCard: React.FC<AdminGlassCardProps> = ({
  children,
  className = "",
  accent = "#3A7D6E",
  noPadding = false,
}) => (
  <div className={`rounded-2xl relative overflow-hidden ${className}`} style={{
    background: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(74,165,168,0.12)",
  }}>
    {/* Top accent glow */}
    <span className="absolute top-0 left-[10%] right-[10%] h-px opacity-30"
      style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
    <div className={noPadding ? "" : "p-5"}>
      {children}
    </div>
  </div>
);

export default AdminGlassCard;
