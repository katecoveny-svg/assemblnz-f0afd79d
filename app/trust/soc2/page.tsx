import type { Metadata } from "next";
import Link from "next/link";
import { SectionReveal } from "@/components/SectionReveal";
import { soc2Status } from "@/lib/trust-centre/soc2-status";

export const metadata: Metadata = {
  title: "Security & compliance | assembl",
  description:
    "How assembl handles your data — built for Aotearoa first: the Privacy Act 2020 including IPP 3A, Sydney-region data residency, Te Tiriti-shaped design, and an evidence pack on every output. Plus an honest read on where SOC 2 sits.",
};

// The genuine, verifiable strengths — this is the lead, not an afterthought.
const compliancePillars = [
  {
    title: "Privacy Act 2020, including IPP 3A",
    body: "We are built to New Zealand's Privacy Act 2020. Where personal information arrives indirectly, our workflows let a named human record the source, purpose, and notice — the new IPP 3A obligation in force from 1 May 2026. This is the law your data actually lives under.",
  },
  {
    title: "Data residency — Sydney region",
    body: "Customer records are stored in the Sydney (ap-southeast-2) region — the closest major cloud region to Aotearoa — with row-level security, encryption in transit and at rest, restricted service credentials, and audit logging on every access. Model calls are handled separately and covered in our AI use disclosure.",
  },
  {
    title: "Te Tiriti commitments in the design",
    body: "Te Tiriti and tikanga values shape how the agents are built — the four pou guide data handling, review, and accountability in the prompt design itself. This is a statement about how we build, not a claim of endorsement by anyone.",
  },
  {
    title: "Draft-only by design",
    body: "No external action is sent automatically. Every material output stays a draft until a named human reviews and approves it. Autonomy is not the promise; a reviewed first pass is.",
  },
  {
    title: "An evidence pack on every output",
    body: "Each workflow ends in an evidence pack — a downloadable bundle of the sources, assumptions, reviewer decisions, and timestamps behind that specific result. You can hand it to an auditor or a client. It proves the actual decision, not just the company behind it.",
  },
  {
    title: "Tenant isolation & audit logging",
    body: "Each customer's data sits in tenant-scoped systems with row-level security and a complete audit trail. The controls that a security review asks about are in production today, not waiting on a certificate.",
  },
];

