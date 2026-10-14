import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../shared/reasoning-server', () => ({ runDoTextReasoning: vi.fn() }));
import { runDoTextReasoning } from '../shared/reasoning-server';
import { organiseFamilyMail } from './family-server';
import { DO_TEXT_PROVIDER_CONSENT_VERSION } from '../shared/provider-consent';
const message = { id: 'fictional-source', subject: 'Trip', from: 'school@example.invalid', date: 'Fictional Monday', text: 'Bring a hat on Friday.', truncated: false, hasAttachments: false };
const scope = { ownerId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', providerConsentVersion: DO_TEXT_PROVIDER_CONSENT_VERSION, requestId: '11111111-1111-4111-8111-111111111111' };
const digest = { summary: 'Review the notice.', questions: [], items: [{ kind: 'bring', title: 'Hat', detail: 'For the trip.', when: 'Friday', person: 'Not specified', sourceId: message.id, evidence: message.text }] };
beforeEach(() => { vi.clearAllMocks(); vi.mocked(runDoTextReasoning).mockResolvedValue({ nextStep: { draft: JSON.stringify(digest) }, generation: { actualModel: 'gpt-6-astra' }, reasoning: { provider: 'typesafe', model: 'jev-1.13.0' } } as never); });
describe('Family digest uses the shared DO boundary', () => {
  it('requires current named-provider consent and owner scope before transmission', async () => {
    await expect(organiseFamilyMail([message], new AbortController().signal)).rejects.toMatchObject({ code: 'provider_consent_required' });
    await expect(organiseFamilyMail([message], new AbortController().signal, { ...scope, providerConsentVersion: 'old' })).rejects.toMatchObject({ code: 'provider_consent_required' });
    expect(runDoTextReasoning).not.toHaveBeenCalled();
  });
  it('passes only chosen source data and the trusted owner/request scope to durable reasoning', async () => {
    const signal = new AbortController().signal;
    const result = await organiseFamilyMail([message], signal, scope);
    expect(runDoTextReasoning).toHaveBeenCalledWith(expect.objectContaining({ consent: true, context: JSON.stringify({ emails: [message] }), usePublicNz: false, useSavedStyle: false, history: [] }), scope.ownerId, signal, scope.requestId);
    expect(result).toMatchObject({ model: 'gpt-6-astra', reasoning: { provider: 'typesafe' }, items: [{ sourceId: message.id }] });
  });
  it('rejects an oversized reviewed bundle instead of silently truncating provider input', async () => {
    await expect(organiseFamilyMail([{ ...message, text: 'x'.repeat(6001) }], new AbortController().signal, scope)).rejects.toMatchObject({ code: 'input_limit' });
    expect(runDoTextReasoning).not.toHaveBeenCalled();
  });
  it('rejects invented source quotes even after a successful model boundary', async () => {
    vi.mocked(runDoTextReasoning).mockResolvedValue({ nextStep: { draft: JSON.stringify({ ...digest, items: [{ ...digest.items[0], evidence: 'Invented payment due.' }] }) }, generation: { actualModel: 'gpt-6-astra' } } as never);
    await expect(organiseFamilyMail([message], new AbortController().signal, scope)).rejects.toThrow('Unverified family evidence');
  });
});
