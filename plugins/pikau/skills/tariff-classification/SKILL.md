---
name: tariff-classification
description: |
  Fires whenever a workflow needs a candidate tariff classification under
  the Working Tariff Document of New Zealand. Always returns three
  candidate Harmonised System (HS) codes ranked by likelihood, with the
  General Interpretive Rules (GIRs 1–6) applied in order. The skill
  produces drafts only; a licensed customs broker selects the final
  classification.

  Trigger phrases / contexts: "HS code", "tariff code", "tariff
  classification", "classify the goods", "WTD", "Working Tariff
  Document", "duty rate", "concession", "Schedule 1", "GIR", "General
  Interpretive Rules", "essential character", "specific provision".
mandatory: false
applies_to: ["pikau"]
---

# Tariff classification — Pīkau utility skill

## When to use

- A new product needs a candidate HS classification before lodging a
  customs entry.
- An existing classification needs review (rule change, product change,
  Customs query).
- A duty-rate or concession check requires the underlying classification.
- Origin or FTA preference work requires a classification first.

## What this skill will NOT do

- Commit to a single tariff classification without a licensed customs
  broker's sign-off. The skill returns three ranked candidates and the
  reasoning; the broker decides.
- Submit binding rulings to NZ Customs. A binding ruling application
  is filed by the importer or broker through Customs' formal process.
- Apply concessions or end-use codes without explicit broker confirmation
  the goods qualify.
- Replace expert classification advice for complex cases (machinery
  with multiple functions, parts vs accessories, sets, mixtures,
  composite goods).

## Tikanga check

No specific tikanga concern applies to the technical classification
exercise itself. Where the underlying goods are taonga or carry
cultural significance — Māori artefacts, taonga returning to iwi,
items associated with mātauranga — defer the broader workflow to the
tikanga-compliance skill before producing customer-facing copy or
public statements about the goods.

## Privacy Act check

Classification work uses commercial product data, not personal
information. Where the importer or consignee is a sole trader,
their identity is personal information; apply IPP 1 minimisation
when drafting the classification note (do not include personal
identifiers that the broker does not need).

## Workflow steps

### Always return three candidates

The output is always a ranked shortlist of **three** candidate HS
codes, not a single answer. Each candidate carries:

1. The HS code (chapter, heading, sub-heading, NZ statistical key).
2. The text of the heading and any relevant sub-heading.
3. The GIR (or chain of GIRs) used to reach the candidate.
4. A confidence note and the reason it is ranked where it is.

This is so the licensed broker reviewing the work has alternatives
visible, not just a single suggested answer that is hard to challenge.

### Apply the General Interpretive Rules in order

The General Interpretive Rules (GIRs) are applied **strictly in
order**. Move to GIR 2 only if GIR 1 does not resolve, GIR 3 only
if GIR 2 does not resolve, and so on.

- **GIR 1**: classification is determined by the terms of the headings
  and any relative section or chapter notes. The titles of sections,
  chapters, and sub-chapters are for reference only.
- **GIR 2**:
  - 2(a): a reference to an article includes the article in
    incomplete or unfinished form, provided it has the essential
    character of the complete article. Includes unassembled and
    disassembled articles.
  - 2(b): a reference to a material or substance includes mixtures
    and combinations with other materials or substances, where the
    classification is not changed by adding the other materials.
- **GIR 3**: when goods are prima facie classifiable under two or
  more headings:
  - 3(a): the heading providing the most specific description is
    preferred over a more general one.
  - 3(b): mixtures, composite goods, and goods put up in sets for
    retail sale are classified by the material or component giving
    them their essential character.
  - 3(c): when 3(a) and 3(b) do not resolve, the heading occurring
    last in numerical order applies.
- **GIR 4**: goods that cannot be classified under GIRs 1–3 are
  classified under the heading appropriate to goods to which they
  are most akin.
- **GIR 5**:
  - 5(a): cases, boxes, and similar containers specially shaped to
    contain a specific article and presented with that article are
    classified with the article (not separately).
  - 5(b): packing materials and packing containers presented with
    the goods are classified with the goods, unless they are
    suitable for repetitive use.
- **GIR 6**: classification of goods in the sub-headings of a
  heading is determined by the terms of those sub-headings and any
  related sub-heading notes, applying GIRs 1–5 mutatis mutandis at
  the sub-heading level. Only sub-headings at the same level are
  comparable.

### Output template

```
Candidate 1 (preferred):  HS XXXX.XX.XX
  Heading text:           ...
  Reasoning:              GIR 1 (or chain), with note of essential
                          character / specific provision used.
  Confidence:             high / medium / low
  Notes for broker:       ...

Candidate 2 (alternate):  HS XXXX.XX.XX
  ...

Candidate 3 (long shot):  HS XXXX.XX.XX
  ...
```

The note that goes back to the licensed broker is explicit: the
skill has drafted; the broker decides.

## References

- Working Tariff Document of New Zealand:
  `https://www.customs.govt.nz/business/tariffs/working-tariff-document/`
- NZ Customs — classification guidance:
  `https://www.customs.govt.nz/business/tariffs/classification-of-goods/`
- WCO Harmonized System:
  `https://www.wcoomd.org/en/topics/nomenclature/overview/what-is-the-harmonized-system.aspx`
- WCO HS General Interpretive Rules (text):
  `https://www.wcoomd.org/en/topics/nomenclature/instrument-and-tools/hs-nomenclature-2022-edition/general-rules-for-the-interpretation-of-the-harmonized-system.aspx`
- NZ Customs binding ruling process:
  `https://www.customs.govt.nz/business/tariffs/tariff-rulings/`
- Customs and Excise Act 2018 (Schedule 4 — tariff/valuation/origin):
  `https://www.legislation.govt.nz/act/public/2018/0004/latest/whole.html`
