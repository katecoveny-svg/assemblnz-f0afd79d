---
name: ako-domain
description: |
  Ako is the assembl kete for early childhood education and schooling —
  ECE centres, kōhanga reo, kura kaupapa Māori, primary and secondary
  schools, kaiako, and education administrators. This stub covers the
  broad domain: Education and Training Act 2020, Oranga Tamariki Act
  1989 / Vulnerable Children Act and child-safety obligations, ECE
  licensing under the Education (Early Childhood Services)
  Regulations, NCEA assessment, and the privacy obligations specific
  to tamariki. Full skill bodies will be written when a pilot customer
  is assigned to Ako.

  STATUS: scaffold — full skill body deferred until pilot customer
  assigned to this kete.

  Trigger phrases / contexts: "ECE", "early childhood", "kōhanga reo",
  "kura", "kaiako", "tamariki", "NCEA", "internal assessment",
  "moderation", "school enrolment", "ERO", "Education Review Office",
  "vulnerable children", "child safety", "police vet", "safety
  check", "Oranga Tamariki", "incident report", "BoT", "Board of
  Trustees", "parents and whānau".
mandatory: false
applies_to: ["ako"]
---

# Ako — domain stub skill

**STATUS**: scaffold — full skill body deferred until pilot customer
assigned to this kete.

## When to use

This is the broad-strokes Ako domain skill, used when a workflow
falls inside early childhood education or schooling but no narrower
skill exists yet. Typical contexts:

- Drafting ECE policies, enrolment forms, parent and whānau
  communications, and incident reports.
- Reviewing licensing obligations under the Education
  (Early Childhood Services) Regulations 2008 and the Education
  and Training Act 2020.
- Child-safety policy and police-vet workflow under the Children's
  Act 2014 (formerly the Vulnerable Children Act) — workforce
  restrictions and safety checks for the children's workforce.
- NCEA assessment, internal moderation, and moderation
  documentation.
- Board of Trustees governance, principal communications, parent
  newsletters, and Education Review Office (ERO) review prep.

## What this skill will NOT do

- Provide legal advice. Outputs are working drafts only — they go
  to the centre manager / principal / BoT, and where appropriate,
  a lawyer.
- Make a child-safety decision (mandatory reporting to Oranga
  Tamariki, suspension, exclusion). These are statutory decisions
  for designated staff. The skill helps prepare documentation.
- Lodge ECE licensing applications, ERO documentation, NZQA
  moderation submissions, or Ministry of Education returns. Centre
  staff lodge.
- Conduct or sign off police vets and safety checks under the
  Children's Act 2014. Authorised agencies do these checks.
- Determine NCEA results. NZQA moderates and certifies; the skill
  helps draft assessment material and moderation documentation.

## Tikanga check

Ako is one of the kete where tikanga is most directly central —
tamariki, whakapapa, and the relationship between kura / centre,
whānau, hapū, and iwi are foundational.

- Defer to the assembl-core `tikanga-compliance` skill on every
  whānau-facing communication. Macrons, banned words, reserved
  taonga terms.
- Whakapapa information about tamariki is taonga, not metadata.
  Treat it accordingly: minimise collection, secure storage,
  consult whānau on use.
- For kōhanga reo and kura kaupapa Māori, defer to the centre's
  own kawa first; the Education and Training Act 2020 framework is
  the floor.
- Manaakitanga in tone toward whānau, especially in difficult
  conversations (incidents, learning support, transition out of
  the centre or school).
- Whanaungatanga in long-running whānau relationships — the same
  whānau may have multiple tamariki across years.

## Privacy Act check

Ako carries some of the most sensitive personal-information flows
in the assembl plugin family:

- **Tamariki personal information** is personal information about a
  child. The Privacy Act applies; in addition, the Children's Act
  2014 imposes specific safeguarding obligations.
- IPP 5 storage and security at the highest level for tamariki
  records (enrolment, learning, health, attendance, incident).
- IPP 3 / IPP 3A notice to whānau about what is collected and why.
- IPP 11 disclosure: do not disclose tamariki information beyond
  the centre / kura / Ministry / Oranga Tamariki without consent
  or statutory basis.
- IPP 9 retention: enrolment and assessment records have specific
  retention rules in education regulation; do not improvise.
- Ministry of Education and ERO data-sharing has a statutory basis
  but is not an open licence — only what is required.

## Workflow steps

For any Ako workflow:

1. Identify the deliverable (policy, whānau letter, incident
   report, enrolment form, BoT paper, ERO documentation).
2. Apply the assembl-core mandatory skills first
   (`tikanga-compliance` on every whānau-facing piece;
   `nz-privacy-act-2020` on any tamariki information).
3. Apply the relevant statute lens — Education and Training Act
   2020, Education (Early Childhood Services) Regulations 2008,
   Children's Act 2014, Oranga Tamariki Act 1989.
4. Stage the draft for the centre manager / principal / BoT, and
   for child-safety matters, the designated person responsible
   for child protection at the centre / kura.

Full workflow detail to follow when an Ako pilot customer is
assigned.

## References

- Education and Training Act 2020:
  `https://www.legislation.govt.nz/act/public/2020/0038/latest/whole.html`
- Education (Early Childhood Services) Regulations 2008:
  `https://www.legislation.govt.nz/regulation/public/2008/0204/latest/whole.html`
- Children's Act 2014 (formerly Vulnerable Children Act):
  `https://www.legislation.govt.nz/act/public/2014/0040/latest/whole.html`
- Oranga Tamariki Act 1989:
  `https://www.legislation.govt.nz/act/public/1989/0024/latest/whole.html`
- Privacy Act 2020:
  `https://www.legislation.govt.nz/act/public/2020/0031/latest/whole.html`
- Ministry of Education:
  `https://www.education.govt.nz/`
- Education Review Office (ERO):
  `https://www.ero.govt.nz/`
- NZQA:
  `https://www.nzqa.govt.nz/`
- Oranga Tamariki:
  `https://www.orangatamariki.govt.nz/`
