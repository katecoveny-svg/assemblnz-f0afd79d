import { describe, expect, it } from 'vitest';
import { DO_CAPABILITY_CATALOGUE } from './capability-catalogue';

describe('personal tool capability copy', () => {
  it('describes useful work without implementation jargon or production claims', () => {
    for (const card of DO_CAPABILITY_CATALOGUE) {
      expect(card.description, card.key).not.toMatch(/production pilot|connector-action|approval-gated|Assembl-configured|Three\.js|React Three Fiber|pipeline|adapters/);
    }
  });
  it('labels calendar creation as an approval-required external write, retaining its compatible key', () => {
    const calendar = DO_CAPABILITY_CATALOGUE.find((card) => card.key === 'calendar_draft');
    expect(calendar?.label).toBe('Create a calendar event');
    expect(calendar?.authority).toBe('approval_required');
    expect(calendar?.description).toContain('after you approve');
    expect(calendar?.description).toContain('not a draft');
  });
  it('distinguishes preparing email in DO from a separately approved Gmail write', () => {
    const email = DO_CAPABILITY_CATALOGUE.find((card) => card.key === 'email_draft');
    expect(email?.label).toBe('Prepare email in DO');
    expect(email?.authority).toBe('prepare');
    expect(email?.description).toContain('without connecting a mailbox');
    expect(email?.description).toContain('read-only');
    expect(email?.description).toContain('Saving a draft in Gmail needs a separately approved write permission');
  });
});
