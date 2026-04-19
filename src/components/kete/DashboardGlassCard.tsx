import React from "react";
import LiquidPanel from "@/components/marama/LiquidPanel";

interface DashboardGlassCardProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  glow?: boolean;
  onClick?: () => void;
}

/**
 * Legacy compatibility shim — every consumer of DashboardGlassCard now
 * renders as a Mārama LiquidPanel. This delivers the Liquid 3D look
 * (refraction, shimmer, neumorphic dual-shadow, ambient halo, cursor
 * specular) site-wide without rewriting 9 dashboards.
 */
const DashboardGlassCard: React.FC<DashboardGlassCardProps> = ({
  children,
  className = "",
  accentColor = "#4AA5A8",
  glow = false,
  onClick,
}) => (
  <LiquidPanel
    accent={accentColor}
    intensity={glow ? "strong" : "medium"}
    onClick={onClick}
    animate={false}
    className={className}
  >
    {children}
  </LiquidPanel>
);

export default DashboardGlassCard;
