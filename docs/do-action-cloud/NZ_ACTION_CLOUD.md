# Aotearoa Action Cloud (NZ)

**Status:** Build brief + opportunity map — verify live endpoints before implementation  
**Locale:** NZ English  
**Parent brands:** Assembl (orchestration) · DO (safe hands) · Pursuit (tenders)

This document maps New Zealand rails that DO adapters can wrap. Nothing here asserts production connectivity. Every endpoint must be re-verified before coding.

---

## Guiding principle

NZ Action Cloud = **DO adapters + permits + receipts** over national rails humans already use, so agents can act with authority without scraping as the primary path.

---

## Domain map

### 1. NZ Business (NZBN / MBIE)

| Rail | Use for DO | Notes |
|------|------------|-------|
| NZBN | Identity / entity resolve | Lookup by NZBN; Agentize business onboarding |
| MBIE API portal | Discovery of gov APIs | Check current catalogue before build |
| Companies Office | Company extract / officers (**where API exists**) | Prefer official API over scrape; else Agentize + Human |

**Agent opportunities:** Business verify, director check (policy-gated), supplier onboarding, Pursuit bidder KYC assist.

**Verify before implement:** MBIE developer portal listings, NZBN API terms, rate limits, auth model.

---

### 2. Property (LINZ + councils — start Auckland)

| Rail | Use for DO | Notes |
|------|------------|-------|
| LINZ | Titles / parcels / addressing (**API availability TBD**) | Start with documented public services only |
| Auckland Council | Consents, rates, property info | Highest-value first council; expand later |
| Other councils | Heterogeneous | Do not claim national coverage early |

**Agent opportunities:** Property due diligence packs, consent status, address normalisation, insurance evidence.

**Start:** Auckland + LINZ documented endpoints. Mark other councils **TBD**.

---

### 3. Energy (EA ICP + usage + switch)

| Rail | Use for DO | Notes |
|------|------------|-------|
| Electricity Authority (EA) | ICP registry concepts | Switch flows are regulated; adapters must respect rules |
| Usage data | Where consumer-authorised | Pair with Permit above any share |
| Retailer switch | DO Switch | High-risk class; Human gate likely |

**Agent opportunities:** ICP resolve, plan quote, switch prepare → permit → execute → verify → receipt.

**Demo:** See `DEMOS.md` — NZ energy switch.

**Verify:** EA published APIs / industry hubs; retailer partner APIs; switching code obligations.

---

### 4. Banking (open banking / CDR abstraction + Permit above payments)

| Rail | Use for DO | Notes |
|------|------------|-------|
| Open banking / CDR-style APIs | Account read, payment initiate (**NZ maturity TBD**) | Abstract behind DO; do not hard-code one bank |
| Permit above payments | Critical risk class | Short-lived permits; argument locking; receipts |
| Card networks / Visa TAP et al. | Future adapters | See `DO_RADAR.md` |

**Principle:** DO never becomes a bank. DO issues **authority envelopes** and receipts around payment rails.

**Verify:** Current NZ open banking / CDR status, accreditation, and bank developer programmes before any payment MVP claim.

---

### 5. Tender / GETS (via Pursuit)

| Rail | Use for DO | Notes |
|------|------------|-------|
| GETS | Find opportunities | Pursuit owns vertical UX; DO owns submit/permit/receipt |
| Agency portals | Heterogeneous | Agentize where no API |

**Agent opportunities:** Search → assemble response pack → Human review → Permit → Submit → Receipt → Evidence.

---

### 6. Delivery (NZ Post)

| Rail | Use for DO | Notes |
|------|------------|-------|
| NZ Post APIs | Label, track, redirect | Classic DO Delivery adapter |
| Couriers | Later | Do not boil the ocean |

---

## Agentability score (idea)

Score each NZ rail **0–100** for how agent-ready it is today (full rubric in `DO_RADAR.md`):

| Dimension | Weight (hypothesis) |
|-----------|---------------------|
| Documented API | 25 |
| Stable auth | 20 |
| Write / action support | 20 |
| Idempotency / webhooks | 15 |
| ToS allows automation | 10 |
| NZ-specific completeness | 10 |

Use scores to prioritise adapters. Re-score when portals change.

---

## Implementation caution

1. **Verify live endpoints** (URL, auth, ToS, rate limits) immediately before a spike.  
2. Prefer official APIs; scrape/browser only via DO Agentize with Human gates and clear ToS review.  
3. Do not claim “government integrated” in marketing until receipts exist in a non-prod environment at minimum.  
4. Privacy Act / customer data: Permit + purpose limitation + retention policy (**legal TBD**).

---

## Suggested early paid endpoint pattern

Existing **nz-who-runs-it** style tools are a pattern for early monetisable, NZ-specific, read-mostly endpoints: clear schema, receipt optional for reads, Permit when escalating to writes. Link concrete repo paths in `IMPLEMENTATION_ROADMAP.md` when wiring code.

---

## Related

- `DO_ACTION_CLOUD.md` — platform services  
- `DO_RADAR.md` — NZ watchlist  
- `DEMOS.md` — energy switch demo  
- `AGENT_READY_API_OPPORTUNITY_MAP.md` — Business / Energy / Bank / Tender / Property / Government rows  
