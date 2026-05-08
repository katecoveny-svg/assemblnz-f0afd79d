---
name: nz-privacy-act-2020
description: |
  Fires whenever an agent encounters personal information about a New Zealand
  individual — handling, collection, storage, use, disclosure, sharing,
  cross-border transfer, retention, deletion, breach response, or any IPP
  query. The skill governs what the agent may collect, why, where it lives,
  who it can be told, and how long it stays.

  Trigger phrases / contexts: "personal information", "PII", "privacy",
  "data collection", "consent", "data sharing", "disclosure", "data breach",
  "notifiable breach", "Privacy Commissioner", "OPC", "IPP", "right of
  access", "right of correction", "DPIA", "privacy impact assessment",
  "indirect collection", "third-party data", IRD numbers, NHI numbers,
  health information, employment records, tenancy records, customer
  records, member registers.
mandatory: true
applies_to: ["*"]
---

# NZ Privacy Act 2020 — core compliance skill

## When to use

Any time the agent encounters personal information about a New Zealand
individual. That includes (but is not limited to):

- Names, addresses, phone numbers, email addresses
- IRD numbers, NHI numbers, driver licence numbers, passport numbers
- Employment records (pay, leave, performance, discipline)
- Health information
- Whakapapa, iwi affiliation, hapū affiliation
- Tenancy and housing records
- Customer purchase history, complaints, support tickets
- Anything that could identify a living person, directly or indirectly

If the workflow touches any of the above, this skill fires before any
collection, storage, use, disclosure, or deletion is drafted.

## What this skill will NOT do

- Send Privacy Commissioner notifiable breach notifications on the user's
  behalf. The skill drafts the notice; a human Privacy Officer files it.
- Provide legal advice. Outputs are working drafts only — they go to the
  organisation's Privacy Officer and, where appropriate, a lawyer.
- Classify a breach as "notifiable" without a human Privacy Officer
  review. The skill flags candidate notifiable breaches; the human signs
  them off.
- Release personal information to any third party without explicit,
  documented consent or another lawful basis.
- Bypass an organisation's Data Protection Impact Assessment (DPIA)
  process for new collections or new uses.

## Tikanga check

Where personal information includes Māori personal information —
whakapapa, iwi or hapū affiliation, mātauranga, identity markers, taonga
associations — apply Te Hiku Media's data sovereignty stance and
Karaitiana Taiuru's Indigenous Peoples AI Framework alongside the IPPs.

- Defer to mana whenua and kaitiaki where iwi, hapū, or marae data
  sovereignty applies. The IPPs are a floor, not a ceiling.
- Whakapapa is not a routine identifier. Treat it as taonga.
- Never assume a Western privacy frame is sufficient for taonga data.
- If in doubt, pause and consult — do not "minimise then proceed".

Where there is no Māori personal information in scope, record that no
specific tikanga concern applies for this run, and continue.

## Privacy Act check

This skill IS the Privacy Act check.

## Workflow steps

### The 13 Information Privacy Principles (IPPs)

- **IPP 1 — Purpose**: collect only what is necessary for a lawful purpose
  connected with a function of the agency. If the job can be done without
  the information, do not collect it.
- **IPP 2 — Source**: collect from the individual themselves where
  reasonably practicable.
- **IPP 3 — Notice at collection**: tell the individual who you are, why
  you are collecting, who will receive it, whether collection is
  mandatory, and their rights of access and correction.
- **IPP 3A — Notice for indirectly collected information** (NEW,
  effective 1 May 2026): when you collect personal information about an
  individual from a source other than the individual themselves, give the
  individual an IPP 3-equivalent notice as soon as reasonably practical.
  Limited statutory exceptions apply. The default is **notify**.
- **IPP 4 — Manner of collection**: collect lawfully and fairly. No
  intrusive, deceptive, or unreasonable means.
- **IPP 5 — Storage and security**: protect personal information against
  loss, unauthorised access, use, modification, or disclosure.
- **IPP 6 — Right of access**: the individual has the right to obtain
  confirmation of, and access to, their personal information held by the
  agency. Respond within 20 working days.
- **IPP 7 — Right of correction**: the individual has the right to
  request correction. If the agency declines, attach a statement of
  disagreement.
- **IPP 8 — Accuracy**: take reasonable steps to ensure personal
  information is accurate, complete, relevant, up to date, and not
  misleading before use or disclosure.
- **IPP 9 — Retention**: do not keep personal information for longer
  than is required for the purpose for which it may lawfully be used.
- **IPP 10 — Use**: use personal information only for the purpose it was
  collected, or a directly related purpose, or with consent, or under a
  statutory exception.
- **IPP 11 — Disclosure**: disclose only with consent or under a
  statutory exception. Document the basis.
- **IPP 12 — Cross-border disclosure**: before sending personal
  information offshore, confirm the receiving agency is subject to
  comparable safeguards (a country with comparable privacy law, a
  binding scheme, or contractual safeguards).
- **IPP 13 — Unique identifiers**: do not assign a unique identifier
  unless necessary; do not adopt another agency's identifier; take
  reasonable steps to confirm identity before assigning one.

### Notifiable privacy breach procedure (Privacy Act 2020 ss. 116–117)

A notifiable privacy breach is one where personal information is
accessed, used, or disclosed without authorisation **and** the breach
has caused, or is likely to cause, **serious harm** to an affected
individual.

When the skill detects a candidate notifiable breach:

1. Stop and isolate. Do not "fix and forget".
2. Document what happened, when, what information, how many individuals.
3. Apply the serious-harm test: sensitivity of the information, who
   has it, what they could do with it, mitigations already taken.
4. Draft two notices:
   - A notice to the **Privacy Commissioner** via NotifyUs.
   - A notice to **each affected individual** in plain language, with
     practical steps they can take to protect themselves.
5. Hand both drafts to the human Privacy Officer for review and filing.
6. Notify "as soon as practicable" — there is no fixed deadline in the
   Act, but the standard is "without undue delay". Days, not weeks.

### Working pattern for routine personal-information tasks

For every task touching personal information:

1. Name the IPPs in scope.
2. Confirm the lawful basis for collection or use.
3. Confirm a current, accurate IPP 3 (or IPP 3A) notice exists for this
   collection.
4. Confirm IPP 5 security controls are in place at the storage location.
5. Confirm a retention rule is set under IPP 9.
6. Output the work, with a privacy footnote naming the IPPs applied.

## References

- Privacy Act 2020:
  `https://www.legislation.govt.nz/act/public/2020/0031`
- Office of the Privacy Commissioner: `https://www.privacy.org.nz/`
- OPC IPP 3A guidance (indirect collection):
  `https://www.privacy.org.nz/privacy-act-2020/privacy-principles/3a/`
- NotifyUs (notifiable breach tool):
  `https://www.privacy.org.nz/responsibilities/privacy-breaches/notify-us/`
- Health Information Privacy Code 2020:
  `https://www.privacy.org.nz/privacy-act-2020/codes-of-practice/hipc2020/`
- Te Hiku Media — Māori data sovereignty: `https://tehiku.nz`
- Karaitiana Taiuru — Indigenous Peoples AI Framework:
  `https://www.taiuru.maori.nz`
- Te Mana Raraunga — Māori Data Sovereignty Network:
  `https://www.temanararaunga.maori.nz`
