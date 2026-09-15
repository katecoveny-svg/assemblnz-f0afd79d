import { describe, expect, it } from 'vitest';
import { decodeGmail, familyRequest, familyQuery, validateFamilyEvidence } from './family';
const encoded = (s: string) => Buffer.from(s).toString('base64url');
const source = { id: 'abc123', subject: 'Trip', from: 'School <office@school.example>', date: 'Monday', text: 'Bring a hat on Friday. Please return the permission form.', truncated: false, hasAttachments: false };
const item = { kind: 'bring', title: 'Pack a hat', detail: 'For the trip.', when: 'Friday', person: 'Not specified', sourceId: 'abc123', evidence: 'Bring a hat on Friday.' };
describe('family inbox evidence', () => {
  it('requires chosen senders, an allowed range and explicit consent', () => {
    expect(familyRequest.safeParse({ senders: [], days: 14, consent: true }).success).toBe(false);
    expect(familyRequest.safeParse({ senders: ['office@school.example'], days: 90, consent: true }).success).toBe(false);
    expect(familyRequest.safeParse({ senders: ['office@school.example'], days: 14, consent: false }).success).toBe(false);
    expect(() => familyQuery(['office@school.example OR newer_than:999d'], 14)).toThrow();
    expect(familyQuery(['office@school.example'], 14)).toBe('{from:(office@school.example)} newer_than:14d -in:spam -in:trash');
  });
  it('prefers plain text and reports unread attachments without decoding them', () => {
    const decoded = decodeGmail({ id: 'abc123', payload: { mimeType: 'multipart/mixed', parts: [{ mimeType: 'multipart/alternative', parts: [{ mimeType: 'text/plain', body: { data: encoded('Bring a hat.') } }, { mimeType: 'text/html', body: { data: encoded('<p>Bring a hat.</p>') } }] }, { mimeType: 'text/plain', filename: 'private.txt', body: { data: encoded('Not authorised attachment data') } }] } });
    expect(decoded?.text).toBe('Bring a hat.'); expect(decoded?.hasAttachments).toBe(true);
  });
  it('flags shortened text and never uses snippets as a full email', () => {
    expect(decodeGmail({ id: 'abc', payload: { mimeType: 'text/plain', body: { data: encoded('a'.repeat(5000)) } } })).toMatchObject({ text: 'a'.repeat(4000), truncated: true });
    expect(decodeGmail({ id: 'abc', snippet: 'preview only', payload: {} })?.text).toBe('');
  });
  it('rejects invented sources, unsupported quotes and empty evidence', () => {
    expect(validateFamilyEvidence({ summary: 'One item', items: [item], questions: [] }, [source]).items).toHaveLength(1);
    for (const change of [{ sourceId: 'unknown' }, { evidence: 'Pay $50 tomorrow.' }, { evidence: '' }]) {
      expect(() => validateFamilyEvidence({ summary: 'One item', items: [{ ...item, ...change }], questions: [] }, [source])).toThrow();
    }
  });
});
