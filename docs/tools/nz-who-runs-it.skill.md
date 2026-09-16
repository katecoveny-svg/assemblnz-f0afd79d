---
name: nz-who-runs-it
description: >
  Resolve who publicly runs a New Zealand company from a name or NZBN.
  Returns legal name, NZBN, published directors (name/role only), registered
  office when public, contact hints, and source links via Assembl's key-gated
  HTTP tool wrapping NZBN + Companies Office adapters.
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

Use when an agent needs a structured public answer to “who runs this NZ company?” before outreach, supplier checks, or light diligence. Prefer this over scraping company websites. Empty niche vs ClawHub NZBN skills — Assembl ships the paid HTTP shape (URL + key + cap + receipt + docs).

## Example

```bash
curl -sS -X POST "https://assembl.co.nz/api/tools/nz-who-runs-it" \
  -H "Authorization: Bearer test_assembl_demo_nz_who_runs_it" \
  -H "Content-Type: application/json" \
  -d '{"company":"assembl"}'
```

## Adapters + env

- Wraps the same gateways as `mcp-nzbn` and `mcp-companies-office`.
- Sandbox keys (`test_…`) never hit live registers.
- Live: `NZBN_API_KEY` required (legacy `NZBN_API_TOKEN`). Optional `COMPANIES_OFFICE_API_KEY` enriches directors. Free keys at https://api.business.govt.nz/

## Privacy

Director names are personal information (Privacy Act 2020). Response includes a `privacy` block. Only name/role/appointment are returned; no residential addresses or DOB. Do not aggregate directors into secondary dossiers. Cite NZBN + Companies Office sources already on the payload.
