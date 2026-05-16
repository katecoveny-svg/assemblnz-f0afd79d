import type { KeteSlug } from '@/lib/kete';

export type AssemblLayer = {
  key: 'kahu' | 'iho' | 'ta' | 'mahara' | 'mana';
  label: string;
  role: string;
  evidence: string;
};

export type WorkflowStarter = {
  id: string;
  title: string;
  outcome: string;
  clientUse: string;
  starterPrompt: string;
  agentSequence: string[];
  reviewerRole: string;
  evidencePack: string;
  citations: string[];
};

export const ASSEMBL_LAYERS: AssemblLayer[] = [
  {
    key: 'kahu',
    label: 'Kahu',
    role: 'Capture intent, risk, and data sensitivity before drafting.',
    evidence: 'Input brief, masked PII, scope boundary',
  },
  {
    key: 'iho',
    label: 'Iho',
    role: 'Route the work to the right specialist and handoff partners.',
    evidence: 'Agent choice, collaborator notes, workflow path',
  },
  {
    key: 'ta',
    label: 'Tā',
    role: 'Execute the draft, checklist, comparison, or client-ready artefact.',
    evidence: 'Draft output, assumptions, source trail',
  },
  {
    key: 'mahara',
    label: 'Mahara',
    role: 'Remember accepted decisions, reviewer preferences, and open risks.',
    evidence: 'Decision log, prior context, follow-up signals',
  },
  {
    key: 'mana',
    label: 'Mana',
    role: 'Hold the final human-review gate before anything leaves assembl.',
    evidence: 'Named reviewer, approval status, evidence pack seal',
  },
];