export default function CompliancePosturePage() {
  const scope = soc2Status.criteriaScope;
  const criteria =
    scope.length > 1
      ? `${scope.slice(0, -1).join(", ")}, and ${scope[scope.length - 1]}`
      : scope.join(", ");

  return (
    <main className="bg-[color:var(--assembl-paper)]">
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-4xl">
          {/* Hero — leads with the honest, NZ-first story */}
          <SectionReveal>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
              Trust Centre · Security &amp; compliance
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-[clamp(3rem,7vw,6rem)] font-light leading-[0.92] text-[color:var(--text-primary)]">
              Compliance, the honest version.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[color:var(--text-secondary)]">
              We&rsquo;re a small Aotearoa team, so here&rsquo;s the straight version: how we
              handle your data, and where we land on the questions procurement always asks. The
              law that governs your data comes first. An honest read on SOC 2 sits below.
            </p>
          </SectionReveal>

          {/* 1 — LEAD: Built for Aotearoa first */}
          <SectionReveal delay={0.1}>
            <div className="mt-16">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
                01 · Built for Aotearoa first
              </p>
              <h2 className="mt-4 font-display text-3xl font-light text-[color:var(--text-primary)] md:text-4xl">
                The compliance that already governs your data.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--text-secondary)]">
                For a New Zealand buyer, this is the part that matters most. None of it
                is aspirational — it is how assembl is built and run today.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {compliancePillars.map((pillar) => (
                  <div
                    key={pillar.title}
                    className="border border-[rgba(157,140,125,0.22)] bg-[rgba(255,255,255,0.45)] p-6"
                  >
                    <h3 className="font-display text-xl font-light text-[color:var(--text-primary)]">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--text-secondary)]">
                      {pillar.body}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm leading-7 text-[color:var(--text-secondary)]">
                More detail:{" "}
                <Link className="underline-offset-2 hover:underline" href="/legal/privacy">
                  Privacy Statement
                </Link>{" "}
                ·{" "}
                <Link className="underline-offset-2 hover:underline" href="/ai-use">
                  AI use disclosure
                </Link>{" "}
                ·{" "}
                <Link className="underline-offset-2 hover:underline" href="/te-tiriti">
                  Te Tiriti statement
                </Link>
                .
              </p>
            </div>
          </SectionReveal>

          {/* 2 — Secondary, smaller: SOC 2 honestly */}
          <SectionReveal delay={0.15}>
            <div className="mt-16 border-l-2 border-[color:var(--assembl-pounamu)] bg-[rgba(58,56,50,0.05)] p-6 md:p-8">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
                02 · SOC 2 — on the roadmap
              </p>
              <h2 className="mt-3 font-display text-2xl font-light text-[color:var(--text-primary)] md:text-3xl">
                Honest about where SOC 2 sits.
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--text-secondary)]">
                SOC 2 is on our roadmap, not underway — and we will not pretend
                otherwise. We are a focused NZ startup; our current posture maps to the
                AICPA Trust Services Criteria across {criteria.toLowerCase()}. We will
                book the formal audit once a customer deal genuinely calls for it. For
                New Zealand buyers, the Privacy Act 2020 carries more weight in the
                meantime.
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--text-secondary)]">
                Worth knowing how SOC 2 actually works: a Type 1 report says that, on
                one day, the controls were designed appropriately. It does not say they
                worked over time — a Type 2 says that. So a single Type 1 tick is a
                narrower claim than it sounds. The per-output evidence pack above gives
                your auditor something a company-level report cannot: a verifiable
                record of the actual decision.
              </p>
            </div>
          </SectionReveal>

          {/* 3 — Security pack CTA */}
          <SectionReveal delay={0.2}>
            <div className="mt-16 border-t border-[rgba(157,140,125,0.22)] pt-10">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
                03 · For procurement teams
              </p>
              <h2 className="mt-4 font-display text-3xl font-light text-[color:var(--text-primary)] md:text-4xl">
                Ask for the security pack.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--text-secondary)]">
                If you need specifics before signing, we share a security pack under
                NDA: a control summary, our architecture posture, the sub-processor
                list, and a data flow diagram. It is specific, signed, and honest about
                what is in place today.
              </p>

              <div className="mt-8 flex flex-col gap-4 border border-[color:var(--assembl-pounamu)] bg-[rgba(58,56,50,0.06)] p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-display text-xl font-light text-[color:var(--text-primary)]">
                    Request the security pack
                  </h3>
                  <p className="mt-1 text-sm leading-7 text-[color:var(--text-secondary)]">
                    Shared under NDA. We reply from {soc2Status.securityContact}.
                  </p>
                </div>
                <a
                  href={`mailto:${soc2Status.securityContact}?subject=${encodeURIComponent(
                    "Security pack request",
                  )}&body=${encodeURIComponent(
                    "Kia ora assembl team,\n\nWe are evaluating assembl and would like your security pack under NDA.\n\nCompany:\nName:\nRole:\nWhat we need it for:\n\nNgā mihi,",
                  )}`}
                  className="inline-flex flex-none items-center justify-center rounded-sm bg-[color:var(--assembl-pounamu)] px-6 py-3 text-sm font-medium text-[#FFF7EC] transition-colors hover:bg-[color:var(--assembl-pounamu-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  Email {soc2Status.securityContact}
                </a>
              </div>
            </div>
          </SectionReveal>

          {/* Footer cross-links */}
          <SectionReveal delay={0.25}>
            <p className="mt-14 text-sm leading-7 text-[color:var(--text-secondary)]">
              Related:{" "}
              <Link className="underline-offset-2 hover:underline" href="/legal/privacy">
                Privacy Statement
              </Link>{" "}
              ·{" "}
              <Link className="underline-offset-2 hover:underline" href="/ai-use">
                AI use disclosure
              </Link>{" "}
              ·{" "}
              <Link className="underline-offset-2 hover:underline" href="/evidence-pack">
                Evidence pack
              </Link>
              . General queries:{" "}
              <a className="underline-offset-2 hover:underline" href="mailto:assembl@assembl.co.nz">
                assembl@assembl.co.nz
              </a>
              .
            </p>
          </SectionReveal>
        </div>
      </section>
    </main>
  );
}
