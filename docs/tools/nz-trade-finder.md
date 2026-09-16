# nz-trade-finder — tool #2 after nz-who-runs-it

**Status:** sandbox shipping. Live NZBN / Companies Office city+trade search is **stubbed** (honest 503).

## One job

Given a **city** + **trade** (e.g. `Wellington` + `plumber`), return an **owner-led list** of local businesses suitable for agent outreach — legal name / trading name, NZBN when known, public contact hints from **registers only**, and source links.

## Endpoint

`POST /api/tools/nz-trade-finder` · docs `/tools/nz-trade-finder` · skill `docs/tools/nz-trade-finder.skill.md`

## Auth / economics

Same gate as `nz-who-runs-it`:

- `Authorization: Bearer` / `X-Assembl-Tool-Key`
- `test_` → sandbox fixtures only
- daily spend cap + receipt per successful call

## Data rules (v0)

- **Register-only:** no website email scrape, no SERP harvest, no directory scrape.
- No invented phone numbers or emails. Empty register fields stay empty with a `gaps[]` note.
- Live adapter not wired yet — use `test_` keys. Planned sources: NZBN + Companies Office.

## Related

- `nz-who-runs-it` for director enrichment on a shortlist
- `nz-compliance-ping` for public status flags
- Shared primitives: `lib/tools/`
