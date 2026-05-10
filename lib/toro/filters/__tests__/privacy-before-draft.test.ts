import { describe, it, expect } from 'vitest';
import { privacyBeforeDraft } from '../privacy-before-draft';
import { makeCtx } from './test-helpers';

describe('privacy_before_draft', () => {
  it('passes through a clean message unchanged', async () => {
    const ctx = makeCtx({ incomingMessage: 'just confirming pickup at 3pm' });
    const r = await privacyBeforeDraft.run(ctx);
    expect(r.pass).toBe(true);
    expect(r.modifiedBody).toBe('just confirming pickup at 3pm');
    expect(r.receiptAddition).toEqual({ privacy_before: 'no_redactions' });
  });

  it('redacts NZ mobile phone numbers', async () => {
    const ctx = makeCtx({ incomingMessage: 'call me on 021 555 4422 or +64 21 999 1234' });
    const r = await privacyBeforeDraft.run(ctx);
    expect(r.pass).toBe(true);
    expect(r.modifiedBody).not.toContain('021 555 4422');
    expect(r.modifiedBody).not.toContain('999 1234');
    expect(r.modifiedBody).toContain('[REDACTED:phone]');
  });

  it('redacts NHI numbers', async () => {
    const ctx = makeCtx({ incomingMessage: 'her NHI is ABC 1234, can you note it' });
    const r = await privacyBeforeDraft.run(ctx);
    expect(r.modifiedBody).toContain('[REDACTED:nhi]');
    expect(r.modifiedBody).not.toContain('ABC 1234');
  });

  it('redacts NZ bank account numbers', async () => {
    const ctx = makeCtx({ incomingMessage: 'pay into 12-3456-7890123-00 by Friday' });
    const r = await privacyBeforeDraft.run(ctx);
    expect(r.modifiedBody).toContain('[REDACTED:bank]');
    expect(r.modifiedBody).not.toContain('12-3456-7890123-00');
  });

  it('redacts IRD numbers', async () => {
    const ctx = makeCtx({ incomingMessage: 'my IRD is 123-456-789' });
    const r = await privacyBeforeDraft.run(ctx);
    expect(r.modifiedBody).toContain('[REDACTED:ird]');
  });

  it('counts multiple redactions in the receipt addition', async () => {
    const ctx = makeCtx({
      incomingMessage: 'phone 021 999 1234, IRD 12345678, NHI ABC 1234',
    });
    const r = await privacyBeforeDraft.run(ctx);
    expect(r.pass).toBe(true);
    const addition = r.receiptAddition?.privacy_before as { total?: number };
    expect(addition.total).toBeGreaterThanOrEqual(3);
  });
});
