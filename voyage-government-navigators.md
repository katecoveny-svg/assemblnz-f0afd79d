# Voyage — Government Navigators

Strategy note on building agents that **government agencies** (Ministry
of Education, Ministry of Social Development, Inland Revenue, Oranga
Tamariki, Te Whatu Ora, MBIE) could actually adopt and use — and the
case for spinning it as a separate sub-business under common ownership.

---

## 1. The clear thesis

**Spin it as a separate entity. Common shareholding, common values,
arms-length brand.** Working title: **Pae** — *the threshold*. Pae works
on the public side of the threshold; Assembl works on the private side.

Why a separate entity and not a division:

- **Procurement.** Crown agencies cannot do business with a company that
  also serves their adversaries (a privately-held company is the
  *adversary* in a beneficiary dispute, a customs dispute, an Oranga
  Tamariki matter). A separate entity with a published conflict-of-
  interest charter solves this on day one.
- **Sovereignty.** Pae should be majority Māori-owned and / or Crown-
  partnered. Assembl can be a 30–49% shareholder; the controlling stake
  belongs to a Māori entity (an iwi PSGE, Whaikaha, or a charitable
  trust). This isn't optics — it's the only structure that earns
  trust with iwi-led agencies and Treaty-aligned policy work.
- **Risk posture.** Crown work has different risk appetite. Pae can
  carry higher indemnity, ISO 27001 + SOC 2 certifications, and an
  Authority to Operate (ATO) under the All-of-Government Information
  Security Manual that Assembl doesn't need.
- **Sales motion.** Assembl sells per-seat to operators. Pae sells
  per-citizen-served to agencies. Different revenue model, different
  contract length (3–5 year master services agreements vs. monthly
  subscriptions), different sales cycle (12–18 months vs. 2 weeks).
- **Brand.** Assembl is the assembly behind a one-person practice. Pae
  is the navigator standing on the threshold of a government office
  with citizens. They share a parent, they share a stack, they do not
  share a logo.

The technical stack is shared: Mana Trust Layer, evidence packs, hash-
chain audit, reasoning ledger. Pae is the brand, the contracts, the
certifications, the user-facing surfaces. Assembl is the engine room.

---

## 2. The four anchor agencies

For each: what problem we solve, what their current pain is, the
practical first agent, and the procurement vehicle that gets us in.

### 2.1 Ministry of Social Development — MSD / Work and Income

- **Problem.** Beneficiaries miss entitlements. MSD officers spend the
  bulk of their time on form-completion and eligibility-checking, not
  on the relational and decision-making work the job actually requires.
- **Their pain.** Welfare reform fatigue. Falling staff retention. The
  *Future of Public Services* programme has explicit AI funding lines.
- **First agent — "Manaakitanga Navigator".** Continuously scans a
  beneficiary's record for entitlements they *aren't* claiming —
  Disability Allowance, Temporary Additional Support, Best Start,
  hardship grants. Drafts the application. The case manager approves
  and signs.
- **Evidence pack.** *Whakatutuki* · Entitlement posture pack —
  exportable for the beneficiary, hash-chained for MSD's record.
- **Procurement vehicle.** All-of-Government (AoG) ICT Services panel
  + the *Innovation Marketplace* (mGCDO sandbox). MSD also has a
  *Digital Channels* renewal cycle in 2026.

### 2.2 Inland Revenue — IRD

- **Problem.** Half of working-for-families recipients are paid the
  wrong amount because their declared income doesn't match reality.
  IRD spends ~$40m/yr on rework. Beneficiaries spend ~7m hours/yr on
  their tax affairs.
- **Their pain.** START programme deployment is done; appetite for
  citizen-facing AI is high; Commissioner has publicly named AI as a
  2027 priority.
