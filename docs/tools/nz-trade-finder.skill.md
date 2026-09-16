---
name: nz-trade-finder
description: >
  Find owner-led New Zealand businesses in a city for a given trade.
  Returns trading/legal names, NZBN when known, register-only contact hints,
  and source links via Assembl's key-gated HTTP tool. Sandbox-first; live
  NZBN/Companies Office city+trade search is stubbed until wired.
category: nz-registry
inputs:
  - name: city
    type: string
    required: true
    description: NZ city or town (e.g. Wellington).
  - name: trade
    type: string
    required: true
    description: Trade label (e.g. plumber, electrician).
  - name: limit
    type: number
    required: false
    description: Max results (1–25, default 10).
endpoint: POST /api/tools/nz-trade-finder
auth: Bearer test_… (sandbox) or live key
docs: /tools/nz-trade-finder
---

# nz-trade-finder

Use when an agent needs a local owner-operated shortlist for outreach — not a SERP scrape and not supermarket inventory. Prefer register-shaped rows; enrich candidates with `nz-who-runs-it`.

## Example

```bash
curl -sS -X POST "https://assembl.co.nz/api/tools/nz-trade-finder" \
  -H "Authorization: Bearer test_assembl_demo_nz_who_runs_it" \
  -H "Content-Type: application/json" \
  -d '{"city":"Wellington","trade":"plumber","limit":5}'
```

## Adapters + honesty

- Sandbox (`test_…`) returns fixtures and never hits live registers.
- Live city+trade search is **stubbed** → 503 with a fix hint until NZBN / Companies Office search is wired.
- No email scrape in v0. Empty contact fields stay empty.

## Cap / receipts

Unit cost + daily cap on the key. Receipts at `GET /api/tools/keys/{keyId}/receipts`.
