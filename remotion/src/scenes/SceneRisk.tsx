import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, staticFile, Img } from "remotion";

const GOLD = "#D4A853";
const RED = "#EF4444";

export const SceneRisk = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const imgSpring = spring({ frame: frame - 5, fps, config: { damping: 20, stiffness: 100 } });
  const labelOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(135deg, #0A0A0F 0%, #0F0F18 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Label */}
      <div style={{ position: "absolute", top: 60, left: 100, opacity: labelOpacity }}>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: RED, letterSpacing: 4, textTransform: "uppercase" }}>
          03 — Risk Register
        </span>
        <h2 style={{ fontFamily: "sans-serif", fontSize: 36, color: "white", fontWeight: 300, margin: "8px 0 0", letterSpacing: 2 }}>
          4 Active Risks · 2 Critical
        </h2>
      </div>

      {/* Screenshot */}
      <div style={{
        transform: `scale(${interpolate(imgSpring, [0, 1], [0.9, 0.75])}) translateY(${interpolate(imgSpring, [0, 1], [40, 20])}px)`,
        opacity: imgSpring,
        borderRadius: 16, overflow: "hidden",
        boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 40px ${RED}08`,
        border: `1px solid rgba(255,255,255,0.08)`,
        marginTop: 60,
      }}>
        <Img src={staticFile("images/risk.png")} style={{ width: 1920, display: "block" }} />
      </div>

      {/* Pulsing critical badge */}
      <div style={{
        position: "absolute", right: 100, bottom: 100,
        opacity: spring({ frame: frame - 40, fps, config: { damping: 15 } }),
      }}>
        <div style={{
          background: `${RED}15`, border: `1px solid ${RED}40`,
          borderRadius: 16, padding: "16px 28px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            background: RED,
            boxShadow: `0 0 ${12 + Math.sin(frame * 0.15) * 6}px ${RED}`,
          }} />
          <span style={{ fontFamily: "monospace", fontSize: 13, color: RED, letterSpacing: 2 }}>
            ARAI MONITORING ACTIVE
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
