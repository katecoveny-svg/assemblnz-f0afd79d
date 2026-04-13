import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, staticFile, Img } from "remotion";

const GOLD = "#D4A853";

export const SceneEvidence = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const imgSpring = spring({ frame: frame - 5, fps, config: { damping: 20, stiffness: 100 } });
  const labelOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  
  // Cursor moving to "Generate" button
  const cursorX = interpolate(frame, [30, 60], [1600, 945], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const cursorY = interpolate(frame, [30, 60], [200, 425], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const cursorOpacity = interpolate(frame, [25, 35, 75, 85], [0, 1, 1, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  
  // Click ripple
  const clickFrame = frame - 65;
  const clickScale = clickFrame > 0 ? interpolate(clickFrame, [0, 15], [0, 3], { extrapolateRight: "clamp" }) : 0;
  const clickOpacity = clickFrame > 0 ? interpolate(clickFrame, [0, 15], [0.6, 0], { extrapolateRight: "clamp" }) : 0;

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(135deg, #0A0A0F 0%, #0F0F18 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Label */}
      <div style={{ position: "absolute", top: 60, left: 100, opacity: labelOpacity }}>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: GOLD, letterSpacing: 4, textTransform: "uppercase" }}>
          04 — Generate Evidence Pack
        </span>
        <h2 style={{ fontFamily: "sans-serif", fontSize: 36, color: "white", fontWeight: 300, margin: "8px 0 0", letterSpacing: 2 }}>
          One-Click Compliance Bundle
        </h2>
      </div>

      {/* Screenshot */}
      <div style={{
        transform: `scale(${interpolate(imgSpring, [0, 1], [0.9, 0.75])}) translateY(${interpolate(imgSpring, [0, 1], [40, 20])}px)`,
        opacity: imgSpring,
        borderRadius: 16, overflow: "hidden",
        boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 60px ${GOLD}08`,
        border: `1px solid rgba(255,255,255,0.08)`,
        marginTop: 60,
        position: "relative",
      }}>
        <Img src={staticFile("images/evidence.png")} style={{ width: 1920, display: "block" }} />
      </div>

      {/* Animated cursor */}
      <div style={{
        position: "absolute", left: cursorX, top: cursorY,
        opacity: cursorOpacity, zIndex: 10,
      }}>
        {/* Click ripple */}
        <div style={{
          position: "absolute", width: 30, height: 30,
          borderRadius: "50%", border: `2px solid ${GOLD}`,
          transform: `scale(${clickScale}) translate(-50%, -50%)`,
          opacity: clickOpacity,
        }} />
        {/* Cursor dot */}
        <div style={{
          width: 16, height: 16, borderRadius: "50%",
          background: GOLD, boxShadow: `0 0 20px ${GOLD}80`,
          border: "2px solid white",
        }} />
      </div>
    </AbsoluteFill>
  );
};