export const WORKFLOW_STARTERS: Record<KeteSlug, WorkflowStarter[]> = {
  waihanga: [
    {
      id: 'consent-precheck',
      title: 'Building consent precheck',
      outcome: 'BCA-ready precheck with missing evidence, producer statements, and code clauses surfaced.',
      clientUse: 'Send a client the consent-risk picture before lodgement.',
      starterPrompt:
        'Run a building consent precheck. Ask me for project type, council, drawing status, producer statements, scope exclusions, known RFIs, and target lodgement date. Return a BCA-ready evidence checklist, risk register, reviewer questions, and the evidence pack outline.',
      agentSequence: ['Kaupapa', 'Whakaaē', 'Ata', 'Rawa', 'Pai'],
      reviewerRole: 'Project manager or LBP reviewer',
      evidencePack: 'Consent precheck pack',
      citations: ['Building Act 2004', 'NZ Building Code', 'Acceptable Solutions', 'Building Product Specifications 2025'],
    },
    {
      id: 'variation-pack',
      title: 'NZS 3910 variation pack',
      outcome: 'Variation summary with time, cost, evidence, and contract notices lined up.',
      clientUse: 'Explain a variation clearly before it becomes a dispute.',
      starterPrompt:
        'Prepare an NZS 3910 variation pack. Ask for the original scope, change instruction, dates, cost build-up, delay impact, photos or documents held, and who must approve. Return the client-facing variation note, risk points, and evidence pack contents.',
      agentSequence: ['Kaupapa', 'Rawa', 'Pai', 'Signal'],
      reviewerRole: 'Commercial manager',
      evidencePack: 'Variation evidence pack',
      citations: ['Construction Contracts Act 2002', 'NZS 3910:2013', 'Fair Trading Act 1986'],
    },
  ],
  manaaki: [
    {
      id: 'fcp-verification',
      title: 'Food Control Plan verification',
      outcome: 'MPI/verifier-ready FCP diary, corrective actions, and staff follow-ups.',
      clientUse: 'Show an owner what must be fixed before the verifier arrives.',
      starterPrompt:
        'Run a Food Control Plan verification prep workflow. Ask for venue type, FCP template, last verifier findings, diary gaps, menu changes, allergen risks, temperature records, and due date. Return a verifier-ready checklist, corrective action draft, and evidence pack outline.',
      agentSequence: ['Kai', 'Hau', 'Mahi', 'Pai'],
      reviewerRole: 'Venue manager or food safety verifier',
      evidencePack: 'FCP verification pack',
      citations: ['Food Act 2014', 'MPI Food Control Plan guidance', 'Health and Safety at Work Act 2015'],
    },
    {
      id: 'licence-renewal',
      title: 'Alcohol licence renewal',
      outcome: 'Renewal pack with host responsibility, duty manager, and incident records aligned.',
      clientUse: 'Give a venue a clear DLC-ready renewal plan.',
      starterPrompt:
        'Prepare an alcohol licence renewal workflow. Ask for licence type, expiry date, DLC, duty managers, training records, host responsibility logs, incidents, noise complaints, and floor plan changes. Return renewal risks, missing evidence, draft client note, and evidence pack contents.',
      agentSequence: ['Aura', 'Hau', 'Mahi', 'Pūtea'],
      reviewerRole: 'Licensee or duty manager',
      evidencePack: 'Licence renewal pack',
      citations: ['Sale and Supply of Alcohol Act 2012', 'DLC guidance', 'Privacy Act 2020'],
    },
  ],
  pikau: [
    {
      id: 'tariff-duty',
      title: 'Tariff classification + duty check',
      outcome: 'Broker-ready HS code rationale, duty view, and origin questions.',
      clientUse: 'Send an importer the classification working before clearance.',
      starterPrompt:
        'Run a tariff classification and duty check. Ask for product description, materials, use, country of origin, value, Incoterms, supplier documents, prior rulings, and urgency. Return likely HS heading options, duty/GST considerations, origin evidence needed, broker questions, and evidence pack outline.',
      agentSequence: ['Gateway', 'Pīkau', 'Transit-Freight', 'Biosecurity'],
      reviewerRole: 'Licensed customs broker or authorised declarant',
      evidencePack: 'Tariff classification record',
      citations: ['Customs and Excise Act 2018', 'NZ Working Tariff Document', 'WCO HS Explanatory Notes'],
    },
    {
      id: 'mpi-ihs',
      title: 'MPI IHS declaration prep',
      outcome: 'Biosecurity declaration path with treatment evidence and release risks.',
      clientUse: 'Brief a client on what MPI will need before goods arrive.',
      starterPrompt:
        'Prepare an MPI Import Health Standard declaration workflow. Ask for commodity, origin, treatment certificates, packaging material, container status, arrival port, and documents held. Return IHS pathway, missing evidence, quarantine risks, and release checklist.',
      agentSequence: ['Biosecurity', 'Gateway', 'Transit', 'Pīkau'],
      reviewerRole: 'Customs broker or MPI compliance lead',
      evidencePack: 'Biosecurity release pack',
      citations: ['Biosecurity Act 1993', 'MPI Import Health Standards', 'Customs and Excise Act 2018'],
    },
  ],
  arataki: [
    {
      id: 'fleet-compliance',
      title: 'Fleet compliance register',
      outcome: 'WoF/CoF, RUC, driver endorsement, and incident evidence in one register.',
      clientUse: 'Send a fleet owner the vehicles and drivers that need attention first.',
      starterPrompt:
        'Build a fleet compliance register workflow. Ask for fleet size, vehicle classes, WoF/CoF dates, RUC status, driver licences, endorsements, incident history, and service cadence. Return priority risks, next actions, reviewer questions, and evidence pack outline.',
      agentSequence: ['Motor', 'Whare', 'RUC', 'Driver Hours', 'Signal'],
      reviewerRole: 'Fleet manager',
      evidencePack: 'Fleet compliance pack',
      citations: ['Land Transport Act 1998', 'Land Transport Rules', 'Health and Safety at Work Act 2015'],
    },
    {
      id: 'dealer-cga',
      title: 'Dealer warranty + CGA response',
      outcome: 'Customer response with remedy options and evidence trail.',
      clientUse: 'Help a dealer respond without inflaming the dispute.',
      starterPrompt:
        'Prepare a dealer warranty and Consumer Guarantees Act response. Ask for sale date, vehicle details, fault report, warranty terms, inspection notes, customer request, prior communications, and preferred remedy. Return a balanced draft response, risk assessment, and evidence pack contents.',
      agentSequence: ['Warranty', 'Whaikōrero', 'Motor', 'Signal'],
      reviewerRole: 'Dealer principal or service manager',
      evidencePack: 'CGA remedy record',
      citations: ['Consumer Guarantees Act 1993', 'Fair Trading Act 1986', 'Motor Vehicle Sales Act 2003'],
    },
  ],
  auaha: [
    {
      id: 'claims-review',
      title: 'Campaign claims review',
      outcome: 'Channel-ready creative with substantiated claims and legal watchpoints.',
      clientUse: 'Share a campaign pack that shows why claims are safe to run.',
      starterPrompt:
        'Run a campaign claims review. Ask for product/service, target audience, channels, draft claims, evidence held, testimonials, comparative statements, and launch date. Return claim-by-claim risk, safer wording, substantiation gaps, and evidence pack outline.',
      agentSequence: ['Prism', 'Muse', 'Rights', 'Campaign Claims', 'Brand Ledger'],
      reviewerRole: 'Account director or legal reviewer',
      evidencePack: 'Claims substantiation pack',
      citations: ['Fair Trading Act 1986', 'ASA Code of Ethics', 'Copyright Act 1994'],
    },
    {
      id: 'brand-asset-brief',
      title: 'Brand asset production brief',
      outcome: 'House-voice creative brief with asset list, review gates, and delivery specs.',
      clientUse: 'Send a clean creative production brief to a client or studio.',
      starterPrompt:
        'Create a brand asset production workflow. Ask for offer, audience, brand voice, channels, required formats, existing assets, cultural references, approvals, and due date. Return the creative brief, asset list, review gates, and evidence pack contents.',
      agentSequence: ['Prism', 'Vessel Studio', 'Muse', 'Saffron'],
      reviewerRole: 'Creative director',
      evidencePack: 'Brand production pack',
      citations: ['Copyright Act 1994', 'Fair Trading Act 1986', 'ASA Code of Ethics'],
    },
  ],
  ako: [
    {
      id: 'ero-self-review',
      title: 'ERO self-review pack',
      outcome: 'ECE self-review record with licensing, safety, whānau voice, and evidence gaps.',
      clientUse: 'Show a centre what is ready and what needs review before ERO.',
      starterPrompt:
        'Prepare an ECE ERO self-review workflow. Ask for service type, licence conditions, recent incidents, ratios, kaiako qualifications, whānau feedback, learning records, and review date. Return evidence gaps, reviewer questions, draft self-review structure, and evidence pack outline.',
      agentSequence: ['Ako-Licence', 'ERO-Pack', 'Tamariki', 'Aroha'],
      reviewerRole: 'Centre manager or governance lead',
      evidencePack: 'ECE self-review pack',
      citations: ['Education and Training Act 2020', 'Education (ECE Services) Regulations 2008', "Children's Act 2014"],
    },
    {
      id: 'safety-checks',
      title: "Children's Act safety-check record",
      outcome: 'Staff safety-check tracker with missing evidence and escalation notes.',
      clientUse: 'Help a centre prove the staff file is complete.',
      starterPrompt:
        "Build a Children's Act safety-check workflow. Ask for staff list, roles, police vet dates, identity checks, referee checks, risk assessments, expiry dates, and any gaps. Return a tracker, missing evidence list, escalation notes, and evidence pack contents.",
      agentSequence: ['Tamariki', 'Ako-Licence', 'Signal'],
      reviewerRole: 'Centre manager',
      evidencePack: 'Safety-check pack',
      citations: ["Children's Act 2014", 'Privacy Act 2020', 'Education (ECE Services) Regulations 2008'],
    },
  ],
  matauranga: [
    {
      id: 'ncea-weekly',
      title: 'Weekly NCEA cohort report',
      outcome: 'Cohort risk view with credit pace, UE literacy/numeracy, and board-ready notes.',
      clientUse: 'Share a concise academic-risk snapshot with senior leadership.',
      starterPrompt:
        'Prepare a weekly NCEA cohort report workflow. Ask for year level, export format, achievement standards, UE literacy/numeracy fields, attendance context, pastoral exclusions, and board-report date. Return cohort risks, follow-up questions, board-ready summary, and evidence pack outline.',
      agentSequence: ['Ākonga', 'Kaiako-S', 'Reo', 'Rōpū'],
      reviewerRole: 'Deputy principal or registrar',
      evidencePack: 'NCEA weekly report pack',
      citations: ['Education and Training Act 2020', 'NZQA Act 2024', 'Privacy Act 2020'],
    },
    {
      id: 'board-minutes',
      title: 'Board minutes + ERO evidence',
      outcome: 'Chair-ready minutes with source trail and ERO evidence references.',
      clientUse: 'Send board-ready notes with proof attached.',
      starterPrompt:
        'Draft board minutes and ERO evidence workflow. Ask for agenda, notes or transcript, decisions, conflicts, actions, source documents, and chair preferences. Return minutes, action register, evidence references, and review questions.',
      agentSequence: ['Rōpū', 'Reo', 'ERO-S', 'Signal'],
      reviewerRole: 'Board secretary or chair',
      evidencePack: 'Board governance pack',
      citations: ['Education and Training Act 2020', 'ERO review guidance', 'Privacy Act 2020'],
    },
  ],
  hoko: [
    {
      id: 'cga-remedy',
      title: 'CGA remedy assessment',
      outcome: 'Fair, defensible refund/repair/replace response with evidence trail.',
      clientUse: 'Send a customer or client a remedy decision that holds up.',
      starterPrompt:
        'Run a Consumer Guarantees Act remedy assessment. Ask for product, purchase date, price, fault, customer request, prior repair attempts, warranty terms, photos or inspection notes, and preferred tone. Return remedy options, risk assessment, customer response draft, and evidence pack outline.',
      agentSequence: ['Hoko-CGA', 'Returns', 'Fair Trading', 'Retail Privacy'],
      reviewerRole: 'Store manager or retail owner',
      evidencePack: 'CGA remedy pack',
      citations: ['Consumer Guarantees Act 1993', 'Fair Trading Act 1986', 'Privacy Act 2020'],
    },
    {
      id: 'recall-pack',
      title: 'Product recall pack',
      outcome: 'Supplier trace, customer comms, and recall evidence in one workflow.',
      clientUse: 'Give a retailer the exact recall trail they need to run.',
      starterPrompt:
        'Prepare a product recall workflow. Ask for product/SKU, batch, supplier, sales channels, affected customers, risk type, regulator guidance, stock on hand, and comms channels. Return recall steps, customer notice, supplier questions, and evidence pack contents.',
      agentSequence: ['Stock', 'Supplier Records', 'Hoko-CGA', 'Signal'],
      reviewerRole: 'Retail operations lead',
      evidencePack: 'Product recall pack',
      citations: ['Fair Trading Act 1986', 'Consumer Guarantees Act 1993', 'Product Safety Standards'],
    },
  ],
  toro: [
    {
      id: 'term-planner',
      title: 'School term planner',
      outcome: 'Forwarded school comms turned into dates, actions, replies, and reminders.',
      clientUse: 'Share a whānau-ready plan without exposing private child details.',
      starterPrompt:
        'Run a school term planner workflow. Ask for school notice text, term dates, child year level, transport constraints, payment deadlines, permission slips, and whānau preferences. Return a dated action plan, draft replies, privacy notes, and review checkpoints.',
      agentSequence: ['Tōro', 'Term Planner', 'School Comms', 'Appointments'],
      reviewerRole: 'Parent or caregiver',
      evidencePack: 'Whānau term plan',
      citations: ['Privacy Act 2020 + IPP 3A'],
    },
    {
      id: 'handover-helper',
      title: 'Whānau handover helper',
      outcome: 'Clear handover note for routines, appointments, consent, and money.',
      clientUse: 'Share the plan with another caregiver safely.',
      starterPrompt:
        'Prepare a whānau handover workflow. Ask for dates, caregiver, routines, school actions, appointments, medication boundaries, spending rules, and what must stay private. Return a handover note, consent checklist, and review questions.',
      agentSequence: ['Handover Helper', 'Consent Guard', 'Allowance Ledger', 'Signal'],
      reviewerRole: 'Parent or caregiver',
      evidencePack: 'Whānau handover note',
      citations: ['Privacy Act 2020 + IPP 3A'],
    },
  ],
};

export function workflowById(kete: KeteSlug, id?: string | null) {
  if (!id) return null;
  return WORKFLOW_STARTERS[kete].find((workflow) => workflow.id === id) ?? null;
}
