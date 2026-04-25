# @assembl/mcp

The official **Model Context Protocol** server for [Assembl](https://assembl.co.nz) — bring New Zealand business agents (Manaaki, Waihanga, Auaha, Arataki, Pikau) into Claude Desktop, Cursor, n8n, Continue, and any other MCP-compatible client.

> **Status:** Alpha. The npm package is currently scaffolded but not yet published. While we finalise the `@assembl` npm scope you can run from source — see [Local development](#local-development).

## Quick start

### 1. Get an API key

API keys are minted per organisation by an Assembl admin at `/admin/mcp/api-keys`. Each key looks like `asm_live_<64 hex chars>` and is shown **once** at creation — copy it immediately.

### 2. Configure your MCP client

#### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "assembl-nz": {
      "command": "npx",
      "args": [
        "-y",
        "@assembl/mcp@latest",
        "--toolsets=manaaki,core",
        "--mana-trust=enforce"
      ],
      "env": {
        "ASSEMBL_API_KEY": "asm_live_REPLACE_ME",
        "ASSEMBL_TIER": "industry_suite",
        "ASSEMBL_LOG_LEVEL": "info"
      }
    }
  }
}
```

Restart Claude Desktop. You should see Assembl tools appear in the 🔌 menu.

#### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "assembl-nz": {
      "command": "npx",
      "args": ["-y", "@assembl/mcp@latest", "--toolsets=manaaki,waihanga,core"],
      "env": { "ASSEMBL_API_KEY": "asm_live_..." }
    }
  }
}
```

#### n8n

Use the **MCP Client** node (community node). Command: `npx -y @assembl/mcp@latest`. Pass `ASSEMBL_API_KEY` via the credentials store.

## Configuration

All settings can be passed via environment variables (preferred — keeps secrets out of CLI args) or `--key=value` CLI flags.

| Env var                | CLI flag           | Required | Default                       | Description                                                                  |
| ---------------------- | ------------------ | -------- | ----------------------------- | ---------------------------------------------------------------------------- |
| `ASSEMBL_API_KEY`      | `--apiKey=`        | ✅ Yes    | —                             | Per-org key. Generate at `/admin/mcp/api-keys`.                              |
| `ASSEMBL_API_URL`      | —                  | No       | `https://api.assembl.co.nz`   | Override gateway URL. Use this if you self-host or are on a private region.  |
| `ASSEMBL_TOOLSETS`     | `--toolsets=`      | No       | `core`                        | Comma list: `manaaki,waihanga,auaha,arataki,pikau,core`.                     |
| `ASSEMBL_TIER`         | `--tier=`          | No       | inferred from key             | Display hint only — entitlements are always enforced server-side.            |
| `ASSEMBL_MANA_TRUST`   | `--mana-trust=`    | No       | `enforce`                     | `enforce` \| `warn` \| `off`. Trust-layer policy hint forwarded to gateway.  |
| `ASSEMBL_LOG_LEVEL`    | —                  | No       | `info`                        | `debug` \| `info` \| `warn` \| `error`. Logs go to stderr.                   |
| `ASSEMBL_TIMEOUT_MS`   | —                  | No       | `30000`                       | Per-request timeout.                                                         |
| `ASSEMBL_USE_FALLBACK` | —                  | No       | —                             | Set to `1` to use the Supabase URL directly (only needed during DNS setup).  |

## Available toolsets

| Toolset      | Industry        | Highlights                                                       |
| ------------ | --------------- | ---------------------------------------------------------------- |
| `manaaki`    | Hospitality     | Bookings, food safety, alcohol licensing                         |
| `waihanga`   | Construction    | Site safety, payment claims (CCA 2002), EOTs, LBP/Site-Safe      |
| `auaha`      | Creative        | Brand scans, campaigns, social calendars                         |
| `arataki`    | Automotive      | Fleet, driver compliance, fuel/route optimisation                |
| `pikau`      | Freight/Customs | Customs declarations, MPI biosecurity, AIS vessel tracking       |
| `pakihi`     | Business        | Pipeline, invoicing, hire workflows                              |
| `core`       | All             | Compliance routing, tikanga checks (always included)             |

Your tier (`operator`, `leader`, `enterprise`) determines which toolsets are available — see [pricing](https://assembl.co.nz/pricing).

## Architecture

```
┌────────────────┐  stdio (JSON-RPC)  ┌──────────────────┐  HTTPS  ┌─────────────────────┐
│  Claude/Cursor │ ─────────────────► │  @assembl/mcp    │ ──────► │  api.assembl.co.nz  │
│   MCP client   │ ◄───────────────── │  (this package)  │ ◄────── │   mcp-router        │
└────────────────┘                    └──────────────────┘         └─────────────────────┘
                                                                           │
                                                                           ▼
                                                            5-stage Assembl pipeline:
                                                            Kahu → Iho → Tā → Mahara → Mana
```

The package implements MCP locally (so no remote MCP transport hassles), but tool execution, RLS, and the trust-layer policies all run server-side in your Lovable Cloud (Supabase) project. This keeps the tier/scope/policy enforcement secure even if a customer reverse-engineers the npm package.

## Local development

```bash
git clone https://github.com/katecoveny-svg/assemblnz-f0afd79d.git
cd assemblnz-f0afd79d/packages/mcp
npm install
npm run build
ASSEMBL_API_KEY=asm_live_... node dist/cli.js
```

Test against MCP Inspector:

```bash
npm run inspect
```

## Custom domain — `api.assembl.co.nz`

The default `apiUrl` points at `https://api.assembl.co.nz` so customers get a clean branded URL in their config.

To point that domain at the Lovable-hosted edge function you need to set up a proxy, because Lovable custom domains route to your **frontend** (`assembl.co.nz`), not arbitrary Supabase edge functions. See [`docs/api-custom-domain.md`](../../docs/api-custom-domain.md) for the recommended Cloudflare Worker / Vercel rewrite setup.

Until that's done, customers can pass `ASSEMBL_USE_FALLBACK=1` (or `ASSEMBL_API_URL=https://ssaxxdkxzrvkdjsanhei.supabase.co/functions/v1/mcp-router`) and the package will work today.

## Publishing

This package is not yet published. To publish:

1. **Reserve the `@assembl` npm scope** at <https://www.npmjs.com/org/create>.
2. Create an npm token with publish rights and add it as a workspace build secret named `NPM_TOKEN`.
3. From `packages/mcp`: `npm publish --access public`.

A GitHub Actions workflow can be added later to publish on tagged releases.

## License

MIT © Assembl Aotearoa
