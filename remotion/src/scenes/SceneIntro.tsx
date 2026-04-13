import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const GOLD = "#D4A853";

export const SceneIntro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame: frame - 10, fps, config: { damping: 20, stiffness: 120 } });
  const subtitleOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const lineWidth = interpolate(frame, [20, 60], [0, 400], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const badgeSpring = spring({ frame: frame - 50, fps, config: { damping: 15 } });

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(135deg, #0A0A0F 0%, #12121A 50%, #0A0A0F 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Radial glow */}
      <div style={{
        position: "absolute", width: 800, height: 800, borderRadius: "50%",
        background: `radial-gradient(circle, ${GOLD}12 0%, transparent 70%)`,
        top: "50%", left: "50%", transform: "translate(-50%, -50%)",
      }} />

      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* Kete badge */}
        <div style={{
          opacity: badgeSpring,
          transform: `translateY(${interpolate(badgeSpring, [0, 1], [20, 0])}px)`,
          marginBottom: 24,
        }}>
          <span style={{
            fontFamily: "monospace", fontSize: 14, letterSpacing: 6,
            color: GOLD, border: `1px solid ${GOLD}40`,
            padding: "8px 24px", borderRadius: 100,
            textTransform: "uppercase",
          }}>
            Construction Kete
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "sans-serif", fontSize: 96, fontWeight: 200,
          color: "white", letterSpacing: 12, textTransform: "uppercase",
          transform: `translateY(${interpolate(titleSpring, [0, 1], [60, 0])}px)`,
          opacity: titleSpring, margin: 0, lineHeight: 1,
        }}>
          WAIHANGA
        </h1>

        {/* Gold line */}
        <div style={{
          width: lineWidth, height: 2, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
          margin: "20px auto",
        }} />

        {/* Subtitle */}
        <p style={{
          fontFamily: "sans-serif", fontSize: 22, color: "rgba(255,255,255,0.5)",
          letterSpacing: 4, textTransform: "uppercase", opacity: subtitleOpacity,
          fontWeight: 300, margin: 0,
        }}>
          Evidence Packs in Action
        </p>
      </div>
    </AbsoluteFill>
  );
};
