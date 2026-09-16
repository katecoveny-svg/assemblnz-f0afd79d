# assembl agent-paid tools

Skills-style index of single-job HTTP tools for agents.

**Shape:** URL + API key + daily cap + receipt. Prefer jobs humans pay for that frontier models cannot do alone.

**Auth:** `Authorization: Bearer <key>` or `X-Assembl-Tool-Key: <key>`.  
**Sandbox:** keys starting with `test_` never hit live upstreams.

| Tool | One job | Endpoint | Docs | Status |
|------|---------|----------|------|--------|
| `nz-who-runs-it` | Who publicly runs this NZ company? | `POST /api/tools/nz-who-runs-it` | [/tools/nz-who-runs-it](/tools/nz-who-runs-it) | live (NZBN) |
| `nz-trade-finder` | Owner-led businesses by city + trade | `POST /api/tools/nz-trade-finder` | [/tools/nz-trade-finder](/tools/nz-trade-finder) | sandbox_first (live stubbed) |
| `meeting-enhance` | Transcript → Granola-class structured notes | `POST /api/tools/meeting-enhance` | [/tools/meeting-enhance](/tools/meeting-enhance) | sandbox_first |
| `nz-compliance-ping` | Public-register compliance signals | `POST /api/tools/nz-compliance-ping` | [/tools/nz-compliance-ping](/tools/nz-compliance-ping) | sandbox_first |

Registry UI: [/tools](/tools). Machine registry: `lib/tools/registry.ts`.

## Skill drafts

- `docs/tools/nz-who-runs-it.skill.md`
- `docs/tools/nz-trade-finder.skill.md`
- `docs/tools/meeting-enhance.skill.md`
- `docs/tools/nz-compliance-ping.skill.md`

## Shared primitives

`lib/tools/` — auth, sandbox (`test_`), daily cap, receipts, `invokePaidTool`, store (memory or Supabase).

Receipts: `GET /api/tools/keys/{keyId}/receipts` (`?format=json` for machines).
