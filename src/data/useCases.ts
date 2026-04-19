import type { UseCaseData } from "@/components/kete/KeteUseCaseSection";

export const MANAAKI_USE_CASE: UseCaseData = {
  audience: "Duty managers, owner-operators, kitchen leads",
  market: "23,000 NZ businesses under the Food Act",
  persona: { name: "Sarah", role: "Owner-operator, 30-seat Wellington bistro" },
  situation: "Every afternoon Sarah does the shift handover — roster, prep status, allergen watch, VIPs, near-misses from last night. Today she also has an FCP audit coming next week and a new kitchenhand starting. Normally that's 45 minutes of her time and a scrap of A4 she'll lose by 8pm.",
  assembl: "Sarah opens MANAAKI, drops in tonight's roster, dictates the two things from last night (a stock rotation miss and a customer intolerance flag). MANAAKI produces a one-page shift brief, an allergen checklist for tonight's menu, an FCP readiness note for next week, and a toolbox-chat script for the new hire. Every output is timestamped and stored as evidence against her food-control plan.",
  benefits: [
    { icon: "time", label: "Time saved", detail: "45 min → 4 min per shift × 6 shifts/week = 4 hours back in Sarah's week." },
    { icon: "risk", label: "Risk reduction", detail: "Miss an allergen cross-contact → MPI investigation, $5k–$50k fines, reputation damage." },
    { icon: "insurance", label: "Insurance", detail: "Evidence-logged handovers are a measurable factor in liability cover renewal." },
    { icon: "people", label: "Staff retention", detail: "Clear briefs reduce shift-change mistakes — one of the top reasons hospo staff quit." },
  ],
  economyBenefit: "Hospitality contributes ~$11.5B and 140,000+ jobs. Even a 5% reduction in food-safety incidents + a 2-hour-per-week admin reduction per owner-operator across 23,000 outlets is worth hundreds of millions in sector productivity.",
  accentColor: "#D4A843",
};

export const WAIHANGA_USE_CASE: UseCaseData = {
  audience: "Small-to-mid builders, LBPs and their subbies",
  market: "60,000+ licensed building practitioners, most running businesses with <10 staff",
  persona: { name: "Dave", role: "Builder going from solo to a 4-person crew" },
  situation: "On Sunday night Dave is sitting at the kitchen table with a coffee writing a SWMS for a new subbie starting Monday, trying to remember if the scaffold sign-off needs renewal, and drafting a variation letter for a client who keeps changing their mind about the kitchen.",
  assembl: "Dave uploads the architect's PDF for the job and tells WAIHANGA \"new subbie Mike starts Monday, roofing stage.\" WAIHANGA produces a site-specific SWMS for the roofing task, an induction checklist tailored to the subbie's role, the scaffold sign-off reminder schedule, and a Construction Contracts Act–compliant variation letter using the client's own words from the email chain. Dave reviews, signs, moves on.",
  benefits: [
    { icon: "time", label: "Time saved", detail: "3 hours of Sunday night → 15 min on his phone. That's his weekend back." },
    { icon: "risk", label: "Legal defence", detail: "H&S at Work Act fines start at $250k for reckless conduct. A properly documented SWMS is a legal defence." },
    { icon: "money", label: "Cash flow", detail: "CCA-compliant variations + payment claims mean subbies get paid on time — reducing disputes and retention-money write-offs." },
    { icon: "insurance", label: "Winning work", detail: "\"We have documented SWMS on every job\" is a tender differentiator with commercial clients." },
  ],
  economyBenefit: "Construction is 7% of GDP and the highest-injury industry. WorkSafe prosecutes 100+ construction cases a year. Scalable, site-specific H&S documentation for the long tail of small builders — who can't afford a dedicated H&S manager — directly addresses the productivity AND safety crisis the sector is in.",
  accentColor: "#3A7D6E",
};

export const AUAHA_USE_CASE: UseCaseData = {
  audience: "Marketing managers, in-house content teams, small creative agencies",
  market: "Thousands of NZ brands shipping content weekly across social, email, ads",
  persona: { name: "Maya", role: "Marketing manager, Auckland food brand, team of two" },
  situation: "Maya has to ship 10 campaigns a month — social carousels, email newsletters, ad copy, occasional press release. Her brief from the CEO: \"use more NZ imagery, warm and authentic, don't get us cancelled.\" She's lying awake at night about the cultural-appropriation risk.",
  assembl: "Maya opens AUAHA, drops in the campaign brief. AUAHA generates the carousel copy, the email variant, three ad headlines — on-brand, plain English. When Maya types \"add some te reo and Māori motifs for Waitangi Day\", AUAHA pauses, explains the three specific risks (te reo without consultation, imagery rights, commercial use), and offers three alternative paths: a tauiwi-respectful campaign, a consultation brief to take to a Māori advisor, or a reflection piece. Maya picks the consultation-brief path, AUAHA drafts the questions and proposed scope to send to a consultant.",
  benefits: [
    { icon: "time", label: "Speed", detail: "Campaign production 3 hours → 30 minutes." },
    { icon: "risk", label: "Brand safety", detail: "The single worst outcome — a public cultural-insensitivity incident — is prevented structurally, not manually." },
    { icon: "money", label: "Cost", detail: "$180/hour agency rates for basic content work are eliminated for 80% of output." },
    { icon: "insurance", label: "Evidence trail", detail: "Every decision is logged, giving the CEO, the board and any future auditor a clean paper trail." },
  ],
  economyBenefit: "NZ's creative economy is ~$17.5B. The cultural-risk cost — brands pulling campaigns, reputational fallout, relationship damage with iwi.",
  accentColor: "#F0D078",
};

