import { describe, it, expect } from 'vitest';
import { tikangaAfterDraft } from '../tikanga-after-draft';
import { makeCtx } from './test-helpers';

describe('tikanga_after_draft', () => {
  it('passes a draft using correct macrons', async () => {
    const ctx = makeCtx({
      draftBody: 'Kia ora — Tōro will remind the whānau about the school run.',
    });
    const r = await tikangaAfterDraft.run(ctx);
    expect(r.pass).toBe(true);
    expect(r.receiptAddition).toEqual({ tikanga_after: 'passed' });
  });

  it('flags missing macrons on Tōro / whānau', async () => {
    const ctx = makeCtx({
      draftBody: 'Kia ora — Toro will remind the whanau about the school run.',
    });
    const r = await tikangaAfterDraft.run(ctx);
    expect(r.pass).toBe(true);
    const addition = r.receiptAddition as { tikanga_after: string; flags: string[] };
    expect(addition.tikanga_after).toMatch(/^flagged:/);
    expect(addition.flags.join(' ')).toMatch(/Toro/);
    expect(addition.flags.join(' ')).toMatch(/whanau/);
  });

  it('flags the banned token "AI" in customer-facing copy', async () => {
    const ctx = makeCtx({
      draftBody: 'AI will summarise the school newsletter for you.',
    });
    const r = await tikangaAfterDraft.run(ctx);
    expect(r.pass).toBe(true);
    const addition = r.receiptAddition as { flags?: string[] };
    expect(addition.flags?.some((f) => f.includes('"AI"'))).toBe(true);
  });

  it('does not flag lowercase "ai" (the Māori word)', async () => {
    const ctx = makeCtx({
      draftBody: 'mō te kura ai — pickup at 3pm',
    });
    const r = await tikangaAfterDraft.run(ctx);
    expect(r.pass).toBe(true);
    expect(r.receiptAddition).toEqual({ tikanga_after: 'passed' });
  });

  it('passes a draft with no draft body (early-phase call)', async () => {
    const ctx = makeCtx({ draftBody: undefined });
    const r = await tikangaAfterDraft.run(ctx);
    expect(r.pass).toBe(true);
    expect(r.receiptAddition).toEqual({ tikanga_after: 'passed' });
  });
});
