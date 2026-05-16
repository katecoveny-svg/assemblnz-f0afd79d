# Evidence Pack — Sample (Arataki / Automotive)

**Template for a WoF + CGA evidence bundle for a workshop's used-car sale.** Replace `<PLACEHOLDER>` fields with real-feeling data before sending to operators. Renders to PDF via `council-pdf` edge function or pandoc.

---

## Cover page

> **assembl** · evidence pack

**Title:** Used-Vehicle Sale Compliance Bundle — `<REGO — e.g. MFK231>` Honda Fit 2014
**Workflow:** Motor Vehicle Sales Act 2003 · Consumer Guarantees Act 1993 · Land Transport (Vehicle Standards) Regulations 2004 — WoF
**Tenant:** `<TENANT — e.g. Botany Motors Limited>`
**Kete:** Arataki · Automotive
**Decision:** ✅ **APPROVED for sale + handover to buyer**
**Pack ID:** `pack_ara_2026-03-25_e8c4b1a7`
**Created:** 25 March 2026, 16:38 NZST
**Hash:** `2c5e8f1a4b7d3c6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e`

---

## Section 1 — Context

> What the operator asked for, in plain English.

**Vehicle:** 2014 Honda Fit hatchback. Rego `<REGO — e.g. MFK231>`. VIN `<VIN — e.g. JHMGD12345678>`. Odometer `<KM — e.g. 89,420 km>`.

**Buyer:** `<BUYER NAME — e.g. James Mokomoko>`. Sale price `<PRICE — e.g. NZ$12,800>`. Trade-in `<TRADE-IN — e.g. nil>`.

**Operator request (`<OPERATOR NAME — e.g. Rangi Tāne, Sales Manager>`):**
> "James is signing tomorrow. Pull every record for MFK231 — WoF, prior owners, any flagged issues — and build a CGA disclosure pack the customer keeps and we keep in our trader file. Include any pre-sale prep work we did on the car. Plain English."

**Pipeline stage:** Tā — drafting
**Time saved (estimated):** 1 hour of clerical assembly per sale (vs typical 1.5-hour CGA disclosure prep)

---

## Section 2 — Reasoning trace (5-layer pipeline output)

### Layer 1 — Perception (Kahu)
Captured vehicle from `<DMS — e.g. AutoLine workshop system>`. Pulled: NZTA WoF inspection records (last 3), ownership history, security register check (Personal Property Securities Register — PPSR), workshop's pre-sale prep notes (brake-pad replacement 18 Mar, full service 22 Mar).

### Layer 2 — Memory (Iho)
Retrieved tenant's standard CGA disclosure template (used for 142 prior sales). Carried forward: standard fitness-for-purpose language, trader-licence statement, dispute-resolution clause referring to MVDT. No conflicts with current standard.

### Layer 3 — Reasoning (Tā)
Cross-checked WoF (issued 14 Mar 2026, valid 12 months) against odometer discrepancy. NZTA WoF historic readings ascending consistently — no clock-back indicators. PPSR clean (no security interests). Prior owners: 2 (within 12-month threshold for "second-hand" definition).

Identified one CGA-relevant disclosure: minor service-light fault recorded by workshop 22 Mar, cleared after diagnosis — not a defect, but disclosed proactively per `<TENANT>`'s policy. Drafted plain-English description for buyer's pack.

### Layer 4 — Action (Mahara — DRAFT MODE)
**No registration, no payment, no NZTA notification.** Pack drafted for `<OPERATOR>` to hand to buyer at signing.

**Note:** Vehicle ownership change is notified by buyer + seller using NZTA form MR13B at signing. assembl does NOT submit MR13B on either party's behalf.

### Layer 5 — Mana sign-off
Pack stamped with reviewer-record block + operator + buyer signature blocks. Hashed + sealed.

---

## Section 3 — Citations

| # | Source | Section | Retrieved |
|---|---|---|---|
| 1 | Motor Vehicle Sales Act 2003 | s 14 (information disclosure) | 25 Mar 2026, 16:38 NZST · legislation.govt.nz |
| 2 | Motor Vehicle Sales Act 2003 | s 35 (Motor Vehicle Disputes Tribunal) | 25 Mar 2026, 16:38 NZST · legislation.govt.nz |
| 3 | Consumer Guarantees Act 1993 | s 7 (guarantee of acceptable quality) | 25 Mar 2026, 16:39 NZST · legislation.govt.nz |
| 4 | Consumer Guarantees Act 1993 | s 9 (guarantee as to fitness for particular purpose) | 25 Mar 2026, 16:39 NZST · legislation.govt.nz |
| 5 | Fair Trading Act 1986 | s 9 (misleading and deceptive conduct) | 25 Mar 2026, 16:39 NZST · legislation.govt.nz |
| 6 | Land Transport (Vehicle Standards) Regs 2004 | reg 3 (general safety req) + WoF schedule | 25 Mar 2026, 16:40 NZST · legislation.govt.nz |
| 7 | NZTA Vehicle Information Notice | VIN: `<VIN>` history (last 36 months) | 25 Mar 2026, 16:40 NZST · nzta.govt.nz |

---

## Section 4 — Reviewer record

> Every output is staged for human sign-off. assembl agents never register, submit, or transfer ownership on the operator's behalf.

**Drafted by:** assembl Tā (Arataki kete · agent: `arataki-comply` · build d2209fa2)
**Reviewed by:** `<OPERATOR — e.g. Rangi Tāne>`
**Role:** Sales Manager · `<TENANT>` · MVSA Trader Licence #`<NUMBER>`
**Signature:** _________________________________
**Approved on:** `<DATE>` at `<TIME>` NZST

**Buyer acknowledgement:**
**Buyer:** `<BUYER — e.g. James Mokomoko>`
**Signature:** _________________________________
**Date received:** `<DATE>` at `<TIME>` NZST
**Notes from buyer:** _________________________________

---

## Section 5 — Hash chain

| | |
|---|---|
| **This pack hash (SHA-256):** | `2c5e8f1a4b7d3c6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e` |
| **Previous pack hash (tenant ledger):** | `f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2` |
| **Tenant ledger HEAD:** | `pack_ara_2026-03-25_e8c4b1a7` |
| **Signing key (assembl-agent-keys):** | `key_2026-03_a4f8e2c1ff` |

Trader records retention: 6 years per MVSA. Pack retained by tenant + cross-signed by assembl ledger.

Verify at `assembl.co.nz/v/2c5e8f1a4b7d3c6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e`.

---

## Section 6 — Verifier QR code

`<QR CODE — encodes the URL: assembl.co.nz/v/2c5e8f1a4b7d3c6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e>`

Buyer (or MVDT auditor, in the event of a dispute) can scan + confirm pack integrity without exposing personal data.

---

**assembl · built in Aotearoa · verify at** `assembl.co.nz/v/<hash>`

*Nothing in this evidence pack constitutes legal, motor-vehicle-trading, or consumer-law advice. assembl agents draft work product for review by a qualified person. No registration, ownership transfer, or filings are made on the operator's behalf. The user is responsible for compliance with the Motor Vehicle Sales Act 2003, Consumer Guarantees Act 1993, Fair Trading Act 1986, and all applicable New Zealand legislation.*
