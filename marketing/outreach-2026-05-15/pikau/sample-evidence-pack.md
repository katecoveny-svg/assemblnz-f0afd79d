# Evidence Pack — Sample (Pīkau / Freight & Customs)

**Template for a customs entry bundle for one shipment, Customs and Excise Act 2018.** Replace `<PLACEHOLDER>` fields with real-feeling data before sending to operators. Renders to PDF via `council-pdf` edge function or pandoc.

---

## Cover page

> **assembl** · evidence pack

**Title:** Customs Entry Bundle — Shipment `<CONSIGNMENT ID>` (Inwards Cargo Report → Import Entry)
**Workflow:** Customs and Excise Act 2018, Part 3 subpart 3 · Tariff classification + valuation
**Tenant:** `<TENANT — e.g. Aironaut Customs Brokers Ltd>`
**Kete:** Pīkau · Freight & Customs
**Decision:** ⚠️ **APPROVAL-REQUIRED — pack ready for licensed broker review before TSW lodgement**
**Pack ID:** `pack_pik_2026-03-17_d5f2c8a1`
**Created:** 17 March 2026, 11:04 NZST
**Hash:** `9b3e4f7a2c8d1b6e5a4f7c2d9e8b1a3f6c5d4e7a8b9c0d1e2f3a4b5c6d7e8f9a`

---

## Section 1 — Context

> What the operator asked for, in plain English.

**Shipment:** One 20'GP container, hydraulic press parts (heading 8462). Origin: `<ORIGIN — e.g. Ningbo, China>`. Carrier: `<CARRIER — e.g. ANL "Bowen" voy 2602S>`. ETA Ports of Auckland: `<DATE — e.g. 19 March 2026>`.

**Operator request (`<OPERATOR NAME — e.g. Kim Coveny, Customs Broker>`):**
> "Draft the import entry for shipment AIR-2026-0287. HS code candidates, duty + GST calc, valuation method, origin docs cross-checked, all citations to the Working Tariff. Pack ready for me to lodge in TSW — don't lodge it, just stage it."

**Pipeline stage:** Tā — drafting
**Time saved (estimated):** 1.5 hours of manual classification + entry assembly per consignment (vs typical 2-hour broker prep)

---

## Section 2 — Reasoning trace (5-layer pipeline output)

### Layer 1 — Perception (Kahu)
Captured shipment from `<DOC SOURCE — e.g. commercial invoice + packing list + bill of lading + certificate of origin>`. Parsed: 1× hydraulic press head, 4× cylinder assemblies, 12× hose kits. Invoice value `<INVOICE>` USD `<AMOUNT — e.g. 47,820.00>`. Incoterms `<TERM — e.g. FOB Ningbo>`. Origin: People's Republic of China.

### Layer 2 — Memory (Iho)
Retrieved last classification on similar shipment `pack_pik_2025-11-08_a3b2c1d4` for same supplier. Carried forward: tariff classification rationale, supplier reference, prior duty rate. No SI changes since last lodgement (verified against Working Tariff updates 2026-03-01).

### Layer 3 — Reasoning (Tā)
**Tariff classification — 3 candidates returned (never 1, per canon):**
1. **HS 8462.10.00** "Forging or die-stamping machines (including presses)..." — RATE 5% — GIR 1 (terms of headings)
2. **HS 8462.99.00** "Other machines for working metal by forging, hammering or die-stamping" — RATE 5% — GIR 6 (subheadings)
3. **HS 8479.89.00** "Mechanical appliances; other" — RATE Free — GIR 1, considered + REJECTED (specific heading 8462 prevails)

**Recommended:** 8462.99.00. Confidence: 🟢 High. Same as prior shipment classification.

**Valuation:** Transaction value method (Customs and Excise Act 2018, sch 4 method 1). FOB + freight to NZ + insurance = CIF NZ$ `<NZ$ AMOUNT — e.g. 73,118>`. Duty 5% = `<DUTY — e.g. NZ$3,656>`. GST 15% on (CIF + duty) = `<GST — e.g. NZ$11,516>`. Total payable: `<TOTAL — e.g. NZ$15,172>`.

**Origin:** Form F (China-NZ FTA) eligibility checked. RVC requirement not met for preferential rate (supplier-declared 38% RVC, FTA requires 40%). Standard MFN rate applies.

