/**
 * assembl / living — Business Genome slice (seed)
 * -----------------------------------------------
 * Structured business intelligence for the Assembl Living line, in the
 * repo's `GenomeFact` shape. Not customer data. Seeded, not verified by a
 * customer.
 */

import type { GenomeFact } from '@/lib/customers/auckland-dog-trainer/genome';

export const LIVING_TENANT = 'assembl-living';

export const LIVING_GENOME_FACTS: GenomeFact[] = [
  { id: 'liv-identity-name', section: 'identity', label: 'Business name', value: 'assembl / living — a modular interiors system made to the customer, their space and what they own. dayrally is its go-anywhere collection.', readBy: ['website', 'support', 'email'], source: 'seed', verification: 'confirmed' },
  { id: 'liv-identity-promise', section: 'identity', label: 'Customer promise', value: 'Show us your space. We will help make it work beautifully.', readBy: ['website', 'support'], source: 'seed', verification: 'confirmed' },
  { id: 'liv-identity-voice', section: 'identity', label: 'Brand voice', value: 'Calm, specific, lowercase product names. Scandinavian restraint. Never over-claims fit, strength or capability.', readBy: ['website', 'support', 'email'], source: 'seed', verification: 'confirmed' },
  { id: 'liv-services-system', section: 'services', label: 'What we offer', value: 'One design system on the assembl TURN standard: grid boards and accessories, tile trays, stack dowel joints, renter hangers, a pendant shade, and the dayrally pods. Room kits and made-to-measure trays. Printed to order.', readBy: ['website', 'faq'], source: 'seed', verification: 'confirmed' },
  { id: 'liv-services-segments', section: 'services', label: 'Customer segments', value: 'Teen rooms, vanities, home offices, workshops, entryways, pet households, renters, plant people; dayrally for riders, scooters, fishing, beach, school.', readBy: ['website', 'support'], source: 'seed', verification: 'confirmed' },
  { id: 'liv-knowledge-interface', section: 'knowledge', label: 'assembl TURN standard v0.1', value: '42 mm grid; 8 mm board (4 mm standoff + 4 mm plate); Ø13 keyway with two 4 mm lug slots; Ø22 chamber; 0.35 mm detents; 5 mm accessory flange with a 45° countersink; TURN key: push in upright, quarter-turn to lock; single-key accessories carry a locator nub. Proposed and untested in print; prior-art check pending before any exclusivity claim.', readBy: ['support', 'faq'], source: 'seed', verification: 'confirmed' },
  { id: 'liv-knowledge-measure', section: 'knowledge', label: 'Measurement policy', value: 'A photograph alone never establishes fit. Width and height are confirmed by the customer (tape, A4 reference or a supported depth scan) and the door-gap gauge decides the over-door hanger.', readBy: ['website', 'support', 'faq'], source: 'seed', verification: 'confirmed' },
  { id: 'liv-knowledge-load', section: 'knowledge', label: 'Load policy', value: 'Nothing has been printed or load-tested. No load limits are published until the test kit and the 24-hour hook load test have run; then half the passing weight is published. Light things only on door and rail hangers. Shade is sold alone, LED only.', readBy: ['website', 'support', 'faq'], source: 'seed', verification: 'confirmed' },
  { id: 'liv-ops-fulfilment', section: 'operations', label: 'Fulfilment', value: 'Printed to order by a print partner (3DAPI first) once the test kit has been run and files, pricing and fulfilment are accepted. Purchasing is not enabled until then. Every part carries a reorder code with a check letter.', readBy: ['website', 'support'], source: 'seed', verification: 'confirmed' },
  { id: 'liv-proof-metric', section: 'proof', label: 'What we measure', value: 'Designs saved, fit confirmations, parts per order, accessory re-orders on an existing board, time from photo to approved design.', readBy: ['website'], source: 'seed', verification: 'confirmed' },
];
