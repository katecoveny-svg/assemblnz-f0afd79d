import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CHAPTERS, MACHINES, frameAt, framePaths, loadOrder, sectionProgress, stepsDone, storyProgress } from './story';

describe('home scroll story', () => {
  it('maps scroll position to progress within the sticky travel', () => {
    expect(sectionProgress(100, 3000, 800)).toBe(0);
    expect(sectionProgress(-1100, 3000, 800)).toBe(0.5);
    expect(sectionProgress(-5000, 3000, 800)).toBe(1);
  });
  it('blends neighbouring frames and stays in range', () => {
    expect(frameAt(0, 24)).toEqual({ a: 0, b: 1, mix: 0 });
    expect(frameAt(1, 24)).toEqual({ a: 23, b: 23, mix: 0 });
    const mid = frameAt(0.5, 3);
    expect(mid.a).toBe(1); expect(mid.mix).toBeCloseTo(0);
  });
  it('loads a coarse pass first, then every remaining frame once', () => {
    const order = loadOrder(10, 4);
    expect(order.slice(0, 4)).toEqual([0, 4, 8, 9]);
    expect([...order].sort((a, b) => a - b)).toEqual([...Array(10).keys()]);
  });
  it('ticks steps across the chapter and finishes them all', () => {
    expect(stepsDone(0, 4)).toBe(0);
    expect(stepsDone(0.07, 4)).toBe(1);
    expect(stepsDone(0.5, 4)).toBe(2);
    expect(stepsDone(1, 4)).toBe(4);
  });
  it('holds briefly at each end of a chapter and runs the world through the middle', () => {
    expect(storyProgress(0.03)).toBe(0);
    expect(storyProgress(0.95)).toBe(1);
    expect(storyProgress(0.49)).toBeCloseTo(0.5);
  });
  it('ships every frame, poster and machine it references', () => {
    for (const chapter of CHAPTERS) {
      for (const path of [...framePaths(chapter.frames), ...framePaths(chapter.phoneFrames ?? []), chapter.poster, chapter.phonePoster ?? chapter.poster]) {
        expect(existsSync(`public${path}`), path).toBe(true);
      }
    }
    for (const machine of MACHINES) expect(existsSync(`public${machine.src}`), machine.src).toBe(true);
  });
  it('labels every world as simulated, illustrative or rendered in real text', () => {
    for (const chapter of CHAPTERS) expect(chapter.label).toMatch(/^(Simulated|Illustrative|Rendered)/);
  });
  it('keeps the real links: nav, website check, contact, Ask DO and the legal footer', () => {
    const source = readFileSync('components/site/home-scroll-story/HomeScrollStory.tsx', 'utf8');
    expect(source).toContain('href="/lab"');
    expect(source).toContain('href="/contact"');
    expect(source).toContain('Bring us the work');
    expect(source).toContain('Start a conversation');
    expect(source).toContain("new Event('assembl:open-public-guide')");
    expect(source).toContain('footerMarkup');
    expect(source).toMatch(/<GlassIdentity kind="assembl"/);
    expect(source).toContain('href="/ai-ready"');
  });
});
