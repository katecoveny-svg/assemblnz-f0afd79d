# nz-trade-finder — spec stub (tool #2 after nz-who-runs-it)

**Status:** docs-only stub. **Register-only v0** — no email scrape in week-1.

## One job

Given a **city** + **trade** (e.g. `Wellington` + `plumber`), return an **owner-led list** of local businesses suitable for agent outreach — legal name / trading name, NZBN when known, public contact hints from **registers only**, and source links.

## Why it follows nz-who-runs-it

`nz-who-runs-it` answers “who runs *this* entity?”. `nz-trade-finder` answers “which owner-operated businesses in *this place* do *this trade*?”. Enrich candidates by calling `nz-who-runs-it` once a shortlist exists.

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

## Data rules (week-1 / register-only v0)

- **Register-only:** NZBN, Companies Office, and other cited public registers — no website email scrape, no SERP harvest, no directory scrape in week-1.
- No Foodstuffs / supermarket inventory APIs.
- No invented phone numbers or emails. If a register does not publish contact, leave it empty and add a `gaps[]` note.
- Prefer agent-consented browser seats later for anything behind a login — not v0.

## Out of scope for this stub

- Scrapers, SERP automation, paid directory contracts, email discovery.
- Full route implementation (intentionally deferred until after nz-who-runs-it ships).

## Related

- Live scaffold: `/api/tools/nz-who-runs-it`, `/tools/nz-who-runs-it`
- Shared primitives: `lib/tools/`
- Skill draft pattern: `docs/tools/nz-who-runs-it.skill.md`
- Meeting enhance stays in Meeting DO product (PR #1306) — not this paid-tools line.
