import type { Metadata } from "next";
import Link from "next/link";
import { SectionReveal } from "@/components/SectionReveal";
import {
  soc2Status,
  soc2HeadlineStatus,
  formatNzDate,
} from "@/lib/trust-centre/soc2-status";

export const metadata: Metadata = {
  title: "SOC 2 posture | assembl",
  description:
    "Honest, public status of assembl's SOC 2 journey: where we are today, where we are heading, and the security pack we share under NDA while the formal audit is in motion.",
};

const headline = soc2HeadlineStatus(soc2Status);
const type1Target = formatNzDate(soc2Status.targetType1Date);
const type2Target = formatNzDate(soc2Status.targetType2Date);

// What is true and verifiable today — this is where assembl is genuinely strong.
const todayProofPoints = [
  {
    title: "New Zealand data residency",
    body: "Customer records sit in tenant-scoped systems with row-level security, encrypted in transit and at rest, with restricted service credentials and audit logging on every access.",
  },
  {
    title: "Privacy Act 2020, including IPP 3A",
    body: "We are built to the Privacy Act 2020. Where personal information arrives indirectly, our workflows let a named human record the source, purpose, and notice — the new IPP 3A obligation in force from 1 May 2026.",
  },
  {
    title: "Draft-only by design",
    body: "No external action is sent automatically. Every material output stays a draft until a named human reviews and approves it. Autonomy is not the promise; a reviewed first pass is.",
  },
  {
    title: "An evidence pack on every output",
    body: "Each workflow ends in an evidence pack — a downloadable bundle of sources, assumptions, reviewer decisions, and timestamps you can hand to an auditor or a client.",
  },
];

// The 4-week readiness sprint that precedes the Type 1 window.
const readinessSteps = [
  {
    label: "Week 1 · Control mapping",
    body: "Map our existing architecture — tenant isolation, row-level security, founder gating, draft-only autonomy, audit logs — against the AICPA Trust Services Criteria.",
  },
  {
    label: "Week 2 · Evidence automation",
    body: "Wire evidence collection into the audit logs we already keep, so proof is continuous rather than scrambled together at audit time.",
  },
  {
    label: "Week 3 · Gap remediation",
    body: "Write down, as plain one-pagers, every control that today lives as practice but not yet as a documented policy.",
  },
  {
    label: "Week 4 · Auditor pre-review",
    body: "Walk the mapped controls and evidence through the auditor ahead of the formal point-in-time test.",
  },
];

// Honest current-state line for the "where we are" section, derived from config.
function currentStateLine() {
  if (soc2Status.type2Attested) {
    return "assembl holds a SOC 2 Type 2 attestation covering operating effectiveness over time.";
  }
  if (soc2Status.type1Attested) {
    return "assembl holds a SOC 2 Type 1 attestation. Our Type 2 window — testing the controls over time — follows next.";
  }
  if (soc2Status.auditorSelected) {
    return `assembl is pre-attestation. We have engaged ${soc2Status.auditorName || "our auditor"} for SOC 2 Type 1 and the readiness work is underway.`;
  }
  return "assembl is pre-attestation. We have not completed a SOC 2 audit, and we will not say otherwise. What we have is a documented security posture, real controls in production, and a plan to put them through a formal SOC 2 audit.";
}

