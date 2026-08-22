# Gemini → Assembl MCP

This integration uses Google's Gemini Interactions API to let Gemini 3.7 Flash call the existing Assembl OS remote MCP over Streamable HTTP.

## Security posture

The first integration is deliberately read-only. Gemini receives only these MCP tools:

- `list_work`
- `get_work_item`
- `read_proof`

It does **not** receive `create_work_item` or `request_action_approval` even if the MCP deployment later enables writes. Assembl remains the authority for tenancy, work state, evidence, policy and approvals.

Interactions are sent with `store: false` so this adapter does not opt into Gemini's server-side interaction storage. The MCP client token is sent server-to-server in the remote MCP `Authorization` header and must never be exposed to browser code.

## Required environment

Configure these values in the server environment that calls `runGeminiWithAssemblMcp`:

```bash
GEMINI_API_KEY=<Google AI Studio / Gemini API key>
ASSEMBL_MCP_URL=https://<stable-public-mcp-host>/mcp
ASSEMBL_MCP_CLIENT_TOKEN=<same client bearer token configured on the MCP server>
```

`GOOGLE_GENERATIVE_AI_API_KEY` is accepted as a fallback name for the Gemini key.

The MCP URL must be a public HTTPS Streamable HTTP endpoint ending in `/mcp`. A local `http://127.0.0.1:8787/mcp` endpoint cannot be called by Google's hosted Interactions API.

The MCP process itself still requires its existing environment, including `ASSEMBL_BASE_URL`, `ASSEMBL_MCP_TENANT`, `ASSEMBL_MCP_BRIDGE_TOKEN`, `ASSEMBL_MCP_CLIENT_TOKEN`, and the host/origin restrictions appropriate to the deployment. Keep `ASSEMBL_MCP_WRITES_ENABLED=false` for this phase.

## Server-side use

```ts
import { runGeminiWithAssemblMcp } from '@/lib/ai/gemini-mcp';

const result = await runGeminiWithAssemblMcp({
  input: 'Read my recent Assembl work and proof and give me a concise operating brief.',
});

console.log(result.text);
```

The adapter uses:

- model: `gemini-3.7-flash`
- endpoint: Gemini Interactions API
- MCP server name: `assembl_os` (Google-compatible identifier)
- thinking level: `medium`
- tool choice: `auto`
- interaction storage: disabled
- remote MCP tools: read-only allowlist above

## First live smoke test

Once the stable MCP URL and secrets exist in the server environment, call the helper with:

> Read the five most recent Assembl work items. For the newest item, inspect its detail and any proof. Summarise what is known, what is still proposed or pending, and do not claim any external action happened unless the proof says it did.

Expected result:

1. Gemini calls `list_work`.
2. It may call `get_work_item` for the selected item.
3. It may call `read_proof`.
4. It returns a grounded brief.
5. It cannot create work, request approval, send, publish, spend or delete through this integration.

## Why this is separate from the existing Vercel AI SDK Gemini rung

`lib/ai/router.ts` currently reaches Gemini through Google's OpenAI-compatible endpoint. That path is useful for ordinary text generation, but Google's native Remote MCP support is exposed through the Interactions API. `lib/ai/gemini-mcp.ts` is therefore a small native adapter specifically for governed MCP work; it does not replace the general model router.
