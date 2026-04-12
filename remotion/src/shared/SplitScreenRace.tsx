import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  Sequence,
} from "remotion";
import { loadFont as loadJakarta } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadLato } from "@remotion/google-fonts/Lato";
import type { KeteRaceData } from "./keteData";

const { fontFamily: bodyFont } = loadJakarta("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const { fontFamily: displayFont } = loadLato("normal", {
  weights: ["300", "400", "700"],
  subsets: ["latin"],
});

// Timing constants (frames at 30fps)
const INTRO_DUR = 45;
const STEP_INTERVAL = 30;
const HUMAN_STEP_INTERVAL = 50;
const OUTRO_DUR = 60;

interface Props {
  data: KeteRaceData;
  format: "square" | "story";
}

/* ── SVG Icons ── */
const CheckIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill={`${color}25`} stroke={color} strokeWidth="2" />
    <path d="M8 12l3 3 5-5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WaitIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={`${color}30`} strokeWidth="1.5" strokeDasharray="3 3" />
  </svg>
);

const SpinnerIcon: React.FC<{ color: string; size: number; rotation: number }> = ({
  color, size, rotation,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ transform: `rotate(${rotation}deg)` }}>
    <circle cx="12" cy="12" r="10" stroke={`${color}15`} strokeWidth="2" />
    <path d="M12 2a10 10 0 019.8 8" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/* ── Harakeke Weave Pattern (SVG) ── */
const HarakekeWeave: React.FC<{ color: string; opacity: number }> = ({ color, opacity }) => (
  <svg
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity, pointerEvents: "none" }}
    preserveAspectRatio="none"
    viewBox="0 0 200 200"
  >
    {/* Diagonal strands – left-to-right */}
    {Array.from({ length: 12 }).map((_, i) => (
      <line
        key={`a${i}`}
        x1={-20 + i * 20}
        y1={0}
        x2={-20 + i * 20 + 200}
        y2={200}
        stroke={color}
        strokeWidth="0.8"
        strokeOpacity="0.3"
      />
    ))}
    {/* Diagonal strands – right-to-left */}
    {Array.from({ length: 12 }).map((_, i) => (
      <line
        key={`b${i}`}
        x1={220 - i * 20}
        y1={0}
        x2={220 - i * 20 - 200}
        y2={200}
        stroke={color}
        strokeWidth="0.8"
        strokeOpacity="0.2"
      />
    ))}
  </svg>
);

