import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
let fetcher: ReturnType<typeof vi.fn>;
beforeEach(() => { vi.resetModules(); vi.stubEnv('PIPEDREAM_CLIENT_ID', 'test-client'); vi.stubEnv('PIPEDREAM_CLIENT_SECRET', 'test-only-placeholder'); vi.stubEnv('PIPEDREAM_PROJECT_ID', 'test-project'); fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
function responses(account: object) { fetcher.mockResolvedValueOnce(Response.json({ access_token: 'test-only-token', expires_in: 3600 })).mockResolvedValueOnce(Response.json({ data: [account] })).mockResolvedValueOnce(Response.json({ success: true })); }
describe('business connector execution boundary', () => {
  it('never falls back to a different app or another user’s account', async () => {
    responses({ id: 'other-account', external_user_id: 'tenant:other', healthy: true, app: { name_slug: 'salesforce_rest_api' } });
    const { runConnectorAction } = await import('./pipedream');
    expect((await runConnectorAction({ externalUserId: 'tenant:mine', app: 'salesforce_rest_api', action: 'create_lead', data: {} })).ok).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('refuses disconnected accounts at dispatch time', async () => {
    responses({ id: 'expired', external_user_id: 'tenant:mine', healthy: false, app: { name_slug: 'microsoft_outlook' } });
    const { runConnectorAction } = await import('./pipedream');
    expect((await runConnectorAction({ externalUserId: 'tenant:mine', app: 'microsoft_outlook', action: 'create_email_draft', data: {} })).ok).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('uses the provider’s Outlook draft component and pins its account after user data', async () => {
    responses({ id: 'my-outlook', external_user_id: 'tenant:mine', healthy: true, app: { name_slug: 'microsoft_outlook' } });
    const { runConnectorAction } = await import('./pipedream');
    await runConnectorAction({ externalUserId: 'tenant:mine', app: 'microsoft_outlook', action: 'create_email_draft', data: { subject: 'Sample', microsoftOutlook: { authProvisionId: 'injected' } } });
    const payload = JSON.parse(fetcher.mock.calls[2][1].body);
    expect(payload).toMatchObject({ id: 'microsoft_outlook-create-draft-email', configured_props: { subject: 'Sample', microsoftOutlook: { authProvisionId: 'my-outlook' } } });
  });
  it('uses the Salesforce component’s actual authentication prop', async () => {
    responses({ id: 'my-salesforce', external_user_id: 'tenant:mine', healthy: true, app: { name_slug: 'salesforce_rest_api' } });
    const { runConnectorAction } = await import('./pipedream');
    await runConnectorAction({ externalUserId: 'tenant:mine', app: 'salesforce_rest_api', action: 'create_lead', data: { Company: 'Sample', LastName: 'Example' } });
    expect(JSON.parse(fetcher.mock.calls[2][1].body)).toMatchObject({ id: 'salesforce_rest_api-create-lead', configured_props: { Company: 'Sample', LastName: 'Example', salesforce: { authProvisionId: 'my-salesforce' } } });
  });
  it('rejects unmapped sending actions without making a provider request', async () => { const { runConnectorAction } = await import('./pipedream'); expect((await runConnectorAction({ externalUserId: 'tenant:mine', app: 'microsoft_outlook', action: 'send_email', data: {} })).ok).toBe(false); expect(fetcher).not.toHaveBeenCalled(); });
});
