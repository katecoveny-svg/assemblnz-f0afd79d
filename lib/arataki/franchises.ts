export type FranchiseSlug = 'subaru' | 'suzuki' | 'mg' | 'fleet';

export type FranchiseContent = {
  slug: FranchiseSlug;
  brand: string;
  hero: string;
  sub: string;
  pains: string[];
  calculators: Array<{ title: string; href: string; description: string }>;
  workflows: Array<{ title: string; href: string; description: string }>;
};

export const franchisePages: Record<FranchiseSlug, FranchiseContent> = {
  subaru: {
    slug: 'subaru',
    brand: 'Subaru',
    hero: 'Built for Subaru dealerships in Aotearoa.',
    sub: 'Connect service loyalty, finance timing, demo visibility, and sales floor action in one operator view.',
    pains: [
      "Subaru service loyalty is exceptional, but the sales floor often cannot see the live service lane.",
      'Distributor reporting can lag; assembl makes registrations, demos, and target progress visible as the month unfolds.',
      'Loan cars across two or three rooftops should be one operating view, not one more spreadsheet.',
    ],
    calculators: [
      { title: 'Service Lane Trade-In', href: '/kete/arataki/tools/service-lane-trade-in', description: 'Show the gross-profit value hidden in the service lane.' },
      { title: 'First-Service Retention', href: '/kete/arataki/tools/first-service-retention', description: 'Put a number on keeping new-car buyers in the service rhythm.' },
      { title: 'Lead Response Leakage', href: '/kete/arataki/tools/lead-response-leakage', description: 'Estimate the upside from five-minute lead response.' },
    ],
    workflows: [
      { title: 'Service-to-Sales Match', href: '/w/service-to-sales-match', description: 'Drafts a natural service-desk opener for likely trade-up customers.' },
      { title: 'First-Service Handoff', href: '/w/first-service-handoff', description: 'Keeps the first scheduled service from becoming a churn point.' },
      { title: 'After-Hours Lead Agent', href: '/w/after-hours-lead', description: 'Captures and triages enquiries outside showroom hours.' },
    ],
  },
  suzuki: {
    slug: 'suzuki',
    brand: 'Suzuki',
    hero: 'Built for Suzuki dealerships in Aotearoa.',
    sub: 'Track target consistency, recover workshop value, and keep price-sensitive owners close to the brand.',
    pains: [
      'Volume targets reward consistency; assembl tracks registrations against target and flags stock candidates for demo conversion.',
      'Service margin is tight, so recovered declined work can pay for the pilot quickly.',
      'Swift owners can be price-sensitive and service-loyal at the same time; the right workflow keeps them in the brand.',
    ],
    calculators: [
      { title: 'Missed Service Call Revenue', href: '/kete/arataki/tools/missed-service-call-revenue', description: 'Estimate the cost of workshop calls drifting to voicemail.' },
      { title: 'Declined Work Recovery', href: '/kete/arataki/tools/declined-work-recovery', description: 'Show the value left inside declined workshop quotes.' },
      { title: 'Workflow ROI', href: '/kete/arataki/tools/workflow-roi', description: 'Model payback before committing to a pilot.' },
    ],
    workflows: [
      { title: 'Missed-Call Rescue', href: '/w/missed-call-rescue', description: 'Turns missed calls into quick operator follow-up.' },
      { title: 'Declined-Work Recovery', href: '/w/declined-work-recovery', description: 'Creates a structured follow-up queue for declined work.' },
      { title: 'Stock Match Agent', href: '/w/stock-match-agent', description: 'Matches active demand to likely stock options.' },
    ],
  },
  mg: {
    slug: 'mg',
    brand: 'MG',
    hero: 'Built for MG dealerships in Aotearoa.',
    sub: 'Support volume-led growth with service visibility, EV-ready explanations, and tighter listing compliance.',
    pains: [
      'MG is volume-led with growing service complexity; visibility across sales, service, and disclosure matters.',
      'MG EV customers ask different workshop questions, and knowledge gaps cost retention.',
      'Nearly-new demo listings need Fair Trading Act wording and CIN discipline from the start.',
    ],
    calculators: [
      { title: 'Lead Response Leakage', href: '/kete/arataki/tools/lead-response-leakage', description: 'Quantify the cost of slow digital lead response.' },
      { title: 'First-Service Retention', href: '/kete/arataki/tools/first-service-retention', description: 'Model lifetime service value retained by first-service discipline.' },
      { title: 'NZ Listing Compliance Checker', href: '/kete/arataki/tools/nz-listing-compliance-checker', description: 'Check listing readiness before publishing.' },
    ],
    workflows: [
      { title: 'Repair Explainer', href: '/w/repair-explainer', description: 'Turns technical repairs into customer-safe language.' },
      { title: 'After-Hours Lead Agent', href: '/w/after-hours-lead', description: 'Keeps digital enquiries warm until a person reviews them.' },
      { title: 'Listing Compliance Agent', href: '/w/listing-compliance', description: 'Drafts compliant listing copy for dealer review.' },
    ],
  },
  fleet: {
    slug: 'fleet',
    brand: 'fleet and commercial',
    hero: 'Built for fleet and commercial dealerships.',
    sub: 'Give commercial customers a view built around uptime, operating windows, and document discipline.',
    pains: [
      'Fleet customers measure success in uptime; every hour off the road is hard cost.',
      'Commercial service scheduling needs to fit their operating window, not only the workshop diary.',
      'Road user charges, WoF, CoF, logbook, and service records are too costly to lose in email threads.',
    ],
    calculators: [
      { title: 'Fleet Uptime', href: '/kete/arataki/tools/fleet-uptime', description: 'Convert downtime reduction into an annual saving.' },
      { title: 'Workflow ROI', href: '/kete/arataki/tools/workflow-roi', description: 'Model the value of a fleet-facing workflow.' },
      { title: 'Declined Work Recovery', href: '/kete/arataki/tools/declined-work-recovery', description: 'Recover workshop work before it disappears.' },
    ],
    workflows: [
      { title: 'Fleet Uptime Agent', href: '/w/fleet-uptime', description: 'Frames service scheduling around uptime risk.' },
      { title: 'Declined-Work Recovery', href: '/w/declined-work-recovery', description: 'Creates a follow-up rhythm for declined jobs.' },
      { title: 'Missed-Call Rescue', href: '/w/missed-call-rescue', description: 'Catches missed service calls quickly.' },
    ],
  },
};

export const franchiseSlugs = Object.keys(franchisePages) as FranchiseSlug[];
