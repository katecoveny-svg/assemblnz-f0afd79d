import 'server-only';
import { verifyPersonalMailGrant, verifiedMailGrant, type MailGrantVerifier } from './capability';
import { z } from 'zod';
import { accountOwner, doConnectorConfigured, doPersonalMailRead, listConnectedAccounts, type ConnectedAccount } from '@/lib/connectors/pipedream';
import { decodeGmail, type GmailPayload } from '@/apps/do/services/family';
import { mailRequest, type MailAccount, type MailDraft, type MailReadiness, type MailRequest, type MailSource } from './contract';

export class MailError extends Error {
  constructor(public code: string, public status = 400) { super(code); }
}
type Owner = { id: string; externalId: string };
export type MailPorts = {
  verifyGrant: MailGrantVerifier;
  accounts: typeof listConnectedAccounts;
  read: typeof doPersonalMailRead;
  configured: typeof doConnectorConfigured;
};
const ports: MailPorts = { verifyGrant: verifyPersonalMailGrant, accounts: listConnectedAccounts, read: doPersonalMailRead, configured: doConnectorConfigured };
const owned = (a: ConnectedAccount, owner: Owner) => accountOwner(a) === owner.externalId &&
  (!a.external_user_id || a.external_user_id === owner.externalId) && (!a.external_id || a.external_id === owner.externalId);
function verifyOwner(owner: Owner) {
  if (!z.uuid().safeParse(owner.id).success || owner.externalId !== `do:user:${owner.id}`) throw new MailError('owner_changed', 401);
}
export function accountReadiness(accounts: ConnectedAccount[], owner: Owner, configured: boolean): MailAccount[] {
  verifyOwner(owner);
  return accounts.filter(a => owned(a, owner) && ['gmail', 'microsoft_outlook'].includes(a.app?.name_slug ?? '') && accounts.filter(other => other.id === a.id).length === 1)
    .slice(0, 50).map(a => ({
      id: a.id, provider: a.app!.name_slug as MailAccount['provider'], label: (a.name || a.app?.name || 'Mail account').slice(0, 160),
      state: a.app?.name_slug === 'microsoft_outlook' ? 'outlook_read_unverified' : a.healthy !== true ? 'reconnect' : !configured ? 'setup_needed' : 'gmail_read_unverified',
      scopeVerified: false,
    }));
}
export async function mailReadiness(owner: Owner, signal: AbortSignal, dependencies = ports): Promise<MailReadiness> {
  verifyOwner(owner); signal.throwIfAborted();
  const gmailConfigured = dependencies.configured('gmail');
  const base = { ownerId: owner.id, metadataOnly: true as const, mailboxRead: false as const, gmailConfigured, outlookReadVerified: false as const };
  // A missing provider configuration is unknown readiness, not an empty mailbox/account list.
  if (!gmailConfigured && !dependencies.configured('microsoft_outlook')) return { ...base, accounts: [], accountsAvailable: false };
  try {
    const accounts = await dependencies.accounts(owner.externalId, signal);
    signal.throwIfAborted();
    const ready = accountReadiness(accounts, owner, gmailConfigured);
    for (const account of ready) {
      if (account.state !== 'gmail_read_unverified') continue;
      const grant = await dependencies.verifyGrant(owner.externalId, account.id, signal);
      if (verifiedMailGrant(grant, owner.externalId, account.id)) { account.state = 'read_available'; account.scopeVerified = true; }
      signal.throwIfAborted();
    }
    return { ...base, accounts: ready, accountsAvailable: true };
  } catch {
    signal.throwIfAborted();
    return { ...base, accounts: [], accountsAvailable: false };
  }
}

