/**
 * Pipedream Connect client — the first real provider behind the connector
 * abstraction (docs/CONNECTOR-BAKEOFF-2026-07-05.md picked it for PR 4).
 *
 * Shape of the world:
 *   - A pilot customer connects THEIR account (Google Sheets, HubSpot, …)
 *     once, via a Connect link we mint. Pipedream holds the OAuth grant;
 *     we never see credentials. Accounts are keyed by an external_user_id
 *     we choose — convention: `tenant:<slug>` for pilot workspaces.
 *   - Approved connector_action rows are executed server-side against that
 *     connected account (see dispatchAction in lib/agents/action-requests.ts)
 *     — only after a named operator's yes AND ACTION_DISPATCH_ENABLED=true.
 *
 * Everything is env-gated and fails honest: with no PIPEDREAM_* env this
 * module reports "not configured" and nothing pretends otherwise. Setup:
 * docs/PIPEDREAM-CONNECT-SETUP.md.
 */
import 'server-only';

const API = 'https://api.pipedream.com/v1';

type PdConfig = {
  clientId: string;
  clientSecret: string;
  projectId: string;
  environment: 'development' | 'production';
};

export function pipedreamConfig(): PdConfig | null {
  const clientId = process.env.PIPEDREAM_CLIENT_ID;
  const clientSecret = process.env.PIPEDREAM_CLIENT_SECRET;
  const projectId = process.env.PIPEDREAM_PROJECT_ID;
  if (!clientId || !clientSecret || !projectId) return null;
  return {
    clientId,
    clientSecret,
    projectId,
    environment: process.env.PIPEDREAM_PROJECT_ENVIRONMENT === 'production' ? 'production' : 'development',
  };
}

export function pipedreamConfigured(): boolean {
  return pipedreamConfig() !== null;
}

/** Configuration readiness is separate from a user's OAuth grant. */
export function doConnectorConfigured(app: string): boolean {
  return pipedreamConfigured() && (app !== 'gmail' || Boolean(process.env.DO_GMAIL_OAUTH_APP_ID?.trim()));
}

// ── OAuth (client credentials) ──────────────────────────────────────────────

let tokenCache: { token: string; expiresAt: number } | null = null;

async function accessToken(cfg: PdConfig): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) return tokenCache.token;
  const res = await fetch(`${API}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`pipedream oauth failed: HTTP ${res.status}`);
  const body = (await res.json()) as { access_token: string; expires_in?: number };
  tokenCache = {
    token: body.access_token,
    expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000,
  };
  return body.access_token;
}

async function pd<T>(cfg: PdConfig, method: 'GET' | 'POST' | 'DELETE', path: string, body?: unknown): Promise<T> {
  const token = await accessToken(cfg);
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-PD-Environment': cfg.environment,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`pipedream ${method} ${path} failed: HTTP ${res.status}${text ? ` — ${text.slice(0, 200)}` : ''}`);
  }
  // DELETEs come back 204/empty — only parse when there's a body to parse.
  const text = await res.text().catch(() => '');
  return (text ? JSON.parse(text) : {}) as T;
}

// ── Connect links (onboarding a pilot's account) ────────────────────────────

export type ConnectLink = { token: string; expires_at?: string; connect_link_url: string };

/**
 * Mint a short-lived Connect token + hosted link for a customer to connect
 * their account. external_user_id convention: `tenant:<slug>`.
 */
export async function createConnectLink(externalUserId: string): Promise<ConnectLink> {
  const cfg = pipedreamConfig();
  if (!cfg) throw new Error('Pipedream Connect is not configured (PIPEDREAM_* env missing)');
  return pd<ConnectLink>(cfg, 'POST', `/connect/${cfg.projectId}/tokens`, {
    external_user_id: externalUserId,
  });
}

export type ConnectedAccount = {
  id: string;
  app?: { name_slug?: string; name?: string };
  name?: string;
  healthy?: boolean;
  external_user_id?: string;
  external_id?: string;
  created_at?: string;
  updated_at?: string;
};

/** DO's Gmail reader has no caller-controlled URL, method, or account owner. */
export async function doGmailReader(externalUserId: string) {
  if (!/^do:user:[0-9a-f-]{36}$/.test(externalUserId)) throw new Error('Invalid DO owner');
  const cfg = pipedreamConfig();
  if (!cfg || !process.env.DO_GMAIL_OAUTH_APP_ID) throw new Error('Gmail setup needed');
  const accounts = await listConnectedAccounts(externalUserId);
  const account = accounts.find(a => accountOwner(a) === externalUserId && a.app?.name_slug === 'gmail' && a.healthy === true);
  if (!account) throw new Error('Connect Gmail first');
  return async function read<T>(path: string): Promise<T> {
    if (!/^messages(?:\?|\/[a-zA-Z0-9_-]+\?)/.test(path) || path.length > 5000) throw new Error('Invalid Gmail read');
    const url = Buffer.from(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`).toString('base64url');
    return pd<T>(cfg, 'GET', `/connect/${cfg.projectId}/proxy/${url}?external_user_id=${encodeURIComponent(externalUserId)}&account_id=${encodeURIComponent(account.id)}`);
  };
}

