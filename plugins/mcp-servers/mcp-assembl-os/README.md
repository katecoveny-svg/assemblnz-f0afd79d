# Assembl OS MCP

Remote Streamable HTTP MCP server for authenticated, tenant-governed Assembl work, proof, and approval requests.

## v0.2 shape

This remains intentionally **tool-only**: the MCP protocol is a doorway into the Assembl runtime, not a second runtime or authorization system.

```text
ChatGPT / Codex / MCP client
        ↓ OAuth 2.1 bearer
Assembl OS MCP (/mcp)
        ↓ same verified bearer
/api/mcp-bridge
        ↓ Assembl membership + permission checks
lib/os/tasks · lib/os/evidence · lib/agents/action-requests
```

The MCP process never connects directly to Supabase service-role data or customer systems.

## Tools

| Tool | Assembl permission | What it does |
| --- | --- | --- |
| `list_work` | `work.read` | Lists recent work in the caller's authorised workspace. |
| `get_work_item` | `work.read` | Reads one tenant-checked work item and activity. |
| `read_proof` | `proof.read` | Reads task proof or recent workspace proof. |
| `create_work_item` | `work.create` | Creates an internal `proposed` task only. |
| `request_action_approval` | `approval.request` | Files an email draft into the existing human approval queue; never sends it. |

Write tools also require `ASSEMBL_MCP_WRITES_ENABLED=true`. Actual dispatch remains separately gated by the existing human approval flow and `ACTION_DISPATCH_ENABLED`.

## Authentication

Production auth uses the existing Supabase user base as an OAuth 2.1 authorization server. The MCP resource server exposes protected-resource metadata at:

```text
/.well-known/oauth-protected-resource
```

Unauthenticated MCP requests return a `WWW-Authenticate` challenge pointing to that metadata. Supabase handles Authorization Code + PKCE, token refresh, discovery and dynamic client registration.

OAuth proves **who the caller is**. Assembl's `mcp_tenant_memberships` table independently decides **which workspace and business permissions they have**.

Supabase's current OAuth server supports standard identity scopes rather than app-specific custom scopes, so the MCP advertises only `email profile`. Assembl permissions stay server-side and are never trusted from model input.

## Consent screen

The web app ships:

- `/oauth/consent`
- `/oauth/consent/decision`

The user sees the requesting client, the exact Assembl workspace, and the internal permissions being granted. Consent fails closed when no active membership exists or multiple memberships exist without one explicit default.

## Setup

See the full production and dogfood runbook:

`docs/MCP-OAUTH-SETUP.md`

Core production environment:

```bash
ASSEMBL_BASE_URL=https://assembl.co.nz
ASSEMBL_MCP_PUBLIC_URL=https://YOUR-MCP-HOST
ASSEMBL_MCP_AUTH_MODE=oauth
ASSEMBL_MCP_AUTHORIZATION_SERVER=https://YOUR_PROJECT.supabase.co/auth/v1
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
ASSEMBL_MCP_WRITES_ENABLED=false
```

Before customer use:

1. apply the `mcp_tenant_memberships` migration;
2. enable Supabase OAuth Server;
3. set its Authorization Path to `/oauth/consent`;
4. grant one test account a workspace membership;
5. deploy this MCP server at stable HTTPS;
6. connect `/mcp` in ChatGPT Developer Mode or MCP Inspector;
7. prove read-only tenant isolation first;
8. enable MCP writes only in staging and verify they remain `proposed` / `pending`.

## Inspector fallback

`ASSEMBL_MCP_AUTH_MODE=dev-token` keeps the original private-alpha path available for local MCP Inspector testing. It requires separate client and bridge tokens and an explicit `ASSEMBL_MCP_ALLOW_LEGACY_BRIDGE_TOKEN=true` on the web app. Do not use it for multi-tenant production.

## Security invariants

- Tenant comes from an authenticated membership, never tool arguments.
- Every OAuth bearer is preflighted against Assembl before MCP handling.
- The app bridge verifies identity again before reading business data.
- A task ID from another tenant is returned as not found.
- Business permissions are allowlisted per membership.
- Writes require both permission and a server-side feature flag.
- MCP creates only internal proposals / approval requests; it never directly sends, publishes, spends or deletes.
- OAuth client ID is retained as evidence metadata when available.
- Multiple workspaces fail closed until one is deliberately selected/defaulted.

## References

- OpenAI Plugins authentication: https://developers.openai.com/plugins/build/auth
- OpenAI MCP server guide: https://developers.openai.com/plugins/build/mcp-server
- Supabase OAuth 2.1 Server: https://supabase.com/docs/guides/auth/oauth-server
- Supabase MCP Authentication: https://supabase.com/docs/guides/auth/oauth-server/mcp-authentication
- MCP TypeScript SDK v2: https://github.com/modelcontextprotocol/typescript-sdk
