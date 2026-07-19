/**
 * The refund-test workflow — 9 explicit stages, all simulated. Every stage
 * writes to the store's activity trace so the activity view can replay
 * exactly what happened.
 *
 * The stages here are hard-coded on purpose: this is a demonstration test,
 * not a live agent runtime. Swap the body of `runTestStage` for real
 * execution when the agent runtime lands.
 */

export type TestStageId =
  | 'idle'
  | 'received'
  | 'searching'
  | 'source-found'
  | 'drafting'
  | 'uncertainty'
  | 'awaiting-approval'
  | 'approved'
  | 'ready-to-send'
  | 'sent';

export interface TestStageSpec {
  id: TestStageId;
  label: string;
  hint: string;                      // one-line explanation
  autoAdvanceAfterMs: number | null; // null means human input required
  activity: string;                  // what to append to the trace
  /** Which component IDs are "active" during this stage — the 3D scene
   *  highlights them. */
  active: string[];
}

export const REFUND_MESSAGE = `Hi — I booked a photography session with you last Wednesday for our
whānau but Mila is now unwell. Can I please have a refund? — Sam`;

export const REFUND_DRAFT = `Kia ora Sam,

Thanks so much for letting us know about Mila — I hope she\'s better very
soon. Our refund policy for cancellations inside 7 days of a booking is
usually a credit toward a future session, but I\'d like to offer a full
refund in your case given the circumstances.

Would that work for you? Once you say yes, I\'ll process it today and
you\'ll see it back on your card within 2–3 business days.

Ngā mihi,
koro (for the studio)`;

export const REFUND_SOURCE = {
  title: 'Booking terms · cancellations',
  citation: 'Business knowledge · Bookings & payments · v2026-04',
  snippet:
    'Cancellations more than 7 days before a session: full refund. Inside 7 days: credit toward a future session, or a refund at the owner\'s discretion for exceptional circumstances (illness, whānau emergency, weather).',
};

/**
 * Ordered stage table. `awaiting-approval` blocks until the human approves
 * or rejects; every other stage auto-advances after the given delay.
 */
export const TEST_STAGES: TestStageSpec[] = [
  {
    id: 'received',
    label: 'Message received',
    hint: 'A new customer message arrived from Gmail.',
    autoAdvanceAfterMs: 900,
    activity: 'Received message from Sam via Gmail — subject line "Refund?"',
    active: ['con-gmail'],
  },
  {
    id: 'searching',
    label: 'Searching knowledge',
    hint: 'Looking up the refund policy in the business knowledge library.',
    autoAdvanceAfterMs: 1200,
    activity: 'Searched "refund policy" across Business knowledge + Customer FAQ',
    active: ['kn-biz', 'kn-faq'],
  },
  {
    id: 'source-found',
    label: 'Source found',
    hint: 'Located the cancellation clause in the booking terms.',
    autoAdvanceAfterMs: 900,
    activity: 'Cited source: Business knowledge · Bookings & payments · v2026-04',
    active: ['kn-biz'],
  },
  {
    id: 'drafting',
    label: 'Drafting response',
    hint: 'Composing a reply using the cited source and the communication style.',
    autoAdvanceAfterMs: 1600,
    activity: 'Draft composed — 8 lines, cited 1 source',
    active: ['ab-draft', 'instructions'],
  },
  {
    id: 'uncertainty',
    label: 'Uncertainty detected',
    hint: 'The refund request falls into the discretionary case — evaluation flagged for approval.',
    autoAdvanceAfterMs: 1100,
    activity: 'Tone eval 0.91 · Accuracy eval 0.88 · Discretionary refund flag raised',
    active: ['ev-tone', 'ev-accuracy'],
  },
  {
    id: 'awaiting-approval',
    label: 'Awaiting approval',
    hint: 'Send is gated by the owner-approval rule. Approve or reject to continue.',
    autoAdvanceAfterMs: null,
    activity: 'Send blocked — awaiting owner approval',
    active: ['ap-send'],
  },
  {
    id: 'approved',
    label: 'Human approved',
    hint: 'The owner reviewed and approved the reply.',
    autoAdvanceAfterMs: 700,
    activity: 'Owner approved draft (no edits)',
    active: ['ap-send'],
  },
  {
    id: 'ready-to-send',
    label: 'Ready to send',
    hint: 'Send ability enabled by the approved gate; Gmail is preparing to deliver.',
    autoAdvanceAfterMs: 700,
    activity: 'Send ability unlocked; Gmail prepared for delivery',
    active: ['ab-send', 'con-gmail'],
  },
  {
    id: 'sent',
    label: 'Simulated send complete',
    hint: 'This prototype never actually sends — it stops here.',
    autoAdvanceAfterMs: null,
    activity: 'Simulated send complete · no real Gmail call was made',
    active: ['con-gmail'],
  },
];

export function nextStage(current: TestStageId): TestStageId {
  const idx = TEST_STAGES.findIndex((s) => s.id === current);
  if (idx < 0) return TEST_STAGES[0].id;
  if (idx >= TEST_STAGES.length - 1) return current;
  return TEST_STAGES[idx + 1].id;
}

export function stageIndex(stage: TestStageId): number {
  const idx = TEST_STAGES.findIndex((s) => s.id === stage);
  return idx < 0 ? -1 : idx;
}
