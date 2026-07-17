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
    description:
      'Turns a task list and a calendar into a one-page weekly plan — priorities first, follow-ups listed, drafted for you to check.',
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
  },
  {
    id: 'family-admin',
    label: 'Family admin',
    description:
      'Reads a school notice and drafts the family week — events, reminders and a packing list, all waiting on a parent’s yes.',
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
];

export function communityTemplateById(id: string): CommunityTemplate | null {
  return COMMUNITY_TEMPLATES.find((t) => t.id === id) ?? null;
}
