import type { Metadata } from "next";
import { AssemblingMark } from "@/components/dash/AssemblingMark";
import "../birdie.css";

export const metadata: Metadata = {
  title: "assembling. — Brand Guidelines",
  description: "Assembling by assembl — the reward layer for the wait. Palette, type, logo, voice and usage.",
  alternates: { canonical: "/assembling/brand" },
};

const mono = "var(--font-dash-mono), 'Space Mono', monospace";
const lato = "var(--font-dash-sans), 'Lato', sans-serif";

export default function BrandPage() {
  return (
    <div style={{ background: "#EDEAE2", padding: "40px 0", fontFamily: lato }}>
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          background: "#fff",
          boxShadow: "0 20px 60px rgba(120,100,40,.12)",
        }}
      >
        {/* COVER */}
        <div
          style={{
            position: "relative",
            padding: "80px 72px 72px",
            background: "#BFA37A",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "repeating-linear-gradient(45deg,rgba(0,0,0,.035) 0 18px,transparent 18px 36px)",
            }}
          />
          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 12,
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                  color: "#5a4a00",
                  marginBottom: 28,
                }}
              >
                Brand Guidelines · v1.0 · 2026
              </div>
              <div
                style={{
                  fontFamily: lato,
                  fontWeight: 900,
                  fontSize: 108,
                  lineHeight: 0.9,
                  letterSpacing: "-.05em",
                  color: "#3a3832",
                }}
              >
                assembling
              </div>
              <div
                style={{
                  marginTop: 20,
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#3a3832",
                  maxWidth: 440,
                  lineHeight: 1.2,
                }}
              >
                Get paid for the wait.
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontFamily: mono,
                  fontSize: 13,
                  color: "#5a4a00",
                }}
              >
                The reward layer for the agentic wait · by assembl
              </div>
            </div>
            {/* Kate, 2026-07-28: "the dachshund isnt the mascot". This page was
                the last surface still presenting it as one — and it is the
                brand guidelines, so it was actively teaching the wrong thing. */}
            <div
              className="bd-floaty"
              style={{
                width: 300,
                filter: "drop-shadow(0 20px 24px rgba(150,110,10,.28))",
              }}
            >
              <AssemblingMark pct={100} title="" />
            </div>
          </div>
        </div>

        {/* 01 BRAND IDEA */}
        <div
          style={{
            padding: "72px 72px 56px",
            borderBottom: "1px solid #EFEADC",
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: 12,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "#8A6A2E",
              marginBottom: 16,
            }}
          >
            01 — The idea
          </div>
          <div style={{ display: "flex", gap: 56 }}>
            <h2
              style={{
                flex: "none",
                width: 300,
                margin: 0,
                fontFamily: lato,
                fontWeight: 900,
                fontSize: 38,
                lineHeight: 1.04,
                letterSpacing: "-.03em",
                color: "#3a3832",
              }}
            >
              The wait is the canvas.
            </h2>
            <div
              style={{
                flex: 1,
                fontSize: 17,
                lineHeight: 1.62,
                color: "#56544b",
              }}
            >
              <p style={{ margin: "0 0 16px" }}>
                Every AI agent makes you wait — seconds, sometimes minutes —
                while it works. It&apos;s the most captive, least-used moment in
                software.{" "}
                <b style={{ color: "#3a3832" }}>
                  Assembling turns that wait into value you keep:
                </b>{" "}
                points, KiwiSaver, charity, power off your bill.
              </p>
              <p style={{ margin: 0 }}>
                Assembling is opt-in, NZ-built and assembl-governed. The parent brand,
                assembl, is calm and quiet. Assembling is its loud, friendly,
                get-things-done sibling — the one that does the waiting for you.
              </p>
            </div>
          </div>
        </div>

        {/* 02 LOGO */}
        <div
          style={{
            padding: "64px 72px 56px",
            borderBottom: "1px solid #EFEADC",
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: 12,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "#8A6A2E",
              marginBottom: 24,
            }}
          >
            02 — Logo
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                background: "#fff",
                border: "1px solid #EFEADC",
                borderRadius: 18,
                padding: 40,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                minHeight: 200,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    fontFamily: lato,
                    fontWeight: 900,
                    fontSize: 48,
                    letterSpacing: "-.045em",
                    color: "#3a3832",
                  }}
                >
                  assembling
                </div>
                <div
                  style={{
                    width: 74,
                    height: 13,
                    borderRadius: 8,
                    background: "#EFEADC",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: "62%",
                      borderRadius: 8,
                      background: "#BFA37A",
                    }}
                  />
                </div>
              </div>
              <div style={{ fontFamily: mono, fontSize: 12, color: "#a8a698" }}>
                Primary lockup — wordmark + loading bar
              </div>
            </div>
            <div
              style={{
                background: "#3a3832",
                borderRadius: 18,
                padding: 40,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                minHeight: 200,
              }}
            >
              <div
                style={{
                  fontFamily: lato,
                  fontWeight: 900,
                  fontSize: 48,
                  letterSpacing: "-.045em",
                  color: "#BFA37A",
                }}
              >
                assembling
              </div>
              <div style={{ fontFamily: mono, fontSize: 12, color: "#8a8678" }}>
                Reversed — charcoal background
              </div>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 20,
            }}
          >
            <div
              style={{ background: "#FFF7EC", borderRadius: 14, padding: 22 }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#3a3832",
                  marginBottom: 6,
                }}
              >
                Clear space
              </div>
              <div
                style={{ fontSize: 14, color: "#56544b", lineHeight: 1.5 }}
              >
                Keep clear space equal to the height of the &ldquo;d&rdquo; on
                all sides. Never crowd the loading bar.
              </div>
            </div>
            <div
              style={{ background: "#FFF7EC", borderRadius: 14, padding: 22 }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#3a3832",
                  marginBottom: 6,
                }}
              >
                Wordmark is lowercase
              </div>
              <div
                style={{ fontSize: 14, color: "#56544b", lineHeight: 1.5 }}
              >
                Always <b>assembling</b>, never Assembling or ASSEMBLING in the mark. Lato Black,
                tight tracking.
              </div>
            </div>
            <div
              style={{ background: "#FFF7EC", borderRadius: 14, padding: 22 }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#3a3832",
                  marginBottom: 6,
                }}
              >
                Don&rsquo;t
              </div>
              <div
                style={{ fontSize: 14, color: "#56544b", lineHeight: 1.5 }}
              >
                Don&rsquo;t recolour the wordmark, add gradients, stretch it, or
                drop shadows on it.
              </div>
            </div>
          </div>
        </div>

        {/* 03 COLOR */}
        <div
          style={{
            padding: "64px 72px 56px",
            borderBottom: "1px solid #EFEADC",
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: 12,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "#8A6A2E",
              marginBottom: 24,
            }}
          >
            03 — Colour
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 16,
              marginBottom: 28,
            }}
          >
            {[
              {
                bg: "#BFA37A",
                border: "1px solid rgba(0,0,0,.06)",
                name: "Champagne",
                code: "#BFA37A · primary",
              },
              {
                bg: "#3a3832",
                border: undefined,
                name: "Charcoal",
                code: "#3A3832 · ink",
              },
              {
                bg: "#FFFFFF",
                border: "1px solid #EFEADC",
                name: "Paper",
                code: "#FFFFFF · canvas",
              },
              {
                bg: "#FFF7EC",
                border: "1px solid #EFEADC",
                name: "Cream",
                code: "#FFF7EC · soft fill",
              },
            ].map((c) => (
              <div key={c.name}>
                <div
                  style={{
                    height: 120,
                    borderRadius: 16,
                    background: c.bg,
                    border: c.border,
                  }}
                />
                <div
                  style={{
                    marginTop: 12,
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#3a3832",
                  }}
                >
                  {c.name}
                </div>
                <div
                  style={{ fontFamily: mono, fontSize: 12, color: "#8a8678" }}
                >
                  {c.code}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{ background: "#3a3832", borderRadius: 16, padding: "26px 30px" }}
          >
            <div
              style={{
                fontFamily: mono,
                fontSize: 12,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "#BFA37A",
                marginBottom: 16,
              }}
            >
              Design tokens · for code handoff
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px 40px",
                fontFamily: mono,
                fontSize: 13,
                color: "#e8e6dd",
              }}
            >
              {[
                ["--dash-canary", "#BFA37A"],
                ["--dash-ink", "#3A3832"],
                ["--dash-body", "#56544B"],
                ["--dash-paper", "#FFFFFF"],
                ["--dash-cream", "#FFF7EC"],
                ["--dash-hairline", "#EFEADC"],
                ["--dash-gold", "#8A6A2E"],
                ["--dash-muted", "#8A8678"],
              ].map(([name, val]) => (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #4a473f",
                    paddingBottom: 6,
                  }}
                >
                  {name}
                  <span style={{ color: "#BFA37A" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 04 TYPE */}
        <div
          style={{
            padding: "64px 72px 56px",
            borderBottom: "1px solid #EFEADC",
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: 12,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "#8A6A2E",
              marginBottom: 24,
            }}
          >
            04 — Typography
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
            }}
          >
            <div
              style={{ background: "#FFF7EC", borderRadius: 18, padding: 34 }}
            >
              <div
                style={{
                  fontFamily: lato,
                  fontWeight: 900,
                  fontSize: 64,
                  lineHeight: 0.9,
                  letterSpacing: "-.04em",
                  color: "#3a3832",
                }}
              >
                Aa
              </div>
              <div
                style={{
                  marginTop: 16,
                  fontWeight: 900,
                  fontSize: 22,
                  color: "#3a3832",
                }}
              >
                Lato
              </div>
              <div style={{ fontSize: 14, color: "#56544b", marginTop: 4 }}>
                Display &amp; UI. Black (900) for headlines, Bold (700) for
                buttons &amp; labels, Regular (400) for body.
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 12,
                  color: "#a8a698",
                  marginTop: 12,
                }}
              >
                900 · 700 · 400
              </div>
            </div>
            <div
              style={{ background: "#FFF7EC", borderRadius: 18, padding: 34 }}
            >
              <div
                style={{
                  fontFamily: mono,
                  fontWeight: 700,
                  fontSize: 60,
                  lineHeight: 0.9,
                  color: "#3a3832",
                }}
              >
                Aa
              </div>
              <div
                style={{
                  marginTop: 16,
                  fontWeight: 900,
                  fontSize: 22,
                  color: "#3a3832",
                  fontFamily: lato,
                }}
              >
                Space Mono
              </div>
              <div style={{ fontSize: 14, color: "#56544b", marginTop: 4 }}>
                Technical voice — eyebrows, counters, code, &ldquo;honest
                terminal&rdquo; detail. Use sparingly, in tracked caps.
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 12,
                  color: "#a8a698",
                  marginTop: 12,
                }}
              >
                700 · 400
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              borderTop: "1px solid #EFEADC",
              paddingTop: 20,
            }}
          >
            <div
              style={{
                fontFamily: lato,
                fontWeight: 900,
                fontSize: 40,
                letterSpacing: "-.03em",
                color: "#3a3832",
              }}
            >
              Display / H1 — 64px Black
            </div>
            <div
              style={{
                fontFamily: lato,
                fontWeight: 900,
                fontSize: 26,
                letterSpacing: "-.02em",
                color: "#3a3832",
              }}
            >
              Heading / H2 — 48px Black
            </div>
            <div
              style={{
                fontFamily: lato,
                fontWeight: 400,
                fontSize: 17,
                color: "#56544b",
              }}
            >
              Body — 17px Regular. Lato keeps text friendly and legible at small
              sizes.
            </div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 12,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "#8A6A2E",
              }}
            >
              Eyebrow — 12px Space Mono, .18em tracking
            </div>
          </div>
        </div>

        {/* 05 MARK + LOADER */}
        <div
          style={{
            padding: "64px 72px 56px",
            borderBottom: "1px solid #EFEADC",
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: 12,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "#8A6A2E",
              marginBottom: 24,
            }}
          >
            05 — The mark &amp; the loader
          </div>
          <div style={{ display: "flex", gap: 48, alignItems: "center" }}>
            <div style={{ flex: "none", width: 300, textAlign: "center" }}>
              <div style={{ width: 240, margin: "0 auto" }} className="bd-floaty--demo">
                <AssemblingMark pct={68} title="" />
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 12,
                  color: "#a8a698",
                  marginTop: 14,
                }}
              >
                the mark IS the loader — the ring closes as work completes
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  margin: "0 0 12px",
                  fontFamily: lato,
                  fontWeight: 900,
                  fontSize: 26,
                  letterSpacing: "-.02em",
                  color: "#3a3832",
                }}
              >
                A ring that closes as the work completes.
              </h3>
              <p
                style={{
                  margin: "0 0 16px",
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: "#56544b",
                }}
              >
                There is no mascot. The mark is the loading state: a brass ring
                that closes as an agent works, and a core that lights as it
                lands. At 100% the ring is whole — the wait paid off. It carries
                progress honestly, at any size, without a character to explain.
              </p>
              <div style={{ display: "flex", gap: 24 }}>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#3a3832",
                      marginBottom: 4,
                    }}
                  >
                    Do
                  </div>
                  <div
                    style={{ fontSize: 14, color: "#56544b", lineHeight: 1.5 }}
                  >
                    Keep him glossy &amp; champagne. Let him float. Drive the fill
                    with real progress.
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#3a3832",
                      marginBottom: 4,
                    }}
                  >
                    Don&rsquo;t
                  </div>
                  <div
                    style={{ fontSize: 14, color: "#56544b", lineHeight: 1.5 }}
                  >
                    Don&rsquo;t recolour him, flatten the gloss, or paste a
                    separate bar on his body.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 06 VOICE + TAGLINES */}
        <div
          style={{
            padding: "64px 72px 56px",
            borderBottom: "1px solid #EFEADC",
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: 12,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "#8A6A2E",
              marginBottom: 24,
            }}
          >
            06 — Voice &amp; taglines
          </div>
          <div style={{ display: "flex", gap: 56 }}>
            <div style={{ flex: "none", width: 300 }}>
              <h3
                style={{
                  margin: "0 0 14px",
                  fontFamily: lato,
                  fontWeight: 900,
                  fontSize: 26,
                  letterSpacing: "-.02em",
                  color: "#3a3832",
                }}
              >
                Warm, witty, honest.
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: "#56544b",
                }}
              >
                Assembling is playful but never sleazy. Dog puns are welcome. Money
                talk is plain and transparent. Short sentences. A wink, not a
                shout.
              </p>
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {[
                { letter: "A", bg: "#BFA37A", lc: "#5a4a00", text: "Get paid for the wait." },
                { letter: "B", bg: "#FFF7EC", lc: "#8A6A2E", text: "Design the wait." },
                { letter: "C", bg: "#FFF7EC", lc: "#8A6A2E", text: "While it thinks, you earn." },
                { letter: "D", bg: "#FFF7EC", lc: "#8A6A2E", text: "Monetise the moment." },
                {
                  letter: "E",
                  bg: "#FFF7EC",
                  lc: "#8A6A2E",
                  text: "Your idle minute, finally worth something.",
                },
              ].map((t) => (
                <div
                  key={t.letter}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    background: t.bg,
                    borderRadius: 14,
                    padding: "18px 22px",
                  }}
                >
                  <span
                    style={{ fontFamily: mono, fontSize: 12, color: t.lc }}
                  >
                    {t.letter}
                  </span>
                  <span
                    style={{
                      fontFamily: lato,
                      fontWeight: 900,
                      fontSize: 22,
                      letterSpacing: "-.02em",
                      color: "#3a3832",
                    }}
                  >
                    {t.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 07 COMPONENTS */}
        <div style={{ padding: "64px 72px 72px" }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 12,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "#8A6A2E",
              marginBottom: 24,
            }}
          >
            07 — Core components
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <span
              style={{
                background: "#BFA37A",
                color: "#3a3832",
                padding: "15px 28px",
                borderRadius: 99,
                fontFamily: lato,
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              Primary button
            </span>
            <span
              style={{
                background: "#3a3832",
                color: "#BFA37A",
                padding: "15px 28px",
                borderRadius: 99,
                fontFamily: lato,
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              Inverse button
            </span>
            <span
              style={{
                background: "#fff",
                border: "2px solid #3a3832",
                color: "#3a3832",
                padding: "13px 26px",
                borderRadius: 99,
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              Secondary
            </span>
            <span
              style={{
                background: "#BFA37A",
                color: "#3a3832",
                borderRadius: 99,
                padding: "12px 22px",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Chip
            </span>
            <span
              style={{
                background: "#fff",
                border: "1.5px solid #E7E1D2",
                color: "#3a382f",
                borderRadius: 99,
                padding: "12px 22px",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Chip · outline
            </span>
            <span
              style={{
                background: "#3a3832",
                color: "#BFA37A",
                fontFamily: mono,
                fontWeight: 700,
                fontSize: 13,
                padding: "9px 16px",
                borderRadius: 99,
              }}
            >
              + $0.14
            </span>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div
              style={{
                flex: 1,
                background: "#fff",
                border: "1px solid #EFEADC",
                borderRadius: 18,
                padding: 22,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#3a3832",
                  marginBottom: 14,
                }}
              >
                Agent-working line
              </div>
              <div
                style={{
                  height: 14,
                  borderRadius: 9,
                  background: "#F2EDDF",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: "64%",
                    borderRadius: 9,
                    background:
                      "repeating-linear-gradient(118deg,#BFA37A 0 12px,#fff 12px 22px)",
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontFamily: mono,
                  fontSize: 12,
                  color: "#bdb592",
                }}
              >
                SPONSORED · WHILE YOU WAIT
              </div>
            </div>
            <div
              style={{
                flex: "none",
                width: 260,
                background: "#FFF7EC",
                borderRadius: 18,
                padding: 22,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#3a3832",
                  marginBottom: 8,
                }}
              >
                Card / surface
              </div>
              <div
                style={{ fontSize: 13, color: "#56544b", lineHeight: 1.5 }}
              >
                Radius 18–26px · 1px #EFEADC border · soft gold shadow. Cream
                tiles for nested content.
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div
          style={{
            background: "#3a3832",
            padding: "30px 72px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: lato,
              fontWeight: 900,
              fontSize: 20,
              letterSpacing: "-.04em",
              color: "#BFA37A",
            }}
          >
            assembling
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 12,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "#8a8678",
            }}
          >
            Brand Guidelines v1.0 · assembl.co.nz/assembling
          </div>
        </div>
      </div>
    </div>
  );
}
