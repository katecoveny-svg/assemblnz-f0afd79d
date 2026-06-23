/**
 * Pilot (Kaiurungi) — shared types for the guided agent-maker flow.
 *
 * A PilotDraft is the running spec the seven steps build up. It is held in the
 * browser as the user moves through the flow, posted to the prompt-generation
 * and sandbox endpoints, and persisted to public.pilot_agents on ship.
 */

export type ModelPreference = 'claude' | 'gpt' | 'gemini' | 'llama';

export type PriceTier = 'free' | 'toro' | 'whanau' | 'pro' | 'business';

export type DraftStatus = 'draft' | 'submitted' | 'published' | 'archived';

/** How often the agent runs — step 2. */
export type Frequency = 'one-off' | 'daily' | 'when-i-ask' | 'event-triggered';

/** Step 2 — the goal. */
export interface PilotGoal {
  /** what it produces */
  output: string;
  /** who reads it */
  audience: string;
  frequency: Frequency | '';
}

/** Step 3 — inputs + access. */
export interface PilotInputs {
  /** what it needs to start */
  needs: string[];
  /** what it can access */
  access: string[];
}

/** The full running spec across all seven steps. */
export interface PilotDraft {
  /** present once persisted */
  id?: string;
  slug: string;
  name: string;
  teReo: string;
  description: string;
  category: string;
  icon: string;
  accent: string;
  goal: PilotGoal;
  inputs: PilotInputs;
  /** selected tool ids from the registry */
  tools: string[];
  /** NZ Acts / standards auto-added for the category */
  compliance: string[];
  modelPreference: ModelPreference;
  systemPrompt: string;
  priceTier: PriceTier;
  status: DraftStatus;
}

export function emptyDraft(): PilotDraft {
  return {
    slug: '',
    name: '',
    teReo: '',
    description: '',
    category: 'build',
    icon: 'spark',
    accent: '#FFD42A',
    goal: { output: '', audience: '', frequency: '' },
    inputs: { needs: [], access: [] },
    tools: [],
    compliance: [],
    modelPreference: 'claude',
    systemPrompt: '',
    priceTier: 'free',
    status: 'draft',
  };
}
