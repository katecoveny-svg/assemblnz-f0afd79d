"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MatarikiCluster } from "@/components/assembl/chrome";
import { isAdminHub, isAgentMarketplace, isAlphassembl, isAtlas, isAuthSurface, isCustomerWorkspace, isDashMicrosite, isEcho } from "@/components/site/site-header";

/**
 * Global footer — DIRECTION-LOCKED-2026-07-01 (palette correction 2026-07-02).
 *
 * Paper white, lowercase Cormorant `assembl` wordmark with the matariki
 * cluster ornament, the tracked motto as the only uppercase text, Space Mono
 * small links in three quiet columns (product / company / legal). No
 * sub-brand references, no old-era anchors.
 */

const COLUMNS: { label: string; links: { href: string; label: string }[] }[] = [
  {
    label: "product",
    links: [
      { href: "/agents", label: "agents" },
      { href: "/bundles", label: "bundles" },
      { href: "/pricing", label: "pricing" },
      { href: "/trust", label: "trust" },
    ],
  },
  {
    label: "company",
    links: [
      { href: "/about", label: "about" },
      { href: "/contact", label: "contact" },
    ],
  },
  {
    label: "legal",
    links: [
      { href: "/legal/privacy", label: "privacy" },
      { href: "/legal/terms", label: "terms" },
    ],
  },
];

const GOLD = "#BFA37A";
const INK = "#1A1918";
const BODY_GREY = "#5A5850";
const HAIRLINE = "#E7E4DA";

const monoSmall: React.CSSProperties = {
  fontFamily: "var(--font-mono), 'Space Mono', monospace",
  fontSize: 12.5,
  textTransform: "lowercase",
};

const microLabel: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-mono), 'Space Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: BODY_GREY,
};

export function SiteFooter() {
  const pathname = usePathname();
  // The /assembling microsite, /agents marketplace, /atlas coach, signed-out
  // auth surfaces and the /admin operator hub ship their own footer (or none);
  // suppress the global one there. Customer pilot workspaces (/customers/*) are
  // white-labelled — suppress the assembl footer across the whole subtree.
  // pathname === "/" — the root is the coming-soon splash until the fresh
  // marketing site cuts over; the splash carries no chrome at all.
  if (isDashMicrosite(pathname) || isAgentMarketplace(pathname) || isAtlas(pathname) || isEcho(pathname) || isAuthSurface(pathname) || isAdminHub(pathname) || isCustomerWorkspace(pathname) || isAlphassembl(pathname) || pathname === "/") return null;

  return (
    <footer
      className="relative z-10 mt-24"
      style={{ background: "#FBFAF6", borderTop: `1px solid ${HAIRLINE}` }}
    >
      <div className="container" style={{ paddingTop: 64, paddingBottom: 28 }}>
        {/* motto — the only uppercase text in the footer */}
        <p style={{ ...microLabel, display: "flex", alignItems: "center", gap: 10 }}>
          <span aria-hidden style={{ color: GOLD, fontSize: 10, lineHeight: 1 }}>
            •
          </span>
          adaptive. connected. purpose-built.
        </p>

        <div
          className="grid gap-10 md:grid-cols-5"
          style={{ marginTop: 40, paddingBottom: 48, borderBottom: `1px solid ${HAIRLINE}` }}
        >
          <div className="md:col-span-2">
            <Link
              href="/"
              className="inline-flex flex-col items-start gap-3 rounded-sm transition-opacity hover:opacity-80 focus-visible:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            >
              <MatarikiCluster size={40} gold className="opacity-90" />
              <span
                style={{
                  fontFamily: "var(--font-display), 'Cormorant Garamond', Georgia, serif",
                  fontWeight: 500,
                  fontSize: 30,
                  lineHeight: 1,
                  letterSpacing: "0.04em",
                  textTransform: "lowercase",
                  color: INK,
                }}
              >
                assembl
                <span aria-hidden style={{ color: GOLD }}>
                  .
                </span>
              </span>
            </Link>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.label}>
              <h2 style={microLabel}>{col.label}</h2>
              <ul style={{ listStyle: "none", margin: "16px 0 0", padding: 0 }}>
                {col.links.map((item) => (
                  <li key={item.href} style={{ marginTop: 10 }}>
                    <Link
                      href={item.href}
                      className="rounded-sm transition-colors hover:opacity-70 focus-visible:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                      style={{ ...monoSmall, color: INK, textDecoration: "none" }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p style={{ ...monoSmall, margin: 0, paddingTop: 24, fontSize: 11.5, color: BODY_GREY }}>
          © 2026 assembl — built in aotearoa
        </p>
      </div>
    </footer>
  );
}
