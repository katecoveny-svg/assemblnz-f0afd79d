# Building Act 2004 & NZ Building Code — Index
# KB path: kb/nz/building-act-2004/index.md
# Version: 0.1 · 2026-04-12
# Last verified: 2026-04-12
# Source: MBIE Building Performance, legislation.govt.nz
# Primary kete: WAIHANGA (construction)
# Agents: WHAKAAĒ (consents), KAUPAPA (project mgmt), APEX (site ops), PAI (quality)

---

## Building Act 2004 overview

**Administered by:** Ministry of Business, Innovation and Employment (MBIE)
**Enforced by:** Building Consent Authorities (BCAs) — typically territorial authorities (councils)
**Purpose:** Regulate building work to ensure buildings are safe, healthy, and durable

---

## Building Code (Schedule 1, Building Regulations 1992)

### Clause index

| Clause | Title | Scope | Agents |
|--------|-------|-------|--------|
| **B1** | Structure | Structural stability, loads, foundations | ATA, APEX |
| **B2** | Durability | Minimum 5/15/50 year durability for building elements | PAI |
| **C1-C6** | Fire safety | Protection from fire, means of escape, fire spread | APEX |
| **E1** | Surface water | External moisture management (ground) | APEX |
| **E2** | External moisture | Weathertightness — cladding, windows, penetrations | APEX, PAI |
| **E3** | Internal moisture | Wet areas, condensation management | APEX |
| **F2** | Hazardous building materials | Asbestos, lead paint | ĀRAI |
| **F7** | Warning systems | Smoke alarms, fire alarms | APEX |
| **G4** | Ventilation | Natural and mechanical ventilation | APEX |
| **G12** | Water supplies | Potable water, backflow prevention | APEX |
| **G13** | Foul water | Drainage, sewage | APEX |
| **H1** | Energy efficiency | Insulation, glazing, heating | APEX, PAI |

### E2 External Moisture — critical detail

**E2/AS1** (Acceptable Solution) defines:
- **Risk matrix** based on wind zone × building height × roof/wall cladding type
- **Exposure zones**: LOW, MEDIUM, HIGH, VERY HIGH
- Cavity systems required for MEDIUM and above (direct-fix only for LOW risk)
- **ĀRAI and PAI agents extract exposure zone decisions into shared_context as `code_decision.E2`**

---

## Licensed Building Practitioners (LBPs) — s281-s315

### LBP licence classes

| Class | Scope | Agent |
|-------|-------|-------|
| **Carpentry** | Structural timber framing, cladding, joinery installation | APEX |
| **Design** (1, 2, 3) | Building design by complexity. Design 1 = simple, Design 3 = complex/multi-storey | ATA, WHAKAAĒ |
| **External Plastering** | EIFS, plaster cladding systems | PAI |
| **Foundations** | Concrete foundations, piles | APEX |
| **Roofing** | Roof coverings and flashings | APEX |
| **Site** (1, 2, 3) | Site management by complexity | APEX |

### Restricted building work (RBW)
- Defined in Schedule 2, Building (Designation of Building Work) Order 2013
- **Must** be carried out or supervised by an LBP in the relevant class
- Applies to: primary structure, external moisture management, fire safety systems
- Record of work required from every LBP upon completion (s88)

---

## Building consent process

### Steps (WHAKAAĒ agent workflow)

1. **Pre-application meeting** (optional but recommended for complex builds)
2. **Application** — submit plans, specifications, producer statements (if available)
3. **Processing** — BCA has **20 working days** to grant or refuse (s49)
4. **Granting** — consent valid for **12 months** (lapsing date, extendable under s52)
5. **Inspections** — at key stages per consent conditions
6. **CCC application** — within **2 years** of code compliance being achieved (s93)

### Common inspection stages

