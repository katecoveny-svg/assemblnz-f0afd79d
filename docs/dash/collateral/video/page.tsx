"use client";

import { useState } from "react";
import styles from "./video.module.css";

const mono = "var(--font-mono)";
const display = "var(--font-display)";

/* eslint-disable @next/next/no-img-element */

function VariationA() {
  return (
    <div style={{ flex: "none" }}>
      <div style={{ fontFamily: mono, fontSize: 12, color: "#7a766b", marginBottom: 10 }}>
        A · Light · 1080×1920 (9:16)
      </div>
      <div
        style={{
          position: "relative",
          width: 300,
          height: 533,
          border: "10px solid #1c1b18",
          borderRadius: 42,
          overflow: "hidden",
          boxShadow: "0 26px 60px rgba(0,0,0,.22)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(120% 85% at 50% 0,#ffffff,#FFF7EC)",
            overflow: "hidden",
          }}
        >
          {/* top dash-line */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 7,
              backgroundImage: "repeating-linear-gradient(90deg,#FFD42A 0 15px,transparent 15px 24px)",
              zIndex: 9,
            }}
          />

          {/* scene 1 */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, opacity: 0, animation: "sc1 14s linear infinite" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", border: "6px solid #F2EDDF", borderTopColor: "#FFD42A", animation: "spin 1.1s linear infinite" }} />
            <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#9a988e" }}>your agent is thinking…</div>
            <div style={{ fontFamily: display, fontWeight: 900, fontSize: 30, letterSpacing: "-.03em", color: "#3a3832", textAlign: "center", lineHeight: 1.04 }}>
              Tick.<br />Tick.<br />Tick.
            </div>
          </div>

          {/* scene 2 */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 30, opacity: 0, animation: "sc2 14s linear infinite" }}>
            <div style={{ fontFamily: display, fontWeight: 900, fontSize: 38, letterSpacing: "-.04em", color: "#3a3832", textAlign: "center", lineHeight: 1.02 }}>
              What if the<br />wait <span style={{ color: "#c79b1f" }}>paid you?</span>
            </div>
          </div>

          {/* scene 3 — fill-the-dog */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0, animation: "sc3 14s linear infinite" }}>
            <div style={{ position: "absolute", left: 36, top: 120, width: 18, height: 18, borderRadius: "50%", background: "#FFD42A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono, fontWeight: 700, fontSize: 11, color: "#3a3832", animation: "coin 2.2s linear infinite" }}>$</div>
            <div style={{ position: "absolute", right: 50, top: 90, width: 20, height: 20, borderRadius: "50%", background: "#FFD42A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono, fontWeight: 700, fontSize: 11, color: "#3a3832", animation: "coin 2.6s linear infinite .6s" }}>$</div>
            <div style={{ position: "relative", width: 188, animation: "vFloaty 3.4s ease-in-out infinite" }}>
              <img src="/assets/mascot-dog.png" alt="" style={{ display: "block", width: "100%", height: "auto", filter: "grayscale(.7) brightness(1.05) opacity(.32)" }} />
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, overflow: "hidden", animation: "vFillRise 3.2s cubic-bezier(.4,0,.2,1) infinite alternate" }}>
                <img src="/assets/mascot-dog.png" alt="" style={{ position: "absolute", left: 0, bottom: 0, width: 188, height: "auto", filter: "drop-shadow(0 0 12px rgba(255,212,42,.55))" }} />
                <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 3, background: "linear-gradient(90deg,rgba(255,212,42,0),#FFD42A,rgba(255,212,42,0))", boxShadow: "0 0 10px rgba(255,212,42,.9)" }} />
              </div>
            </div>
            <div style={{ marginTop: 16, background: "#FFD42A", color: "#3a3832", fontFamily: mono, fontWeight: 700, fontSize: 14, padding: "8px 16px", borderRadius: 99, boxShadow: "0 6px 16px rgba(255,212,42,.45)", animation: "vTick 1.4s ease-in-out infinite" }}>+ $0.14 banked</div>
          </div>

          {/* scene 4 — logo payoff */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, opacity: 0, animation: "sc4 14s linear infinite" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
              <div style={{ fontFamily: display, fontWeight: 900, fontSize: 56, letterSpacing: "-.05em", color: "#3a3832", lineHeight: 0.8 }}>dash</div>
              <div style={{ width: 38, height: 11, borderRadius: 6, background: "#FFD42A", marginBottom: 9 }} />
            </div>
            <div style={{ fontFamily: display, fontWeight: 900, fontSize: 23, letterSpacing: "-.02em", color: "#c79b1f" }}>Get paid for the wait.</div>
          </div>

          {/* scene 5 — CTA */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: 30, opacity: 0, animation: "sc5 14s linear infinite" }}>
            <img src="/assets/mascot-dog.png" alt="" style={{ width: 160, height: "auto", filter: "drop-shadow(0 12px 14px rgba(180,150,40,.25))", animation: "vFloaty 3.6s ease-in-out infinite" }} />
            <div style={{ background: "#3a3832", color: "#FFD42A", fontFamily: display, fontWeight: 700, fontSize: 18, padding: "15px 32px", borderRadius: 99, boxShadow: "0 0 26px rgba(255,212,42,.45)" }}>Switch Dash on</div>
            <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: ".1em", color: "#a8a190" }}>dash.assembl.co.nz · by assembl</div>
          </div>

          {/* progress bar */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 5, background: "rgba(58,56,50,.08)", zIndex: 9 }}>
            <div style={{ height: "100%", background: "#FFD42A", transformOrigin: "left", transform: "scaleX(0)", animation: "prog 14s linear infinite" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function VariationB() {
  return (
    <div style={{ flex: "none" }}>
      <div style={{ fontFamily: mono, fontSize: 12, color: "#7a766b", marginBottom: 10 }}>
        B · Bold · 1080×1080 (1:1)
      </div>
      <div style={{ position: "relative", width: 420, height: 420, borderRadius: 6, overflow: "hidden", boxShadow: "0 20px 50px rgba(150,110,10,.2)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 120% at 50% 0,#FFE27A,#FFD42A)", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg,rgba(58,56,50,.045) 0 22px,transparent 22px 40px)" }} />

          {/* scene 1 */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, opacity: 0, animation: "sc1 14s linear infinite" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", border: "6px solid rgba(58,56,50,.15)", borderTopColor: "#3a3832", animation: "spin 1.1s linear infinite" }} />
            <div style={{ fontFamily: display, fontWeight: 900, fontSize: 34, letterSpacing: "-.03em", color: "#3a3832", textAlign: "center", lineHeight: 1.02 }}>Tick. Tick. Tick.</div>
          </div>

          {/* scene 2 */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 34, opacity: 0, animation: "sc2 14s linear infinite" }}>
            <div style={{ fontFamily: display, fontWeight: 900, fontSize: 46, letterSpacing: "-.04em", color: "#3a3832", textAlign: "center", lineHeight: 1.0 }}>
              What if the wait <span style={{ color: "#fff" }}>paid you?</span>
            </div>
          </div>

          {/* scene 3 — fill-the-dog (wiggle) */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: 0, animation: "sc3 14s linear infinite" }}>
            <div style={{ position: "absolute", left: 60, top: 70, width: 20, height: 20, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono, fontWeight: 700, fontSize: 11, color: "#3a3832", animation: "coin 2.4s linear infinite" }}>$</div>
            <div style={{ position: "absolute", right: 70, top: 50, width: 16, height: 16, borderRadius: "50%", background: "#3a3832", animation: "coin 2.8s linear infinite .7s" }} />
            <div style={{ position: "relative", width: 200, animation: "wiggle 3s ease-in-out infinite" }}>
              <img src="/assets/mascot-dog.png" alt="" style={{ display: "block", width: "100%", height: "auto", filter: "grayscale(.55) brightness(1.12) opacity(.3)" }} />
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, overflow: "hidden", animation: "vFillRise 3.2s cubic-bezier(.4,0,.2,1) infinite alternate" }}>
                <img src="/assets/mascot-dog.png" alt="" style={{ position: "absolute", left: 0, bottom: 0, width: 200, height: "auto", filter: "drop-shadow(0 0 12px rgba(58,56,50,.4))" }} />
                <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 3, background: "linear-gradient(90deg,rgba(58,56,50,0),#3a3832,rgba(58,56,50,0))", boxShadow: "0 0 8px rgba(58,56,50,.5)" }} />
              </div>
            </div>
            <div style={{ marginTop: 8, background: "#3a3832", color: "#FFD42A", fontFamily: mono, fontWeight: 700, fontSize: 14, padding: "8px 16px", borderRadius: 99, animation: "vTick 1.4s ease-in-out infinite" }}>+ $0.14 banked</div>
          </div>

          {/* scene 4 — logo payoff */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, opacity: 0, animation: "sc4 14s linear infinite" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
              <div style={{ fontFamily: display, fontWeight: 900, fontSize: 58, letterSpacing: "-.05em", color: "#3a3832", lineHeight: 0.8 }}>dash</div>
              <div style={{ width: 40, height: 12, borderRadius: 7, background: "#3a3832", marginBottom: 9 }} />
            </div>
            <div style={{ fontFamily: display, fontWeight: 900, fontSize: 24, letterSpacing: "-.02em", color: "#3a3832" }}>Get paid for the wait.</div>
          </div>

          {/* scene 5 — CTA */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, opacity: 0, animation: "sc5 14s linear infinite" }}>
            <img src="/assets/mascot-dog.png" alt="" style={{ width: 178, height: "auto", filter: "drop-shadow(0 12px 14px rgba(150,110,10,.3))", animation: "wiggle 3.4s ease-in-out infinite" }} />
            <div style={{ background: "#3a3832", color: "#FFD42A", fontFamily: display, fontWeight: 700, fontSize: 18, padding: "15px 34px", borderRadius: 99 }}>Switch Dash on</div>
          </div>

          {/* progress bar */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 5, background: "rgba(58,56,50,.12)", zIndex: 9 }}>
            <div style={{ height: "100%", background: "#3a3832", transformOrigin: "left", transform: "scaleX(0)", animation: "prog 14s linear infinite" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VideoPage() {
  const [paused, setPaused] = useState(false);
  const [runKey, setRunKey] = useState(0);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(120% 80% at 50% 0,#FFF7EC,#E7E5DF)",
        padding: "48px 40px",
        fontFamily: display,
      }}
    >
      <div style={{ margin: "0 0 4px 2px", fontFamily: mono, fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase", color: "#c79b1f" }}>
        Dash · short-form video · ~14s loop
      </div>
      <h1 style={{ margin: "0 0 8px 2px", fontFamily: display, fontWeight: 900, fontSize: 32, letterSpacing: "-.03em", color: "#3a3832" }}>
        Get paid for the wait — variations
      </h1>
      <div style={{ margin: "0 0 26px 2px", fontSize: 14, color: "#7a766b" }}>
        Brand-aligned light + bold cuts. Use the controls to pause / restart both. Export by screen-recording each frame.
      </div>

      {/* controls */}
      <div style={{ display: "flex", gap: 12, marginBottom: 26 }}>
        <button className={styles.ctrlPrimary} onClick={() => setPaused((p) => !p)}>
          {paused ? "▶ Play both" : "⏸ Pause both"}
        </button>
        <button
          className={styles.ctrlGhost}
          onClick={() => {
            setPaused(false);
            setRunKey((k) => k + 1);
          }}
        >
          ↻ Restart both
        </button>
      </div>

      <div
        key={runKey}
        className={paused ? styles.paused : undefined}
        style={{ display: "flex", gap: 48, alignItems: "flex-start", flexWrap: "wrap" }}
      >
        <VariationA />
        <VariationB />
      </div>
    </div>
  );
}
