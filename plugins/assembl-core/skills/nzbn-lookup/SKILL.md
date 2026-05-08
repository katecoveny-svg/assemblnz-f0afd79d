---
name: nzbn-lookup
description: |
  Fires when an agent needs to verify or look up a New Zealand business
  identity. Public NZBN register lookup via the `mcp-nzbn` MCP server.
  Director and company-record lookup via the `mcp-companies-office` MCP
  server. Returns entity name, type, status, addresses, industry
  classification, and (for director queries) directorships.

  Trigger phrases / contexts: "NZBN", "company number", "business
  number", "Companies Office", "company search", "director check", "is
  this business real", "verify the business", "supplier verification",
  "contractor onboarding", "due diligence", "AML/CFT entity check",
  "registered office", "ANZSIC code", "trading name".
mandatory: false
applies_to: ["*"]
---

# NZBN lookup — utility skill

## When to use

- Confirming that a business actually exists before entering a
  commercial relationship.
- Resolving a business name to its NZBN (the 13-digit identifier
  starting with 94).
- Pulling registered details: legal name, entity type, status, trading
  names, addresses, ANZSIC industry classification.
- Checking a person's directorships across NZ companies (basic public
  record only).
- Supporting AML/CFT entity-verification steps as part of customer
  due diligence.

## What this skill will NOT do

- Register entities. Entity registration goes through the Companies
  Office directly; the skill never lodges or files.
- Modify entity records. Read-only against the public register.
- Access non-public details (financial statements, charges register,
  beneficial-ownership detail beyond what is published).
- Replace a credit check or full AML/CFT screening. The skill is one
  signal in a wider customer-due-diligence process, not the whole of it.

## Tikanga check

Where the entity is a Māori business — Māori land trust, iwi authority,
Māori incorporation, hapū-owned company — apply mana whenua / iwi
protocol. Do not expose tribal commercial information publicly without
permission, even where it is technically on the public register.
Beneficial ownership for these entities often involves governance
structures the public register does not fully reflect; treat the
register output as a starting point, not the whole picture.

## Privacy Act check

NZBN data is public information, so lookup is permissible under the
publicly available information exception (IPP 11). However, **director
names** — and any director or shareholder addresses surfaced by the
Companies Office register — are personal information. Apply:

- IPP 1: only retrieve what the workflow needs.
- IPP 9: do not aggregate director profiles across companies into a
  private dataset that the directors have not been told about.
- IPP 11: do not redistribute personal details from the lookup beyond
  the workflow they were retrieved for.

Treat residential addresses and dates of birth (where exposed) as
sensitive even though they are technically public.

## Workflow steps

1. Receive an NZBN (13 digits, starts with 94) **or** a business name
   from the user.
2. For an NZBN, call the `mcp-nzbn` tool `verify_nzbn` for an existence
   check; for a name, call `lookup_entity` to resolve to NZBNs.
3. For full entity details, call `lookup_entity` with the NZBN — surface
   the verified entity name, entity type (Limited Company, Sole
   Trader, Partnership, Trust, Incorporated Society, etc.), status
   (Registered, Removed, Struck Off), industry classifications,
   trading names, registered offices, and primary contact where
   provided.
4. For director queries, call the `mcp-companies-office` tool
   `lookup_director` to find directorships across all NZ companies.
   Confirm scope with the user before pulling broad director profiles.
5. Stage the verification summary for human sign-off. The skill
   produces a draft note, not a yes-or-no decision on whether to
   transact with the entity.

### Common verification scenarios

- **Supplier onboarding**: verify NZBN, confirm active status, confirm
  trading name matches the invoice. Note ANZSIC classification — does
  it match the claimed service.
- **Contractor onboarding**: verify NZBN, confirm entity type
  (affects liability and PPSR), look up directors, cross-reference
  with the contract signatory.
- **Customs broker check**: verify NZBN and active status. Note that
  registered-broker status is held by NZ Customs, not the NZBN
  register; a separate Customs check is required.

## References

- NZBN public register: `https://www.nzbn.govt.nz/`
- NZBN integration services (API):
  `https://www.nzbn.govt.nz/whats-changing/integration-services/`
- Companies Office register:
  `https://companies-register.companiesoffice.govt.nz/`
- Companies Office API (business.govt.nz):
  `https://www.business.govt.nz/services/business-data`
- Personal Property Securities Register (PPSR):
  `https://ppsr.govt.nz`
- AML/CFT Act 2009:
  `https://www.legislation.govt.nz/act/public/2009/0013`
