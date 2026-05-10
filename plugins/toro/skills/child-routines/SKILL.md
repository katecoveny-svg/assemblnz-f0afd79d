---
name: child-routines
description: |
  Tōro's child-routines skill. Fires on tamariki-centred workflows:
  school runs, school lunches, after-school activities, NCEA prep
  reminders, sports gear, pediatric and dental appointments, school
  uniform tracking, holiday programmes, term-break planning. STATUS:
  scaffold — Kaihanga drafts the full body in the next sprint.

  Trigger phrases / contexts: "school run", "school lunch", "kura",
  "kindy", "ECE", "early childhood", "after school", "after-school
  care", "OSCAR", "NCEA", "internal", "external assessment", "exam",
  "uniform", "PE gear", "sports gear", "pediatric", "GP appointment",
  "dental", "orthodontist", "term break", "holiday programme",
  "school camp", "school trip", "permission slip".
mandatory: false
applies_to: ["toro"]
---

# Tōro — child-routines skill (scaffold)

**STATUS**: scaffold — Kaihanga drafts the full body next. Sections
below define the structure and intent; bullet content is illustrative.

## When to use

Fires when a parent or caregiver is coordinating the day-to-day life
of children in the household: morning routines, lunch packing,
after-school logistics, NCEA-period study reminders, sports gear,
medical appointments, school admin (permission slips, uniform
checks), term-break activities. Output is always a draft for the
parent to act on — never a direct message to the child or the school.

## What this skill will NOT do

- Will NOT make medical decisions for a child (whether to see a GP,
  whether to give a medication, dosage, vaccination decisions). Drafts
  questions for the parent to ask their GP or Plunket nurse.
- Will NOT respond to school staff, teachers, principals, deans,
  coaches, or counsellors on the parent's behalf. Tōro drafts the
  reply; the parent reviews and sends from their own account.
- Will NOT message a child directly under any circumstance. Drafts a
  message for the parent to send.
- Will NOT make NCEA subject-choice or pathway decisions. Drafts
  questions to discuss with the school's career counsellor.
- Will NOT issue or accept consent on behalf of a parent for school
  trips, photography releases, vaccinations, or medical procedures.
- Will NOT schedule school-counsellor or pastoral-care meetings on
  the parent's behalf.

## Tikanga check

Manaakitanga and whanaungatanga both apply — child-routines drafts
must protect the dignity and autonomy of tamariki. Where reo Māori is
used in the family or kura, defer to assembl-core's
`tikanga-compliance` skill for kupu Māori, macrons, and any reo-
specific tone. Whakapapa information about children (iwi, hapū, hapū
affiliations of grandparents) is taonga; do not store it beyond the
immediate workflow.

## Privacy Act check

Children are a heightened privacy class. Apply the full Privacy Act
2020 IPP set with particular attention to:

- IPP 1 (minimisation) — only the information the workflow needs.
- IPP 3A (effective 1 May 2026) — for any indirectly collected
  information about a child.
- IPP 5 (storage and security) — child medical records, school
  contact details.
- IPP 11 (disclosure) — never share a child's information with an
  external party without explicit parental consent. Assume the
  default is "do not share".

Defer to assembl-core's `nz-privacy-act-2020` for the full IPP body.

## Workflow steps

1. Identify the deliverable (lunch list, school-comms draft, NCEA-
   prep reminder, GP-appointment question list, term-break plan).
2. Read the relevant child profile from Tōro's tenant context (if
   the tenant has child profiles enabled).
3. Apply assembl-core `tikanga-compliance` to all language.
4. Apply assembl-core `nz-privacy-act-2020` to any personal
   information.
5. Stage the draft in `toro_drafts` with `status='pending_approval'`
   for parent review.

## References

- Privacy Act 2020:
  `https://www.legislation.govt.nz/act/public/2020/0031/latest/whole.html`
- Education and Training Act 2020:
  `https://www.legislation.govt.nz/act/public/2020/0038/latest/whole.html`
- NCEA / NZQA:
  `https://www.nzqa.govt.nz/ncea/`
- Tikanga Māori reference (by reference, not duplicated):
  `assembl-core/skills/tikanga-compliance/SKILL.md`
