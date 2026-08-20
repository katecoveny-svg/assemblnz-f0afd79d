# Assembl OS MCP

Remote Streamable HTTP MCP server for Assembl work, proof, and approval requests.

## Shape

This is intentionally a **tool-only MCP server**. There is no custom widget in v0.1.

The protocol adapter is kept separate from Assembl business logic:

```text
ChatGPT / MCP client
        ↓
Assembl OS MCP (:8787/mcp)
        ↓
/api/mcp-bridge (service-token protected)
        ↓
lib/os/tasks · lib/os/evidence · lib/agents/action-requests
```

The MCP server does not connect directly to Supabase or customer systems. The Assembl app remains the authority for tenancy, task state, evidence, and approvals.

## Tools

| Tool | Type | What it does |
| --- | --- | --- |
| `list_work` | read | Lists recent tenant-scoped work items. |
| `get_work_item` | read | Reads one work item and its activity history. |
| `read_proof` | read | Reads task proof or recent workspace proof. |
| `create_work_item` | write | Creates an internal `proposed` task only. |
| `request_action_approval` | write | Files an email draft into the existing human approval queue. It never sends the email. |

Write tools are disabled unless `ASSEMBL_MCP_WRITES_ENABLED=true`. Even then, no MCP tool dispatches externally. `request_action_approval` uses the existing `agent_action_requests` gate; actual dispatch remains separately dependent on human approval and the existing `ACTION_DISPATCH_ENABLED` environment flag.

## Local setup

### 1. Configure the Assembl app bridge

In the main Assembl app environment:

```bash
ASSEMBL_MCP_BRIDGE_TOKEN=<long-random-secret>
```

Start the main app normally on port 3000.

### 2. Configure this MCP process

```bash
cd plugins/mcp-servers/mcp-assembl-os
cp .env.example .env
```

Use the same `ASSEMBL_MCP_BRIDGE_TOKEN` as the main app. Set a separate `ASSEMBL_MCP_CLIENT_TOKEN` for the MCP client.

Install and run:

```bash
npm install
npm run typecheck
npm run build
npm start
```

Health check:

```bash
curl http://127.0.0.1:8787/health
```

### 3. Test with MCP Inspector

Use the MCP Inspector against:

```text
http://127.0.0.1:8787/mcp
```

Send this client header:

```text
Authorization: Bearer <ASSEMBL_MCP_CLIENT_TOKEN>
```

Exercise every tool with valid, invalid, and unauthorized inputs. Confirm write tools remain disabled until deliberately enabled.

## ChatGPT developer-mode testing

OpenAI currently expects customer-specific authenticated MCP servers to use OAuth 2.1. The bearer-token wrapper in this package is therefore a **private-alpha test harness**, not the final customer authentication design.

Before connecting real Assembl customer data to ChatGPT:

1. implement OAuth 2.1 authorization for the MCP resource server;
2. derive the tenant and user from the verified access token rather than environment variables;
3. preserve the same bridge boundary so OAuth cannot bypass Assembl policy;
4. deploy at a stable public HTTPS URL ending in `/mcp`;
5. test in ChatGPT developer mode;
6. refresh the plugin whenever tool metadata changes.

For a non-sensitive demo only, `ASSEMBL_MCP_ALLOW_ANONYMOUS=true` can be used with a demo tenant **and writes must remain disabled**. Never use anonymous mode for a real customer workspace.

## Production auth target

The production request path should become:

```text
ChatGPT
  ↓ OAuth 2.1 access token
Assembl MCP resource server
  ↓ verified subject + tenant + scopes
Assembl bridge
  ↓ policy / capability / approval checks
Assembl runtime
```

Suggested scopes:

- `assembl.work.read`
- `assembl.proof.read`
- `assembl.work.create`
- `assembl.approval.request`

No scope should directly mean “send email”, “publish”, “spend”, or “delete”. Those remain Assembl runtime capabilities with their own approval policy.

## Deployment

The MCP endpoint should be hosted separately from temporary development tunnels at a stable HTTPS origin. Configure:

- `ASSEMBL_MCP_ALLOWED_HOSTS` for the deployed hostname;
- `ASSEMBL_MCP_ALLOWED_ORIGINS` only if browser-origin traffic is required;
- client authentication / OAuth;
- bridge and client secrets in the host's secret manager;
- request latency, failed tool calls, and auth failures in observability;
- `ASSEMBL_MCP_WRITES_ENABLED=false` until the read-only path is proven.

## Why this boundary

MCP is a distribution and tool protocol. It is not the Assembl authorization system.

The model may request a tool. Assembl still decides:

- which tenant is in scope;
- whether the caller may read or propose the operation;
- what state transition is legal;
- whether human approval is required;
- whether anything may actually dispatch;
- what evidence is recorded.

That keeps the same governance model whether the caller is ChatGPT, Claude, Mistral, a voice agent, or Assembl's own UI.

## References

- OpenAI Plugins: Build an MCP server — https://developers.openai.com/plugins/build/mcp-server
- OpenAI Plugins: Define tools — https://developers.openai.com/plugins/plan/tools
- OpenAI Plugins: Authentication — https://developers.openai.com/plugins/build/auth
- OpenAI Plugins: Quickstart — https://developers.openai.com/plugins/quickstart
- MCP TypeScript SDK v2 server docs — https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md
