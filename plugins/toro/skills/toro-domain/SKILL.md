---
name: toro-domain
description: |
  Tōro is the assembl kete for whānau and consumer life-admin —
  household budgeting, bills, KiwiSaver lookups, ACC claim navigation
  (private to the claimant — never act on behalf of), tenancy queries,
  consumer rights, and the everyday paperwork of running a household
  in Aotearoa. This stub covers the broad domain. Full skill bodies
  will be written when a pilot customer is assigned to Tōro.

  STATUS: scaffold — full skill body deferred until pilot customer
  assigned to this kete.

  Trigger phrases / contexts: "household budget", "family budget",
  "bills", "power bill", "broadband", "rent", "tenancy", "Tenancy
  Tribunal", "ACC", "ACC claim", "KiwiSaver", "myIR", "Working for
  Families", "child support", "WINZ", "MSD", "consumer complaint",
  "refund", "warranty".
mandatory: false
applies_to: ["toro"]
---

# Tōro — domain stub skill

**STATUS**: scaffold — full skill body deferred until pilot customer
assigned to this kete.

## When to use

This is the broad-strokes Tōro domain skill, used when a workflow
falls inside whānau / consumer life-admin but no narrower skill
exists yet. Typical contexts:

- Drafting household and whānau budgets, expense trackers, bill
  comparisons.
- Drafting consumer-complaint letters under the CGA / FTA — for the
  whānau member to send.
- Helping a whānau member understand a KiwiSaver statement, an ACC
  letter, a Working for Families notice, or a Tenancy Tribunal
  notice — explanatory drafts, never decisions.
- Drafting tenancy correspondence (rent reviews, bond refunds,
  notices to remedy).
- Helping prepare for a Tenancy Tribunal, Disputes Tribunal, or
  ACC review hearing — the whānau member presents and decides.

## What this skill will NOT do

- Provide legal, tax, ACC, or financial advice. Outputs are
  working drafts only.
- Act on behalf of the whānau member with ACC. ACC claim records
  are private to the claimant, and the claimant interacts with
  ACC directly. The skill helps the claimant draft their own
  letters, never sends.
- File ACC claims, lodge ACC review applications, or accept ACC
  determinations.
- File KiwiSaver elections, contribution rate changes, withdrawal
  applications, or fund switches. The provider's portal is the
  channel; the whānau member acts.
- Lodge IRD returns or Working for Families changes through myIR.
  The whānau member logs in and acts.
- Lodge Tenancy Tribunal applications or accept tribunal decisions.
- Make investment, insurance, or KiwiSaver-fund decisions. Drafts
  for discussion only; advice from a licensed financial adviser is
  the appropriate channel.

## Tikanga check

Tōro is the most personal of the kete — household paperwork,
family finances, sometimes painful interactions with government
agencies.

- Manaakitanga is the lead pou: the language of every Tōro draft
  treats the whānau member with care, especially in difficult
  contexts (tenancy dispute, ACC decline, debt).
- Where the whānau is Māori, defer to the assembl-core
  `tikanga-compliance` skill on whānau-facing language and
  macron usage; whanaungatanga in long-running whānau workflows.
- Whakapapa information about whānau (names of tamariki, kaumātua,
  iwi affiliation) is taonga; do not store it beyond what the
  immediate workflow requires.
- ACC, KiwiSaver, and IRD records are personal to the individual —
  even within a whānau, the kete respects individual rangatiratanga
  over personal records.

## Privacy Act check

Tōro is personal information at almost every step. Apply the full
IPP set with particular care to:

- IPP 1 minimisation — only collect what the workflow needs.
- IPP 5 storage and security — household records often contain
  IRD numbers, NHI numbers, dates of birth, ACC claim numbers.
  Encrypt at rest; mask in any output that is not strictly
  internal.
- IPP 11 disclosure — do not disclose one whānau member's records
  to another without consent. The household is not a single legal
  identity.
- IPP 13 unique identifiers — IRD, NHI, and ACC claim numbers are
  personal identifiers; never log or expose them in
  customer-facing output.
- ACC claim information has additional confidentiality under the
  Accident Compensation Act 2001. Treat with the highest care.

## Workflow steps

For any Tōro workflow:

1. Identify the deliverable (budget, complaint letter, tenancy
   correspondence, ACC letter draft, KiwiSaver explanation, IRD
   query draft).
2. Apply the assembl-core mandatory skills first
   (`tikanga-compliance` on every whānau-facing piece;
   `nz-privacy-act-2020` on any personal information — almost
   every Tōro workflow).
3. Apply the relevant statute lens — CGA / FTA for consumer,
   Residential Tenancies Act 1986 for tenancy, Accident
   Compensation Act 2001 for ACC, KiwiSaver Act 2006 for
   retirement saving, Income Tax Act 2007 for tax.
4. Stage the draft for the whānau member. The whānau member
   reviews, signs, sends, lodges. The skill never lodges.

Full workflow detail to follow when a Tōro pilot customer is
assigned.

## References

- Consumer Guarantees Act 1993:
  `https://www.legislation.govt.nz/act/public/1993/0091/latest/whole.html`
- Fair Trading Act 1986:
  `https://www.legislation.govt.nz/act/public/1986/0121/latest/whole.html`
- Residential Tenancies Act 1986:
  `https://www.legislation.govt.nz/act/public/1986/0120/latest/whole.html`
- Accident Compensation Act 2001:
  `https://www.legislation.govt.nz/act/public/2001/0049/latest/whole.html`
- KiwiSaver Act 2006:
  `https://www.legislation.govt.nz/act/public/2006/0040/latest/whole.html`
- Income Tax Act 2007:
  `https://www.legislation.govt.nz/act/public/2007/0097/latest/whole.html`
- Privacy Act 2020:
  `https://www.legislation.govt.nz/act/public/2020/0031/latest/whole.html`
- Tenancy Services (MBIE):
  `https://www.tenancy.govt.nz/`
- ACC: `https://www.acc.co.nz/`
- KiwiSaver (IRD): `https://www.ird.govt.nz/kiwisaver`
- Inland Revenue (myIR): `https://www.ird.govt.nz/`
- Disputes Tribunal: `https://www.disputestribunal.govt.nz`
