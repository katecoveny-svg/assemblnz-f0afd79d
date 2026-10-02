import { describe, expect, it } from 'vitest';
import { DO_IDENTITY as colours } from './do-identity';
function luminance(hex: string) {
  const rgb = hex.slice(1).match(/../g)!.map(channel => parseInt(channel, 16) / 255)
    .map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
  return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
}
function contrast(a: string, b: string) {
  const levels = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (levels[0] + .05) / (levels[1] + .05);
}
describe('DO readable controls and tiny identity', () => {
  it.each(['chalk', 'lilac', 'paper'] as const)('body copy passes AA on %s', surface => {
    expect(contrast(colours.ink, colours[surface])).toBeGreaterThanOrEqual(4.5);
  });
  it.each(['plum', 'hover', 'active'] as const)('primary label passes AA in %s state', state => {
    expect(contrast(colours.paper, colours[state])).toBeGreaterThanOrEqual(4.5);
  });
  it('tiny D and dot remain distinguishable against the canvas', () => {
    expect(contrast(colours.plum, colours.chalk)).toBeGreaterThanOrEqual(3);
  });
});
