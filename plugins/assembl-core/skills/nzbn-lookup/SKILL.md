---
name: nzbn-lookup
description: |
  Fires when a user wants to verify a New Zealand Business Number (NZBN), look up
  an entity by name or NZBN, check if a company is active, find directors, confirm
  GST registration status, or verify business credentials before entering a contract
  or commercial relationship. Also fires when an agent needs to verify a business
  entity as part of onboarding, compliance screening, or due diligence.
  Trigger phrases: "NZBN", "company number", "business number", "is this company
  real", "verify the business", "check registration", "Companies Office", "company
  search", "director check", "GST number", "IRD number", "look up the entity",
  "active company", "registered business", "business verification".
mandatory: false
applies_to:
  - assembl-core
  - pikau
  - waihanga
  - manaaki
  - auaha
  - arataki
  - hoko
  - ako
  - toro
---

# NZBN Lookup & Business Verification — Core Skill

**Data sources**: NZBN Register (nzbn.govt.nz) + Companies Office Register (companiesoffice.govt.nz)  
**MCP server**: `mcp-nzbn` (assembl-core plugin); `mcp-companies-office` (assembl-core plugin)  
**Status**: Non-mandatory utility — fires on business verification requests

---

## When to use

Use this skill when:
- Verifying a business entity before entering a commercial relationship
- Checking if an NZBN is valid and the entity is active
- Looking up company directors or shareholders for due diligence
- Confirming a contractor's business registration before engaging their services
- Screening suppliers, customers, or counterparties for compliance purposes (AML/CFT onboarding)
- Verifying a building company's registration (WAIHANGA — LBP check follows separately)
- Verifying a freight broker or customs agent's registration (PIKAU — licensed broker check follows separately)

---

## What this skill will NOT do

- **Will NOT** access credit bureau data (Centrix, illion, Equifax NZ) — these require separate API keys and contracts; escalate to Kate
- **Will NOT** access Companies Office elevated-scope data (financial statements, charges register) without a Companies Office API key — these endpoints require authentication; returns clean error if key unset
- **Will NOT** verify IRD numbers or GST registration in real time — IRD myIR OAuth is not yet live; stub only
- **Will NOT** conduct full AML/CFT due diligence — assists with entity verification step only; a compliance officer must assess the full customer due diligence (CDD) requirement
- **Will NOT** access MFAT sanctions list directly — MFAT Sanctions MCP server is a stub; use this for NZBN/Companies Office data only
- **Will NOT** access foreign business registries — NZ entities only

---

## Tikanga check

- Business names that incorporate te reo Māori or claim Māori identity require careful handling — verify that the entity's registered name matches the te reo name used in context
- Do not make assumptions about iwi/hapū business ownership from a Companies Office record — beneficial ownership may differ from registered shareholders
- If the lookup is for an entity that presents as Māori-owned (e.g., Māori land incorporation, iwi authority, Māori Trust Board), note that special governance structures apply and the public register may not reflect full governance arrangements

---

## Privacy Act check

- Company information in the NZBN register is **publicly available information** — lookup is permissible under IPP 11(d) (publicly available information exception)
- **Director personal details** (residential addresses, if exposed): treat as personal information; do not log or store unless strictly necessary for the stated purpose
- **Shareholder details** in Companies Office: are public record, but beneficial ownership may involve individuals; apply IPP 8 (accuracy) and IPP 9 (retention) to any records created from the lookup
- **IRD numbers**: never log in plain text; classified RESTRICTED under Assembl data classification; mask in all outputs and audit records

---

## NZBN register — what it contains

The New Zealand Business Number (NZBN) is a unique 13-digit identifier assigned to every NZ business entity. The public register contains:

