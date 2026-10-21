import { describe, expect, it } from 'vitest';
import { assemblyViews, hasAssembly } from './assembly';
import { widgetSpec } from './widget';

describe('assembled views', () => {
  const handles = ['al-pod-standard', 'al-pod-mini', 'lab-emergency-pack', 'lab-dayrally-rod', 'al-hook', 'al-shelf-3', 'al-bar-saddle'];
  it('fills every view of every handle from the widget defaults with served files', () => {
    for (const h of handles) {
      expect(hasAssembly(h)).toBe(true);
      const spec = widgetSpec(h)!;
      const ids = spec.partsFor({}).map((p) => p.id);
      const views = assemblyViews(h, ids);
      expect(views.length).toBeGreaterThan(0);
      for (const v of views) {
        expect(v.parts.length).toBeGreaterThan(0);
        for (const p of v.parts) {
          expect(p.matrix).toHaveLength(16);
          expect(p.path).toMatch(/^\/living\/cad\//);
        }
      }
    }
  });
  it('puts the chosen lid and insert in the pod, and the name as a text area rather than the sample inlay', () => {
    const spec = widgetSpec('al-pod-standard')!;
    const chosen = spec.partsFor({ lid: 'name', insert: 'tech' }).map((p) => p.id);
    const [closed] = assemblyViews('al-pod-standard', chosen);
    const ids = closed.parts.map((p) => p.partId);
    expect(ids).toContain('dr2-lid-standard-plain');
    expect(ids).not.toContain('dr2-lid-standard-name');
    expect(ids).toContain('dr2-insert-standard-tech');
    expect(ids).not.toContain('dr2-lid-standard-name-inlay');
    expect(closed.texts).toHaveLength(1);
    const waves = spec.partsFor({ lid: 'waves', insert: 'tech' }).map((p) => p.id);
    const [wavesClosed] = assemblyViews('al-pod-standard', waves);
    expect(wavesClosed.parts.map((p) => p.partId)).toContain('dr2-lid-standard-waves-inlay');
    expect(wavesClosed.texts).toHaveLength(0);
  });
});
