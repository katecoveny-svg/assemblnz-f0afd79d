/**
 * Family OS object model — the "clean agent brain" (hub-and-spoke).
 *
 * The agent turns a parsed newsletter into PROPOSED items; a named adult
 * approves them before anything becomes a real handoff. Everything is one of
 * these kinds so the dashboard stays simple and the agent never sprawls.
 */

export type FamilyKind =
  | 'event' // school dates, sports, dentist, birthdays
  | 'task' // forms, payments, things to bring / reply to
  | 'pickup' // who collects whom, from where, when
  | 'shopping' // a named list (lunchbox, shared plate, sports kit)
  | 'approval' // anything with money, transport, messaging, shopping
  | 'memory' // constraints & preferences (no nuts, Dad can't do Tuesdays)
  | 'person' // parent, child, caregiver, coach
  | 'digest'; // a generated family brief

export type FamilyStatus = 'proposed' | 'approved' | 'dismissed' | 'done';

export type FamilyItem = {
  id: string;
  hub: string;
  kind: FamilyKind;
  title: string;
  detail: Record<string, unknown>;
  status: FamilyStatus;
  person: string | null;
  location: string | null;
  when_at: string | null;
  when_label: string | null;
  source: string | null;
  created_at: string;
};

/** The structured shape the parser returns (before it becomes family_items). */
export type ParsedWeek = {
  summary: string;
  events: Array<{ title: string; when_label: string; person?: string; location?: string }>;
  tasks: Array<{ title: string; person?: string; due_label?: string }>;
  pickups: Array<{ child: string; from: string; when_label: string; note?: string }>;
  shopping: Array<{ list: string; items: string[]; reason?: string }>;
  approvals: Array<{ title: string; reason: string; kind: 'money' | 'transport' | 'messaging' | 'shopping' | 'other' }>;
  memory: Array<{ fact: string; person?: string }>;
};
