import { describe, expect, it } from 'vitest';
import { DEFAULT_IMAGE_FRAMING as defaults, imageFrameGeometry } from './image-framing';

describe('image framing across preview and exports', () => {
  it('keeps the selected edge when a landscape photo fills a portrait', () => {
    const left = imageFrameGeometry(1080, 1920, 1920, 1080, { ...defaults, x: 0 });
    const right = imageFrameGeometry(1080, 1920, 1920, 1080, { ...defaults, x: 100 });
    expect(left.x).toBe(0);
    expect(right.x + right.drawWidth).toBeCloseTo(1080);
    expect(right.drawHeight).toBe(1920);
  });
  it('contains the entire image inside the frame', () => {
    const g = imageFrameGeometry(1000, 1000, 2000, 1000, { ...defaults, fit: 'contain', inset: 10 });
    expect(g).toEqual({ inset: 100, areaWidth: 800, areaHeight: 800, drawWidth: 800, drawHeight: 400, x: 100, y: 300 });
  });
  it('has identical composition at preview and export resolutions', () => {
    const f = { ...defaults, x: 23, y: 71, zoom: 1.8, inset: 4 };
    const preview = imageFrameGeometry(480, 600, 1672, 941, f);
    const output = imageFrameGeometry(1080, 1350, 1672, 941, f);
    for (const key of Object.keys(preview) as Array<keyof typeof preview>) expect(output[key]).toBeCloseTo(preview[key] * 2.25);
  });
  it('rejects unusable image dimensions and bounds invalid controls', () => {
    expect(() => imageFrameGeometry(1080, 1080, 0, 100, defaults)).toThrow();
    const g = imageFrameGeometry(100, 100, 200, 100, { ...defaults, zoom: NaN, x: Infinity, y: -30 });
    expect(g.x).toBe(-50);
    expect(g.y).toBe(0);
  });
});
