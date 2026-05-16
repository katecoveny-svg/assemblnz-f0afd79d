---
name: stripe-settlement-summary
description: |
  Summarises the operator's Stripe activity over the last 7 days —
  net settlements paid out to the operator's bank, refunds, and any
  disputes (chargebacks). Stages a settlement summary block for the
  Business Pulse weekly brief. Read-only — never issues a refund,
  never replies to a dispute, never moves money.

  Trigger phrases / contexts: "Stripe settlements", "last week's
  takings", "card revenue", "online revenue", "disputes",
  "chargebacks", "refunds this week", "weekly Stripe".
mandatory: false
applies_to: ["arataki"]
---

# stripe-settlement-summary — Business Pulse skill (Arataki)

[Kaihanga: scaffold — written 16 May 2026 against the Business Pulse
spec. Full body to be tuned against Aironaut and TOA pilot data once
their Stripe connections are confirmed in
`assembl_integration_providers`.]

## When to use

Fires when the operator (or the Business Pulse workflow) asks for any
of the following:

- Last 7 days net Stripe payouts to the operator's bank.
- Last 7 days refund volume and total.
- Open disputes (chargebacks) and any deadline to respond.
- A flag when refund rate or dispute rate exceeds the operator's
  configured thresholds.

## What this skill will NOT do

- Will NOT issue a refund. Refunds remain with the operator or
  whoever has Stripe Dashboard `refund` permission.
- Will NOT respond to a dispute, upload evidence, or accept a
  chargeback. Dispute response remains with the operator.
- Will NOT change any Stripe setting — webhook config, payout
  schedule, payment method support. Read-only.
- Will NOT give chargeback or fraud advice. Refer the operator to
  their merchant services provider or a payments specialist.
- Will NOT release a payout, pause a payout, or change the payout
  schedule. Payouts remain on the operator's Stripe-defined cadence.

## Tikanga check

[Kaihanga: write the tikanga frame — short. Stripe data is largely
operational. The frame is mostly that the brief language used to
describe customers (especially in a refund or dispute context) avoids
adversarial framing and respects manaakitanga.]

## Privacy Act check

[Kaihanga: write the IPP coverage — Stripe holds payer names, email
addresses, and partial card data, which are personal information.
IPP 5 storage and security at the highest level. IPP 11 disclosure
limited to the operator and authorised finance team. IPP 3A
(1 May 2026) considered for any payer data that the operator
collected indirectly (e.g., via a marketplace).]

## Workflow steps

1. Resolve the Stripe connection through `tenant_tool_connections`
   for the operator's Stripe account.
2. Pull payouts via Stripe API `payouts.list` for the last 7 days
   in NZT, sum to `net_settlements_nzd`.
3. Pull refunds via `refunds.list` for the last 7 days, sum to
   `refunds_nzd` and count.
4. Pull open disputes via `disputes.list` filtered by
   `status in [needs_response, warning_needs_response, under_review,
   warning_under_review]`. Surface the response-due date for each.
5. Compute refund-to-revenue ratio and compare against the
   operator's threshold (default 2%).
6. Output a `stripe_summary` JSON block matching the schema in
   `business_pulse_briefs.cash_position.stripe`.
7. If any dispute is within 48 hours of its response deadline,
   add a flag for the `pulse-synthesis` skill to surface in the
   top three.

## Approval gates

Read-only. Any draft response to a dispute or any draft refund
explanation email is staged separately by `pulse-synthesis` and
held in Gmail drafts until the operator sends.

## References

- Stripe Payouts API: `https://docs.stripe.com/api/payouts`
- Stripe Disputes API: `https://docs.stripe.com/api/disputes`
- NZ Banking Ombudsman — chargeback guidance:
  `https://bankomb.org.nz/`
- assembl Business Pulse spec:
  `docs/handover/claude-for-small-business-2026-05-16.md`