export async function connectDoGmail(externalUserId: string) {
  const oauthAppId = process.env.DO_GMAIL_OAUTH_APP_ID;
  if (!oauthAppId || !/^do:user:[0-9a-f-]{36}$/.test(externalUserId)) throw new Error('Gmail setup needed');
  const link = await createConnectLink(externalUserId);
  const url = new URL(link.connect_link_url);
  url.searchParams.set('app', 'gmail');
  url.searchParams.set('oauthAppId', oauthAppId);
  return url.toString();
}

export async function disconnectDoGmail(externalUserId: string) {
  if (!/^do:user:[0-9a-f-]{36}$/.test(externalUserId)) throw new Error('Invalid DO owner');
  const cfg = pipedreamConfig();
  if (!cfg) throw new Error('Gmail setup needed');
  const accounts = await listConnectedAccounts(externalUserId);
  for (const account of accounts.filter(a => accountOwner(a) === externalUserId && a.app?.name_slug === 'gmail')) {
    await pd(cfg, 'DELETE', `/connect/${cfg.projectId}/accounts/${encodeURIComponent(account.id)}`);
  }
}

/** Accounts a customer has connected under our project. */
export async function listConnectedAccounts(externalUserId: string): Promise<ConnectedAccount[]> {
  const cfg = pipedreamConfig();
  if (!cfg) return [];
  const body = await pd<{ data?: ConnectedAccount[]; accounts?: ConnectedAccount[] }>(
    cfg,
    'GET',
    `/connect/${cfg.projectId}/accounts?external_user_id=${encodeURIComponent(externalUserId)}`,
  );
  return body.data ?? body.accounts ?? [];
}

/** Every account connected under the project, whoever owns it — the
 *  /admin/connectors table groups these by external user. */
export async function listAllConnectedAccounts(): Promise<ConnectedAccount[]> {
  const cfg = pipedreamConfig();
  if (!cfg) return [];
  const body = await pd<{ data?: ConnectedAccount[]; accounts?: ConnectedAccount[] }>(
    cfg,
    'GET',
    `/connect/${cfg.projectId}/accounts`,
  );
  return body.data ?? body.accounts ?? [];
}

/** The owner key Pipedream reports on an account — the API has used both
 *  field names across versions, so read either. */
export function accountOwner(account: ConnectedAccount): string | null {
  return account.external_user_id ?? account.external_id ?? null;
}

/**
 * Delete an external user and every account they've connected under our
 * project. The customer's own Google/HubSpot account is untouched — this
 * only severs the grant Pipedream holds for us.
 */
export async function revokeExternalUser(externalUserId: string): Promise<void> {
  const cfg = pipedreamConfig();
  if (!cfg) throw new Error('Pipedream Connect is not configured (PIPEDREAM_* env missing)');
  await pd(cfg, 'DELETE', `/connect/${cfg.projectId}/users/${encodeURIComponent(externalUserId)}`);
}

/** Pre-filter the hosted Connect page to one app (Pipedream honours ?app=). */
export function withAppFilter(connectLinkUrl: string, appSlug?: string | null): string {
  if (!appSlug) return connectLinkUrl;
  return `${connectLinkUrl}${connectLinkUrl.includes('?') ? '&' : '?'}app=${encodeURIComponent(appSlug)}`;
}

// ── Running actions ─────────────────────────────────────────────────────────

/**
 * DO + pilot action map — assembl action → Pipedream component per app.
 * Component IDs are published Pipedream keys (verify in Connect dashboard
 * on first run). Anything unmapped fails honestly.
 */
