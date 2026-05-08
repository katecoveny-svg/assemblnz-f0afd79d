---
name: hoko-domain
description: |
  Hoko is the assembl kete for retail and e-commerce — store owners,
  online retailers, marketplaces, and direct-to-consumer brands. This
  stub covers the broad domain: Consumer Guarantees Act 1993 + Fair
  Trading Act 1986 + Privacy Act 2020 as they apply to retail, distance
  selling, returns and refund policies, and customer-data handling.
  Full skill bodies will be written when a pilot customer is assigned
  to Hoko.

  STATUS: scaffold — full skill body deferred until pilot customer
  assigned to this kete.

  Trigger phrases / contexts: "returns policy", "refund", "exchange",
  "online store", "e-commerce", "checkout", "T&Cs",
  "terms and conditions", "privacy policy", "shipping rates",
  "drip pricing", "marketplace", "Shopify", "WooCommerce",
  "loyalty programme", "gift card", "click and collect",
  "distance selling", "abandoned cart".
mandatory: false
applies_to: ["hoko"]
---

# Hoko — domain stub skill

**STATUS**: scaffold — full skill body deferred until pilot customer
assigned to this kete.

## When to use

This is the broad-strokes Hoko domain skill, used when a workflow
falls inside retail or e-commerce but no narrower skill exists yet.
Typical contexts:

- Drafting returns, refund, and exchange policies that comply with
  the CGA + FTA.
- Drafting customer-facing terms and conditions, shipping policies,
  and privacy policies.
- Reviewing pricing and promotional claims for FTA s.9
  (misleading conduct) and drip-pricing risk.
- Drafting customer-complaint responses where a CGA guarantee may
  be in scope.
- Reviewing checkout, account, and marketing flows for Privacy Act
  2020 compliance — IPP 1 minimisation, IPP 3 collection notice
  (and IPP 3A for indirectly collected data, effective 1 May 2026).

## What this skill will NOT do

- Provide legal advice. Outputs are working drafts only — they go
  to the retailer and, where appropriate, a commercial lawyer.
- Sign or commit a customer to a refund, exchange, or store credit
  on the retailer's behalf. The retailer authorises.
- Issue a chargeback decision. The retailer's payment processor
  and the cardholder's issuer decide chargebacks.
- Lodge complaints with the Commerce Commission or the Disputes
  Tribunal on the retailer's behalf.
- Approve a marketing claim for release. The retailer signs off
  the claim; the skill flags risk.

## Tikanga check

Retail in Aotearoa includes Māori-owned businesses, Māori products,
and products that draw on mātauranga Māori or Māori imagery.

- Defer to the assembl-core `tikanga-compliance` skill on every
  customer-facing piece of copy — product descriptions, marketing
  emails, social posts, push notifications.
- Where the product is sourced from a Māori artist, business, or
  collective, ensure provenance and credit are clearly stated;
  manaakitanga in tone and whanaungatanga in attribution.
- Where the product uses te reo Māori in its name or description,
  defer to a kaitiaki / Te Hiku Media. Do not invent te reo
  branding.
- Reserved taonga terms (moko, haka, etc.) are not used as product
  names.

## Privacy Act check

Retail and e-commerce are heavy personal-information environments:
account creation, order history, payment-method records (do not
store the card data; PCI-DSS scope), shipping addresses, marketing
consent, loyalty programmes, abandoned-cart retargeting.

Apply:

- IPP 1 — collect only what is needed for the order and the
  account.
- IPP 3 — display a clear collection notice at the form, not buried
  in a 12-page T&Cs document.
- IPP 3A — for indirectly collected data (e.g. fraud-screening
  signals from a third party), give notice at first use, effective
  1 May 2026.
- IPP 5 — encryption at rest and in transit; least privilege on
  the order database.
- IPP 11 — disclose to fulfilment partners only what each needs
  (the courier does not need the customer's date of birth).
- IPP 12 — many e-commerce backends and ad platforms are offshore;
  document the cross-border safeguards.

## Workflow steps

For any Hoko workflow:

1. Identify the deliverable (policy, response, marketing claim,
   product page, account-flow design).
2. Apply the assembl-core mandatory skills first
   (`tikanga-compliance` on every customer-facing piece;
   `nz-privacy-act-2020` on any personal information).
3. Apply the relevant statute lens — CGA for goods and service
   guarantees, FTA for advertising and unfair contract terms,
   Privacy Act for data flows, Credit Contracts and Consumer
   Finance Act 2003 if the retailer offers credit.
4. Stage the draft for the retailer to approve and publish.

Full workflow detail to follow when a Hoko pilot customer is
assigned.

## References

- Consumer Guarantees Act 1993:
  `https://www.legislation.govt.nz/act/public/1993/0091/latest/whole.html`
- Fair Trading Act 1986:
  `https://www.legislation.govt.nz/act/public/1986/0121/latest/whole.html`
- Privacy Act 2020:
  `https://www.legislation.govt.nz/act/public/2020/0031/latest/whole.html`
- Credit Contracts and Consumer Finance Act 2003:
  `https://www.legislation.govt.nz/act/public/2003/0052/latest/whole.html`
- Consumer Protection NZ:
  `https://www.consumer.govt.nz`
- Commerce Commission:
  `https://www.comcom.govt.nz`
- Disputes Tribunal:
  `https://www.disputestribunal.govt.nz`
