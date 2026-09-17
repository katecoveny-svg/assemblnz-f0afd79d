import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DoFilm } from './DoFilm';

describe('DoFilm craft', () => {
  it('keeps paper headline and drops abstract eyebrow / motion-study chrome', () => {
    const html = renderToStaticMarkup(createElement(DoFilm));
    expect(html).toContain('A little possibility.');
    expect(html).toContain('Put into motion.');
    expect(html).toContain('Talk about DO');
    expect(html).not.toContain('AN IMAGINED WORLD');
    expect(html).not.toContain('YOUR NEXT PIECE OF WORK');
    expect(html).not.toContain('DO / motion study');
  });

  it('pins headline color to paper so global h2 ink cannot read green on plum', () => {
    const css = readFileSync(join(__dirname, 'do-film.module.css'), 'utf8');
    const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(withoutComments).toMatch(/\.copy h2\s*\{[^}]*color:\s*#fffdfb/s);
    expect(withoutComments).not.toMatch(/#252d31|#3f7373|#2b6b57/i);
  });
});
