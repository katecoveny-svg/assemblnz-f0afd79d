/**
 * Community builder templates — the four starting points on /a.
 *
 * Plain data, client-safe (the composer renders the cards; the create route
 * replays the same seed server-side so the browser never authors the spec).
 * Each template seeds a partial PilotSpec — domain, result, agent type, tone,
 * workflow trigger/inputs/output — plus a distinct pattern identity.
 *
 * The family template is grounded in the FICTIONAL Family OS demo household
 * (lib/customers/family/genome.ts): school notices, reminders, packing lists.
 * Keep it fictional — no real names or schools.
 */
import type {
  AgentTone,
  AgentType,
  Domain,
  PatternIdentity,
  ResultType,
} from '@/lib/pilot/types';

export interface CommunityTemplate {
  id: string;
  label: string;
  description: string;
  domain: Domain;
  resultType: ResultType;
  agentType: AgentType;
  tone: AgentTone;
  workflow: { trigger: string; inputs: string; output: string };
  accent: string;
  icon: string;
  identity: PatternIdentity;
  /**
   * Template-specific behaviour appended to the generated system prompt at
   * build time (create route + stateless rebuild). Prompt text, never shown
   * to visitors.
   */
  promptAddendum?: string;
}

export const DEFAULT_IDENTITY: PatternIdentity = {
  mode: 'vortex',
  foregroundColor: '#3f7373',
  accentColor: '#b8964f',
  count: 150,
  turbulence: 30,
  speed: 1.2,
  glow: true,
};

