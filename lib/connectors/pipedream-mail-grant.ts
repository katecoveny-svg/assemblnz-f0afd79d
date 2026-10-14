import 'server-only';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { GMAIL_READ_SCOPE, verifiedMailGrant, type MailGrantVerifier } from '@/apps/do/mail/capability';
import { mailAccountId } from '@/apps/do/mail/contract';
import { doConnectorConfigured, listConnectedAccounts, retrievePersonalMailAccountMetadata } from './pipedream';

// Pipedream Retrieve account documents authorized_scopes as effectively granted,
// and expires_at as credential expiry. App scope_profiles / OAuth client settings
// are NOT evidence. Never request include_credentials=true or probe a mailbox.
const metadata = z.object({
  id: mailAccountId,
  external_id: z.string().optional(), external_user_id: z.string().optional(),
  app: z.object({ name_slug: z.literal('gmail') }),
  healthy: z.literal(true), dead: z.literal(false), error: z.null().optional(),
  authorized_scopes: z.array(z.string().max(200)).min(1).max(20),
  expires_at: z.iso.datetime({ offset: true }),
  created_at: z.iso.datetime({ offset: true }), updated_at: z.iso.datetime({ offset: true }),
  credentials: z.null().optional(),
});
export type MailMetadataPorts = {
  configured: typeof doConnectorConfigured;
  accounts: (owner: string, signal: AbortSignal) => Promise<unknown>;
  retrieve: (owner: string, account: string, signal: AbortSignal) => Promise<unknown>;
  now: () => number;
};
function snapshot(raw: unknown, owner: string, account: string, now: number) {
  const parsed = metadata.safeParse(raw);
  if (!parsed.success) return null;
  const a = parsed.data;
  if (a.id !== account || (a.external_id ?? a.external_user_id) !== owner ||
      (a.external_id !== undefined && a.external_id !== owner) ||
      (a.external_user_id !== undefined && a.external_user_id !== owner)) return null;
  const created = Date.parse(a.created_at), updated = Date.parse(a.updated_at);
  if (created > updated || updated > now) return null;
  const scopes = [...new Set(a.authorized_scopes)].sort();
  const expiresAt = Date.parse(a.expires_at);
  // A conservative snapshot comparison, not a claim of an atomic provider lease.
  const revision = createHash('sha256').update(JSON.stringify([owner, a.id, a.app.name_slug, created, updated, expiresAt, scopes])).digest('hex');
  const result = { externalOwner: owner, accountId: account, provider: 'gmail' as const,
    source: 'provider_grant_metadata' as const, revision, scopes, checkedAt: now, expiresAt };
  return scopes.includes(GMAIL_READ_SCOPE) && verifiedMailGrant(result, owner, account, now) ? result : null;
}
function selected(rows: unknown, account: string): unknown {
  if (!Array.isArray(rows) || rows.length > 1000) return null;
  const matches = rows.filter(row => row && typeof row === 'object' && row.id === account);
  return matches.length === 1 ? matches[0] : null;
}

export function createPipedreamMailGrantVerifier(ports: MailMetadataPorts): MailGrantVerifier {
  return async (owner, account, signal) => {
    signal.throwIfAborted();
    if (!owner.startsWith('do:user:') || !z.uuid().safeParse(owner.slice(8)).success ||
        !mailAccountId.safeParse(account).success || !ports.configured('gmail')) return null;
    const checkedAt = ports.now();
    try {
      const first = snapshot(selected(await ports.accounts(owner, signal), account), owner, account, checkedAt);
      signal.throwIfAborted();
      if (!first) return null;
      const exact = snapshot(await ports.retrieve(owner, account, signal), owner, account, checkedAt);
      signal.throwIfAborted();
      if (!exact || exact.revision !== first.revision) return null;
      const last = snapshot(selected(await ports.accounts(owner, signal), account), owner, account, checkedAt);
      signal.throwIfAborted();
      if (!last || last.revision !== first.revision || !verifiedMailGrant(first, owner, account, ports.now())) return null;
      return first;
    } catch {
      signal.throwIfAborted();
      return null; // No private provider errors or metadata escape the verifier.
    }
  };
}
export const verifyPipedreamMailGrant = createPipedreamMailGrantVerifier({
  configured: doConnectorConfigured, accounts: listConnectedAccounts,
  retrieve: retrievePersonalMailAccountMetadata, now: () => Date.now(),
});
