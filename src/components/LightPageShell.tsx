import React from "react";
import WharikiFoundation from "@/components/whariki/WharikiFoundation";
import WaterCausticBackground from "@/components/hero/WaterCausticBackground";
import ScrollDepthLayers from "@/components/hero/ScrollDepthLayers";

/**
 * Light-mode page shell — neumorphic #EEEEF2 background,
 * floating particles, liquid glass glow, accent bar.
 * Wraps all public pages.
 */
const LightPageShell: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div
    className={`light-glass-shell kete-light-shell min-h-screen relative overflow-hidden ${className}`}
    style={{
      background: "linear-gradient(180deg, #FFFFFF 0%, #F4FAFC 45%, #E8F4F6 100%)",
      color: "#1F4E54",
    }}
  >
    <WharikiFoundation />
    <WaterCausticBackground />

    {/* Noise grain */}
    <div
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{
        opacity: 0.035,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "256px 256px",
      }}
    />

    {/* Floating particles */}
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            left: `${(i * 43) % 100}%`,
            top: `${(i * 61) % 100}%`,
            background: i % 5 === 0
              ? `rgba(232,169,72,0.3)`
              : i % 3 === 0
                ? `rgba(200,195,220,0.35)`
                : `rgba(58,125,110,0.25)`,
            animation: `shellParticle ${15 + (i % 7) * 3}s ease-in-out infinite`,
            animationDelay: `${-(i * 1.5)}s`,
          }}
        />
      ))}
    </div>

    {/* Liquid glass glow orbs — soft teal on white-ice */}
    <div className="fixed inset-0 pointer-events-none z-[1]">
      <div
        className="absolute"
        style={{
          width: 500, height: 500, top: "-8%", left: "-6%",
          background: "radial-gradient(circle, rgba(74,165,168,0.10) 0%, rgba(74,165,168,0.03) 40%, transparent 70%)",
          filter: "blur(80px)",
          animation: "shellOrb1 12s ease-in-out infinite",
        }}
      />
      <div
        className="absolute"
        style={{
          width: 400, height: 400, top: "25%", right: "-4%",
          background: "radial-gradient(circle, rgba(168,221,219,0.18) 0%, rgba(168,221,219,0.05) 40%, transparent 70%)",
          filter: "blur(100px)",
          animation: "shellOrb2 16s ease-in-out infinite",
        }}
      />
      <div
        className="absolute"
        style={{
          width: 600, height: 600, bottom: "-10%", left: "20%",
          background: "radial-gradient(circle, rgba(210,235,238,0.30) 0%, transparent 60%)",
          filter: "blur(120px)",
          animation: "shellOrb3 20s ease-in-out infinite",
        }}
      />
      <div
        className="absolute"
        style={{
          width: 500, height: 500, top: "45%", left: "45%",
          background: "radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 60%)",
          filter: "blur(140px)",
          animation: "shellOrb4 18s ease-in-out infinite",
        }}
      />
    </div>

    {/* Top accent bar — soft teal */}
    <div
      className="fixed top-0 left-0 right-0 h-[2px] z-50"
      style={{
        background: "linear-gradient(90deg, transparent 5%, rgba(74,165,168,0.25) 30%, #4AA5A8 50%, rgba(74,165,168,0.25) 70%, transparent 95%)",
        boxShadow: "0 0 20px rgba(74,165,168,0.18), 0 2px 30px rgba(74,165,168,0.06)",
      }}
    />

    <ScrollDepthLayers>
      <div className="relative z-10">{children}</div>
    </ScrollDepthLayers>

    <style>{`
      @keyframes shellParticle {
        0%, 100% { transform: translateY(0) translateX(0); opacity: 0.25; }
        25% { transform: translateY(-20px) translateX(8px); opacity: 0.5; }
        50% { transform: translateY(-10px) translateX(-5px); opacity: 0.35; }
        75% { transform: translateY(-30px) translateX(12px); opacity: 0.45; }
      }
      @keyframes shellOrb1 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(30px, 20px) scale(1.1); }
      }
      @keyframes shellOrb2 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(-20px, 30px) scale(1.05); }
      }
      @keyframes shellOrb3 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(40px, -20px) scale(1.08); }
      }
      @keyframes shellOrb4 {
        0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
        50% { transform: translate(-30px, 15px) scale(1.12); opacity: 1; }
      }
    `}</style>
  </div>
);

export default LightPageShell;
