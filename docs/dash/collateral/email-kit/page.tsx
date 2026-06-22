import Link from "next/link";
import type { Metadata } from "next";
import Wordmark from "@/components/Wordmark";

export const metadata: Metadata = {
  title: "dash — brand & asset kit",
  description: "Every Dash deliverable in one place: site, brand, logo, app, ads, interactive, video, investor one-pager, SDK and email kit.",
};

type Item = {
  href: string;
  label: string;
  desc: string;
  external?: boolean;
};

const ITEMS: Item[] = [
  { href: "/", label: "Marketing site", desc: "Hero, fill-the-dog loader, audience doors, rewards, glass CTA." },
  { href: "/brand", label: "Brand Guidelines", desc: "The idea, logo, colour tokens, type, mascot & loader, voice." },
  { href: "/logo", label: "Logo System", desc: "The “dash —” lockups, app icons, the dash-line motif, specs." },
  { href: "/app-screens", label: "App Wireframes & Mockups", desc: "Low-fi flow + hi-fi iOS screens with the live loader." },
  { href: "/ads", label: "Social Ads", desc: "Feed, story, portrait, landscape & leaderboard frames." },
  { href: "/interactive", label: "Interactive", desc: "Scratch-to-reveal reward + Dash Dash mini-game." },
  { href: "/video", label: "Short Video", desc: "~14s playable promo, light 9:16 + bold 1:1 cuts." },
  { href: "/investor", label: "Investor One-Pager", desc: "Problem → solution → market → model → the ask." },
  { href: "/sdk", label: "SDK Reference", desc: "init(), show(), sessions, events, theming, webhooks." },
  { href: "/email-kit.html", label: "Email Kit", desc: "Sendable table-based banner, welcome email & signature.", external: true },
];

export default function KitPage() {
  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(120% 80% at 50% 0,#FFF7EC,#F4F1E9)", padding: "64px 24px 96px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <Wordmark size={34} />
          <span className="mono" style={{ fontSize: 12, color: "var(--dash-muted)" }}>by assembl</span>
        </div>
        <div className="eyebrow" style={{ margin: "18px 0 12px" }}>Brand &amp; asset kit</div>
        <h1 style={{ fontWeight: 900, fontSize: 48, letterSpacing: "-.035em", color: "var(--dash-ink)", margin: "0 0 12px", maxWidth: 760, lineHeight: 1.0 }}>
          Everything Dash, in one place.
        </h1>
        <p style={{ fontSize: 17, color: "var(--dash-body)", maxWidth: 560, margin: "0 0 44px", lineHeight: 1.6 }}>
          The full system built from the design handoff — marketing site, brand, and every asset, implemented in Next.js.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
          {ITEMS.map((item) => {
            const inner = (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--dash-ink)" }}>
                    {item.label}
                  </div>
                  <span aria-hidden style={{ color: "var(--dash-gold)", fontWeight: 700 }}>
                    {item.external ? "↗" : "→"}
                  </span>
                </div>
                <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.55, color: "var(--dash-body)" }}>{item.desc}</div>
              </>
            );
            const cardStyle: React.CSSProperties = {
              display: "block",
              background: "#fff",
              border: "1px solid var(--dash-hairline)",
              borderRadius: 22,
              padding: 26,
              boxShadow: "0 12px 30px rgba(180,150,40,.08)",
            };
            return item.external ? (
              <a key={item.href} href={item.href} className="lift" style={cardStyle}>
                {inner}
              </a>
            ) : (
              <Link key={item.href} href={item.href} className="lift" style={cardStyle}>
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
