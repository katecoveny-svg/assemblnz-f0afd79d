---
name: tariff-classification
description: |
  Fires when a customs entry needs an HS (Harmonised System) code
  classification. Always returns three candidate classifications with the
  reasoning trail through the General Interpretive Rules (GIR 1 → 6),
  never a single committed answer. The licensed customs broker selects
  and signs off; Pīkau drafts. No classification commitment without broker
  review.

  Trigger phrases / contexts: "HS code", "tariff code", "classification",
  "what code", "classify these goods", "Working Tariff", "WTD", "GIR",
  "General Interpretive Rules", "section note", "chapter note",
  "essential character", "most specific description", "subheading".
mandatory: false
applies_to: ["pikau"]
---

# Tariff classification — drafting skill (Pīkau)

## When to use

- Classifying imported goods for an entry worksheet that a licensed
  customs broker will review and sign off.
- Comparing classification options when the goods could plausibly fall
  in more than one heading.
- Documenting the GIR reasoning trail for the broker's file.
- Drafting a classification candidate set for a binding ruling
  application (broker submits, not Pīkau).

## What this skill will NOT do

- Commit to a single tariff classification. The skill always surfaces
  three candidates with reasoning; selection rests with the licensed
  customs broker.
- Classify goods we cannot inspect or whose composition is unknown.
  Where material composition, function, or end-use is unclear, the
  skill flags the gap and stops.
- Bind NZ Customs. A draft classification is not a binding ruling; only
  NZ Customs issues a binding ruling, on application by the broker.
- Bypass section notes and chapter notes. The General Interpretive
  Rules are applied in order, not selectively.
- Provide tariff or customs advice. Outputs are draft work product
  only.

## Tikanga check

Where the goods are or contain taonga, items subject to the Protected
Objects Act 1975, or anything that may be culturally sensitive (kōiwi,
human remains, sacred items, taonga tūturu), pause and escalate to the
human reviewer before drafting any classification. Classification is a
neutral technical exercise; the cultural treatment of the consignment
is not.

No specific te reo / tikanga concern arises from the standard GIR
workflow itself; the concern is the goods, not the classification rule.

## Privacy Act check

Tariff classification work is mostly about the goods, not personal
information. Where the workflow surfaces consignee details, supplier
names, or bill-of-lading data, treat that as personal information of
the relevant individuals and apply IPPs 1, 5, 9, and 11 as for any
customs file.

## Workflow steps

The General Interpretive Rules (GIRs) are applied in order. Do not skip
ahead. Each rule is exhausted before the next is considered.

### GIR 1 — terms of the headings + section and chapter notes

- Identify the candidate four-digit headings in the Working Tariff
  Document.
- Read the heading text, then the section notes and chapter notes that
  govern those headings. Notes can include or exclude goods that the
  heading text alone would suggest.
- If GIR 1 resolves the classification, stop here and surface the
  three closest candidates as the candidate set (the chosen one and
  the two next-closest by GIR 1).

### GIR 2 — incomplete, unfinished, mixtures

- 2(a): incomplete or unfinished goods are classified as the finished
  good provided they have the essential character of the finished good
  (and disassembled or unassembled goods are classified as the
  assembled good).
- 2(b): mixtures of substances or composite goods are extended to
  cover any reference to a material — but classification of mixtures
  is governed by GIR 3.

### GIR 3 — most specific / essential character / latest position

When goods are prima facie classifiable under two or more headings:

- 3(a) most specific description preferred over more general.
- 3(b) for mixtures, composite goods, and sets put up for retail sale
  not resolved by 3(a) — classify by the material or component giving
  the goods their essential character.
- 3(c) where 3(a) and 3(b) do not resolve it — classify under the
  heading that occurs last in numerical order among those equally
  meriting consideration.

### GIR 4 — analogous goods

Goods not classifiable under GIRs 1–3 are classified under the heading
covering the goods to which they are most akin.

### GIR 5 — containers and packaging

- 5(a): camera cases, instrument cases, and similar containers
  specially shaped or fitted to contain a specific article, suitable
  for long-term use, presented with the article — classified with the
  article.
- 5(b): other packing materials and packing containers presented with
  the goods — classified with the goods unless clearly suitable for
  repetitive use.

### GIR 6 — subheadings

Once the four-digit heading is settled, classification at six-digit
(international) and tariff-item (NZ-specific) level is done by
applying GIRs 1–5 within the subheadings, comparing only at the same
level (subheading-to-subheading at the same dash level).

### Output format

For every classification request, surface:

1. **Three candidate classifications** at tariff-item level (not just
   the four-digit heading) with full description.
2. **GIR reasoning trail** for each — which rule was applied, which
   notes were considered, which were excluded and why.
3. **Open questions** the broker needs to resolve before sign-off
   (composition, end-use, country of origin if it affects the rate,
   any preferential origin claim).
4. **Stage for licensed broker sign-off.** Pīkau does not pick.

## References

- NZ Customs Working Tariff Document:
  `https://www.customs.govt.nz/business/tariffs/working-tariff-document/`
- World Customs Organization — Harmonised System:
  `https://www.wcoomd.org/en/topics/nomenclature/overview.aspx`
- NZ Customs binding rulings (broker submits):
  `https://www.customs.govt.nz/business/tariffs/binding-rulings/`
- Customs and Excise Act 2018, Schedule 4:
  `https://www.legislation.govt.nz/act/public/2018/0004`