- **First agent — "Tauira Tāke".** Continuous bank-feed and PAYE scan
  for changes that affect tax position. Drafts the IR3 / IR526 / WFF
  income re-estimate. The IRD officer (or the citizen's accountant)
  approves.
- **Evidence pack.** *Tūāpapa Tāke* · Tax posture pack with citations
  to TAA and ITA.
- **Procurement vehicle.** IRD's *Te Pou* small-business-engagement
  programme has direct contract authority below $100k; above that,
  AoG ICT Services panel.

### 2.3 Ministry of Education — MoE / Studylink + ECE

- **Problem.** Studylink eligibility is one of the most error-prone
  government workflows. Course-related-costs miscalculation, allowance-
  vs-loan confusion, family-income recalculations mid-year. ECE
  funding declarations are similarly error-prone — centres claim
  incorrectly and have to repay.
- **Their pain.** Studylink call-centre volume is the highest-cost
  channel. ECE has just finished restructuring; appetite for tooling
  is real. Aotearoa New Zealand Curriculum refresh is also live.
- **First agent — "Pae Ako".** For students: continuous eligibility
  monitoring across allowance, loan, course costs, accommodation
  benefit, and parental income. For ECE centres: draft funding
  declarations against attendance data and licensing requirements.
- **Evidence pack.** *Pae Mātauranga* · Funding posture pack.
- **Procurement vehicle.** MoE has a *Digital Services for Students*
  programme with direct authority; ECE goes through the *Education
  System Lift* programme.

### 2.4 Oranga Tamariki

- **Problem.** Frontline social workers spend ~60% of their time on
  case documentation. The Royal Commission of Inquiry into Abuse in
  Care recommended substantial improvements in record-keeping
  integrity — exactly what hash-chained evidence packs provide.
- **Their pain.** Workforce retention crisis. Inquiry recommendations
  unfunded but politically mandatory.
- **First agent — "Kaitiaki Mātāmua".** Drafts case-record entries
  from a kaimahi's voice notes, scans for safety patterns across the
  whānau record, prepares the Family Group Conference brief. Always
  to a queued draft for the named worker to approve and sign.
- **Evidence pack.** *Whakapapa Take* · Case posture pack —
  court-admissible record with Evidence Act 2006 s 137 integrity.
- **Procurement vehicle.** OT has a *Digital Practice Tools* programme
  and a long-standing partnership with Tūhono Whānau iwi services.
  This one needs iwi sponsorship explicitly — the user-research and
  pilot must run through an iwi-led entity.

---

## 3. What the Crown actually requires

This is the procurement and certification stack that gets Pae onto a
government contract. None of it is optional.

### 3.1 Certifications (the table-stakes set)

| Cert / framework                              | Why                                  | Effort       |
| --------------------------------------------- | ------------------------------------ | ------------ |
| **NZISM** (NZ Information Security Manual)    | Mandatory for any Crown cloud system | 6–9 months   |
| **NZ Cloud Computing Code of Practice**       | All-of-Government cloud expectation  | 3 months     |
| **Privacy Act 2020 / IPP-aligned PIA**         | Per-deployment privacy impact assessment | 4–6 weeks per agency |
| **Cloud Services Conformance** (Cabinet rule) | For SaaS sold to agencies            | Audit cycle  |
| **ISO 27001:2022**                            | Procurement gatekeeper at scale      | 9–12 months  |
| **SOC 2 Type II**                             | Required by many agencies            | 12 months    |
| **AAAIP alignment**                           | Aotearoa Agentic AI Platform pilot   | Already underway |
| **MEADS test framework**                      | Māori data sovereignty assessment    | Embed in PIA |
| **Te Tiriti o Waitangi impact statement**     | Cabinet expectation for AI tooling   | Per deployment |

Cost envelope for the table-stakes set: **NZD 280k–450k** over the first
12 months, plus ongoing audit costs of ~$60k/year.

### 3.2 Government procurement pathway

Pae's go-to-market sequence:

1. **mGCDO Innovation Marketplace** — apply for the sandbox programme;
   gives 8–12 weeks of paid pilot access to one agency. ~$30k. No long-
   term commitment required.
2. **AoG ICT Services Panel** — once a sandbox lands, apply to the
   panel under the *Digital Advisory* or *Software Services* schedule.
   12-month application cycle; once on, every agency can call off
   directly.
3. **Master Services Agreement (MSA)** with anchor agency. 3-year
   initial term, two 2-year extensions. Usually $1–4m/year per
   agency at this maturity.
4. **Cross-agency adoption.** Once MSD adopts, MoE and OT will
   follow because the integrations and the PIA pass-through is
   already done.

The mGCDO programme is the wedge. Apply in Q3 2026.

### 3.3 The 12-week plan to first MoU

**Weeks 1–2 — Incorporation.**
- Register Pae Ltd, NZBN.
- Shareholders agreement: Assembl Ltd 30–49%, iwi PSGE / Whaikaha
  majority, charitable trust 10%.
- Board: 5 seats — 2 Assembl, 2 iwi/Crown, 1 independent.
- Conflict-of-interest charter drafted and published.

**Weeks 3–4 — Compliance kickoff.**
- Engage Tomizone (NZISM auditor) for gap analysis.
- Engage Privacy Commissioner liaison for PIA template review.
- Begin ISO 27001 scoping with PwC or KPMG NZ.

**Weeks 5–6 — Agency conversations.**
- Door-knock six conversations: MSD Digital Channels, IRD Te Pou, MoE
  Digital Services for Students, OT Digital Practice Tools, Te Whatu
  Ora Innovation, MBIE Sector Strategies.
- Bring an evidence pack to every meeting. The pack is the pitch.

**Weeks 7–9 — mGCDO application.**
- Submit Innovation Marketplace application with one anchor agency
  as nominated host.
- Reference the iwi shareholding, the AAAIP alignment, the existing
  Assembl deployments as evidence of platform maturity.

**Weeks 10–12 — Sandbox kickoff.**
- If accepted, run the 8–12 week paid pilot with the anchor agency.
- Pilot lands one Manaakitanga / Tauira Tāke / Pae Ako agent on a
  real (consented) caseload.
- Deliverable: a sealed Pae evidence pack tendered to the Minister
  responsible.

---

## 4. The technical setup

### 4.1 Where Pae forks from Assembl

| Layer                  | Shared with Assembl | Pae-specific                                |
| ---------------------- | ------------------- | ------------------------------------------- |
| Mana Trust Layer       | ✓                   |                                              |
| Iho router             | ✓                   |                                              |
| Reasoning ledger       | ✓                   | + separate Crown-quarantined tenancy        |
| Evidence pack spec     | ✓                   | + Pae-specific section ids                  |
| Hash chain             | ✓                   | + Crown timestamp authority                 |
| Hosting                | Shared NZ region    | Pae-only Australia-NZ-residency cloud       |
| Auth                   | Shared              | + RealMe integration                        |
| Identity               | Shared              | + agency SSO (Active Directory federation)  |
| Te reo + tikanga layer | ✓                   | + iwi-specific tikanga overlays             |
| Brand                  |                     | Pae brand, Pae site, Pae packs              |

### 4.2 Crown timestamp authority

Government records need a stronger timestamping signal than the
in-product hash chain. Pae integrates with an RFC 3161 Time-Stamp
Authority (TSA) — likely DigiCert NZ or the Internal Affairs proposed
GovTSA — so every Pae evidence pack carries both the Assembl hash
chain *and* a Crown-issued timestamp.

### 4.3 Crown-quarantined data residency

Crown data does not leave Aotearoa. Period.

- **Data residency:** AWS ap-southeast-2 (Sydney) is too far for
  some agencies; the move to Auckland (AWS or Azure NZ North) is the
  default by mid-2026. Pae deploys to the NZ region only.
- **Cross-tenant isolation:** Pae's Supabase project is separate from
  Assembl's. No shared Postgres. The shared code is the only shared
  surface.
- **Air-gap option:** for the most sensitive workloads (OT,
  intelligence-adjacent), Pae offers a single-tenant deployment with
  agency-controlled keys. This costs more; it's worth it.

### 4.4 RealMe / agency SSO

Pae users log in via:
- **RealMe** for citizens (where the agency exposes a citizen-facing
  surface).
- **Active Directory federation** for agency staff (most agencies use
  Microsoft 365 / Entra ID).

Both integrations are well-understood off-the-shelf for SaaS vendors;
the work is in the PIA, not the code.

---

## 5. The "what does an agent actually do" worked example

Concrete: a Manaakitanga Navigator agent on MSD's caseload.

**Inputs (consented and federated, not held by Pae):**
- Case manager's voice note / typed shorthand of a beneficiary
  interview.
- Beneficiary's MSD record (eligibility, current benefit, household
  composition) — read via MSD's existing API gateway.
