import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  Sequence,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import type { KeteRaceData } from "./keteData";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

// Timing constants (in frames at 30fps)
const INTRO_DUR = 45;
const STEP_INTERVAL = 30; // frames between each step completing
const HUMAN_STEP_INTERVAL = 50; // human is slower
const OUTRO_DUR = 60;

interface Props {
  data: KeteRaceData;
  format: "square" | "story";
}

const CheckIcon: React.FC<{ color: string; size: number }> = ({
  color,
  size,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill={`${color}30`} stroke={color} strokeWidth="2" />
    <path d="M8 12l3 3 5-5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WaitIcon: React.FC<{ color: string; size: number }> = ({
  color,
  size,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={`${color}40`} strokeWidth="1.5" strokeDasharray="3 3" />
  </svg>
);

const SpinnerIcon: React.FC<{
  color: string;
  size: number;
  rotation: number;
}> = ({ color, size, rotation }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ transform: `rotate(${rotation}deg)` }}
  >
    <circle cx="12" cy="12" r="10" stroke={`${color}20`} strokeWidth="2" />
    <path
      d="M12 2a10 10 0 019.8 8"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

export const SplitScreenRace: React.FC<Props> = ({ data, format }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isStory = format === "story";

  const totalSteps = data.aiSteps.length;
  const aiDoneFrame = INTRO_DUR + totalSteps * STEP_INTERVAL + 15;
  const humanDoneFrame = INTRO_DUR + totalSteps * HUMAN_STEP_INTERVAL + 15;
  const totalDuration = humanDoneFrame + OUTRO_DUR;

  // Sizes
  const pad = isStory ? 40 : 36;
  const splitGap = isStory ? 16 : 20;
  const headerH = isStory ? 200 : 140;
  const footerH = isStory ? 120 : 80;
  const panelW = isStory ? (width - pad * 2 - splitGap) / 2 : (width - pad * 2 - splitGap) / 2;
  const panelH = height - headerH - footerH;
  const stepH = isStory ? 90 : 68;
  const fontSize = isStory ? 16 : 14;
  const titleSize = isStory ? 52 : 42;
  const subSize = isStory ? 20 : 16;
  const iconSize = isStory ? 26 : 22;

  // Intro animation
  const introScale = spring({ frame, fps, config: { damping: 15, stiffness: 120 } });
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // Timer display
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Calculate completed steps for each side
  const getCompletedSteps = (startFrame: number, interval: number) => {
    const elapsed = frame - startFrame;
    if (elapsed < 0) return 0;
    return Math.min(Math.floor(elapsed / interval) + 1, totalSteps);
  };

  const aiCompleted = getCompletedSteps(INTRO_DUR, STEP_INTERVAL);
  const humanCompleted = getCompletedSteps(INTRO_DUR, HUMAN_STEP_INTERVAL);
  const aiDone = aiCompleted >= totalSteps;
  const humanDone = humanCompleted >= totalSteps;

  // Timer (simulated real-world time)
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

  // Background pulse
  const bgPulse = interpolate(Math.sin(frame * 0.02), [-1, 1], [0.95, 1]);

  // Divider line glow
  const dividerGlow = interpolate(Math.sin(frame * 0.05), [-1, 1], [4, 12]);

  const renderPanel = (
    side: "human" | "ai",
    steps: { label: string; durationSec: number }[],
    completed: number,
    done: boolean,
    timerSec: number,
    x: number
  ) => {
    const isAI = side === "ai";
    const sideColor = isAI ? data.accent : "#94A3B8";
    const bgColor = isAI ? `${data.accent}08` : "rgba(148,163,184,0.04)";
    const headerBg = isAI ? `${data.accent}15` : "rgba(148,163,184,0.08)";

    return (
      <div
        style={{
          position: "absolute",
          left: x,
          top: headerH,
          width: panelW,
          height: panelH,
          background: bgColor,
          borderRadius: 16,
          border: `1px solid ${isAI ? `${data.accent}30` : "rgba(255,255,255,0.08)"}`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Panel header */}
        <div
          style={{
            padding: isStory ? "20px 20px 16px" : "14px 16px 10px",
            background: headerBg,
            borderBottom: `1px solid ${isAI ? `${data.accent}20` : "rgba(255,255,255,0.06)"}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: isStory ? 18 : 15,
                fontWeight: 800,
                color: isAI ? data.accent : "#94A3B8",
                letterSpacing: 2,
              }}
            >
              {isAI ? "ASSEMBL AI" : "HUMAN"}
            </div>
            <div style={{ fontSize: isStory ? 12 : 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
              {isAI ? "Automated workflow" : "Manual process"}
            </div>
          </div>
          <div
            style={{
              fontSize: isStory ? 28 : 22,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              color: done ? (isAI ? data.accent : "#94A3B8") : "rgba(255,255,255,0.7)",
            }}
          >
            {formatTime(timerSec)}
          </div>
        </div>

        {/* Steps */}
        <div style={{ padding: isStory ? "16px 20px" : "12px 16px", flex: 1 }}>
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
                  gap: isStory ? 14 : 10,
                  height: stepH,
                  opacity: isComplete ? 1 : isActive ? 0.8 : 0.35,
                  transform: `translateX(${isComplete ? 0 : isActive ? 4 : 0}px)`,
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
                    fontWeight: isComplete ? 600 : 400,
                    color: isComplete
                      ? "rgba(255,255,255,0.9)"
                      : isActive
                        ? "rgba(255,255,255,0.7)"
                        : "rgba(255,255,255,0.3)",
                    lineHeight: 1.3,
                  }}
                >
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status bar */}
        <div
          style={{
            padding: isStory ? "12px 20px" : "8px 16px",
            borderTop: `1px solid ${isAI ? `${data.accent}15` : "rgba(255,255,255,0.04)"}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: isStory ? 12 : 10, color: done ? sideColor : "rgba(255,255,255,0.3)", fontWeight: 600 }}>
            {done ? "✓ COMPLETE" : `${completed}/${totalSteps} steps`}
          </div>
          {/* Progress bar */}
          <div
            style={{
              width: isStory ? 80 : 60,
              height: 4,
              borderRadius: 2,
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(completed / totalSteps) * 100}%`,
                height: "100%",
                borderRadius: 2,
                background: sideColor,
                transition: "none",
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 30% 20%, ${data.accent}12 0%, transparent 50%),
                     radial-gradient(ellipse at 70% 80%, ${data.accent}08 0%, transparent 50%),
                     linear-gradient(180deg, #08090D 0%, #0C0D12 50%, #08090D 100%)`,
        fontFamily,
        overflow: "hidden",
        transform: `scale(${bgPulse})`,
      }}
    >
      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${data.accent}06 1px, transparent 1px), linear-gradient(90deg, ${data.accent}06 1px, transparent 1px)`,
          backgroundSize: isStory ? "60px 60px" : "50px 50px",
        }}
      />

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
              fontSize: isStory ? 14 : 12,
              fontWeight: 600,
              letterSpacing: 4,
              color: data.accent,
              marginBottom: 8,
            }}
          >
            {data.icon} {data.tagline.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 800,
              letterSpacing: -1,
              background: `linear-gradient(135deg, ${data.accent}, ${data.accentLight})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.1,
            }}
          >
            {data.name}
          </div>
          <div
            style={{
              fontSize: subSize,
              color: "rgba(255,255,255,0.4)",
              marginTop: 6,
              fontWeight: 400,
            }}
          >
            The race is on. AI vs manual workflow.
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
          background: `linear-gradient(180deg, transparent, ${data.accent}40, transparent)`,
          boxShadow: `0 0 ${dividerGlow}px ${data.accent}30`,
        }}
      />

      {/* VS badge */}
      <div
        style={{
          position: "absolute",
          left: pad + panelW + splitGap / 2 - (isStory ? 22 : 18),
          top: headerH + panelH / 2 - (isStory ? 22 : 18),
          width: isStory ? 44 : 36,
          height: isStory ? 44 : 36,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${data.accent}, ${data.accentLight})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isStory ? 14 : 11,
          fontWeight: 800,
          color: "#0C0D12",
          boxShadow: `0 0 20px ${data.accent}50`,
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
            bottom: footerH + 20,
            transform: `scale(${winnerScale})`,
            background: `${data.accent}20`,
            border: `2px solid ${data.accent}60`,
            borderRadius: 16,
            padding: isStory ? "20px 28px" : "14px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div
            style={{
              fontSize: isStory ? 14 : 11,
              fontWeight: 800,
              letterSpacing: 3,
              color: data.accent,
            }}
          >
            ⚡ AI WINS
          </div>
          <div
            style={{
              fontSize: isStory ? 28 : 22,
              fontWeight: 800,
              color: "white",
            }}
          >
            {data.stat}
          </div>
        </div>
      )}

      {/* Footer */}
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
        }}
      >
        <div
          style={{
            fontSize: isStory ? 14 : 12,
            fontWeight: 700,
            letterSpacing: 4,
            color: "rgba(255,255,255,0.2)",
          }}
        >
          ASSEMBL
        </div>
        <div
          style={{
            fontSize: isStory ? 12 : 10,
            color: "rgba(255,255,255,0.25)",
          }}
        >
          assembl.co.nz
        </div>
      </div>
    </AbsoluteFill>
  );
};
