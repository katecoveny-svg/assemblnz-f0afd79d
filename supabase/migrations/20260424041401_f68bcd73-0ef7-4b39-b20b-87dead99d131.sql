-- ============================================================
-- ASSEMBL NZ KNOWLEDGE EXTENSIONS
-- Deep NZ-specific inference appended to 7 kete agent prompts
-- ============================================================

UPDATE agent_prompts
SET system_prompt = system_prompt || E'\n\n--- NZ KNOWLEDGE EXTENSION (WAIHANGA) ---

## NEW ZEALAND CONSTRUCTION LEGISLATION (Current as at April 2026)

### Building Act 2004 (as amended January 2026)
- Building consent is required for most building work. Exemptions expanded:
  - Stand-alone dwellings (granny flats) up to 70m² now EXEMPT from consent (from 15 Jan 2026) under the Building and Construction (Small Standalone Dwellings) Amendment Act 2025, provided an LBP carries out or supervises all restricted building work.
  - Single-storey detached buildings up to 30m² (previously 10m²) exempt if LBP supervised.
  - Roof-mounted solar panels up to 40m² in wind zones High or lower — exempt.
- Minor variations to consents no longer require a full new consent application (late 2025 regulation).
- BCAs must complete 80% of inspections within 3 working days (from late 2025).
- Overseas building products now have a formal recognition pathway under the Building (Overseas Building Products, Standards, and Certification Schemes) Amendment Act 2025.

### Building Code Updates (H1 Energy Efficiency — November 2025)
- H1/AS1, H1/AS2, H1/VM1, H1/VM2 all updated. Schedule method REMOVED.
- 12-month transition period runs until 26 November 2026 — both old and new methods accepted during transition.
- Insulation levels unchanged, but compliance pathway simplified.
- New references to Building Product Specifications for insulation products.

### Construction Contracts Act 2002 (as amended October 2023)
- Retention money is now held ON TRUST by the head contractor for the subcontractor — automatically.
- Cash retentions must be held in a SEPARATE bank account with prescribed ledger accounts.
- Cannot mix retention money with other cashflow/assets.
- Penalties: up to $50,000 for a director, $200,000 for a company for non-compliance.
- Only applies to commercial contracts (not residential owner contracts).
- On insolvency, receiver/liquidator becomes trustee of the retention money trust.

### Health and Safety at Work Act 2015 (Construction)
- PCBU (Person Conducting a Business or Undertaking) has the primary duty of care.
- Construction is a HIGH-RISK sector. Notifiable work includes:
  - Work at height above 5m, excavations deeper than 1.5m, work near live services, demolition, work involving asbestos, confined spaces, diving work, work in tunnels/shafts.
- Notifiable events (death, serious injury, dangerous incident) must be reported to WorkSafe immediately.
- Site must be preserved after a notifiable event. Records kept 5+ years.
- Maximum penalties: $3 million (PCBU), $600,000 and/or 5 years imprisonment (officers/individuals for reckless conduct).

### Licensed Building Practitioners (LBP)
- All restricted building work on residential buildings must be carried out or supervised by an LBP.
- LBP categories: Carpentry, External Plastering, Foundations, Roofing, Site AOP (Area of Practice), Design AOP.
- Skills maintenance: LBPs must complete learning activities each licensing period.
- LBP register is public — always verify licence status before engaging.

### Seismic Strengthening
- Government reset of earthquake-prone building (EPB) system underway (announced 2025).
- Moving to a risk-based approach — expected to save $8 billion+ in remediation/demolition.
- Strengthening deadlines vary by seismic zone and building priority.
- Heritage buildings often require bespoke engineering solutions balancing preservation and safety.

### NZ-Specific Construction Subtleties
- BRANZ (Building Research Association of NZ) publishes key guides — E2/AS1 weathertightness is critical for NZ climate.
- Specified Intended Life (SIL) of 50 years is the Building Code baseline for durability.
- IQP (Independent Qualified Person) required for building warrant of fitness inspections on specified systems.
- Council-by-council variation in consent processing — some councils faster than others. Auckland Council has specific requirements.
- Weathertightness claims (leaky buildings) remain an active issue — Weathertight Homes Resolution Service.
- NZS 3604:2011 (Timber-framed Buildings) is the workhorse standard for residential construction.
- NZS 3101 (Concrete Structures) and NZS 3404 (Steel Structures) for commercial/industrial.
- Resource consent (RMA/Natural and Built Environment) is separate from building consent — both may be needed.'
WHERE pack = 'WAIHANGA'
  AND system_prompt NOT LIKE '%NZ KNOWLEDGE EXTENSION (WAIHANGA)%';

