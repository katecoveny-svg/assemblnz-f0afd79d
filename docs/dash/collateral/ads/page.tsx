import Image from "next/image";
import mascot from "@/public/assets/mascot-dog.png";
import styles from "./ads.module.css";

/**
 * Dash — Social Ads. Fixed-width reference canvas of export-ready ad frames
 * at native social ratios. Translated 1:1 from the design prototype
 * (project/Dash - Social Ads.dc.html). Lockups reproduced as literal markup
 * so per-frame sizing/colour stays pixel-exact.
 */
export default function AdsPage() {
  return (
    <div
      className={styles.canvas}
      style={{
        width: "max-content",
        minWidth: "100%",
        minHeight: "100vh",
        padding: 48,
        boxSizing: "border-box",
        background: "#E7E5DF",
        fontFamily: "'Lato',sans-serif",
      }}
    >
      <div
        style={{
          margin: "0 0 6px 2px",
          fontFamily: "'Lato',sans-serif",
          fontWeight: 900,
          fontSize: 30,
          letterSpacing: "-.02em",
          color: "#3a3832",
        }}
      >
        Dash — Social Ads
      </div>
      <div
        style={{
          margin: "0 0 40px 2px",
          fontFamily: "'Space Mono',monospace",
          fontSize: 13,
          color: "#7a766b",
        }}
      >
        Canary / charcoal / Lato · export-ready frames at native ratios · drag in
        real photography where slots are marked
      </div>

      <div style={{ display: "flex", gap: 44, alignItems: "flex-start" }}>
        {/* AD 1 — 1080² canary hero */}
        <div style={{ flex: "none", width: 420 }}>
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 12,
              color: "#7a766b",
              marginBottom: 10,
            }}
          >
            01 · Feed 1080×1080 · primary
          </div>
          <div
            style={{
              width: 420,
              height: 420,
              background: "#FFD42A",
              borderRadius: 3,
              boxShadow: "0 2px 6px rgba(0,0,0,.1)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "repeating-linear-gradient(45deg,rgba(0,0,0,.035) 0 16px,transparent 16px 32px)",
              }}
            />
            <div
              style={{
                position: "relative",
                padding: "34px 34px 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-end", gap: 7 }}>
                <div
                  style={{
                    fontFamily: "'Lato',sans-serif",
                    fontWeight: 900,
                    fontSize: 30,
                    letterSpacing: "-.04em",
                    color: "#3a3832",
                  }}
                >
                  dash
                </div>
                <div
                  style={{
                    width: 28,
                    height: 8,
                    borderRadius: 5,
                    background: "#3a3832",
                    marginBottom: 6,
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 11,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "#5a4a00",
                }}
              >
                by assembl
              </div>
            </div>
            <div style={{ position: "absolute", left: 34, top: 104, right: 196 }}>
              <div
                style={{
                  fontFamily: "'Lato',sans-serif",
                  fontWeight: 900,
                  fontSize: 48,
                  lineHeight: 0.9,
                  letterSpacing: "-.045em",
                  color: "#3a3832",
                }}
              >
                Get paid for the wait.
              </div>
            </div>
            <Image
              src={mascot}
              alt=""
              style={{
                position: "absolute",
                right: -10,
                bottom: 24,
                width: 228,
                height: "auto",
                filter: "drop-shadow(0 16px 18px rgba(150,110,10,.25))",
                animation: "floaty 5s ease-in-out infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 34,
                bottom: 34,
                background: "#3a3832",
                color: "#FFD42A",
                padding: "13px 24px",
                borderRadius: 99,
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              Switch Dash on →
            </div>
          </div>
        </div>

        {/* AD 2 — 1080² white quiet */}
        <div style={{ flex: "none", width: 420 }}>
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 12,
              color: "#7a766b",
              marginBottom: 10,
            }}
          >
            02 · Feed 1080×1080 · clean
          </div>
          <div
            style={{
              width: 420,
              height: 420,
              background: "#fff",
              borderRadius: 3,
              boxShadow: "0 2px 6px rgba(0,0,0,.1)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "42%",
                transform: "translate(-50%,-50%)",
                width: 340,
                height: 340,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle,rgba(255,212,42,.3),transparent 62%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 34,
                top: 34,
                display: "flex",
                alignItems: "flex-end",
                gap: 7,
              }}
            >
              <div
                style={{
                  fontFamily: "'Lato',sans-serif",
                  fontWeight: 900,
                  fontSize: 28,
                  letterSpacing: "-.04em",
                  color: "#3a3832",
                }}
              >
                dash
              </div>
              <div
                style={{
                  width: 26,
                  height: 7,
                  borderRadius: 5,
                  background: "#FFD42A",
                  marginBottom: 6,
                }}
              />
            </div>
            <Image
              src={mascot}
              alt=""
              style={{
                position: "absolute",
                left: "50%",
                top: "40%",
                transform: "translate(-50%,-50%)",
                width: 300,
                height: "auto",
                filter: "drop-shadow(0 18px 20px rgba(180,150,40,.22))",
                animation: "floaty 5.4s ease-in-out infinite",
              }}
            />
            <div style={{ position: "absolute", left: 34, right: 34, bottom: 34 }}>
              <div
                style={{
                  fontFamily: "'Lato',sans-serif",
                  fontWeight: 900,
                  fontSize: 46,
                  lineHeight: 0.92,
                  letterSpacing: "-.04em",
                  color: "#3a3832",
                  marginBottom: 14,
                }}
              >
                Sit. Stay.
                <br />
                Get paid.
              </div>
              <div style={{ fontSize: 15, color: "#56544b" }}>
                Your AI works. You earn. NZ-built.
              </div>
            </div>
          </div>
        </div>

        {/* AD 3 — 1080×1920 story with loader */}
        <div style={{ flex: "none", width: 320 }}>
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 12,
              color: "#7a766b",
              marginBottom: 10,
            }}
          >
            03 · Story 1080×1920 · the loader
          </div>
          <div
            style={{
              width: 320,
              height: 569,
              background: "#3a3832",
              borderRadius: 3,
              boxShadow: "0 2px 6px rgba(0,0,0,.1)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: 13,
                backgroundImage:
                  "repeating-linear-gradient(90deg,#FFD42A 0 20px,transparent 20px 32px)",
                animation: "hazard 3s linear infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 26,
                top: 40,
                display: "flex",
                alignItems: "flex-end",
                gap: 6,
              }}
            >
              <div
                style={{
                  fontFamily: "'Lato',sans-serif",
                  fontWeight: 900,
                  fontSize: 26,
                  letterSpacing: "-.04em",
                  color: "#FFD42A",
                }}
              >
                dash
              </div>
              <div
                style={{
                  width: 24,
                  height: 6,
                  borderRadius: 4,
                  background: "#fff",
                  marginBottom: 5,
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                left: 26,
                top: 84,
                fontFamily: "'Space Mono',monospace",
                fontSize: 11,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "#9a988e",
              }}
            >
              your agent is working…
            </div>
            {/* fill-the-dog loader */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "46%",
                transform: "translate(-50%,-50%)",
                width: 240,
                animation: "floaty 4.6s ease-in-out infinite",
              }}
            >
              <Image
                src={mascot}
                alt=""
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                  filter: "grayscale(.8) brightness(1.05) opacity(.22)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  overflow: "hidden",
                  animation: "fillRise 5.2s cubic-bezier(.45,0,.2,1) infinite",
                }}
              >
                <Image
                  src={mascot}
                  alt=""
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    width: 240,
                    height: "auto",
                    filter: "drop-shadow(0 0 14px rgba(255,212,42,.6))",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    height: 3,
                    background:
                      "linear-gradient(90deg,rgba(255,230,128,0),#fff,rgba(255,230,128,0))",
                    boxShadow: "0 0 12px rgba(255,212,42,.95)",
                  }}
                />
              </div>
            </div>
            <div
              style={{ position: "absolute", left: 26, right: 26, bottom: 96 }}
            >
              <div
                style={{
                  fontFamily: "'Lato',sans-serif",
                  fontWeight: 900,
                  fontSize: 38,
                  lineHeight: 0.94,
                  letterSpacing: "-.04em",
                  color: "#fff",
                }}
              >
                While it thinks,
                <br />
                <span style={{ color: "#FFD42A" }}>you earn.</span>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                left: 26,
                right: 26,
                bottom: 34,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  background: "#FFD42A",
                  color: "#3a3832",
                  padding: "12px 22px",
                  borderRadius: 99,
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                Switch on
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 12,
                  color: "#9a988e",
                  animation: "tick 1.6s ease-in-out infinite",
                }}
              >
                + $0.14
              </div>
            </div>
          </div>
        </div>

        {/* AD 4 — 1080×1350 portrait, sponsored angle */}
        <div style={{ flex: "none", width: 360 }}>
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 12,
              color: "#7a766b",
              marginBottom: 10,
            }}
          >
            04 · Portrait 1080×1350 · advertiser
          </div>
          <div
            style={{
              width: 360,
              height: 450,
              background: "#FFF7EC",
              borderRadius: 3,
              boxShadow: "0 2px 6px rgba(0,0,0,.1)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 30,
                top: 30,
                display: "flex",
                alignItems: "flex-end",
                gap: 6,
              }}
            >
              <div
                style={{
                  fontFamily: "'Lato',sans-serif",
                  fontWeight: 900,
                  fontSize: 26,
                  letterSpacing: "-.04em",
                  color: "#3a3832",
                }}
              >
                dash
              </div>
              <div
                style={{
                  width: 24,
                  height: 6,
                  borderRadius: 4,
                  background: "#FFD42A",
                  marginBottom: 5,
                }}
              />
            </div>
            <div style={{ position: "absolute", left: 30, top: 84, right: 30 }}>
              <div
                style={{
                  fontFamily: "'Lato',sans-serif",
                  fontWeight: 900,
                  fontSize: 38,
                  lineHeight: 0.94,
                  letterSpacing: "-.04em",
                  color: "#3a3832",
                }}
              >
                Buy NZ&apos;s most-
                <br />
                viewed five
                <br />
                seconds.
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontSize: 15,
                  color: "#56544b",
                  maxWidth: 280,
                }}
              >
                One sponsor per agent wait. Brand-safe, opt-in, fully measurable.
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                left: 30,
                right: 30,
                bottom: 88,
                background: "#fff",
                border: "1px solid #EFEADC",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <div
                style={{
                  height: 12,
                  borderRadius: 8,
                  background: "#F2EDDF",
                  overflow: "hidden",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: "62%",
                    borderRadius: 8,
                    background:
                      "repeating-linear-gradient(118deg,#FFD42A 0 11px,#fff 11px 20px)",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 10,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "#bdb592",
                  }}
                >
                  sponsored · while you wait
                </div>
                <div
                  style={{
                    background: "#3a3832",
                    color: "#FFD42A",
                    fontFamily: "'Space Mono',monospace",
                    fontWeight: 700,
                    fontSize: 12,
                    padding: "6px 12px",
                    borderRadius: 99,
                  }}
                >
                  your brand
                </div>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                left: 30,
                bottom: 30,
                background: "#3a3832",
                color: "#FFD42A",
                padding: "12px 22px",
                borderRadius: 99,
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              Become a sponsor →
            </div>
          </div>
        </div>

        {/* AD 5 — 1920×1080 landscape */}
        <div style={{ flex: "none", width: 480 }}>
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 12,
              color: "#7a766b",
              marginBottom: 10,
            }}
          >
            05 · Landscape 1920×1080 (16:9)
          </div>
          <div
            style={{
              width: 480,
              height: 270,
              background: "#FFD42A",
              borderRadius: 3,
              boxShadow: "0 2px 6px rgba(0,0,0,.1)",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "repeating-linear-gradient(90deg,rgba(58,56,50,.045) 0 22px,transparent 22px 40px)",
              }}
            />
            <div
              style={{
                position: "relative",
                flex: 1,
                padding: "30px 0 30px 34px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 7,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Lato',sans-serif",
                    fontWeight: 900,
                    fontSize: 26,
                    letterSpacing: "-.045em",
                    color: "#3a3832",
                    lineHeight: 0.8,
                  }}
                >
                  dash
                </div>
                <div
                  style={{
                    width: 24,
                    height: 7,
                    borderRadius: 5,
                    background: "#3a3832",
                    marginBottom: 5,
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: "'Lato',sans-serif",
                  fontWeight: 900,
                  fontSize: 40,
                  lineHeight: 0.92,
                  letterSpacing: "-.04em",
                  color: "#3a3832",
                  marginBottom: 18,
                }}
              >
                Get paid
                <br />
                for the wait.
              </div>
              <div
                style={{
                  display: "inline-block",
                  background: "#3a3832",
                  color: "#FFD42A",
                  padding: "11px 22px",
                  borderRadius: 99,
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Switch Dash on →
              </div>
            </div>
            <Image
              src={mascot}
              alt=""
              style={{
                position: "absolute",
                right: -8,
                bottom: 14,
                width: 230,
                height: "auto",
                filter: "drop-shadow(0 12px 14px rgba(150,110,10,.25))",
              }}
            />
          </div>
        </div>

        {/* AD 6 — 728×90 leaderboard */}
        <div style={{ flex: "none", width: 728 }}>
          <div
            style={{
              fontFamily: "'Space Mono',monospace",
              fontSize: 12,
              color: "#7a766b",
              marginBottom: 10,
            }}
          >
            06 · Leaderboard 728×90
          </div>
          <div
            style={{
              width: 728,
              height: 90,
              background: "#fff",
              border: "1px solid #EFEADC",
              borderRadius: 3,
              boxShadow: "0 2px 6px rgba(0,0,0,.1)",
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "0 24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-end", gap: 7 }}>
              <div
                style={{
                  fontFamily: "'Lato',sans-serif",
                  fontWeight: 900,
                  fontSize: 26,
                  letterSpacing: "-.045em",
                  color: "#3a3832",
                  lineHeight: 0.8,
                }}
              >
                dash
              </div>
              <div
                style={{
                  width: 24,
                  height: 7,
                  borderRadius: 5,
                  background: "#FFD42A",
                  marginBottom: 5,
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "'Lato',sans-serif",
                  fontWeight: 900,
                  fontSize: 19,
                  letterSpacing: "-.02em",
                  color: "#3a3832",
                }}
              >
                Get paid for the wait.
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 11,
                  color: "#9a988e",
                  marginTop: 2,
                }}
              >
                earn while your AI agent works · opt-in · NZ-built
              </div>
            </div>
            <div
              style={{
                width: 130,
                height: 13,
                borderRadius: 8,
                background: "#F2EDDF",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "64%",
                  borderRadius: 8,
                  background:
                    "repeating-linear-gradient(118deg,#FFD42A 0 11px,#fff 11px 20px)",
                }}
              />
            </div>
            <div
              style={{
                background: "#FFD42A",
                color: "#3a3832",
                padding: "11px 22px",
                borderRadius: 99,
                fontWeight: 700,
                fontSize: 14,
                boxShadow: "0 6px 16px rgba(255,212,42,.45)",
              }}
            >
              Switch on
            </div>
            <Image
              src={mascot}
              alt=""
              style={{
                width: 90,
                height: "auto",
                filter: "drop-shadow(0 6px 8px rgba(150,110,10,.25))",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
