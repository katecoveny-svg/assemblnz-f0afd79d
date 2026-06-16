/**
 * SOC 2 posture — single source of truth for the public Trust Centre page at
 * /trust/soc2.
 *
 * IMPORTANT — honesty constraint. assembl is a small Aotearoa startup and is
 * NOT SOC 2 Type 1 or Type 2 attested. This file must never assert a
 * certification we do not hold. Edit the flags below as the real position
 * changes; the page copy derives its claims from `soc2Status` so it can only
 * say what these values permit.
 *
 * Flip path as reality changes:
 *   1. Auditor engaged  → set auditorSelected: true + auditorName + engagedMonth
 *   2. Type 1 attested  → set type1Attested: true + type1AttestedDate
 *   3. Type 2 attested  → set type2Attested: true + type2AttestedDate
 */

export interface Soc2Status {
  /** True once a SOC 2 auditor is formally engaged (signed, not just shortlisted). */
  auditorSelected: boolean;
  /** Auditor / platform name, e.g. "Vanta", "Drata". Empty until engaged. */
  auditorName: string;
  /** Human-readable month we expect to (or did) engage the auditor, e.g. "September 2026". */
  engagedMonth: string;
  /** Target SOC 2 Type 1 attestation date (ISO yyyy-mm-dd), or null if not yet scheduled. */
  targetType1Date: string | null;
  /** Target SOC 2 Type 2 attestation date (ISO yyyy-mm-dd), or null if not yet scheduled. */
  targetType2Date: string | null;
  /** True once Type 1 attestation is actually in hand. */
  type1Attested: boolean;
  type1AttestedDate: string | null;
  /** True once Type 2 attestation is actually in hand. */
  type2Attested: boolean;
  type2AttestedDate: string | null;
  /** Trust Services Criteria in scope for the planned/held attestation. */
  criteriaScope: readonly string[];
  /** Where to send security-pack requests. */
  securityContact: string;
}

/**
 * Current honest position (17 June 2026, confirmed by Kate): SOC 2 is on the
 * roadmap, not underway. We are a focused NZ startup with no auditor engaged
 * and no committed audit dates — and we will not pretend otherwise. The page
 * therefore LEADS with what is true and verifiable today — the Privacy Act 2020
 * / IPP 3A posture, Sydney (ap-southeast-2) data residency, Te Tiriti-shaped
 * prompt design, and the per-output evidence pack — and treats SOC 2 as a
 * smaller, honest "on the roadmap" section.
 *
 * Kate: when a real customer deal blocks on SOC 2, update the flags below and
 * the page upgrades its language automatically. The PR description carries the
 * "how to actually get SOC 2 when ready" path.
 */
export const soc2Status: Soc2Status = {
  // No auditor engaged. No committed dates. Roadmap posture by design.
  auditorSelected: false,
  auditorName: "",
  engagedMonth: "",
  targetType1Date: null,
  targetType2Date: null,
  type1Attested: false,
  type1AttestedDate: null,
  type2Attested: false,
  type2AttestedDate: null,
  // Our practice maps to all four relevant Trust Services Criteria, even though
  // the formal audit has not started.
  criteriaScope: ["Security", "Availability", "Confidentiality", "Privacy"],
  securityContact: "security@assembl.co.nz",
};

export type Soc2Posture = "roadmap" | "controls-aligned" | "audit-planned" | "type1" | "type2";

/**
 * Derive the single posture the page should present from the status flags.
 * Ordered most-attested first so the strongest true statement wins.
 */
export function deriveSoc2Posture(status: Soc2Status = soc2Status): Soc2Posture {
  if (status.type2Attested) return "type2";
  if (status.type1Attested) return "type1";
  if (status.auditorSelected && status.targetType1Date) return "audit-planned";
  // Only claim "controls-aligned, audit in planning" once there is a real
  // target date on the board. Mapping controls to the TSC on paper is not the
  // same as having an audit in motion — without a date, the honest posture is
  // "on the roadmap".
  if (status.targetType1Date) return "controls-aligned";
  return "roadmap";
}

/** One-line headline status string, derived and honest by construction. */
export function soc2HeadlineStatus(status: Soc2Status = soc2Status): string {
  const posture = deriveSoc2Posture(status);
  switch (posture) {
    case "type2":
      return "SOC 2 Type 2 attested.";
    case "type1":
      return "SOC 2 Type 1 attested.";
    case "audit-planned":
      return `SOC 2 — Type 1 audit underway with ${status.auditorName || "our auditor"}.`;
    case "controls-aligned":
      return "SOC 2 — controls aligned to the AICPA Trust Services Criteria; formal audit in planning.";
    case "roadmap":
    default:
      return "SOC 2 — on the roadmap. Our security posture is documented and verifiable today.";
  }
}

/** Format an ISO date for NZ-style display, e.g. "Q3 2026" callers can also just use the raw month. */
export function formatNzDate(iso: string | null): string | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${d} ${months[m - 1]} ${y}`;
}
