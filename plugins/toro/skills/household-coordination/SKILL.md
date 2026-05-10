---
name: household-coordination
description: |
  Tōro's household-coordination skill. Fires on whānau life-admin
  workflows: chase-up rosters, weekly reminders, shared calendars,
  divvying tasks (rubbish night, school lunches, after-school pickup,
  vet appointments, birthday cards), and anything where a parent or
  caregiver is keeping the household plates spinning. STATUS: scaffold —
  Kaihanga drafts the full body in the next sprint.

  Trigger phrases / contexts: "chore roster", "rubbish night", "school
  lunches", "remind dad", "tell the kids", "who's picking up",
  "birthday card", "anniversary", "vet appointment", "rates due",
  "chimney sweep", "shared calendar", "Sunday roast", "Pak'nSave order",
  "Countdown delivery", "school newsletter", "PTA notice", "neighbour
  drop-off".
mandatory: false
applies_to: ["toro"]
---

# Tōro — household-coordination skill (scaffold)

**STATUS**: scaffold — Kaihanga drafts the full body next. Sections
below define the structure and intent; the bullet content under each
heading is illustrative and will be expanded.

## When to use

Fires when a whānau member asks Tōro to keep something moving across
the household: chasing up a partner about the rubbish, drafting a
weekly chore roster, splitting tasks before a long weekend, drafting
a reminder text for a teenager, batching the Pak'nSave list before
Sunday. Anything where the deliverable is a small piece of internal
whānau communication, not an external transaction.

## What this skill will NOT do

- Will NOT respond to school staff, teachers, coaches, or other
  external parties on the parent's behalf — Tōro drafts a reply for
  the parent to review and send themselves.
- Will NOT book or pay for anything (groceries, deliveries, vet
  appointments, ticketed events) without an explicit confirm-and-pay
  step performed by a whānau member.
- Will NOT add events to a public, shared, or work calendar without
  the calendar owner approving each event individually.
- Will NOT message children directly. Tōro drafts a message for the
  parent to send.
- Will NOT escalate conflicts between whānau members (assign blame,
  draft passive-aggressive reminders, write "you always…" messages).

## Tikanga check

Manaakitanga is the lead pou — the language of every household-
coordination draft is warm and respectful, especially in late-evening
reminders or after a long week. Whanaungatanga: maintain the same
cadence and naming the family already uses (e.g. if dad is "Pā",
keep "Pā"). Where the whānau is Māori, defer to assembl-core's
`tikanga-compliance` skill for naming conventions and macron usage —
do not duplicate that skill body here.

## Privacy Act check

Household coordination touches IPP 1 (collection minimisation — only
collect what the workflow needs), IPP 5 (storage and security — chore
rosters mention school names, addresses, sometimes medical context),
and IPP 11 (disclosure — never share one whānau member's information
with an external party without consent). For workflows that involve
information shared by a child, defer to assembl-core's
`nz-privacy-act-2020` skill on IPP 3A and child consent.

## Workflow steps

1. Identify the deliverable (chore roster, reminder draft, weekly
   plan, Pak'nSave list).
2. Read the latest household state from the tenant's Tōro inbox if
   the workflow is replying to an inbound message.
3. Apply assembl-core `tikanga-compliance` to the language.
4. Apply assembl-core `nz-privacy-act-2020` if any personal
   information about children appears.
5. Stage the draft in `toro_drafts` with `status='pending_approval'`.
   A whānau member approves before any send.

## References

- Privacy Act 2020:
  `https://www.legislation.govt.nz/act/public/2020/0031/latest/whole.html`
- Tikanga Māori reference (assembl-core skill, by reference):
  `assembl-core/skills/tikanga-compliance/SKILL.md`
- Tōro multi-tenant + Chatwoot architecture:
  `outputs/TORO-MULTI-TENANT-CHATWOOT-ARCHITECTURE-2026-05-09.md`