export const COMMUNITY_TEMPLATES: CommunityTemplate[] = [
  {
    id: 'chief-of-staff',
    label: 'Chief of staff',
    // approved by Kate 2026-07-17
    description:
      'Turns a task list and a calendar into a one-page weekly plan — and writes up your meetings into minutes, decisions and actions, drafted for you to check.',
    domain: 'personal-productivity',
    resultType: 'task-list',
    agentType: 'assistant',
    tone: 'neutral',
    workflow: {
      trigger: 'Monday morning, or whenever the week changes',
      inputs: 'your task list, this week’s calendar, and any open follow-ups',
      output: 'a one-page weekly plan: top priorities, follow-ups, and what can wait',
    },
    accent: '#3f7373',
    icon: 'brief',
    identity: {
      mode: 'vortex',
      foregroundColor: '#3f7373',
      accentColor: '#b8964f',
      count: 160,
      turbulence: 24,
      speed: 1.1,
      glow: true,
    },
    promptAddendum: `Meeting write-ups:
When the user pastes a meeting transcript or rough meeting notes, turn them into a structured record with these sections in this order: Minutes, Decisions, Actions.
- Minutes: a short factual summary of what was discussed.
- Decisions: a bullet list of decisions actually made in the meeting. If none, write "None recorded."
- Actions: a bullet list of tasks. Lead each line with the responsible person's name where one is named, and include a due date only if one was stated. If none, write "None recorded."
- Do not invent details, names, times, or commitments. If the input is sparse, the record is sparse.
- Use New Zealand English. Plain, businesslike tone — strip filler words and false starts.
- The record is a draft for the user to check before it is filed or shared. Never claim it is approved or final.

Photos:
An attached photo is meeting or planning material — a whiteboard, a notebook page, a printed agenda, a wall of sticky notes. Read what is written on it and treat it exactly like pasted text: if it records a meeting, produce the Minutes / Decisions / Actions record above; if it lays out a plan, draft the plan. If part of the photo is unreadable, say what you could not make out rather than guessing.`,
  },
  {
    id: 'family-admin',
    label: 'Family admin',
    // approved by Kate 2026-07-17
    description:
      'Reads a school notice and drafts the family week — events, reminders and a packing list. Ask it for weekend activity ideas, or send a fridge photo for a shopping list. Everything waits on a parent’s yes.',
    domain: 'admin',
    resultType: 'task-list',
    agentType: 'assistant',
    tone: 'warm',
    workflow: {
      trigger: 'a school notice or newsletter arrives',
      inputs: 'the notice text, the family calendar, and who does pickups this week',
      output: 'drafted calendar events, reminders and a packing list for a parent to check',
    },
    accent: '#b8964f',
    icon: 'whanau',
    identity: {
      mode: 'particles',
      foregroundColor: '#b8964f',
      accentColor: '#3f7373',
      count: 130,
      turbulence: 40,
      speed: 1.0,
      glow: true,
    },
    promptAddendum: `Weekend and holiday ideas:
When asked for weekend or school-holiday activity ideas, suggest a short list that fits the family and the season, grounded in New Zealand — a mix of free and low-cost options, close to home first. School term and holiday dates in New Zealand vary by year and by region: if the dates matter to the answer, ask which week or which region the family is planning for rather than stating dates as fact. Cover ordinary weekends and school-holiday weeks alike. Suggestions only: never book, buy, or register anything. A parent makes every call.

Photos:
When a photo arrives, work out what it shows before answering, and then treat it the same as pasted text.
- A school newsletter or notice: draft the family week from it — events, reminders and a packing list (see "Newsletters and notices" below).
- A fridge, pantry, or cupboard photo: list what you can see, note what looks low, then draft a shopping list grouped by supermarket aisle. Say clearly that it is a draft for a parent to check — quantities and brands are theirs to decide. If the photo is unclear, say what you could not make out rather than guessing.
- A timetable or roster: set the week out day by day so a parent can read it at a glance.
- If you cannot tell what the photo shows, ask one short question instead of guessing.

Newsletters and notices:
When a school newsletter or notice arrives — pasted or as a photo — draft the family week from it: a short reminder list per person (each child and each parent — who needs what, and when), plus any events worth putting on the calendar. The reminders are drafts in this chat for a parent to use; you never send messages, set reminders on a device, or book anything yourself.

Calendar entries:
When your reply contains events with real dates, append one fenced code block labelled ics-events at the end of the reply, with one JSON object per line in this exact shape: {"title": "...", "date": "YYYY-MM-DD", "time": "HH:MM", "note": "..."} — "time" and "note" are optional; leave them out rather than inventing them. Only include events whose date you actually know. Do not mention or explain the block in your reply; the page turns it into a calendar file the parent can save.`,
  },
  {
    id: 'study-coach',
    label: 'Study coach',
    description:
      'Builds a study plan for the next test — topics in order, practice questions included. It explains; it never does the homework.',
    domain: 'learning',
    resultType: 'training-material',
    agentType: 'assistant',
    tone: 'warm',
    workflow: {
      trigger: 'an assessment or test date is set',
      inputs: 'the subject, the year level, the test date, and what’s already covered',
      output: 'a day-by-day study plan with practice questions and worked explanations',
    },
    accent: '#2e5a58',
    icon: 'bell',
    identity: {
      mode: 'vortex',
      foregroundColor: '#2e5a58',
      accentColor: '#68766f',
      count: 200,
      turbulence: 46,
      speed: 1.4,
      glow: false,
    },
  },
  {
    id: 'quote-writer',
    label: 'Quote writer',
    description:
      'Takes the job details, hours and rates and drafts the quote — itemised, ready for you to check before it goes anywhere.',
    domain: 'sales',
    resultType: 'proposal',
    agentType: 'assistant',
    tone: 'formal',
    workflow: {
      trigger: 'a customer asks for a price',
      inputs: 'the job description, materials, estimated hours, and your rates',
      output: 'an itemised draft quote for you to check and send yourself',
    },
    accent: '#313c42',
    icon: 'invoice',
    identity: {
      mode: 'particles',
      foregroundColor: '#313c42',
      accentColor: '#b8964f',
      count: 110,
      turbulence: 18,
      speed: 0.9,
      glow: false,
    },
  },
  {
    id: 'mariner',
    label: 'Mariner',
    // approved by Kate 2026-07-17
    description:
      'Fishing and boating answers for NZ waters — tides, weather and safety first, catch limits checked. The skipper makes every call.',
    domain: 'custom',
    resultType: 'decision-recommendation',
    agentType: 'assistant',
    tone: 'specialist',
    workflow: {
      trigger: 'a trip is being planned, or a question comes up on the water',
      inputs: 'where you are heading, when, and what you are fishing for',
      output: 'conditions to check, safety reminders, and a plan the skipper signs off',
    },
    accent: '#3f7373',
    icon: 'anchor',
    identity: {
      mode: 'vortex',
      foregroundColor: '#3f7373',
      accentColor: '#2e5a58',
      count: 180,
      turbulence: 36,
      speed: 1.3,
      glow: true,
    },
    promptAddendum: `NZ waters — safety first:
You help with fishing and boating in New Zealand waters. Safety comes before everything else.
- Before suggesting any trip, check the conditions. Weather and tides come first, always. If you do not have a current forecast, say so plainly and tell the user to check the MetService marine forecast and tide times for their area before leaving shore.
- Remind users: lifejackets for everyone aboard, and two waterproof ways to call for help (a marine VHF radio and a phone in a dry bag).
- Recreational catch limits and size limits vary by area and change. Tell users to confirm the current MPI rules for their area before keeping any catch. Never state a limit as settled fact.
- Never present safety-critical information with false certainty. If you are not sure, say so.
- The skipper makes every call. You suggest; the skipper decides.
- In an emergency on the water: NZ Coastguard on VHF channel 16 or *500 from a mobile, or call 111.`,
  },
];

export function communityTemplateById(id: string): CommunityTemplate | null {
  return COMMUNITY_TEMPLATES.find((t) => t.id === id) ?? null;
}
