---
name: arataki-domain
description: |
  Arataki is the assembl kete for leadership and governance — directors,
  board members, trustees, executives, and governance professionals.
  This stub covers the broad domain: Companies Act 1993 director duties,
  fiduciary duty, conflict of interest management, board governance
  (agendas, minutes, resolutions), and trustee obligations under the
  Trusts Act 2019. Full skill bodies will be written when a pilot
  customer is assigned to Arataki.

  STATUS: scaffold — full skill body deferred until pilot customer
  assigned to this kete.

  Trigger phrases / contexts: "board paper", "board minutes",
  "director duties", "section 131", "section 137", "fiduciary",
  "conflict of interest", "interests register", "shareholder
  resolution", "AGM", "annual return", "Companies Office filing",
  "trust deed", "trustee duty", "Trusts Act 2019", "governance
  policy", "board charter".
mandatory: false
applies_to: ["arataki"]
---

# Arataki — domain stub skill

**STATUS**: scaffold — full skill body deferred until pilot customer
assigned to this kete.

## When to use

This is the broad-strokes Arataki domain skill, used when a workflow
falls inside leadership and governance but no narrower skill exists
yet. Typical contexts:

- Drafting board papers, board minutes, resolutions, and agendas.
- Reviewing director duty obligations under the Companies Act 1993,
  particularly s.131 (good faith and best interests), s.137 (care,
  diligence, and skill), and s.138 (reliance on information).
- Managing the interests register and conflict-of-interest workflow.
- Drafting governance policies, board charters, and committee terms
  of reference.
- Trustee obligations under the Trusts Act 2019 — duties, record
  keeping, beneficiary information.

## What this skill will NOT do

- Provide legal advice. Outputs are working drafts only — they go
  to the board, the company secretary, and, where appropriate, a
  governance lawyer.
- Sign board minutes or resolutions on behalf of the board. The
  chair (or designated signatory) signs.
- Lodge filings with the Companies Office (annual return,
  particulars of directors, addresses, share allotments).
  Filings are made by the company or its agent.
- Approve a director's conflict-of-interest disclosure as
  resolved. The board, or the disinterested directors, decide.
- Sign trustee resolutions or deed amendments.

## Tikanga check

Governance in Aotearoa increasingly intersects with iwi, hapū, and
Māori entity governance — Māori Trust Boards, post-settlement
governance entities, ahu whenua trusts, Māori incorporations under
Te Ture Whenua Māori Act 1993, and rūnanga.

- Where the board governs a Māori entity, defer to the entity's
  own kawa and tikanga first; the Companies Act 1993 framework is
  the floor, not the ceiling.
- Where the board has Māori directors or trustees, manaakitanga
  applies in agenda design (te reo greetings and karakia welcomed
  where the board uses them; the skill does not generate karakia).
- Apply the assembl-core `tikanga-compliance` skill on any board
  communications that go to a wider audience.

## Privacy Act check

Board materials commonly carry personal information about directors
(addresses, dates of birth on Companies Office filings), beneficiaries
(under the Trusts Act 2019 disclosure obligations), and employees
(performance, remuneration, disciplinary). Apply IPP 5 storage and
security at the highest level for board packs, and IPP 11 when
distributing minutes that contain personnel matters — restrict
distribution to those who need to know.

The Trusts Act 2019 includes specific beneficiary information
obligations; balance these against IPP 5 / IPP 11 in trustee
correspondence.

## Workflow steps

For any Arataki workflow:

1. Identify the deliverable (board paper, minutes, resolution,
   policy, trustee letter, Companies Office filing draft).
2. Apply the assembl-core mandatory skills first
   (`tikanga-compliance` where the deliverable goes outside the
   board, `nz-privacy-act-2020` on any personal information).
3. Apply the relevant statute lens — Companies Act 1993 for
   companies, Trusts Act 2019 for trusts, Charities Act 2005 for
   registered charities.
4. Stage the draft for the chair, the company secretary, or the
   designated signatory, and where decisions are final, for legal
   review.

Full workflow detail to follow when an Arataki pilot customer is
assigned.

## References

- Companies Act 1993:
  `https://www.legislation.govt.nz/act/public/1993/0105/latest/whole.html`
- Trusts Act 2019:
  `https://www.legislation.govt.nz/act/public/2019/0038/latest/whole.html`
- Charities Act 2005:
  `https://www.legislation.govt.nz/act/public/2005/0039/latest/whole.html`
- Te Ture Whenua Māori Act 1993:
  `https://www.legislation.govt.nz/act/public/1993/0004/latest/whole.html`
- Companies Office:
  `https://www.companiesoffice.govt.nz/`
- Institute of Directors NZ — governance guidance:
  `https://www.iod.org.nz/`
