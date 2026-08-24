export type PitchDemo = {
  slug: 'contact' | 'mitre10' | 'udc' | 'iag';
  company: string;
  audience: string;
  sector: string;
  accent: string;
  eyebrow: string;
  headline: string;
  support: string;
  state: string;
  offer: string;
  choices: string[];
  preparedTitle: string;
  preparedBefore: string[];
  preparedAfter: string[];
  reviewer: string;
  boundary: string;
  journey: { label: string; detail: string }[];
  pilot: string;
  measures: string[];
  source: string;
  sourceHref: string;
};

export const PITCH_DEMOS: Record<PitchDemo['slug'], PitchDemo> = {
  contact: {
    slug: 'contact',
    company: 'Contact Energy',
    audience: 'prepared for Carolyn Luey',
    sector: 'move + connect',
    accent: '#6D44C5',
    eyebrow: 'A MOVE IS UNDERWAY',
    headline: 'Make the days before move-in useful.',
    support:
      'A customer has already given Contact the address and move date. assembl can use the connection wait to explain status, prepare broadband dependencies and hand exceptions to the right team with the context attached.',
    state: 'Your move is with the team.',
    offer:
      'While your electricity and broadband are being prepared, I can check what could hold up move day.',
    choices: [
      'Check broadband readiness',
      'Prepare a move-day checklist',
      'Keep waiting',
    ],
    preparedTitle: 'Move readiness brief',
    preparedBefore: [
      'Move date: 29 August',
      'Electricity: transfer requested',
      'Broadband: address check pending',
    ],
    preparedAfter: [
      'Move date: 29 August',
      'Electricity: transfer requested',
      'Broadband: fibre dependency checked',
      'Next step: confirm modem / consent if required',
    ],
    reviewer: 'Contact move / broadband team',
    boundary:
      'assembl does not reconnect supply, change a plan or make a safety decision. It prepares the brief and records what the customer chose to share.',
    journey: [
      { label: 'move submitted', detail: 'address + dates received' },
      { label: 'service checks', detail: 'electricity + broadband dependencies' },
      { label: 'useful wait', detail: 'status + one optional preparation task' },
      { label: 'prepared handoff', detail: 'brief goes to the responsible team' },
      { label: 'move-day state', detail: 'customer sees what is ready' },
    ],
    pilot:
      'One existing-customer move journey. Start with status reads and a prepared broadband / exception brief. Add write-back only for approved preference fields.',
    measures: [
      'avoidable move-status contacts',
      'time from exception to prepared handoff',
      'digital move completion',
      'customer changes to the prepared brief',
    ],
    source: 'Contact moving-house guidance: power, gas and broadband can be moved together; broadband timing can depend on fibre installation.',
    sourceHref: 'https://contact.co.nz/personal/electricity/moving-house',
  },
  mitre10: {
    slug: 'mitre10',
    company: 'Mitre 10 New Zealand',
    audience: 'click & collect concept',
    sector: 'project readiness',
    accent: '#E85E24',
    eyebrow: 'YOUR ORDER IS BEING PICKED',
    headline: 'Use collection time to help finish the job.',
    support:
      'Click & Collect already creates a real wait. assembl can use that time to check the customer’s project, prepare one useful missing-item or setup suggestion and keep any supplier-funded reward clearly optional and disclosed.',
    state: 'Your order is being picked.',
    offer:
      'While the store gets it ready, I can check whether this paint order covers the job you described.',
    choices: [
      'Bedroom walls only',
      'Walls + ceiling',
      'Keep waiting',
    ],
    preparedTitle: 'Project readiness checklist',
    preparedBefore: [
      'Interior paint',
      'Roller kit',
      'Masking tape',
    ],
    preparedAfter: [
      'Interior paint',
      'Roller kit',
      'Masking tape',
      'Check: ceiling paint is not in the order',
      'Optional add-on: only if the customer wants it',
    ],
    reviewer: 'customer first, then store / category rules',
    boundary:
      'The order stays unchanged unless the customer chooses otherwise. A supplier may fund a disclosed reward, but cannot control the recommendation or make sharing mandatory.',
    journey: [
      { label: 'order paid', detail: 'Click & Collect begins' },
      { label: 'store picking', detail: 'a genuine operational wait' },
      { label: 'optional project check', detail: 'one answer changes the checklist' },
      { label: 'customer review', detail: 'keep, change or remove the suggestion' },
      { label: 'ready to collect', detail: 'project brief travels with the order' },
    ],
    pilot:
      'One project category, such as interior painting, at one or two stores. Prove customer utility first. Test supplier funding only after the recommendation rules and economics are agreed.',
    measures: [
      'project-check participation',
      'useful add-ons accepted',
      'repeat trips / avoidable omissions',
      'skip and consent health',
    ],
    source: 'Mitre 10 Click & Collect: customers buy online, choose collection and receive confirmation when the order is ready.',
    sourceHref: 'https://www.mitre10.co.nz/collect-in-store',
  },
  udc: {
    slug: 'udc',
    company: 'UDC Finance',
    audience: 'vehicle finance concept',
    sector: 'application assessment',
    accent: '#007C78',
    eyebrow: 'YOUR APPLICATION IS WITH UDC',
    headline: 'Make the 24-hour decision wait useful.',
    support:
      'UDC says it will be in touch with a decision within 24 hours. assembl can make that assessed wait legible, prepare a missing-document or contact preference and leave the lending decision exactly where it belongs: with UDC.',
    state: 'Your application is with the team.',
    offer:
      'While they complete the responsible-lending checks, I can prepare how you want to handle the next step if more information is needed.',
    choices: [
      'Secure upload if needed',
      'Ask a lending specialist to call',
      'Keep waiting',
    ],
    preparedTitle: 'Next-step preference brief',
    preparedBefore: [
      'Application received',
      'Assessment underway',
      'No action required right now',
    ],
    preparedAfter: [
      'Application received',
      'Assessment underway',
      'If information is required: secure upload preferred',
      'Customer can change or remove this preference',
    ],
    reviewer: 'UDC lending specialist',
    boundary:
      'assembl does not approve, decline, price or rank credit risk. It does not provide financial advice. UDC controls responsible-lending inquiries and the decision.',
    journey: [
      { label: 'application', detail: 'customer submits online' },
      { label: 'assessment', detail: 'UDC checks the application' },
      { label: 'useful wait', detail: 'status + bounded next-step preference' },
      { label: 'specialist review', detail: 'prepared context arrives with the case' },
      { label: 'decision', detail: 'UDC communicates the outcome' },
    ],
    pilot:
      'Personal vehicle finance after submission. Start read-only for assessment state, plus one narrow preference field for document or human follow-up.',
    measures: [
      'application-status contacts',
      'time to complete requested information',
      'decision-to-document completion',
      'cold-start time in specialist handoffs',
    ],
    source: 'UDC personal vehicle finance: apply online, receive a decision within 24 hours, then complete loan documents and release funds.',
    sourceHref: 'https://www.udc.co.nz/for-individuals/personal-vehicle-finance',
  },
  iag: {
    slug: 'iag',
    company: 'AMI / State · IAG New Zealand',
    audience: 'motor claims concept',
    sector: 'claim assessment + repair',
    accent: '#C9252C',
    eyebrow: 'YOUR CLAIM IS BEING ASSESSED',
    headline: 'Keep the claim joined up between people.',
    support:
      'A motor claim can pass through claims staff, assessors and repairers. assembl gives the customer one readable journey and prepares the next human conversation before the handoff happens.',
    state: 'Your vehicle is being assessed.',
    offer:
      'While the damage is reviewed, I can prepare the practical things the claims team may need to discuss with you next.',
    choices: [
      'Prepare repairer preferences',
      'Include transport needs',
      'Keep waiting',
    ],
    preparedTitle: 'Claims handoff brief',
    preparedBefore: [
      'Claim lodged',
      'Photos received',
      'Assessment underway',
    ],
    preparedAfter: [
      'Claim lodged',
      'Photos received',
      'Assessment underway',
      'Transport need recorded',
      'Repairer preference ready for claims-team review',
    ],
    reviewer: 'AMI / State claims team',
    boundary:
      'assembl does not decide coverage, liability, repair economics or settlement. It prepares customer context and keeps the governed claims decision with IAG.',
    journey: [
      { label: 'claim lodged', detail: 'incident + evidence received' },
      { label: 'assessment', detail: 'damage / claim review' },
      { label: 'useful wait', detail: 'status + optional practical preparation' },
      { label: 'human handoff', detail: 'claims team receives the brief' },
      { label: 'repair / settle', detail: 'customer sees the next confirmed state' },
    ],
    pilot:
      'One repairable motor-claim segment in AMI or State. Read claim-status events first. Add only customer preferences that improve the assessor or claims-team handoff.',
    measures: [
      'avoidable claim-status contacts',
      'handoff time between claim states',
      'completion of suitable self-serve steps',
      'customer changes before human review',
    ],
    source: 'Concept boundary: based on a typical motor-claim assessment and repair handoff. Operational details must be confirmed with IAG before a connected pilot.',
    sourceHref: 'https://www.iag.co.nz/',
  },
};

export const PITCH_SLUGS = Object.keys(PITCH_DEMOS) as PitchDemo['slug'][];
