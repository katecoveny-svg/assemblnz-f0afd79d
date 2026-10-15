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
import { z } from 'zod';
import { personalMailReadEnabled, verifyPersonalMailGrant, verifiedMailGrant } from '@/apps/do/mail/capability';
import { actionMapFromPack } from '@/apps/do/shared/do-connector-pack';
import { validateConnectorInput } from '@/apps/do/shared/connector-contracts';
import { verifyPipedreamResult, type RunActionResult } from './pipedream-results';
import { gmailSearchQuery, mailAccountId, mailMessageId, mailSearch } from '@/apps/do/mail/contract';
import type { MailRequest } from '@/apps/do/mail/contract';

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

async function accessToken(cfg: PdConfig, signal?: AbortSignal): Promise<string> {
  signal?.throwIfAborted();
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) return tokenCache.token;
  const res = await fetch(`${API}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
    }),
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(10_000)]) : AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`pipedream oauth failed: HTTP ${res.status}`);
  const body = (await res.json()) as { access_token: string; expires_in?: number };
  tokenCache = {
    token: body.access_token,
    expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000,
  };
  return body.access_token;
}

async function pd<T>(cfg: PdConfig, method: 'GET' | 'POST' | 'DELETE', path: string, body?: unknown, bounded?: { signal: AbortSignal; maxBytes: number }): Promise<T> {
  bounded?.signal.throwIfAborted();
  const token = await accessToken(cfg, bounded?.signal);
  bounded?.signal.throwIfAborted();
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-PD-Environment': cfg.environment,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: bounded ? AbortSignal.any([bounded.signal, AbortSignal.timeout(15_000)]) : AbortSignal.timeout(15_000),
    redirect: bounded ? 'error' : 'follow',
    ...(bounded ? { cache: 'no-store' as const } : {}),
  });
  if (bounded) {
    // Private mail/provider errors must never expose bodies or credentials.
    if (!res.ok) { await res.body?.cancel(); throw new Error('mail_provider_unavailable'); }
    const reader = res.body?.getReader();
    if (!reader) throw new Error('mail_provider_unavailable');
    const chunks: Uint8Array[] = []; let bytes = 0;
    try {
      for (;;) {
        bounded.signal.throwIfAborted();
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > bounded.maxBytes) throw new Error('mail_response_too_large');
        chunks.push(value);
      }
      bounded.signal.throwIfAborted();
      return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T;
    } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
  }
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
export async function listConnectedAccounts(externalUserId: string, signal?: AbortSignal): Promise<ConnectedAccount[]> {
  const cfg = pipedreamConfig();
  if (!cfg) return [];
  const body = await pd<{ data?: ConnectedAccount[]; accounts?: ConnectedAccount[] }>(
    cfg,
    'GET',
    `/connect/${cfg.projectId}/accounts?external_user_id=${encodeURIComponent(externalUserId)}&include_credentials=false`,
    undefined,
    signal ? { signal, maxBytes: 128_000 } : undefined,
  );
  return body.data ?? body.accounts ?? [];
}

/** Documented account metadata only; credentials are explicitly excluded. */
export async function retrievePersonalMailAccountMetadata(owner: string, accountId: string, signal: AbortSignal): Promise<unknown> {
  signal.throwIfAborted();
  if (!owner.startsWith('do:user:') || !z.uuid().safeParse(owner.slice(8)).success) throw new Error('mail_owner_required');
  mailAccountId.parse(accountId);
  const cfg = pipedreamConfig();
  if (!cfg) throw new Error('mail_setup_needed');
  return pd(cfg, 'GET', `/connect/${cfg.projectId}/accounts/${encodeURIComponent(accountId)}?include_credentials=false`, undefined, { signal, maxBytes: 16_000 });
}

/** Personal mail's only provider port. Fixed GET endpoints; no attachments or writes.
 * The gateway re-lists search membership before detail reads. Ownership is checked
 * again here immediately before every proxy request, including duplicate IDs.
 */
export async function doPersonalMailRead(owner: string, accountId: string, operation:
  | { kind: 'search'; search: MailRequest['search'] }
  | { kind: 'message'; messageId: string; full: boolean }, signal: AbortSignal): Promise<unknown> {
  signal.throwIfAborted();
  if (!personalMailReadEnabled()) throw new Error('gmail_read_unverified');
  if (!/^do:user:[0-9a-f-]{36}$/.test(owner)) throw new Error('mail_owner_required');
  mailAccountId.parse(accountId);
  const cfg = pipedreamConfig();
  if (!cfg || !process.env.DO_GMAIL_OAUTH_APP_ID?.trim()) throw new Error('mail_setup_needed');
  let path: string;
  if (operation.kind === 'search') {
    const search = mailSearch.parse(operation.search);
    if (search.accountId !== accountId) throw new Error('mail_account_mismatch');
    path = `messages?${new URLSearchParams({ q: gmailSearchQuery(search), maxResults: '10', includeSpamTrash: 'false' })}`;
  } else {
    const id = mailMessageId.parse(operation.messageId);
    path = `messages/${id}?format=${operation.full ? 'full' : 'metadata'}`;
    if (!operation.full) path += '&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date';
  }
  const grant = await verifyPersonalMailGrant(owner, accountId, signal);
  if (!verifiedMailGrant(grant, owner, accountId)) throw new Error('gmail_read_unverified');
  const { gmailGrantSnapshot } = await import('./pipedream-mail-grant');
  const matches = (await listConnectedAccounts(owner, signal)).filter(account => account.id === accountId);
  if (matches.length !== 1 || accountOwner(matches[0]) !== owner || (matches[0].external_user_id && matches[0].external_user_id !== owner) || (matches[0].external_id && matches[0].external_id !== owner) || matches[0].healthy !== true || matches[0].app?.name_slug !== 'gmail') throw new Error('mail_account_unavailable');
  const finalSnapshot = gmailGrantSnapshot(matches[0], owner, accountId, Date.now());
  if (!personalMailReadEnabled() || !verifiedMailGrant(grant, owner, accountId) || !finalSnapshot || finalSnapshot.revision !== grant.revision) throw new Error('gmail_read_unverified');
  signal.throwIfAborted();
  const url = Buffer.from(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`).toString('base64url');
  const result = await pd(cfg, 'GET', `/connect/${cfg.projectId}/proxy/${url}?external_user_id=${encodeURIComponent(owner)}&account_id=${encodeURIComponent(accountId)}`, undefined, { signal, maxBytes: operation.kind === 'search' ? 16_000 : 256_000 });
  const current = await verifyPersonalMailGrant(owner, accountId, signal);
  if (!verifiedMailGrant(current, owner, accountId) || current.revision !== grant.revision) throw new Error('gmail_read_unverified');
  signal.throwIfAborted();
  return result;
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
export const PIPEDREAM_ACTION_MAP = actionMapFromPack();

export type { RunActionResult } from './pipedream-results';

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
    return slug === mapped.accountApp;
  });
  if (!account) {
    return { ok: false, detail: { error: `no connected ${input.app} account for ${input.externalUserId}` } };
  }

  const validated = validateConnectorInput(input.action, input.app, input.data);
  if (!validated.ok) {
    return { ok: false, detail: { error: 'invalid connector input', reason: validated.error } };
  }

  try {
    const body = await pd<Record<string, unknown>>(cfg, 'POST', `/connect/${cfg.projectId}/actions/run`, {
      external_user_id: input.externalUserId,
      id: mapped.componentId,
      configured_props: {
        ...validated.data,
        [mapped.authProp]: { authProvisionId: account.id },
      },
    });
    return verifyPipedreamResult(mapped, validated.data, body);
  } catch (e) {
    return { ok: false, detail: { error: e instanceof Error ? e.message : 'unknown' } };
  }
}
