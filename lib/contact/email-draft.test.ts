import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ContactForm } from '../../components/site/contact-form';
import { contactEmailDraft, initialProjectTopic } from './email-draft';

describe('contact email handoff', () => {
  const brief = { name: 'Fictional visitor', email: 'visitor@example.invalid', business: 'Example workshop', topic: 'experience', message: 'A fictional website brief with Māori text & a link.' };
  it('preserves the exact draft with one fixed recipient and encoded fields', () => {
    const draft = contactEmailDraft({ ...brief, message: brief.message + '\n&bcc=other@example.invalid' });
    const url = new URL(draft.href);
    expect(url.pathname).toBe('assembl@assembl.co.nz');
    expect([...url.searchParams.keys()]).toEqual(['subject', 'body']);
    expect(url.searchParams.get('body')).toBe(draft.body);
    expect(draft.body).toContain('Māori text');
    expect(draft.href).not.toContain('&bcc=');
  });
  it('keeps legacy inbound product hints useful without offering unfinished products', () => {
    expect(initialProjectTopic('studio')).toBe('experience');
    expect(initialProjectTopic('do')).toBe('workflow');
    expect(initialProjectTopic('pursuit')).toBe('idea');
    expect(initialProjectTopic('unknown')).toBe('other');
  });
  it('bounds fields and rejects arbitrary topic text from email headers', () => {
    const draft = contactEmailDraft({ ...brief, topic: 'x\nBcc: other@example.invalid', message: 'a'.repeat(5000) });
    expect(draft.subject).toBe('assembl enquiry — Something else');
    expect(draft.body).not.toContain('a'.repeat(4001));
  });
  it('cannot submit before hydration and provides direct email without JavaScript', () => {
    const html = renderToStaticMarkup(createElement(ContactForm));
    expect(html).toMatch(/<fieldset[^>]*disabled/);
    expect(html).toContain('<noscript>');
    expect(html).toContain('mailto:assembl@assembl.co.nz');
    expect(html).not.toContain('mailto:assembl@assembl.co.nz?');
    expect(html).toContain('Review email draft');
    expect(html).not.toContain('Try an agent free');
  });
});
