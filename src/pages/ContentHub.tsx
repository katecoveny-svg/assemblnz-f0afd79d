import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SampleOutput {
  id: string;
  agentId: string;
  agentName: string;
  agentDesignation: string;
  agentColor: string;
  category: string;
  outputType: string;
  content: string;
}

const CATEGORIES = ["All", "ECHO", "Business", "Lifestyle", "HR"];

const SAMPLE_OUTPUTS: SampleOutput[] = [
  {
    id: "echo-carousel",
    agentId: "echo",
    agentName: "ECHO",
    agentDesignation: "ASM-000",
    agentColor: "#E4A0FF",
    category: "ECHO",
    outputType: "Instagram Carousel — 5 Slides",
    content: `**Slide 1 (Hook):**
Your accountant charges $350/hr.
Your AI accountant charges $79/mo.

**Slide 2:**
LEDGER calculates your GST, PAYE, KiwiSaver, ACC levies, and provisional tax. In seconds. With every NZ rate current to April 2026.

**Slide 3:**
AROHA drafts employment agreements that reference the Employment Relations Amendment Act 2026. Your lawyer hasn't read it yet.

**Slide 4:**
HAVEN checks your rental against Healthy Homes Standards and generates a compliance report with pass/fail per requirement.

**Slide 5 (CTA):**
41 AI agents. One subscription. Built in Aotearoa.
→ assembl.co.nz

**Caption:** Your business needs an accountant, a lawyer, a property manager, an HR director, and a marketing team. Or it needs Assembl. 41 AI agents trained on NZ law. Starting at $79/mo. Link in bio.

#AIagents #NZBusiness #Assembl #SmallBusinessNZ #AItools #StartupNZ #BusinessAutomation`,
  },
  {
    id: "echo-linkedin",
    agentId: "echo",
    agentName: "ECHO",
    agentDesignation: "ASM-000",
    agentColor: "#E4A0FF",
    category: "ECHO",
    outputType: "LinkedIn Post",
    content: `I spent 13 years helping NZ brands tell their stories.

Then I realised the brands I loved working with — construction companies, hospitality operators, property managers — were drowning in compliance, admin, and paperwork.

Not because they were bad at business. Because NZ keeps changing the rules and no one has time to keep up.

So I built Assembl.

41 AI agents. Each one trained on specific NZ legislation. Not chatbots — full operations platforms.

APEX writes tender responses structured to evaluation criteria. AROHA knows the Employment Relations Amendment Act 2026 that came into force 3 weeks ago. HAVEN checks your rental against Healthy Homes Standards.

They don't replace your team. They give your team superpowers.

We're live. assembl.co.nz

If you run a NZ business and want to try any agent, DM me. First 50 customers get launch pricing locked in forever.`,
  },
  {
    id: "aura-dossier",
    agentId: "hospitality",
    agentName: "AURA",
    agentDesignation: "ASM-001",
    agentColor: "#00FF88",
    category: "Business",
    outputType: "Guest Pre-Arrival Dossier",
    content: `**GUEST INTELLIGENCE BRIEF**

Guest: Mr & Mrs James Whitfield
Property: The Lindis Lodge, Canterbury
Arrival: 15 April 2026 | 3 nights | Celebrating 25th wedding anniversary
Source: Virtuoso booking via Travel Associates Sydney

**Dietary & Preferences:**
• Mrs Whitfield: Pescatarian, no shellfish
• Mr Whitfield: No restrictions. Enjoys Central Otago Pinot Noir
• Anniversary dinner: Request window table with mountain view
• Previous NZ visit: 2019, stayed Huka Lodge — rated it 9/10 on post-stay survey

**Pre-Arrival Actions:**
☐ Anniversary card signed by GM in suite on arrival
☐ Bottle of Felton Road Block 5 Pinot Noir 2022 chilled in room
☐ Kitchen briefed: pescatarian menu cards for all 3 nights, no shellfish
☐ Day 2 itinerary: Helicopter to Aoraki/Mt Cook for glacier landing (weather window 8-11am, backup Day 3)
☐ Day 3: Private guided walk to Lake Ōhau Wetlands — packed lunch, dietary noted
☐ Stargazing session booked for clearest evening (check MetService 48hr forecast)
☐ Transfer: Arranged from Queenstown Airport, 2.5hr drive, welcome refreshments in vehicle

**Estimated Guest Lifetime Value:** $18,500 (3rd luxury NZ property in 5 years, active Virtuoso client, likely to refer)`,
  },
  {
    id: "apex-safety",
    agentId: "construction",
    agentName: "APEX",
    agentDesignation: "ASM-003",
    agentColor: "#FF6B35",
    category: "Business",
    outputType: "Site-Specific Safety Plan",
    content: `**PROJECT:** Commercial fitout — Level 3, Viaduct Harbour, Auckland
**PCBU:** Construct Group Ltd | **Duration:** 12 weeks | **Max workers on site:** 8

**Key Hazards Identified:**

| Hazard | Risk | Controls | Legislation |
|---|---|---|---|
| Working at heights | High (4×3=12) | Edge protection, harness, SWPs | HSWA Regs 2016 Part 3 |
| Electrical work | High (5×3=15) | Lockout/tagout, licensed only | HSWA s36, ES Regs |
| Dust/airborne | Medium (3×3=9) | RPE (P2), wet cutting, extraction | HSWA Regs Part 4 |
| Manual handling | Medium (3×2=6) | Mechanical aids, 25kg max | HSWA Regs 2016 |
| Noise | Medium (3×2=6) | Hearing protection >85dB | HSWA Regs 2016 |

**Emergency Procedures:**
• Assembly point: Ground floor car park — north corner
• First aid kit: Site office (Level 3) — checked weekly
• Nearest hospital: Auckland City Hospital (2.1km, 6 mins)

**Toolbox Talk Schedule — Week 1:**
• Monday: Site induction + hazard register walkthrough
• Wednesday: Working at heights — harness inspection and fit
• Friday: Emergency evacuation drill

*References: Health and Safety at Work Act 2015 (s36 PCBU duties, s44 worker duties), HSWA General Risk and Workplace Management Regulations 2016*`,
  },
  {
    id: "haven-compliance",
    agentId: "property",
    agentName: "HAVEN",
    agentDesignation: "ASM-018",
    agentColor: "#FF80AB",
    category: "Business",
    outputType: "Healthy Homes Compliance Check",
    content: `**PROPERTY:** 14 Rata Street, Mt Eden, Auckland
**LANDLORD:** K. Peterson | **TENANT:** J. & M. Sharma | **Tenancy start:** 1 March 2024

| Standard | Requirement | Status | Action |
|---|---|---|---|
| Heating | Fixed heater, min 1.5kW | ✅ PASS | Daikin heat pump (3.5kW) |
| Ceiling Insulation | R 2.9 minimum | ✅ PASS | R3.2 installed 2022 |
| Underfloor Insulation | R 1.3 minimum | ❌ FAIL | No insulation. Requires retrofit |
| Ventilation | Extractor fans in kitchen, bathroom | ⚠️ PARTIAL | Bathroom fan not functioning |
| Moisture & Drainage | No leaks, ground barrier | ✅ PASS | Guttering clear |
| Draught Stopping | All windows/doors seal | ⚠️ PARTIAL | 2 bedroom windows have gaps |

**Compliance Score: 4/6 — Action Required**

**Priority Remediation:**
1. ⚡ URGENT: Underfloor insulation — install to R1.3 min. Est. $2,500-$4,000
2. 🔧 HIGH: Bathroom extractor fan — repair/replace. Est. $150-$350
3. 🔧 MEDIUM: Window draught strips — 2 windows. Est. $30-$80

**Legal note:** Under the Residential Tenancies Act 1986, landlords must provide a statement of compliance. Failure may result in penalties up to $7,200.`,
  },
  {
    id: "aroha-cost",
    agentId: "hr",
    agentName: "AROHA",
    agentDesignation: "ASM-038",
    agentColor: "#FF6F91",
    category: "HR",
    outputType: "True Employment Cost Calculation",
    content: `**EMPLOYEE:** Marketing Coordinator
**Base salary:** $65,000 per annum | **Hours:** 40/week | **Start:** 1 April 2026

| Component | Annual Cost | Calculation |
|---|---|---|
| Gross salary | $65,000.00 | Base |
| KiwiSaver employer (3%) | $1,950.00 | $65,000 × 3% |
| ACC employer levy (~$0.63/$100) | $409.50 | $65,000 × 0.0063 |
| Annual leave accrual (4 weeks) | $5,000.00 | 4/52 × $65,000 |
| Sick leave accrual (10 days) | $2,500.00 | 10/260 × $65,000 |
| Public holidays (11.5 days avg) | $2,884.62 | 11.5/260 × $65,000 |
| **TRUE EMPLOYER COST** | **$77,744.12** | **+19.6% above base** |

**Employee Take-Home (per fortnight):**

| Component | Amount |
|---|---|
| Gross pay | $2,500.00 |
| PAYE tax | -$459.62 |
| ACC earner levy (1.6%) | -$40.00 |
| KiwiSaver employee (3%) | -$75.00 |
| **Net take-home** | **$1,925.38** |

*Rates current 1 April 2026. Minimum wage: $23.95/hr. KiwiSaver Act 2006. PAYE per Income Tax Act 2007.*`,
  },
  {
    id: "forge-fi",
    agentId: "automotive",
    agentName: "FORGE",
    agentDesignation: "ASM-006",
    agentColor: "#FF4D6A",
    category: "Business",
    outputType: "Finance Payment Comparison",
    content: `**VEHICLE:** 2024 Tesla Model 3 RWD | **Price:** $52,990
**Deposit:** $10,000 | **Amount financed:** $42,990

| | Dealer Finance | Bank Loan | MARAC Motor |
|---|---|---|---|
| Interest rate | 9.95% p.a. | 8.49% p.a. | 11.95% p.a. |
| Term | 60 months | 60 months | 60 months |
| Monthly repayment | $912.34 | $880.45 | $955.18 |
| Total interest | $11,750.40 | $9,837.00 | $14,320.80 |
| Total cost of credit | $54,740.40 | $52,827.00 | $57,310.80 |
| Establishment fee | $375.00 | $200.00 | $400.00 |
| **TOTAL YOU PAY** | **$65,115.40** | **$63,027.00** | **$67,710.80** |

**Savings choosing Bank Loan vs Dealer Finance: $2,088.40**
**Savings vs MARAC Motor: $4,683.80**

*Finance calculations are indicative only. Total cost of credit includes all interest and fees as required under CCCFA 2003.*`,
  },
  {
    id: "ledger-paye",
    agentId: "accounting",
    agentName: "LEDGER",
    agentDesignation: "ASM-014",
    agentColor: "#4FC3F7",
    category: "Business",
    outputType: "PAYE Take-Home Pay Calculator",
    content: `**EMPLOYEE:** Annual salary $85,000 | Tax code: M | KiwiSaver: 3%

| Income Band | Rate | Tax |
|---|---|---|
| $0 – $14,000 | 10.5% | $1,470.00 |
| $14,001 – $48,000 | 17.5% | $5,950.00 |
| $48,001 – $70,000 | 30% | $6,600.00 |
| $70,001 – $85,000 | 33% | $4,950.00 |
| **Total PAYE** | | **$18,970.00** |

| Deduction | Annual | Fortnightly |
|---|---|---|
| Gross pay | $85,000.00 | $3,269.23 |
| PAYE | -$18,970.00 | -$729.62 |
| ACC earner levy (1.6%) | -$1,360.00 | -$52.31 |
| KiwiSaver (3%) | -$2,550.00 | -$98.08 |
| **Net take-home** | **$62,120.00** | **$2,389.23** |

Effective tax rate: 22.3%
Employer also pays: KiwiSaver 3% ($2,550) + ACC employer levy ($535.50)

*Rates current 1 April 2026. ACC earner levy rate is approximate and updated annually.*`,
  },
  {
    id: "prism-campaign",
    agentId: "marketing",
    agentName: "PRISM",
    agentDesignation: "ASM-011",
    agentColor: "#E040FB",
    category: "Business",
    outputType: "Full Campaign from One-Paragraph Brief",
    content: `**Brief:** 'Assembl is launching FORGE with an F&I calculator for car dealerships. Target: NZ dealership owners. Goal: 10 demo requests in 2 weeks. Budget: organic only.'

**Email Subject Options:**
1. Your F&I department just got an upgrade
2. The calculator your dealership is missing
3. FORGE: Built for NZ dealerships, not US ones

**LinkedIn Post:**
NZ dealerships lost an average of $2,088 per deal to suboptimal finance structuring last quarter. Not because the F&I team is bad. Because comparing 3 lender offers, calculating CCCFA-compliant disclosures, and running lease-vs-buy models takes time they don't have. FORGE does it in 30 seconds.

**Instagram Carousel (5 slides):**
Slide 1: "Your F&I team is leaving money on every deal"
Slide 2: Compare 3 finance offers side-by-side in seconds
Slide 3: CCCFA-compliant disclosures generated automatically
Slide 4: Lease vs buy analysis with NZ-specific rates
Slide 5: Try FORGE free → assembl.co.nz

**Posting Schedule:**
Day 1: LinkedIn (8am) + IG carousel (12pm)
Day 3: IG Reel (7am) + LinkedIn engagement
Day 5: Email blast
Day 7: LinkedIn follow-up post with results
Day 10: IG Stories series
Day 14: Final push + results report`,
  },
  {
    id: "vault-mortgage",
    agentId: "vault",
    agentName: "VAULT",
    agentDesignation: "ASM-039",
    agentColor: "#4FC3F7",
    category: "Lifestyle",
    outputType: "Mortgage Comparison Report",
    content: `**SCENARIO:** First home buyer, Auckland. Purchase price $875,000. Deposit $175,000 (20%). Loan $700,000. Term 30 years.

| Bank | Fixed Rate (2yr) | Monthly Payment | Total Interest | Total Cost |
|---|---|---|---|---|
| ANZ | 5.29% | $3,877 | $695,720 | $1,395,720 |
| ASB | 5.19% | $3,833 | $679,880 | $1,379,880 |
| Westpac | 5.39% | $3,922 | $711,920 | $1,411,920 |
| BNZ | 5.25% | $3,859 | $689,240 | $1,389,240 |

**Best option: ASB at 5.19% saves $32,040 over the loan life vs Westpac**

**Split loan strategy recommendation:**
$400,000 fixed 2yr at 5.19% + $300,000 floating at 6.89%
Monthly: $2,190 (fixed) + $1,975 (floating) = $4,165
Benefit: Can make extra payments on floating portion without break fees

*Rates indicative as at March 2026. Confirm with your lender or a licensed financial adviser.*`,
  },
  {
    id: "shield-insurance",
    agentId: "shield",
    agentName: "SHIELD",
    agentDesignation: "ASM-040",
    agentColor: "#7E57C2",
    category: "Lifestyle",
    outputType: "Home Insurance Sum Insured Estimate",
    content: `**PROPERTY:** 3-bedroom weatherboard house, 1960s, 140m², Mt Eden, Auckland

| Component | Estimate |
|---|---|
| Rebuild cost per m² (weatherboard, Auckland) | $3,200 |
| Total rebuild cost (140m²) | $448,000 |
| Demolition & site clearance | $25,000 |
| Professional fees (architect, engineer, consents) | $45,000 |
| Temporary accommodation (12 months est.) | $36,000 |
| Inflation buffer (10%) | $55,400 |
| **Recommended sum insured** | **$609,400** |

**EQC/Toka Tū Ake cover:** First $300,000 of dwelling damage from natural disasters
**Private insurer covers:** Everything above $300,000 + non-natural disaster claims

**Risk factors for this address:**
• Earthquake zone: High (Auckland Volcanic Field)
• Flood risk: Low (elevated position)
• Tsunami zone: Not applicable (inland)
• Volcanic: Moderate (proximity to volcanic field)

*Estimate only. Confirm rebuild costs with a registered quantity surveyor.*`,
  },
];

