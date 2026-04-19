import React from "react";

/**
 * Site-wide glow page wrapper — neumorphic light mode.
 * Soft raised bg, floating particles, accent halos, dot grid.
 * Pounamu green accent default.
 */
const GlowPageWrapper: React.FC<{
  children: React.ReactNode;
  accentColor?: string;
  className?: string;
}> = ({ children, accentColor = "#3A7D6E", className = "" }) => {
  const rgb = hexToRgb(accentColor);

  return (
    <div className={`min-h-screen relative ${className}`} style={{ background: "#FAFBFC" }}>
      {/* Noise texture */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          opacity: 0.035,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(${rgb},0.04) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              left: `${(i * 41) % 100}%`,
              top: `${(i * 59) % 100}%`,
              background: i % 4 === 0
                ? `rgba(74,165,168,0.3)`
                : i % 3 === 0
                  ? `rgba(200,195,220,0.35)`
                  : `rgba(${rgb},0.25)`,
              animation: `glowParticle ${16 + (i % 6) * 3}s ease-in-out infinite`,
              animationDelay: `${-(i * 1.7)}s`,
            }}
          />
        ))}
      </div>

      {/* Ambient halo — top */}
      <div
        className="absolute top-0 left-0 right-0 h-[500px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 85% 65% at 50% -15%, rgba(${rgb},0.10) 0%, rgba(${rgb},0.03) 40%, transparent 70%)`,
        }}
      />
      {/* Bottom glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[300px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 100%, rgba(${rgb},0.05) 0%, transparent 70%)`,
        }}
      />

      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] z-50"
        style={{
          background: `linear-gradient(90deg, transparent 5%, rgba(${rgb},0.3) 30%, ${accentColor} 50%, rgba(${rgb},0.3) 70%, transparent 95%)`,
          boxShadow: `0 0 20px rgba(${rgb},0.2), 0 2px 30px rgba(${rgb},0.08)`,
        }}
      />

      {children}

      <style>{`
        @keyframes glowParticle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.25; }
          25% { transform: translateY(-25px) translateX(12px); opacity: 0.5; }
          50% { transform: translateY(-12px) translateX(-6px); opacity: 0.35; }
          75% { transform: translateY(-35px) translateX(8px); opacity: 0.45; }
        }
      `}</style>
    </div>
  );
};

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export default GlowPageWrapper;
