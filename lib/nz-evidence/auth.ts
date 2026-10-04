/** Separate NZ resource contract. No runtime verifier, memberships or clients are installed. */
export const NZ_RESOURCE = 'https://www.assembl.co.nz/api/nz-evidence/mcp';
export const NZ_SCOPES = ['nz.business.read', 'nz.evidence.prepare', 'nz.evidence.read'] as const;
export type NzScope = typeof NZ_SCOPES[number];
export class NzServiceError extends Error {
  constructor(public readonly code: 'unavailable' | 'unauthorized' | 'forbidden' | 'invalid_input' | 'not_found' | 'request_conflict') {
    super(code);
  }
}
export type NzPrincipal = { ownerId: string; tenantId: string; clientId: string; scopes: NzScope[] };
export type VerifiedAccess = {
  issuer: string; audience: string[]; subject: string; clientId: string;
  scopes: string[]; expiresAt: number; notBefore: number;
};
export type Membership = { ownerId: string; tenantId: string; active: boolean; scopes: string[] };
export type NzAuthAdapter = {
  // Must verify signature/algorithm/JWKS or introspection, revocation and token type.
  // Decoded JWT claims or an ID token are NOT a valid implementation.
  verifyAccessToken(token: string): Promise<VerifiedAccess | null>;
  // Authoritative membership lookup; never request-supplied tenant/user metadata.
  membership(subject: string): Promise<Membership | null>;
};
export function createNzAuthenticator(config?: {
  issuer: string; allowedClientIds: readonly string[]; adapter: NzAuthAdapter;
}) {
  return async (request: Request, scope: NzScope, now = Date.now()): Promise<NzPrincipal> => {
    if (!config || !config.issuer || !config.allowedClientIds.length) throw new NzServiceError('unavailable');
    const header = request.headers.get('authorization') ?? '';
    if (!/^Bearer [^\s]{1,8192}$/.test(header)) throw new NzServiceError('unauthorized');
    try {
      const access = await config.adapter.verifyAccessToken(header.slice(7));
      if (!access || access.issuer !== config.issuer || !access.audience.includes(NZ_RESOURCE)
        || !access.subject || !access.clientId || !config.allowedClientIds.includes(access.clientId)
        || !Number.isFinite(access.expiresAt) || !Number.isFinite(access.notBefore)
        || access.expiresAt <= now || access.notBefore > now) throw new NzServiceError('unauthorized');
      if (!access.scopes.includes(scope)) throw new NzServiceError('forbidden');
      const member = await config.adapter.membership(access.subject);
      if (!member?.active || member.ownerId !== access.subject || !member.tenantId || !member.scopes.includes(scope))
        throw new NzServiceError('forbidden');
      return { ownerId: member.ownerId, tenantId: member.tenantId, clientId: access.clientId,
        scopes: NZ_SCOPES.filter(s => access.scopes.includes(s) && member.scopes.includes(s)) };
    } catch (error) {
      if (error instanceof NzServiceError) throw error;
      throw new NzServiceError('unavailable');
    }
  };
}
export const authenticateNzRequest = createNzAuthenticator();