function payloadSchema(depth = 0): z.ZodType<GmailPayload> {
  return z.object({
    mimeType: z.string().max(100).optional(), filename: z.string().max(1000).optional(),
    body: z.object({ data: z.string().max(256_000).optional(), attachmentId: z.string().max(1000).optional() }).optional(),
    headers: z.array(z.object({ name: z.string().max(100), value: z.string().max(4000) })).max(100).optional(),
    parts: depth < 12 ? z.array(payloadSchema(depth + 1)).max(30).optional() : z.array(z.never()).max(0).optional(),
  });
}
const messageSchema = z.object({ id: z.string().max(160), snippet: z.string().max(4000).optional(), payload: payloadSchema() });
const listSchema = z.object({ messages: z.array(z.object({ id: z.string().regex(/^[a-zA-Z0-9_-]{1,160}$/) })).max(10).optional(), nextPageToken: z.string().max(2000).optional() });

/** No model, URLs, action dispatcher, storage or externally supplied tool names. */
export async function readMail(raw: unknown, owner: Owner, signal: AbortSignal, recheckOwner: () => Promise<Owner | null>, dependencies = ports): Promise<MailDraft> {
  verifyOwner(owner);
  const request = mailRequest.parse(raw);
  if (request.ownerId !== owner.id) throw new MailError('owner_changed', 409);
  const guard = async () => {
    signal.throwIfAborted();
    const current = await recheckOwner();
    if (!current || current.id !== owner.id || current.externalId !== owner.externalId) throw new MailError('owner_changed', 409);
    const accounts = await dependencies.accounts(owner.externalId, signal);
    const matches = accounts.filter(a => a.id === request.search.accountId);
    if (matches.length !== 1 || !owned(matches[0], owner)) throw new MailError('account_unavailable', 403);
    if (matches[0].app?.name_slug === 'microsoft_outlook') throw new MailError('outlook_read_unverified', 503);
    if (matches[0].app?.name_slug !== 'gmail' || matches[0].healthy !== true) throw new MailError('account_unavailable', 403);
    if (!dependencies.configured('gmail')) throw new MailError('setup_needed', 503);
    if (!verifiedMailGrant(await dependencies.verifyGrant(owner.externalId, request.search.accountId, signal), owner.externalId, request.search.accountId)) throw new MailError('gmail_read_unverified', 503);
    signal.throwIfAborted();
    return matches[0];
  };
  const account = await guard();
  const listed = listSchema.parse(await dependencies.read(owner.externalId, account.id, { kind: 'search', search: request.search }, signal));
  const ids = [...new Set((listed.messages ?? []).map(m => m.id))];
  const selected = request.operation === 'read' ? request.messageIds : ids;
  if (selected.some(id => !ids.includes(id))) throw new MailError('search_changed', 409);
  const sources: MailSource[] = [];
  for (const id of selected) {
    await guard();
    const rawMessage = messageSchema.parse(await dependencies.read(owner.externalId, account.id, { kind: 'message', messageId: id, full: request.operation === 'read' }, signal));
    if (rawMessage.id !== id) throw new MailError('source_mismatch', 502);
    const decoded = decodeGmail(rawMessage);
    if (!decoded) throw new MailError('source_unreadable', 502);
    const text = request.operation === 'read' ? decoded.text : rawMessage.snippet ?? '';
    const limit = request.operation === 'read' ? 3000 : 500;
    sources.push({ key: `${account.id}:${id}`, accountId: account.id, accountLabel: (account.name || 'Gmail account').slice(0, 160), provider: 'gmail', messageId: id,
      subject: decoded.subject, from: decoded.from, date: decoded.date, text: text.slice(0, limit), truncated: decoded.truncated || text.length > limit,
      attachmentsRead: false, trust: 'untrusted_correspondence' });
  }
  await guard(); // Revoke/switch/cancel while awaiting a provider never publishes a draft.
  return { ownerId: owner.id, requestId: request.requestId, search: request.search, operation: request.operation, status: 'review', sources, moreAvailable: Boolean(listed.nextPageToken), checkedAt: new Date().toISOString(), stored: false, modelUsed: false };
}

// Deliberately no server replay cache: mail content and account data stay request-local.
export type { MailRequest };
