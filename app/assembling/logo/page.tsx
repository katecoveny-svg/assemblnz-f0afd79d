import type { Metadata } from 'next';
import '../birdie.css';

/**
 * /dash/logo — Logo System, ported from the design handoff ("Assembling - Logo
 * System.dc.html" / standalone dash-site). The wordmark closes with the canary
 * dash that doubles as the loading bar; the motif is a row of dashes. Wordmark
 * samples stay Lato 900 (that's the spec); the page title is 700.
 * Sits inside the /assembling Birdie chrome. Palette: white + canary + charcoal.
 */

export const metadata: Metadata = {
  title: 'assembling. — Logo System',
  description:
    'The Assembling wordmark, lockups, reversed/canary variants, app icon, the dash-line motif and construction spec.',
  alternates: { canonical: '/assembling/logo' },
};

export default function LogoPage() {
  return (
    <div
      style={{
        width: "max-content",
        minWidth: "100%",
        minHeight: "100vh",
        padding: 48,
        boxSizing: "border-box",
        background: "#E7E5DF",
        fontFamily: "var(--font-dash-sans), 'Lato', sans-serif",
      }}
    >
      <div
        style={{
          margin: "0 0 6px 2px",
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: "-.02em",
          color: "#3a3832",
        }}
      >
        Assembling &mdash; Logo System
      </div>
      <div
        style={{
          margin: "0 0 40px 2px",
          fontFamily: "var(--font-dash-mono), 'Space Mono', monospace",
          fontSize: 13,
          color: "#7a766b",
        }}
      >
        The wordmark closes with a dash &mdash; the loading bar, the brand. The
        motif is a row of dashes.
      </div>

      <div style={{ display: "flex", gap: 44, alignItems: "flex-start" }}>
        {/* column 1: primary lockups */}
        <div
          style={{
            flex: "none",
            width: 560,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 6,
              boxShadow: "0 2px 6px rgba(0,0,0,.08)",
              padding: 56,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 72,
                  lineHeight: 0.8,
                  letterSpacing: "-.05em",
                  color: "#3a3832",
                }}
              >
                assembling
              </div>
              <div
                style={{
                  width: 46,
                  height: 13,
                  borderRadius: 7,
                  background: "#FFD42A",
                  marginBottom: 14,
                }}
              />
            </div>
            <div
              style={{
                fontFamily: "var(--font-dash-mono), 'Space Mono', monospace",
                fontSize: 11,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "#a8a698",
              }}
            >
              Primary lockup &middot; wordmark + dash
            </div>
          </div>

          <div style={{ display: "flex", gap: 24 }}>
            <div
              style={{
                flex: 1,
                background: "#3a3832",
                borderRadius: 6,
                boxShadow: "0 2px 6px rgba(0,0,0,.08)",
                padding: 40,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-end", gap: 9 }}>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 42,
                    lineHeight: 0.8,
                    letterSpacing: "-.05em",
                    color: "#fff",
                  }}
                >
                  assembling
                </div>
                <div
                  style={{
                    width: 28,
                    height: 8,
                    borderRadius: 5,
                    background: "#FFD42A",
                    marginBottom: 8,
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: "var(--font-dash-mono), 'Space Mono', monospace",
                  fontSize: 10,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "#8a8678",
                }}
              >
                Reversed
              </div>
            </div>
            <div
              style={{
                flex: 1,
                background: "#FFD42A",
                borderRadius: 6,
                boxShadow: "0 2px 6px rgba(0,0,0,.08)",
                padding: 40,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-end", gap: 9 }}>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 42,
                    lineHeight: 0.8,
                    letterSpacing: "-.05em",
                    color: "#3a3832",
                  }}
                >
                  assembling
                </div>
                <div
                  style={{
                    width: 28,
                    height: 8,
                    borderRadius: 5,
                    background: "#3a3832",
                    marginBottom: 8,
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: "var(--font-dash-mono), 'Space Mono', monospace",
                  fontSize: 10,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: "#5a4a00",
                }}
              >
                On canary
              </div>
            </div>
          </div>

          {/* animated loader-dash */}
          <div
            style={{
              background: "#fff",
              borderRadius: 6,
              boxShadow: "0 2px 6px rgba(0,0,0,.08)",
              padding: "44px 56px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 54,
                  lineHeight: 0.8,
                  letterSpacing: "-.05em",
                  color: "#3a3832",
                }}
              >
                assembling
              </div>
              <div
                style={{
                  width: 44,
                  height: 11,
                  borderRadius: 6,
                  background: "#EFEADC",
                  overflow: "hidden",
                  marginBottom: 11,
                }}
              >
                <div className="bd-loaderfill" />
              </div>
            </div>
            <div
              style={{
                fontFamily: "var(--font-dash-mono), 'Space Mono', monospace",
                fontSize: 11,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "#a8a698",
              }}
            >
              The dash is the loader &middot; it fills as the agent works
            </div>
          </div>

          {/* dash-line motif */}
          <div
            style={{
              background: "#fff",
              borderRadius: 6,
              boxShadow: "0 2px 6px rgba(0,0,0,.08)",
              padding: "36px 40px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-dash-mono), 'Space Mono', monospace",
                fontSize: 11,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "#a8a698",
                marginBottom: 18,
              }}
            >
              Brand motif &middot; the dash line (replaces hazard stripes)
            </div>
            <div
              style={{
                height: 14,
                borderRadius: 7,
                backgroundImage:
                  "repeating-linear-gradient(90deg,#FFD42A 0 26px,transparent 26px 40px)",
                marginBottom: 14,
              }}
            />
            <div
              style={{
                height: 14,
                borderRadius: 7,
                backgroundImage:
                  "repeating-linear-gradient(90deg,#3a3832 0 26px,transparent 26px 40px)",
                marginBottom: 14,
              }}
            />
            <div
              style={{
                height: 10,
                borderRadius: 6,
                backgroundImage:
                  "repeating-linear-gradient(90deg,#FFD42A 0 16px,transparent 16px 26px)",
              }}
            />
          </div>
        </div>

        {/* column 2: app icons + stacked + spec */}
        <div
          style={{
            flex: "none",
            width: 440,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 6,
              boxShadow: "0 2px 6px rgba(0,0,0,.08)",
              padding: 40,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-dash-mono), 'Space Mono', monospace",
                fontSize: 11,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "#a8a698",
                marginBottom: 24,
              }}
            >
              App icon
            </div>
            <div
              style={{
                display: "flex",
                gap: 22,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 28,
                  background: "#3a3832",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 15,
                    borderRadius: 8,
                    background: "#FFD42A",
                  }}
                />
              </div>
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 28,
                  background: "#FFD42A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 15,
                    borderRadius: 8,
                    background: "#3a3832",
                  }}
                />
              </div>
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 28,
                  background: "#fff",
                  border: "1px solid #EFEADC",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                }}
              >
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 30,
                    letterSpacing: "-.05em",
                    color: "#3a3832",
                    lineHeight: 0.8,
                  }}
                >
                  d
                </div>
                <div
                  style={{
                    width: 34,
                    height: 9,
                    borderRadius: 5,
                    background: "#FFD42A",
                  }}
                />
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                marginTop: 18,
                fontFamily: "var(--font-dash-mono), 'Space Mono', monospace",
                fontSize: 11,
                color: "#bdb592",
              }}
            >
              the dash mark, centered
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: 6,
              boxShadow: "0 2px 6px rgba(0,0,0,.08)",
              padding: 44,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 48,
                  lineHeight: 0.8,
                  letterSpacing: "-.05em",
                  color: "#3a3832",
                }}
              >
                assembling
              </div>
              <div
                style={{
                  width: 60,
                  height: 11,
                  borderRadius: 6,
                  background: "#FFD42A",
                }}
              />
            </div>
            <div
              style={{
                fontFamily: "var(--font-dash-mono), 'Space Mono', monospace",
                fontSize: 10,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "#a8a698",
                marginTop: 4,
              }}
            >
              Stacked
            </div>
          </div>

          <div
            style={{
              background: "#3a3832",
              borderRadius: 6,
              boxShadow: "0 2px 6px rgba(0,0,0,.08)",
              padding: "30px 34px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-dash-mono), 'Space Mono', monospace",
                fontSize: 10,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "#FFD42A",
                marginBottom: 14,
              }}
            >
              Construction
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 9,
                fontFamily: "var(--font-dash-mono), 'Space Mono', monospace",
                fontSize: 12,
                color: "#e8e6dd",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #4a473f",
                  paddingBottom: 7,
                }}
              >
                Wordmark
                <span style={{ color: "#FFD42A" }}>Lato Black &middot; -5% track</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #4a473f",
                  paddingBottom: 7,
                }}
              >
                Assembling length
                <span style={{ color: "#FFD42A" }}>&asymp; 0.6&times; cap height</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #4a473f",
                  paddingBottom: 7,
                }}
              >
                Assembling gap
                <span style={{ color: "#FFD42A" }}>0.25&times; cap height</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #4a473f",
                  paddingBottom: 7,
                }}
              >
                Assembling radius
                <span style={{ color: "#FFD42A" }}>full / pill</span>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                Clear space
                <span style={{ color: "#FFD42A" }}>height of &ldquo;d&rdquo;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
