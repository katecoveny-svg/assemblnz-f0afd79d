# Customer permissions — signed records

This directory holds the **written permission** behind every logo, name, and
quote on the public site (the home-page logo wall, `/customers`, and each
`/customers/[slug]` case study).

**No logo, name, or quote goes on the live site without a record here.** This is
a hard honesty rule, not a nicety. The code enforces the gate
(`lib/customers/customer-permissions.ts` only renders `status: 'approved'`
entries), but the *truth* lives in these files.

## Status as of 2026-06-17

**Zero approved customer logos on file.** `CUSTOMERS` in
`lib/customers/customer-permissions.ts` is empty. The logo wall renders its
honest invitation state ("yours could be the first logo here") until a real,
consented customer is added.

## How to add a customer

1. Get explicit **written** permission (email is fine) covering, at minimum:
   - use of their **logo**
   - the **one-line quote** (verbatim, under 25 words)
   - the **spokesperson name + title**
   - the **outcome line** (numbers, if shareable)
2. Save that confirmation here as `<slug>.md` — paste the email text, the date,
   who sent it, and exactly what they approved. Use `_TEMPLATE.md` as the start.
3. Add the entry to `CUSTOMERS` in `lib/customers/customer-permissions.ts` with
   `status: 'approved'` and `consentRecord: 'legal/customer-permissions/<slug>.md'`.

## Locked rules (do not break)

- **No fake or composite testimonials.** Ever.
- **No logos lifted from press releases** without explicit logo-use email.
- **Zero mana whenua relationship claims.** Do not add any iwi, hapū, Māori
  organisation, or Te Hiku Media entry unless Kate Hudson has explicitly
  green-lit it *and* a real, consented relationship exists. Default is no.
- **Don't overstate the engagement.** A Pilot Sprint customer is a
  "Pilot Sprint customer" — that's a feature, not a hedge.
- If a customer has signed a pilot but won't consent to brand use yet, set
  `consentBasis: 'pilot-under-nda'` and `redacted: true` — the site shows
  "Pilot partner — name withheld under NDA", never the real name.

## Spreadsheet / form

Customer asks are captured via a single 90-second Notion form (see the outreach
email script — a separate human task). Keep the ask short; do not let it become
a stakeholder review process.