const ContentCard = ({ output }: { output: SampleOutput }) => {
  const [expanded, setExpanded] = useState(false);
  const lines = output.content.split("\n");
  const preview = lines.slice(0, 12).join("\n");
  const needsTruncate = lines.length > 12;

  return (
    <div
      className="rounded-xl overflow-hidden break-inside-avoid mb-4"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Agent colour stripe */}
      <div className="h-1" style={{ background: `${output.agentColor}30` }} />

      <div className="p-5 space-y-3">
        {/* Agent badge */}
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: output.agentColor }}
          />
          <span
            className="font-mono-jb text-[10px] tracking-wide"
            style={{ color: `${output.agentColor}80` }}
          >
            {output.agentName} · {output.agentDesignation}
          </span>
        </div>

        {/* Output type */}
        <h3
          className="font-syne font-bold text-sm"
          style={{ color: "hsl(var(--foreground))" }}
        >
          {output.outputType}
        </h3>

        {/* Content */}
        <div
          className="font-jakarta text-xs leading-relaxed whitespace-pre-line"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          {expanded ? output.content : preview}
          {needsTruncate && !expanded && "…"}
        </div>

        {/* Expand / Collapse */}
        {needsTruncate && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-jakarta transition-colors"
            style={{ color: output.agentColor }}
          >
            {expanded ? (
              <>
                Collapse <ChevronUp size={12} />
              </>
            ) : (
              <>
                See full output <ChevronDown size={12} />
              </>
            )}
          </button>
        )}

        {/* CTA */}
        <Link
          to={`/chat/${output.agentId}`}
          className="inline-flex items-center gap-1.5 text-xs font-jakarta font-semibold px-3 py-1.5 rounded-md transition-all"
          style={{
            background: `${output.agentColor}15`,
            color: output.agentColor,
            border: `1px solid ${output.agentColor}30`,
          }}
        >
          Try {output.agentName} →
        </Link>
      </div>
    </div>
  );
};

