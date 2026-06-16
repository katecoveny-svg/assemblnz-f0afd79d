import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/voice/clients/supabase', async () => (await import('./harness')).supabaseMock);

import { upsertSession, appendToolCall } from '@/lib/voice/clients/supabase';
import { captureConsent } from '@/lib/voice/tools/capture_consent';
import { finalizeReceipt } from '@/lib/voice/receipts/mana-receipt';
import { resetStore } from './harness';

describe('integration — caller declines recording → transfer, no recording', () => {
  beforeEach(() => resetStore());

  it('records consent declined, transfers, and the receipt notes both', async () => {
    const CALL = 'CA_no';
    await upsertSession({ call_sid: CALL, agent_id: 'aria.manaaki@demo', customer_id: 'whetu', caller_number: '+6421000222', status: 'in_progress' });

    const consent = await captureConsent({
      call_sid: CALL,
      prompt_text: 'is that OK?',
      verbatim_response: 'no, I’d rather you didn’t',
    });
    expect(consent.consent_granted).toBe(false);
    expect(consent.needs_clarification).toBe(false);

    // Declined → warm transfer to a human.
    await appendToolCall(CALL, { tool: 'warm_transfer', args: { transfer_to_masked: '***000' }, result_summary: 'transferred', ok: true, ts: new Date().toISOString() });
    await upsertSession({ call_sid: CALL, status: 'transferred', ended_at: new Date().toISOString() });

    const receipt = await finalizeReceipt(CALL);
    expect(receipt.payload.consent?.granted).toBe(false);
    expect(receipt.payload.transferred).toBe(true);
    expect(receipt.payload.booking).toBeNull();
    expect(receipt.payload.privacy.retention_class).toBe('call-no-recording');
  });
});
