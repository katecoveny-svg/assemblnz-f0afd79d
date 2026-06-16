/**
 * Single source of truth for the Trust Centre (/trust).
 *
 * Sub-processors, posture statements, and the change log all live here so the
 * page renders live data and the figures can never drift between sections.
 *
 * UPDATE WORKFLOW: this list is reviewed weekly. When a sub-processor is added,
 * removed, or changes purpose, edit this file, append a CHANGE_LOG entry, and
 * bump LAST_UPDATED. The version stamp on the page is driven from here.
 *
 * HONESTY RULE: never claim an attestation we do not hold. Anything not yet
 * certified is marked status: "in-progress" or "planned" with a target, not
 * dressed up as "compliant". See COMPLIANCE_POSTURE below.
 */

/** ISO date (YYYY-MM-DD) the Trust Centre data was last reviewed. */
export const LAST_UPDATED = "2026-06-17";

/** Human-readable version stamp shown on the page. */
export const TRUST_CENTRE_VERSION = "v1.0";

export type DataClass =
  | "workflow-content" // customer inputs / generated drafts (may contain PII)
  | "account-metadata" // names, emails, org, billing status
  | "operational-logs"; // security + audit telemetry

export interface SubProcessor {
  name: string;
  /** Where the service processes data, in plain English. */
  country: string;
  /** What it does for assembl, one line. */
  purpose: string;
  /** Which class of customer data it can touch. */
  dataClasses: DataClass[];
  /**
   * True only when masked PII can reach this processor. The Mana Trust Layer
   * masks personal information before any third-party model call, so model
   * vendors receive masked content rather than raw PII.
   */
  receivesMaskedPiiOnly: boolean;
  /** Link to the processor's DPA / data-protection terms. */
  dpaUrl: string;
}

/**
 * Every third party that can touch customer data. Derived from the live
 * vendor disclosure in app/privacy/page.tsx — keep the two in sync.
 */
export const SUB_PROCESSORS: SubProcessor[] = [
  {
    name: "Anthropic (Claude)",
    country: "United States",
    purpose: "Primary model inference for draft generation.",
    dataClasses: ["workflow-content"],
    receivesMaskedPiiOnly: true,
    dpaUrl: "https://www.anthropic.com/legal/commercial-terms",
  },
  {
    name: "Google (Gemini)",
    country: "United States",
    purpose: "Model inference for selected workflows.",
    dataClasses: ["workflow-content"],
    receivesMaskedPiiOnly: true,
    dpaUrl: "https://cloud.google.com/terms/data-processing-addendum",
  },
  {
    name: "OpenAI",
    country: "United States",
    purpose: "Model inference for selected workflows.",
    dataClasses: ["workflow-content"],
    receivesMaskedPiiOnly: true,
    dpaUrl: "https://openai.com/policies/data-processing-addendum",
  },
  {
    name: "Supabase",
    country: "Australia (Sydney) — NZ-resident option in progress",
    purpose: "Primary database, authentication, and file storage. Row-level security per tenant.",
    dataClasses: ["workflow-content", "account-metadata", "operational-logs"],
    receivesMaskedPiiOnly: false,
    dpaUrl: "https://supabase.com/legal/dpa",
  },
  {
    name: "Vercel",
    country: "United States / global edge",
    purpose: "Application hosting and content delivery.",
    dataClasses: ["operational-logs"],
    receivesMaskedPiiOnly: false,
    dpaUrl: "https://vercel.com/legal/dpa",
  },
  {
    name: "Stripe",
    country: "United States",
    purpose: "Billing and payment processing.",
    dataClasses: ["account-metadata"],
    receivesMaskedPiiOnly: false,
    dpaUrl: "https://stripe.com/legal/dpa",
  },
  {
    name: "Twilio",
    country: "United States",
    purpose: "Transactional SMS and notifications.",
    dataClasses: ["account-metadata"],
    receivesMaskedPiiOnly: false,
    dpaUrl: "https://www.twilio.com/legal/data-protection-addendum",
  },
];

export const DATA_CLASS_LABELS: Record<DataClass, string> = {
  "workflow-content": "Workflow content",
  "account-metadata": "Account metadata",
  "operational-logs": "Operational logs",
};

export type PostureStatus = "live" | "in-progress" | "planned";

export interface CompliancePosture {
  framework: string;
  status: PostureStatus;
  /** Plain-English current state. No aspiration dressed up as fact. */
  detail: string;
  /** Auditor + target where a certification is underway or planned. */
  target?: string;
}

/**
 * Current compliance posture — current state, not aspirational.
 *
 * ⚠️ INFRA / FOUNDER SIGN-OFF REQUIRED before this goes live at
 * trust.assembl.co.nz. These statuses reflect an emerging platform and are
 * written to be honest, not impressive. Confirm each line with Kate Hudson
 * and infra, and fill in the auditor + target date for any certification
 * that is actually underway.
 */
export const COMPLIANCE_POSTURE: CompliancePosture[] = [
  {
    framework: "Privacy Act 2020 (NZ)",
    status: "live",
    detail:
      "This is the law your data actually lives under. We run to the Privacy Act 2020, including the new IPP 3A rules from 1 May 2026. Our Privacy Statement spells out what we collect and how to complain.",
  },
  {
    framework: "NZISM alignment",
    status: "in-progress",
    detail:
      "We line our controls up against the NZ Information Security Manual. It is our own honest read, not a government tick.",
  },
  {
    framework: "SOC 2 Type 1",
    status: "planned",
    detail:
      "Not done yet, and we won't pretend otherwise. We are scoping a SOC 2 Type 1 readiness check. The moment we engage an auditor, their name and the date land right here.",
    target: "Auditor and date: coming.",
  },
  {
    framework: "ISO 27001",
    status: "planned",
    detail:
      "Not certified. It is next after SOC 2. We won't claim it until an auditor has signed off — full stop.",
    target: "Lined up after SOC 2.",
  },
];

export interface ChangeLogEntry {
  date: string; // ISO date
  summary: string;
}

/**
 * Sub-processor change log — last 12 months. An empty-ish log is fine; the
 * existence of the log is itself the trust signal. Prepend new entries.
 */
export const CHANGE_LOG: ChangeLogEntry[] = [
  {
    date: "2026-06-17",
    summary: "First publication of this Trust Centre and the sub-processor list.",
  },
];

export const POSTURE_LABELS: Record<PostureStatus, string> = {
  live: "Live",
  "in-progress": "In progress",
  planned: "Planned",
};
