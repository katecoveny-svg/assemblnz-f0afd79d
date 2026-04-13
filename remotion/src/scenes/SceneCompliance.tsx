import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, staticFile, Img } from "remotion";

const GOLD = "#D4A853";
const TEAL = "#2DD4A8";

export const SceneCompliance = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const imgSpring = spring({ frame: frame - 5, fps, config: { damping: 20, stiffness: 100 } });
  const labelOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  const checks = ["B1 Structure", "B2 Durability", "D1 Access", "D2 Mechanical", "E1 Surface Water"];
  
  return (
    <AbsoluteFill style={{
      background: "linear-gradient(135deg, #0A0A0F 0%, #0F0F18 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Label */}
      <div style={{ position: "absolute", top: 60, left: 100, opacity: labelOpacity }}>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: TEAL, letterSpacing: 4, textTransform: "uppercase" }}>
          02 — AI Compliance Scan
        </span>
        <h2 style={{ fontFamily: "sans-serif", fontSize: 36, color: "white", fontWeight: 300, margin: "8px 0 0", letterSpacing: 2 }}>
          22 / 26 Clauses Verified
        </h2>
      </div>

      {/* Screenshot */}
      <div style={{
        transform: `scale(${interpolate(imgSpring, [0, 1], [0.9, 0.72])}) translateX(${interpolate(imgSpring, [0, 1], [-40, -80])}px)`,
        opacity: imgSpring,
        borderRadius: 16, overflow: "hidden",
        boxShadow: `0 40px 100px rgba(0,0,0,0.6)`,
        border: `1px solid rgba(255,255,255,0.08)`,
        marginTop: 60,
      }}>
        <Img src={staticFile("images/compliance.png")} style={{ width: 1920, display: "block" }} />
      </div>

      {/* Floating check badges */}
      <div style={{
        position: "absolute", right: 80, top: 200,
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        {checks.map((check, i) => {
          const s = spring({ frame: frame - 30 - i * 8, fps, config: { damping: 15 } });
          return (
            <div key={check} style={{
              opacity: s,
              transform: `translateX(${interpolate(s, [0, 1], [40, 0])}px)`,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${TEAL}30`,
              borderRadius: 12, padding: "12px 20px",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: `${TEAL}20`, display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 14, color: TEAL,
              }}>✓</div>
              <span style={{ fontFamily: "monospace", fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
                {check}
              </span>
              <span style={{
                fontFamily: "monospace", fontSize: 11, color: TEAL,
                background: `${TEAL}15`, padding: "3px 8px", borderRadius: 6,
              }}>VERIFIED</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