export const ARATAKI_USE_CASE: UseCaseData = {
  audience: "Fleet operators — couriers, trades fleets, sales-rep fleets, small transport companies",
  market: "120,000+ NZ businesses running 2+ vehicles",
  persona: { name: "Tui", role: "Fleet manager, 6 courier vans, South Auckland depot" },
  situation: "Fuel is eating 30% of revenue. Last month one of Tui's drivers ran over-hours on the Hamilton route and she didn't catch it until the logbook audit. Tomorrow morning she's got a 3-pallet Auckland → Taupō → Napier run and she doesn't know which van to put on it or whether to refill in Tīrau or Taupō.",
  assembl: "Tui opens ARATAKI, picks \"plan tomorrow's run.\" ARATAKI pulls live NZ fuel prices across Z, BP, Mobil, Gull and Waitomo, overlays live weather + roadworks, checks each van's WoF/CoF/RUC state, checks driver hours under the Land Transport Rule, and outputs the optimal assignment: \"Put Van 3 on the run, fuel in Tīrau (saves $18 vs Taupō today), driver Mere has 9.5 hours of available driving which fits within rest-break rules, trip evidence pack will auto-generate for insurance.\"",
  benefits: [
    { icon: "money", label: "Fuel savings", detail: "6–11% typical on fuel-optimised routing — for a 6-van fleet that's $18k–$30k/year straight to the bottom line." },
    { icon: "risk", label: "Compliance", detail: "Driver-hour violations caught in real time, not at audit. One prosecution avoided pays for the platform for a decade." },
    { icon: "insurance", label: "Insurance", detail: "Contemporaneous trip evidence meaningfully changes claim outcomes. Brokers increasingly ask for it." },
    { icon: "time", label: "Vehicle lifecycle", detail: "Predictive WoF/CoF/RUC/servicing means no unplanned off-road days." },
  ],
  economyBenefit: "Road transport is 5% of NZ emissions and a huge productivity lever for every regional business. A few percent of fuel reduction + zero logbook violations + insurance-grade trip evidence at the SME fleet layer is worth hundreds of millions annually — AND directly supports the low-emissions freight transition.",
  accentColor: "#E8E8E8",
};

export const PIKAU_USE_CASE: UseCaseData = {
  audience: "Freight forwarders, importer/exporters, customs brokers",
  market: "The spine of NZ's $100B+ import/export economy",
  persona: { name: "Ben", role: "Small freight-forwarding business owner" },
  situation: "Today Ben's got a mixed consignment leaving Tauranga for Christchurch with a stop-off at a distribution centre, plus an export manifest for a client shipping avocados to Australia. Customs forms changed in February. Biosecurity declarations are different for the AU market than the last one he did. One wrong field on the manifest and the shipment sits on the wharf.",
  assembl: "Ben drops the consignment details into PIKAU. PIKAU plans the NZ leg using live fuel + road + weather data, generates the Customs & Excise Act 2018–compliant manifest for the export, flags the biosecurity declaration fields specific to avocado exports to AU, and produces the driver's compliance pack for the domestic leg. Ben reviews, submits, gets on with the rest of his day.",
  benefits: [
    { icon: "time", label: "Speed", detail: "Customs paperwork prep 2 hours → 10 minutes." },
    { icon: "risk", label: "Biosecurity", detail: "Biosecurity delays cost NZ exporters millions annually in spoiled perishables — PIKAU catches mismatches before the consignment leaves." },
    { icon: "people", label: "Capacity", detail: "A single forwarder can handle 3–4× the volume with the same team." },
    { icon: "insurance", label: "Data product", detail: "Every shipment's compliance data becomes a reusable asset — pattern-spotting across clients, flagging regulatory change impact early." },
  ],
  economyBenefit: "Exports are 27% of GDP. Friction at the Customs/Biosecurity layer is a hidden tax on every exporter. Reducing error rates on manifests + reducing freight-forwarder capacity constraints directly lowers the cost of getting NZ product to global markets — a lever government has been trying to pull for decades.",
  accentColor: "#7ECFC2",
};

export const ALL_USE_CASES = [
  { kete: "Manaaki", en: "Hospitality", data: MANAAKI_USE_CASE, to: "/manaaki" },
  { kete: "Waihanga", en: "Construction", data: WAIHANGA_USE_CASE, to: "/waihanga/about" },
  { kete: "Auaha", en: "Creative", data: AUAHA_USE_CASE, to: "/auaha/about" },
  { kete: "Arataki", en: "Automotive", data: ARATAKI_USE_CASE, to: "/arataki" },
  { kete: "Pikau", en: "Freight", data: PIKAU_USE_CASE, to: "/pikau" },
];
