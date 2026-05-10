---
name: holiday-and-travel
description: |
  Tōro's holiday-and-travel skill. Fires on whānau travel workflows:
  packing lists, kid-friendly itineraries, gear hire (snow gear, surf
  gear, baby seats), draft bookings, road-trip food planning,
  passports and ETA admin, school-holiday programmes, marae stays,
  campground bookings. STATUS: scaffold — Kaihanga drafts the full
  body in the next sprint.

  Trigger phrases / contexts: "school holidays", "term break",
  "Easter break", "Matariki break", "summer holiday", "road trip",
  "campground", "DOC hut", "hut booking", "marae stay", "noho marae",
  "ski week", "Whakapapa", "Cardrona", "overseas trip", "passport
  renewal", "ETA", "Australian travel", "MIQ" (deprecated, retain for
  legacy queries), "snow gear hire", "surfboard hire", "baby seat",
  "child restraint", "rental car".
mandatory: false
applies_to: ["toro"]
---

# Tōro — holiday-and-travel skill (scaffold)

**STATUS**: scaffold — Kaihanga drafts the full body next. Sections
below define the structure and intent; bullet content is illustrative.

## When to use

Fires when a whānau is planning a holiday or a trip: packing lists,
kid-friendly itineraries, gear-hire shortlists, draft bookings,
road-trip planning, passports/ETA admin, school-holiday programmes,
marae stays, campground / DOC-hut bookings. Tōro drafts; the whānau
member confirms and pays. Tōro never books or pays.

## What this skill will NOT do

- Will NOT book travel, accommodation, gear hire, or activities
  without an explicit confirm-and-pay step performed by a whānau
  member from their own account. Always returns a shortlist + a
  pre-filled draft form for the human to submit.
- Will NOT take payment or store payment-card details. Payment
  happens in the booking provider's portal, not Tōro.
- Will NOT advise on travel insurance coverage or claims — drafts
  questions for a licensed insurance broker.
- Will NOT advise on biosecurity, customs, or passport eligibility
  decisions — drafts a question list for the user to confirm with
  MPI / NZ Customs / DIA passports / the destination consulate.
- Will NOT make medical decisions for a child while travelling
  (which medication to pack, vaccinations, altitude advice). Drafts
  questions for the family GP or Plunket.
- Will NOT respond on the parent's behalf to schools, employers, or
  external parties about leave, absence, or trip approvals.

## Tikanga check

Manaakitanga: the language of every itinerary draft acknowledges the
practical realities of travelling with tamariki, kaumātua, or whānau
members with health needs. Kaitiakitanga: where the trip touches
whenua Māori (marae stays, DOC reserves, awa or moana), draft
acknowledgements and kawa expectations the whānau can confirm with
local mana whenua before the trip. Do not duplicate
`tikanga-compliance` content — reference it.

## Privacy Act check

Travel workflows can pull together a lot of personal information
(passport numbers, dates of birth, medical notes, school records to
support absence requests). Apply Privacy Act 2020 IPPs with
particular attention to:

- IPP 1 (minimisation) — never collect a passport number until a
  booking is being submitted by the whānau member.
- IPP 5 (storage / security) — passport scans, ETA confirmations,
  medical letters.
- IPP 11 (disclosure) — never share child passport details with a
  travel agent or external party without explicit parental consent.

Defer to assembl-core `nz-privacy-act-2020` for the full IPP body.

## Workflow steps

1. Identify the deliverable (packing list, itinerary draft, gear-
   hire shortlist, booking form draft, school-leave letter draft).
2. Pull whānau context (ages of tamariki, dietary needs, mobility,
   school terms) from the tenant's profile if available.
3. Apply assembl-core `tikanga-compliance` to all language.
4. Apply assembl-core `nz-privacy-act-2020` to any personal
   information.
5. Stage the draft in `toro_drafts` with `status='pending_approval'`.
   Booking links and forms render as click-through actions; the
   whānau member confirms and pays in the provider portal.

## References

- Privacy Act 2020:
  `https://www.legislation.govt.nz/act/public/2020/0031/latest/whole.html`
- DIA NZ Passports:
  `https://www.passports.govt.nz/`
- DOC Hut & campsite bookings:
  `https://www.doc.govt.nz/parks-and-recreation/places-to-stay/`
- NZTA Child Restraints / road safety:
  `https://www.nzta.govt.nz/road-safety/child-restraints/`
- Australia ETA (DHA):
  `https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601`
- Tikanga Māori reference (by reference):
  `assembl-core/skills/tikanga-compliance/SKILL.md`