export const PIPEDREAM_ACTION_MAP: Record<string, Record<string, { componentId: string; note: string; authProp?: string }>> = {
  create_email_draft: {
    gmail: {
      componentId: 'gmail-create-draft',
      authProp: 'gmail',
      note: 'Creates an unsent Gmail draft. Never sends.',
    },
    microsoft_outlook: {
      componentId: 'microsoft_outlook-create-draft-email',
      authProp: 'microsoftOutlook',
      note: 'Creates an unsent Outlook draft.',
    },
  },
  list_calendar_events: {
    google_calendar: {
      componentId: 'google_calendar-list-events',
      authProp: 'googleCalendar',
      note: 'Lists calendar events (prefer fields=compact).',
    },
  },
  create_calendar_event: {
    google_calendar: {
      componentId: 'google_calendar-create-event',
      authProp: 'googleCalendar',
      note: 'Creates a calendar event the owner can edit in Google Calendar.',
    },
  },
  add_sheet_row: {
    google_sheets: {
      componentId: 'google_sheets-add-single-row',
      note: 'Appends one reviewed row to a sheet.',
    },
  },
  get_drive_file: {
    google_drive: {
      componentId: 'google_drive-get-file-by-id',
      authProp: 'googleDrive',
      note: 'Reads Drive file metadata by id.',
    },
  },
  post_slack_message: {
    slack: {
      componentId: 'slack_v2-send-message',
      authProp: 'slack',
      note: 'Posts a reviewed Slack message (approval-gated). Uses slack_v2 component package.',
    },
  },
  create_lead: {
    hubspot: {
      componentId: 'hubspot-create-or-update-contact',
      note: 'Creates or updates a HubSpot contact.',
    },
    salesforce_rest_api: {
      componentId: 'salesforce_rest_api-create-lead',
      authProp: 'salesforce',
      note: 'Creates a Salesforce lead.',
    },
  },
  create_notion_page: {
    notion: {
      componentId: 'notion-create-page',
      authProp: 'notion',
      note: 'Creates a Notion page from reviewed content.',
    },
  },
  create_task: {
    todoist: {
      componentId: 'todoist-create-task',
      authProp: 'todoist',
      note: 'Creates a Todoist task.',
    },
    linear_app: {
      componentId: 'linear_app-create-issue',
      authProp: 'linearApp',
      note: 'Creates a Linear issue.',
    },
  },
  retrieve_invoice: {
    stripe: {
      componentId: 'stripe-retrieve-invoice',
      authProp: 'stripe',
      note: 'Reads a Stripe invoice for bills review.',
    },
  },
  list_folder: {
    dropbox: {
      componentId: 'dropbox-list-file-folders-in-a-folder',
      authProp: 'dropbox',
      note: 'Lists files/folders in a Dropbox path.',
    },
  },
};

export type RunActionResult = { ok: boolean; detail: Record<string, unknown> };

/**
 * Execute a mapped action against the customer's connected account. Reaches
 * Pipedream's Connect action-run API; every failure comes back as an honest
 * {ok:false} the caller records on the action request row.
 */
export async function runConnectorAction(input: {
  externalUserId: string;
  action: string;
  app: string;
  data: Record<string, unknown>;
}): Promise<RunActionResult> {
  const cfg = pipedreamConfig();
  if (!cfg) return { ok: false, detail: { error: 'pipedream not configured' } };

  const mapped = PIPEDREAM_ACTION_MAP[input.action]?.[input.app];
  if (!mapped) {
    return { ok: false, detail: { error: `no component mapped for ${input.action} on ${input.app}` } };
  }

  const accounts = await listConnectedAccounts(input.externalUserId).catch(() => []);
  const account = accounts.find((a) => {
    const slug = a.app?.name_slug ?? '';
    if (accountOwner(a) !== input.externalUserId || a.healthy !== true) return false;
    if (slug === input.app) return true;
    // Slack Connect may report slack_v2 while DO pack declares slack.
    if (input.app === 'slack' && (slug === 'slack' || slug === 'slack_v2')) return true;
    return false;
  });
  if (!account) {
    return { ok: false, detail: { error: `no connected ${input.app} account for ${input.externalUserId}` } };
  }

  try {
    const body = await pd<Record<string, unknown>>(cfg, 'POST', `/connect/${cfg.projectId}/actions/run`, {
      external_user_id: input.externalUserId,
      id: mapped.componentId,
      configured_props: {
        ...input.data,
        [mapped.authProp ?? input.app]: { authProvisionId: account.id },
      },
    });
    return { ok: true, detail: { component: mapped.componentId, response: body } };
  } catch (e) {
    return { ok: false, detail: { error: e instanceof Error ? e.message : 'unknown' } };
  }
}
