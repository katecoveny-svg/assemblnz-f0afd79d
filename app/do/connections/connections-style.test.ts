import { readFileSync } from 'node:fs';
import { parse } from 'postcss';
import { describe, expect, it } from 'vitest';

const css = parse(readFileSync(new URL('./connections.module.css', import.meta.url), 'utf8'));
function declaration(selector: string, property: string) {
  let value: string | undefined;
  css.walkRules(selector, (rule) => { rule.walkDecls(property, (decl) => { value = decl.value; }); });
  return value;
}

describe('Connections responsive style contract', () => {
  it('uses paper, practical targets and visible keyboard focus instead of a dense provider dashboard', () => {
    expect(declaration('.shell', 'background')).toBe('#fffdfb');
    expect(declaration('.shell', 'font-family')).toContain('Instrument Sans');
    expect(declaration('.shell button, .shell input, .technical summary', 'min-height')).toBe('44px');
    expect(declaration('.shell :is(a, button, input, summary):focus-visible', 'outline')).toBe('2px solid #916a70');
    expect(declaration('.status, .card small, .cardTop > span', 'font-family')).toContain('IBM Plex Mono');
    let mobileGrid = false;
    css.walkAtRules('media', (rule) => {
      if (rule.params !== '(max-width: 640px)') return;
      rule.walkRules('.grid, .technical .grid', (grid) => {
        grid.walkDecls('grid-template-columns', (decl) => { mobileGrid = decl.value === 'minmax(0, 1fr)'; });
      });
    });
    expect(mobileGrid).toBe(true);
  });
});
