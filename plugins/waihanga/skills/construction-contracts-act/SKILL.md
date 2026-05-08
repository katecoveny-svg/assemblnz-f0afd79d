---
name: construction-contracts-act
description: |
  Fires whenever a workflow involves a payment claim, payment schedule,
  variation, or retention under the Construction Contracts Act 2002.
  Covers s.20 (payment claim), s.21 (payment schedule), and s.18A
  (retention money trust regime). Drafts only — no binding sign-offs.

  Trigger phrases / contexts: "payment claim", "payment schedule",
  "CCA", "Construction Contracts Act", "section 20", "section 21",
  "retention money", "retention trust", "variation", "variation
  order", "due date for payment", "default payment", "default amount",
  "principal", "head contractor", "subcontractor", "adjudication".
mandatory: false
applies_to: ["waihanga"]
---

# Construction Contracts Act 2002 — Waihanga utility skill

## When to use

- Drafting a payment claim under s.20 for a head contractor or
  subcontractor to issue.
- Drafting a payment schedule under s.21 for a principal or head
  contractor to issue.
- Reviewing a variation request and drafting the response.
- Advising on retention money treatment under the s.18A retention
  trust regime.
- Preparing background notes for an adjudication referral.

## What this skill will NOT do

- Sign off payment claims or treat them as issued. The contracting
  party signs; the skill drafts.
- Issue payment schedules. Only the payer can issue a payment
  schedule under s.21. The skill drafts; the payer issues.
- Bind the principal or head contractor to a variation. Variations
  must be agreed under the contract terms; the skill drafts the
  variation request and the response, but it does not bind either
  party.
- File adjudication notices on behalf of either party.
- Provide legal advice. Outputs are drafts only — they go to the
  contracting party and, where appropriate, a lawyer.

## Tikanga check

Where the project is on whenua Māori or for a Māori entity, defer
to the building-act-2004 skill's tikanga note for the wider workflow
tone. Manaakitanga matters in payment-claim correspondence — even
where the claim is contested, language toward the other party should
remain respectful.

## Privacy Act check

Payment claims and schedules are commercial documents. Where a
sole-trader subcontractor or named individual is involved, their
contact details are personal information; apply IPP 11 when
distributing schedules to other parties on the project.

## Workflow steps

### Statutory anchors

- **Section 20 — Payment claim**: a payee may serve a payment claim
  on the payer for a progress payment. The claim must:
  - be in writing,
  - identify the construction contract under which it is made,
  - identify the construction work and the relevant period,
  - state the claimed amount and how it is calculated,
  - state the due date for payment, and
  - be in the prescribed form (and accompanied by the prescribed
    notice for residential construction contracts).
- **Section 21 — Payment schedule**: the payer may respond by serving
  a payment schedule. The schedule must:
  - be in writing,
  - identify the payment claim to which it relates,
  - state the scheduled amount the payer proposes to pay, and
  - if the scheduled amount is less than the claimed amount, state
    the reasons for the difference and (for each reason) the manner
    in which the payer calculated the scheduled amount.
  - The schedule must be served within the time required by the
    contract or, if the contract is silent, within 20 working days
    after the payment claim is served.
  - If no payment schedule is served on time, the payer becomes
    liable to pay the claimed amount on the due date.
- **Section 18A — Retention money trust**: retentions held under a
  commercial construction contract must be held on trust for the
  party from whom they are withheld. The retention money must be
  held in cash or readily liquid assets, identifiable as retention
  money, accounted for separately, and reported on. The trust regime
  is strict and protects the subcontractor from the head contractor's
  insolvency.

### Drafting pattern — payment claim

1. Confirm the contract and the period the claim covers.
2. Compute the claimed amount with a clear breakdown (lines of work,
   variations, retentions held back, GST treatment).
3. State the due date for payment (per the contract; default 20
   working days under the Act).
4. Use the prescribed-form heading and, for residential contracts,
   include the prescribed notice.
5. Stage for the payee to issue.

### Drafting pattern — payment schedule

1. Identify the payment claim (date, amount, period).
2. State the scheduled amount the payer proposes to pay.
3. Where the scheduled amount is less than the claimed amount, set
   out the reason for each difference and how each line was
   recalculated (substantiation is non-optional).
4. Stage for the payer to issue **within the contract window or 20
   working days**. Do not let the deadline slip — failure to issue
   triggers liability for the full claimed amount.

### Drafting pattern — retention treatment

1. Confirm the contract is a commercial construction contract caught
   by s.18A.
2. Confirm the retention money is held on trust in cash or readily
   liquid assets, identifiable as retention money, and accounted for
   separately from other funds.
3. Confirm the reporting cycle to the subcontractor is in place.
4. Flag any practice that would breach the trust regime (commingling,
   using retentions as working capital, holding in non-liquid
   assets) — escalate immediately.

## References

- Construction Contracts Act 2002:
  `https://www.legislation.govt.nz/act/public/2002/0046/latest/whole.html`
- MBIE — Construction Contracts Act overview:
  `https://www.building.govt.nz/projects-and-consents/why-contracts-are-important/construction-contracts-act/`
- MBIE — payment claims and schedules:
  `https://www.building.govt.nz/projects-and-consents/why-contracts-are-important/construction-contracts-act/payment-claims-and-schedules/`
- MBIE — retention money trust regime:
  `https://www.building.govt.nz/projects-and-consents/why-contracts-are-important/construction-contracts-act/retention-money/`
- Building Disputes Tribunal (adjudication):
  `https://www.buildingdisputestribunal.co.nz/`
