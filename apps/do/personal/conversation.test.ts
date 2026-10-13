import { describe, expect, it } from 'vitest';
import { CONVERSATION_BYTES_LIMIT, conversationMutationSchema, conversationTitle, nextConversationRecord, type ConversationMutation, type ConversationRecord } from './conversation';

const now = '2026-10-13T09:00:00.000Z';
const id = '11111111-1111-4111-8111-111111111111';
const turns = [
  { role: 'user' as const, text: 'Prepare a reply to my fictional property manager about the leaking tap.', at: '2026-10-13T08:58:00.000Z', draft: null, label: null },
  { role: 'assistant' as const, text: 'Here is a short reply you can review.', at: '2026-10-13T08:58:30.000Z', draft: 'Hi, the kitchen tap has been leaking since Monday…', label: 'Reply to review' },
];
const save: ConversationMutation = { action: 'save', id, expectedRevision: 0, title: conversationTitle(turns), turns, consent: true, noticeVersion: 1 };

describe('kept conversation contract', () => {
  it('creates a 30-day record from an explicit keep', () => {
    const record = nextConversationRecord(save, null, now)!;
    expect(record.revision).toBe(1);
    expect(record.expiresAt).toBe('2026-11-12T09:00:00.000Z');
    expect(record.title).toBe('Prepare a reply to my fictional property manager about the leaking tap.');
    expect(record.use).toBe('owner_review_only');
  });
  it('refuses to shorten a conversation another device extended and rejects stale revisions', () => {
    const current = nextConversationRecord(save, null, now) as ConversationRecord;
    const longer = { ...current, revision: 2, turns: [...turns, { ...turns[0], text: 'Follow-up question', at: now }] };
    expect(() => nextConversationRecord({ ...save, expectedRevision: 2 }, longer, now)).toThrow('conversation_conflict');
    expect(() => nextConversationRecord({ ...save, expectedRevision: 1 }, longer, now)).toThrow('conversation_conflict');
    const extended = nextConversationRecord({ ...save, expectedRevision: 2, turns: longer.turns }, longer, '2026-10-14T09:00:00.000Z')!;
    expect(extended.revision).toBe(3);
    expect(extended.createdAt).toBe(current.createdAt);
    expect(extended.expiresAt).toBe('2026-11-13T09:00:00.000Z');
  });
  it('forgetting needs the current revision and removes the record', () => {
    const current = nextConversationRecord(save, null, now)!;
    expect(nextConversationRecord({ action: 'forget', id, expectedRevision: 1 }, current, now)).toBeNull();
    expect(() => nextConversationRecord({ action: 'forget', id, expectedRevision: 2 }, current, now)).toThrow('conversation_conflict');
  });
  it('bounds size, turn count, future timestamps and extra authority fields', () => {
    const huge = { ...save, turns: [{ ...turns[0], text: 'x'.repeat(10000) }, { ...turns[1], text: 'y'.repeat(10000) }, { ...turns[0], text: 'z'.repeat(10000) }, { ...turns[1], text: 'w'.repeat(10000) }, { ...turns[0], text: 'v'.repeat(9000) }] };
    expect(() => nextConversationRecord(huge, null, now)).toThrow('conversation_too_long');
    expect(conversationMutationSchema.safeParse({ ...save, turns: Array.from({ length: 41 }, () => turns[0]) }).success).toBe(false);
    // A device clock a second fast is capped to the server clock rather than failing the keep.
    expect(nextConversationRecord({ ...save, turns: [{ ...turns[0], at: '2026-10-13T09:00:01.000Z' }] }, null, now)?.turns[0].at).toBe(now);
    for (const extra of [{ ownerId: 'other' }, { sentToProvider: true }, { authority: 'send' }, { consent: false }])
      expect(conversationMutationSchema.safeParse({ ...save, ...extra }).success).toBe(false);
    expect(CONVERSATION_BYTES_LIMIT).toBe(48000);
  });
  it('titles are recognisable, trimmed and never longer than the list needs', () => {
    expect(conversationTitle([{ ...turns[0], text: '   Sort   the\n school   newsletter   ' }])).toBe('Sort the school newsletter');
    expect(conversationTitle([{ ...turns[0], text: 'a'.repeat(100) }])).toHaveLength(72);
    expect(conversationTitle([turns[1]])).toBe('Conversation');
  });
});

it('preserves every existing message at the 40-turn boundary and refuses rolling replacement', () => {
 const forty = Array.from({ length: 40 }, (_, index) => ({ ...turns[index % 2], text: `Synthetic turn ${index}` }));
 const current = nextConversationRecord({ ...save, turns: forty.slice(0, 38) }, null, now)!;
 const full = nextConversationRecord({ ...save, expectedRevision: 1, turns: forty }, current, now)!;
 expect(full.turns).toEqual(forty);
 const rolled = [...forty.slice(2), ...turns];
 expect(() => nextConversationRecord({ ...save, expectedRevision: 2, turns: rolled }, full, now)).toThrow('conversation_conflict');
 expect(() => nextConversationRecord({ ...save, expectedRevision: 2, turns: forty.map((turn, i) => i === 0 ? { ...turn, draft: 'Replacement' } : turn) }, full, now)).toThrow('conversation_conflict');
 expect(full.turns).toEqual(forty);
 const clockSkew = nextConversationRecord({ ...save, expectedRevision: 2, turns: forty.map(turn => ({ ...turn, at: '2026-10-14T09:00:00.000Z' })) }, full, now)!;
 expect(clockSkew.turns).toEqual(forty);
});
