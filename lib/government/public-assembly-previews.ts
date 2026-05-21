import { ENTITLEMENT_NAVIGATOR } from "./entitlement-navigator-agent";

export type PublicAssemblyPreview = {
  slug: string;
  name: string;
  subtitle: string;
  agency: string;
  oneLiner: string;
  statutoryBasis: string[];
  humanApprover: string;
  tools: string[];
  sampleEvidencePack: Record<string, unknown>;
  procurementFaq: { q: string; a: string }[];
};

export const PUBLIC_ASSEMBLY_PREVIEWS: PublicAssemblyPreview[] = [
  {
    slug: ENTITLEMENT_NAVIGATOR.slug,
    name: ENTITLEMENT_NAVIGATOR.name,
    subtitle: ENTITLEMENT_NAVIGATOR.subtitle ?? "Manaakitanga",
    agency: "Ministry of Social Development",
    oneLiner: ENTITLEMENT_NAVIGATOR.oneLiner,
    statutoryBasis: ENTITLEMENT_NAVIGATOR.statutoryBasis,
    humanApprover: ENTITLEMENT_NAVIGATOR.humanApprover,
    tools: [
      "kahu.mask_pii",
      "pco.legislation.retrieve",
      "msd.entitlement.eligibility_check",
      "evidence.pack.compose",
    ],
    sampleEvidencePack: {
      status: "pending_approval",
      caseRef: "MSD-CASE-REDACTED",
      reviewerRole: ENTITLEMENT_NAVIGATOR.humanApprover,
      citations: ["Social Security Act 2018", "Privacy Act 2020 IPP 3, 5, 8, 11"],
      draftOnly: true,
    },
    procurementFaq: [
      {
        q: "Does it make an entitlement decision?",
        a: "No. It drafts candidate checks and handoff notes. An MSD case manager reviews and signs.",
      },
      {
        q: "How is personal information protected?",
        a: "Kahu masks PII before retrieval or model use, and the evidence pack records what was used.",
      },
    ],
  },
  {
    slug: "tax-navigator",
    name: "Tax Navigator",
    subtitle: "Kaitiakitanga",
    agency: "Inland Revenue",
    oneLiner:
      "Drafts taxpayer-facing explanations, payment-plan triage notes, and source-backed tax guidance for human review.",
    statutoryBasis: [
      "Tax Administration Act 1994",
      "Goods and Services Tax Act 1985",
      "Privacy Act 2020 IPP 3, 5, 8, 11",
    ],
    humanApprover: "ird_case_officer",
    tools: [
      "kahu.mask_pii",
      "pco.legislation.retrieve",
      "ird.tax_context.summarise",
      "evidence.pack.compose",
    ],
    sampleEvidencePack: {
      status: "pending_approval",
      taxpayerRef: "IRD-REDACTED",
      reviewerRole: "ird_case_officer",
      citations: ["Tax Administration Act 1994", "Privacy Act 2020"],
      draftOnly: true,
    },
    procurementFaq: [
      {
        q: "Does it issue binding tax advice?",
        a: "No. It prepares a draft explanation and citation pack for an Inland Revenue officer to approve.",
      },
      {
        q: "Can it connect to live taxpayer systems?",
        a: "Only through an agency-approved gateway, with PII masking and audit logging preserved.",
      },
    ],
  },
  {
    slug: "study-navigator",
    name: "Study Navigator",
    subtitle: "Ako",
    agency: "Ministry of Education / StudyLink",
    oneLiner:
      "Turns student-support rules into plain-language draft guidance, evidence requests, and next-step checklists.",
    statutoryBasis: [
      "Education and Training Act 2020",
      "Student Allowances Regulations 1998",
      "Privacy Act 2020 IPP 3, 5, 8, 11",
    ],
    humanApprover: "student_support_officer",
    tools: [
      "kahu.mask_pii",
      "pco.legislation.retrieve",
      "study.eligibility_context.check",
      "evidence.pack.compose",
    ],
    sampleEvidencePack: {
      status: "pending_approval",
      studentRef: "STUDENT-REDACTED",
      reviewerRole: "student_support_officer",
      citations: ["Education and Training Act 2020", "Privacy Act 2020"],
      draftOnly: true,
    },
    procurementFaq: [
      {
        q: "Does it approve support?",
        a: "No. It drafts support-pathway explanations and evidence requests for a named reviewer.",
      },
      {
        q: "What is the care posture?",
        a: "Youth and student data is treated as sensitive, minimised, and review-gated.",
      },
    ],
  },
  {
    slug: "case-navigator",
    name: "Case Navigator",
    subtitle: "Whanaungatanga",
    agency: "Oranga Tamariki / iwi-led partners",
    oneLiner:
      "Helps prepare care-context notes and whānau handoff drafts where iwi sponsorship and human review are non-negotiable.",
    statutoryBasis: [
      "Oranga Tamariki Act 1989",
      "Children's Act 2014",
      "Privacy Act 2020 IPP 3, 5, 8, 11",
    ],
    humanApprover: "iwi_sponsored_case_reviewer",
    tools: [
      "kahu.mask_pii",
      "pco.legislation.retrieve",
      "case.context.summarise",
      "evidence.pack.compose",
    ],
    sampleEvidencePack: {
      status: "pending_approval",
      caseRef: "OT-CASE-REDACTED",
      reviewerRole: "iwi_sponsored_case_reviewer",
      citations: ["Oranga Tamariki Act 1989", "Privacy Act 2020"],
      iwiSponsorRequired: true,
      draftOnly: true,
    },
    procurementFaq: [
      {
        q: "Can this ship without iwi sponsorship?",
        a: "No. This route exists only as a gated preview until the sponsorship and cultural review gate is complete.",
      },
      {
        q: "Does it make care recommendations?",
        a: "No. It supports documentation and review handoffs only, with the highest care threshold.",
      },
    ],
  },
];

export function getPublicAssemblyPreview(slug: string) {
  return PUBLIC_ASSEMBLY_PREVIEWS.find((preview) => preview.slug === slug);
}

export function isPublicAssemblyDemoEnabled() {
  if (process.env.NEXT_PUBLIC_PUBLIC_ASSEMBLY_DEMO_ENABLED === "true") return true;
  if (process.env.NEXT_PUBLIC_PUBLIC_ASSEMBLY_DEMO_ENABLED === "false") return false;
  return process.env.VERCEL_ENV === "preview";
}
