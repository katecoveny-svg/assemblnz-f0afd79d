import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/voice/clients/supabase', async () => (await import('./harness')).supabaseMock);

import { upsertSession, appendToolCall } from '@/lib/voice/clients/supabase';
import { captureMessage } from '@/lib/voice/tools/capture_message';
import { finalizeReceipt } from '@/lib/voice/receipts/mana-receipt';
import { store, resetStore } from './harness';

describe('integration — after-hours / no availability → message captured', () => {
  beforeEach(() => resetStore());

  it('captures a message-only call and the receipt reflects it', async () => {
    const CALL = 'CA_afterhours';
    await upsertSession({ call_sid: CALL, agent_id: 'aroha.manaaki@demo', customer_id: 'whetu', caller_number: '+6421777333', status: 'in_progress' });

    await appendToolCall(CALL, { tool: 'capture_message', args: { length: 42 }, result_summary: 'message captured', ok: true, ts: new Date().toISOString() });
    await captureMessage({ call_sid: CALL, message: 'Hoping to book a table for Sunday, please call me back.' });

    // capture_message set status voicemail + notes.
    expect(store.sessions.get(CALL)?.status).toBe('voicemail');
    expect(store.sessions.get(CALL)?.notes).toContain('book a table for Sunday');

    const receipt = await finalizeReceipt(CALL);
    expect(receipt.payload.status).toBe('voicemail');
    expect(receipt.payload.booking).toBeNull();
    expect(receipt.payload.consent).toBeNull();
    expect(receipt.payload.privacy.retention_class).toBe('message-only');
  });
});