- Open Banking-equivalent income feed (where consented).
- Recent legislative changes from `nz-compliance-autoupdate`.

**Loop:**
1. Kahu masks all PII before any model sees it.
2. Iho routes to the *Manaakitanga* specialist agent.
3. Specialist agent drafts:
   - a re-estimate of household income,
   - a check against five entitlements the beneficiary is not currently
     claiming,
   - draft application letters for any newly identified entitlements,
   - a one-paragraph plain-language summary for the case manager.
4. Tā stamps the trace into the reasoning ledger, runs the escalation
   policy (any safety flag triggers a Pae-trained kaimahi review).
5. Mahara recalls prior touchpoints on this case and grounds the draft
   against them.
6. Mana unmasks, rewrites for voice, and writes the evidence pack.
7. **Human approval** — the named case manager reviews and signs. No
   auto-send. Ever.

**Outputs:**
- A draft set of applications the case manager can review in 4–6
  minutes instead of 45.
- A Manaakitanga posture pack hash-chained for MSD's record.
- A Crown-timestamped audit trail that survives an OIA request.

The case manager is faster. The beneficiary is paid correctly. MSD has
a clean audit trail.

This is one agent. There are forty-six in the catalogue.

---

## 6. Risks to call out honestly

- **Adoption inertia.** Government takes 12–18 months to adopt anything.
  Plan accordingly. The mGCDO sandbox de-risks the first 12 weeks; the
  next 12 months are a slog.
