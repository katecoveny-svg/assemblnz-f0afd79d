import { describe, expect, it } from 'vitest';
import { DO_PIPEDREAM_ACTION_ENTRIES } from '@/apps/do/shared/do-connector-pack';
import { verifyPipedreamResult } from './pipedream-results';

function verify(componentId: string, ret: unknown, data: Record<string, unknown> = {}, extra: Record<string, unknown> = {}) {
  const mapped = DO_PIPEDREAM_ACTION_ENTRIES.find(e => e.componentId === componentId)!;
  return verifyPipedreamResult(mapped, data, { exports: {}, os: [], ret, ...extra });
}

describe('action-specific Pipedream result evidence', () => {
  it('verifies HubSpot only with the returned contact id', () => {
    const result = verify('hubspot-create-or-update-contact', { id: '12345', properties: { email: 'private@example.test' } });
    expect(result.ok).toBe(true);
    expect(result.detail.provider).toEqual({ id: '12345' });
    expect(verify('hubspot-create-or-update-contact', { success: true }).ok).toBe(false);
  });

  it('verifies Sheets only with one updated row and an updated range', () => {
    const ret = { updatedRange: "'Reviewed tab'!A2:C2", updatedRows: 1, updatedColumns: 3, updatedCells: 3 };
    expect(verify('google_sheets-add-single-row', ret)).toMatchObject({ ok: true, detail: { provider: { updatedRange: ret.updatedRange, updatedRows: 1 } } });
    for (const bad of [{ success: true }, { updatedRows: 1 }, { ...ret, updatedRows: 0 }, { ...ret, updatedRows: 2 }, { ...ret, updatedRange: '' }]) {
      expect(verify('google_sheets-add-single-row', bad).ok).toBe(false);
    }
  });

  it('verifies Stripe only for the requested invoice and retains no billing body', () => {
    const ret = { id: 'in_123', customer: { email: 'private@example.test' }, lines: { data: ['private'] }, amount_due: 10000 };
    const result = verify('stripe-retrieve-invoice', ret, { id: 'in_123' });
    expect(result.ok).toBe(true);
    expect(result.detail.provider).toEqual({ id: 'in_123' });
    for (const data of [{}, { id: 'in_other' }, { invoiceId: 'in_123' }]) expect(verify('stripe-retrieve-invoice', ret, data).ok).toBe(false);
  });

  it('verifies Drive metadata only for the requested file id', () => {
    const ret = { id: 'file-1', name: 'private document', description: 'private body' };
    expect(verify('google_drive-get-file-by-id', ret, { fileId: 'file-1' })).toMatchObject({ ok: true, detail: { provider: { id: 'file-1' } } });
    for (const data of [{}, { fileId: 'file-2' }]) expect(verify('google_drive-get-file-by-id', ret, data).ok).toBe(false);
    expect(verify('google_drive-get-file-by-id', { name: 'no id' }, { fileId: 'file-1' }).ok).toBe(false);
  });

  it('verifies Outlook only with a message id and explicit draft evidence', () => {
    const result = verify('microsoft_outlook-create-draft-email', { id: 'message-1', isDraft: true, body: { content: 'private' } });
    expect(result).toMatchObject({ ok: true, detail: { provider: { id: 'message-1', isDraft: true } } });
    for (const ret of [{ id: 'message-1' }, { id: 'message-1', isDraft: false }, { isDraft: true }]) {
      expect(verify('microsoft_outlook-create-draft-email', ret).ok).toBe(false);
    }
  });

  it('verifies Gmail with the draft id without retaining message bodies', () => {
    const result = verify('gmail-create-draft', { id: 'draft-1', message: { id: 'message-1', raw: 'private-mail' } });
    expect(result).toMatchObject({ ok: true, detail: { provider: { id: 'draft-1' } } });
    expect(result.detail.provider).toEqual({ id: 'draft-1' });
    expect(verify('gmail-create-draft', { message: { id: 'message-1' } }).ok).toBe(false);
  });

  it('verifies Calendar create with an event id, never just a success flag', () => {
    expect(verify('google_calendar-create-event', { id: 'event-1', summary: 'private', attendees: ['private'] })).toMatchObject({ ok: true, detail: { provider: { id: 'event-1' } } });
    for (const ret of [{ success: true }, { id: '' }, { id: 'x'.repeat(513) }]) expect(verify('google_calendar-create-event', ret).ok).toBe(false);
  });

  it('verifies Slack destination and timestamp only on ok true', () => {
    const ret = { ok: true, channel: 'C123', ts: '123.456', message: { text: 'private' } };
    expect(verify('slack_v2-send-message', ret, { conversation: 'C123' })).toMatchObject({ ok: true, detail: { provider: { channel: 'C123', ts: '123.456' } } });
    expect(verify('slack_v2-send-message', ret, { conversation: 'C999' }).ok).toBe(false);
    for (const bad of [{ ok: true }, { ...ret, ts: undefined }, { ...ret, ok: false }, { ...ret, ts: 'not-a-timestamp' }]) {
      expect(verify('slack_v2-send-message', bad, { conversation: 'C123' }).ok).toBe(false);
    }
  });

  it('verifies Salesforce only with a successful create identifier and no errors', () => {
    expect(verify('salesforce_rest_api-create-lead', { success: true, id: '00Q123', errors: [] }).detail.provider).toEqual({ id: '00Q123' });
    for (const ret of [{ success: true }, { id: '00Q123' }, { success: true, id: '00Q123', errors: ['private validation error'] }]) {
      expect(verify('salesforce_rest_api-create-lead', ret).ok).toBe(false);
    }
    expect(verify('salesforce_rest_api-create-lead', { success: false, errors: ['private'] })).toMatchObject({ ok: false, detail: { outcome: 'failed' } });
  });

  it('verifies Linear only with success true and the serialized SDK issue identifier', () => {
    const result = verify('linear_app-create-issue', { success: true, _issue: { id: 'issue-1', title: 'private', _client: { token: 'secret' } } });
    expect(result).toMatchObject({ ok: true, detail: { outcome: 'verified', provider: { id: 'issue-1' } } });
    expect(result.detail.provider).toEqual({ id: 'issue-1' });
    for (const ret of [{ success: true }, { id: 'issue-1' }, { success: true, issue: { id: 'issue-1' } }, { success: true, _issue: { id: '' } }]) {
      expect(verify('linear_app-create-issue', ret).ok).toBe(false);
    }
  });

  it('classifies Linear success false as a failure, not an ambiguous write', () => {
    expect(verify('linear_app-create-issue', { success: false, _issue: { id: 'issue-1' } })).toMatchObject({
      ok: false, detail: { outcome: 'failed', error: 'provider_rejected', retryable: false },
    });
  });
});