| Stage | What's checked | Code clauses |
|-------|---------------|--------------|
| **Foundation** | Excavation, reinforcing, pile positions | B1 |
| **Pre-slab** (if applicable) | Under-slab insulation, DPM, services | B1, H1 |
| **Framing** | Timber sizes, fixings, bracing, openings | B1, E2 |
| **Pre-line** | Insulation, vapour barriers, services rough-in | H1, G4, G12 |
| **Post-line** | Lining, wet area waterproofing | E3, F7 |
| **Pre-clad** | Cavity drainage, window flashings, wrap | E2 |
| **Final** | Completed works, compliance schedule items | All |

---

## Producer statements

| Type | Issued by | Confirms |
|------|-----------|----------|
| **PS1** — Design | Engineer/designer | Design complies with Building Code |
| **PS2** — Manufacturer | Product manufacturer | Product meets specifications |
| **PS3** — Construction review | Engineer/designer | Construction matches design |
| **PS4** — Construction | LBP/contractor | Work carried out per plans and specifications |

**Note:** Producer statements are NOT mandatory but provide evidence of compliance. BCAs may request them as part of CCC application.

---

## Code Compliance Certificate (CCC) — s91-s95

- Applied for by building consent holder
- BCA must issue if satisfied building work complies
- **Must be applied for within 2 years** of code compliance being achieved
- BCA has **20 working days** to issue or refuse
- Without CCC: compliance schedule items not legally activated, building may not be occupied/used

### CCC documentation checklist (WHAKAAĒ auto-generates)
- [ ] All inspection records from BCA
- [ ] Producer statements PS1-PS4 (as applicable)
- [ ] Record of work from every LBP
- [ ] As-built drawings (plumbing, drainage, structural amendments)
- [ ] Energy work certificate (if electrical work)
- [ ] Specialist reports (geotechnical, fire, acoustic — if required)
- [ ] Compliance schedule (for specified systems: fire alarms, sprinklers, lifts, HVAC)

---

## Construction Contracts Act 2002 (CCA) — KAUPAPA agent

### Payment claims — s20-s23
- Any party may serve a **payment claim** at any time
- Responding party has **20 working days** to issue a **payment schedule** (s22)
- If NO payment schedule is issued within 20 working days → claimed amount **becomes due** (s23)
- Payment due on the date specified in the claim or **20 working days** after claim served

### Retentions — s18A-s18I (2023 amendment)
- **Retentions must be held on trust** by the payer (s18C)
- Retention money must be held in a bank account or bond
- Party holding retentions must keep **records** identifying each payee's retention
- Retentions are NOT available to other creditors if holder becomes insolvent
- **KAUPAPA agent tracks retention trust compliance in shared_context as `project.retentions.trust_compliant`**

### Dispute resolution — s25-s71
- **Adjudication** — binding interim determination (s46)
- Must refer to adjudication within 12 months of dispute arising
- Adjudicator has 20 working days to determine (extendable)

---

## Healthy Homes Standards (Residential Tenancies Act 1986, Part 2A)

Relevant when Waihanga agents advise on rental property construction:

| Standard | Requirement | Agent |
|----------|-------------|-------|
| Heating | Fixed heater in main living room (min 1.5kW per 15m²) | APEX |
| Insulation | Ceiling R3.3, underfloor R1.3 (or existing R1.4 ceiling) | APEX, PAI |
| Ventilation | Extractor fans in kitchen, bathroom, en-suite | APEX |
| Moisture/drainage | Efficient drainage, no puddles under floor | APEX |
| Draught stopping | Block unused chimneys, seal gaps | APEX |

---

## Record-keeping requirements

| Record | Retention period | Reference |
|--------|-----------------|-----------|
| Building consent + plans | Life of building | s216 BA 2004 |
| Record of work (LBP) | 10 years minimum | s88 BA 2004 |
| Inspection records | Life of building | BCA obligation |
| Payment claims + schedules | 7 years (tax minimum) | CCA 2002 + ITA 2007 |
| Retention trust records | Until retentions fully released | s18F CCA |
| Producer statements | Life of building | Best practice |
| Compliance schedule | Life of building | s100 BA 2004 |

---