### Layer 4 — Action (Mahara — DRAFT MODE)
**No TSW lodgement, no duty payment, no IRD GST recovery filed.** Pack staged for `<REVIEWER>` review before any consequential action.

**TSW lodgement is NEVER performed by assembl agents.** Per Plugin Architecture Canon §8.1, customs entry lodgement to TSW is reserved exclusively for licensed brokers — the agent has no MCP server for it and the agent_router has no tool registered for it.

### Layer 5 — Mana sign-off
Pack stamped with reviewer-record block. Awaiting licensed-broker review.

---

## Section 3 — Citations

| # | Source | Section | Retrieved |
|---|---|---|---|
| 1 | Customs and Excise Act 2018 | Part 3, subpart 3 (entry of goods) | 17 Mar 2026, 11:04 NZST · legislation.govt.nz |
| 2 | Customs and Excise Act 2018 | s 354 (Customs powers) | 17 Mar 2026, 11:04 NZST · legislation.govt.nz |
| 3 | Customs and Excise Act 2018 | s 405 (records — 7 years) | 17 Mar 2026, 11:05 NZST · legislation.govt.nz |
| 4 | Customs and Excise Act 2018 | Schedule 4 (tariff/valuation/origin) | 17 Mar 2026, 11:05 NZST · legislation.govt.nz |
| 5 | NZ Working Tariff | Heading 8462, sub 99.00 | 17 Mar 2026, 11:06 NZST · customs.govt.nz |
| 6 | China-NZ FTA | Rules of Origin, Annex 3 (RVC method) | 17 Mar 2026, 11:06 NZST · mfat.govt.nz |
| 7 | Goods and Services Tax Act 1985 | s 12 (GST on imported goods) | 17 Mar 2026, 11:07 NZST · legislation.govt.nz |

---

## Section 4 — Reviewer record

> Every output is staged for human sign-off. assembl agents never lodge customs entries on the operator's behalf.

**Drafted by:** assembl Tā (Pīkau kete · agent: `pikau-customs` · build d2209fa2)
**Reviewed by:** `<LICENSED BROKER — e.g. Kim Coveny>`
**Role:** Licensed Customs Broker · NZCB #`<NUMBER>`
**Signature:** _________________________________
**Approved on:** `<DATE>` at `<TIME>` NZST
**Tariff classification confirmed:** ☐ 8462.99.00 ☐ Other: __________
**TSW lodgement performed (by broker, not agent):** ☐ Yes — TSW ref: __________
**Notes:** _________________________________

---

## Section 5 — Hash chain

| | |
|---|---|
| **This pack hash (SHA-256):** | `9b3e4f7a2c8d1b6e5a4f7c2d9e8b1a3f6c5d4e7a8b9c0d1e2f3a4b5c6d7e8f9a` |
| **Previous pack hash (tenant ledger):** | `a3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2` |
| **Tenant ledger HEAD:** | `pack_pik_2026-03-17_d5f2c8a1` |
| **Signing key (assembl-agent-keys):** | `key_2026-03_a4f8e2c1ff` |

Customs records retention: 7 years per Customs and Excise Act 2018 s 405. Pack retained by tenant + cross-signed by assembl ledger.

Verify at `assembl.co.nz/v/9b3e4f7a2c8d1b6e5a4f7c2d9e8b1a3f6c5d4e7a8b9c0d1e2f3a4b5c6d7e8f9a`.

---

## Section 6 — Verifier QR code

`<QR CODE — encodes the URL: assembl.co.nz/v/9b3e4f7a2c8d1b6e5a4f7c2d9e8b1a3f6c5d4e7a8b9c0d1e2f3a4b5c6d7e8f9a>`

NZ Customs auditor can scan + confirm integrity in a post-clearance audit.

---

**assembl · built in Aotearoa · verify at** `assembl.co.nz/v/<hash>`

*Nothing in this evidence pack constitutes customs, tariff, or legal advice. assembl agents draft work product for review by a licensed customs broker. No entries are lodged with TSW or any other government agency on the operator's behalf. The user is responsible for compliance with the Customs and Excise Act 2018 and all applicable New Zealand legislation.*