export default function Soc2PosturePage() {
  return (
    <main className="bg-[color:var(--assembl-paper)]">
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-4xl">
          {/* Hero */}
          <SectionReveal>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
              Trust Centre · SOC 2
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-[clamp(3rem,7vw,6rem)] font-light leading-[0.92] text-[color:var(--text-primary)]">
              SOC 2, honestly.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[color:var(--text-secondary)]">
              {headline} We would rather tell you exactly where we are than imply a
              certificate we do not hold. Here is the real position — today, the
              target, and what we can put in front of your procurement team right now.
            </p>
          </SectionReveal>

          {/* Status summary strip — derived from config so it can only state what is true. */}
          <SectionReveal delay={0.1}>
            <dl className="mt-12 grid gap-px overflow-hidden rounded-sm border border-[rgba(157,140,125,0.22)] bg-[rgba(157,140,125,0.22)] sm:grid-cols-3">
              <div className="bg-[color:var(--assembl-paper)] p-5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
                  Current state
                </dt>
                <dd className="mt-2 text-base font-light text-[color:var(--text-primary)]">
                  Pre-attestation
                </dd>
              </div>
              <div className="bg-[color:var(--assembl-paper)] p-5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
                  Type 1 target
                </dt>
                <dd className="mt-2 text-base font-light text-[color:var(--text-primary)]">
                  {type1Target ?? "In planning"}
                </dd>
              </div>
              <div className="bg-[color:var(--assembl-paper)] p-5">
                <dt className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--text-secondary)]">
                  Type 2 target
                </dt>
                <dd className="mt-2 text-base font-light text-[color:var(--text-primary)]">
                  {type2Target ?? "Follows Type 1"}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-6 text-[color:var(--text-secondary)]">
              Dates shown are targets, not commitments or attestations. We will update
              this page the day each milestone is real.
            </p>
          </SectionReveal>

          {/* 1 — Where we are today */}
          <SectionReveal delay={0.15}>
            <div className="mt-16 border-t border-[rgba(157,140,125,0.22)] pt-10">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
                01 · Where we are today
              </p>
              <h2 className="mt-4 font-display text-3xl font-light text-[color:var(--text-primary)] md:text-4xl">
                Pre-attestation, and plain about it.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--text-secondary)]">
                {currentStateLine()}
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {todayProofPoints.map((point) => (
                  <div
                    key={point.title}
                    className="border border-[rgba(157,140,125,0.22)] bg-[rgba(255,255,255,0.45)] p-5"
                  >
                    <h3 className="font-display text-xl font-light text-[color:var(--text-primary)]">
                      {point.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--text-secondary)]">
                      {point.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>

          {/* 2 — Where we will be */}
          <SectionReveal delay={0.2}>
            <div className="mt-16 border-t border-[rgba(157,140,125,0.22)] pt-10">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
                02 · Where we are heading
              </p>
              <h2 className="mt-4 font-display text-3xl font-light text-[color:var(--text-primary)] md:text-4xl">
                Type 1, then Type 2.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--text-secondary)]">
                Our controls are mapped to the AICPA Trust Services Criteria, with{" "}
                <strong className="font-medium text-[color:var(--text-primary)]">
                  {soc2Status.criteriaScope.join(", ")}
                </strong>{" "}
                as the attestation scope. We are selecting a SOC 2 auditor and running a
                four-week readiness sprint before the formal point-in-time test
                {type1Target ? `, targeting Type 1 by ${type1Target}` : ""}. Type 2 —
                which tests that the controls actually held over a window of time
                {type2Target ? `, targeted for ${type2Target}` : ""} — follows from
                there.
              </p>
              <ol className="mt-8 grid gap-4 md:grid-cols-2">
                {readinessSteps.map((step) => (
                  <li
                    key={step.label}
                    className="border-l-2 border-[color:var(--assembl-pounamu)] bg-[rgba(43,107,87,0.05)] p-5"
                  >
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--assembl-pounamu)]">
                      {step.label}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--text-secondary)]">
                      {step.body}
                    </p>
                  </li>
                ))}
              </ol>
              <div className="mt-8 border border-[rgba(157,140,125,0.22)] bg-[rgba(255,255,255,0.45)] p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
                  Why the trajectory matters
                </p>
                <p className="mt-3 text-base leading-8 text-[color:var(--text-secondary)]">
                  A SOC 2 Type 1 says that, on one day, the controls were designed
                  appropriately. It does not say they worked over time — Type 2 says
                  that. We are honest about being pre-attestation now, with Type 1 and
                  Type 2 in sequence, rather than resting on a single point-in-time tick.
                </p>
              </div>
            </div>
          </SectionReveal>

          {/* 3 — Bridge artefact */}
          <SectionReveal delay={0.25}>
            <div className="mt-16 border-t border-[rgba(157,140,125,0.22)] pt-10">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
                03 · While we get there
              </p>
              <h2 className="mt-4 font-display text-3xl font-light text-[color:var(--text-primary)] md:text-4xl">
                Ask for the security pack.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--text-secondary)]">
                For procurement teams that need to see specifics before the formal
                attestation lands, we share a security pack under NDA: a control
                summary, our architecture posture, the sub-processor list, and a data
                flow diagram. It is specific, signed, and honest about what is in place
                today.
              </p>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[color:var(--text-secondary)]">
                It also carries something a company-level audit cannot: every output
                assembl produces ends in an evidence pack — a downloadable, signed
                record of the sources, decisions, and timestamps behind that specific
                result. SOC 2 attests the company; the evidence pack lets your auditor
                check the actual decision.{" "}
                <span className="text-[color:var(--text-secondary)]">
                  (Under the hood we call this a Mana Receipt — Ed25519-signed and
                  tamper-evident — but you do not need the jargon to use it.)
                </span>
              </p>

              <div className="mt-8 flex flex-col gap-4 border border-[color:var(--assembl-pounamu)] bg-[rgba(43,107,87,0.06)] p-6 sm:flex-row sm:items-center sm:justify-between">
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
                    "Security pack request — SOC 2",
                  )}&body=${encodeURIComponent(
                    "Kia ora assembl team,\n\nWe are evaluating assembl and would like your security pack under NDA.\n\nCompany:\nName:\nRole:\nWhat we need it for:\n\nNgā mihi,",
                  )}`}
                  className="inline-flex flex-none items-center justify-center rounded-sm bg-[color:var(--assembl-pounamu)] px-6 py-3 text-sm font-medium text-[#FAF7F2] transition-colors hover:bg-[color:var(--assembl-pounamu-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2"
                >
                  Email {soc2Status.securityContact}
                </a>
              </div>
            </div>
          </SectionReveal>

          {/* Footer cross-links */}
          <SectionReveal delay={0.3}>
            <p className="mt-14 text-sm leading-7 text-[color:var(--text-secondary)]">
              More on how we handle your data:{" "}
              <Link className="underline-offset-2 hover:underline" href="/privacy">
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
