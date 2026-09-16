# nz-trade-finder — spec stub (next build)

**Status:** docs-only stub. Do not implement scrape/live search in this scaffold.

## One job

Given a **city** + **trade** (e.g. `Wellington` + `plumber`), return an **owner-led list** of local businesses suitable for agent outreach — legal name / trading name, NZBN when known, public contact hints, and source links.

## Why it follows nz-who-runs-it

`nz-who-runs-it` answers “who runs *this* entity?”. `nz-trade-finder` answers “which owner-operated businesses in *this place* do *this trade*?”. The second tool should call or compose the first for enrichment once a candidate list exists.

## Proposed I/O (draft)

```json
// POST /api/tools/nz-trade-finder
{
  "city": "Wellington",
  "trade": "plumber",
  "limit": 10
}
```

```json
// response.data (proposed)
{
  "status": "ok" | "partial" | "not_found",
  "query": { "city": "Wellington", "trade": "plumber" },
  "results": [
    {
      "tradingName": string,
      "legalName": string | null,
      "nzbn": string | null,
      "ownerHints": string[],
      "contactHints": { "emails": [], "phones": [], "websites": [], "notes": [] },
      "sourceLinks": [{ "label": string, "url": string }],
      "confidence": "high" | "medium" | "low"
    }
  ],
  "sandbox": boolean,
  "gaps": string[]
}
```

## Auth / economics

Reuse `lib/tools` primitives:

- `Authorization: Bearer` / `X-Assembl-Tool-Key`
- `test_` → sandbox fixtures only
- daily spend cap + receipt per successful call

## Data rules

- No Foodstuffs / supermarket inventory APIs.
- No invented phone numbers or emails.
- Prefer public directories, NZBN, Companies Office, and agent-consented browser seats for anything behind a login.
- If a source cannot be cited, omit the field and add a `gaps[]` note.

## Out of scope for v0 of this file

- Scrapers, SERP automation, paid directory contracts.
- Full route implementation (intentionally deferred).

## Related

- Live scaffold: `/api/tools/nz-who-runs-it`, `/tools/nz-who-runs-it`
- Shared primitives: `lib/tools/`
- Skill draft pattern: `docs/tools/nz-who-runs-it.skill.md`
