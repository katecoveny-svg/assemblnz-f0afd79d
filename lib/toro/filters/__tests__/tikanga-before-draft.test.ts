import { describe, it, expect } from 'vitest';
import { tikangaBeforeDraft } from '../tikanga-before-draft';
import { makeCtx } from './test-helpers';

describe('tikanga_before_draft', () => {
  it('passes a benign incoming message', async () => {
    const ctx = makeCtx({ incomingMessage: 'Kia ora — what time is the school run today?' });
    const r = await tikangaBeforeDraft.run(ctx);
    expect(r.pass).toBe(true);
    expect(r.receiptAddition).toEqual({ tikanga_before: 'passed' });
  });

  it('flags reserved-term misuse and stops the pipeline', async () => {
    const ctx = makeCtx({
      incomingMessage: 'we want to use mana whenua as a brand for the new business',
    });
    const r = await tikangaBeforeDraft.run(ctx);
    expect(r.pass).toBe(false);
    expect(r.reason).toMatch(/mana whenua/);
    expect(r.receiptAddition).toMatchObject({ tikanga_before: expect.stringContaining('flagged') });
  });

  it('does not flag reserved terms when used in their proper sense', async () => {
    const ctx = makeCtx({
      incomingMessage: 'remind me to acknowledge mana whenua at the school assembly',
    });
    const r = await tikangaBeforeDraft.run(ctx);
    expect(r.pass).toBe(true);
  });
});