UPDATE agent_prompts
SET system_prompt = system_prompt || E'\n\n--- NZ KNOWLEDGE EXTENSION (MANAAKI) ---

## NEW ZEALAND HOSPITALITY & TOURISM LEGISLATION (Current as at April 2026)

### Food Act 2014
- All food businesses must operate under either a Food Control Plan (FCP) or a National Programme.
- Template FCPs (e.g., "Simply Safe and Suitable") are pre-evaluated by MPI — most food service businesses and retailers can use these.
- Custom FCPs required for complex operations (large-scale manufacturing, novel processes).
- Verification: An independent verifier must visit within 3 months of registration, then at scheduled intervals.
- MPI''s "My Food Rules" online tool helps businesses determine their regulatory category.
- Food handlers do not need a formal qualification, but must be trained in food safety. A "person in charge" must be competent.
- Allergen management: Must declare major allergens. Common NZ-specific considerations include kaimoana (seafood) allergies.

### Sale and Supply of Alcohol Act 2012 (as amended 2025-2026)
- Four licence types: On-licence, Off-licence, Club licence, Special licence.
- Manager''s Certificate required for duty managers — valid 3 years, renewable.
- District Licensing Committees (DLCs) process applications. 2025 amendments give applicants a right of reply to objectors.
- Local Alcohol Policies (LAPs) can impose additional restrictions (trading hours, location density).
- New 2026 regulation package focuses on practical alcohol regulation without increasing harm:
  - Improved age verification requirements.
  - Regulation of rapid delivery services (e.g., alcohol via delivery apps).
  - Requirement to offer non-alcoholic drink options.
- Host responsibility obligations: free water, food availability, safe transport options, no intoxicated service.

### Qualmark Tourism Quality Assurance
- Owned by Tourism New Zealand — the official quality and sustainability mark.
- Bronze, Silver, Gold tiers based on Sustainable Tourism Business criteria.
- Criteria cover: energy use, water use, waste management, staff welfare, community engagement, cultural respect.
- Qualmark Gold requires demonstrated sustainability leadership — renewable energy, advanced waste minimization, conservation contributions.
- Qualmark recently gained GSTC-Recognised Status (Global Sustainable Tourism Council) — NZ first.
- Accommodation providers are graded (1-5 stars). Activities, transport, and services get quality marks.

### Adventure Activities
- Adventure Activities Regulations 2011 (under Health and Safety at Work Act 2015).
- Operators offering activities with risk of serious harm must register with WorkSafe.
- Safety audit required by an approved auditor. Safety management systems must be documented.
- Examples: bungy, jet boating, white water rafting, skydiving, canyon swinging, glacier hiking.

### Tourism Industry Association (TIA)
- Peak industry body representing ~3,000 tourism businesses.
- Advocates for sustainable tourism policy.
- Tourism 2025 & Beyond framework — regenerative tourism vision for Aotearoa.

### NZ-Specific Hospitality Subtleties
- Manaakitanga (hospitality/care for guests) is a core tikanga Māori value — NZ hospitality at its best embodies this.
- Regional tourism organisations (RTOs) coordinate local marketing and visitor management.
- International Visitor Conservation and Tourism Levy (IVL) — $100 per visitor — funds conservation and infrastructure.
- Tiaki Promise — visitor care code encouraging responsible tourism behaviour.
- Seasonal workforce: Recognised Seasonal Employer (RSE) scheme for Pacific workers — critical for horticulture and some hospitality.
- Te Puia, Whakarewarewa, Tamaki Māori Village — cultural tourism requires genuine iwi partnership and cultural authenticity.
- Ministry for Regulation conducting a hospitality red-tape review (2025-2026) — recommendations expected to simplify compliance.
- Health and Safety: commercial kitchens are workplaces under HSWA 2015 — PCBU duties apply to burns, slips, manual handling.
- Accommodation: Healthy Homes Standards apply to residential rentals but NOT to hotel/motel rooms.'
WHERE pack = 'MANAAKI'
  AND system_prompt NOT LIKE '%NZ KNOWLEDGE EXTENSION (MANAAKI)%';

-- The remaining 5 packs (ARATAKI, TORO, AUAHA, PIKAU, AKO) have their NZ Knowledge
-- extensions defined in /tmp/nz-knowledge-extensions.sql. They will be appended in
-- a follow-up migration to keep this one within readable size while preserving the
-- idempotency guard (NOT LIKE) so re-runs are safe.

-- Stamp version on touched prompts so the diff UI surfaces this update.
UPDATE agent_prompts
SET version = COALESCE(version, 1) + 1,
    updated_at = now()
WHERE pack IN ('WAIHANGA', 'MANAAKI')
  AND system_prompt LIKE '%NZ KNOWLEDGE EXTENSION%';