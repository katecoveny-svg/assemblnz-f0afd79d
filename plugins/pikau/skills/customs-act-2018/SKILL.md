---
name: customs-act-2018
description: |
  Fires whenever a workflow involves importing or exporting goods to or
  from New Zealand under the Customs and Excise Act 2018. Covers entry of
  goods (Subpart 3 of Part 3), record-keeping (s.405), Customs powers
  (s.354), and tariff / valuation / origin rules (Schedule 4).

  Trigger phrases / contexts: "import entry", "export entry", "TSW",
  "Trade Single Window", "customs clearance", "customs declaration",
  "tariff classification", "duty rate", "GST on imports", "MPI clearance",
  "biosecurity", "valuation", "origin", "FTA preference",
  "free trade agreement", "EIF", "EIA", customs audit, customs broker,
  customs agent, importer, exporter, broker engagement, lodgement.
mandatory: true
applies_to: ["pikau"]
---

# Customs and Excise Act 2018 — Pīkau core skill

## When to use

- Drafting an import or export declaration for a licensed customs broker
  to review and lodge.
- Working out tariff classification, valuation, or origin (for FTA
  preference) for goods crossing the NZ border.
- Advising on record-keeping obligations under s.405 (7-year retention).
- Advising on a Customs request, audit, or query made under s.354
  powers.
- Drafting customs-related correspondence (broker briefings, importer
  instructions, MPI handovers).

## What this skill will NOT do

- Lodge customs entries to Trade Single Window (TSW) on behalf of the
  importer or broker. The skill drafts; a licensed customs broker
  reviews, signs, and lodges.
- Commit to a tariff classification without a licensed broker review.
  Classification is the broker's regulated decision.
- Respond on behalf of the importer to NZ Customs queries, audits, or
  s.354 information requests. Drafts go to the importer or their
  appointed broker.
- Provide legal or customs-law advice. Outputs are working drafts only —
  they go to a licensed customs broker and, where appropriate, a lawyer.
- File MPI biosecurity or food-import declarations.

## Tikanga check

Where the cargo, importer, or beneficial owner is a Māori business —
Māori land trust, iwi authority, Māori incorporation — apply the four
pou. Manaakitanga in tone toward the importer; rangatiratanga in
deferring to the entity's own decision-making structure rather than
imposing a default broker workflow.

Where there is no Māori party in scope, record that no specific
tikanga concern applies for this run, and continue.

## Privacy Act check

Importer and consignee details are personal information where the
party is a natural person (sole trader, individual). Apply IPP 1
minimisation when drafting broker briefs and IPP 11 when sharing
documents with brokers, freight forwarders, or MPI. NZ Customs
information requests under s.354 are a lawful basis for disclosure
to Customs itself, but do not extend to onward sharing.

## Workflow steps

### Statutory anchors

- **Subpart 3 of Part 3 — Entry of goods**: every consignment imported
  for home consumption, warehousing, transhipment, or export must be
  entered with NZ Customs in the prescribed manner. The skill drafts
  the entry; a licensed customs broker lodges it via TSW.
- **Section 354 — Customs powers**: NZ Customs may require the
  production of documents, the answering of questions, and access to
  premises and goods. The skill helps the importer prepare a
  responsive, accurate reply; the importer (or their broker)
  responds.
- **Section 405 — Record retention**: importers and exporters must
  keep customs records for **7 years** from the relevant date.
  Records include entries, supporting commercial documents, valuation
  worksheets, origin declarations, and broker communications.
- **Schedule 4 — Tariff, valuation, and origin**: governs the Working
  Tariff Document (WTD) classification, customs value (transaction
  value plus adjustments per the WTO Valuation Agreement), and
  origin rules for FTA preference claims.

### Drafting pattern

1. Confirm the transaction type: import for home consumption,
   import for warehousing, transhipment, export, temporary admission.
2. Pull the candidate tariff classification (use the
   `tariff-classification` skill — never commit to one classification
   alone in this skill).
3. Calculate the customs value per Schedule 4 / WTO Valuation
   Agreement (transaction value + cost / insurance / freight where
   applicable).
4. Check origin status — if a free trade agreement preference is
   claimed, document the rule of origin used and the supporting
   evidence.
5. Draft the entry pack for the licensed broker: invoice,
   packing list, transport document, classification rationale,
   valuation worksheet, origin declaration.
6. Stage for human sign-off. The licensed customs broker reviews,
   accepts liability, and lodges via TSW.

### Recordkeeping pattern

For every transaction, set up a 7-year retention bucket containing:

- The lodged entry and any amendments.
- Commercial invoices, packing lists, bills of lading, airway bills.
- Valuation worksheets and supplier price lists.
- Origin declarations and certificates of origin.
- Correspondence with the broker, freight forwarder, MPI, and Customs.

Tag the bucket with the entry number and date so retrieval under a
s.354 request is straightforward.

## References

- Customs and Excise Act 2018:
  `https://www.legislation.govt.nz/act/public/2018/0004/latest/whole.html`
- NZ Customs Service: `https://www.customs.govt.nz/`
- Working Tariff Document of New Zealand:
  `https://www.customs.govt.nz/business/tariffs/working-tariff-document/`
- Trade Single Window (TSW):
  `https://www.customs.govt.nz/business/trade-single-window/`
- Customs valuation guidance:
  `https://www.customs.govt.nz/business/import/valuation/`
- WTO Valuation Agreement:
  `https://www.wto.org/english/tratop_e/cusval_e/cusval_e.htm`
- Free trade agreements (NZ FTA hub):
  `https://www.mfat.govt.nz/en/trade/free-trade-agreements/`
