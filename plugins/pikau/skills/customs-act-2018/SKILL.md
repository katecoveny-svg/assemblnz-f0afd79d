---
name: customs-act-2018
description: |
  Fires on customs entries, tariff classification, valuation, country of
  origin, Goods Management Levy, prohibited and restricted goods, and any
  workflow touching the Customs and Excise Act 2018. Provides a quick
  reference for drafting customs work product — entry worksheets, valuation
  notes, classification candidates, broker file notes — for review by a
  licensed customs broker. No customs advice, no lodgement, no commitment
  on classification.

  Trigger phrases / contexts: "customs entry", "import declaration",
  "TSW", "Trade Single Window", "tariff", "HS code", "harmonised system",
  "classification", "customs valuation", "transaction value", "country of
  origin", "rules of origin", "preferential origin", "GMT", "GML", "Goods
  Management Levy", "import duty", "GST on imports", "prohibited goods",
  "restricted goods", "Customs powers", "s.354", "s.405", "Schedule 4",
  "Customs and Excise Act", "CEA 2018".
mandatory: true
applies_to: ["pikau"]
---

# Customs and Excise Act 2018 — quick reference skill (Pīkau)

## When to use

- Drafting an import or export entry worksheet for review by a licensed
  customs broker.
- Identifying which provisions of the Customs and Excise Act 2018 apply
  to a given consignment.
- Cross-checking valuation, origin, and classification work before the
  broker lodges with NZ Customs.
- Triaging whether goods are prohibited or restricted, and which agency
  controls the restriction (Customs, MPI, MoH, EPA, NZ Police).
- Preparing a record-retention note under s.405 (7-year retention).

## What this skill will NOT do

- Lodge customs entries to Trade Single Window (TSW) on behalf of the
  importer or broker.
- Commit to a tariff classification without a licensed customs broker's
  review and sign-off.
- Respond on behalf of the importer to NZ Customs queries, audits, or
  enforcement notices.
- Bypass the licensed customs broker's involvement. Where Pīkau drafts a
  classification or valuation note, the broker remains the responsible
  party for the entry.
- Provide customs or trade-law advice. Outputs are draft work product
  only.

## Tikanga check

Customs work touches imports of taonga, including kōiwi, taonga tūturu,
and items subject to the Protected Objects Act 1975. Where the
consignment includes anything that may be culturally sensitive — Māori
or otherwise — pause and surface to the human reviewer before proceeding
with classification or valuation. Manaakitanga applies to client
relationships: even in a stressful clearance window, communication with
the importer and the broker is respectful and clear.

Where the importer or exporter is a Māori-owned business, Māori land
trust, iwi authority, or hapū-owned company, defer to the
tikanga-compliance skill for relationship and communication norms before
any customer-facing copy goes out.

## Privacy Act check

Customs entries contain personal information of the importer (sole
trader names, contact details, addresses) and of consignees. Apply:

- IPP 1: collect only what the entry requires.
- IPP 5 (storage and security): broker file notes, including draft
  classifications, must be stored under access controls.
- IPP 9 (retention): keep records for 7 years per Customs Act s.405,
  then dispose under a documented retention rule.
- IPP 11 (disclosure): customs information shared with NZ Customs is
  permitted by law; sharing beyond Customs (with insurers, freight
  forwarders, the consignee) needs an authorising basis.
- IPP 3A (effective 1 May 2026): where importer information is
  collected indirectly (from the freight forwarder or shipping line
  rather than the importer), notify the importer of the collection.

## Workflow steps

1. Identify the consignment: importer, supplier, goods description,
   commercial invoice value, currency, country of export, country of
   origin, mode of transport, port of entry.
2. Confirm the legal basis for the entry — Part 3 of the Act (entry of
   goods), specifically subpart 3 (entry of imported goods).
3. Draft the tariff classification candidates (use the
   `tariff-classification` skill — always 3 candidates, never 1).
4. Draft the customs value (use the valuation rules in Schedule 4 —
   transaction value first, then the alternative methods in order).
5. Confirm the country of origin and any preferential origin claim
   (Schedule 4 — origin rules; underlying free trade agreement where
   relevant).
6. Confirm the Goods Management Levy position (use the
   `goods-management-levy` skill, in force from 1 April 2026).
7. Note any prohibited or restricted goods exposure and which agency
   controls the restriction.
8. Stage the worksheet for the licensed customs broker. The broker
   signs off, lodges the entry, and remains the responsible party.
9. Record the file in the audit log with the 7-year retention flag.

### Key sections (corrected per canon §11)

- **Part 3, subpart 3** — entry of imported goods. Defines the entry
  obligation, the entry types, and the legal basis for the customs
  declaration.
- **s.354** — Customs powers (search, examination, requests for
  information). Note when communicating with NZ Customs about a
  consignment.
- **s.405** — record-keeping. Importers, exporters, and brokers must
  retain customs records for 7 years.
- **Schedule 4** — tariff classification, valuation, and origin rules.
  Read alongside the Working Tariff Document of New Zealand.

## References

- Customs and Excise Act 2018:
  `https://www.legislation.govt.nz/act/public/2018/0004`
- NZ Customs Working Tariff Document:
  `https://www.customs.govt.nz/business/tariffs/working-tariff-document/`
- NZ Customs guidance — importing:
  `https://www.customs.govt.nz/business/import/`
- NZ Customs guidance — Goods Management Levy:
  `https://www.customs.govt.nz/business/goods-management-levy/`
- Trade Single Window (TSW):
  `https://www.customs.govt.nz/business/trade-single-window/`
- Protected Objects Act 1975:
  `https://www.legislation.govt.nz/act/public/1975/0041`
