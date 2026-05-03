// Featured showcase items
export interface FeaturedOutput {
  image: string;
  agentName: string;
  agentColor: string;
  agentId: string;
  title: string;
  description: string;
}

export interface ComparisonItem {
  agent: string;
  agentColor: string;
  replaces: string;
  theirCost: string;
  assemblCost: string;
}

export interface OutputCard {
  id: string;
  agentId: string;
  agentName: string;
  agentCode: string;
  agentColor: string;
  outputType: string;
  formatBadge: string;
  preview: string;
  fullContent: string;
}

export const COMPARISONS: ComparisonItem[] = [
  { agent: "FLUX", agentColor: "#3A6A9C", replaces: "CRM & Sales Platform", theirCost: "$450-800/mo", assemblCost: "Included in kete" },
  { agent: "PRISM", agentColor: "#E040FB", replaces: "AI Writer + Scheduler + Agency", theirCost: "$3,000-8,000/mo", assemblCost: "Included in kete" },
  { agent: "AROHA", agentColor: "#FF6F91", replaces: "HR Consultant", theirCost: "$150-250/hr", assemblCost: "Included in kete" },
  { agent: "HAVEN", agentColor: "#4AA5A8", replaces: "Property Manager", theirCost: "7-10% of rent", assemblCost: "Included in kete" },
  { agent: "FORGE", agentColor: "#FF4D6A", replaces: "F&I Software + Compliance", theirCost: "$500-2,000/mo", assemblCost: "Included in kete" },
  { agent: "ECHO", agentColor: "#E4A0FF", replaces: "Social Media Manager", theirCost: "$3,000-6,000/mo", assemblCost: "Included in kete" },
];

export const FILTER_AGENTS = [
  { name: "All", color: "#ffffff" },
  { name: "TORO", color: "#3A6A9C" },
  { name: "AROHA", color: "#FF6F91" },
  { name: "LEDGER", color: "#4FC3F7" },
  { name: "HAVEN", color: "#4AA5A8" },
  { name: "APEX", color: "#FF6B35" },
  { name: "PRISM", color: "#E040FB" },
  { name: "FORGE", color: "#FF4D6A" },
  { name: "ANCHOR", color: "#3A6A9C" },
  { name: "FLUX", color: "#3A6A9C" },
  { name: "AURA", color: "#5AADA0" },
  { name: "VAULT", color: "#4FC3F7" },
  { name: "SHIELD", color: "#7E57C2" },
  { name: "ECHO", color: "#E4A0FF" },
];

