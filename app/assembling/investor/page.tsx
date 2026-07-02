import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import styles from "./investor.module.css";

// Contains the business plan + the ask + partner names — NOT public. Gated to
// the operator allowlist (same as /dash/admin) and excluded from indexing.
export const dynamic = "force-dynamic";
const ALLOWED_EMAILS = new Set<string>(["assembl@assembl.co.nz", "kate@assembl.co.nz"]);

/**
 * /dash/investor — Investor one-pager, ported from the design handoff /
 * standalone dash-site. Fixed 1000px printable reference canvas. Fonts use the
 * next/font vars; display weights at Lato 700. Sits in the /assembling Birdie chrome.
 * Palette: white + canary + charcoal.
 */

export const metadata: Metadata = {
  title: "assembling. — Investor one-pager",
  description:
    "Assembling by assembl — the reward layer for the agentic wait. Market, model, traction plan and the ask, on one page.",
  alternates: { canonical: "/assembling/investor" },
  robots: { index: false, follow: false },
};

const LATO = "var(--font-dash-sans), 'Lato', sans-serif";
const MONO = "var(--font-dash-mono), 'Space Mono', monospace";

// Shared eyebrow ("h" class in the prototype).
const eyebrow: CSSProperties = {
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "#c79b1f",
  margin: "0 0 10px",
};

const tile: CSSProperties = {
  flex: 1,
  background: "#FFF7EC",
  borderRadius: 12,
  padding: 14,
};

const tileLabel: CSSProperties = {
  fontFamily: MONO,
  fontSize: 10,
  color: "#b89a2e",
  marginBottom: 6,
};

const tileBody: CSSProperties = {
  fontSize: 13,
  color: "#56544b",
  lineHeight: 1.4,
};

const stepNum: CSSProperties = {
  flex: "none",
  width: 22,
  height: 22,
  borderRadius: "50%",
  background: "#BFA37A",
  fontFamily: MONO,
  fontWeight: 700,
  fontSize: 12,
  color: "#3a3832",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const stepText: CSSProperties = {
  fontSize: 14,
  color: "#56544b",
  lineHeight: 1.45,
};

const stat: CSSProperties = {
  fontFamily: LATO,
  fontWeight: 700,
  fontSize: 30,
  letterSpacing: "-0.03em",
  color: "#3a3832",
};

const statLabel: CSSProperties = {
  fontSize: 12,
  color: "#8a887e",
};

const modelRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#FFF7EC",
  borderRadius: 10,
  padding: "11px 14px",
};

const modelName: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#3a3832",
};

const modelMeta: CSSProperties = {
  fontFamily: MONO,
  fontSize: 12,
  color: "#8a887e",
};

const rmEyebrow: CSSProperties = {
  fontFamily: MONO,
  fontSize: 11,
  color: "#8a887e",
  marginBottom: 5,
};

const rmTitle: CSSProperties = {
  fontWeight: 700,
  fontSize: 14,
  color: "#3a3832",
  marginBottom: 3,
};

const rmBody: CSSProperties = {
  fontSize: 12.5,
  color: "#8a887e",
  lineHeight: 1.4,
};

export default async function InvestorGate() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const email = (data.user?.email ?? "").toLowerCase();
  if (!data.user) redirect("/login?redirect=/dash/investor");
  if (!ALLOWED_EMAILS.has(email)) {
    return (
      <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: 40, textAlign: "center", color: "#3a3832" }}>
        <div>
          <h1 style={{ fontWeight: 700, fontSize: 28, margin: "0 0 8px" }}>Not authorised</h1>
          <p style={{ color: "#56544b" }}>This page is private to the Assembling operator team.</p>
        </div>
      </div>
    );
  }
  return <InvestorPage />;
}

