"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  isAdminHub,
  isAgentMarketplace,
  isAlphassembl,
  isAssemblBills,
  isAtlas,
  isAuthSurface,
  isCustomerWorkspace,
  isDashMicrosite,
  isEcho,
  isLab,
  isStandaloneHealth,
  isStudio,
} from "@/components/site/site-header";

/**
 * Global footer — plum / chalk / Instrument Sans.
 * IBM Plex Mono only for micro labels. No Cormorant / gold / grape.
 */

const COLUMNS: { label: string; links: { href: string; label: string }[] }[] = [
  {
    label: "product",
    links: [
      { href: "/pursuit", label: "Pursuit" },
      { href: "/do", label: "DO" },
      { href: "/creative-studio", label: "Studio" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    label: "company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "mailto:assembl@assembl.co.nz", label: "assembl@assembl.co.nz" },
    ],
  },
  {
    label: "legal",
    links: [
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/legal/terms", label: "Terms" },
    ],
  },
];

const PLUM = "#240B21";
const MUTED = "#654A4E";
const CHALK = "#F5F1F2";
const HAIRLINE = "rgba(36, 11, 33, 0.12)";

const bodyLink: React.CSSProperties = {
  fontFamily: "var(--font-body), 'Instrument Sans', system-ui, sans-serif",
  fontSize: 14,
  color: PLUM,
  textDecoration: "none",
};

const microLabel: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: MUTED,
};

export function SiteFooter() {
  const pathname = usePathname();
  if (
    isDashMicrosite(pathname) ||
    isAgentMarketplace(pathname) ||
    isAtlas(pathname) ||
    isEcho(pathname) ||
    isAuthSurface(pathname) ||
    isAdminHub(pathname) ||
    isCustomerWorkspace(pathname) ||
    isAlphassembl(pathname) ||
    isAssemblBills(pathname) ||
    isStandaloneHealth(pathname) ||
    isStudio(pathname) ||
    isLab(pathname) ||
    pathname === "/"
  ) {
    return null;
  }

  return (
    <footer
      className="relative z-10 mt-24"
      style={{ background: CHALK, borderTop: `1px solid ${HAIRLINE}` }}
    >
      <div className="container" style={{ paddingTop: 64, paddingBottom: 28 }}>
        <p style={{ ...microLabel, display: "flex", alignItems: "center", gap: 10 }}>
          <span aria-hidden style={{ color: "#916A70", fontSize: 12, lineHeight: 1 }}>
            •
          </span>
          find it · do it · show it
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
              <span
                style={{
                  fontFamily: "var(--font-body), 'Instrument Sans', system-ui, sans-serif",
                  fontWeight: 500,
                  fontSize: 30,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  textTransform: "lowercase",
                  color: PLUM,
                }}
              >
                assembl
              </span>
            </Link>
            <p style={{ margin: "12px 0 0", color: MUTED, fontSize: 13, lineHeight: 1.5, maxWidth: 280 }}>
              Built in Aotearoa. Nothing consequential sends without a named yes.
            </p>
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
                      style={bodyLink}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p
          style={{
            fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
            margin: 0,
            paddingTop: 24,
            fontSize: 11,
            color: MUTED,
          }}
        >
          © 2026 assembl — built in Aotearoa
        </p>
      </div>
    </footer>
  );
}
