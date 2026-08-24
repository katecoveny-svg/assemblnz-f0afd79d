import 'server-only';
import { timingSafeEqual } from 'node:crypto';
import { getServiceClient } from '@/lib/supabase/service';

export const MCP_PERMISSIONS = [
  'work.read',
  'proof.read',
  'work.create',
  'approval.request',
] as const;

export type McpPermission = (typeof MCP_PERMISSIONS)[number];

export type McpPrincipal = {
  userId: string;
  actor: string;
  tenant: string;
  permissions: McpPermission[];
  clientId: string | null;
  authMode: 'oauth' | 'legacy-dev';
};

type MembershipRow = {
  tenant: string;
  permissions: string[] | null;
  is_default: boolean;
};

function safeEqual(actual: string, expected: string): boolean {
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function normalisePermissions(values: string[] | null): McpPermission[] {
  const allowed = new Set<string>(MCP_PERMISSIONS);
  return (values ?? []).filter((value): value is McpPermission => allowed.has(value));
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get('authorization') ?? '';
  return header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : null;
}

/**
 * Authenticate one MCP bridge request.
 *
 * Production: the bearer token is a Supabase OAuth/user access token. Identity
 * is verified by Supabase Auth, then tenant + business permissions are loaded
 * from mcp_tenant_memberships. Tenant is never accepted from the tool input.
 *
 * Local/private-alpha: an explicitly enabled legacy service token can still be
 * used while OAuth is being configured. It is off by default.
 */
export async function authenticateMcpRequest(request: Request): Promise<
  | { ok: true; principal: McpPrincipal }
  | { ok: false; status: 401 | 403 | 409 | 503; error: string }
> {
  const token = bearerToken(request);
  if (!token) return { ok: false, status: 401, error: 'missing_bearer_token' };

  const legacyEnabled = process.env.ASSEMBL_MCP_ALLOW_LEGACY_BRIDGE_TOKEN === 'true';
  const legacyToken = process.env.ASSEMBL_MCP_BRIDGE_TOKEN;
  if (legacyEnabled && legacyToken && safeEqual(token, legacyToken)) {
    const tenant = process.env.ASSEMBL_MCP_TENANT;
    if (!tenant) return { ok: false, status: 503, error: 'legacy_tenant_not_configured' };
    return {
      ok: true,
      principal: {
        userId: 'legacy-dev',
        actor: process.env.ASSEMBL_MCP_ACTOR ?? 'mcp-dev',
        tenant,
        permissions: [...MCP_PERMISSIONS],
        clientId: null,
        authMode: 'legacy-dev',
      },
    };
  }

  try {
    const supabase = getServiceClient();
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    const user = userData.user;
    if (userError || !user) return { ok: false, status: 401, error: 'invalid_access_token' };

    const { data, error } = await supabase
      .from('mcp_tenant_memberships')
      .select('tenant, permissions, is_default')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (error) return { ok: false, status: 503, error: 'membership_lookup_failed' };
    const memberships = (data ?? []) as MembershipRow[];
    if (memberships.length === 0) return { ok: false, status: 403, error: 'no_mcp_workspace_access' };

    const membership = memberships.find((row) => row.is_default) ?? (memberships.length === 1 ? memberships[0] : null);
    if (!membership) return { ok: false, status: 409, error: 'mcp_workspace_selection_required' };

    const permissions = normalisePermissions(membership.permissions);
    if (permissions.length === 0) return { ok: false, status: 403, error: 'no_mcp_permissions' };

    // OAuth access tokens carry client_id. getUser() intentionally returns the
    // user object rather than raw JWT claims, so decode only this non-secret
    // routing/audit claim; token signature/expiry has already been verified.
    let clientId: string | null = null;
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8')) as { client_id?: unknown };
      clientId = typeof payload.client_id === 'string' ? payload.client_id : null;
    } catch {
      clientId = null;
    }

    return {
      ok: true,
      principal: {
        userId: user.id,
        actor: user.email ?? user.id,
        tenant: membership.tenant,
        permissions,
        clientId,
        authMode: 'oauth',
      },
    };
  } catch {
    return { ok: false, status: 503, error: 'mcp_auth_unavailable' };
  }
}

export function hasMcpPermission(principal: McpPrincipal, permission: McpPermission): boolean {
  return principal.permissions.includes(permission);
}
