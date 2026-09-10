import { describe, expect, it } from 'vitest';
import { FORGE_DEMO_FLAGS } from '@/lib/forge/demo-flags';
import { FORGE_LIFECYCLE } from '@/lib/forge/lifecycle';
import { FORGE_PREVIEW } from '@/lib/forge/preview-copy';
import { AGENT_APP_COPY_HARD_FAIL } from '@/lib/agent-app/craft-canon';

describe('Forge PREVIEW demo data', () => {
  it('labels every bay flag as DEMO with NZTA / CCCFA codes', () => {
    expect(FORGE_DEMO_FLAGS.length).toBeGreaterThanOrEqual(3);
    for (const v of FORGE_DEMO_FLAGS) {
      expect(v.demo).toBe(true);
    }
    const blob = FORGE_DEMO_FLAGS.map((f) => f.code).join(' ');
    expect(blob).toMatch(/WoF/);
    expect(blob).toMatch(/CoF/);
    expect(blob).toMatch(/CCCFA/);
  });

  it('ships a connected four-stage DEMO journey', () => {
    expect(FORGE_LIFECYCLE.map((s) => s.id)).toEqual([
      'research',
      'sale',
      'service',
      'loyalty',
    ]);
    for (const stage of FORGE_LIFECYCLE) {
      expect(stage.demo).toBe(true);
      expect(stage.pinTitle.length).toBeGreaterThan(4);
      expect(stage.pinBody.toLowerCase()).toMatch(/demo|staged|approval|holds/);
    }
  });

  it('keeps preview copy free of partnership claims, floor plates, and retired labels', () => {
    const blob = JSON.stringify(FORGE_PREVIEW).toLowerCase();
    expect(blob).not.toMatch(/\bmana\b/);
    expect(blob).not.toMatch(/\bkete\b/);
    expect(blob).not.toMatch(/\btoa\b/);
    expect(blob).not.toMatch(/contact energy/);
    expect(blob).not.toMatch(/partner with/);
    expect(blob).not.toContain('floor plate');
    expect(blob).not.toContain('workshop work that cites');
    expect(blob).toContain('independent concept');
    expect(blob).toContain('arataki');
    expect(blob).toContain('demo');
    expect(blob).toContain('operating system');
    expect(blob).toContain('connected');
    expect(FORGE_PREVIEW.heroLine.toLowerCase()).toContain('connected dealership');
    expect(FORGE_PREVIEW.aratakiHref).toBe('/agents/arataki');
    expect(FORGE_PREVIEW.pillars).toHaveLength(5);
    expect(FORGE_PREVIEW.metrics.length).toBeGreaterThanOrEqual(4);
    expect(FORGE_PREVIEW.workflows.map((w) => w.id)).toEqual([
      'sales',
      'service',
      'chat',
      'yard',
      'loyalty',
    ]);
    expect(FORGE_PREVIEW.workflows.every((w) => w.output.length > 4 && w.state.length > 4)).toBe(
      true,
    );
    expect(FORGE_PREVIEW.tiers.map((t) => t.name)).toEqual([
      'Look',
      'Practice',
      'Studio',
      'Enterprise',
    ]);
  });

  it('hard-fails banned AI-slop / bare AI in Forge preview copy', () => {
    const code = JSON.stringify(FORGE_PREVIEW);
    for (const re of AGENT_APP_COPY_HARD_FAIL) {
      expect(code).not.toMatch(re);
    }
  });

  it('frames pricing as hours back', () => {
    expect(FORGE_PREVIEW.tiers.every((t) => typeof t.hoursBack === 'number')).toBe(true);
    expect(FORGE_PREVIEW.hoursBack.toLowerCase()).toContain('hours back');
  });
});