- **AI political risk.** A high-profile AI failure in any government
  context (NZ or overseas) will set everyone back. Pae must lead with
  draft-only autonomy and human-signed outputs as the marketing posture
  on day one.
- **Iwi partnership done badly.** Tokenistic Māori partnership will be
  smelled out instantly. The shareholding has to be real, the
  decision-making has to be real, the tikanga overlays have to be
  iwi-authored. This is not a place to economise.
- **Lock-in by an anchor agency.** If MSD becomes 80% of revenue, MSD
  sets terms. Diversify across at least three agencies in the first
  18 months.
- **Cross-pollination from Assembl.** Any Assembl-side data leaks into
  Pae or vice-versa is a procurement-killing event. Strict tenant
  isolation, separate Supabase projects, separate KMS.

---

## 7. Why now

Three signals make 2026 the right year:

1. **AAAIP is live.** The Aotearoa Agentic AI Platform pilot frame
   already exists and Assembl is already in it. Pae inherits that
   relationship.
2. **NZ Cloud Computing renewal cycle.** A 5-year procurement cycle
   resets in 2026–27. Anchor MSAs land in this window or not for
   another five years.
3. **The Royal Commission recommendations** for Oranga Tamariki create
   political mandate for record-keeping integrity that hash-chained
   evidence packs uniquely meet.

If the founding entity isn't incorporated by **September 2026**, the
window slips to 2032.

---

## 8. Immediate next step

If you want to move on this, the *single* next step is:

> **Have a 30-minute conversation with Awanui Black or Carrie Stoddart-
> Smith (or an equivalent Māori tech-policy elder) about whether Pae
> as proposed is the right shape — before any of the procurement,
> incorporation, or compliance work begins.**

If the answer is "yes, with these modifications," then everything in
§3 starts. If the answer is "no, here's a different shape," we learn
faster than any of the rest of this work could teach us.

---

## 9. What's been pre-scaffolded in this repo

To make the conversation in §8 concrete, this branch ships:

- This document.
- `lib/government/pae-navigator-agent.ts` — the agent spec for the
  Manaakitanga Navigator (MSD), as the worked example from §5. Shape-
  compatible with the existing `lib/agents.ts` registry; can be moved
  to Pae's own repo when that lives.

Pae remains hypothetical until the conversation in §8 happens. The
code is just enough to make the conversation specific.
