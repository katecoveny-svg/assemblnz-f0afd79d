import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/voice/clients/supabase', async () => (await import('./harness')).supabaseMock);

import { upsertSession, appendToolCall } from '@/lib/voice/clients/supabase';
import { captureConsent } from '@/lib/voice/tools/capture_consent';
import { finalizeReceipt } from '@/lib/voice/receipts/mana-receipt';
import { verifyChain, GENESIS_PREV_HASH } from '@/lib/voice/hashing';
import { store, resetStore } from './harness';

const CALL = 'CA_happy';

function ts() {
  return new Date().toISOString();
}

describe('integration — happy path: consent → booking → SMS → evidence pack', () => {
  beforeEach(() => resetStore());

  it('produces a receipt that reflects the full successful call', async () => {
    // Inbound: session opens.
    await upsertSession({
      call_sid: CALL,
      agent_id: 'aria.manaaki@demo',
      customer_id: 'whetu',
      caller_number: '+6421234999',
      status: 'in_progress',
    });

    // Consent granted.
    const consent = await captureConsent({
      call_sid: CALL,
      prompt_text: 'I record calls just to confirm your booking — is that OK?',
      verbatim_response: 'yeah, that’s fine',
    });
    expect(consent.consent_granted).toBe(true);

    // Tool calls: availability, booking, SMS.
    await appendToolCall(CALL, { tool: 'check_availability', args: { date: '2026-06-20', party_size: 4 }, result_summary: '8 slots', ok: true, ts: ts() });
    await appendToolCall(CALL, { tool: 'book_reservation', args: { date: '2026-06-20', time: '19:00', party_size: 4, booking_id: 'evt_123' }, result_summary: 'booked evt_123', ok: true, ts: ts() });
    await appendToolCall(CALL, { tool: 'send_sms', args: { to_masked: '***999' }, result_summary: 'sms SMxxx', ok: true, ts: ts() });

    // Hangup.
    await upsertSession({ call_sid: CALL, status: 'completed', ended_at: ts() });

    const receipt = await finalizeReceipt(CALL);

    // Receipt reflects the whole call.
    expect(receipt.payload.consent?.granted).toBe(true);
    expect(receipt.payload.booking).toEqual({ booking_id: 'evt_123', date: '2026-06-20', time: '19:00', party_size: 4 });
    expect(receipt.payload.sms_sent).toBe(true);
    expect(receipt.payload.transferred).toBe(false);
    expect(receipt.payload.privacy.retention_class).toBe('call-with-recording');
    expect(receipt.payload.caller_number_masked).not.toContain('21234');

    // Persisted + chained from genesis.
    expect(store.receipts).toHaveLength(1);
    expect(receipt.prev_hash).toBe(GENESIS_PREV_HASH);
    expect(verifyChain([receipt])).toBe(-1);
  });
});