const ContentHub = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const filterRef = useRef<HTMLDivElement>(null);

  const filtered =
    activeCategory === "All"
      ? SAMPLE_OUTPUTS
      : SAMPLE_OUTPUTS.filter((o) => o.category === activeCategory);

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <BrandNav />

      {/* Hero */}
      <section className="relative px-4 sm:px-8 pt-16 pb-10 text-center">
        <h1
          className="font-syne font-extrabold text-2xl sm:text-4xl tracking-tight halo-heading"
          style={{ color: "hsl(var(--foreground))" }}
        >
          See what your AI workforce creates
        </h1>
        <p
          className="mt-3 font-jakarta text-sm sm:text-base max-w-xl mx-auto"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Every agent generates real, usable business documents. Browse sample
          outputs below.
        </p>
      </section>

      {/* Sticky filter bar */}
      <div
        ref={filterRef}
        className="sticky top-0 z-40 px-4 sm:px-8 py-3 border-b"
        style={{
          background: "rgba(9,9,15,0.9)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-jakarta font-medium transition-all"
                style={{
                  background: active
                    ? "rgba(255,255,255,0.08)"
                    : "transparent",
                  color: active
                    ? "hsl(var(--foreground))"
                    : "rgba(255,255,255,0.4)",
                  border: active
                    ? "1px solid rgba(255,255,255,0.15)"
                    : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Masonry grid */}
      <section className="px-4 sm:px-8 py-8 max-w-6xl mx-auto">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {filtered.map((output) => (
            <ContentCard key={output.id} output={output} />
          ))}
        </div>
      </section>

      <BrandFooter />
    </div>
  );
};

export default ContentHub;
