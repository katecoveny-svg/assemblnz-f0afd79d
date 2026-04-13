import React from "react";

/**
 * Site-wide glow page wrapper that adds the starfield background,
 * ambient halo, and top accent bar to any page.
 */
const GlowPageWrapper: React.FC<{
  children: React.ReactNode;
  accentColor?: string;
  className?: string;
}> = ({ children, accentColor = "#3A7D6E", className = "" }) => {
  const rgb = hexToRgb(accentColor);

  return (
    <div className={`min-h-screen relative ${className}`} style={{ background: "#0A0A14" }}>
      {/* Starfield — denser */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage:
            "radial-gradient(1.5px 1.5px at 20px 30px, rgba(255,255,255,0.18), transparent)," +
            "radial-gradient(1px 1px at 60px 70px, rgba(255,255,255,0.15), transparent)," +
            "radial-gradient(1.2px 1.2px at 130px 80px, rgba(255,255,255,0.22), transparent)," +
            "radial-gradient(1.5px 1.5px at 90px 10px, rgba(255,255,255,0.12), transparent)," +
            "radial-gradient(1px 1px at 160px 120px, rgba(255,255,255,0.10), transparent)," +
            "radial-gradient(0.8px 0.8px at 45px 150px, rgba(255,255,255,0.08), transparent)," +
            "radial-gradient(1.2px 1.2px at 180px 40px, rgba(212,168,67,0.06), transparent)",
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      {/* Dot grid texture */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Ambient halo — stronger bloom */}
      <div
        className="absolute top-0 left-0 right-0 h-[500px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 85% 65% at 50% -15%, rgba(${rgb},0.14) 0%, rgba(${rgb},0.04) 40%, transparent 70%)`,
        }}
      />
      {/* Secondary bottom glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[300px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 100%, rgba(${rgb},0.06) 0%, transparent 70%)`,
        }}
      />

      {/* Top accent bar — stronger bloom */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] z-50"
        style={{
          background: `linear-gradient(90deg, transparent 5%, rgba(240,208,120,0.5) 30%, ${accentColor} 50%, rgba(240,208,120,0.5) 70%, transparent 95%)`,
          boxShadow: `0 0 20px rgba(240,208,120,0.4), 0 0 8px rgba(${rgb},0.3), 0 2px 30px rgba(${rgb},0.1)`,
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

export default GlowPageWrapper;
