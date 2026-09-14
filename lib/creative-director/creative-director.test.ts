import { describe, expect, it } from 'vitest';
import {
  compileCreativeIntent,
  formatCreativeIntentBlock,
  inventArtDirections,
  suggestConstruct,
  runCreativeCritic,
  seedEnergyDemo,
  ENERGY_DEMO_PROMPT,
} from './index';
import { REGISTRY_BLOCKS as PACKAGE_BLOCKS } from '../../packages/registry/src/index';

describe('creative director prompt compiler', () => {
  it('compiles the energy DEMO prompt into a structured intent', () => {
    const intent = compileCreativeIntent(ENERGY_DEMO_PROMPT);
    expect(intent.coreIdea.length).toBeGreaterThan(20);
    expect(intent.brand.toLowerCase()).toContain('energy');
    expect(intent.audience.toLowerCase()).toContain('household');
    expect(intent.avoid.some((a) => /card-grid/i.test(a))).toBe(true);
    expect(intent.qualityGate.some((q) => /2s/i.test(q))).toBe(true);
    const block = formatCreativeIntentBlock(intent);
    expect(block).toContain('CREATIVE INTENT');
    expect(block).toContain('Avoid:');
  });
});

describe('art directions', () => {
  it('returns exactly three materially different directions', () => {
    const intent = compileCreativeIntent(ENERGY_DEMO_PROMPT);
    const dirs = inventArtDirections(intent);
    expect(dirs).toHaveLength(3);
    const ids = new Set(dirs.map((d) => d.id));
    expect(ids.size).toBe(3);
    const metaphors = new Set(dirs.map((d) => d.metaphor));
    const motions = new Set(dirs.map((d) => d.motion));
    const types = new Set(dirs.map((d) => d.type));
    expect(metaphors.size).toBe(3);
    expect(motions.size).toBe(3);
    expect(types.size).toBe(3);
  });
});

describe('energy DEMO seed', () => {
  it('wires understand → directions → construct suggestion → critic', () => {
    const seed = seedEnergyDemo();
    expect(seed.prompt).toBe(ENERGY_DEMO_PROMPT);
    expect(seed.directions).toHaveLength(3);
    expect(seed.suggestedDirectionId).toBe('aerial-assembly');
    expect(seed.visualTargets).toHaveLength(4);
    expect(seed.suggestedConstruct).toBe(
      suggestConstruct(seed.directions.find((d) => d.id === 'aerial-assembly')!),
    );
    expect(seed.criticPreview.passed).toBe(true);
    expect(seed.criticPreview.reviseReasons).toHaveLength(0);
  });
});

describe('creative critic', () => {
  it('fails when construct grammar mismatches editorial direction', () => {
    const intent = compileCreativeIntent(ENERGY_DEMO_PROMPT);
    const editorial = inventArtDirections(intent).find((d) => d.id === 'editorial-scroll')!;
    const result = runCreativeCritic({
      intent,
      direction: editorial,
      construct: 'spatial-r3f',
    });
    expect(result.passed).toBe(false);
    expect(result.reviseReasons.some((r) => /grammar/i.test(r))).toBe(true);
  });

  it('warns when screenshots are missing but can still pass checklist', () => {
    const seed = seedEnergyDemo();
    const direction = seed.directions.find((d) => d.id === seed.suggestedDirectionId)!;
    const result = runCreativeCritic({
      intent: seed.intent,
      direction,
      construct: seed.suggestedConstruct,
    });
    expect(result.checks.some((c) => c.id === 'screenshot-loop' && c.severity === 'warn')).toBe(
      true,
    );
    expect(result.passed).toBe(true);
  });
});

describe('registry scaffold', () => {
  it('exposes the ten @assembl/* block names', () => {
    expect(PACKAGE_BLOCKS).toHaveLength(10);
    expect(PACKAGE_BLOCKS).toContain('cinema-hero');
    expect(PACKAGE_BLOCKS).toContain('nz-material');
    // Local re-export mirror kept in sync via package — assert package source of truth.
    expect(PACKAGE_BLOCKS).toEqual([
      'cinema-hero',
      'sideways-story',
      'object-assembly',
      'aerial-world',
      'agent-live',
      'wait-state',
      'editorial-type',
      'camera-scroll',
      'particle-field',
      'nz-material',
    ]);
  });
});
