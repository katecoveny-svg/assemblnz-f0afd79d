import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/voice/clients/supabase', async () => (await import('./harness')).supabaseMock);

import { upsertSession, appendToolCall } from '@/lib/voice/clients/supabase';
import { captureConsent } from '@/lib/voice/tools/capture_consent';
import { warmTransfer } from '@/lib/voice/tools/warm_transfer';
import { finalizeReceipt } from '@/lib/voice/receipts/mana-receipt';
import { resetStore } from './harness';

describe('integration — caller asks for a human → warm transfer', () => {
  beforeEach(() => resetStore());

  it('emits Dial TwiML and the receipt notes the transfer', async () => {
    const CALL = 'CA_transfer';
    await upsertSession({ call_sid: CALL, agent_id: 'aroha.manaaki@demo', customer_id: 'whetu', caller_number: '+6421555888', status: 'in_progress' });

    await captureConsent({ call_sid: CALL, prompt_text: 'is that OK?', verbatim_response: 'yes' });

    // Caller asks for a person mid-call.
    const t = warmTransfer({ transferTo: '+6421999000' });
    expect(t.twiml).toContain('<Dial>+6421999000</Dial>');

    await appendToolCall(CALL, { tool: 'warm_transfer', args: { transfer_to_masked: '***000' }, result_summary: 'transferred', ok: true, ts: new Date().toISOString() });
    await upsertSession({ call_sid: CALL, status: 'transferred', ended_at: new Date().toISOString() });

    const receipt = await finalizeReceipt(CALL);
    expect(receipt.payload.transferred).toBe(true);
    expect(receipt.payload.status).toBe('transferred');
    expect(receipt.payload.tool_calls.some((c) => c.tool === 'warm_transfer')).toBe(true);
  });
});
