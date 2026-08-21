# Assembl MCP — OAuth production setup

## What this changes

The MCP resource server no longer chooses a tenant from environment variables in production. The caller signs in through Supabase OAuth 2.1, the access token identifies the user, and Assembl resolves that user to one explicit workspace plus a small set of business permissions.

```text
ChatGPT / Codex / MCP client
        ↓ OAuth 2.1 + PKCE
Supabase Auth
        ↓ bearer access token
Assembl MCP resource server
        ↓ same token
/api/mcp-bridge
        ↓ verify user + membership
Assembl task / proof / approval rails
```

OAuth proves identity. `public.mcp_tenant_memberships` controls business authority.

## Internal Assembl permissions

These are intentionally NOT OAuth scopes:

- `work.read` — list and inspect work items
- `proof.read` — read proof/evidence
- `work.create` — create a proposed internal work item
- `approval.request` — place an email draft into the human approval queue

Supabase OAuth Server currently supports standard OIDC scopes only (`openid`, `email`, `profile`, `phone`). Business permissions therefore stay in Assembl where they can be changed without depending on the identity provider's scope model.

No MCP permission grants `send`, `publish`, `spend`, `delete`, or direct external-system mutation.

## 1. Apply the database migration

Apply:

`supabase/migrations/20260821143000_mcp_oauth_memberships.sql`

Then grant a test user an explicit workspace. Use the user's Supabase Auth UUID, never an email address as the authorization key.

```sql
insert into public.mcp_tenant_memberships
  (user_id, tenant, permissions, is_default)
values
  ('USER_UUID', 'assembl',
   array['work.read','proof.read','work.create','approval.request'], true)
on conflict (user_id, tenant) do update
set permissions = excluded.permissions,
    is_default = excluded.is_default,
    status = 'active',
    updated_at = now();
```

Start read-only for external testers:

```sql
array['work.read','proof.read']
```

## 2. Enable Supabase OAuth 2.1 Server

In Supabase Dashboard:

1. Authentication → OAuth Server.
2. Enable OAuth 2.1 server capabilities.
3. Set the Authorization Path to `/oauth/consent`.
4. Confirm the project's Site URL is the canonical Assembl web URL.
5. Prefer an asymmetric JWT signing key (RS256 or ES256), especially if requesting `openid`.
6. Enable Dynamic Client Registration if the MCP client relies on DCR. Require user approval and monitor registered clients.

Supabase exposes OAuth discovery, authorization, token and JWKS endpoints from the existing project.

## 3. Deploy the consent UI

This branch adds:

- `/oauth/consent`
- `/oauth/consent/decision`

The consent page:

- requires the user's normal Assembl login;
- reads the OAuth client name and requested identity scopes;
- shows the exact Assembl workspace and internal permissions;
- refuses approval when the account has no active MCP membership;
- refuses ambiguous multi-workspace access unless one workspace is marked `is_default=true`.

## 4. Configure the MCP resource server

Production environment:

```bash
ASSEMBL_BASE_URL=https://assembl.co.nz
ASSEMBL_MCP_PUBLIC_URL=https://YOUR-MCP-HOST
ASSEMBL_MCP_AUTH_MODE=oauth
ASSEMBL_MCP_AUTHORIZATION_SERVER=https://YOUR_PROJECT.supabase.co/auth/v1
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
ASSEMBL_MCP_WRITES_ENABLED=false
```

Keep writes off until read-only OAuth is proven end to end.

The MCP host publishes:

`GET /.well-known/oauth-protected-resource`

and returns a `WWW-Authenticate` challenge when a bearer token is missing.

## 5. Connect from ChatGPT developer mode

Use the hosted HTTPS MCP URL:

`https://YOUR-MCP-HOST/mcp`

The client should discover the protected-resource metadata, then Supabase OAuth metadata, register/identify itself, and run Authorization Code + PKCE. The production ChatGPT callback URL shown during app configuration must be accepted by the OAuth client/registration flow.

Test in this order:

1. Link account.
2. `list_work` with read-only permissions.
3. `get_work_item` for a task in the same workspace.
4. Attempt a task ID from another tenant — must return not found.
5. `read_proof`.
6. Remove `work.read` from the membership and confirm work reads fail.
7. Re-add it.
8. Enable `ASSEMBL_MCP_WRITES_ENABLED=true` only in staging.
9. Test `create_work_item` — state must be `proposed`.
10. Test `request_action_approval` — state must be `pending`; no email should send.

## 6. Private-alpha fallback

For MCP Inspector while OAuth is not configured:

```bash
ASSEMBL_MCP_AUTH_MODE=dev-token
ASSEMBL_MCP_CLIENT_TOKEN=...
ASSEMBL_MCP_BRIDGE_TOKEN=...
ASSEMBL_MCP_TENANT=assembl
```

On the Assembl web app, legacy bridge-token acceptance must also be explicitly enabled:

```bash
ASSEMBL_MCP_ALLOW_LEGACY_BRIDGE_TOKEN=true
```

Never use this mode for a multi-tenant production deployment.

## 7. Security invariants

- Tenant is derived server-side; tools cannot supply or override it.
- OAuth token identity is verified with Supabase Auth before business data is read.
- Business permissions come from `mcp_tenant_memberships`, not model instructions.
- Task/evidence reads are tenant checked.
- Writes require both membership permission and `ASSEMBL_MCP_WRITES_ENABLED=true`.
- The current approval tool creates a pending request only.
- Existing `ACTION_DISPATCH_ENABLED` and human review remain separate downstream gates.
- OAuth client ID is recorded in MCP-created evidence where available.
- Multiple workspaces fail closed unless one is explicitly the default.

## Next hardening after dogfood

1. Validate the token audience/resource claim once the Supabase OAuth `resource` behavior is confirmed in staging.
2. Move internal MCP permissions into custom JWT claims if/when that improves latency without weakening server-side membership checks.
3. Add per-client allow/deny policy using the OAuth `client_id` claim.
4. Add revocation/connection management in the Assembl account UI.
5. Add rate limits and anomaly alerts per user/client/workspace.
6. Add a workspace-selection flow rather than requiring `is_default` when users genuinely operate across several tenants.
