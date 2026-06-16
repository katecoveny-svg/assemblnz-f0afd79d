import { describe, it, expect, vi } from 'vitest';

// mana-receipt.ts imports the server-only supabase client; swap it for the
// in-memory harness so the module loads under vitest.
vi.mock('@/lib/voice/clients/supabase', async () => (await import('./harness')).supabaseMock);

import { buildPayload, buildReceipt } from '@/lib/voice/receipts/mana-receipt';
import { verifyChain, GENESIS_PREV_HASH } from '@/lib/voice/hashing';
import type { KeteSession, VoiceManaReceipt } from '@/lib/voice/types';

function session(callSid: string): Pick<
  KeteSession,
  'call_sid' | 'caller_number' | 'started_at' | 'ended_at' | 'status'
> {
  return {
    call_sid: callSid,
    caller_number: '+6421234999',
    started_at: '2026-06-17T08:00:00+12:00',
    ended_at: '2026-06-17T08:03:00+12:00',
    status: 'completed',
  };
}

function receiptFor(i: number, prev: string): VoiceManaReceipt {
  const payload = buildPayload({
    session: session(`CA_${i}`),
    consent: null,
    toolCalls: [],
    booking: { booking_id: `b_${i}`, date: '2026-06-20', time: '19:00', party_size: 2 },
    smsSent: true,
    transferred: false,
  });
  return buildReceipt(payload, prev);
}

describe('mana-receipt hash chain', () => {
  it('chains 100 sequential receipts that verify intact', () => {
    const receipts: VoiceManaReceipt[] = [];
    let prev = GENESIS_PREV_HASH;
    for (let i = 0; i < 100; i++) {
      const r = receiptFor(i, prev);
      receipts.push(r);
      prev = r.chain_hash;
    }
    expect(receipts).toHaveLength(100);
    expect(verifyChain(receipts)).toBe(-1);
    // First receipt seeds from genesis.
    expect(receipts[0].prev_hash).toBe(GENESIS_PREV_HASH);
    // Each link references the previous chain_hash.
    expect(receipts[42].prev_hash).toBe(receipts[41].chain_hash);
  });

  it('detects tampering: mutating one payload breaks the chain from that point', () => {
    const receipts: VoiceManaReceipt[] = [];
    let prev = GENESIS_PREV_HASH;
    for (let i = 0; i < 10; i++) {
      const r = receiptFor(i, prev);
      receipts.push(r);
      prev = r.chain_hash;
    }
    expect(verifyChain(receipts)).toBe(-1);

    // Tamper with receipt #5's payload after the fact.
    (receipts[5].payload.booking as { party_size: number }).party_size = 99;
    expect(verifyChain(receipts)).toBe(5);
  });

  it('redacts the caller number in the payload (IPP 5)', () => {
    const r = receiptFor(1, GENESIS_PREV_HASH);
    expect(r.payload.caller_number_masked).toContain('999');
    expect(r.payload.caller_number_masked).not.toContain('21234');
  });
});
