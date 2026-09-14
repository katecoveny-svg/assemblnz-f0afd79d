/**
 * Seed DEMO — NZ energy company cinematic demonstrator.
 * Fictional fixture. No real client branding.
 */

import { inventArtDirections } from './directions';
import { compileCreativeIntent } from './prompt-compiler';
import { buildVisualTargets, suggestConstruct } from './construct';
import { runCreativeCritic } from './critic';
import type {
  ArtDirection,
  ConstructGrammar,
  CreativeIntent,
  CriticResult,
  DirectionId,
  VisualTarget,
} from './types';

export const ENERGY_DEMO_PROMPT =
  'Create a phenomenal cinematic demonstrator for an NZ energy company showing an agent assembling a better household energy plan';

export const ENERGY_DEMO_LABEL =
  'DEMO · NZ energy · sample business — details fictional';

export interface EnergyDemoSeed {
  prompt: string;
  intent: CreativeIntent;
  directions: ArtDirection[];
  /** Pre-selected for a one-click walkthrough; Kate can still change it. */
  suggestedDirectionId: DirectionId;
  visualTargets: VisualTarget[];
  suggestedConstruct: ConstructGrammar;
  /** Critic after applying suggested direction + construct. */
  criticPreview: CriticResult;
}

export function seedEnergyDemo(): EnergyDemoSeed {
  const prompt = ENERGY_DEMO_PROMPT;
  const intent = compileCreativeIntent(prompt);
  const directions = inventArtDirections(intent);
  const suggestedDirectionId: DirectionId = 'aerial-assembly';
  const direction =
    directions.find((d) => d.id === suggestedDirectionId) ?? directions[0]!;
  const visualTargets = buildVisualTargets(direction);
  const suggestedConstruct = suggestConstruct(direction);
  const criticPreview = runCreativeCritic({
    intent,
    direction,
    construct: suggestedConstruct,
  });

  return {
    prompt,
    intent,
    directions,
    suggestedDirectionId,
    visualTargets,
    suggestedConstruct,
    criticPreview,
  };
}
