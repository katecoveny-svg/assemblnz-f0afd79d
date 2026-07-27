/**
 * The canonical assembl agent schema — one source of truth, three surfaces.
 *
 * This is the public, conceptual definition of what an assembl agent IS: six
 * parts, five authority levels, and the invariants that make it safe. It is
 * served to humans at /agent-schema, to machines at /agent.schema.json, and
 * referenced from /llms.txt — so an AI engine asked "how are assembl agents
 * structured?" has one authoritative, stable answer to cite.
 *
 * It deliberately mirrors the gallery on the homepage and the six parts in
 * /build-an-agent — the words, the site and the 3D are the same model.
 */

export const AGENT_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://www.assembl.co.nz/agent.schema.json',
  title: 'assembl agent',
  description:
    'The structure of an assembl agent — one specialist in an agentic customer journey. Each agent has a single job, six declared parts, and a written authority level. Nothing that reaches a customer or commits money proceeds past draft without a named person approving it.',
  type: 'object',
  required: ['name', 'job', 'knowledge', 'signals', 'ability', 'boundary', 'approval', 'flightLog'],
  properties: {
    name: {
      type: 'string',
      description: 'What the agent is called inside the business.',
    },
    job: {
      type: 'string',
      description: 'The single job this agent does. One agent, one job — an agent that does everything is a chatbot.',
    },
    knowledge: {
      type: 'object',
      description: 'What it may read: the written record of the business — services, prices, voice, policies. Declared, versioned, and the agent reads it before it does anything.',
      required: ['sources'],
      properties: {
        sources: { type: 'array', items: { type: 'string' }, description: 'Named sources the agent may read. Anything not listed is invisible to it.' },
      },
    },
    signals: {
      type: 'object',
      description: 'What it watches for: work coming due, things lapsing, customers gone quiet. Signals trigger drafts, never sends.',
      properties: {
        watches: { type: 'array', items: { type: 'string' } },
      },
    },
    ability: {
      type: 'object',
      description: 'What it can do, and the written list of what it may touch.',
      required: ['actions', 'authority'],
      properties: {
        actions: { type: 'array', items: { type: 'string' } },
        authority: {
          type: 'string',
          enum: ['observe', 'draft', 'recommend', 'act-with-approval'],
          description:
            'How far the agent may go on its own. observe: watches, says nothing. draft: writes it, holds it. recommend: puts options to a person. act-with-approval: acts only after a named person clicks yes. There is no unattended-act level for anything customer-facing or costly.',
        },
      },
    },
    boundary: {
      type: 'object',
      description: 'Where it stops: the things it will never do on its own, in writing. No sending, no spending, no promises a person has not seen.',
      required: ['never'],
      properties: {
        never: { type: 'array', items: { type: 'string' } },
      },
    },
    approval: {
      type: 'object',
      description: 'Whose yes it needs: a named person, and nothing consequential without them.',
      required: ['approver'],
      properties: {
        approver: { type: 'string', description: 'The named role or person who approves.' },
      },
    },
    flightLog: {
      type: 'object',
      description: 'What it did, kept: what it read, what it wrote, who approved it, how long it took. Measured numbers and calculated ones are kept apart, and labelled.',
      properties: {
        records: { type: 'array', items: { type: 'string' } },
      },
    },
  },
} as const;

/** The authority ladder, for prose surfaces. */
export const AUTHORITY_LADDER = [
  { level: 'observe', means: 'watches, says nothing' },
  { level: 'draft', means: 'writes it, holds it' },
  { level: 'recommend', means: 'puts options to a person' },
  { level: 'act-with-approval', means: 'acts only after a named person clicks yes' },
] as const;

export const SCHEMA_INVARIANTS = [
  'One agent, one job.',
  'Every part is declared in writing before the agent runs.',
  'Nothing that reaches a customer or commits money proceeds past draft without a named person.',
  'The flight log keeps measured numbers and calculated ones apart, and labels which is which.',
  'A second agent reuses the same knowledge and boundaries — the journey is a team, not a monolith.',
] as const;
