---
name: nz-who-runs-it
description: >
  Resolve who publicly runs a New Zealand company from a name or NZBN.
  Returns legal name, NZBN, published directors, registered office when public,
  contact hints, and source links via Assembl's key-gated tool endpoint.
category: nz-registry
inputs:
  - name: company
    type: string
    required: true
    description: Trading or legal name, or a 13-digit NZBN.
endpoint: POST /api/tools/nz-who-runs-it
auth: Bearer test_… (sandbox) or live key
docs: /tools/nz-who-runs-it
---

# nz-who-runs-it

Use when an agent needs a structured public answer to “who runs this NZ company?” before outreach, supplier checks, or light diligence. Prefer this over scraping company websites.

## Example

```bash
curl -sS -X POST "https://assembl.co.nz/api/tools/nz-who-runs-it" \
  -H "Authorization: Bearer test_assembl_demo_nz_who_runs_it" \
  -H "Content-Type: application/json" \
  -d '{"company":"assembl"}'
```

Sandbox keys (`test_…`) never hit live NZBN. Live keys require `NZBN_API_KEY`.
