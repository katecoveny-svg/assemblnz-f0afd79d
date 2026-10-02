import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LifeAdmin } from './LifeAdmin';
import { PersonalDoCharacter } from './PersonalDoCharacter';

describe('Personal DO visual entry', () => {
  it('lets guests start their own note before opting into fictional examples', () => {
    const html = renderToStaticMarkup(createElement(LifeAdmin, { storageScope: 'guest' }));
    expect(html).not.toContain('data-example=');
    expect(html).toContain('aria-label="Try fictional school notice"');
    expect(html).toContain('Fictional example · on this device');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('Your personal agent.');
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
    expect(html).toContain('Make a checklist');
    expect(html).toContain('id="personal-local-checklist" hidden=""');
    expect(html).toContain('Saved checklists');
    expect(html).toContain('Photo');
    expect(html).toContain('Paste a notice');
    expect(html).not.toContain('Guest work stays on this page');
  });
  it('renders distinct SVG definition IDs for multiple decorative DO identities', () => {
    const html = renderToStaticMarkup(createElement(Fragment, null, createElement(PersonalDoCharacter, { avatar: 'bloom' }), createElement(PersonalDoCharacter, { avatar: 'pebble' })));
    const ids = [...html.matchAll(/ id="([^"]+)"/g)].map(match => match[1]);
    expect(ids.length).toBeGreaterThan(5);
    expect(new Set(ids).size).toBe(ids.length);
    expect(html).toContain('M16 12H29C44 12 52 20 52 32S44 52 29 52H16Z');
    expect(html.match(/aria-hidden="true"/g)).toHaveLength(4);
  });
});
