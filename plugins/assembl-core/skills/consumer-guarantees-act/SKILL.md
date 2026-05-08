---
name: consumer-guarantees-act
description: |
  Fires whenever a request involves consumer rights, product quality, warranties,
  refunds, service standards, or fair trading. Also fires when a user is dealing
  with a customer complaint, a product/service dispute, a refund request, or
  wants to understand their obligations as a seller or service provider.
  Trigger phrases: "consumer rights", "warranty", "guarantee", "refund", "faulty",
  "not fit for purpose", "merchantable quality", "fair trading", "misleading",
  "deceptive", "repair replace refund", "returns policy", "service guarantee",
  "contractor liability", "fitness for purpose", "consumer complaint".
mandatory: false
applies_to:
  - assembl-core
  - manaaki
  - waihanga
  - auaha
  - hoko
  - ako
  - toro
---

# Consumer Guarantees Act 1993 & Fair Trading Act 1986 — Core Skill

**Statutes**: Consumer Guarantees Act 1993 (CGA) + Fair Trading Act 1986 (FTA)  
**Administrator**: Ministry of Business, Innovation and Employment (MBIE); Commerce Commission  
**Status**: Non-mandatory — fires on consumer transaction contexts

---

## When to use

Use this skill when:
- A business is selling goods or services to consumers (individuals acquiring for personal, domestic, or household use)
- A user asks about their obligations as a supplier of goods or services
- A consumer raises a complaint and the business needs to understand its obligations
- A user is drafting terms and conditions, returns policies, or service agreements
- A user asks about advertising, pricing, or promotional claims (FTA)
- A user is in a trade dispute about quality, fitness for purpose, or service standards

---

## What this skill will NOT do

- **Will NOT** provide legal advice on a specific dispute — recommend the user contact Citizen's Advice Bureau, a consumer lawyer, or the Disputes Tribunal
- **Will NOT** draft legally binding terms and conditions — assists with structure; a lawyer must review
- **Will NOT** determine whether a specific claim constitutes a CGA breach — this is a factual and legal assessment; recommend mediation or the Disputes Tribunal
- **Will NOT** represent the user in a Commerce Commission investigation or Disputes Tribunal proceeding
- **Will NOT** advise on consumer rights under sector-specific legislation (e.g., Credit Contracts and Consumer Finance Act 2003, Financial Markets Conduct Act 2013) — recommend specialist advice
- **Will NOT** advise on the Contracts and Commercial Law Act 2017 or Sale of Goods Act 1908 provisions that may modify CGA obligations — these are complex interactions; recommend a lawyer

---

## Tikanga check

- Ensure outputs are in plain English (or te reo Māori with macrons if requested) — accessible to all New Zealanders
- Do not use misleading language about Māori cultural product authenticity (e.g., "authentic Māori art") without proper provenance — this can breach both FTA s.9 and cultural IP protections
- If the consumer product or service is tied to Māori cultural identity, flag for tikanga-compliance skill

---

## Privacy Act check

- Consumer complaint handling involves personal information — IPP 5 (storage security) applies
- Do not share a complainant's personal details with third parties without consent (IPP 11)
- Records of complaints and resolutions should have a defined retention period and disposal plan (IPP 9)

---

## Consumer Guarantees Act 1993 — quick reference

### Goods guarantees (Part 1, ss.5–16)
Suppliers automatically guarantee that goods are:
- **Acceptable quality** (s.7) — fit for purpose, safe, durable, acceptable appearance/finish, free from defects
- **Fit for particular purpose** (s.8) — if a specific purpose was made known to the supplier
- **Match description** (s.9) — goods must match any description applied to them
- **Match sample or demonstration model** (s.10)
- **Acceptable price** (s.11) — where no price agreed, reasonable price applies
- **Spare parts and repair facilities available** (s.12) — for a reasonable period

### Services guarantees (Part 2, ss.28–34)
Suppliers automatically guarantee that services are:
- **Carried out with reasonable care and skill** (s.28)
- **Fit for particular purpose** (s.29)
- **Completed within a reasonable time** (s.30)
- **Supplied at a reasonable price** (s.31) — where no price agreed

### Remedies for goods (ss.18–25)
**If the failure is substantial (or cannot be remedied)**:
- Consumer can reject the goods and get a refund or replacement
- Consumer can seek compensation for consequential loss

**If the failure can be remedied** (is not substantial):
- Supplier must repair, replace, or refund (consumer's choice)
- Supplier has one opportunity to repair; if repair fails, consumer can reject

**Substantial failure** means the goods:
- Would not have been acquired by a reasonable consumer if they had known of the problem, or
- Are significantly below the standard a reasonable consumer would regard as acceptable, or
- Are unsafe

### Who the CGA applies to
- **Applies**: where a consumer acquires goods or services from a business for personal, domestic, or household use
- **Does NOT apply**: business-to-business transactions, commercial use, contracts where parties have contracted out lawfully

### Contracting out of CGA (s.43)
Parties in trade can contract out of the CGA where both parties are in trade AND it is fair and reasonable to do so. This requires an explicit written agreement. Cannot contract out of goods/services acquired for personal use.

---

## Fair Trading Act 1986 — quick reference

### Misleading and deceptive conduct (s.9)
No person in trade may engage in conduct that is misleading or deceptive, or likely to mislead or deceive. Key areas:
- False or misleading representations about goods/services (s.14)
- False or misleading representations about price (s.14(f))
- Unsubstantiated representations (s.12A) — must have reasonable grounds for any representation about goods/services

### Unfair contract terms (Part 2A, ss.26A–26K)
Since 16 August 2022, unfair contract terms in standard form consumer contracts are prohibited. An unfair term is void. Examples:
- Terms allowing one party to change price without allowing the other to cancel
- Terms allowing one party to terminate but not the other
- Terms that cap liability disproportionately

### Pricing
- Price must include GST (15%) in consumer-facing advertising (s.14(f))
- Drip pricing (adding fees at checkout) is misleading if the full price was not disclosed upfront

---

## Workflow steps

1. **Confirm** whether the transaction is B2C (CGA applies) or B2B (CGA may not apply)
2. **Identify** which guarantee is potentially in breach (goods quality, fitness, services, etc.)
3. **Assess** whether the failure is substantial or not (determines remedy options)
4. **Draft** the appropriate response: repair/replace/refund offer, or rejection of claim with reasons
5. **Check** any written terms for contracting-out clauses (must be lawful and fair)
6. **Flag** any FTA issues: misleading claims, unfair contract terms, pricing
7. **Recommend** Disputes Tribunal if the dispute cannot be resolved directly (for claims under $30,000; or $62,000 with agreement)
8. **Stage** the draft response for human sign-off before sending to the consumer

---

## References

- Consumer Guarantees Act 1993: https://www.legislation.govt.nz/act/public/1993/0091
- Fair Trading Act 1986: https://www.legislation.govt.nz/act/public/1986/0121
- MBIE consumer information: https://www.mbie.govt.nz/business-and-employment/business/consumer-protection/
- Consumer Protection NZ (consumer.govt.nz): https://www.consumer.govt.nz
- Commerce Commission: https://www.comcom.govt.nz
- Disputes Tribunal: https://www.disputestribunal.govt.nz
- Unfair contract terms guidance (MBIE): https://www.mbie.govt.nz/business-and-employment/business/fair-trading/unfair-contract-terms/
