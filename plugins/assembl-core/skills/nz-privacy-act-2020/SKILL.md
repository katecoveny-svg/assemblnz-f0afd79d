---
name: nz-privacy-act-2020
description: |
  Fires whenever a user request involves personal information about an identifiable
  individual — including names, contact details, IRD numbers, health records, IP
  addresses, employment details, or any combination of attributes that could identify
  a person. Also fires when a user asks about data collection, storage, sharing,
  access requests, breach response, or privacy impact assessment. Trigger phrases:
  "collect data", "store information", "share details", "customer records",
  "employee data", "privacy breach", "access request", "data subject", "IPP",
  "Privacy Commissioner", "notifiable breach", "consent", "disclosure".
mandatory: true
applies_to:
  - assembl-core
  - manaaki
  - waihanga
  - auaha
  - arataki
  - pikau
  - hoko
  - ako
  - toro
---

# NZ Privacy Act 2020 — Core Skill

**Jurisdiction**: New Zealand  
**Statute**: Privacy Act 2020 (commenced 1 December 2020)  
**Amendment**: IPP 3A effective 1 May 2026  
**Authority**: Privacy Commissioner Te Mana Mātāpono Matatapu  
**Status**: Mandatory — fires on any personal information handling

---

## When to use

Use this skill whenever the interaction involves:
- Collecting personal information from or about an identifiable individual
- Storing, using, or disclosing personal information
- Responding to an individual's request to access or correct their information
- Assessing the privacy impact of a proposed business activity
- Responding to a suspected privacy breach
- Advising on data sharing arrangements with third parties
- Building or reviewing systems that process personal information

---

## What this skill will NOT do

- **Will NOT** submit a notifiable privacy breach notification to the Privacy Commissioner on the user's behalf — this is the Privacy Officer's statutory duty (s.115)
- **Will NOT** draft a legally binding privacy statement or policy — recommend review by a legal adviser
- **Will NOT** determine whether a specific breach meets the "serious harm" threshold for notification — this requires case-by-case legal assessment
- **Will NOT** assess overseas data transfer risks for countries without equivalent legislation — recommend Privacy Commissioner guidance
- **Will NOT** conduct a privacy impact assessment (PIA) in full — assists with structuring, but a PIA requires human sign-off by the Privacy Officer
- **Will NOT** advise on the interaction between Privacy Act 2020 and sector-specific legislation (e.g., Health Information Privacy Code) — recommend specialist advice

---

## Tikanga check

Before proceeding with any output involving Māori personal information:

1. **Whakapapa data**: Information linked to iwi, hapū, or whanau relationships is taonga — handle with additional care beyond the minimum IPPs
2. **Māori data sovereignty**: Te Mana Raraunga principles apply — Māori retain rangatiratanga over data about themselves and their communities
3. **IPP 1 purpose limitation**: Be explicit that Māori data will not be used for secondary purposes without informed consent from rights-holders
4. **Language**: Use correct macrons — Māori (not Maori), whanau (wh āno → whānau), hapū, iwi
5. **If the request involves a Māori health record, genealogical record, or traditional knowledge record**: flag for Kaitiaki Review before any output is shared externally

---

## Privacy Act check

Apply in this order:

### IPP 1 — Purpose of collection
- Collect personal information only for a lawful purpose connected to the user's business functions
- Draft must state the specific purpose clearly — not vague language like "business improvement"

### IPP 2 — Source of collection
- Collect from the individual themselves wherever reasonably practicable
- If collected from a third party, trigger IPP 3A disclosure

### IPP 3 — Collection from subject
- Individual must know: (a) collector's identity, (b) purpose of collection, (c) whether mandatory or voluntary, (d) consequences of not providing, (e) right to access and correct

### IPP 3A — Indirectly collected information (effective 1 May 2026)
- When personal information is collected from a source other than the individual (e.g., a broker, a government register, a referral):
  - The agency must inform the individual at or before first use of that information
  - Exceptions: where notification would prejudice the purpose of collection, or where the information is publicly available
  - This is NEW law — draft any consent or disclosure templates to include IPP 3A language

### IPP 4 — Manner of collection
- Do not collect by unlawful or unfair means, or by intrusion to an unreasonable degree

### IPP 5 — Storage and security
- Take reasonable steps to protect personal information from loss, unauthorised access, use, modification, or disclosure
- Draft output: document security controls (encryption at rest, access controls, audit logging)

### IPP 6 — Access
- Individuals have the right to request access to their personal information
- Agency must respond within 20 working days (s.51)
- Grounds for refusal are limited (s.53)

### IPP 7 — Correction
- Individuals have the right to request correction of their personal information (s.71)
- If correction is refused, individual can attach a statement of correction (s.75)

### IPP 8 — Accuracy before use
- Before using personal information, take reasonable steps to ensure it is accurate, up-to-date, complete, relevant, and not misleading

### IPP 9 — Retention
- Do not keep personal information for longer than required for the purpose of collection
- Note specific retention requirements: Customs Act s.405 (7 years for customs records), Tax Administration Act (7 years for tax records), Employment Relations Act (wage/time records 6 years)

### IPP 10 — Use limitation
- Use personal information only for the purpose for which it was collected
- Secondary use requires individual's consent, or falls within the limited statutory exceptions (s.22)

### IPP 11 — Disclosure
- Do not disclose personal information to a third party without consent unless an exception applies (s.22)
- Permitted disclosures include: law enforcement, court order, serious threat to health/safety

### IPP 12 — Unique identifiers
- Do not assign unique identifiers unless necessary; do not assign a unique identifier already assigned by another agency
- IRD numbers, NHI numbers, and bank account numbers are RESTRICTED — never log in plain text; always mask in outputs and audit records

### IPP 13 — Sensitive attributes (proposed, watch legislation)
- Special care for: ethnic/racial origin, religious beliefs, sexual orientation, health, criminal history

---

## Workflow steps

1. **Identify** what personal information is involved in the user's request
2. **Map** the information flow: collection → storage → use → disclosure → retention → disposal
3. **Apply** the relevant IPPs in sequence (IPP 1 through 13 as applicable)
4. **Flag** any IPP 3A triggers (indirectly collected information — new from 1 May 2026)
5. **Draft** the privacy-compliant output with required disclosures
6. **Recommend** professional review for anything involving health information, financial information, or overseas transfers
7. **Stage** the output for human sign-off — do NOT submit or disclose on the user's behalf

---

## References

- Privacy Act 2020: https://www.legislation.govt.nz/act/public/2020/0031
- Privacy Commissioner guidance: https://www.privacy.org.nz
- IPP 3A guidance (from 1 May 2026): https://www.privacy.org.nz/privacy-act-2020/privacy-principles/collecting-personal-information/
- Health Information Privacy Code 2020: https://www.privacy.org.nz/privacy-act-2020/codes-of-practice/hipc2020/
- Te Mana Raraunga — Māori Data Sovereignty Network: https://www.temanararaunga.maori.nz
- Notifiable breach guidance (s.113–s.120): https://www.privacy.org.nz/further-resources/notifiable-privacy-breaches/
- Access and correction requests (Part 4): https://www.privacy.org.nz/privacy-act-2020/access-and-correction/
