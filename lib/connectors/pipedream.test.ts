import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
let fetcher: ReturnType<typeof vi.fn>;
beforeEach(() => { vi.resetModules(); vi.stubEnv('PIPEDREAM_CLIENT_ID', 'test-client'); vi.stubEnv('PIPEDREAM_CLIENT_SECRET', 'test-only-placeholder'); vi.stubEnv('PIPEDREAM_PROJECT_ID', 'test-project'); fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
function responses(account: object, body: unknown = { success: true }) { fetcher.mockResolvedValueOnce(Response.json({ access_token: 'test-only-token', expires_in: 3600 })).mockResolvedValueOnce(Response.json({ data: [account] })).mockResolvedValueOnce(Response.json(body)); }
describe('business connector execution boundary', () => {
  it('exports the canonical pack map without a second registry', async () => {
    const { actionMapFromPack } = await import('../../apps/do/shared/do-connector-pack');
    const { PIPEDREAM_ACTION_MAP } = await import('./pipedream');
    expect(PIPEDREAM_ACTION_MAP).toEqual(actionMapFromPack());
  });

  it('requires the exact audited Slack account app, not the legacy alias', async () => {
    responses({ id: 'legacy', external_user_id: 'tenant:mine', healthy: true, app: { name_slug: 'slack' } });
    const { runConnectorAction } = await import('./pipedream');
    expect((await runConnectorAction({ externalUserId: 'tenant:mine', app: 'slack', action: 'post_slack_message', data: { conversation: 'C123', text: 'Reviewed' } })).ok).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('does not treat a 2xx Connect error envelope as verified success', async () => {
    responses({ id: 'notion-account', external_user_id: 'tenant:mine', healthy: true, app: { name_slug: 'notion' } }, {
      exports: { $summary: 'Created a page' }, os: [], ret: { id: 'page-1' },
      error: { message: 'secret-provider-error', token: 'secret-token' },
    });
    const { runConnectorAction } = await import('./pipedream');
    const result = await runConnectorAction({ externalUserId: 'tenant:mine', app: 'notion', action: 'create_notion_page', data: { parent: '123e4567-e89b-12d3-a456-426614174000' } });
    expect(result.ok).toBe(false);
    expect(result.detail).toMatchObject({ outcome: 'indeterminate', error: 'provider_error', retryable: false });
    expect(JSON.stringify(result)).not.toMatch(/secret|Created a page/);
  });
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
  it('uses the provider’s Outlook draft component and pins the connected account, never a caller-supplied identity', async () => {
    responses({ id: 'my-outlook', external_user_id: 'tenant:mine', healthy: true, app: { name_slug: 'microsoft_outlook' } });
    const { runConnectorAction } = await import('./pipedream');
    await runConnectorAction({ externalUserId: 'tenant:mine', app: 'microsoft_outlook', action: 'create_email_draft', data: { recipients: ['person@example.com'], subject: 'Sample', content: 'Body' } });
    const payload = JSON.parse(fetcher.mock.calls[2][1].body);
    expect(payload).toMatchObject({ id: 'microsoft_outlook-create-draft-email', configured_props: { subject: 'Sample', microsoftOutlook: { authProvisionId: 'my-outlook' } } });
  });
  it('rejects an Outlook draft attempt that tries to smuggle an auth prop through the data payload', async () => {
    responses({ id: 'my-outlook', external_user_id: 'tenant:mine', healthy: true, app: { name_slug: 'microsoft_outlook' } });
    const { runConnectorAction } = await import('./pipedream');
    const result = await runConnectorAction({ externalUserId: 'tenant:mine', app: 'microsoft_outlook', action: 'create_email_draft', data: { recipients: ['person@example.com'], subject: 'Sample', content: 'Body', microsoftOutlook: { authProvisionId: 'injected' } } });
    expect(result.ok).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('uses the Salesforce component’s actual authentication prop', async () => {
    responses({ id: 'my-salesforce', external_user_id: 'tenant:mine', healthy: true, app: { name_slug: 'salesforce_rest_api' } });
    const { runConnectorAction } = await import('./pipedream');
    await runConnectorAction({ externalUserId: 'tenant:mine', app: 'salesforce_rest_api', action: 'create_lead', data: { Company: 'Sample', LastName: 'Example' } });
    expect(JSON.parse(fetcher.mock.calls[2][1].body)).toMatchObject({ id: 'salesforce_rest_api-create-lead', configured_props: { Company: 'Sample', LastName: 'Example', salesforce: { authProvisionId: 'my-salesforce' } } });
  });
  it('rejects unmapped sending actions without making a provider request', async () => { const { runConnectorAction } = await import('./pipedream'); expect((await runConnectorAction({ externalUserId: 'tenant:mine', app: 'microsoft_outlook', action: 'send_email', data: {} })).ok).toBe(false); expect(fetcher).not.toHaveBeenCalled(); });
});

describe('DO connector configuration', () => {
  it('requires the dedicated Gmail OAuth app without disabling other connectors', async () => {
    vi.stubEnv('DO_GMAIL_OAUTH_APP_ID', '');
    const { doConnectorConfigured } = await import('./pipedream');
    expect(doConnectorConfigured('gmail')).toBe(false);
    expect(doConnectorConfigured('hubspot')).toBe(true);
    vi.stubEnv('DO_GMAIL_OAUTH_APP_ID', 'test-app');
    expect(doConnectorConfigured('gmail')).toBe(true);
    vi.stubEnv('PIPEDREAM_PROJECT_ID', '');
    expect(doConnectorConfigured('gmail')).toBe(false);
  });
});