/* ── Powered by Assembl Badge ── */
const PoweredBadge: React.FC<{ isStory: boolean; accent: string; opacity: number }> = ({
  isStory, accent, opacity,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: isStory ? 10 : 8,
      opacity,
    }}
  >
    {/* Assembl mark – stylised "A" */}
    <svg width={isStory ? 28 : 22} height={isStory ? 28 : 22} viewBox="0 0 32 32" fill="none">
      <rect rx="6" width="32" height="32" fill={`${accent}20`} />
      <path
        d="M16 6L8 26h4l2-5h4l2 5h4L16 6zm0 8l2 5h-4l2-5z"
        fill={accent}
        fillOpacity="0.9"
      />
    </svg>
    <div>
      <div
        style={{
          fontSize: isStory ? 11 : 9,
          fontFamily: bodyFont,
          fontWeight: 500,
          color: "rgba(255,255,255,0.35)",
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        Powered by
      </div>
      <div
        style={{
          fontSize: isStory ? 16 : 13,
          fontFamily: displayFont,
          fontWeight: 300,
          letterSpacing: 4,
          color: "rgba(255,255,255,0.6)",
          textTransform: "uppercase",
        }}
      >
        ASSEMBL
      </div>
    </div>
  </div>
);

export const SplitScreenRace: React.FC<Props> = ({ data, format }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isStory = format === "story";

  const totalSteps = data.aiSteps.length;
  const aiDoneFrame = INTRO_DUR + totalSteps * STEP_INTERVAL + 15;
  const humanDoneFrame = INTRO_DUR + totalSteps * HUMAN_STEP_INTERVAL + 15;

  // Layout
  const pad = isStory ? 36 : 32;
  const splitGap = isStory ? 14 : 16;
  const headerH = isStory ? 220 : 150;
  const footerH = isStory ? 130 : 90;
  const panelW = (width - pad * 2 - splitGap) / 2;
  const panelH = height - headerH - footerH;
  const stepH = isStory ? 85 : 64;
  const fontSize = isStory ? 15 : 13;
  const titleSize = isStory ? 48 : 38;
  const subSize = isStory ? 18 : 14;
  const iconSize = isStory ? 24 : 20;

  // Intro animations
  const introScale = spring({ frame, fps, config: { damping: 15, stiffness: 120 } });
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Timer display
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Step completion
  const getCompletedSteps = (startFrame: number, interval: number) => {
    const elapsed = frame - startFrame;
    if (elapsed < 0) return 0;
    return Math.min(Math.floor(elapsed / interval) + 1, totalSteps);
  };

  const aiCompleted = getCompletedSteps(INTRO_DUR, STEP_INTERVAL);
  const humanCompleted = getCompletedSteps(INTRO_DUR, HUMAN_STEP_INTERVAL);
  const aiDone = aiCompleted >= totalSteps;
  const humanDone = humanCompleted >= totalSteps;

  // Timers
  const humanTimerSec = Math.min(
    interpolate(frame, [INTRO_DUR, humanDoneFrame], [0, data.humanSteps.reduce((a, s) => a + s.durationSec, 0)], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    data.humanSteps.reduce((a, s) => a + s.durationSec, 0)
  );
  const aiTimerSec = Math.min(
    interpolate(frame, [INTRO_DUR, aiDoneFrame], [0, data.aiSteps.reduce((a, s) => a + s.durationSec, 0)], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    data.aiSteps.reduce((a, s) => a + s.durationSec, 0)
  );

  // Winner celebration
  const showWinner = frame > aiDoneFrame + 10;
  const winnerScale = showWinner
    ? spring({ frame: frame - aiDoneFrame - 10, fps, config: { damping: 10, stiffness: 100 } })
    : 0;

  // Subtle background drift
  const bgDrift = interpolate(frame, [0, 360], [0, 8], { extrapolateRight: "clamp" });

  // Footer fade-in
  const footerOpacity = interpolate(frame, [10, 40], [0, 1], { extrapolateRight: "clamp" });

  // Divider glow
  const dividerGlow = interpolate(Math.sin(frame * 0.05), [-1, 1], [4, 14]);

  const renderPanel = (
    side: "human" | "ai",
    steps: { label: string; durationSec: number }[],
    completed: number,
    done: boolean,
    timerSec: number,
    x: number
  ) => {
    const isAI = side === "ai";
    const sideColor = isAI ? data.accent : "#64748B";
    const panelBg = isAI ? `${data.accent}06` : "rgba(100,116,139,0.03)";
    const headerBg = isAI ? `${data.accent}12` : "rgba(100,116,139,0.06)";

    return (
      <div
        style={{
          position: "absolute",
          left: x,
          top: headerH,
          width: panelW,
          height: panelH,
          background: panelBg,
          borderRadius: 14,
          border: `1px solid ${isAI ? `${data.accent}20` : "rgba(255,255,255,0.05)"}`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Weave overlay on AI panel */}
        {isAI && <HarakekeWeave color={data.accent} opacity={0.06} />}

        {/* Panel header */}
        <div
          style={{
            padding: isStory ? "18px 18px 14px" : "12px 14px 10px",
            background: headerBg,
            borderBottom: `1px solid ${isAI ? `${data.accent}15` : "rgba(255,255,255,0.04)"}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div>
            <div
              style={{
                fontSize: isStory ? 13 : 11,
                fontFamily: displayFont,
                fontWeight: 300,
                color: isAI ? data.accent : "#64748B",
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              {isAI ? "ASSEMBL AI" : "MANUAL"}
            </div>
            <div style={{ fontSize: isStory ? 11 : 9, fontFamily: bodyFont, color: "rgba(255,255,255,0.25)", marginTop: 2, fontWeight: 400 }}>
              {isAI ? "Automated workflow" : "Human process"}
            </div>
          </div>
          <div
            style={{
              fontSize: isStory ? 26 : 20,
              fontFamily: bodyFont,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              color: done ? (isAI ? data.accent : "#64748B") : "rgba(255,255,255,0.5)",
            }}
          >
            {formatTime(timerSec)}
          </div>
        </div>

        {/* Steps */}
        <div style={{ padding: isStory ? "14px 18px" : "10px 14px", flex: 1, position: "relative", zIndex: 2 }}>
          {steps.map((step, i) => {
            const isComplete = i < completed;
            const isActive = i === completed - 1 || (i === completed && !done && frame > INTRO_DUR);
            const stepSpring = isComplete
              ? spring({
                  frame: frame - INTRO_DUR - i * (isAI ? STEP_INTERVAL : HUMAN_STEP_INTERVAL),
                  fps,
                  config: { damping: 12, stiffness: 180 },
                })
              : 0;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isStory ? 12 : 9,
                  height: stepH,
                  opacity: isComplete ? 1 : isActive ? 0.7 : 0.3,
                  transform: `translateX(${isComplete ? 0 : isActive ? 3 : 0}px)`,
                }}
              >
                <div style={{ flexShrink: 0, transform: `scale(${isComplete ? stepSpring : 1})` }}>
                  {isComplete ? (
                    <CheckIcon color={sideColor} size={iconSize} />
                  ) : isActive && !done ? (
                    <SpinnerIcon color={sideColor} size={iconSize} rotation={frame * 6} />
                  ) : (
                    <WaitIcon color={sideColor} size={iconSize} />
                  )}
                </div>
                <div
                  style={{
                    fontSize,
                    fontFamily: bodyFont,
                    fontWeight: isComplete ? 600 : 400,
                    color: isComplete
                      ? "rgba(255,255,255,0.85)"
                      : isActive
                        ? "rgba(255,255,255,0.6)"
                        : "rgba(255,255,255,0.25)",
                    lineHeight: 1.35,
                  }}
                >
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div
          style={{
            padding: isStory ? "10px 18px" : "8px 14px",
            borderTop: `1px solid ${isAI ? `${data.accent}10` : "rgba(255,255,255,0.03)"}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div style={{ fontSize: isStory ? 11 : 9, fontFamily: bodyFont, color: done ? sideColor : "rgba(255,255,255,0.25)", fontWeight: 600, letterSpacing: 1 }}>
            {done ? "✓ COMPLETE" : `${completed}/${totalSteps}`}
          </div>
          <div style={{ width: isStory ? 80 : 60, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{ width: `${(completed / totalSteps) * 100}%`, height: "100%", borderRadius: 2, background: sideColor }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse at ${30 + bgDrift}% 20%, ${data.accent}10 0%, transparent 50%),
          radial-gradient(ellipse at ${70 - bgDrift}% 80%, ${data.accent}06 0%, transparent 50%),
          linear-gradient(180deg, #09090F 0%, #0C0D14 50%, #09090F 100%)`,
        fontFamily: bodyFont,
        overflow: "hidden",
      }}
    >
      {/* Harakeke weave background texture */}
      <HarakekeWeave color={data.accent} opacity={0.03} />

      {/* Header */}
      <Sequence from={0}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: headerH,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: titleOpacity,
            transform: `scale(${introScale})`,
          }}
        >
          <div
            style={{
              fontSize: isStory ? 12 : 10,
              fontFamily: displayFont,
              fontWeight: 300,
              letterSpacing: 5,
              color: data.accent,
              marginBottom: isStory ? 10 : 6,
              textTransform: "uppercase",
            }}
          >
            {data.icon}  {data.tagline}
          </div>
          <div
            style={{
              fontSize: titleSize,
              fontFamily: displayFont,
              fontWeight: 300,
              letterSpacing: 6,
              background: `linear-gradient(135deg, ${data.accent}, ${data.accentLight})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.1,
              textTransform: "uppercase",
            }}
          >
            {data.name}
          </div>
          <div
            style={{
              fontSize: subSize,
              fontFamily: bodyFont,
              color: "rgba(255,255,255,0.3)",
              marginTop: isStory ? 10 : 6,
              fontWeight: 400,
              letterSpacing: 1,
            }}
          >
            AI vs Manual — The Race Is On
          </div>
        </div>
      </Sequence>

      {/* Split panels */}
      {renderPanel("human", data.humanSteps, humanCompleted, humanDone, humanTimerSec, pad)}
      {renderPanel("ai", data.aiSteps, aiCompleted, aiDone, aiTimerSec, pad + panelW + splitGap)}

      {/* Centre divider */}
      <div
        style={{
          position: "absolute",
          left: pad + panelW + splitGap / 2 - 1,
          top: headerH + 20,
          bottom: footerH + 20,
          width: 2,
          background: `linear-gradient(180deg, transparent, ${data.accent}30, transparent)`,
          boxShadow: `0 0 ${dividerGlow}px ${data.accent}20`,
        }}
      />

      {/* VS badge */}
      <div
        style={{
          position: "absolute",
          left: pad + panelW + splitGap / 2 - (isStory ? 20 : 16),
          top: headerH + panelH / 2 - (isStory ? 20 : 16),
          width: isStory ? 40 : 32,
          height: isStory ? 40 : 32,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${data.accent}, ${data.accentLight})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isStory ? 13 : 10,
          fontFamily: displayFont,
          fontWeight: 700,
          color: "#09090F",
          boxShadow: `0 0 24px ${data.accent}40`,
          zIndex: 10,
        }}
      >
        VS
      </div>

      {/* Winner overlay */}
      {showWinner && (
        <div
          style={{
            position: "absolute",
            right: pad,
            bottom: footerH + 16,
            transform: `scale(${winnerScale})`,
            background: `${data.accent}15`,
            border: `1px solid ${data.accent}40`,
            borderRadius: 14,
            padding: isStory ? "18px 24px" : "12px 18px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div
            style={{
              fontSize: isStory ? 12 : 10,
              fontFamily: displayFont,
              fontWeight: 300,
              letterSpacing: 4,
              color: data.accent,
              textTransform: "uppercase",
            }}
          >
            ⚡ AI WINS
          </div>
          <div
            style={{
              fontSize: isStory ? 26 : 20,
              fontFamily: bodyFont,
              fontWeight: 700,
              color: "white",
            }}
          >
            {data.stat}
          </div>
        </div>
      )}

      {/* Footer – Powered by Assembl */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: footerH,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `0 ${pad}px`,
          opacity: footerOpacity,
        }}
      >
        <PoweredBadge isStory={isStory} accent={data.accent} opacity={1} />
        <div
          style={{
            fontSize: isStory ? 11 : 9,
            fontFamily: bodyFont,
            color: "rgba(255,255,255,0.2)",
            fontWeight: 400,
            letterSpacing: 1,
          }}
        >
          assembl.co.nz
        </div>
      </div>
    </AbsoluteFill>
  );
};
