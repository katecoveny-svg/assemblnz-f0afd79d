/**
 * Shared agent-app blueprint craft kit.
 * Arc is the first vertical; Forge (and others) reuse this shape later.
 *
 * HARD Kate craft locks (agent-app system):
 * 1. Visual language = architectural assembling / blueprint / plan drawings
 *    — not cream Heron paper, not orange accents.
 * 2. Accent = deep plum #240B21 + heather/mulberry.
 * 3. Arc plans feel New Zealand relevant (NZBC/AUP DEMO; NZ typology).
 * 4. Arc metaphor = building parts assembling into a coherent plan.
 * 5. Instrument Sans + IBM Plex Mono; no AI slop; no mana/kete; no partnership claims.
 */

export const BLUEPRINT_TOKENS = {
  plum: '#240B21',
  muted: '#654A4E',
  rose: '#916A70',
  chalk: '#F5F1F2',
  paper: '#FFFDFB',
  heather: '#A8898E',
  mulberry: '#7A4E5A',
  line: 'rgba(245, 241, 242, 0.12)',
  lineStrong: 'rgba(145, 106, 112, 0.55)',
  grid: 'rgba(245, 241, 242, 0.09)',
} as const;

export type AgentAppVerticalId = 'arc' | 'forge';

export type BlueprintStep = {
  id: string;
  label: string;
  title: string;
  body: string;
};

export type BlueprintVerticalCraft = {
  id: AgentAppVerticalId;
  /** Product name in lowercase */
  name: string;
  /** One-line industry metaphor */
  metaphor: string;
  /** Assembling parts language for plan drawings */
  partsLabel: string;
  /** DEMO drawing caption for the assembling stage */
  drawingCaption: string;
  steps: BlueprintStep[];
};

/** Arc — building parts assemble into a coherent NZ plan. */
export const ARC_BLUEPRINT_CRAFT: BlueprintVerticalCraft = {
  id: 'arc',
  name: 'arc',
  metaphor: 'Building parts assemble into a coherent plan.',
  partsLabel: 'walls · openings · stair · deck',
  drawingCaption: 'DEMO · NZ terrace infill · AUP H4 sketch',
  steps: [
    {
      id: 'observe',
      label: '01',
      title: 'Observe',
      body: 'Arc watches the model as spaces take shape — clearances, barriers, travel paths, openings.',
    },
    {
      id: 'advise',
      label: '02',
      title: 'Advise',
      body: 'Each issue arrives with a clause citation and plain-language summary, ready for review.',
    },
    {
      id: 'act',
      label: '03',
      title: 'Act on approval',
      body: 'Drafts stay staged. A person approves before anything changes a drawing or leaves the desk.',
    },
  ],
};

/**
 * Placeholder craft shell for a future Forge vertical (car parts assembling).
 * Not rendered on Arc — kept so the kit stays multi-vertical by design.
 */
export const FORGE_BLUEPRINT_CRAFT: BlueprintVerticalCraft = {
  id: 'forge',
  name: 'forge',
  metaphor: 'Car parts assemble into a coherent build sheet.',
  partsLabel: 'body · chassis · trim · systems',
  drawingCaption: 'DEMO · build sheet · parts assembling',
  steps: [
    {
      id: 'observe',
      label: '01',
      title: 'Observe',
      body: 'Forge watches the build sheet as assemblies take shape.',
    },
    {
      id: 'advise',
      label: '02',
      title: 'Advise',
      body: 'Each flag cites the standard and waits in plain language.',
    },
    {
      id: 'act',
      label: '03',
      title: 'Act on approval',
      body: 'Edits stay staged until a person signs them.',
    },
  ],
};

export function getBlueprintCraft(id: AgentAppVerticalId): BlueprintVerticalCraft {
  return id === 'forge' ? FORGE_BLUEPRINT_CRAFT : ARC_BLUEPRINT_CRAFT;
}
