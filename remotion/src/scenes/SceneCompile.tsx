import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const GOLD = "#D4A853";
const TEAL = "#2DD4A8";

const STEPS = [
  "Scanning 47 documents…",
  "Verifying compliance references…",
  "Cross-referencing Building Code…",
  "Running gap analysis…",
  "Generating table of contents…",
  "Compiling evidence pack…",
  "Watermarking & signing…",
];

export const SceneCompile = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(frame, [0, 130], [0, 100], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const stepIdx = Math.min(Math.floor((progress / 100) * STEPS.length), STEPS.length - 1);

  const completeBadge = spring({ frame: frame - 130, fps, config: { damping: 12 } });

  // Document icons floating in
  const docs = [
    { label: "B1/VM1", x: -300, y: -200, delay: 10 },
    { label: "NZS 3101", x: 300, y: -180, delay: 18 },
    { label: "C/AS7", x: -250, y: 100, delay: 26 },
    { label: "FER", x: 350, y: 120, delay: 34 },
    { label: "NZS 4121", x: -100, y: 220, delay: 42 },
    { label: "PS1", x: 200, y: -280, delay: 50 },
  ];

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(135deg, #0A0A0F 0%, #0D0D16 50%, #0A0A0F 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Radial pulse */}
      <div style={{
        position: "absolute", width: 600, height: 600, borderRadius: "50%",
        background: `radial-gradient(circle, ${GOLD}${progress > 90 ? "20" : "08"} 0%, transparent 70%)`,
        top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        transition: "background 0.3s",
      }} />

      {/* Floating document chips */}
      {docs.map((doc) => {
        const s = spring({ frame: frame - doc.delay, fps, config: { damping: 15, stiffness: 80 } });
        const absorbFrame = frame - 80;
        const absorb = absorbFrame > 0 ? interpolate(absorbFrame, [0, 30], [0, 1], { extrapolateRight: "clamp" }) : 0;
        return (
          <div key={doc.label} style={{
            position: "absolute",
            left: `calc(50% + ${doc.x * (1 - absorb)}px)`,
            top: `calc(50% + ${doc.y * (1 - absorb)}px)`,
            opacity: s * (1 - absorb * 0.8),
            transform: `scale(${s})`,
          }}>
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${GOLD}25`,
              borderRadius: 10, padding: "8px 16px",
              fontFamily: "monospace", fontSize: 12,
              color: "rgba(255,255,255,0.5)",
            }}>
              📄 {doc.label}
            </div>
          </div>
        );
      })}

      {/* Center compile panel */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: 24, padding: "48px 64px",
        width: 560, textAlign: "center",
        boxShadow: `0 0 80px ${GOLD}06`,
        position: "relative", zIndex: 2,
      }}>
        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: `${GOLD}15`, display: "flex",
          alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", fontSize: 28,
        }}>
          {progress >= 100 ? "✅" : "⚡"}
        </div>

        <h3 style={{
          fontFamily: "sans-serif", fontSize: 24, color: "white",
          fontWeight: 400, margin: "0 0 8px", letterSpacing: 1,
        }}>
          {progress >= 100 ? "Evidence Pack Ready" : "Compiling Evidence Pack"}
        </h3>

        <p style={{
          fontFamily: "monospace", fontSize: 13, color: GOLD,
          margin: "0 0 24px", minHeight: 20,
        }}>
          {progress < 100 ? STEPS[stepIdx] : "All checks passed"}
        </p>

        {/* Progress bar */}
        <div style={{
          width: "100%", height: 8, borderRadius: 4,
          background: "rgba(255,255,255,0.06)", overflow: "hidden",
        }}>
          <div style={{
            width: `${progress}%`, height: "100%", borderRadius: 4,
            background: progress >= 100
              ? `linear-gradient(90deg, ${TEAL}, ${TEAL})`
              : `linear-gradient(90deg, ${GOLD}, ${GOLD}CC)`,
          }} />
        </div>

        <p style={{
          fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.3)",
          margin: "12px 0 0", textAlign: "right",
        }}>
          {Math.round(progress)}%
        </p>

        {/* Complete badge */}
        {progress >= 100 && (
          <div style={{
            marginTop: 20,
            opacity: completeBadge,
            transform: `scale(${completeBadge})`,
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: `${TEAL}15`, border: `1px solid ${TEAL}30`,
              borderRadius: 12, padding: "10px 20px",
            }}>
              <span style={{ color: TEAL, fontSize: 14 }}>🛡️</span>
              <span style={{ fontFamily: "monospace", fontSize: 12, color: TEAL, letterSpacing: 2 }}>
                WATERMARKED · AUDIT-READY
              </span>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
