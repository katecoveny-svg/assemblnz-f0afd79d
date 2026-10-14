import { z } from 'zod';
import type { PursuitDraft } from './public-contract';

export const DIRECT_SOURCE_DEFAULT_GOAL = 'Understand assembl’s service and experience design, process improvement, software, agents and creative work. Propose one specific piece of work to explore, with sources separate from hypotheses. Do not assume a buyer problem, demand or budget.';
export const retainDirectSourceGoal = (goal: string) => goal.trim() ? goal : DIRECT_SOURCE_DEFAULT_GOAL;
export const DIRECT_FOCUS_VALUES = ['goal-led', 'service-process', 'software', 'creative', 'privacy-review'] as const;
export const DIRECT_STARTER_PLAN_DESCRIPTION = 'Authored starter plan. Your brief and selected focus guide the choice from a fixed set of actions; this is not bespoke discovery or a full interpretation of your brief.';
export type DirectFocus = typeof DIRECT_FOCUS_VALUES[number];
export const DIRECT_FOCUS_LABELS: Record<DirectFocus, string> = {
  'goal-led': 'Clarify the task in my brief',
  'service-process': 'Service, experience or process improvement',
  software: 'Software or agents',
  creative: 'Creative work or an interactive experience',
  'privacy-review': 'A specific privacy or information-flow review',
};
const ACTIONS = {
  'clarify-scope': { title: 'Proposal: clarify the task in your brief', work: 'Propose clarifying the task, its users and the intended outcome before selecting a solution.', deliverables: ['A reviewed task brief', 'A baseline and scope to confirm'] },
  'interview-users': { title: 'Proposal: investigate the task with its users', work: 'Propose interviewing the people involved to understand the task and test whether an improvement would be useful.', deliverables: ['A proposed interview guide', 'A task map and questions to check'] },
  'map-task': { title: 'Proposal: map the service or workflow', work: 'Propose mapping the steps and handoffs in the task you selected, then agree one improvement to test.', deliverables: ['A proposed journey or workflow map', 'A baseline measurement plan'] },
  'prototype-service': { title: 'Proposal: demonstrate a service improvement', work: 'Propose creating a small service or experience demonstration for the task you selected and reviewing it with its users.', deliverables: ['A proposed service blueprint', 'An interactive demonstration'] },
  'build-software': { title: 'Proposal: demonstrate a useful software change', work: 'Propose building a bounded software or agent demonstration for the task you selected, with reviewed inputs and outputs.', deliverables: ['A proposed software brief', 'A working demonstration for review'] },
  'create-experience': { title: 'Proposal: make the selected idea tangible', work: 'Propose developing a visual or interactive experience for the idea in your brief, then test whether it communicates clearly.', deliverables: ['A proposed creative brief', 'A visual or interactive demonstration'] },
  'review-information-flow': { title: 'Proposal: review the selected information flow', work: 'Propose mapping the information flow and review points for your explicitly selected privacy task; confirm specialist requirements before implementation.', deliverables: ['A proposed information-flow map', 'Review questions and boundaries to confirm'] },
} as const;
const ACTION_VALUES = Object.keys(ACTIONS) as [keyof typeof ACTIONS, ...(keyof typeof ACTIONS)[]];
export type DirectAction = keyof typeof ACTIONS;
const FOCUS_ACTIONS: Record<DirectFocus, readonly DirectAction[]> = {
  'goal-led': ['clarify-scope', 'interview-users', 'map-task'],
  'service-process': ['clarify-scope', 'interview-users', 'map-task', 'prototype-service'],
  software: ['clarify-scope', 'interview-users', 'map-task', 'build-software'],
  creative: ['clarify-scope', 'interview-users', 'create-experience'],
  'privacy-review': ['clarify-scope', 'interview-users', 'review-information-flow'],
};
export const DirectPlan = z.object({
  version: z.literal(1), goalEcho: z.string().min(12).max(700), focus: z.enum(DIRECT_FOCUS_VALUES),
  action: z.enum(ACTION_VALUES),
  evidence: z.array(z.object({ claim: z.string().min(20).max(200), url: z.string().url() }).strict()).length(2),
}).strict();

/** No model-authored title, market assertion, demand statement or rationale can
 * enter the presentation contract. Source observations remain exact verified
 * quotations. Focus is selected by the visitor, never inferred from keywords.
 */
export function directPlanJsonSchema(goal: string, focus: DirectFocus, sources: { url: string; quoteCandidates: string[] }[]) {
  return { type: 'object', additionalProperties: false, required: ['version', 'goalEcho', 'focus', 'action', 'evidence'], properties: {
    version: { type: 'integer', enum: [1] }, goalEcho: { type: 'string', enum: [goal] }, focus: { type: 'string', enum: [focus] },
    action: { type: 'string', enum: FOCUS_ACTIONS[focus] },
    evidence: { type: 'array', minItems: 2, maxItems: 2, items: { type: 'object', additionalProperties: false, required: ['claim', 'url'], properties: {
      claim: { type: 'string', enum: sources.flatMap(source => source.quoteCandidates), description: 'One complete quoteCandidate copied verbatim. Exactly one observation from EACH source.' },
      url: { type: 'string', enum: sources.map(source => source.url) },
    } } },
  } };
}

/** Caller verifies BOTH source quotations before projection. A plan is a
 * proposed investigation, not a claim that any business has a problem or buys.
 * Goal echo prevents substitution; server-owned result context retains the brief.
 */
export function projectDirectPlan(value: unknown, goal: string, focus: DirectFocus): PursuitDraft {
  const parsed = DirectPlan.safeParse(value);
  if (!parsed.success || parsed.data.goalEcho !== goal || parsed.data.focus !== focus || !FOCUS_ACTIONS[focus].includes(parsed.data.action)) throw new Error('direct_proposal_unsupported');
  const plan = parsed.data, action = ACTIONS[plan.action];
  return {
    company: 'assembl', title: action.title,
    summary: 'assembl works alongside teams on service and experience design, processes, software, agents and creative work. This is a proposed next step for your stated task; demand is unverified.',
    evidence: plan.evidence,
    opportunity: 'Propose investigating the task you selected with its users before deciding whether there is a useful change to make.',
    proposedWork: action.work, deliverables: [...action.deliverables],
    nextSteps: ['Confirm the task, focus and scope with its owner', 'Record a baseline and review the source limitations'],
    unknowns: ['The pages do not establish the actual buyer problem or buying intent.', 'Budget and demand for this proposed work are unverified.', 'The scope, baseline and any specialist requirements still need checking.'],
  };
}
