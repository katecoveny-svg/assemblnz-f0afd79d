# Evidence Pack — Sample (Waihanga / Construction)

**Template for a Section 14B Producer Statement bundle, residential build.** Replace `<PLACEHOLDER>` fields with real-feeling data before sending to operators. This file renders to PDF via `council-pdf` edge function or pandoc.

---

## Cover page

> **assembl** · evidence pack

**Title:** Section 14B Producer Statement Bundle — Residential Foundation Slab
**Workflow:** Building Act 2004, s 14B (work that requires building consent) · Engineering review pack
**Tenant:** `<TENANT — e.g. Aronaut Construction Ltd>`
**Kete:** Waihanga · Construction
**Decision:** ✅ **APPROVED for filing with BCA**
**Pack ID:** `pack_wha_2026-03-12_a4f8e2c1`
**Created:** 12 March 2026, 14:42 NZST
**Hash:** `7c4e2a8b9f3d1e5c6a7b8f9e0d1c2a3b4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b`

---

## Section 1 — Context

> What the operator asked for, in plain English.

**Project:** New 187 m² single-storey timber-framed residence at `<SITE ADDRESS — e.g. 42 Greenlane Road West, Greenlane, Auckland 1051>`.

**Operator request (`<OPERATOR NAME — e.g. Marcus Tane, Project Manager>`):**
> "Build the s 14B engineering producer statement bundle for the foundation slab. Concrete pour scheduled Friday. Need PS1 from the engineer, PS4 from the contractor, citations against NZS 3604 timber-framing and NZS 3101 concrete, plus a clear cover sheet for `<BCA — e.g. Auckland Council Building Consents>`."

**Pipeline stage:** T**ā** — drafting
**Time saved (estimated):** 3.5 hours of admin (vs typical 4-hour producer-statement assembly)

---

## Section 2 — Reasoning trace (5-layer pipeline output)

### Layer 1 — Perception (Kahu)
Captured project from `<SITE FILE / CCMS reference — e.g. Council file BLD-2026-9412>`. Identified scope as residential foundation work requiring engineering producer statements per Building Act 2004 s 14B + Acceptable Solution B1/AS1.

### Layer 2 — Memory (Iho)
Retrieved prior pack `pack_wha_2026-02-28_e3c1d4b9` for same site (subdivision consent producer statement). Carried forward: legal description, certificate of title, site geotechnical report reference `<GEOTECH REF>`. No conflicts with prior representations.

### Layer 3 — Reasoning (Tā)
Drafted PS1 (design certification) shell against `<ENGINEER NAME, CPEng #>` template. Cross-referenced foundation design against NZS 3604:2011 ¶6.4 (concrete slab on ground) and NZS 3101:2006 ¶8.5 (slab thickness). Identified one Acceptable Solution divergence: slab edge thickening to 200mm where NZS 3604 minimum is 150mm — acceptable under s 19 alternative solution pathway. Flagged for engineer's sign-off.

### Layer 4 — Action (Mahara — DRAFT MODE)
**No filings, no submissions, no payments executed.** Output staged as draft for `<REVIEWER NAME — e.g. Sarah Lim, Project Engineer (CPEng 2891)>` review.

### Layer 5 — Mana sign-off
Drafts stamped with assembl reviewer-record block. Operator + engineer hand-signed scans appended. Pack hashed and sealed.

---

## Section 3 — Citations

| # | Source | Section | Retrieved |
|---|---|---|---|
| 1 | Building Act 2004 | s 14B (work requiring building consent) | 12 Mar 2026, 14:42 NZST · legislation.govt.nz |
| 2 | Building Act 2004 | s 19 (alternative solutions) | 12 Mar 2026, 14:43 NZST · legislation.govt.nz |
| 3 | Acceptable Solution B1/AS1 | clause 7.6 — concrete slab on ground | 12 Mar 2026, 14:43 NZST · MBIE Building Performance |
| 4 | NZS 3604:2011 | ¶6.4 — slab on ground | 12 Mar 2026, 14:44 NZST · Standards New Zealand |
| 5 | NZS 3101:2006 | ¶8.5 — slab thickness | 12 Mar 2026, 14:44 NZST · Standards New Zealand |
| 6 | Auckland Council BCA Practice Note | PN 09 (producer statements) | 12 Mar 2026, 14:45 NZST · aucklandcouncil.govt.nz |

All citations include retrieval timestamp + URL hash to detect post-pack content drift. Verifier checks against `assembl-agent-keys.json` keyring.

---

## Section 4 — Reviewer record

> Every output is staged for human sign-off. assembl agents never lodge with a BCA on the operator's behalf.

**Drafted by:** assembl Tā (Waihanga kete · agent: `whakaae` · build d2209fa2)
**Reviewed by:** `<REVIEWER NAME — e.g. Sarah Lim>`
**Role:** Project Engineer · CPEng #`<NUMBER>`
**Signature:** _________________________________
**Approved on:** `<DATE>` at `<TIME>` NZST
**Notes:** _________________________________

**Operator confirmation:**
**Signed by:** `<OPERATOR NAME — e.g. Marcus Tane>`
**Role:** Project Manager · `<COMPANY>`
**Signature:** _________________________________
**Approved on:** `<DATE>` at `<TIME>` NZST

---

## Section 5 — Hash chain

| | |
|---|---|
| **This pack hash (SHA-256):** | `7c4e2a8b9f3d1e5c6a7b8f9e0d1c2a3b4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b` |
| **Previous pack hash (tenant ledger):** | `e3c1d4b91a8f7c2b3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c` |
| **Tenant ledger HEAD:** | `pack_wha_2026-03-12_a4f8e2c1` |
| **Signing key (assembl-agent-keys):** | `key_2026-03_a4f8e2c1ff` |

Any tampering with this pack — single byte changed — breaks the chain. Verify at `assembl.co.nz/v/7c4e2a8b9f3d1e5c6a7b8f9e0d1c2a3b4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b`.

---

## Section 6 — Verifier QR code

`<QR CODE — encodes the URL: assembl.co.nz/v/7c4e2a8b9f3d1e5c6a7b8f9e0d1c2a3b4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b>`

Auditor can scan with any phone. Public verifier confirms hash chain integrity without exposing pack contents.

---

**assembl · built in Aotearoa · verify at** `assembl.co.nz/v/<hash>`

*Nothing in this evidence pack constitutes engineering, legal, or building advice. assembl agents draft work product for review by a qualified professional. No filings, submissions, or payments are made on the operator's behalf. The user is responsible for compliance with the Building Act 2004 and any other applicable New Zealand legislation.*
