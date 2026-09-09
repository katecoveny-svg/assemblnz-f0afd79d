import { describe, expect, it } from 'vitest';
import {
  ARC_BLUEPRINT_CRAFT,
  FORGE_BLUEPRINT_CRAFT,
  getBlueprintCraft,
  BLUEPRINT_TOKENS,
} from '@/lib/agent-app/blueprint-craft';
import { ARC_DEMO_VIOLATIONS } from '@/lib/arc/demo-violations';
import { ARC_PREVIEW } from '@/lib/arc/preview-copy';

describe('agent-app blueprint craft kit', () => {
  it('locks Kate craft tokens and reusable vertical craft', () => {
    expect(BLUEPRINT_TOKENS.plum).toBe('#240B21');
    expect(BLUEPRINT_TOKENS.rose).toBe('#916A70');
    expect(BLUEPRINT_TOKENS.heather).toBe('#A8898E');
    expect(BLUEPRINT_TOKENS.mulberry).toBe('#7A4E5A');
    expect(getBlueprintCraft('arc').name).toBe('arc');
    expect(getBlueprintCraft('forge').name).toBe('forge');
    expect(ARC_BLUEPRINT_CRAFT.metaphor).toBe(
      'Building parts assemble into a coherent plan.',
    );
    expect(ARC_BLUEPRINT_CRAFT.drawingCaption.toLowerCase()).toContain('nz terrace');
    expect(FORGE_BLUEPRINT_CRAFT.partsLabel.length).toBeGreaterThan(0);
    expect(ARC_BLUEPRINT_CRAFT.steps.map((s) => s.id)).toEqual([
      'observe',
      'advise',
      'act',
    ]);
  });
});

describe('Arc PREVIEW demo data', () => {
  it('labels every pin as DEMO with NZ-class codes', () => {
    expect(ARC_DEMO_VIOLATIONS.length).toBeGreaterThanOrEqual(3);
    for (const v of ARC_DEMO_VIOLATIONS) {
      expect(v.demo).toBe(true);
      expect(v.code.length).toBeGreaterThan(3);
      expect(v.position).toHaveLength(3);
    }
  });

  it('keeps preview copy free of partnership claims and retired product labels', () => {
    const blob = JSON.stringify({ ARC_PREVIEW, ARC_BLUEPRINT_CRAFT }).toLowerCase();
    expect(blob).not.toMatch(/\bmana\b/);
    expect(blob).not.toMatch(/\bkete\b/);
    expect(blob).not.toMatch(/\btoa\b/);
    expect(blob).not.toMatch(/heron/);
    expect(blob).not.toMatch(/bearplus/);
    expect(blob).not.toMatch(/partner with/);
    expect(blob).not.toMatch(/#f4f1ea|#ff5|#ff6|orange/);
    expect(blob).toContain('independent concept');
    expect(blob).toContain('building parts assemble');
    expect(ARC_PREVIEW.tiers.map((t) => t.name)).toEqual([
      'Look',
      'Practice',
      'Studio',
      'Enterprise',
    ]);
    expect(ARC_PREVIEW.tiers.map((t) => t.price)).toEqual([
      'Free',
      '~NZ$99',
      '~NZ$295',
      'Custom',
    ]);
  });
});
