# @assembl/mcp-companies-office

MCP server wrapping the NZ Companies Office public register.

> Nothing in this repository constitutes legal, tax, accounting, financial, immigration, customs, biosecurity, or health and safety advice. These tools surface public-register data for review by a qualified professional or licensed adviser. They do not file with Inland Revenue, lodge customs entries, submit WorkSafe notifications, make ACC claims, register entities with the Companies Office, send Privacy Commissioner breach notifications, or submit any document to a NZ government agency on the user's behalf; every output is staged for human sign-off.

## Source

Companies Office public register, https://www.business.govt.nz/services/business-data. API gateway under `https://api.business.govt.nz/services/v1/companies`.

The Companies Office data is public. The gateway requires a free subscription key (`Ocp-Apim-Subscription-Key`) for rate-limiting — register at https://api.business.govt.nz/ to obtain one. Some deeper endpoints (full director/shareholder histories, document downloads) may require an additional Companies Office API key — the tools surface a clean `"this endpoint requires a Companies Office API key"` error in that case.

## Tools

### `lookup_company`

Look up a company entity record by company number or by name.

- **Input**: `{ identifier: string }` — NZ company number (e.g. `123456`) or company name (e.g. `"Aironaut Customs"`).
- **Output**: `{ found: boolean, company?: CompanyRecord, source: string, error?: string }`.

### `lookup_director`

List a director's directorships across all NZ companies.

- **Input**: `{ name: string }` — director's full name.
- **Output**: `{ found: boolean, directorships?: DirectorshipRecord[], source: string, error?: string }`.

Both tools cite their source: Companies Office public register, https://www.business.govt.nz/services/business-data.

## Install & build

```bash
cd plugins/mcp-servers/mcp-companies-office
npm install
npm run build
```

## Run

```bash
COMPANIES_OFFICE_API_KEY=<your-key> node dist/index.js
```

The server speaks MCP over stdio.

## Inspect with the official MCP inspector

```bash
COMPANIES_OFFICE_API_KEY=<your-key> npx @modelcontextprotocol/inspector node dist/index.js
```

Connects, lists `lookup_company` and `lookup_director`, lets you make test calls.

## Wire into a plugin

assembl-core's `plugins/assembl-core/.mcp.json` registers this server. Plugin loaders pick it up automatically.

## What this server will NOT do

- Register, modify, or remove a company on the Companies Office register (canon §8.1 — director duty).
- File annual returns, change-of-director notices, or any other document with the Companies Office.
- Provide legal, tax, accounting, immigration, customs, biosecurity, or H&S advice.

If a future PR proposes adding a write/lodgement tool to this server, reject it. See repo `CLAUDE.md` Hard Rule 8 and canon §8.1.