export const OUTPUT_CARDS: OutputCard[] = [
  // ECHO
  {
    id: "echo-carousel",
    agentId: "echo",
    agentName: "ECHO",
    agentCode: "ASM-000",
    agentColor: "#E4A0FF",
    outputType: "Instagram Carousel — 5 Slides",
    formatBadge: "Social Post",
    preview: `**Slide 1 (Hook):**\nYour business runs on six different platforms.\nAssembl runs on six industry kete.\n\n**Slide 2:**\nKete handle the workflows that drain your team…`,
    fullContent: `**Slide 1 (Hook):**\nYour business runs on six different platforms.\nAssembl runs on six industry kete.\n\n**Slide 2:**\nKete handle the workflows that drain your team — payroll, compliance, scheduling, contracts, customer comms.\n\n**Slide 3:**\nGrounded in NZ legislation and policy workflows. Updated when the law changes.\n\n**Slide 4:**\nManaaki, Waihanga, Auaha, Arataki, Pikau, Hoko. Six industry kete, one platform.\n\n**Slide 5 (CTA):**\nSix industry kete. Built in Aotearoa.\n→ assembl.co.nz\n\n**Caption:** Specialist operational workflows for NZ business. Six industry kete grounded in NZ legislation. From NZ$590/mo. Link in bio.\n\n#NZBusiness #Assembl #SmallBusinessNZ #BusinessAutomation #BuiltInAotearoa`,
  },
  {
    id: "echo-linkedin",
    agentId: "echo",
    agentName: "ECHO",
    agentCode: "ASM-000",
    agentColor: "#E4A0FF",
    outputType: "LinkedIn Post",
    formatBadge: "Social Post",
    preview: `I spent 13 years helping NZ brands tell their stories.\n\nThen I realised the brands I loved working with — construction companies, hospitality operators…`,
    fullContent: `I spent 13 years helping NZ brands tell their stories.\n\nThen I realised the brands I loved working with — construction companies, hospitality operators, property managers — were drowning in compliance, admin, and paperwork.\n\nNot because they were bad at business. Because NZ keeps changing the rules and no one has time to keep up.\n\nSo I built Assembl.\n\n41 AI agents. Each one trained on specific NZ legislation. Not chatbots — full operations platforms.\n\nAPEX writes tender responses structured to evaluation criteria. AROHA knows the Employment Relations Amendment Act 2026 that came into force 3 weeks ago. HAVEN checks your rental against Healthy Homes Standards.\n\nThey don't replace your team. They give your team superpowers.\n\nWe're live. assembl.co.nz\n\nIf you run a NZ business and want to try any agent, DM me. First 50 customers get launch pricing locked in forever.`,
  },
  // AURA
  {
    id: "aura-dossier",
    agentId: "hospitality",
    agentName: "AURA",
    agentCode: "ASM-001",
    agentColor: "#5AADA0",
    outputType: "Guest Pre-Arrival Dossier",
    formatBadge: "Document",
    preview: `**GUEST INTELLIGENCE BRIEF**\n\nGuest: Mr & Mrs James Whitfield\nProperty: The Lindis Lodge, Canterbury\nArrival: 15 April 2026 | 3 nights | 25th anniversary`,
    fullContent: `**GUEST INTELLIGENCE BRIEF**\n\nGuest: Mr & Mrs James Whitfield\nProperty: The Lindis Lodge, Canterbury\nArrival: 15 April 2026 | 3 nights | Celebrating 25th wedding anniversary\nSource: Luxury travel network booking via Travel Associates Sydney\n\n**Dietary & Preferences:**\n• Mrs Whitfield: Pescatarian, no shellfish\n• Mr Whitfield: No restrictions. Enjoys Central Otago Pinot Noir\n• Anniversary dinner: Request window table with mountain view\n• Previous NZ visit: 2019, stayed luxury lodge — rated it 9/10\n\n**Pre-Arrival Actions:**\n Anniversary card signed by GM in suite on arrival\n Bottle of Central Otago Pinot Noir 2022 chilled in room\n Kitchen briefed: pescatarian menu cards for all 3 nights\n Day 2: Helicopter to Aoraki/Mt Cook for glacier landing\n Day 3: Private guided walk to Lake Ōhau Wetlands\n Stargazing session booked for clearest evening\n Transfer: Arranged from Queenstown Airport, 2.5hr drive\n\n**Estimated Guest Lifetime Value:** $18,500`,
  },
  {
    id: "aura-itinerary",
    agentId: "hospitality",
    agentName: "AURA",
    agentCode: "ASM-001",
    agentColor: "#5AADA0",
    outputType: "Bespoke 3-Day Itinerary",
    formatBadge: "Document",
    preview: `**DAY 1 — Arrival & Settle**\n\n2:30pm — Airport transfer with welcome refreshments\n4:00pm — Check-in, suite orientation, welcome amenity…`,
    fullContent: `**DAY 1 — Arrival & Settle**\n\n2:30pm — Airport transfer with welcome refreshments\n4:00pm — Check-in, suite orientation, welcome amenity\n5:30pm — Guided property walk, native garden tour\n7:00pm — Anniversary dinner, window table, 5-course tasting menu\n\n**DAY 2 — Adventure**\n\n7:00am — Breakfast in suite\n8:30am — Helicopter to Aoraki/Mt Cook, glacier landing (weather permitting)\n12:00pm — Packed gourmet lunch at alpine viewpoint\n3:00pm — Return, spa treatments (pre-booked couples massage)\n7:30pm — Chef's table dinner with Central Otago wine pairing\n\n**DAY 3 — Explore & Depart**\n\n7:30am — Breakfast\n9:00am — Private guided walk, Lake Ōhau Wetlands\n12:00pm — Farewell lunch, packed provisions for journey\n2:00pm — Departure transfer to Queenstown Airport`,
  },
  // APEX
  {
    id: "apex-safety",
    agentId: "construction",
    agentName: "APEX",
    agentCode: "ASM-003",
    agentColor: "#FF6B35",
    outputType: "Site-Specific Safety Plan",
    formatBadge: "Report",
    preview: `**PROJECT:** Commercial fitout — Level 3, Viaduct Harbour, Auckland\n**PCBU:** Construct Group Ltd | **Duration:** 12 weeks\n\n| Hazard | Risk | Controls |`,
    fullContent: `**PROJECT:** Commercial fitout — Level 3, Viaduct Harbour, Auckland\n**PCBU:** Construct Group Ltd | **Duration:** 12 weeks | **Max workers:** 8\n\n| Hazard | Risk | Controls | Legislation |\n|---|---|---|---|\n| Working at heights | High (4×3=12) | Edge protection, harness | HSWA Regs 2016 Part 3 |\n| Electrical work | High (5×3=15) | Lockout/tagout, licensed only | HSWA s36, ES Regs |\n| Dust/airborne | Medium (3×3=9) | RPE (P2), wet cutting | HSWA Regs Part 4 |\n| Manual handling | Medium (3×2=6) | Mechanical aids, 25kg max | HSWA Regs 2016 |\n| Noise | Medium (3×2=6) | Hearing protection >85dB | HSWA Regs 2016 |\n\n**Emergency Procedures:**\n• Assembly point: Ground floor car park — north corner\n• First aid kit: Site office (Level 3) — checked weekly\n• Nearest hospital: Auckland City Hospital (2.1km, 6 mins)\n\n*References: Health and Safety at Work Act 2015, HSWA General Risk and Workplace Management Regulations 2016*`,
  },
  {
    id: "apex-tender",
    agentId: "construction",
    agentName: "APEX",
    agentCode: "ASM-003",
    agentColor: "#FF6B35",
    outputType: "Tender Response Structure",
    formatBadge: "Document",
    preview: `**RFP:** Auckland Council — Stormwater Infrastructure Upgrade\n**Evaluation Criteria Extracted:**\n1. Relevant Experience (30%) → Section 3\n2. Methodology (25%) → Section 4`,
    fullContent: `**RFP:** Auckland Council — Stormwater Infrastructure Upgrade\n**Deadline:** 28 April 2026 | **Value:** $2.4M estimated\n\n**Evaluation Criteria Extracted → Response Sections:**\n1. Relevant Experience (30%) → Section 3: Portfolio of 5 comparable projects\n2. Methodology (25%) → Section 4: Staged approach with risk mitigation\n3. Key Personnel (20%) → Section 5: CVs with specific project references\n4. Health & Safety (15%) → Section 6: Site-specific safety plan\n5. Price (10%) → Section 7: Detailed schedule of quantities\n\n**Auto-Generated Sections:**\n Executive Summary (max 2 pages)\n Company Profile with relevant certifications\n Methodology with Gantt chart\n H&S plan referencing HSWA 2015\n Environmental management plan\n References from 3 similar projects`,
  },
  // HAVEN
  {
    id: "haven-compliance",
    agentId: "property",
    agentName: "HAVEN",
    agentCode: "ASM-018",
    agentColor: "#4AA5A8",
    outputType: "Healthy Homes Compliance Check",
    formatBadge: "Report",
    preview: `**PROPERTY:** 14 Rata Street, Mt Eden, Auckland\n\n| Standard | Status |\n|---|---|\n| Heating |  PASS |\n| Ceiling Insulation |  PASS |`,
    fullContent: `**PROPERTY:** 14 Rata Street, Mt Eden, Auckland\n**LANDLORD:** K. Peterson | **TENANT:** J. & M. Sharma\n\n| Standard | Requirement | Status | Action |\n|---|---|---|---|\n| Heating | Fixed heater, min 1.5kW |  PASS | Heat pump (3.5kW) |\n| Ceiling Insulation | R 2.9 minimum |  PASS | R3.2 installed 2022 |\n| Underfloor Insulation | R 1.3 minimum |  FAIL | No insulation. Requires retrofit |\n| Ventilation | Extractor fans |  PARTIAL | Bathroom fan not functioning |\n| Moisture & Drainage | No leaks |  PASS | Guttering clear |\n| Draught Stopping | All windows seal |  PARTIAL | 2 bedroom windows have gaps |\n\n**Compliance Score: 4/6 — Action Required**\n\n**Priority Remediation:**\n1.  URGENT: Underfloor insulation — Est. $2,500-$4,000\n2.  HIGH: Bathroom extractor fan — Est. $150-$350\n3.  MEDIUM: Window draught strips — Est. $30-$80\n\n*Failure to meet Healthy Homes Standards may result in penalties up to $7,200.*`,
  },
  // AROHA
  {
    id: "aroha-cost",
    agentId: "hr",
    agentName: "AROHA",
    agentCode: "ASM-038",
    agentColor: "#FF6F91",
    outputType: "True Employment Cost Calculation",
    formatBadge: "Calculator",
    preview: `**EMPLOYEE:** Marketing Coordinator\n**Base salary:** $65,000 p.a.\n\n| Component | Annual Cost |\n|---|---|\n| Gross salary | $65,000.00 |`,
    fullContent: `**EMPLOYEE:** Marketing Coordinator\n**Base salary:** $65,000 per annum | **Hours:** 40/week\n\n| Component | Annual Cost | Calculation |\n|---|---|---|\n| Gross salary | $65,000.00 | Base |\n| KiwiSaver employer (3%) | $1,950.00 | $65,000 × 3% |\n| ACC employer levy | $409.50 | $65,000 × 0.0063 |\n| Annual leave (4 weeks) | $5,000.00 | 4/52 × $65,000 |\n| Sick leave (10 days) | $2,500.00 | 10/260 × $65,000 |\n| Public holidays (11.5 days) | $2,884.62 | 11.5/260 × $65,000 |\n| **TRUE EMPLOYER COST** | **$77,744.12** | **+19.6% above base** |\n\n**Employee Take-Home (per fortnight):**\n| Gross pay | $2,500.00 |\n| PAYE tax | -$459.62 |\n| ACC earner levy | -$40.00 |\n| KiwiSaver (3%) | -$75.00 |\n| **Net take-home** | **$1,925.38** |`,
  },
  // FORGE
  {
    id: "forge-fi",
    agentId: "automotive",
    agentName: "FORGE",
    agentCode: "ASM-006",
    agentColor: "#FF4D6A",
    outputType: "Finance Payment Comparison",
    formatBadge: "Calculator",
    preview: `**VEHICLE:** 2024 Mid-Size EV Sedan | $52,990\n**Deposit:** $10,000 | **Financed:** $42,990\n\n| | Dealer | Bank | Finance Co. |`,
    fullContent: `**VEHICLE:** 2024 Mid-Size EV Sedan | **Price:** $52,990\n**Deposit:** $10,000 | **Amount financed:** $42,990\n\n| | Dealer Finance | Bank Loan | Finance Company |\n|---|---|---|---|\n| Interest rate | 9.95% p.a. | 8.49% p.a. | 11.95% p.a. |\n| Monthly repayment | $912.34 | $880.45 | $955.18 |\n| Total interest | $11,750.40 | $9,837.00 | $14,320.80 |\n| **TOTAL YOU PAY** | **$65,115.40** | **$63,027.00** | **$67,710.80** |\n\n**Savings choosing Bank Loan vs Dealer: $2,088.40**\n\n*Finance calculations indicative only. Total cost of credit per CCCFA 2003.*`,
  },
  // LEDGER
  {
    id: "ledger-paye",
    agentId: "accounting",
    agentName: "LEDGER",
    agentCode: "ASM-014",
    agentColor: "#4FC3F7",
    outputType: "PAYE Take-Home Calculator",
    formatBadge: "Calculator",
    preview: `**EMPLOYEE:** $85,000 salary | Tax code: M | KiwiSaver: 3%\n\n| Income Band | Rate | Tax |\n|---|---|---|\n| $0–$14,000 | 10.5% | $1,470 |`,
    fullContent: `**EMPLOYEE:** Annual salary $85,000 | Tax code: M | KiwiSaver: 3%\n\n| Income Band | Rate | Tax |\n|---|---|---|\n| $0–$14,000 | 10.5% | $1,470.00 |\n| $14,001–$48,000 | 17.5% | $5,950.00 |\n| $48,001–$70,000 | 30% | $6,600.00 |\n| $70,001–$85,000 | 33% | $4,950.00 |\n| **Total PAYE** | | **$18,970.00** |\n\n| Deduction | Annual | Fortnightly |\n|---|---|---|\n| Gross pay | $85,000.00 | $3,269.23 |\n| PAYE | -$18,970.00 | -$729.62 |\n| ACC earner levy | -$1,360.00 | -$52.31 |\n| KiwiSaver (3%) | -$2,550.00 | -$98.08 |\n| **Net take-home** | **$62,120.00** | **$2,389.23** |\n\nEffective tax rate: 22.3%`,
  },
  {
    id: "ledger-gst",
    agentId: "accounting",
    agentName: "LEDGER",
    agentCode: "ASM-014",
    agentColor: "#4FC3F7",
    outputType: "GST Return Working Paper",
    formatBadge: "Report",
    preview: `**GST RETURN — Period: Jan–Mar 2026**\n**Business:** Fresh & Co Ltd | GST#: 123-456-789\n\n| | Amount | GST |`,
    fullContent: `**GST RETURN — Period: Jan–Mar 2026**\n**Business:** Fresh & Co Ltd | GST#: 123-456-789\n\n| Category | Amount (excl GST) | GST |\n|---|---|---|\n| Sales income | $185,000.00 | $27,750.00 |\n| Zero-rated exports | $12,000.00 | $0.00 |\n| **Total output tax** | | **$27,750.00** |\n| Business purchases | $92,000.00 | $13,800.00 |\n| Capital assets | $8,500.00 | $1,275.00 |\n| **Total input tax** | | **$15,075.00** |\n| **GST to pay IRD** | | **$12,675.00** |\n\n**Due date:** 28 April 2026\n*Filed on invoice basis. GST rate 15%.*`,
  },
  // PRISM
  {
    id: "prism-campaign",
    agentId: "marketing",
    agentName: "PRISM",
    agentCode: "ASM-011",
    agentColor: "#E040FB",
    outputType: "Full Campaign from One Brief",
    formatBadge: "Template",
    preview: `**Brief:** 'Assembl is launching FORGE with an F&I calculator for car dealerships. Target: NZ dealership owners. Goal: 10 demo requests in 2 weeks.'`,
    fullContent: `**Brief:** 'Assembl is launching FORGE with an F&I calculator for car dealerships. Target: NZ dealership owners. Goal: 10 demo requests in 2 weeks. Budget: organic only.'\n\n**Email Subject Options:**\n1. Your F&I department just got an upgrade\n2. The calculator your dealership is missing\n3. FORGE: Built for NZ dealerships, not US ones\n\n**LinkedIn Post:**\nNZ dealerships lost an average of $2,088 per deal to suboptimal finance structuring last quarter. Not because the F&I team is bad. Because comparing 3 lender offers takes time they don't have. FORGE does it in 30 seconds.\n\n**Instagram Carousel (5 slides):**\nSlide 1: "Your F&I team is leaving money on every deal"\nSlide 2: Compare 3 finance offers side-by-side in seconds\nSlide 3: CCCFA-compliant disclosures generated automatically\nSlide 4: Lease vs buy analysis with NZ-specific rates\nSlide 5: Try FORGE free → assembl.co.nz\n\n**Posting Schedule:**\nDay 1: LinkedIn (8am) + IG carousel (12pm)\nDay 3: IG Reel (7am) + LinkedIn engagement\nDay 5: Email blast\nDay 7: LinkedIn follow-up\nDay 14: Final push + results report`,
  },
  // VAULT
  {
    id: "vault-mortgage",
    agentId: "finance",
    agentName: "VAULT",
    agentCode: "ASM-039",
    agentColor: "#4FC3F7",
    outputType: "Mortgage Comparison Report",
    formatBadge: "Calculator",
    preview: `**SCENARIO:** First home buyer, Auckland\nPurchase: $875,000 | Deposit: $175,000 (20%)\n\n| Bank | Rate | Monthly |`,
    fullContent: `**SCENARIO:** First home buyer, Auckland. Purchase $875,000. Deposit $175,000 (20%). Loan $700,000. 30 years.\n\n| Bank | Fixed Rate (2yr) | Monthly | Total Interest | Total Cost |\n|---|---|---|---|---|\n| Bank A | 5.29% | $3,877 | $695,720 | $1,395,720 |\n| Bank B | 5.19% | $3,833 | $679,880 | $1,379,880 |\n| Bank C | 5.39% | $3,922 | $711,920 | $1,411,920 |\n| Bank D | 5.25% | $3,859 | $689,240 | $1,389,240 |\n\n**Best option: Bank B at 5.19% saves $32,040 vs Bank C**\n\n**Split loan strategy:**\n$400,000 fixed 2yr at 5.19% + $300,000 floating at 6.89%\nMonthly: $2,190 + $1,975 = $4,165\nBenefit: Extra payments on floating without break fees`,
  },
  {
    id: "vault-kiwisaver",
    agentId: "finance",
    agentName: "VAULT",
    agentCode: "ASM-039",
    agentColor: "#4FC3F7",
    outputType: "KiwiSaver Retirement Projection",
    formatBadge: "Calculator",
    preview: `**MEMBER:** Age 32 | Salary: $85,000 | Contribution: 3%\n**Current balance:** $42,500\n\n**Projected at age 65:**`,
    fullContent: `**MEMBER:** Age 32 | Salary: $85,000 | Contribution: 3%\n**Current balance:** $42,500 | **Fund type:** Growth\n\n**Projected at age 65 (33 years):**\n| Scenario | Return | Balance at 65 |\n|---|---|---|\n| Conservative | 4.5% p.a. | $298,000 |\n| Balanced | 6.0% p.a. | $412,000 |\n| Growth | 7.5% p.a. | $572,000 |\n| Aggressive | 9.0% p.a. | $798,000 |\n\n**Breakdown (Growth scenario):**\n• Your contributions: $84,150\n• Employer contributions: $84,150\n• Government contributions: $17,160\n• Investment returns: $386,540\n\n*Projections are estimates only. Past performance is not indicative of future returns.*`,
  },
  // SHIELD
  {
    id: "shield-insurance",
    agentId: "insurance",
    agentName: "SHIELD",
    agentCode: "ASM-040",
    agentColor: "#7E57C2",
    outputType: "Sum Insured Calculator",
    formatBadge: "Calculator",
    preview: `**PROPERTY:** 3-bed weatherboard, 1960s, 140m², Mt Eden\n\n| Component | Estimate |\n|---|---|\n| Rebuild cost/m² | $3,200 |`,
    fullContent: `**PROPERTY:** 3-bedroom weatherboard house, 1960s, 140m², Mt Eden, Auckland\n\n| Component | Estimate |\n|---|---|\n| Rebuild cost per m² (weatherboard, Auckland) | $3,200 |\n| Total rebuild cost (140m²) | $448,000 |\n| Demolition & site clearance | $25,000 |\n| Professional fees | $45,000 |\n| Temporary accommodation (12 months) | $36,000 |\n| Inflation buffer (10%) | $55,400 |\n| **Recommended sum insured** | **$609,400** |\n\n**EQC/Toka Tū Ake:** First $300,000 of dwelling damage\n**Private insurer:** Everything above $300,000\n\n**Risk factors:**\n• Earthquake zone: High (Auckland Volcanic Field)\n• Flood risk: Low (elevated position)\n• Tsunami: Not applicable (inland)\n• Volcanic: Moderate`,
  },
  {
    id: "shield-hazard",
    agentId: "insurance",
    agentName: "SHIELD",
    agentCode: "ASM-040",
    agentColor: "#7E57C2",
    outputType: "Natural Hazard Risk Assessment",
    formatBadge: "Report",
    preview: `**REGION:** Wellington | **Property type:** Residential\n\n| Hazard | Risk Level | Key Factor |\n|---|---|---|\n| Earthquake | Very High | Wellington Fault |`,
    fullContent: `**REGION:** Wellington | **Property type:** Residential\n\n| Hazard | Risk Level | Key Factor |\n|---|---|---|\n| Earthquake | Very High | Wellington Fault, AF8 scenario |\n| Tsunami | High | Cook Strait exposure, 15-min warning |\n| Flooding | Moderate | Hutt Valley, Porirua Stream |\n| Landslide | High | Steep terrain, clay soils |\n| Volcanic | Low | Distance from Taupō Volcanic Zone |\n\n**Insurance implications:**\n• Higher EQC levy area\n• Some insurers restrict cover in high-risk zones\n• Recommend excess flood cover\n• Building strengthening may reduce premiums\n\n*Data sourced from GNS Science, NIWA, and local council hazard maps.*`,
  },
  // ANCHOR
  {
    id: "anchor-agreement",
    agentId: "legal",
    agentName: "ANCHOR",
    agentCode: "ASM-015",
    agentColor: "#3A6A9C",
    outputType: "Employment Agreement",
    formatBadge: "Legal Doc",
    preview: `**INDIVIDUAL EMPLOYMENT AGREEMENT**\n\nParties: [Employer] and [Employee]\nPosition: Marketing Coordinator\nTrial Period: 90 days (per s 67A ERA 2000)`,
    fullContent: `**INDIVIDUAL EMPLOYMENT AGREEMENT**\n\nParties: [Employer Name] ("the Employer") and [Employee Name] ("the Employee")\nPosition: Marketing Coordinator\nStart Date: [Date]\nLocation: Auckland\n\n**1. Trial Period**\nThis employment is subject to a trial period of 90 days as provided for by section 67A of the Employment Relations Act 2000.\n\n**2. Hours of Work**\n40 hours per week, Monday to Friday, 8:30am–5:00pm.\n\n**3. Remuneration**\n$65,000 per annum gross, paid fortnightly.\n\n**4. Leave Entitlements**\n• Annual leave: 4 weeks per Employment Relations Act 2003\n• Sick leave: 10 days per Holidays Act 2003\n• Bereavement leave: 3 days (immediate family)\n• Public holidays: As gazetted\n\n**5. KiwiSaver**\nEmployer contribution: 3% per KiwiSaver Act 2006.\n\n**6. Termination**\n4 weeks' notice by either party after trial period.\n\n*This agreement complies with the Employment Relations Act 2000 (as amended 2026).*`,
  },
  {
    id: "anchor-privacy",
    agentId: "legal",
    agentName: "ANCHOR",
    agentCode: "ASM-015",
    agentColor: "#3A6A9C",
    outputType: "Privacy Policy Generator",
    formatBadge: "Legal Doc",
    preview: `**PRIVACY POLICY**\n\n[Business Name] is committed to protecting your privacy in accordance with the Privacy Act 2020 (NZ).`,
    fullContent: `**PRIVACY POLICY**\n\n[Business Name] is committed to protecting your privacy in accordance with the Privacy Act 2020 (NZ).\n\n**1. Information We Collect**\nWe collect personal information including name, email, phone number, and payment details when you use our services.\n\n**2. How We Use Your Information**\n• To provide and improve our services\n• To communicate with you about your account\n• To comply with legal obligations\n\n**3. Information Sharing**\nWe do not sell your personal information. We may share with:\n• Service providers who assist our operations\n• Legal authorities when required by law\n\n**4. Your Rights (Privacy Act 2020)**\n• Right to access your personal information\n• Right to request correction of inaccurate information\n• Right to request deletion\n\n**5. Data Security**\nWe implement industry-standard security measures including encryption, access controls, and regular security audits.\n\n**6. Contact**\nPrivacy Officer: [Name], [Email]\n\n*Compliant with NZ Privacy Act 2020 and Information Privacy Principles 1-13.*`,
  },
  // TORO
  {
    id: "helm-dashboard",
    agentId: "operations",
    agentName: "TORO",
    agentCode: "ASM-013",
    agentColor: "#3A6A9C",
    outputType: "Weekly Family Dashboard",
    formatBadge: "Dashboard",
    preview: `**WEEK OF 14 APRIL 2026 — The Hudson Family**\n\n| Day | Mia (Year 4) | Jack (Year 7) |\n|---|---|---|\n| Mon | Swimming gear | Science project due |`,
    fullContent: `**WEEK OF 14 APRIL 2026 — The Hudson Family**\n\n| Day | Mia (Year 4) | Jack (Year 7) | Parent Actions |\n|---|---|---|---|\n| Mon | Swimming gear, library book | Science project due | Pack swimsuit, sign permission slip |\n| Tue | Mufti day ($2) | Cricket practice 3:30pm | Cash for Mia, cricket gear for Jack |\n| Wed | — | ICAS Maths test | Lunch order day (both) |\n| Thu | School photos (full uniform) | Tech class — bring USB | Iron uniforms tonight |\n| Fri | Assembly 2pm (parents welcome) | Early finish 12:30pm | Arrange pickup for Jack |\n\n**Packing Checklist — Monday:**\n Mia: Swimsuit, goggles, towel, library book\n Jack: Science project poster, glue stick\n\n**Upcoming:**\n• 21 Apr: School holidays begin\n• 22 Apr: Holiday programme registration closes`,
  },
  {
    id: "helm-newsletter",
    agentId: "operations",
    agentName: "TORO",
    agentCode: "ASM-013",
    agentColor: "#3A6A9C",
    outputType: "Newsletter AI Parse",
    formatBadge: "Report",
    preview: `**PARSED FROM:** Ponsonby Primary Newsletter #12\n**Confidence:** 94%\n\n**Events Extracted:**\n School Photos — Thu 17 April (high confidence)`,
    fullContent: `**PARSED FROM:** Ponsonby Primary Newsletter #12\n**Date:** 11 April 2026 | **Confidence:** 94%\n\n**Events Extracted:**\n School Photos — Thu 17 April (high confidence)\n Assembly — Fri 18 April 2pm (high confidence)\n ICAS Maths — Wed 16 April (high confidence)\n School Holidays — Start 21 April (high confidence)\n Holiday Programme — Registration "closing soon" (date unclear)\n\n**Action Items:**\n Permission slip required — Swimming (Mon)\n Cash required — Mufti day $2 (Tue)\n Uniform required — Full uniform for photos (Thu)\n\n**Added to calendar:** 4 events\n**Needs review:** 1 item (holiday programme date)`,
  },
  // FLUX
  {
    id: "flux-pipeline",
    agentId: "sales",
    agentName: "FLUX",
    agentCode: "ASM-008",
    agentColor: "#3A6A9C",
    outputType: "Lead Pipeline Dashboard",
    formatBadge: "Dashboard",
    preview: `**PIPELINE SUMMARY — March 2026**\n\n| Stage | Leads | Value |\n|---|---|---|\n| New | 23 | $184,000 |`,
    fullContent: `**PIPELINE SUMMARY — March 2026**\n\n| Stage | Leads | Value | Avg Days |\n|---|---|---|---|\n| New | 23 | $184,000 | 0 |\n| Qualified | 15 | $267,000 | 4.2 |\n| Proposal | 8 | $412,000 | 11.5 |\n| Negotiation | 4 | $318,000 | 18.3 |\n| Won | 6 | $287,000 | 22.1 |\n| Lost | 3 | $89,000 | 15.7 |\n\n**AI Lead Scores (Top 5):**\n1. TechCorp NZ — 94/100 — Ready to close\n2. BuildRight Ltd — 87/100 — Send proposal today\n3. Fresh & Co — 82/100 — Follow up on pricing\n4. Kiwi Motors — 76/100 — Needs demo\n5. Coastal Hospitality — 71/100 — Early stage\n\n**This month:** 6 won ($287K) vs target ($250K) \n**Conversion rate:** 26% (industry avg: 21%)`,
  },
];
