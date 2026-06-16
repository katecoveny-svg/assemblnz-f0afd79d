import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/voice/clients/supabase', async () => (await import('./harness')).supabaseMock);

import { classifyConsent, captureConsent } from '@/lib/voice/tools/capture_consent';
import { store, resetStore } from './harness';

describe('classifyConsent', () => {
  it('treats clear affirmatives as granted', () => {
    for (const r of ['yes', 'Yeah, that’s fine', 'sure go ahead', 'āe', 'no worries']) {
      expect(classifyConsent(r)).toBe('granted');
    }
  });

  it('treats clear negatives as declined', () => {
    for (const r of ['no', 'nah', "I'd rather not", 'no thanks', 'please don’t']) {
      expect(classifyConsent(r)).toBe('declined');
    }
  });

  it('treats mixed / unclear replies as ambiguous (never assume consent)', () => {
    for (const r of ['um', 'what do you mean', 'yeah but no recording', 'maybe', '']) {
      expect(classifyConsent(r)).toBe('ambiguous');
    }
  });
});

describe('captureConsent', () => {
  beforeEach(() => resetStore());

  it('writes a verbatim consent row on yes', async () => {
    const res = await captureConsent({
      call_sid: 'CA_1',
      prompt_text: 'I record calls to confirm your booking — is that OK?',
      verbatim_response: 'yeah that’s fine',
    });
    expect(res.consent_granted).toBe(true);
    expect(res.needs_clarification).toBe(false);
    expect(store.consents).toHaveLength(1);
    expect(store.consents[0].response_text).toBe('yeah that’s fine');
    expect(store.consents[0].consent_granted).toBe(true);
  });

  it('writes a declined row on no (and records nothing further)', async () => {
    const res = await captureConsent({
      call_sid: 'CA_2',
      prompt_text: 'is that OK?',
      verbatim_response: 'no thanks',
    });
    expect(res.consent_granted).toBe(false);
    expect(store.consents[0].consent_granted).toBe(false);
  });

  it('does NOT write a row on ambiguous — it asks for clarification', async () => {
    const res = await captureConsent({
      call_sid: 'CA_3',
      prompt_text: 'is that OK?',
      verbatim_response: 'um, what?',
    });
    expect(res.needs_clarification).toBe(true);
    expect(res.consent_granted).toBe(false);
    expect(store.consents).toHaveLength(0);
  });
});
