/**
 * assembl / living — Business Genome slice (seed)
 * -----------------------------------------------
 * Structured business intelligence for the Assembl Living line, in the
 * repo's `GenomeFact` shape so it reads through the same model as every
 * other tenant. Not customer data. Seeded, not verified by a customer.
 */

import type { GenomeFact } from '@/lib/customers/auckland-dog-trainer/genome';

export const LIVING_TENANT = 'assembl-living';

export const LIVING_GENOME_FACTS: GenomeFact[] = [
  {
    id: 'liv-identity-name',
    section: 'identity',
    label: 'Business name',
    value: 'assembl / living — a modular interiors system made to the customer, their space and what they own.',
    readBy: ['website', 'support', 'email'],
    source: 'seed',
    verification: 'confirmed',
  },
  {
    id: 'liv-identity-promise',
    section: 'identity',
    label: 'Customer promise',
    value: 'Show us your space. We will help make it work beautifully.',
    readBy: ['website', 'support'],
    source: 'seed',
    verification: 'confirmed',
  },
  {
    id: 'liv-identity-voice',
    section: 'identity',
    label: 'Brand voice',
    value: 'Calm, specific, lowercase product names. Scandinavian restraint. Never over-claims fit, strength or capability.',
    readBy: ['website', 'support', 'email'],
    source: 'seed',
    verification: 'confirmed',
  },
  {
    id: 'liv-services-system',
    section: 'services',
    label: 'What we offer',
    value: 'One design system — grid, tile, stack, rail — on a shared 24 mm interface. Starter systems, accessory packs and made-to-measure upgrades.',
    readBy: ['website', 'faq'],
    source: 'seed',
    verification: 'confirmed',
  },
  {
    id: 'liv-services-segments',
    section: 'services',
    label: 'Customer segments',
    value: 'Teen rooms, vanities, home offices, workshops, entryways, pet households, plant people. Dayrally remains the adventure-facing collection.',
    readBy: ['website', 'support'],
    source: 'seed',
    verification: 'confirmed',
  },
  {
    id: 'liv-knowledge-interface',
    section: 'knowledge',
    label: 'Interface IF-01',
    value: '24 mm pitch, Ø6.4 mm holes, Ø6.0 mm pegs, 4 mm panels, 8 mm wall standoff, 96 mm tile footprint. Proposed; prior-art check pending before any exclusivity claim.',
    readBy: ['support', 'faq'],
    source: 'seed',
    verification: 'confirmed',
  },
  {
    id: 'liv-knowledge-measure',
    section: 'knowledge',
    label: 'Measurement policy',
    value: 'A photograph alone never establishes fit. Width and height are confirmed by the customer (tape, A4 reference or a supported depth scan) before a design is marked as fitting.',
    readBy: ['website', 'support', 'faq'],
    source: 'seed',
    verification: 'confirmed',
  },
  {
    id: 'liv-knowledge-load',
    section: 'knowledge',
    label: 'Load policy',
    value: 'All current parts are light-duty prototypes. No load ratings are published. Not for clothes rails, heavy shelving or safety-critical storage. Wall fixing uses screws and anchors suited to the wall, never printed fittings alone.',
    readBy: ['website', 'support', 'faq'],
    source: 'seed',
    verification: 'confirmed',
  },
  {
    id: 'liv-ops-fulfilment',
    section: 'operations',
    label: 'Fulfilment',
    value: 'Made on demand once a manufacturer has accepted the files, pricing and fulfilment. Purchasing is not enabled until then. Accessories ship bundled in one print-and-ship order.',
    readBy: ['website', 'support'],
    source: 'seed',
    verification: 'confirmed',
  },
  {
    id: 'liv-proof-metric',
    section: 'proof',
    label: 'What we measure',
    value: 'Designs saved, fit confirmations, parts per order, accessory re-orders on an existing panel, time from photo to approved design.',
    readBy: ['website'],
    source: 'seed',
    verification: 'confirmed',
  },
];
