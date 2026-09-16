---
name: nz-compliance-ping
description: >
  Ping public NZ register compliance signals for a company or NZBN (entity
  status, type, watch/alert flags). Key-gated HTTP tool wrapping NZBN status
  fields. Not legal, tax, or AML advice.
category: nz-registry
inputs:
  - name: company
    type: string
    required: true
    description: Trading/legal name or 13-digit NZBN.
endpoint: POST /api/tools/nz-compliance-ping
auth: Bearer test_… (sandbox) or live key
docs: /tools/nz-compliance-ping
---

# nz-compliance-ping

Use when an agent needs a fast public-register health check before treating an NZ entity as active. Pair with `nz-who-runs-it` for directors. Not a substitute for professional advice.

## Example

```bash
curl -sS -X POST "https://assembl.co.nz/api/tools/nz-compliance-ping" \
  -H "Authorization: Bearer test_assembl_demo_nz_who_runs_it" \
  -H "Content-Type: application/json" \
  -d '{"company":"assembl"}'
```

## Adapters + honesty

- Sandbox (`test_…`) returns fixtures (including a removed-entity demo).
- Live requires `NZBN_API_KEY` and returns status/type flags only — never invents GST.
- Response always includes a disclaimer.

## Cap / receipts

Unit cost + daily cap on the key. Receipts at `GET /api/tools/keys/{keyId}/receipts`.
