# @assembl/mcp-nzbn

MCP server wrapping the NZ Business Number (NZBN) public register.

> Nothing in this repository constitutes legal, tax, accounting, financial, immigration, customs, biosecurity, or health and safety advice. These tools surface public-register data for review by a qualified professional or licensed adviser. They do not file with Inland Revenue, lodge customs entries, submit WorkSafe notifications, make ACC claims, register entities with the Companies Office, send Privacy Commissioner breach notifications, or submit any document to a NZ government agency on the user's behalf; every output is staged for human sign-off.

## Source

NZBN public register, https://www.nzbn.govt.nz/. API gateway: https://api.business.govt.nz/services/v5/nzbn/entities.

The NZBN data itself is public. The API gateway requires a free subscription key (`Ocp-Apim-Subscription-Key`) for rate-limiting — register at https://api.business.govt.nz/ to obtain one.

## Tools

### `verify_nzbn`

Quick existence check.

- **Input**: `{ nzbn: string }` — 13-digit NZBN.
- **Output**: `{ exists: boolean, entityName?: string, entityType?: string, entityStatus?: string, source: string }`.

### `lookup_entity`

Full entity details.

- **Input**: `{ nzbn: string }` — 13-digit NZBN.
- **Output**: full NZBN entity record (entity name, NZBN, business industry classifications, addresses, registration date, source register, plus any disclosed director/shareholder info).

Both tools cite their source: NZBN public register, https://www.nzbn.govt.nz/.

## Install & build

```bash
cd plugins/mcp-servers/mcp-nzbn
npm install
npm run build
```

## Run

```bash
NZBN_API_KEY=<your-key> node dist/index.js
```

The server speaks MCP over stdio.

## Inspect with the official MCP inspector

```bash
NZBN_API_KEY=<your-key> npx @modelcontextprotocol/inspector node dist/index.js
```

Connects, lists `verify_nzbn` and `lookup_entity`, lets you make test calls.

## Wire into a plugin

assembl-core's `plugins/assembl-core/.mcp.json` registers this server. Plugin loaders pick it up automatically.

## What this server will NOT do

- Register, modify, or remove entities on the NZBN register.
- Lodge any document with Companies Office, IRD, or any other NZ regulator.
- Provide legal, tax, accounting, immigration, customs, biosecurity, or H&S advice.

If a future PR proposes adding a write/lodgement tool to this server, reject it. See repo `CLAUDE.md` Hard Rule 8 and canon §8.1.
