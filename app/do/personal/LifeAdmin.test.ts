import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LifeAdmin } from './LifeAdmin';
import { PersonalDoCharacter } from './PersonalDoCharacter';

describe('Personal DO visual entry', () => {
  it('lets guests start their own note before opting into fictional examples', () => {
    const html = renderToStaticMarkup(createElement(LifeAdmin, { storageScope: 'guest' }));
    expect(html).not.toContain('data-example=');
    expect(html).not.toContain('aria-label="Try fictional school notice"');
    expect(html).toContain('Try a fictional example');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-label="What would make life easier?"');
    expect(html).toContain('Start');
    expect(html).toContain('data-do-primary-input="true"');
    expect(html).toContain('What’s underway');
    expect(html).toContain('Keep going.');
    expect(html).not.toContain('Your first three steps');
  });
  it('keeps one primary assistant input with local capture available by choice', () => {
    const assistant = createElement('textarea', { id: 'personal-assistant-input', 'data-do-primary-input': true, 'aria-label': 'Main assistant test input' });
    const html = renderToStaticMarkup(createElement(LifeAdmin, { storageScope: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', assistant }));
    expect(html.match(/data-do-primary-input="true"/g)).toHaveLength(1);
    expect(html).toContain('id="personal-assistant-input"');
    expect(html).toContain('Note or checklist');
    expect([...html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)].map(match => match[1].replace(/<[^>]*>/g, '').trim())).toContain('Write');
    expect(html).toContain('id="personal-local-checklist" hidden=""');
    expect(html).toContain('Saved checklists');
    expect(html).toContain('Photo');
    expect(html).toContain('Paste a notice');
    expect(html).not.toContain('Guest work stays on this page');
  });
  it('renders multiple decorative identities from the exact glass artwork without SVG ID collisions', () => {
    const html = renderToStaticMarkup(createElement(Fragment, null, createElement(PersonalDoCharacter, { avatar: 'bloom' }), createElement(PersonalDoCharacter, { avatar: 'pebble' })));
    expect(html.match(/data-glass-identity="do"/g)).toHaveLength(2);
    expect(html.match(/src="\/brand\/do-glass-D-transparent.png\?v=cutout1"/g)).toHaveLength(2);
    expect(html.match(/alt=""/g)).toHaveLength(2);
    expect(html).not.toContain('<svg');
    expect(html).not.toContain('url(#');
    expect(html.match(/aria-hidden="true"/g)).toHaveLength(6);
    expect(html).toContain('data-finish="plum"');
    expect(html).toContain('data-finish="paper"');
  });
});
