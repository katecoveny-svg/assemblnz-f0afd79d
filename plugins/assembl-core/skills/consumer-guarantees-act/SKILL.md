---
name: consumer-guarantees-act
description: |
  Fires on consumer transactions, retail interactions, refund and exchange
  queries, advertising claims, terms-of-service drafting, customer-complaint
  responses, and pricing decisions involving consumer protection. Provides
  a Consumer Guarantees Act 1993 + Fair Trading Act 1986 quick reference
  for drafting only — no legal advice, no binding contracts, no signed
  commitments.

  Trigger phrases / contexts: "refund", "exchange", "return", "warranty",
  "guarantee", "faulty", "not fit for purpose", "merchantable quality",
  "acceptable quality", "fair trading", "misleading", "deceptive",
  "repair, replace, refund", "returns policy", "service guarantee",
  "consumer rights", "consumer complaint", "T&Cs", "terms and conditions",
  "advertising claim", "drip pricing", "unfair contract term".
mandatory: false
applies_to: ["manaaki", "hoko", "auaha", "ako", "*"]
---

# Consumer Guarantees Act 1993 + Fair Trading Act 1986 — quick reference skill

## When to use

- Drafting customer-facing terms and conditions, refund policies, returns
  policies, or service agreements.
- Drafting marketing or advertising claims about goods or services.
- Responding to a customer complaint about goods or services.
- Pricing decisions that involve consumer protection (drip pricing,
  promotional claims, comparative advertising).
- Reviewing existing customer-facing copy for CGA / FTA risk.

## What this skill will NOT do

- Provide legal advice. Outputs are working drafts only.
- Determine whether a specific transaction breaches the CGA. The skill
  surfaces the relevant guarantees and remedies; a human assesses fact
  and law.
- Draft binding contracts. Drafts go to a lawyer for review before use.
- Sign anything on behalf of the user.
- Commit to a refund, replacement, or repair without the business
  owner's approval.

## Tikanga check

The four pou apply to customer relationships. Manaakitanga is the most
relevant pou here — even in dispute, language toward a customer should
be welcoming, respectful, and generous. Whanaungatanga matters when the
customer is a returning relationship rather than a one-off transaction:
acknowledge the relationship in the tone, not just the transaction.

Where the customer or the product carries Māori cultural identity,
defer to the tikanga-compliance skill before publishing copy.

## Privacy Act check

Customer dispute information is personal information. IPP 5 (storage and
security) applies to the complaint record. IPP 11 (disclosure) applies
when the complaint is referred to a third party (insurer, supplier,
Disputes Tribunal). Set a retention rule under IPP 9 — complaint
records are not kept indefinitely.

## Workflow steps

### CGA goods guarantees (Consumer Guarantees Act 1993)

- **s.6 Acceptable quality** — goods must be fit for purpose, safe,
  durable, free from minor defects, and acceptable in appearance and
  finish, judged against what a reasonable consumer would expect.
- **s.7 Fitness for particular purpose** — where the consumer makes a
  particular purpose known to the supplier, the goods must be fit for
  that purpose.
- **s.8 Supply by description** — the goods must match the description.
- **s.9 Supply by sample** — the goods must match the sample or
  demonstration model.
- **s.10 Reasonable price** — where no price has been agreed, the
  consumer pays a reasonable price.

### CGA service guarantees

- **s.28 Reasonable care and skill** — services must be carried out
  with reasonable care and skill.
- **s.29 Fitness for particular purpose** — services and any product
  resulting must be reasonably fit for the particular purpose made
  known.
- **s.30 Reasonable price** — where no price has been agreed.
- **s.31 Reasonable time** — where no time for completion has been
  agreed.

### FTA misleading and deceptive conduct (Fair Trading Act 1986)

- **s.9** — no person in trade may engage in conduct that is
  misleading or deceptive, or likely to mislead or deceive.
- **s.10** — misleading conduct in relation to goods.
- **s.11** — misleading conduct in relation to services.
- **s.13** — false or misleading representations.

Plus s.12A (unsubstantiated representations — must have reasonable
grounds for any representation about goods or services) and the unfair
contract terms regime (Part 2A) for standard-form consumer contracts.

### Remedies hierarchy

For goods or services where the failure can be remedied:

1. **Repair** — supplier's first opportunity to put it right.
2. **Replace** — where repair fails or is not practical.
3. **Refund** — where repair and replacement are not practical, or
   where the consumer rejects the goods after a failed repair.

### Failure of substantial character test

A failure is "substantial" (entitling the consumer to reject the goods
outright and choose refund or replacement) where the goods:

- Would not have been acquired by a reasonable consumer fully
  acquainted with the nature and extent of the failure, or
- Depart in one or more significant respects from the description, or
- Are substantially unfit for the purpose for which goods of the type
  are commonly supplied, or
- Are not of acceptable quality because they are unsafe.

For services, "substantial" applies where the service has not been
carried out with reasonable care and skill in a way that significantly
reduces its value.

### Drafting pattern

1. Identify whether the transaction is B2C (CGA applies) or B2B
   (CGA may not apply; lawful contracting-out may have happened).
2. Identify the guarantee in scope.
3. Identify whether the failure is substantial or remediable.
4. Draft the response, with the remedy hierarchy reflected.
5. Stage for human sign-off before sending to the customer.

## References

- Consumer Guarantees Act 1993:
  `https://www.legislation.govt.nz/act/public/1993/0091`
- Fair Trading Act 1986:
  `https://www.legislation.govt.nz/act/public/1986/0121`
- MBIE Consumer Protection guidance:
  `https://www.mbie.govt.nz/business-and-employment/business/consumer-protection/`
- Consumer Protection NZ: `https://www.consumer.govt.nz`
- Commerce Commission: `https://www.comcom.govt.nz`
- Disputes Tribunal: `https://www.disputestribunal.govt.nz`
