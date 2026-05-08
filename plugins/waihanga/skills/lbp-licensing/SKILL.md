---
name: lbp-licensing
description: |
  Fires whenever a workflow needs to verify a Licensed Building
  Practitioner's licence, identify the licence class needed for a
  scope of work, or confirm an LBP can sign restricted building work
  (RBW). Lookups go through the `mcp-lbp-register` MCP server (built
  in Day 12+ of the canon build sequence).

  Trigger phrases / contexts: "LBP", "Licensed Building
  Practitioner", "licence class", "carpentry licence", "design
  licence", "site licence", "RBW", "restricted building work", "LBP
  register", "licence number", "licence expiry", "memorandum",
  "Form 2A".
mandatory: false
applies_to: ["waihanga"]
---

# LBP licensing — Waihanga utility skill

## When to use

- Verifying that a person on a job is a current Licensed Building
  Practitioner before they carry out, supervise, or sign restricted
  building work.
- Working out which licence class is needed for a scope of work
  (Carpentry, Design, Site, Foundations, Roofing, External Plastering,
  Bricklaying and Blocklaying).
- Preparing a Memorandum of Restricted Building Work (Form 2A) for
  the LBP responsible to sign.
- Confirming a contractor or subcontractor's claim that their team is
  appropriately licensed.

## What this skill will NOT do

- Validate any LBP claim without checking the LBP public register.
  The skill always confirms via the register — never relies on
  copies or screenshots provided by the contractor.
- Sign off restricted building work. Only an LBP within the
  appropriate licence class may carry out, supervise, or sign RBW.
  The skill drafts; the LBP signs.
- Lodge or amend LBP licence applications. The LBP applies to the
  Building Practitioners Board through the formal MBIE process.
- Replace a Building Consent Authority's RBW determination. Where
  the BCA queries whether work is RBW, the skill drafts a response;
  the BCA decides.

## Tikanga check

No specific tikanga concern applies to the licence-verification
exercise itself. Where the LBP, the contractor, or the project is
Māori-led, defer to the building-act-2004 skill's tikanga note for
the wider workflow tone. Manaakitanga matters in tone when raising a
discrepancy with a contractor about a licence claim.

## Privacy Act check

LBP licence details (name, licence number, classes, status, expiry)
are public information published on the LBP register. Lookup is
permissible under the publicly available information exception
(IPP 11). However, do not aggregate LBP profiles across projects
into a private dataset without telling the practitioner — apply
IPP 9 (retention) and IPP 10 (use limitation) to any record built
from these lookups.

## Workflow steps

### Licence classes

The Licensed Building Practitioners scheme has the following classes:

- **Design** — for design work that is restricted building work.
  Has sub-classes for area of practice (Design 1, Design 2, Design 3).
- **Carpentry** — structural carpentry RBW.
- **Site** — site management of RBW (Site 1, Site 2, Site 3).
- **Foundations** — foundation RBW.
- **Roofing** — roofing RBW.
- **External Plastering** — external plastering RBW.
- **Bricklaying and Blocklaying** — masonry RBW.

A practitioner may hold more than one class. RBW must be carried
out, supervised, or signed by an LBP within the class appropriate
to the work.

### Verification pattern

1. Receive the LBP claim: name, licence number (if provided), and
   the work the practitioner is responsible for.
2. Call the `mcp-lbp-register` MCP server (when built — see canon
   Day 12+) to look up the practitioner. Until the MCP server is
   built, fall back to the public LBP register search and surface
   the URL the user can verify against.
3. Confirm:
   - The licence is **current** (not expired, suspended, or cancelled).
   - The licence class **covers** the work in question.
   - Any disciplinary record relevant to the work scope.
4. Stage the verification note for the project manager / BCA. If
   the licence does not cover the work, flag and stop — RBW done
   outside class is a Building Act offence.

### Memorandum of Restricted Building Work (Form 2A)

For restricted building work, the LBP responsible signs a Form 2A
memorandum that goes with the building consent application (or, in
some cases, with the CCC application). The skill drafts the
memorandum content; the LBP signs and dates it. The skill never
signs.

## References

- LBP public register:
  `https://lbp.ewr.govt.nz/`
- MBIE — Licensed Building Practitioners:
  `https://www.lbp.govt.nz/`
- MBIE — restricted building work:
  `https://www.building.govt.nz/projects-and-consents/planning-a-successful-build/scope-and-design/check-if-you-need-consents/restricted-building-work/`
- Licensed Building Practitioners Rules 2007:
  `https://www.legislation.govt.nz/regulation/public/2007/0383/latest/whole.html`
- Building Practitioners Board (disciplinary):
  `https://www.lbp.govt.nz/about-the-scheme/the-board/`
- Building Act 2004 (parent statute):
  `https://www.legislation.govt.nz/act/public/2004/0072/latest/whole.html`
