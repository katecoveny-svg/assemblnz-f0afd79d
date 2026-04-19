import React from "react";

/**
 * Powered by Assembl — branded footer badge for evidence packs & demo surfaces.
 * Includes mountain silhouette motif.
 */
const PoweredByAssembl = ({ variant = "dark" }: { variant?: "dark" | "light" }) => {
  const isDark = variant === "dark";
  
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {/* Mountain silhouette */}
      <svg width="32" height="16" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 16L8 4L12 8L16 0L20 8L24 4L32 16H0Z" 
          fill={isDark ? "rgba(58,125,110,0.15)" : "rgba(58,125,110,0.12)"} 
          stroke={isDark ? "rgba(58,125,110,0.3)" : "rgba(58,125,110,0.25)"} 
          strokeWidth="0.5" />
        <path d="M4 16L14 6L18 10L22 2L28 16H4Z" 
          fill={isDark ? "rgba(74,165,168,0.08)" : "rgba(74,165,168,0.06)"} 
          stroke={isDark ? "rgba(74,165,168,0.2)" : "rgba(74,165,168,0.15)"} 
          strokeWidth="0.5" />
      </svg>
      <div className="text-center">
        <p className="text-[9px] tracking-[3px] uppercase" 
          style={{ 
            fontFamily: "'JetBrains Mono', monospace",
            color: isDark ? "rgba(245,240,232,0.3)" : "rgba(58,125,110,0.4)",
          }}>
          Powered by
        </p>
        <p className="text-[11px] tracking-[4px] uppercase" 
          style={{ 
            fontFamily: "'Lato', sans-serif", 
            fontWeight: 300,
            color: isDark ? "rgba(245,240,232,0.5)" : "rgba(58,125,110,0.6)",
          }}>
          assembl
        </p>
      </div>
      {/* Mountain silhouette mirrored */}
      <svg width="32" height="16" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "scaleX(-1)" }}>
        <path d="M0 16L8 4L12 8L16 0L20 8L24 4L32 16H0Z" 
          fill={isDark ? "rgba(58,125,110,0.15)" : "rgba(58,125,110,0.12)"} 
          stroke={isDark ? "rgba(58,125,110,0.3)" : "rgba(58,125,110,0.25)"} 
          strokeWidth="0.5" />
        <path d="M4 16L14 6L18 10L22 2L28 16H4Z" 
          fill={isDark ? "rgba(74,165,168,0.08)" : "rgba(74,165,168,0.06)"} 
          stroke={isDark ? "rgba(74,165,168,0.2)" : "rgba(74,165,168,0.15)"} 
          strokeWidth="0.5" />
      </svg>
    </div>
  );
};

export default PoweredByAssembl;