| Field | Available via public API | Notes |
|---|---|---|
| Entity name | ✓ | Registered legal name |
| NZBN | ✓ | 13-digit number |
| Entity type | ✓ | Company, sole trader, partnership, trust, incorporated society, etc. |
| Registration status | ✓ | Active, removed, struck off |
| Trading names | ✓ | Registered trading names |
| Physical/postal address | ✓ | Registered address |
| GST number | ✓ (if provided) | IRD-confirmed GST registration |
| Email/phone (primary) | ✓ (if provided) | |
| Directors/shareholders | ✓ (via Companies Office) | Separate Companies Office lookup |
| Incorporation date | ✓ | |
| Business classification (ANZSIC) | ✓ | Industry code |

---

## MCP tool calls — how to use

### verify_nzbn (mcp-nzbn)
```
tool: verify_nzbn
input:
  nzbn: "9429049000009"   # 13-digit NZBN
```
Returns: entity name, status, type, address, trading names  
Error if NZBN_API_KEY unset: returns "NZBN_API_KEY is not configured" — escalate to Kate to set the env var

### lookup_entity (mcp-nzbn)
```
tool: lookup_entity
input:
  query: "Assembl Ltd"     # search by name
  entity_type: "company"   # optional filter
```
Returns: list of matching entities with NZBN, status, address  
Note: name search is fuzzy — always confirm with the exact NZBN before relying on results

### lookup_company (mcp-companies-office)
```
tool: lookup_company
input:
  identifier: "9429049000009"  # NZBN or Companies Office company number
```
Returns: company name, status, incorporation date, registered office, director names  
Elevated-scope (financial statements, charges): returns "Companies Office API key required" — set CO_API_KEY env var

### lookup_director (mcp-companies-office)
```
tool: lookup_director
input:
  name: "Jane Smith"
  company_nzbn: "9429049000009"  # optional — narrows results
```
Returns: directorships held, appointment dates, resignation dates  
Note: returns publicly available information only; no residential addresses surfaced

---

## Workflow steps

1. **Receive** the business name or NZBN from the user
2. **Validate format**: NZBN must be 13 digits starting with 94
3. **Call** `verify_nzbn` if NZBN provided; `lookup_entity` if name only
4. **Confirm** entity status is ACTIVE — if struck off or removed, flag immediately
5. **Optional**: call `lookup_company` and `lookup_director` for director/shareholder detail (WAIHANGA due diligence, PIKAU broker verification)
6. **Apply** Privacy Act check to any personal information surfaced (director names, addresses)
7. **Draft** the verification summary for human review — do NOT rely solely on this for AML/CFT CDD decisions
8. **Stage** the output for human sign-off

---

## Common verification scenarios

### Contractor onboarding (WAIHANGA)
1. Verify NZBN is valid and entity is active
2. Confirm entity type (company vs. sole trader — affects liability and PPSR)
3. Look up directors — cross-reference with contract signatory
4. Note: LBP (Licensed Building Practitioner) verification requires separate lbp-register MCP server (Day 12)

### Customs broker verification (PIKAU)
1. Verify NZBN is valid and entity is active
2. Confirm entity is a registered customs broker — NZ Customs does not expose this via NZBN; direct check at customs.govt.nz/business required
3. Director lookup for due diligence on new broker relationships

### Supplier onboarding (general)
1. Verify NZBN — confirm active status
2. Confirm trading name matches the name on the contract/invoice
3. Note ANZSIC code — confirms business activity matches claimed service
4. Flag if entity has been removed or struck off (unpaid debts, dissolution)

---

## References

- NZBN register: https://www.nzbn.govt.nz
- NZBN API (integration services): https://www.nzbn.govt.nz/whats-changing/integration-services/
- Companies Office register: https://app.companiesoffice.govt.nz
- Companies Office API: https://www.business.govt.nz/services/business-data
- PPSR (Personal Property Securities Register): https://ppsr.govt.nz
- MBIE business information: https://www.mbie.govt.nz/business-and-employment/business/
- AML/CFT Act 2009 (CDD requirements): https://www.legislation.govt.nz/act/public/2009/0013
- Financial Intelligence Unit (FIU): https://www.police.govt.nz/advice-services/businesses-and-organisations/fiu
