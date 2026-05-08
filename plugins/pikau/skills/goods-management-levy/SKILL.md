---
name: goods-management-levy
description: |
  Goods Management Levy (GML) calculator and confirmation skill. Effective
  1 April 2026, the GML is collected by NZ Customs on import declarations
  to fund the long-term cost of customs goods-management activities.
  Pīkau confirms whether the GML applies to a given consignment and at
  what rate, and produces a calculation worksheet for the licensed
  customs broker. The broker remains responsible for filing the levy.

  Trigger phrases / contexts: "GML", "Goods Management Levy", "customs
  levy", "import levy", "what levy applies", "levy rate", "is the GML
  payable", "GML calculation", "import declaration levy".
mandatory: false
applies_to: ["pikau"]
---

# Goods Management Levy — calculator skill (Pīkau)

## When to use

- Confirming whether the GML applies to a given import.
- Calculating the GML amount for an import declaration as part of the
  entry worksheet.
- Producing a calculation worksheet the licensed customs broker can
  rely on for the entry.
- Cross-checking GML totals against a broker's draft to catch
  arithmetic errors before lodgement.

## What this skill will NOT do

- File the levy with NZ Customs. Filing the import declaration and any
  associated levy is the duty of the importer or the licensed customs
  broker acting for the importer, not Pīkau.
- Waive, vary, or refund the levy. Concessions, refunds, and rulings
  on levy applicability are NZ Customs functions, not the skill's.
- Commit to a levy outcome where the underlying classification or
  valuation is unsettled. If the tariff classification is in draft
  candidates, the levy calculation is provisional too.
- Provide customs or revenue advice. Outputs are draft work product
  only, for the licensed broker's review.

## Tikanga check

The GML is a financial calculation; no specific te reo or tikanga
concern arises from the rule itself. Where the importer is a Māori
business, iwi authority, hapū entity, or Māori land trust, apply
manaakitanga in communication and defer to the tikanga-compliance
skill for tone and relationship norms. Macrons preserved (Pīkau).

## Privacy Act check

The GML calculation surfaces importer identity, declared values, and
sometimes consignee details. These are personal information of the
importer (where a sole trader) and of consignees (where individuals).
Apply IPPs 1, 5, 9, and 11 as for any customs file. IPP 9 retention is
7 years, aligned with Customs Act s.405.

Where importer information is collected indirectly (from a freight
forwarder rather than the importer themselves), IPP 3A (effective 1
May 2026) requires notifying the importer of the collection.

## Workflow steps

1. **Check the goods category.** Identify the tariff-item-level
   classification (use the `tariff-classification` skill — three
   candidates) and any classification-driven exclusion or concession.
2. **Check the declared customs value.** Use the customs value already
   determined under the `customs-act-2018` skill (Schedule 4 valuation
   methods — transaction value first).
3. **Check applicability.** Confirm whether the goods category and
   value bring the consignment within the GML at the current rate.
   Note any exemptions that may apply (low-value goods threshold,
   specific goods exclusions, transhipment scenarios).
4. **Apply the current rate.** Use the rate published by NZ Customs at
   the time of the entry. The rate is set under the regulations and
   may be revised — always check the current published rate, not a
   cached value.
5. **Produce a calculation worksheet** with: consignment reference,
   declared value, currency and exchange rate used, GML rate applied,
   GML amount, totals reconciled to the entry, open questions for the
   broker.
6. **Stage the worksheet for the licensed customs broker.** The broker
   confirms the calculation, lodges the import declaration, and pays
   the levy under the standard customs flow.
7. **Record the file in the audit log** with the 7-year retention
   flag, alongside the entry record.

### Edge cases to flag, not resolve

- Low-value goods imports — confirm whether the consignment crosses
  the low-value threshold and whether de minimis treatment applies at
  the relevant date.
- Transhipment, export-only goods, and temporary imports — confirm
  whether the GML applies on any of these movements.
- Bulk consignments split across multiple entries — confirm the levy
  is applied per entry consistently with the published rate basis.
- Disputed classification — flag that the levy is provisional until
  the licensed broker selects the classification.

## References

- NZ Customs guidance — Goods Management Levy:
  `https://www.customs.govt.nz/business/goods-management-levy/`
- Customs and Excise Act 2018:
  `https://www.legislation.govt.nz/act/public/2018/0004`
- NZ Customs Working Tariff Document:
  `https://www.customs.govt.nz/business/tariffs/working-tariff-document/`
- NZ Customs — fees and levies overview:
  `https://www.customs.govt.nz/business/fees-and-levies/`
