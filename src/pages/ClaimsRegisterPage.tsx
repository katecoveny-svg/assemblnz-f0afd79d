import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import SEO from "@/components/SEO";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";

const CLAIMS = [
  {
    id: 1,
    claim: "NZ enterprises",
    source: "Stats NZ · Business demography statistics",
    evidenceType: "Official govt dataset",
    lastVerified: "Feb 2025",
    link: "https://www.stats.govt.nz/information-releases/new-zealand-business-demography-statistics-at-february-2025",
  },
  {
    id: 2,
    claim: "Fewer than 20 staff",
    source: "MBIE · Small Business Factsheet 2025",
    evidenceType: "Ministry report",
    lastVerified: "Mar 2025",
    link: "https://www.mbie.govt.nz/business-and-employment/business/support-for-business/small-business",
  },
  {
    id: 3,
    claim: "Produce a signed evidence pack today",
    source: "Assembl · SME Compliance Survey 2026 (n=50)",
    evidenceType: "Primary research",
    lastVerified: "Mar 2026",
    link: "https://assembl.co.nz/research/sme-compliance-2026",
  },
  {
    id: 4,
    claim: "Privacy Act 2020 alignment",
    source: "Privacy Amendment Act 2023",
    evidenceType: "Primary legislation",
    lastVerified: "Apr 2026",
    link: "https://www.legislation.govt.nz/act/public/2023/0048/latest/whole.html",
  },
  {
    id: 5,
    claim: "Compliance pipeline (Kahu → Iho → Tā → Mahara → Mana)",
    source: "Assembl Platform architecture v2.3",
    evidenceType: "Internal spec + audit trail",
    lastVerified: "Apr 2026",
    link: "https://assembl.co.nz/architecture",
  },
  {
    id: 6,
    claim: "Mana gate enforcement",
    source: "Assembl Mana fingerprint spec",
    evidenceType: "Internal spec + verifiable examples",
    lastVerified: "Apr 2026",
    link: "https://assembl.co.nz/mana",
  },
  {
    id: 7,
    claim: "Data at rest in NZ",
    source: "Anthropic hosting docs + Supabase project region",
    evidenceType: "Vendor docs + infra config",
    lastVerified: "Apr 2026",
    link: "https://docs.anthropic.com/en/docs/agents-and-tools/agent-sdk",
    detail:
      "Manaaki, Waihanga, Auaha and Pikau workflows execute on the Claude Agent SDK (hosted, US/EU regions). ARATAKI executes on Assembl's NZ Supabase stack (ap-southeast-2). Customer data at rest is stored in NZ for all kete.",
  },
];

const ClaimsRegisterPage = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <SEO
      title="Claims Register — Assembl"
      description="Every claim on the Assembl website is backed by a verifiable source. This register lists each claim, its source, evidence type, and verification date."
      path="/claims-register"
    />
    <BrandNav />

    <section className="pt-24 pb-16 sm:pt-32 sm:pb-20">
      <div className="max-w-5xl mx-auto px-5">
        <p
          className="text-[11px] font-display tracking-[5px] uppercase mb-4 text-center"
          style={{ fontWeight: 700, color: "hsl(var(--primary))" }}
        >
          CLAIMS REGISTER
        </p>
        <h1
          className="text-2xl sm:text-4xl font-display text-center mb-4 text-foreground"
          style={{ fontWeight: 300, letterSpacing: "-0.02em" }}
        >
          Every claim, sourced and verifiable
        </h1>
        <p className="text-sm font-body text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Superscript numbers on the pricing page (¹ ² ³ ⁷) link to the rows below. Each claim maps to a source you can check yourself.
        </p>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                {["#", "Claim", "Source", "Evidence type", "Last verified", "Link"].map((h) => (
                  <th
                    key={h}
                    className="text-[10px] font-display tracking-[2px] uppercase px-4 py-3 text-muted-foreground"
                    style={{ fontWeight: 700 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CLAIMS.map((c) => (
                <tr
                  key={c.id}
                  id={`claim-${c.id}`}
                  className="border-b transition-colors hover:bg-white/[0.02]"
                  style={{ borderColor: "rgba(255,255,255,0.04)" }}
                >
                  <td className="px-4 py-4 text-xs font-mono text-primary" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {c.id}
                  </td>
                  <td className="px-4 py-4 text-sm font-body text-foreground">{c.claim}</td>
                  <td className="px-4 py-4 text-xs font-body text-muted-foreground">{c.source}</td>
                  <td className="px-4 py-4">
                    <span
                      className="text-[10px] font-display tracking-[1px] uppercase px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        color: "rgba(255,255,255,0.5)",
                        fontWeight: 600,
                      }}
                    >
                      {c.evidenceType}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs font-body text-muted-foreground/60">{c.lastVerified}</td>
                  <td className="px-4 py-4">
                    <a
                      href={c.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1 text-xs"
                    >
                      Source <ExternalLink size={12} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {CLAIMS.map((c) => (
            <div
              key={c.id}
              id={`claim-${c.id}-m`}
              className="glass-card rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-primary" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  #{c.id}
                </span>
                <span
                  className="text-[9px] font-display tracking-[1px] uppercase px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}
                >
                  {c.evidenceType}
                </span>
              </div>
              <p className="text-sm font-body text-foreground mb-1">{c.claim}</p>
              <p className="text-xs font-body text-muted-foreground mb-1">{c.source}</p>
              <p className="text-[10px] font-body text-muted-foreground/40 mb-2">Verified: {c.lastVerified}</p>
              <a
                href={c.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1 text-xs"
              >
                View source <ExternalLink size={12} />
              </a>
            </div>
          ))}
        </div>

        {/* Row 7 detail */}
        <div className="glass-card rounded-xl p-5 mt-6" style={{ borderLeft: "2px solid hsl(var(--primary))" }}>
          <p className="text-[10px] font-display tracking-[2px] uppercase text-primary mb-2" style={{ fontWeight: 700 }}>
            CLAIM 7 — DETAIL
          </p>
          <p className="text-xs font-body text-muted-foreground leading-relaxed">
            {CLAIMS[6].detail}
          </p>
        </div>

        {/* Register metadata */}
        <div className="glass-card rounded-xl p-5 mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {[
            ["Version", "claims-register-v1.1-2026-04-10"],
            ["Rows", "7"],
            ["Status", "All claims sourced"],
            ["Review cadence", "Quarterly"],
            ["Owner", "Kate Harland"],
            ["Next audit", "2026-07-10"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[9px] font-display tracking-[2px] uppercase text-muted-foreground/40 mb-0.5" style={{ fontWeight: 700 }}>{label}</p>
              <p className="text-xs font-body text-muted-foreground">{value}</p>
            </div>
          ))}
        </div>

        <p className="text-[10px] font-body text-muted-foreground/30 text-center mt-6">
          <Link to="/pricing" className="underline hover:text-foreground transition-colors">Back to pricing</Link>
        </p>
      </div>
    </section>

    <div className="mt-auto">
      <BrandFooter />
    </div>
  </div>
);

export default ClaimsRegisterPage;
