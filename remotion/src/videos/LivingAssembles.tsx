import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/InstrumentSans";
import { loadFont as loadMono } from "@remotion/google-fonts/IBMPlexMono";

/**
 * assembl / living — "one product, made yours"
 * ---------------------------------------------
 * Brand motion sequence: fragmented → gathering → organised → prepared → proof.
 * Real v0.3 print-file renders (alpha PNGs in public/images/living) gather
 * into a flat-lay, the choices appear as a customer makes them, the estimate
 * tiles count up, and the proof line locks last. Paper, chalk, plum ink.
 * Instrument Sans for words; IBM Plex Mono only for evidence and status.
 * No camera moves, no decorative loops; the resolved state holds to read.
 */

const sans = loadSans("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });
const mono = loadMono("normal", { weights: ["400"], subsets: ["latin"] });

const INK = "#492B3E";
const PLUM = "#240B21";
const MUTED = "#654A4E";
const ROSE = "#916A70";
const CHALK = "#F5F1F2";
const PAPER = "#FFFDFB";
const LINE = "rgba(36, 11, 33, 0.12)";

type Piece = { src: string; label: string; w: number; from: [number, number]; to: [number, number]; at: number };

/** Pieces gather from the edges to their place; `at` is the frame each one starts. */
const PIECES: Piece[] = [
  { src: "board-4x4-chalk", label: "Grid board 4×4", w: 560, from: [-600, 60], to: [60, 40], at: 12 },
  { src: "shelf-3-sage", label: "Shelf, 3 wide", w: 330, from: [1300, -300], to: [620, 30], at: 26 },
  { src: "cup-plum", label: "Cup", w: 210, from: [1300, 700], to: [740, 300], at: 38 },
  { src: "hook-clay", label: "Hook", w: 180, from: [-300, 900], to: [620, 500], at: 48 },
  { src: "name-plate-plum-mila", label: "Name plate · MILA", w: 440, from: [500, 1300], to: [90, 470], at: 58 },
];

function ease(frame: number, start: number, fps: number) {
  return spring({ frame: frame - start, fps, config: { damping: 18, stiffness: 90, mass: 0.9 } });
}

const Status: React.FC<{ children: React.ReactNode; tone?: "quiet" | "ok" }> = ({ children, tone = "quiet" }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 16px", border: `1px solid ${LINE}`, borderRadius: 999, background: PAPER, fontFamily: mono.fontFamily, fontSize: 18, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED }}>
    <span style={{ width: 8, height: 8, borderRadius: 4, background: tone === "ok" ? PLUM : ROSE }} />
    {children}
  </span>
);

export const LivingAssembles: React.FC<{ portrait?: boolean }> = ({ portrait = false }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const scale = portrait ? 0.78 : 1;
  const stageX = portrait ? 0 : 0;
  const stageY = portrait ? 260 : 0;

  // choices a customer makes, in order
  const choiceAt = 88;
  const choices = [
    { label: "Colour", value: "Chalk", at: choiceAt },
    { label: "Accent", value: "Ink", at: choiceAt + 14 },
    { label: "Name", value: "Mila", at: choiceAt + 28 },
    { label: "Quantity", value: "1", at: choiceAt + 42 },
  ];
  const estimateAt = 150;
  const proofAt = 205;
  const count = (to: number, start: number, decimals = 0) => {
    const t = interpolate(frame, [start, start + 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (to * t).toFixed(decimals);
  };
  const proof = ease(frame, proofAt, fps);
  const eyebrow = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily: sans.fontFamily, color: INK, overflow: "hidden" }}>
      {/* eyebrow + status */}
      <div style={{ position: "absolute", top: 56, left: 72, right: 72, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: eyebrow }}>
        <span style={{ fontFamily: mono.fontFamily, fontSize: 18, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED }}>assembl / living · made to order</span>
        {!portrait && <Status tone={frame > proofAt ? "ok" : "quiet"}>{frame > proofAt ? "proposed · v0.3 · proof recorded" : "proposed · v0.3"}</Status>}
      </div>

      {/* stage: pieces gather */}
      <div style={{ position: "absolute", left: 72 + stageX, top: 150 + stageY, width: 1000 * scale, height: 760 * scale, borderRadius: 28, background: CHALK, border: `1px solid ${LINE}`, overflow: "hidden" }}>
        {PIECES.map((p) => {
          const t = ease(frame, p.at, fps);
          const x = interpolate(t, [0, 1], [p.from[0], p.to[0]]) * scale;
          const y = interpolate(t, [0, 1], [p.from[1], p.to[1]]) * scale;
          const rot = interpolate(t, [0, 1], [-14, 0]);
          return (
            <div key={p.src} style={{ position: "absolute", left: x, top: y, width: p.w * scale, transform: `rotate(${rot}deg)`, opacity: Math.min(1, t * 1.4) }}>
              <Img src={staticFile(`images/living/${p.src}.png`)} style={{ width: "100%", display: "block" }} />
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 24, bottom: 18, fontFamily: mono.fontFamily, fontSize: 15, letterSpacing: "0.06em", textTransform: "uppercase", color: MUTED, opacity: interpolate(frame, [70, 84], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          teen room starter · five products · 42 mm TURN grid · renders of the v0.3 print files
        </div>
      </div>

      {/* right column: choices, estimate, proof */}
      <div style={{ position: "absolute", left: portrait ? 72 : 1120, top: portrait ? 150 + stageY + 760 * scale + 40 : 150, width: portrait ? width - 144 : width - 1120 - 72, display: "grid", gap: 22 }}>
        <div style={{ opacity: interpolate(frame, [80, 96], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <div style={{ fontSize: 54, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.02, color: PLUM }}>one product,<br />made yours.</div>
          <div style={{ fontSize: 22, color: MUTED, marginTop: 10 }}>Real choices from the parts manifest. Nothing is bought here.</div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {choices.map((c) => {
            const t = ease(frame, c.at, fps);
            return (
              <div key={c.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "14px 18px", border: `1px solid ${LINE}`, borderRadius: 16, background: PAPER, transform: `translateY(${(1 - t) * 18}px)`, opacity: t }}>
                <span style={{ fontSize: 22, fontWeight: 500 }}>{c.label}</span>
                <span style={{ fontFamily: mono.fontFamily, fontSize: 17, letterSpacing: "0.06em", textTransform: "uppercase", color: MUTED }}>{c.value}</span>
              </div>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, opacity: interpolate(frame, [estimateAt, estimateAt + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          {[
            ["Print mass", `${count(346.7, estimateAt, 1)} g`, "est."],
            ["Print time", `${count(11, estimateAt)} h ${count(33, estimateAt)} min`, "est."],
            ["Material", `NZD ${count(15.6, estimateAt, 2)}`, "est."],
            ["Suggested retail", `NZD ${count(168, estimateAt, 2)}`, "proposed"],
          ].map(([k, v, tag]) => (
            <div key={k} style={{ padding: "16px 18px", border: `1px solid ${LINE}`, borderRadius: 16, background: PAPER }}>
              <div style={{ fontFamily: mono.fontFamily, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED }}>{k}</div>
              <div style={{ fontSize: 26, fontWeight: 500, color: PLUM, marginTop: 4 }}>{v} <span style={{ fontSize: 15, fontWeight: 400, color: MUTED }}>{tag}</span></div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, transform: `translateY(${(1 - proof) * 16}px)`, opacity: proof }}>
          <Status tone="ok">AL-KTEEROO-CHA · 8 files</Status>
          <span style={{ fontSize: 18, color: MUTED }}>The receipt that travels with the order.</span>
        </div>
      </div>

      {/* reduced-motion note for editors (not rendered large) */}
      <div style={{ position: "absolute", bottom: 40, left: 72, fontFamily: mono.fontFamily, fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase", color: ROSE, opacity: 0.9 }}>
        estimates are planning figures, not a quote · nothing is for sale until the test kit passes
      </div>
    </AbsoluteFill>
  );
};

export const LivingAssemblesStory: React.FC = () => <LivingAssembles portrait />;
