import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill, Sequence, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { BRAND, PRISM_ACCENT, cosmicGradient, glassCardStyle } from "../shared/styles";
import { IconBrandDNA, IconCampaign, IconAdStudio, IconSocialPublish, IconVideoGen, IconImageGen } from "../shared/BrandIcons";

const { fontFamily } = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["latin"] });

const CAPS = [
  { Icon: IconBrandDNA, label: "Brand DNA" },
  { Icon: IconCampaign, label: "Campaigns" },
  { Icon: IconAdStudio, label: "Ad Studio" },
  { Icon: IconSocialPublish, label: "Social Deploy" },
  { Icon: IconVideoGen, label: "Video Gen" },
  { Icon: IconImageGen, label: "AI Images" },
];

export const PrismGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const heroScale = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
  const avatarFloat = Math.sin(frame * 0.03) * 5;
  const avatarGlow = interpolate(Math.sin(frame * 0.04), [-1, 1], [15, 35]);
  const ringRot = frame * 0.4;

  return (
    <AbsoluteFill style={{ background: cosmicGradient, fontFamily, overflow: "hidden" }}>
      {/* Rotating ring */}
      <div style={{
        position: "absolute", top: 540, left: 540,
        width: 700, height: 700,
        transform: `translate(-50%, -50%) rotate(${ringRot}deg)`,
      }}>
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const r = 310;
          const dotPulse = interpolate(Math.sin(frame * 0.05 + i), [-1, 1], [5, 10]);
          return (
            <div key={i} style={{
              position: "absolute",
              left: 350 + Math.cos(rad) * r - dotPulse / 2,
              top: 350 + Math.sin(rad) * r - dotPulse / 2,
              width: dotPulse, height: dotPulse, borderRadius: "50%",
              background: i % 2 === 0 ? PRISM_ACCENT : BRAND.purple,
              boxShadow: `0 0 ${dotPulse * 2}px ${i % 2 === 0 ? PRISM_ACCENT : BRAND.purple}70`,
            }} />
          );
        })}
        <svg width={700} height={700} style={{ position: "absolute", top: 0, left: 0 }}>
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const nextDeg = (deg + 60) % 360;
            const r = 310;
            return <line key={i}
              x1={350 + Math.cos((deg * Math.PI) / 180) * r}
              y1={350 + Math.sin((deg * Math.PI) / 180) * r}
              x2={350 + Math.cos((nextDeg * Math.PI) / 180) * r}
              y2={350 + Math.sin((nextDeg * Math.PI) / 180) * r}
              stroke={`${PRISM_ACCENT}20`} strokeWidth={1} />;
          })}
        </svg>
      </div>

      {/* Stars */}
      {Array.from({ length: 35 }).map((_, i) => {
        const sx = (i * 137.5) % 1080;
        const sy = (i * 251.3) % 1080;
        const twinkle = interpolate(Math.sin(frame * 0.06 + i), [-1, 1], [0.1, 0.6]);
        return <div key={i} style={{ position: "absolute", left: sx, top: sy, width: 2, height: 2, borderRadius: "50%", background: "white", opacity: twinkle }} />;
      })}

      {/* Centre */}
      <Sequence from={0}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: 160, height: 160, borderRadius: 36, overflow: "hidden",
            background: `linear-gradient(135deg, ${PRISM_ACCENT}12, ${BRAND.purple}08)`,
            border: `2px solid ${PRISM_ACCENT}35`,
            boxShadow: `0 0 ${avatarGlow}px ${PRISM_ACCENT}40, 0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)`,
            transform: `scale(${heroScale}) translateY(${avatarFloat}px)`,
            marginBottom: 20,
          }}>
            <Img src={staticFile("images/prism-avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>

          <div style={{
            fontSize: 80, fontWeight: 900, letterSpacing: -3,
            background: `linear-gradient(135deg, ${PRISM_ACCENT}, ${BRAND.purple}, ${BRAND.cyan})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            transform: `scale(${heroScale})`, lineHeight: 1,
          }}>PRISM</div>
          <div style={{
            fontSize: 18, fontWeight: 400, color: "rgba(255,255,255,0.45)",
            letterSpacing: 6, marginTop: 6,
            opacity: interpolate(heroScale, [0.5, 1], [0, 1], { extrapolateLeft: "clamp" }),
          }}>MARKETING AI</div>
        </div>
      </Sequence>

      {/* Orbiting icons */}
      <Sequence from={40}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
          {CAPS.map((cap, i) => {
            const capIn = spring({ frame: frame - 40 - i * 8, fps, config: { damping: 18, stiffness: 160 } });
            const angle = (i / CAPS.length) * 360 + frame * 0.4;
            const rad = (angle * Math.PI) / 180;
            const cx = 540 + Math.cos(rad) * 370;
            const cy = 540 + Math.sin(rad) * 370;
            const iconGlow = interpolate(Math.sin(frame * 0.04 + i * 1.5), [-1, 1], [0, 8]);
            return (
              <div key={i} style={{
                position: "absolute", left: cx, top: cy,
                transform: `translate(-50%, -50%) scale(${capIn})`,
                opacity: capIn,
                ...glassCardStyle,
                padding: "12px 18px", borderRadius: 20,
                display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap",
              }}>
                <cap.Icon size={28} color={PRISM_ACCENT} glow={iconGlow} />
                <span style={{ fontSize: 14, fontWeight: 700, color: BRAND.white }}>{cap.label}</span>
              </div>
            );
          })}
        </div>
      </Sequence>

      <div style={{
        position: "absolute", bottom: 36, left: 36, right: 36,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 4, color: "rgba(255,255,255,0.2)" }}>ASSEMBL</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>assembl.co.nz</span>
      </div>
    </AbsoluteFill>
  );
};
