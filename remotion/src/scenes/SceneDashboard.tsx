import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, staticFile, Img } from "remotion";

const GOLD = "#D4A853";

export const SceneDashboard = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const imgSpring = spring({ frame: frame - 5, fps, config: { damping: 20, stiffness: 100 } });
  const labelOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const scannerY = interpolate(frame, [20, 100], [-20, 900], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const scannerOpacity = interpolate(frame, [20, 30, 90, 100], [0, 0.8, 0.8, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(135deg, #0A0A0F 0%, #0F0F18 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Label */}
      <div style={{
        position: "absolute", top: 60, left: 100,
        opacity: labelOpacity,
      }}>
        <span style={{
          fontFamily: "monospace", fontSize: 12, color: GOLD,
          letterSpacing: 4, textTransform: "uppercase",
        }}>
          01 — Project Overview
        </span>
        <h2 style={{
          fontFamily: "sans-serif", fontSize: 36, color: "white",
          fontWeight: 300, margin: "8px 0 0", letterSpacing: 2,
        }}>
          Kaitiaki House · $42.5M
        </h2>
      </div>

      {/* Dashboard screenshot */}
      <div style={{
        transform: `scale(${interpolate(imgSpring, [0, 1], [0.9, 0.75])}) translateY(${interpolate(imgSpring, [0, 1], [40, 20])}px)`,
        opacity: imgSpring,
        borderRadius: 16, overflow: "hidden",
        boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 60px ${GOLD}10`,
        border: `1px solid rgba(255,255,255,0.08)`,
        marginTop: 60,
      }}>
        <Img src={staticFile("images/overview.png")} style={{ width: 1920, display: "block" }} />

        {/* Scanning line */}
        <div style={{
          position: "absolute", left: 0, right: 0,
          top: scannerY, height: 3,
          background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
          opacity: scannerOpacity,
          boxShadow: `0 0 20px ${GOLD}60`,
        }} />
      </div>
    </AbsoluteFill>
  );
};