function InvestorPage() {
  return (
    <div className={styles.stage}>
      <div className={styles.page}>
        {/* header band */}
        <div
          style={{
            background: "#BFA37A",
            padding: "34px 44px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontFamily: LATO,
                  fontWeight: 700,
                  fontSize: 42,
                  letterSpacing: "-0.05em",
                  color: "#3a3832",
                  lineHeight: 0.8,
                }}
              >
                assembling
              </div>
              <div
                style={{
                  width: 30,
                  height: 9,
                  borderRadius: 5,
                  background: "#3a3832",
                  marginBottom: 7,
                }}
              />
            </div>
            <div
              style={{
                fontFamily: LATO,
                fontWeight: 700,
                fontSize: 20,
                letterSpacing: "-0.02em",
                color: "#3a3832",
              }}
            >
              Investor one-pager &middot; business plan
            </div>
          </div>
          <div
            style={{
              textAlign: "right",
              fontFamily: MONO,
              fontSize: 11,
              color: "#5a4a00",
              lineHeight: 1.8,
            }}
          >
            Pre-seed &middot; 2026
            <br />
            Confidential &middot; by assembl
            <br />
            T&#257;maki Makaurau, Aotearoa
          </div>
        </div>

        {/* thesis strip */}
        <div
          style={{
            padding: "28px 44px",
            borderBottom: "1px solid #EFEADC",
            background: "#FFF7EC",
          }}
        >
          <div
            style={{
              fontFamily: LATO,
              fontWeight: 700,
              fontSize: 30,
              letterSpacing: "-0.03em",
              color: "#3a3832",
              lineHeight: 1.05,
            }}
          >
            Every AI agent makes you wait. Assembling turns that wait into value you
            keep &mdash; and the most captive five seconds in software into a new
            ad surface.
          </div>
        </div>

        {/* two columns */}
        <div
          style={{
            display: "flex",
            gap: 0,
            borderBottom: "1px solid #EFEADC",
          }}
        >
          {/* left */}
          <div
            style={{
              flex: 1,
              padding: "30px 36px 30px 44px",
              borderRight: "1px solid #EFEADC",
            }}
          >
            <div style={eyebrow}>Problem</div>
            <p
              style={{
                margin: "0 0 22px",
                fontSize: 15,
                lineHeight: 1.6,
                color: "#56544b",
              }}
            >
              Agentic AI is here, and it&rsquo;s{" "}
              <b style={{ color: "#3a3832" }}>slow by design</b> &mdash; tasks
              run for seconds to minutes while the user stares at a spinner. That
              wait is dead time for users, an awkward UX for builders, and a
              completely <b style={{ color: "#3a3832" }}>unmonetised</b> moment
              of total attention.
            </p>

            <div style={eyebrow}>Solution</div>
            <p
              style={{
                margin: "0 0 16px",
                fontSize: 15,
                lineHeight: 1.6,
                color: "#56544b",
              }}
            >
              Assembling is an{" "}
              <b style={{ color: "#3a3832" }}>
                opt-in reward layer for the agentic wait
              </b>
              . Builders add one line; users earn while they wait and choose
              where it goes; one brand sponsors each slot.
            </p>
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <div style={tile}>
                <div style={tileLabel}>BUILDERS</div>
                <div style={tileBody}>
                  One line:{" "}
                  <span style={{ fontFamily: MONO, color: "#3a3832" }}>
                    dash.show()
                  </span>
                </div>
              </div>
              <div style={tile}>
                <div style={tileLabel}>USERS</div>
                <div style={tileBody}>
                  Earn &rarr; KiwiSaver, charity, points
                </div>
              </div>
              <div style={tile}>
                <div style={tileLabel}>BRANDS</div>
                <div style={tileBody}>Buy the captive minute</div>
              </div>
            </div>

            <div style={eyebrow}>How it works</div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 9 }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <div style={stepNum}>1</div>
                <div style={stepText}>
                  User opts in and picks a reward destination.
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <div style={stepNum}>2</div>
                <div style={stepText}>
                  Agent runs; Assembling shows one sponsored line under its status.
                  Value banks in real time.
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <div style={stepNum}>3</div>
                <div style={stepText}>
                  Task completes &rarr; &ldquo;you earned $X.&rdquo; Host keeps a
                  share; Assembling keeps a take rate.
                </div>
              </div>
            </div>
          </div>

          {/* right */}
          <div style={{ flex: 1, padding: "30px 44px 30px 36px" }}>
            <div style={{ ...eyebrow, margin: "0 0 14px" }}>
              Market &middot; Aotearoa first
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginBottom: 24,
              }}
            >
              <div>
                <div style={stat}>$2.97B</div>
                <div style={statLabel}>NZ digital ad spend / yr</div>
              </div>
              <div>
                <div style={stat}>5.06M</div>
                <div style={statLabel}>Kiwis online, 5+ hrs/day</div>
              </div>
              <div>
                <div style={stat}>~7mo</div>
                <div style={statLabel}>agent task-length doubling</div>
              </div>
              <div>
                <div style={stat}>1st</div>
                <div style={statLabel}>mover on the agentic wait</div>
              </div>
            </div>

            <div style={{ ...eyebrow, margin: "0 0 12px" }}>
              Business model
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 24,
              }}
            >
              <div style={modelRow}>
                <span style={modelName}>Sponsored slots</span>
                <span style={modelMeta}>~30% take rate</span>
              </div>
              <div style={modelRow}>
                <span style={modelName}>Host revenue share</span>
                <span style={modelMeta}>white-label SaaS</span>
              </div>
              <div style={modelRow}>
                <span style={modelName}>Builder SDK</span>
                <span style={modelMeta}>free &rarr; usage tiers</span>
              </div>
            </div>

            <div style={{ ...eyebrow, margin: "0 0 12px" }}>The ask</div>
            <div
              style={{
                background: "#3a3832",
                borderRadius: 14,
                padding: "20px 22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    fontFamily: LATO,
                    fontWeight: 700,
                    fontSize: 34,
                    letterSpacing: "-0.03em",
                    color: "#BFA37A",
                  }}
                >
                  $1.5M
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    color: "#bdb592",
                  }}
                >
                  pre-seed
                </div>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#cfccc3",
                  lineHeight: 1.5,
                }}
              >
                18-month runway to ship the SDK, land 3 enabler hosts (Ambit,
                Datacom, Xero-adjacent), and reach 100k opted-in Kiwis.
              </div>
            </div>
          </div>
        </div>

        {/* roadmap */}
        <div style={{ padding: "26px 44px 30px" }}>
          <div style={{ ...eyebrow, margin: "0 0 16px" }}>Roadmap</div>
          <div style={{ display: "flex", gap: 14 }}>
            <div
              style={{
                flex: 1,
                borderTop: "3px solid #BFA37A",
                paddingTop: 12,
              }}
            >
              <div style={rmEyebrow}>Q3 &rsquo;26</div>
              <div style={rmTitle}>SDK + wallet beta</div>
              <div style={rmBody}>
                First host integration, KiwiSaver + charity rails.
              </div>
            </div>
            <div
              style={{
                flex: 1,
                borderTop: "3px solid #BFA37A",
                paddingTop: 12,
              }}
            >
              <div style={rmEyebrow}>Q4 &rsquo;26</div>
              <div style={rmTitle}>Sponsor marketplace</div>
              <div style={rmBody}>Self-serve brand slots, measurement.</div>
            </div>
            <div
              style={{
                flex: 1,
                borderTop: "3px solid #EFEADC",
                paddingTop: 12,
              }}
            >
              <div style={rmEyebrow}>2027</div>
              <div style={rmTitle}>100k users &middot; AU</div>
              <div style={rmBody}>
                Everyday Rewards + Airpoints live; expand across the Tasman.
              </div>
            </div>
            <div
              style={{
                flex: 1,
                borderTop: "3px solid #EFEADC",
                paddingTop: 12,
              }}
            >
              <div style={rmEyebrow}>Edge</div>
              <div style={rmTitle}>assembl-governed</div>
              <div style={rmBody}>
                Trust, NZ data residency, brand-safety baked in.
              </div>
            </div>
          </div>
        </div>

        {/* footer */}
        <div
          style={{
            background: "#3a3832",
            padding: "22px 44px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "flex-end", gap: 8 }}
          >
            <div
              style={{
                fontFamily: LATO,
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: "-0.05em",
                color: "#BFA37A",
              }}
            >
              assembling
            </div>
            <div
              style={{
                width: 20,
                height: 6,
                borderRadius: 4,
                background: "#BFA37A",
                marginBottom: 4,
              }}
            />
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.08em",
              color: "#8a8678",
            }}
          >
            Get paid for the wait. &middot; assembl.co.nz/assembling
          </div>
        </div>
      </div>
    </div>
  );
}
