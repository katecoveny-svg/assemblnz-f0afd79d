/**
 * Public Assembly — Entitlement Navigator agent spec.
 * Spec doc: voyage-government-navigators.md §5.
 *
 * This file is the worked example. A concrete shape an MSD case manager
 * (or an Oranga Tamariki kaimahi, or an IRD officer) could actually run.
 *
 * Lives in lib/government/ on the Assembl repo for now because Pae as a
 * separate entity is still pre-incorporation (voyage-government-
 * navigators.md §8). When Pae is incorporated, this file moves to the
 * Pae repo unchanged; the shape is deliberately portable.
 */

import type { PaeAgent } from './types';

// ─────────────────────────────────────────────────────────────────────────
// The Entitlement Navigator
// ─────────────────────────────────────────────────────────────────────────

export const ENTITLEMENT_NAVIGATOR: PaeAgent = {
  slug: 'entitlement-navigator',
  name: 'Entitlement Navigator',
  subtitle: 'Manaakitanga',
  role: 'MSD frontline entitlement assistant',
  // 'toro' is the closest existing kete (whānau-facing). When Pae spins
  // out, kete schema will gain agency-keyed variants.
  kete: 'toro',

  oneLiner:
    'Continuously scans a beneficiary record for entitlements not currently claimed. Drafts the application. Case manager signs.',

  legislation: [
    'Social Security Act 2018',
    'Children\'s Act 2014',
    'Privacy Act 2020',
    'Public Service Act 2020',
    'Te Tiriti o Waitangi obligations under Public Service Act s 14',
  ],

  capabilities: ['compliance', 'communications', 'planning', 'audit'],

  buyingOptions: {
    subscribe: false,
    perOutput: null,
    perResolution: null,
  },

  // ── Crown-side fields ─────────────────────────────────────────────────

  agency: 'msd',

  statutoryBasis: [
    'Social Security Act 2018 ss 49–64 (entitlement assessment)',
    'Social Security Act 2018 s 339 (information sharing for assistance)',
    'Privacy Act 2020 IPP 3, 5, 8, 11',
  ],

  humanApprover: 'msd_case_manager',

  privacyImpact: {
    sensitiveDataKinds: [
      'income',
      'health-disclosure',
      'household-composition',
      'iwi-affiliation (where consented)',
      'children-in-care',
    ],
    consentModel: 'opt-in-with-revocation',
    retentionMonths: 84, // 7 years aligned with Public Records Act expectations
  },

  dataResidency: 'nz-only',

  certifications: {
    nzism: 'aligned',
    iso27001: 'in-progress',
    soc2: 'planned',
    cloudCodeOfPractice: true,
    meadsTested: true,
    tiritiImpactStatement: 'in-progress',
  },

  timestampAuthority: 'digicert-nz',

  serviceLevel: {
    responseSeconds: 90,
    availabilityNinety: 99.5,
  },

  iwiSponsor: {
    required: true,
    advisorRoles: [
      "kaumātua / kuia advisory seat on the agent's prompt review",
      'iwi data-sovereignty steward (MEADS-aligned)',
      'whānau ora navigator liaison',
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Workflow contract — what the agent actually does, end-to-end
// ─────────────────────────────────────────────────────────────────────────

export type EntitlementTrigger =
  | 'case-manager-opened-record'
  | 'income-changed'
  | 'household-composition-changed'
  | 'legislation-change-affecting-entitlement'
  | 'manual-request';

export interface EntitlementInputs {
  /**
   * MSD case ID. Never a name, never an IRD number, never a NHI. PII is
   * masked by Kahu before this struct is constructed.
   */
  caseRef: string;
  /** Case-manager session id (RealMe / AD federated). */
  caseManagerSessionId: string;
  trigger: EntitlementTrigger;
  /** Snapshot of MSD-held facts, fetched via the agency API gateway. */
  caseSnapshot: {
    currentBenefit: string;
    householdAdults: number;
    childrenInCare: number;
    declaredIncomeWeekly: number;
    accommodationStatus: 'rent' | 'mortgage' | 'board' | 'other';
    disclosedDisabilities: string[];
    /** Date the case was last assessed in YYYY-MM-DD. */
    lastAssessmentAt: string;
  };
}

export interface EntitlementDraft {
  /** Entitlement not currently claimed. */
  entitlement: string;
  /** Plain-language reasoning, cite-anchored. */
  reasoning: string;
  /** Citations into Social Security Act / WFF regulations. */
  citations: { ref: string; clause: string }[];
  /** Draft form letter, ready for case manager to edit and sign. */
  draftLetter: string;
  /** Confidence — for case-manager triage, not gating. */
  confidence: number; // 0–1
  /** Flags requiring case-manager judgement. */
  flags: { severity: 1 | 2 | 3 | 4 | 5; description: string }[];
}

export interface EntitlementOutput {
  caseRef: string;
  drafts: EntitlementDraft[];
  /**
   * One-paragraph plain-language summary the case manager can scan in
   * <30 seconds before deciding whether to drill in.
   */
  summary: string;
  /** Hash-chained reasoning trace id. */
  traceId: string;
  /** Crown-timestamped evidence pack handle. */
  evidencePackHandle: string;
  /** Always 'pending_approval' on return — never 'sealed'. Case manager seals. */
  status: 'pending_approval';
}

// ─────────────────────────────────────────────────────────────────────────
// Prompt and tooling spec — what Iho calls when this agent runs
// ─────────────────────────────────────────────────────────────────────────

export const ENTITLEMENT_NAVIGATOR_SYSTEM_PROMPT = `
You are the Entitlement Navigator. You work alongside an MSD case
manager. You never see un-masked personal information; Kahu has
already redacted PII. You never act without the case manager's
signature.

Your job:
1. Identify entitlements the case may be eligible for but isn't
   currently receiving — Disability Allowance, Temporary Additional
   Support, Best Start, Accommodation Supplement variations, hardship
   grants, Working for Families components.
2. For each candidate entitlement, draft a one-paragraph reasoning
   note that cites the relevant section of the Social Security Act
   2018 and any applicable regulation.
3. Draft the application letter or the case-record entry the case
   manager would need to sign.
4. Flag anything that requires case-manager judgement — disclosures
   that change eligibility, household-composition ambiguities, safety
   concerns. Severity 5 flags pause downstream automation.

You do not:
- Send anything to the beneficiary or to MSD systems directly.
- Make eligibility determinations binding on MSD.
- Disclose any reasoning that includes un-masked PII.

Voice: restrained, second person addressed to the case manager,
specific. Never effusive. Never apologetic. Never "I hope this
helps." Cite, draft, hand over. Pass to Mana for the voice-rewrite
pass before output.

Posture: every draft you produce ends with a named human signing.
That signature is the only thing that makes a draft real.
`.trim();

/**
 * The MCP tools the agent is allowed to call. Each one is mediated by
 * the Mana Trust Layer — Kahu pre-masks, Tā stamps, Mana post-rewrites.
 */
export const ENTITLEMENT_NAVIGATOR_TOOLS = [
  'msd.case.fetch_snapshot',
  'msd.entitlement.eligibility_check',
  'msd.letter.draft',
  'compliance.legislation.recent_changes',
  'evidence.pack.compose',
] as const;

// ─────────────────────────────────────────────────────────────────────────
// What the procurement panel reviewer is going to ask
// ─────────────────────────────────────────────────────────────────────────

export const PROCUREMENT_FAQ = [
  {
    q: 'How do you prevent the agent from making a determination MSD has not authorised?',
    a: 'The agent\'s output is always a draft. status = \'pending_approval\' is the only state it returns in. No downstream MSD system accepts the draft until a named case manager signs it; the signature event is what flips the draft to sealed and records the determination in MSD\'s system of record.',
  },
  {
    q: 'What happens to beneficiary data on your infrastructure?',
    a: 'PII is masked by Kahu before any model is called. The masked tokens are held in NZ-resident infrastructure with separation of concerns enforced at the database level. Beneficiary records are retained for 7 years in line with the Public Records Act 2005; they are never used to train models.',
  },
  {
    q: 'How does this satisfy our Te Tiriti obligations?',
    a: 'Pae is majority Māori-owned; the iwi shareholder appoints two of the five board seats. Every agent prompt is reviewed by a kaumātua advisory panel before deployment. Where the workload touches whānau records, MEADS data-sovereignty steward sign-off is required for the deployment to proceed.',
  },
  {
    q: 'What independent assurance do you carry?',
    a: 'NZISM aligned (certified Q2 2027), ISO 27001:2022 (target Q4 2026), SOC 2 Type II (target Q2 2027). PIAs are completed per agency-deployment under Privacy Commissioner liaison.',
  },
  {
    q: 'What is the exit story if MSD wants to discontinue?',
    a: 'All evidence packs and reasoning traces produced during the engagement are exported in canonical JSON form and delivered as a sealed, hash-chained Crown-timestamped archive. MSD retains the right to use these records indefinitely. Pae destroys its copy 90 days after termination unless statutory retention requires otherwise.',
  },
];
