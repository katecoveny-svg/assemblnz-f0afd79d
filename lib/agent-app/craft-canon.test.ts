import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  AGENT_APP_COPY_HARD_FAIL,
  AGENT_APP_CRAFT,
} from '@/lib/agent-app/craft-canon';

const root = process.cwd();

function read(rel: string) {
  return readFileSync(join(root, rel), 'utf8');
}

describe('agent-app factory craft canon (paper + plum accent)', () => {
  it('locks shared CSS to paper field — never full dark plum wash', () => {
    const css = read('components/agent-app/agent-app-craft.css');
    expect(css).toContain(`background-color: var(--aa-paper)`);
    expect(css).toMatch(/--aa-paper:\s*#fffdfb/i);
    expect(css).toMatch(/--aa-plum:\s*#240b21/i);
    expect(css).toMatch(/Instrument Sans/);
    expect(css).toMatch(/IBM Plex Mono/);

    for (const hex of AGENT_APP_CRAFT.bannedFieldHex) {
      expect(css.toLowerCase()).not.toContain(hex.toLowerCase());
    }

    // No full-field dark radial/linear plum wash on .aa-root
    expect(css).not.toMatch(
      /\.aa-root\s*\{[^}]*linear-gradient\([^)]*#1[0-9a-f]{5}/is,
    );
  });

  it('keeps BlueprintScene + PlanPins on paper sheets with plum ink', () => {
    const scene = read('components/agent-app/BlueprintScene.tsx');
    const pins = read('components/agent-app/PlanPins.tsx');
    expect(scene).toContain('fill="#FFFDFB"');
    expect(pins).toContain('fill="#FFFDFB"');
    expect(scene).toContain('stroke="#240B21"');
    expect(pins).toContain('stroke="#240B21"');
    for (const hex of AGENT_APP_CRAFT.bannedFieldHex) {
      expect(scene.toLowerCase()).not.toContain(hex.toLowerCase());
      expect(pins.toLowerCase()).not.toContain(hex.toLowerCase());
    }
  });

  it('hard-fails AI-slop / mana / kete / partnership claims in preview copy', () => {
    const blobs = [
      read('lib/arc/preview-copy.ts'),
      read('lib/forge/preview-copy.ts'),
      read('lib/ensemble/preview-copy.ts'),
    ].join('\n');

    // Strip block comments so "No mana/kete" doc lines don't false-positive.
    const code = blobs.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

    for (const re of AGENT_APP_COPY_HARD_FAIL) {
      expect(code).not.toMatch(re);
    }

    expect(code.toLowerCase()).toContain('independent concept');
  });

  it('exports craft attr for aa-root surfaces', () => {
    expect(AGENT_APP_CRAFT.field).toBe('#FFFDFB');
    expect(AGENT_APP_CRAFT.plum).toBe('#240B21');
    expect(AGENT_APP_CRAFT.rootClass).toBe('aa-root');
  });

  it('keeps Ensemble off BlueprintScene / PlanPins (creative desk, not floor plate)', () => {
    const landing = read('components/ensemble/EnsembleLanding.tsx')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    expect(landing).not.toMatch(/\bBlueprintScene\b/);
    expect(landing).not.toMatch(/\bPlanPins\b/);
    expect(landing).not.toMatch(/\bEnsemblePlanSvg\b/);
    expect(landing).toMatch(/EnsembleCreativeDesk/);
    expect(landing).toMatch(/EnsembleBriefDesk/);
    expect(landing).toMatch(/EnsembleBrandBoard/);
    expect(landing).toMatch(/EnsembleClaimPins/);
    expect(landing).toMatch(/observeStatus=/);
    expect(landing).not.toMatch(/floor plate/i);
  });

  it('keeps Forge off BlueprintScene / PlanPins (automotive bay, not floor plate)', () => {
    const landing = read('components/forge/ForgeLanding.tsx')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    const copy = read('lib/forge/preview-copy.ts')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    expect(landing).not.toMatch(/\bBlueprintScene\b/);
    expect(landing).not.toMatch(/\bPlanPins\b/);
    expect(landing).not.toMatch(/\bForgePlanSvg\b/);
    expect(landing).toMatch(/ForgeBayFlags/);
    expect(landing).toMatch(/observeStatus=/);
    expect(landing).toMatch(/aratakiHref|\/agents\/arataki/);
    expect(copy.toLowerCase()).not.toContain('floor plate');
  });
});
