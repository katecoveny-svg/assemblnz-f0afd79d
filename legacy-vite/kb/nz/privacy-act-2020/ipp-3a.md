# IPP3A — Collection of personal information from other sources
# KB path: kb/nz/privacy-act-2020/ipp-3a.md
# Version: 0.1.0 · 2026-04-09
# Last verified: 2026-04-09
# Source: Privacy Act 2020 s22A (as amended)
# Effective date: 1 May 2026

---

## Summary

IPP3A requires that when an agency collects personal information about an individual **from a source other than the individual** (indirect collection), the agency must take reasonable steps to ensure the individual knows about that collection.

This is a new obligation that comes into force on **1 May 2026**. Agencies must comply from that date.

---

## What IPP3A requires

When an agency collects personal information about an individual from a source other than the individual, the agency must take reasonable steps to ensure, before or when the information is collected — or as soon as practicable after collection — that the individual is aware of:

1. **The fact of collection** — that information about them has been or will be collected.
2. **The purpose** — the purpose for which the information is being collected.
3. **The agency's identity** — who holds the information and how to contact them.
4. **Access and correction rights** — the individual's right to access the information and request corrections under IPP6 and IPP7.

This is the indirect-collection equivalent of the obligations in IPP3 (which applies when the individual provides information directly).

---

## Who IPP3A applies to

IPP3A applies to any agency within the scope of the Privacy Act 2020 that collects personal information about an individual **from a source other than that individual**. This includes:

- Employers who receive employee data from a rostering system, payroll processor, or recruitment agency.
- Businesses that purchase contact lists, data feeds, or lead lists from third parties.
- Organisations that receive personal information from partner systems or integrations.
- Any business that uses a third-party system that feeds personal data about people who have not directly provided it to the agency.

---

## What "collection" means in practice

Collection means obtaining, receiving, or accessing personal information. The obligation under IPP3A applies where:

- A payroll processor sends employee data to the agency's systems.
- A rostering app shares employee schedule and contact details with an overseas payroll provider.
- A CRM integration pulls contact records from a partner database.
- A lead-generation service provides a list of individuals who have not directly engaged with the agency.

---

## Common scenarios where IPP3A is triggered

### Rostering and payroll integrations
Many small NZ businesses use rostering apps (e.g. Deputy, FlexiRosta, Ento) that share employee data with overseas payroll processors. If the employees were not notified that their data flows to the overseas processor, IPP3A is engaged.

### Third-party HR platforms
HR onboarding systems that receive data from recruitment agencies or job boards collect personal information about candidates indirectly. IPP3A applies.

### Insurance and finance referrals
Where a broker or referral partner provides customer data to an insurer or lender, the receiving agency must notify the individual under IPP3A.

### AI and automated data enrichment
Where a workflow uses an agent or third-party API to enrich a record with information about a person (e.g. from public registers, social media, or data brokers), IPP3A applies to the enriched personal information.

---

## What "reasonable steps" means

Reasonable steps to notify under IPP3A will depend on the circumstances. The Office of the Privacy Commissioner (OPC) guidance suggests:

- Direct notification by email, letter, or in-person is sufficient where the individual's contact details are known.
- A privacy policy accessible at the time the data is collected can satisfy the obligation in some circumstances, but passive publication alone may not be sufficient where the individual is unlikely to see it.
- The agency should document what steps were taken and when.
- The standard is what is reasonable given the cost, difficulty, and purpose of collection — not what is theoretically possible.

---

## Exemptions

IPP3A does not apply in all cases. Check whether any of the following apply before raising a finding:

- **Law enforcement exemption:** Collection is necessary for law enforcement or security purposes and notification would prejudice that purpose.
- **Authorised by law:** The collection is required or authorised by another Act of Parliament.
- **Individual is already aware:** The individual is already aware of the collection and the required information.
- **Disproportionate effort:** Taking reasonable steps to notify would involve disproportionate effort and the agency has documented why (not a low bar — the agency must be able to justify this).
- **Harm to another person:** Notification would be likely to prejudice the safety of another individual.

Document any exemption relied on in the finding's source_pointer or notes.

---

## Checklist — does IPP3A apply to this workflow input?

Run through this checklist for every input where the personal information was not provided directly by the individual:

```
□ Was this personal information collected directly from the individual?
  → If YES: IPP3A does NOT apply. IPP2/IPP3 applies instead.

□ Was this personal information collected from a third party, data feed,
  partner system, integration, or AI enrichment step?
  → If YES: continue ↓

□ Has the individual been notified of:
  (a) the fact of collection?
  (b) the purpose?
  (c) the agency's identity?
  (d) their access and correction rights?
  → If NO to any: record an IPP3A gap finding.

□ Does an exemption apply (law enforcement, authorised by law, already aware,
  disproportionate effort, harm to another)?
  → If YES: cite the exemption in the finding. No IPP3A gap.
  → If uncertain: flag as at_risk in the IPP snapshot.
```

---

## Required fields in the PIKAU extension

For each input where IPP3A is triggered, record in `kete_extension.ipp3a_collection_source_notices`:

| Field | Type | Description |
|---|---|---|
| `data_type` | string | What personal information (e.g. "employee roster and payroll data") |
| `collection_method` | `"indirect"` | Set to `indirect` for all IPP3A-triggered inputs |
| `source_ref` | string | Vendor name, system name, or file reference |
| `notice_given` | boolean | `true` if reasonable steps to notify have been taken; `false` if not |

If `notice_given: false` → produce a **high or critical severity finding** citing Privacy Act 2020 s22A.

---

## IPP snapshot status for IPP3A

| Status | When to use |
|---|---|
| `compliant` | Indirect collection identified, and reasonable steps to notify have been taken |
| `at_risk` | Indirect collection identified, notification may not be sufficient, or status uncertain |
| `non_compliant` | Indirect collection identified, no notification steps taken, no exemption applies |
| `not_applicable` | No indirect collection identified in this review |
| `unknown` | Insufficient information to assess |

---

## How to cite IPP3A in findings

When citing IPP3A in a finding, use:

```
type: law
label: "Privacy Act 2020 s22A (IPP3A)"
locator: "Privacy Act 2020 s22A — IPP3A: Collection of personal information from someone other than the individual. Effective 1 May 2026."
retrieved_at: [date of analysis in ISO 8601]
```

---

## Transition period note

IPP3A is effective from **1 May 2026**. Reviews conducted before that date should flag anticipated obligations. Reviews conducted on or after 1 May 2026 should treat non-compliance as a current obligation, not a future one.

---

## Further resources

- Office of the Privacy Commissioner: privacy.org.nz
- Privacy Act 2020: legislation.govt.nz/act/public/2020/0031
- IPP3A guidance: [TODO: add OPC guidance link once published]

---
