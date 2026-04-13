import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const GOLD = "#D4A853";

export const SceneOutro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame: frame - 10, fps, config: { damping: 20 } });
  const lineWidth = interpolate(frame, [20, 60], [0, 300], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const subtitleOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  const stats = [
    { label: "Documents Scanned", value: "47" },
    { label: "Clauses Verified", value: "22" },
    { label: "Pack Generated", value: "<5s" },
  ];

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(135deg, #0A0A0F 0%, #12121A 50%, #0A0A0F 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Glow */}
      <div style={{
        position: "absolute", width: 900, height: 900, borderRadius: "50%",
        background: `radial-gradient(circle, ${GOLD}10 0%, transparent 70%)`,
        top: "50%", left: "50%", transform: "translate(-50%, -50%)",
      }} />

      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* Stats row */}
        <div style={{
          display: "flex", gap: 60, justifyContent: "center", marginBottom: 48,
        }}>
          {stats.map((stat, i) => {
            const s = spring({ frame: frame - 10 - i * 10, fps, config: { damping: 15 } });
            return (
              <div key={stat.label} style={{ opacity: s, transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)` }}>
                <div style={{
                  fontFamily: "sans-serif", fontSize: 48, fontWeight: 200,
                  color: GOLD, lineHeight: 1,
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.4)",
                  letterSpacing: 2, marginTop: 8, textTransform: "uppercase",
                }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Brand */}
        <h1 style={{
          fontFamily: "sans-serif", fontSize: 72, fontWeight: 200,
          color: "white", letterSpacing: 8, textTransform: "uppercase",
          opacity: titleSpring,
          transform: `translateY(${interpolate(titleSpring, [0, 1], [40, 0])}px)`,
          margin: 0,
        }}>
          assembl
        </h1>

        <div style={{
          width: lineWidth, height: 2,
          background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
          margin: "16px auto",
        }} />

        <p style={{
          fontFamily: "monospace", fontSize: 14, color: "rgba(255,255,255,0.35)",
          letterSpacing: 4, textTransform: "uppercase", opacity: subtitleOpacity,
          margin: 0,
        }}>
          AI agents for NZ industry
        </p>
      </div>
    </AbsoluteFill>
  );
};
