import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill, Sequence, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { BRAND, TURF_ACCENT, cosmicGradient, glassCardStyle } from "../shared/styles";
import { IconConstitution, IconFacility, IconGrant, IconMembership, IconAGM, IconCompliance } from "../shared/BrandIcons";

const { fontFamily } = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["latin"] });

const FEATURES = [
  { Icon: IconConstitution, title: "Constitution Generator", desc: "14-section ISA 2022 compliant docs" },
  { Icon: IconFacility, title: "Facility Management", desc: "Bookings, maintenance & scheduling" },
  { Icon: IconGrant, title: "Grant Applications", desc: "Gaming trust & funding proposals" },
  { Icon: IconMembership, title: "Membership System", desc: "Registers, fees & communications" },
  { Icon: IconAGM, title: "AGM Documents", desc: "Minutes, reports & resolutions" },
  { Icon: IconCompliance, title: "Compliance Alerts", desc: "Deadline tracking & reminders" },
];

const GlassOrb: React.FC<{ x: number; y: number; size: number; color: string; delay: number }> = ({ x, y, size, color, delay }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin((frame + delay * 10) * 0.02) * 15;
  const drift2 = Math.cos((frame + delay * 7) * 0.015) * 10;
  const pulse = interpolate(Math.sin(frame * 0.04 + delay), [-1, 1], [0.7, 1]);
  return (
    <div style={{
      position: "absolute", left: x + drift, top: y + drift2,
      width: size, height: size, borderRadius: "50%",
      background: `radial-gradient(circle at 35% 35%, ${color}60, ${color}20, transparent)`,
      boxShadow: `0 0 ${size * 0.6}px ${color}30`, opacity: pulse,
    }} />
  );
};

export const TurfStory: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const avatarIn = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
  const titleIn = spring({ frame: frame - 10, fps, config: { damping: 18, stiffness: 120 } });
  const subtitleIn = spring({ frame: frame - 18, fps, config: { damping: 20 } });
  const avatarFloat = Math.sin(frame * 0.03) * 6;
  const avatarGlow = interpolate(Math.sin(frame * 0.04), [-1, 1], [20, 40]);

  return (
    <AbsoluteFill style={{ background: cosmicGradient, fontFamily, overflow: "hidden" }}>
      {/* Cosmic orbs */}
      <GlassOrb x={80} y={250} size={180} color={BRAND.cyan} delay={0} />
      <GlassOrb x={700} y={500} size={120} color={BRAND.purple} delay={2} />
      <GlassOrb x={300} y={1500} size={200} color={BRAND.deepBlue} delay={4} />
      <GlassOrb x={800} y={1700} size={90} color={TURF_ACCENT} delay={6} />

      {/* Star field */}
      {Array.from({ length: 50 }).map((_, i) => {
        const sx = (i * 137.5) % 1080;
        const sy = (i * 251.3) % 1920;
        const twinkle = interpolate(Math.sin(frame * 0.05 + i * 0.8), [-1, 1], [0.1, 0.7]);
        return <div key={i} style={{ position: "absolute", left: sx, top: sy, width: 2, height: 2, borderRadius: "50%", background: "white", opacity: twinkle }} />;
      })}

      {/* 3D Avatar with glass frame */}
      <Sequence from={0}>
        <div style={{
          position: "absolute", top: 80, left: 0, right: 0,
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          <div style={{
            width: 200, height: 200, borderRadius: 40,
            overflow: "hidden",
            background: `linear-gradient(135deg, ${TURF_ACCENT}15, ${BRAND.cyan}10)`,
            border: `2px solid ${TURF_ACCENT}40`,
            boxShadow: `0 0 ${avatarGlow}px ${TURF_ACCENT}50, 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)`,
            transform: `scale(${avatarIn}) translateY(${avatarFloat}px)`,
          }}>
            <Img src={staticFile("images/turf-avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>

          {/* Title below avatar */}
          <div style={{
            marginTop: 24, textAlign: "center",
            transform: `translateY(${interpolate(titleIn, [0, 1], [30, 0])}px)`,
            opacity: titleIn,
          }}>
            <div style={{
              fontSize: 18, fontWeight: 700, letterSpacing: 6,
              color: TURF_ACCENT, opacity: subtitleIn,
            }}>ASSEMBL PRESENTS</div>
            <div style={{
              fontSize: 88, fontWeight: 900, letterSpacing: -2, lineHeight: 1,
              background: `linear-gradient(135deg, ${TURF_ACCENT}, ${BRAND.cyan})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              marginTop: 8,
            }}>TURF</div>
            <div style={{
              fontSize: 22, fontWeight: 400, color: "rgba(255,255,255,0.5)",
              letterSpacing: 4, marginTop: 4, opacity: subtitleIn,
            }}>SPORTS OPERATIONS AI</div>
          </div>
        </div>
      </Sequence>

      {/* Glass feature cards with custom SVG icons */}
      <Sequence from={35}>
        <div style={{ position: "absolute", top: 520, left: 56, right: 56 }}>
          {FEATURES.map((f, i) => {
            const cardIn = spring({ frame: frame - 35 - i * 11, fps, config: { damping: 16, stiffness: 140 } });
            const iconGlow = interpolate(Math.sin(frame * 0.035 + i * 1.2), [-1, 1], [0, 12]);
            return (
              <div key={i} style={{
                ...glassCardStyle,
                marginBottom: 14,
                transform: `translateX(${interpolate(cardIn, [0, 1], [400, 0])}px)`,
                opacity: cardIn,
                boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 16px ${TURF_ACCENT}${Math.round(interpolate(Math.sin(frame * 0.03 + i), [-1, 1], [0, 0.2]) * 255).toString(16).padStart(2, "0")}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: `linear-gradient(135deg, ${TURF_ACCENT}12, ${BRAND.cyan}08)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: `1px solid ${TURF_ACCENT}25`,
                    flexShrink: 0,
                  }}>
                    <f.Icon size={36} color={TURF_ACCENT} glow={iconGlow} />
                  </div>
                  <div>
                    <div style={{ fontSize: 21, fontWeight: 700, color: BRAND.white }}>{f.title}</div>
                    <div style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{f.desc}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Sequence>

      {/* Bottom CTA */}
      <Sequence from={120}>
        <div style={{ position: "absolute", bottom: 130, left: 0, right: 0, textAlign: "center" }}>
          {(() => {
            const ctaIn = spring({ frame: frame - 120, fps, config: { damping: 14 } });
            return (
              <>
                <div style={{
                  ...glassCardStyle, display: "inline-block", padding: "18px 44px",
                  background: `linear-gradient(135deg, ${TURF_ACCENT}25, ${BRAND.cyan}15)`,
                  border: `1px solid ${TURF_ACCENT}40`,
                  transform: `scale(${ctaIn})`, opacity: ctaIn,
                }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: BRAND.white }}>assembl.co.nz/chat/sports-recreation</div>
                </div>
                <div style={{
                  fontSize: 15, color: "rgba(255,255,255,0.35)", marginTop: 18,
                  opacity: interpolate(ctaIn, [0.5, 1], [0, 1], { extrapolateLeft: "clamp" }),
                }}>ISA 2022 Deadline: 5 April 2026</div>
              </>
            );
          })()}
        </div>
      </Sequence>

      <div style={{
        position: "absolute", bottom: 44, left: 0, right: 0, textAlign: "center",
        fontSize: 13, fontWeight: 700, letterSpacing: 5, color: "rgba(255,255,255,0.15)",
      }}>ASSEMBL</div>
    </AbsoluteFill>
  );
};
