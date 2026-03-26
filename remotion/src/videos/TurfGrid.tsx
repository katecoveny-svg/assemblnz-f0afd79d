import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill, Sequence } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { BRAND, TURF_ACCENT, cosmicGradient, glassCardStyle } from "../shared/styles";

const { fontFamily } = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["latin"] });

const CAPABILITIES = [
  "Constitution Generator", "Facility Bookings", "Grant Applications",
  "AGM Documents", "Membership Management", "Compliance Tracking",
];

export const TurfGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const heroScale = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const ringRotation = frame * 0.4;

  return (
    <AbsoluteFill style={{ background: cosmicGradient, fontFamily, overflow: "hidden" }}>
      {/* Rotating ring */}
      <div style={{
        position: "absolute", top: 540, left: 540,
        width: 600, height: 600,
        transform: `translate(-50%, -50%) rotate(${ringRotation}deg)`,
      }}>
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const ox = Math.cos(rad) * 260;
          const oy = Math.sin(rad) * 260;
          const dotPulse = interpolate(Math.sin(frame * 0.05 + i), [-1, 1], [6, 12]);
          return (
            <div key={i} style={{
              position: "absolute", left: 300 + ox - dotPulse / 2, top: 300 + oy - dotPulse / 2,
              width: dotPulse, height: dotPulse, borderRadius: "50%",
              background: i % 2 === 0 ? BRAND.cyan : BRAND.purple,
              boxShadow: `0 0 ${dotPulse * 2}px ${i % 2 === 0 ? BRAND.cyan : BRAND.purple}80`,
            }} />
          );
        })}
        {/* Connecting lines */}
        <svg width={600} height={600} style={{ position: "absolute", top: 0, left: 0 }}>
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const nextDeg = (deg + 60) % 360;
            const r = 260;
            const x1 = 300 + Math.cos((deg * Math.PI) / 180) * r;
            const y1 = 300 + Math.sin((deg * Math.PI) / 180) * r;
            const x2 = 300 + Math.cos((nextDeg * Math.PI) / 180) * r;
            const y2 = 300 + Math.sin((nextDeg * Math.PI) / 180) * r;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={`${BRAND.cyan}30`} strokeWidth={1} />;
          })}
        </svg>
      </div>

      {/* Star particles */}
      {Array.from({ length: 30 }).map((_, i) => {
        const sx = (i * 137.5) % 1080;
        const sy = (i * 251.3) % 1080;
        const twinkle = interpolate(Math.sin(frame * 0.06 + i), [-1, 1], [0.15, 0.7]);
        return <div key={i} style={{ position: "absolute", left: sx, top: sy, width: 2, height: 2, borderRadius: "50%", background: "white", opacity: twinkle }} />;
      })}

      {/* Centre hero */}
      <Sequence from={0}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            fontSize: 120, fontWeight: 900, letterSpacing: -3,
            background: `linear-gradient(135deg, ${TURF_ACCENT}, ${BRAND.cyan}, ${BRAND.purple})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            transform: `scale(${heroScale})`,
          }}>TURF</div>
          <div style={{
            fontSize: 24, fontWeight: 400, color: "rgba(255,255,255,0.5)",
            letterSpacing: 8, marginTop: 4,
            opacity: interpolate(heroScale, [0.5, 1], [0, 1], { extrapolateLeft: "clamp" }),
          }}>SPORTS OPERATIONS AI</div>
        </div>
      </Sequence>

      {/* Capability pills orbiting */}
      <Sequence from={40}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
          {CAPABILITIES.map((cap, i) => {
            const capIn = spring({ frame: frame - 40 - i * 10, fps, config: { damping: 18, stiffness: 160 } });
            const angle = (i / CAPABILITIES.length) * 360 + frame * 0.3;
            const rad = (angle * Math.PI) / 180;
            const rx = 380, ry = 380;
            const cx = 540 + Math.cos(rad) * rx;
            const cy = 540 + Math.sin(rad) * ry;
            return (
              <div key={i} style={{
                position: "absolute", left: cx, top: cy,
                transform: `translate(-50%, -50%) scale(${capIn})`,
                opacity: capIn,
                ...glassCardStyle,
                padding: "14px 24px",
                borderRadius: 40,
                whiteSpace: "nowrap",
              }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: BRAND.white }}>{cap}</span>
              </div>
            );
          })}
        </div>
      </Sequence>

      {/* Bottom bar */}
      <div style={{
        position: "absolute", bottom: 40, left: 40, right: 40,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 4, color: "rgba(255,255,255,0.25)" }}>ASSEMBL</span>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>assembl.co.nz</span>
      </div>
    </AbsoluteFill>
  );
};
