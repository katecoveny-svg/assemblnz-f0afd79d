import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill, Sequence } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { BRAND, TURF_ACCENT, cosmicGradient, glassCardStyle } from "../shared/styles";

const { fontFamily } = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["latin"] });

const FEATURES = [
  { icon: "📋", title: "Constitution Generator", desc: "14-section ISA 2022 compliant docs" },
  { icon: "🏟️", title: "Facility Management", desc: "Bookings, maintenance & scheduling" },
  { icon: "💰", title: "Grant Applications", desc: "Gaming trust & funding proposals" },
  { icon: "👥", title: "Membership System", desc: "Registers, fees & communications" },
  { icon: "📊", title: "AGM Documents", desc: "Minutes, reports & resolutions" },
  { icon: "⚡", title: "Compliance Alerts", desc: "Deadline tracking & reminders" },
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

  const titleIn = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });
  const subtitleIn = spring({ frame: frame - 12, fps, config: { damping: 20 } });

  return (
    <AbsoluteFill style={{ background: cosmicGradient, fontFamily, overflow: "hidden" }}>
      {/* Cosmic orbs */}
      <GlassOrb x={80} y={200} size={180} color={BRAND.cyan} delay={0} />
      <GlassOrb x={700} y={400} size={120} color={BRAND.purple} delay={2} />
      <GlassOrb x={300} y={1400} size={200} color={BRAND.deepBlue} delay={4} />
      <GlassOrb x={800} y={1600} size={90} color={TURF_ACCENT} delay={6} />

      {/* Star field */}
      {Array.from({ length: 40 }).map((_, i) => {
        const sx = (i * 137.5) % 1080;
        const sy = (i * 251.3) % 1920;
        const twinkle = interpolate(Math.sin(frame * 0.05 + i * 0.8), [-1, 1], [0.2, 0.8]);
        return <div key={i} style={{ position: "absolute", left: sx, top: sy, width: 2, height: 2, borderRadius: "50%", background: "white", opacity: twinkle }} />;
      })}

      {/* Header */}
      <Sequence from={0}>
        <div style={{ position: "absolute", top: 120, left: 0, right: 0, textAlign: "center" }}>
          <div style={{
            fontSize: 22, fontWeight: 700, letterSpacing: 6,
            color: TURF_ACCENT, opacity: subtitleIn,
            transform: `translateY(${interpolate(subtitleIn, [0, 1], [20, 0])}px)`,
          }}>ASSEMBL PRESENTS</div>
          <div style={{
            fontSize: 96, fontWeight: 900, letterSpacing: -2,
            background: `linear-gradient(135deg, ${TURF_ACCENT}, ${BRAND.cyan})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            transform: `scale(${titleIn})`, marginTop: 16,
          }}>TURF</div>
          <div style={{
            fontSize: 26, fontWeight: 400, color: "rgba(255,255,255,0.6)",
            opacity: subtitleIn, marginTop: 8,
          }}>Sports Operations AI</div>
        </div>
      </Sequence>

      {/* Glass feature cards stagger in */}
      <Sequence from={30}>
        <div style={{ position: "absolute", top: 460, left: 60, right: 60 }}>
          {FEATURES.map((f, i) => {
            const cardIn = spring({ frame: frame - 30 - i * 12, fps, config: { damping: 16, stiffness: 140 } });
            const glow = interpolate(Math.sin(frame * 0.03 + i), [-1, 1], [0, 0.3]);
            return (
              <div key={i} style={{
                ...glassCardStyle,
                marginBottom: 16,
                transform: `translateX(${interpolate(cardIn, [0, 1], [300, 0])}px)`,
                opacity: cardIn,
                boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 20px ${TURF_ACCENT}${Math.round(glow * 255).toString(16).padStart(2, "0")}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: `linear-gradient(135deg, ${TURF_ACCENT}25, ${BRAND.cyan}15)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24, border: `1px solid ${TURF_ACCENT}30`,
                  }}>{f.icon}</div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: BRAND.white }}>{f.title}</div>
                    <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{f.desc}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Sequence>

      {/* Bottom CTA */}
      <Sequence from={120}>
        <div style={{ position: "absolute", bottom: 140, left: 0, right: 0, textAlign: "center" }}>
          {(() => {
            const ctaIn = spring({ frame: frame - 120, fps, config: { damping: 14 } });
            return (
              <>
                <div style={{
                  ...glassCardStyle, display: "inline-block", padding: "20px 48px",
                  background: `linear-gradient(135deg, ${TURF_ACCENT}30, ${BRAND.cyan}20)`,
                  border: `1px solid ${TURF_ACCENT}50`,
                  transform: `scale(${ctaIn})`, opacity: ctaIn,
                }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.white }}>assembl.co.nz/chat/sports-recreation</div>
                </div>
                <div style={{
                  fontSize: 16, color: "rgba(255,255,255,0.4)", marginTop: 20,
                  opacity: interpolate(ctaIn, [0.5, 1], [0, 1], { extrapolateLeft: "clamp" }),
                }}>ISA 2022 Deadline: 5 April 2026</div>
              </>
            );
          })()}
        </div>
      </Sequence>

      {/* Nexus logo watermark */}
      <div style={{
        position: "absolute", bottom: 50, left: 0, right: 0, textAlign: "center",
        fontSize: 14, fontWeight: 700, letterSpacing: 4, color: "rgba(255,255,255,0.2)",
      }}>ASSEMBL</div>
    </AbsoluteFill>
  );
};
