import { describe, it, expect } from 'vitest';
import { ageGateAfterDraft } from '../age-gate-after-draft';
import { makeCtx } from './test-helpers';

describe('age_gate_after_draft', () => {
  it('passes with no_children_in_profile when profile has no children', async () => {
    const ctx = makeCtx({
      draftBody: 'remember the school run is at 8:15',
      memoryBlocks: { profile: {} },
    });
    const r = await ageGateAfterDraft.run(ctx);
    expect(r.pass).toBe(true);
    expect(r.receiptAddition).toEqual({ age_gate: 'no_children_in_profile' });
  });

  it('passes with no_child_mentions when the draft does not name any child', async () => {
    const ctx = makeCtx({
      draftBody: 'remember the school run is at 8:15',
      memoryBlocks: { profile: { children: [{ name: 'Niko' }, { name: 'Tama' }] } },
    });
    const r = await ageGateAfterDraft.run(ctx);
    expect(r.pass).toBe(true);
    expect(r.receiptAddition).toEqual({ age_gate: 'no_child_mentions' });
  });

  it('flags parent_only when the draft names a child', async () => {
    const ctx = makeCtx({
      draftBody: "Niko's pickup is at 3pm — let dad know",
      memoryBlocks: { profile: { children: [{ name: 'Niko' }, { name: 'Tama' }] } },
    });
    const r = await ageGateAfterDraft.run(ctx);
    expect(r.pass).toBe(true);
    expect(r.receiptAddition).toMatchObject({
      age_gate: 'parent_only',
      reason: expect.stringContaining('Niko'),
      children_mentioned: ['Niko'],
    });
  });

  it('matches preferred_name and nicknames as well as the canonical name', async () => {
    const ctx = makeCtx({
      draftBody: 'Beanie has gymnastics at 4',
      memoryBlocks: {
        profile: {
          children: [
            { name: 'Anahera', preferred_name: 'Annie', nicknames: ['Beanie'] },
          ],
        },
      },
    });
    const r = await ageGateAfterDraft.run(ctx);
    expect(r.receiptAddition).toMatchObject({
      age_gate: 'parent_only',
      children_mentioned: ['Beanie'],
    });
  });

  it('uses word boundaries — "Niko" must not match "Nikolai"', async () => {
    const ctx = makeCtx({
      draftBody: 'Nikolai from school called',
      memoryBlocks: { profile: { children: [{ name: 'Niko' }] } },
    });
    const r = await ageGateAfterDraft.run(ctx);
    expect(r.receiptAddition).toEqual({ age_gate: 'no_child_mentions' });
  });
});
