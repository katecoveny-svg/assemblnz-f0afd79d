# Evidence Pack — Sample (Manaaki / Hospitality)

**Template for a Food Control Plan compliance pack for a café, Food Act 2014.** Replace `<PLACEHOLDER>` fields with real-feeling data before sending to operators. Renders to PDF via `council-pdf` edge function or pandoc.

---

## Cover page

> **assembl** · evidence pack

**Title:** Food Control Plan Verification Pack — Q1 2026
**Workflow:** Food Act 2014 + Food Regulations 2015 · MPI risk-based verification cycle
**Tenant:** `<TENANT — e.g. Roastery & Co Limited, T/A Roastery & Co Mount Eden>`
**Kete:** Manaaki · Hospitality
**Decision:** ✅ **APPROVED for MPI verifier presentation**
**Pack ID:** `pack_man_2026-03-21_b7e3a9d2`
**Created:** 21 March 2026, 09:18 NZST
**Hash:** `4a8b2c1d9e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b`

---

## Section 1 — Context

> What the operator asked for, in plain English.

**Premise:** `<PREMISE — e.g. Roastery & Co, 142 Mt Eden Road, Mt Eden, Auckland 1024 · 18-seat café + roasting room>`.

**FCP scope:** Template Food Control Plan ("Simply Safe & Suitable"). Verifier visit scheduled `<NEXT VERIFICATION DATE — e.g. 4 April 2026>` by `<VERIFIER NAME — e.g. AsureQuality / Council Environmental Health>`.

**Operator request (`<OPERATOR NAME — e.g. Aroha Williams, Owner-Operator>`):**
> "Build the Q1 evidence pack. Pull every food-safety log from January through March, cross-check against my FCP, flag anything missing, and produce a clean bundle I can hand the verifier when she comes Friday."

**Pipeline stage:** Tā — drafting
**Time saved (estimated):** 4 hours of manual log-collation (vs typical verification-week prep)

---

## Section 2 — Reasoning trace (5-layer pipeline output)

### Layer 1 — Perception (Kahu)
Captured Q1 logs from `<POS / KITCHEN SYSTEM — e.g. Lightspeed POS + paper temperature charts>`. Identified 89 days of trading (Jan 1 – Mar 31). Pulled: receiving logs, cleaning schedules, calibration records, allergen-management entries, supplier complaints log, customer-complaint register.

### Layer 2 — Memory (Iho)
Retrieved prior verification pack `pack_man_2025-10-04_c2d3e4f5` (last AsureQuality visit). Carried forward: registered FCP scope, last verifier's two minor non-conformances + closure evidence, supplier list. No conflicts.

### Layer 3 — Reasoning (Tā)
Cross-referenced each Q1 log against FCP procedure steps in "Simply Safe & Suitable" template. Identified two logging gaps: (a) no calibration record for the bain-marie thermometer on 14 Feb (5°C check missed — flagged), (b) supplier-complaint register has one open item from 22 Mar (poultry temp on delivery 6°C, escalated to supplier, awaiting response — included in pack for verifier visibility).

### Layer 4 — Action (Mahara — DRAFT MODE)
**No filings, no notifications, no submissions executed.** Output staged as draft for operator review. The two logging gaps are surfaced + suggested corrective-action language drafted for `<OPERATOR>` to accept, edit, or reject.

### Layer 5 — Mana sign-off
Pack stamped with reviewer-record block. Operator-signed PDF appended. Hashed + sealed.

---

## Section 3 — Citations

| # | Source | Section | Retrieved |
|---|---|---|---|
| 1 | Food Act 2014 | s 39 (requirement for registered FCP) | 21 Mar 2026, 09:18 NZST · legislation.govt.nz |
| 2 | Food Act 2014 | s 49 (verification) | 21 Mar 2026, 09:19 NZST · legislation.govt.nz |
| 3 | Food Regulations 2015 | regs 4 + 30 (records to keep) | 21 Mar 2026, 09:19 NZST · legislation.govt.nz |
| 4 | MPI Template FCP | "Simply Safe & Suitable" | 21 Mar 2026, 09:20 NZST · mpi.govt.nz |
| 5 | MPI Verification Guidance | section 3.4 (verifier visit) | 21 Mar 2026, 09:20 NZST · mpi.govt.nz |
| 6 | Australia New Zealand Food Standards Code | Standard 1.2.7 (allergen labelling) | 21 Mar 2026, 09:21 NZST · foodstandards.gov.au |

---

## Section 4 — Reviewer record

> Every output is staged for human sign-off. assembl agents never submit to MPI on the operator's behalf.

**Drafted by:** assembl Tā (Manaaki kete · agent: `manaaki-comply` · build d2209fa2)
**Reviewed by:** `<OPERATOR / FOOD SAFETY MANAGER>`
**Role:** Owner-Operator
**Signature:** _________________________________
**Approved on:** `<DATE>` at `<TIME>` NZST
**Notes (logging gaps):** _________________________________
**Notes (open supplier item):** _________________________________

---

## Section 5 — Hash chain

| | |
|---|---|
| **This pack hash (SHA-256):** | `4a8b2c1d9e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b` |
| **Previous pack hash (tenant ledger):** | `c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3` |
| **Tenant ledger HEAD:** | `pack_man_2026-03-21_b7e3a9d2` |
| **Signing key (assembl-agent-keys):** | `key_2026-03_a4f8e2c1ff` |

Verify at `assembl.co.nz/v/4a8b2c1d9e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b`.

---

## Section 6 — Verifier QR code

`<QR CODE — encodes the URL: assembl.co.nz/v/4a8b2c1d9e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b>`

Verifier can scan during the visit. Confirms pack integrity without exposing kitchen contents.

---

**assembl · built in Aotearoa · verify at** `assembl.co.nz/v/<hash>`

*Nothing in this evidence pack constitutes food-safety, legal, or regulatory advice. assembl agents draft work product for review by a qualified person. No notifications to MPI or any other regulatory body are made on the operator's behalf. The user is responsible for compliance with the Food Act 2014, Food Regulations 2015, and all applicable New Zealand legislation.*
