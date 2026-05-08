---
name: lbp-licensing
description: |
  Licensed Building Practitioner (LBP) verification skill. Looks up
  practitioners on the public LBP register by name or licence number to
  confirm licence class, current status, and scope of practice — and
  whether the licence covers the restricted building work proposed.
  Public-register lookup only; the skill never validates an LBP claim
  without checking the register, and never signs off on RBW.

  Trigger phrases / contexts: "LBP", "licensed building practitioner",
  "LBP check", "LBP register", "licence number", "licence class",
  "carpentry licence", "site licence", "design licence", "RBW", "is
  this builder licensed", "verify the builder", "external plastering
  licence", "foundations licence".
mandatory: false
applies_to: ["waihanga"]
---

# Licensed Building Practitioner — verification skill (Waihanga)

## When to use

- Verifying that a builder, designer, or other practitioner holds a
  current LBP licence before they design or carry out restricted
  building work.
- Confirming the licence class is appropriate for the work scope
  (carpentry, site, foundations, external plastering, brick and
  blocklaying, roofing, design — area of practice 1, 2, or 3).
- Confirming the licensee's current status (licensed, suspended,
  cancelled, retired) on the public LBP register before pricing or
  contracting work.
- Producing a register-lookup file note for the project file before
  RBW is contracted.

## What this skill will NOT do

- Validate someone's claim of LBP status without checking the
  register. The skill always reads the register; it does not take a
  practitioner's word for licence status.
- Sign off on restricted building work. RBW design and supervision
  are the LBP's professional duty; the skill confirms eligibility on
  the register and stops there.
- Modify the LBP register. The register is operated by MBIE; the
  skill is read-only against the public-register interface.
- Replace a competence assessment. A licence is a baseline; project
  fit is decided by the architect, designer, owner, and contractor.
- Provide legal or licensing advice. Outputs are draft work product
  only — a register-check note for the project file.

## Tikanga check

LBP register lookup is a neutral verification task; no specific te reo
or tikanga concern arises from the lookup itself. Where the project is
on whenua of cultural significance, or the practitioner is a Māori-owned
business, defer to the tikanga-compliance skill for tone in any
client-facing copy. Manaakitanga applies in communication with the
practitioner — confirming a licence is routine due diligence, not an
accusation.

Macrons preserved (Waihanga).

## Privacy Act check

LBP register data is publicly available, so lookup is permissible under
the publicly available information exception (IPP 11). However:

- IPP 1: only retrieve what the workflow needs (licence number, licence
  class, status, area of practice).
- IPP 9: do not aggregate practitioner profiles across projects into a
  private dataset that the practitioners have not been told about.
- IPP 11: do not redistribute practitioner details from the lookup
  beyond the project they were retrieved for.
- IPP 3A (effective 1 May 2026): where practitioner information is
  collected indirectly (from the head contractor or from a recruiter
  rather than from the practitioner themselves), notify the
  practitioner of the collection.

## Workflow steps

1. **Receive the input.** Either an LBP licence number or a
   practitioner name (with employer or region if available to
   disambiguate).
2. **Look up on the public LBP register** at lbp.govt.nz. For a
   licence number, retrieve the practitioner record directly. For a
   name, retrieve the candidate set and disambiguate against the
   region or employer.
3. **Read the licence record** — full name, licence number, licence
   class(es), area(s) of practice, current status (licensed,
   suspended, cancelled, retired), date of last status change, any
   notes (conditions, complaints history if published).
4. **Map the work scope to the licence class.** Carpentry, site,
   foundations, external plastering, brick and blocklaying, roofing,
   design (area of practice 1, 2, or 3). Confirm the licence class
   is appropriate for the proposed RBW.
5. **Confirm RBW eligibility.** Cross-check the licence class and
   area of practice against the restricted building work the
   practitioner will design or supervise. Where the licence does not
   cover the proposed RBW, surface the gap rather than working around
   it.
6. **Produce a register-lookup file note** with the date, the
   register URL retrieved, the practitioner record retrieved, and
   the conclusion (licence covers RBW / does not cover RBW / status
   issue flagged).
7. **Stage for the project lead** (architect, designer, contractor,
   or owner's representative) to review and act on. The skill does
   not commission the practitioner.

## References

- Licensed Building Practitioners register:
  `https://www.lbp.govt.nz`
- LBP licence classes and areas of practice (MBIE):
  `https://www.lbp.govt.nz/for-applicants/licence-classes/`
- Building Act 2004 — restricted building work provisions:
  `https://www.legislation.govt.nz/act/public/2004/0072`
- MBIE Building Performance — restricted building work:
  `https://www.building.govt.nz/projects-and-consents/planning-a-successful-build/scope-and-design/decide-who-helps-with-your-design/restricted-building-work/`
