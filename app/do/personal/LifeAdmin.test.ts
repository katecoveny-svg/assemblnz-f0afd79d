import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LifeAdmin } from './LifeAdmin';
import { PersonalDoCharacter } from './PersonalDoCharacter';

describe('Personal DO visual entry', () => {
  it('shows three explicitly fictional local examples and one own-note path', () => {
    const html = renderToStaticMarkup(createElement(LifeAdmin, { storageScope: 'guest' }));
    expect(html).toContain('aria-label="Try a fictional example"');
    expect(html).toContain('aria-label="Try school notice"');
    expect(html).toContain('aria-label="Try bill example"');
    expect(html).toContain('aria-label="Try car reminder"');
    expect(html).toContain('Fictional examples. Real checklists. Nothing sent.');
    expect(html).toContain('Use my own note');
    expect(html).toContain('Let’s sort it');
    expect(html).toContain('data-do-primary-input="true"');
    expect(html).toContain('What’s underway');
    expect(html).toContain('More things to sort');
    expect(html).not.toContain('Your first three steps');
  });
  it('accepts an owner-scoped assistant slot while keeping local capture as an optional disclosure', () => {
    const assistant = createElement('textarea', { id: 'personal-assistant-input', 'data-do-primary-input': true, 'aria-label': 'Main assistant test input' });
    const html = renderToStaticMarkup(createElement(LifeAdmin, { storageScope: 'owner-a', assistant }));
    expect(html.match(/data-do-primary-input="true"/g)).toHaveLength(1);
    expect(html).toContain('id="personal-assistant-input"');
    expect(html).toContain('Use a local checklist');
    expect(html).toContain('Works on this device, without sending your note for drafting.');
    expect(html).toContain('Photo');
    expect(html).toContain('Forward');
    expect(html).not.toContain('Guest work stays on this page');
  });
  it('renders distinct SVG definition IDs for multiple decorative DO identities', () => {
    const html = renderToStaticMarkup(createElement(Fragment, null, createElement(PersonalDoCharacter, { avatar: 'bloom' }), createElement(PersonalDoCharacter, { avatar: 'pebble' })));
    const ids = [...html.matchAll(/ id="([^"]+)"/g)].map(match => match[1]);
    expect(ids.length).toBeGreaterThan(5);
    expect(new Set(ids).size).toBe(ids.length);
    expect(html).toContain('fill-rule="evenodd"');
    expect(html.match(/aria-hidden="true"/g)).toHaveLength(2);
  });
});
