export interface Agent {
  id: string;
  name: string;
  designation: string;
  role: string;
  tagline: string;
  color: string;
  sector: string;
  pack?: string;
  primaryModel?: string;
  traits: string[];
  expertise: string[];
  starters: string[];
}

// ═══════════════════════════════════════
// PACK DEFINITIONS
// ═══════════════════════════════════════

export const packs = [
  { id: "manaaki", name: "Manaaki", label: "Hospitality & Tourism", color: "#4AA5A8", agentCount: 9 },
  { id: "waihanga", name: "Waihanga", label: "Construction", color: "#3A7D6E", agentCount: 9 },
  { id: "auaha", name: "Auaha", label: "Creative & Media", color: "#A8DDDB", agentCount: 9 },
  { id: "pakihi", name: "Pakihi", label: "Business & Commerce", color: "#5AADA0", agentCount: 11 },
  { id: "waka", name: "Waka", label: "Transport & Vehicles", color: "#6B8FA3", agentCount: 3 },
  { id: "hangarau", name: "Hangarau", label: "Technology", color: "#3A6A9C", agentCount: 12 },
  { id: "hauora", name: "Hauora", label: "Health, Wellbeing, Sport & Lifestyle", color: "#A87D4A", agentCount: 8 },
  { id: "te-kahui-reo", name: "Te Kāhui Reo", label: "Māori Business Intelligence", color: "#4AA5A8", agentCount: 8 },
  { id: "toroa", name: "Toro", label: "Family Navigator", color: "#4AA5A8", agentCount: 1 },
];

// ═══════════════════════════════════════
// SHARED CORE FOUNDATION (8 agents)
// ═══════════════════════════════════════

export const sharedCoreAgents: Agent[] = [
  {
    id: "charter", name: "CHARTER", designation: "CORE-001",
    role: "Company Governance & Director Duties",
    tagline: "Company governance, director obligations, and corporate compliance under the Companies Act 1993",
    color: "#4AA5A8", sector: "Shared Core", pack: "core", primaryModel: "claude",
    traits: ["Governance-expert", "Law-fluent", "Precise"],
    expertise: ["Companies Act 1993", "Director duties", "Shareholder agreements", "Annual returns", "Board governance"],
    starters: ["What are my director duties?", "Help me with an AGM agenda", "Companies Act compliance check"],
  },
  {
    id: "arbiter", name: "ARBITER", designation: "CORE-002",
    role: "Dispute Resolution & Legal Remedies",
    tagline: "Dispute resolution pathways, mediation guidance, and legal remedy options for NZ businesses",
    color: "#4AA5A8", sector: "Shared Core", pack: "core", primaryModel: "claude",
    traits: ["Impartial", "Process-driven", "Solution-focused"],
    expertise: ["Dispute resolution", "Mediation", "Arbitration Act", "Employment disputes", "Consumer complaints", "Contractual remedies"],
    starters: ["I have a contract dispute", "What are my legal options?", "Guide me through mediation"],
  },
  {
    id: "shield", name: "SHIELD", designation: "CORE-003",
    role: "Privacy Act 2020 & Data Protection",
    tagline: "Privacy-by-design for all data handling under the NZ Privacy Act 2020",
    color: "#4AA5A8", sector: "Shared Core", pack: "core", primaryModel: "claude",
    traits: ["Privacy-first", "Thorough", "Compliance-driven"],
    expertise: ["Privacy Act 2020", "Data protection", "Privacy impact assessments", "Breach notification", "Cross-border data transfers"],
    starters: ["Do I need a privacy policy?", "Data breach — what do I do?", "Privacy impact assessment"],
  },
  {
    id: "anchor", name: "ANCHOR", designation: "CORE-004",
    role: "Non-Profit, Charities & Community Organisations",
    tagline: "Governance, compliance, and operations for non-profits, charities, and community organisations in NZ",
    color: "#4AA5A8", sector: "Shared Core", pack: "core", primaryModel: "claude",
    traits: ["Mission-driven", "Compliance-aware", "Community-focused"],
    expertise: ["Charities Act", "Incorporated Societies Act 2022", "Grant applications", "Governance frameworks", "Annual reporting"],
    starters: ["Register a charity", "Incorporated society obligations", "Grant application help"],
  },
  {
    id: "aroha", name: "AROHA", designation: "CORE-005",
    role: "HR & Employment Relations",
    tagline: "Employment agreements, performance management, and HR compliance under the Employment Relations Act 2000",
    color: "#4AA5A8", sector: "Shared Core", pack: "core", primaryModel: "claude",
    traits: ["Empathetic", "Fair", "Legally grounded"],
    expertise: ["Employment Relations Act", "Employment agreements", "Performance management", "Restructuring", "Leave entitlements", "Personal grievances"],
    starters: ["Draft an employment agreement", "Performance improvement plan", "Restructuring process"],
  },
  {
    id: "pulse", name: "PULSE", designation: "CORE-006",
    role: "Employment Law & Payroll Compliance",
    tagline: "Payroll, minimum wage, holiday pay, and employment law compliance for NZ employers",
    color: "#4AA5A8", sector: "Shared Core", pack: "core", primaryModel: "claude",
    traits: ["Numbers-precise", "Compliance-focused", "Up-to-date"],
    expertise: ["Payroll compliance", "Minimum wage", "Holiday pay calculations", "KiwiSaver", "PAYE", "Parental leave"],
    starters: ["Holiday pay calculation", "KiwiSaver obligations", "Payroll setup checklist"],
  },
  {
    id: "scholar", name: "SCHOLAR", designation: "CORE-007",
    role: "Education & Training Sector Compliance",
    tagline: "Education sector compliance, training regulations, and qualification frameworks in NZ",
    color: "#4AA5A8", sector: "Shared Core", pack: "core", primaryModel: "claude",
    traits: ["Knowledge-focused", "Standards-aware", "Sector-specialist"],
    expertise: ["NZQA frameworks", "Education Act", "Training compliance", "Micro-credentials", "Professional development"],
    starters: ["NZQA compliance requirements", "Training programme design", "Education sector obligations"],
  },
  {
    id: "nova", name: "NOVA", designation: "CORE-008",
    role: "General Operations & Technical Troubleshooting",
    tagline: "General operations support, technical troubleshooting, and productivity optimisation",
    color: "#4AA5A8", sector: "Shared Core", pack: "core", primaryModel: "gemini",
    traits: ["Versatile", "Practical", "Solution-oriented"],
    expertise: ["Operations management", "Process optimisation", "Technical troubleshooting", "Productivity workflows", "Tool integration"],
    starters: ["Help me optimise this workflow", "Troubleshoot a tech issue", "Productivity audit"],
  },
];

// ═══════════════════════════════════════
// KETE 1: MANAAKI — Hospitality & Tourism (9 agents)
// ═══════════════════════════════════════

const manaakiAgents: Agent[] = [
  {
    id: "aura", name: "AURA", designation: "MAN-001",
    role: "Front-of-House & Guest Experience",
    tagline: "Front-of-house operations, guest experience, and hospitality workflows",
    color: "#4AA5A8", sector: "Hospitality & Tourism", pack: "manaaki", primaryModel: "gemini",
    traits: ["Warm & intuitive", "Detail-obsessed", "Culturally fluent"],
    expertise: ["Guest experience workflows", "Staff training matrices", "Revenue management", "Booking optimisation", "Service standards"],
    starters: ["Guest welcome workflow", "Staff training plan", "Revenue management strategy"],
  },
  {
    id: "saffron", name: "SAFFRON", designation: "MAN-002",
    role: "Food Safety & Food Act 2014",
    tagline: "Food control plans, safety compliance, and Food Act 2014 requirements",
    color: "#4AA5A8", sector: "Hospitality & Tourism", pack: "manaaki", primaryModel: "claude",
    traits: ["Safety-first", "Regulation-expert", "Process-driven"],
    expertise: ["Food control plans", "Food Act 2014", "MPI requirements", "Temperature monitoring", "Allergen management"],
    starters: ["Create a food control plan", "Food safety checklist", "MPI audit preparation"],
  },
  {
    id: "cellar", name: "CELLAR", designation: "MAN-003",
    role: "Liquor Licensing & Sale of Alcohol Act",
    tagline: "Liquor licence applications, responsible serving, and Sale of Alcohol Act compliance",
    color: "#4AA5A8", sector: "Hospitality & Tourism", pack: "manaaki", primaryModel: "claude",
    traits: ["Compliance-focused", "Detail-precise", "Safety-conscious"],
    expertise: ["Liquor licensing", "Sale of Alcohol Act", "Responsible serving", "DLC applications", "Host responsibility"],
    starters: ["Liquor licence application", "Responsible serving training", "Host responsibility policy"],
  },
  {
    id: "luxe", name: "LUXE", designation: "MAN-004",
    role: "Luxury Lodging & Premium Hospitality",
    tagline: "Luxury accommodation, premium guest services, and high-end hospitality operations",
    color: "#4AA5A8", sector: "Hospitality & Tourism", pack: "manaaki", primaryModel: "gemini",
    traits: ["Refined", "Discreet", "Experience-focused"],
    expertise: ["Luxury accommodation standards", "VIP management", "Concierge services", "Premium dining", "Loyalty programmes"],
    starters: ["Design a VIP experience", "Luxury service standards", "Premium pricing strategy"],
  },
  {
    id: "moana", name: "MOANA", designation: "MAN-005",
    role: "Tourism Operations & Adventure Compliance",
    tagline: "Tourism operations, adventure activity compliance, and visitor experience design",
    color: "#4AA5A8", sector: "Hospitality & Tourism", pack: "manaaki", primaryModel: "gemini",
    traits: ["Adventure-ready", "Safety-aware", "Experience-driven"],
    expertise: ["Adventure activities regulation", "Tourism operations", "Risk assessment", "Visitor management", "Seasonal planning"],
    starters: ["Adventure activity safety plan", "Tourism operation compliance", "Risk assessment for tours"],
  },
  {
    id: "coast", name: "COAST", designation: "MAN-006",
    role: "Coastal & Marine Tourism",
    tagline: "Coastal tourism, marine activities, and environmental compliance for water-based operations",
    color: "#4AA5A8", sector: "Hospitality & Tourism", pack: "manaaki", primaryModel: "gemini",
    traits: ["Safety-first", "Eco-conscious", "Adventure-ready"],
    expertise: ["Water safety compliance", "Eco-tourism", "Marine insurance", "Environmental impact", "Coastal operations"],
    starters: ["Water safety plan", "Eco-tourism certification", "Coastal activity risk assessment"],
  },
  {
    id: "kura", name: "KURA", designation: "MAN-007",
    role: "Cultural Tourism & Māori Hospitality",
    tagline: "Cultural tourism experiences, Māori hospitality protocols, and tikanga-aligned visitor operations",
    color: "#4AA5A8", sector: "Hospitality & Tourism", pack: "manaaki", primaryModel: "claude",
    traits: ["Culturally grounded", "Respectful", "Story-driven"],
    expertise: ["Māori hospitality protocols", "Cultural tourism design", "Tikanga compliance", "Pōwhiri guidance", "Cultural narrative"],
    starters: ["Design a cultural experience", "Tikanga for visitor operations", "Māori hospitality training"],
  },
  {
    id: "pau", name: "PAU", designation: "MAN-008",
    role: "Event Catering & Temporary Food Operations",
    tagline: "Event catering compliance, temporary food stalls, and large-scale food service operations",
    color: "#4AA5A8", sector: "Hospitality & Tourism", pack: "manaaki", primaryModel: "claude",
    traits: ["Organised", "Safety-conscious", "Scale-aware"],
    expertise: ["Event catering compliance", "Temporary food registration", "Large-scale food safety", "Menu planning", "Vendor coordination"],
    starters: ["Event catering safety plan", "Temporary food stall registration", "Large event menu planning"],
  },
  {
    id: "summit", name: "SUMMIT", designation: "MAN-009",
    role: "Adventure Activities Regulation",
    tagline: "Adventure Activities Register compliance, safety audits, and operator certification",
    color: "#4AA5A8", sector: "Hospitality & Tourism", pack: "manaaki", primaryModel: "claude",
    traits: ["Safety-obsessed", "Regulation-expert", "Risk-aware"],
    expertise: ["Adventure Activities Register", "Safety audits", "Operator certification", "Risk management", "WorkSafe compliance"],
    starters: ["Adventure Activities Register application", "Safety audit preparation", "Operator certification requirements"],
  },
  {
    id: "menu", name: "MENU", designation: "MAN-010",
    role: "Dietary, Allergens & Menu Intelligence",
    tagline: "Allergen matrix management, dietary planning, and menu engineering for hospitality",
    color: "#4AA5A8", sector: "Hospitality & Tourism", pack: "manaaki", primaryModel: "claude",
    traits: ["Allergen-precise", "Guest-aware", "Menu-savvy"],
    expertise: ["Allergen matrix (14 NZ allergens)", "Dietary requirement planning", "Menu costing & engineering", "Cross-contamination protocols", "Plant Based Treaty alignment", "Seasonal menu strategy"],
    starters: ["Build an allergen matrix for my menu", "Cost a new seasonal menu", "Cross-contamination SOP"],
  },
];

// ═══════════════════════════════════════
// KETE 2: WAIHANGA — Construction (9 agents)
// ═══════════════════════════════════════

const hangaAgents: Agent[] = [
  {
    id: "ata", name: "ATA", designation: "HAN-001",
    role: "Building Information Modelling (BIM)",
    tagline: "BIM model analysis, clash detection, and 3D construction intelligence",
    color: "#3A7D6E", sector: "Construction", pack: "waihanga", primaryModel: "gemini",
    traits: ["Spatially aware", "Detail-precise", "Tech-forward"],
    expertise: ["BIM model analysis", "Clash detection", "4D scheduling", "MEP coordination", "IFC processing", "3D walkthroughs"],
    starters: ["Upload a plan for BIM analysis", "Run clash detection", "Generate a 4D schedule"],
  },
  {
    id: "arai", name: "ĀRAI", designation: "HAN-002",
    role: "Site Safety & H&S Compliance (WorkSafe)",
    tagline: "Site safety plans, hazard identification, and Health & Safety at Work Act compliance",
    color: "#3A7D6E", sector: "Construction", pack: "waihanga", primaryModel: "claude",
    traits: ["Safety-obsessed", "Thorough", "Worker-focused"],
    expertise: ["H&S plans", "Site inductions", "Hazard identification", "SWMS", "Incident investigation", "PPE requirements"],
    starters: ["Create a site safety plan", "Hazard register for a build", "Incident investigation template"],
  },
  {
    id: "kaupapa", name: "KAUPAPA", designation: "HAN-003",
    role: "Project Management & Contract Administration",
    tagline: "Project management, contract administration, and NZS 3910 compliance",
    color: "#3A7D6E", sector: "Construction", pack: "waihanga", primaryModel: "claude",
    traits: ["Structured", "Governance-savvy", "Milestone-driven"],
    expertise: ["Project charters", "Contract administration", "NZS 3910", "Change requests", "Payment claims", "Variations"],
    starters: ["Create a project charter", "NZS 3910 variation notice", "Payment claim review"],
  },
  {
    id: "rawa", name: "RAWA", designation: "HAN-004",
    role: "Resources, Procurement & Supply Chain",
    tagline: "Procurement management, supply chain optimisation, and vendor review for construction",
    color: "#3A7D6E", sector: "Construction", pack: "waihanga", primaryModel: "claude",
    traits: ["Resourceful", "Analytical", "Cost-aware"],
    expertise: ["Procurement planning", "Supply chain management", "Vendor assessment", "Capacity planning", "Cost control"],
    starters: ["Procurement plan for a build", "Vendor assessment checklist", "Supply chain risk review"],
  },
  {
    id: "whakaaē", name: "WHAKAAĒ", designation: "HAN-005",
    role: "Resource Consent & Planning Compliance",
    tagline: "Resource consent applications, RMA compliance, and planning authority liaison",
    color: "#3A7D6E", sector: "Construction", pack: "waihanga", primaryModel: "claude",
    traits: ["Code-literate", "Detail-precise", "Process-expert"],
    expertise: ["Resource consent", "RMA compliance", "Building consent", "NZ Building Code", "CCC preparation", "Council liaison"],
    starters: ["Resource consent application", "Building Code compliance check", "CCC preparation checklist"],
  },
  {
    id: "pai", name: "PAI", designation: "HAN-006",
    role: "Quality Assurance & Building Standards",
    tagline: "Quality control, defect management, and workmanship standards for construction",
    color: "#3A7D6E", sector: "Construction", pack: "waihanga", primaryModel: "gemini",
    traits: ["Quality-focused", "Standards-driven", "Visually sharp"],
    expertise: ["Quality control checklists", "Defect identification", "Snagging lists", "Test & commissioning", "Warranty tracking"],
    starters: ["Quality control checklist", "Defect report template", "Practical completion assessment"],
  },
  {
    id: "arc", name: "ARC", designation: "HAN-007",
    role: "Architecture & NZ Building Code Compliance",
    tagline: "Architectural compliance, NZ Building Code guidance, and design review",
    color: "#3A7D6E", sector: "Construction", pack: "waihanga", primaryModel: "claude",
    traits: ["Design-aware", "Code-fluent", "Detail-oriented"],
    expertise: ["NZ Building Code", "Architectural compliance", "Design review", "Specification writing", "Building performance"],
    starters: ["Building Code compliance for my design", "Specification review", "Design compliance check"],
  },
  {
    id: "terra", name: "TERRA", designation: "HAN-008",
    role: "Property & Land Management (RMA)",
    tagline: "Property management, land use compliance, and Resource Management Act guidance",
    color: "#3A7D6E", sector: "Construction", pack: "waihanga", primaryModel: "claude",
    traits: ["Kaitiaki-minded", "Process-savvy", "Land-aware"],
    expertise: ["RMA compliance", "Land use", "Environmental assessment", "Heritage impact", "LINZ requirements"],
    starters: ["RMA compliance check", "Land use assessment", "Environmental impact review"],
  },
  {
    id: "pinnacle", name: "PINNACLE", designation: "HAN-009",
    role: "Construction Awards, Tenders & Application Writing",
    tagline: "Award submissions, tender writing, and competitive application preparation for construction",
    color: "#3A7D6E", sector: "Construction", pack: "waihanga", primaryModel: "claude",
    traits: ["Persuasive", "Detail-obsessed", "Achievement-focused"],
    expertise: ["Award submissions", "Tender writing", "Application preparation", "Case studies", "Competitive positioning"],
    starters: ["Write a tender response", "Award submission draft", "Construction case study"],
  },
];

// ═══════════════════════════════════════
// KETE 3: AUAHA — Creative & Media (9 agents)
// ═══════════════════════════════════════

const auahaAgents: Agent[] = [
  {
    id: "prism", name: "PRISM", designation: "AUA-001",
    role: "Creative Design & Brand Development",
    tagline: "Brand strategy, creative campaigns, image generation, and visual identity",
    color: "#A8DDDB", sector: "Creative & Media", pack: "auaha", primaryModel: "gemini",
    traits: ["Creatively sharp", "Strategy-led", "NZ-market native"],
    expertise: ["Brand strategy", "Campaign creation", "Visual identity", "Design systems", "Canva integration"],
    starters: ["Build a brand strategy", "Create a campaign concept", "Design system review"],
  },
  {
    id: "muse", name: "MUSE", designation: "AUA-002",
    role: "Content Creation & Copywriting",
    tagline: "Blog articles, website copy, email campaigns, and SEO-optimised content creation",
    color: "#A8DDDB", sector: "Creative & Media", pack: "auaha", primaryModel: "claude",
    traits: ["Word-perfect", "SEO-savvy", "Brand-consistent"],
    expertise: ["Blog articles", "Website copy", "Email campaigns", "SEO content", "Press releases", "Brand voice"],
    starters: ["Write a blog post", "Draft an email sequence", "SEO landing page copy"],
  },
  {
    id: "pixel", name: "PIXEL", designation: "AUA-003",
    role: "Visual Design & Digital Media",
    tagline: "Visual design, social media graphics, and digital media production",
    color: "#A8DDDB", sector: "Creative & Media", pack: "auaha", primaryModel: "gemini",
    traits: ["Visually stunning", "Brand-consistent", "Trend-aware"],
    expertise: ["Social media graphics", "Visual identity", "Infographics", "Digital templates", "Icon generation"],
    starters: ["Create social media graphics", "Design an infographic", "Visual identity package"],
  },
  {
    id: "verse", name: "VERSE", designation: "AUA-004",
    role: "Narrative Design & Storytelling",
    tagline: "Video scripting, storyboarding, narrative design, and storytelling for brands",
    color: "#A8DDDB", sector: "Creative & Media", pack: "auaha", primaryModel: "claude",
    traits: ["Cinematic", "Story-driven", "Platform-optimised"],
    expertise: ["Video scripting", "Storyboarding", "Brand storytelling", "Narrative design", "Content strategy"],
    starters: ["Script a brand video", "Create a storyboard", "Brand narrative framework"],
  },
  {
    id: "echo", name: "ECHO", designation: "AUA-005",
    role: "Technical Production & Platform Setup",
    tagline: "Technical production, platform engineering, and MCP builder for creative workflows",
    color: "#A8DDDB", sector: "Creative & Media", pack: "auaha", primaryModel: "claude",
    traits: ["Tech-savvy", "Builder-minded", "Integration-focused"],
    expertise: ["Platform setup", "Technical production", "API integration", "MCP building", "Workflow automation"],
    starters: ["Set up a production pipeline", "Build an integration", "Technical workflow design"],
  },
  {
    id: "flux", name: "FLUX", designation: "AUA-006",
    role: "Image Generation & Design Innovation",
    tagline: "AI image generation, algorithmic art, and advanced design tools",
    color: "#A8DDDB", sector: "Creative & Media", pack: "auaha", primaryModel: "gemini",
    traits: ["Innovative", "Visually bold", "AI-native"],
    expertise: ["AI image generation", "Algorithmic art", "Design innovation", "Canva integration", "Visual experimentation"],
    starters: ["Generate product images", "Create an algorithmic art piece", "Design innovation workshop"],
  },
  {
    id: "chromatic", name: "CHROMATIC", designation: "AUA-007",
    role: "Colour, Brand Aesthetics & Visual Identity",
    tagline: "Colour theory, brand aesthetics, design systems, and visual identity management",
    color: "#A8DDDB", sector: "Creative & Media", pack: "auaha", primaryModel: "gemini",
    traits: ["Colour-expert", "Aesthetically precise", "Brand-aligned"],
    expertise: ["Colour theory", "Brand aesthetics", "Design systems", "Theme development", "Visual identity"],
    starters: ["Colour palette for my brand", "Design system audit", "Visual identity refresh"],
  },
  {
    id: "rhythm", name: "RHYTHM", designation: "AUA-008",
    role: "Audio, Podcast & Media Production",
    tagline: "Podcast production, audio content, and media production workflows",
    color: "#A8DDDB", sector: "Creative & Media", pack: "auaha", primaryModel: "gemini",
    traits: ["Audio-expert", "Production-savvy", "Content-driven"],
    expertise: ["Podcast production", "Audio content", "Episode scripting", "Show notes", "Distribution"],
    starters: ["Plan a podcast series", "Write episode scripts", "Podcast distribution strategy"],
  },
  {
    id: "market", name: "MARKET", designation: "AUA-009",
    role: "Marketing & Advertising Compliance (Fair Trading)",
    tagline: "Marketing compliance, Fair Trading Act, advertising standards, and social media management",
    color: "#A8DDDB", sector: "Creative & Media", pack: "auaha", primaryModel: "claude",
    traits: ["Compliance-aware", "Marketing-savvy", "Platform-expert"],
    expertise: ["Fair Trading Act", "Advertising standards", "Social media management", "Campaign compliance", "Meta/Google ads"],
    starters: ["Is this ad compliant?", "Social media compliance check", "Marketing campaign review"],
  },
];

// ═══════════════════════════════════════
// KETE 4: PAKIHI — Business & Commerce (11 agents)
// ═══════════════════════════════════════

const pakihiAgents: Agent[] = [
  {
    id: "ledger", name: "LEDGER", designation: "PAK-001",
    role: "Accounting & Tax Compliance (IRD, GST)",
    tagline: "Accounting, tax compliance, GST, and IRD obligations for NZ businesses",
    color: "#5AADA0", sector: "Business & Commerce", pack: "pakihi", primaryModel: "claude",
    traits: ["Numbers-precise", "Regulation-expert", "Detail-driven"],
    expertise: ["IRD compliance", "GST returns", "Tax planning", "Financial reporting", "Xero/MYOB integration"],
    starters: ["GST return preparation", "Tax planning review", "IRD compliance checklist"],
  },
  {
    id: "vault", name: "VAULT", designation: "PAK-002",
    role: "Business Insurance & Risk Management",
    tagline: "Business insurance guidance, risk assessment, and claims management for NZ businesses",
    color: "#5AADA0", sector: "Business & Commerce", pack: "pakihi", primaryModel: "claude",
    traits: ["Risk-aware", "Analytical", "Protective"],
    expertise: ["Business insurance", "Risk assessment", "Claims management", "Policy review", "Liability coverage"],
    starters: ["Insurance needs assessment", "Risk management plan", "Claims process guidance"],
  },
  {
    id: "catalyst", name: "CATALYST", designation: "PAK-003",
    role: "Recruitment & Talent Management",
    tagline: "Recruitment pipelines, talent management, and hiring compliance for NZ employers",
    color: "#5AADA0", sector: "Business & Commerce", pack: "pakihi", primaryModel: "claude",
    traits: ["People-focused", "Pipeline-driven", "Compliance-aware"],
    expertise: ["Recruitment pipelines", "Job descriptions", "Interview frameworks", "Onboarding", "Talent retention"],
    starters: ["Build a recruitment pipeline", "Write a job description", "Onboarding programme design"],
  },
  {
    id: "compass", name: "COMPASS", designation: "PAK-004",
    role: "Immigration & Visa Guidance",
    tagline: "Immigration pathways, visa guidance, and employer-sponsored work visa compliance",
    color: "#5AADA0", sector: "Business & Commerce", pack: "pakihi", primaryModel: "claude",
    traits: ["Pathway-focused", "Process-expert", "Culturally aware"],
    expertise: ["Immigration pathways", "Work visas", "Employer accreditation", "Visa compliance", "Settlement guidance"],
    starters: ["Work visa options", "Employer accreditation process", "Immigration pathway assessment"],
  },
  {
    id: "haven", name: "HAVEN", designation: "PAK-005",
    role: "Real Estate & Property Management",
    tagline: "Property management, real estate compliance, and tenancy law for NZ property professionals",
    color: "#5AADA0", sector: "Business & Commerce", pack: "pakihi", primaryModel: "claude",
    traits: ["Property-savvy", "Compliance-focused", "Market-aware"],
    expertise: ["Residential Tenancies Act", "Property management", "Tenancy compliance", "Healthy Homes", "Real estate law"],
    starters: ["Tenancy agreement review", "Healthy Homes compliance", "Property management checklist"],
  },
  {
    id: "counter", name: "COUNTER", designation: "PAK-006",
    role: "Retail Operations & Consumer Guarantees",
    tagline: "Retail operations, Consumer Guarantees Act, and e-commerce compliance",
    color: "#5AADA0", sector: "Business & Commerce", pack: "pakihi", primaryModel: "claude",
    traits: ["Customer-focused", "Compliance-aware", "Sales-driven"],
    expertise: ["Consumer Guarantees Act", "Retail compliance", "E-commerce", "Returns policies", "POS systems"],
    starters: ["Consumer rights obligations", "Returns policy review", "E-commerce compliance check"],
  },
  {
    id: "gateway", name: "GATEWAY", designation: "PAK-007",
    role: "Customs Brokerage & Border Compliance",
    tagline: "Customs compliance, import/export regulations, and border requirements for NZ trade",
    color: "#5AADA0", sector: "Business & Commerce", pack: "pakihi", primaryModel: "claude",
    traits: ["Trade-expert", "Regulation-fluent", "Detail-oriented"],
    expertise: ["Customs compliance", "Import/export regulations", "Tariff classification", "Trade agreements", "Border requirements"],
    starters: ["Import compliance check", "Customs declaration guidance", "Trade agreement review"],
  },
  {
    id: "harvest", name: "HARVEST", designation: "PAK-008",
    role: "Agriculture & Farming Compliance",
    tagline: "Agricultural compliance, farming regulations, and primary industry operations in NZ",
    color: "#5AADA0", sector: "Business & Commerce", pack: "pakihi", primaryModel: "claude",
    traits: ["Land-connected", "Regulation-aware", "Practical"],
    expertise: ["Agricultural compliance", "MPI requirements", "Fonterra standards", "Farm safety", "Environmental regulations"],
    starters: ["Farm compliance checklist", "MPI requirements review", "Agricultural safety plan"],
  },
  {
    id: "grove", name: "GROVE", designation: "PAK-009",
    role: "Horticulture & Viticulture Export",
    tagline: "Horticulture compliance, viticulture export, and MPI phytosanitary requirements",
    color: "#5AADA0", sector: "Business & Commerce", pack: "pakihi", primaryModel: "claude",
    traits: ["Export-focused", "Quality-driven", "Regulation-expert"],
    expertise: ["Horticulture compliance", "Viticulture standards", "Export requirements", "Phytosanitary certificates", "MPI protocols"],
    starters: ["Export compliance check", "Viticulture regulations", "Phytosanitary certificate guidance"],
  },
  {
    id: "sage", name: "SAGE", designation: "PAK-010",
    role: "Business Analytics & Insights",
    tagline: "Business intelligence, data analytics, and strategic insights for NZ businesses",
    color: "#5AADA0", sector: "Business & Commerce", pack: "pakihi", primaryModel: "gemini",
    traits: ["Data-driven", "Strategic", "Insightful"],
    expertise: ["Business analytics", "KPI tracking", "Market analysis", "Financial modelling", "Reporting dashboards"],
    starters: ["Business performance review", "KPI dashboard setup", "Market analysis report"],
  },
  {
    id: "ascend", name: "ASCEND", designation: "PAK-011",
    role: "Growth Strategy & Performance",
    tagline: "Growth strategy, performance optimisation, and business scaling for NZ enterprises",
    color: "#5AADA0", sector: "Business & Commerce", pack: "pakihi", primaryModel: "claude",
    traits: ["Growth-focused", "Strategic", "Results-driven"],
    expertise: ["Growth strategy", "Sales forecasting", "Campaign planning", "Market expansion", "Performance optimisation"],
    starters: ["Growth strategy for my business", "Sales forecast model", "Market expansion plan"],
  },
];

// ═══════════════════════════════════════
// KETE 5: WAKA — Transport & Vehicles (3 agents)
// ═══════════════════════════════════════

const wakaAgents: Agent[] = [
  {
    id: "motor", name: "MOTOR", designation: "WAK-001",
    role: "Automotive Industry & Dealership Compliance",
    tagline: "Automotive dealership compliance, vehicle standards, and motor industry regulations",
    color: "#6B8FA3", sector: "Transport & Vehicles", pack: "waka", primaryModel: "claude",
    traits: ["Industry-expert", "Compliance-driven", "Customer-aware"],
    expertise: ["Dealership compliance", "Vehicle standards", "Consumer law", "NZTA/Waka Kotahi", "Motor vehicle disputes"],
    starters: ["Dealership compliance check", "Vehicle sale obligations", "Motor industry regulations"],
  },
  {
    id: "transit", name: "TRANSIT", designation: "WAK-002",
    role: "Transport & Logistics Regulations (NZTA)",
    tagline: "Transport regulations, logistics compliance, and heavy vehicle requirements",
    color: "#6B8FA3", sector: "Transport & Vehicles", pack: "waka", primaryModel: "claude",
    traits: ["Regulation-fluent", "Safety-focused", "Logistics-savvy"],
    expertise: ["NZTA compliance", "Heavy vehicle regulations", "Logbook requirements", "Transport safety", "Freight regulations"],
    starters: ["Heavy vehicle compliance", "Transport operator obligations", "Logbook requirements"],
  },
  {
    id: "mariner", name: "MARINER", designation: "WAK-003",
    role: "Maritime Compliance & Vessel Operations",
    tagline: "Maritime compliance, vessel operations, and Maritime NZ regulations",
    color: "#6B8FA3", sector: "Transport & Vehicles", pack: "waka", primaryModel: "claude",
    traits: ["Safety-first", "Maritime-expert", "Regulation-driven"],
    expertise: ["Maritime NZ compliance", "Vessel operations", "Maritime safety", "Crew requirements", "Port regulations"],
    starters: ["Maritime compliance check", "Vessel safety requirements", "Crew certification"],
  },
];

// ═══════════════════════════════════════
// KETE 5b: ARATAKI — Automotive & Fleet (4 agents)
// ═══════════════════════════════════════

const aratakiAgents: Agent[] = [
  {
    id: "axis", name: "AXIS", designation: "ART-001",
    role: "Fleet Finance & Vehicle Economy",
    tagline: "True per-km cost, RUC balance, depreciation, finance, and fleet P&L",
    color: "#E8E8E8", sector: "Automotive & Fleet", pack: "arataki", primaryModel: "claude",
    traits: ["Numbers-sharp", "RUC-aware", "TCO-obsessed"],
    expertise: ["True per-km cost (RUC, depreciation, maintenance, insurance)", "Vehicle finance options", "Fleet P&L", "Replacement cycle modelling", "RUC balance monitoring", "Lease vs buy analysis"],
    starters: ["What does this ute really cost per km?", "Lease vs buy on a 2025 Hilux", "Fleet replacement schedule"],
  },
  {
    id: "drive", name: "DRIVE", designation: "ART-002",
    role: "Driver Wellbeing & Fatigue Compliance",
    tagline: "Driver fatigue rules, rest breaks, wellbeing check-ins, and H&S evidence",
    color: "#E8E8E8", sector: "Automotive & Fleet", pack: "arataki", primaryModel: "claude",
    traits: ["Driver-first", "Compliance-grade", "Caring"],
    expertise: ["Driver fatigue rules (Land Transport)", "Rest break logging", "H&S at Work Act 2015 driver duties", "Logbook prompts", "Wellbeing check-ins", "Incident reporting"],
    starters: ["Log today's rest breaks", "Check my driver's fatigue compliance", "Wellbeing check on the team"],
  },
  {
    id: "flux-arataki", name: "FLUX", designation: "ART-003",
    role: "Sales & Lead Pipeline (Automotive)",
    tagline: "Test drive → sale → delivery → service → loyalty pipeline with no handoff dropped",
    color: "#E8E8E8", sector: "Automotive & Fleet", pack: "arataki", primaryModel: "claude",
    traits: ["Pipeline-disciplined", "Closer-instinct", "Follow-up obsessed"],
    expertise: ["Lead qualification", "Test drive booking", "Trade-in valuation", "Finance application tracking", "Service loyalty", "CRM sync (HubSpot, Salesforce, Pipedrive)"],
    starters: ["Show today's pipeline", "Follow-ups due this week", "Convert this test drive to a sale"],
  },
  {
    id: "axis-fleet", name: "AXIS-FLEET", designation: "ART-004",
    role: "Route, Fuel & Compliance Operations",
    tagline: "FuelOracle pricing, route planning, WoF/CoF/RUC compliance, evidence packs",
    color: "#E8E8E8", sector: "Automotive & Fleet", pack: "arataki", primaryModel: "gemini",
    traits: ["Cost-aware", "Route-optimised", "Evidence-grade"],
    expertise: ["NZ fuel pricing (Z, BP, Mobil, Gull, Waitomo)", "Live route planning (weather, roadworks)", "WoF/CoF expiry tracking", "Insurance evidence packs", "Logbook compliance"],
    starters: ["Cheapest fuel on my route to Tauranga", "WoF expiries this month", "Insurance evidence pack for last week's trip"],
  },
];

// ═══════════════════════════════════════
// KETE 6: HANGARAU — Technology (12 agents)
// ═══════════════════════════════════════

const hangarauAgents: Agent[] = [
  {
    id: "spark", name: "SPARK", designation: "HNG-001",
    role: "Cloud Infrastructure & Platform Engineering",
    tagline: "Cloud infrastructure, platform engineering, and deployment automation",
    color: "#3A6A9C", sector: "Technology", pack: "hangarau", primaryModel: "gemini",
    traits: ["Architect-minded", "Cloud-native", "Scalable"],
    expertise: ["Cloud infrastructure", "Platform engineering", "Deployment automation", "AWS/Azure/GCP", "System design"],
    starters: ["Cloud architecture review", "Deployment checklist", "Infrastructure audit"],
  },
  {
    id: "sentinel", name: "SENTINEL", designation: "HNG-002",
    role: "Security Monitoring & Alert Systems",
    tagline: "Security monitoring, threat detection, and alert management for NZ businesses",
    color: "#3A6A9C", sector: "Technology", pack: "hangarau", primaryModel: "claude",
    traits: ["Vigilant", "Threat-aware", "Proactive"],
    expertise: ["Security monitoring", "Threat detection", "Alert management", "Incident response", "Vulnerability scanning"],
    starters: ["Security audit", "Threat assessment", "Incident response plan"],
  },
  {
    id: "nexus-t", name: "NEXUS-T", designation: "HNG-003",
    role: "API Integration & Tech Compliance",
    tagline: "API integration, technical compliance, and system interoperability",
    color: "#3A6A9C", sector: "Technology", pack: "hangarau", primaryModel: "claude",
    traits: ["Integration-expert", "Standards-aware", "System-thinker"],
    expertise: ["API integration", "MCP building", "Technical compliance", "System interoperability", "Documentation"],
    starters: ["API integration plan", "Technical compliance review", "System integration audit"],
  },
  {
    id: "cipher", name: "CIPHER", designation: "HNG-004",
    role: "Cybersecurity & Encryption",
    tagline: "Cybersecurity strategy, encryption implementation, and security best practices",
    color: "#3A6A9C", sector: "Technology", pack: "hangarau", primaryModel: "claude",
    traits: ["Security-first", "Encryption-expert", "Risk-aware"],
    expertise: ["Cybersecurity strategy", "Encryption", "Security audits", "Compliance frameworks", "Penetration testing"],
    starters: ["Cybersecurity assessment", "Encryption strategy", "Security compliance check"],
  },
  {
    id: "relay", name: "RELAY", designation: "HNG-005",
    role: "Communication Systems & Messaging",
    tagline: "Communication systems, messaging infrastructure, and notification management",
    color: "#3A6A9C", sector: "Technology", pack: "hangarau", primaryModel: "claude",
    traits: ["Connected", "Real-time", "Reliable"],
    expertise: ["Messaging systems", "Notification management", "Slack integration", "Communication workflows", "Real-time messaging"],
    starters: ["Communication system setup", "Notification strategy", "Messaging integration"],
  },
  {
    id: "matrix", name: "MATRIX", designation: "HNG-006",
    role: "Data Architecture & Management",
    tagline: "Data architecture, database design, and data management strategies",
    color: "#3A6A9C", sector: "Technology", pack: "hangarau", primaryModel: "claude",
    traits: ["Data-expert", "Architecture-focused", "Scale-aware"],
    expertise: ["Data architecture", "Database design", "Data pipelines", "Analytics infrastructure", "Data governance"],
    starters: ["Data architecture review", "Database design consultation", "Data strategy plan"],
  },
  {
    id: "forge", name: "FORGE", designation: "HNG-007",
    role: "DevOps, CI/CD & Deployment Automation",
    tagline: "DevOps practices, CI/CD pipelines, and deployment automation",
    color: "#3A6A9C", sector: "Technology", pack: "hangarau", primaryModel: "claude",
    traits: ["Automation-driven", "Pipeline-expert", "Reliability-focused"],
    expertise: ["CI/CD pipelines", "DevOps practices", "Deployment automation", "GitHub workflows", "Infrastructure as code"],
    starters: ["CI/CD pipeline setup", "Deployment automation", "DevOps best practices"],
  },
  {
    id: "oracle", name: "ORACLE", designation: "HNG-008",
    role: "Predictive Analytics & AI Systems",
    tagline: "Predictive analytics, AI systems design, and machine learning implementation",
    color: "#3A6A9C", sector: "Technology", pack: "hangarau", primaryModel: "gemini",
    traits: ["Predictive", "Data-driven", "Future-focused"],
    expertise: ["Predictive analytics", "ML implementation", "AI systems design", "Data modelling", "Metrics review"],
    starters: ["Predictive model design", "Analytics dashboard plan", "AI strategy review"],
  },
  {
    id: "ember", name: "EMBER", designation: "HNG-009",
    role: "Energy Efficiency & Carbon Reporting",
    tagline: "Energy efficiency, carbon reporting, and sustainability compliance for NZ businesses",
    color: "#3A6A9C", sector: "Technology", pack: "hangarau", primaryModel: "claude",
    traits: ["Sustainability-focused", "Data-driven", "Regulation-aware"],
    expertise: ["Energy efficiency", "Carbon reporting", "ETS compliance", "Sustainability metrics", "Environmental reporting"],
    starters: ["Carbon footprint assessment", "ETS compliance check", "Energy efficiency audit"],
  },
  {
    id: "reef", name: "REEF", designation: "HNG-010",
    role: "Environmental Compliance & RMA",
    tagline: "Environmental compliance, RMA obligations, and regional council requirements",
    color: "#3A6A9C", sector: "Technology", pack: "hangarau", primaryModel: "claude",
    traits: ["Environment-first", "Regulation-expert", "Kaitiaki-minded"],
    expertise: ["Environmental compliance", "RMA", "Regional council requirements", "Resource consents", "Impact assessments"],
    starters: ["Environmental compliance check", "RMA obligations review", "Resource consent guidance"],
  },
  {
    id: "patent", name: "PATENT", designation: "HNG-011",
    role: "Intellectual Property & IP Registration",
    tagline: "IP protection, patent and trademark registration, and IP strategy for NZ businesses",
    color: "#3A6A9C", sector: "Technology", pack: "hangarau", primaryModel: "claude",
    traits: ["IP-expert", "Strategic", "Protection-focused"],
    expertise: ["Patent registration", "Trademark registration", "IP strategy", "IPONZ process", "IP protection"],
    starters: ["Patent registration process", "Trademark application", "IP protection strategy"],
  },
  {
    id: "foundry", name: "FOUNDRY", designation: "HNG-012",
    role: "Manufacturing & Industrial Compliance",
    tagline: "Manufacturing compliance, industrial safety, and operational standards",
    color: "#3A6A9C", sector: "Technology", pack: "hangarau", primaryModel: "claude",
    traits: ["Process-driven", "Safety-aware", "Standards-focused"],
    expertise: ["Manufacturing compliance", "Industrial safety", "Quality management", "WorkSafe requirements", "Operational standards"],
    starters: ["Manufacturing compliance audit", "Industrial safety plan", "Quality management system"],
  },
];

// ═══════════════════════════════════════
// KETE 7: HAUORA — Health, Wellbeing, Sport & Lifestyle (8 agents)
// ═══════════════════════════════════════

const hauoraAgents: Agent[] = [
  {
    id: "turf", name: "TURF", designation: "HAU-001",
    role: "Sports & Recreation Governance (Inc Societies Act)",
    tagline: "Sports club governance, Incorporated Societies Act 2022, and recreation compliance",
    color: "#A87D4A", sector: "Health & Lifestyle", pack: "hauora", primaryModel: "claude",
    traits: ["Governance-savvy", "Community-focused", "Regulation-aware"],
    expertise: ["Incorporated Societies Act 2022", "Club governance", "Constitution writing", "AGM management", "Funding applications"],
    starters: ["Inc Societies Act compliance", "Club constitution review", "Funding application help"],
  },
  {
    id: "league", name: "LEAGUE", designation: "HAU-002",
    role: "Competition & Events Management",
    tagline: "Competition management, event planning, and sports event compliance",
    color: "#A87D4A", sector: "Health & Lifestyle", pack: "hauora", primaryModel: "claude",
    traits: ["Organised", "Event-savvy", "Fair-play focused"],
    expertise: ["Competition management", "Event planning", "Health & safety for events", "Results management", "Venue coordination"],
    starters: ["Plan a sports competition", "Event safety plan", "Competition management system"],
  },
  {
    id: "vitals", name: "VITALS", designation: "HAU-003",
    role: "Workplace Health & Safety (HSWA)",
    tagline: "Workplace health & safety compliance under the Health and Safety at Work Act 2015",
    color: "#A87D4A", sector: "Health & Lifestyle", pack: "hauora", primaryModel: "claude",
    traits: ["Safety-obsessed", "Thorough", "Proactive"],
    expertise: ["HSWA compliance", "Workplace safety plans", "Hazard management", "Injury management", "ACC guidance"],
    starters: ["Workplace safety audit", "HSWA compliance check", "Hazard management plan"],
  },
  {
    id: "remedy", name: "REMEDY", designation: "HAU-004",
    role: "Healthcare Practice Compliance (HPCAA)",
    tagline: "Healthcare practice compliance, HPCAA requirements, and health sector regulations",
    color: "#A87D4A", sector: "Health & Lifestyle", pack: "hauora", primaryModel: "claude",
    traits: ["Clinical-aware", "Regulation-expert", "Patient-focused"],
    expertise: ["HPCAA compliance", "Health practice management", "Clinical governance", "Patient safety", "Health sector regulations"],
    starters: ["HPCAA compliance check", "Clinical governance review", "Health practice setup"],
  },
  {
    id: "vitae", name: "VITAE", designation: "HAU-005",
    role: "Nutrition & Dietary Compliance",
    tagline: "Nutrition guidance, dietary compliance, and food-related health regulations",
    color: "#A87D4A", sector: "Health & Lifestyle", pack: "hauora", primaryModel: "claude",
    traits: ["Health-focused", "Science-based", "Regulatory-aware"],
    expertise: ["Nutritional compliance", "Dietary regulations", "Food labelling", "Health claims", "Supplement regulations"],
    starters: ["Nutritional labelling requirements", "Health claims compliance", "Dietary supplement regulations"],
  },
  {
    id: "radiance", name: "RADIANCE", designation: "HAU-006",
    role: "Beauty & Wellness Industry Compliance",
    tagline: "Beauty industry compliance, wellness sector regulations, and salon/spa operations",
    color: "#A87D4A", sector: "Health & Lifestyle", pack: "hauora", primaryModel: "claude",
    traits: ["Industry-expert", "Compliance-driven", "Client-focused"],
    expertise: ["Beauty industry compliance", "Salon regulations", "Cosmetic safety", "Wellness sector", "Product compliance"],
    starters: ["Beauty salon compliance", "Cosmetic product regulations", "Wellness practice setup"],
  },
  {
    id: "palette", name: "PALETTE", designation: "HAU-007",
    role: "Interior Design & Space Planning",
    tagline: "Interior design guidance, space planning, and commercial fit-out compliance",
    color: "#A87D4A", sector: "Health & Lifestyle", pack: "hauora", primaryModel: "gemini",
    traits: ["Design-expert", "Spatially aware", "Aesthetically refined"],
    expertise: ["Interior design", "Space planning", "Commercial fit-out", "Building compliance", "Accessibility standards"],
    starters: ["Interior design consultation", "Space planning for a venue", "Commercial fit-out checklist"],
  },
  {
    id: "odyssey", name: "ODYSSEY", designation: "HAU-008",
    role: "Travel Planning & Tourism Regulations",
    tagline: "Travel planning, tourism regulations, and travel industry compliance",
    color: "#A87D4A", sector: "Health & Lifestyle", pack: "hauora", primaryModel: "gemini",
    traits: ["Travel-expert", "Detail-oriented", "Experience-driven"],
    expertise: ["Travel planning", "Tourism regulations", "Travel industry compliance", "Itinerary design", "Travel insurance"],
    starters: ["Travel itinerary design", "Tourism compliance check", "Travel industry setup"],
  },
];

// ═══════════════════════════════════════
// KETE 8: TE KĀHUI REO — Māori Business Intelligence (8 agents)
// ═══════════════════════════════════════

const teKahuiReoAgents: Agent[] = [
  {
    id: "whanau", name: "WHĀNAU", designation: "TKR-001",
    role: "Whānau Governance",
    tagline: "Whānau-centred enterprise insights, governance frameworks, and data sovereignty",
    color: "#4AA5A8", sector: "Māori Business Intelligence", pack: "te-kahui-reo", primaryModel: "claude",
    traits: ["Whānau-centred", "Data-sovereign", "Tikanga-first"],
    expertise: ["Whānau governance", "Enterprise insights", "Data sovereignty", "Tikanga frameworks", "Iwi reporting"],
    starters: ["Whānau governance framework", "Data sovereignty assessment", "Enterprise insights report"],
  },
  {
    id: "rohe", name: "ROHE", designation: "TKR-002",
    role: "Regional Coordination",
    tagline: "Regional data coordination, rohe-based governance, and community reporting",
    color: "#4AA5A8", sector: "Māori Business Intelligence", pack: "te-kahui-reo", primaryModel: "claude",
    traits: ["Region-focused", "Community-connected", "Data-driven"],
    expertise: ["Regional coordination", "Rohe-based data", "Community reporting", "Regional governance", "Cross-rohe analysis"],
    starters: ["Regional data report", "Rohe governance review", "Community impact assessment"],
  },
  {
    id: "kaupapa-m", name: "KAUPAPA-M", designation: "TKR-003",
    role: "Kaupapa Māori Frameworks",
    tagline: "Kaupapa Māori alignment, cultural integrity assessment, and tikanga-based strategy",
    color: "#4AA5A8", sector: "Māori Business Intelligence", pack: "te-kahui-reo", primaryModel: "claude",
    traits: ["Kaupapa-centred", "Culturally grounded", "Strategy-focused"],
    expertise: ["Kaupapa Māori frameworks", "Cultural integrity", "Tikanga alignment", "Strategic planning", "Values assessment"],
    starters: ["Kaupapa Māori alignment check", "Cultural integrity assessment", "Tikanga strategy review"],
  },
  {
    id: "mana-bi", name: "MANA", designation: "TKR-004",
    role: "Governance",
    tagline: "Mana whenua governance, Te Tiriti compliance, and iwi authority frameworks",
    color: "#4AA5A8", sector: "Māori Business Intelligence", pack: "te-kahui-reo", primaryModel: "claude",
    traits: ["Authority-aware", "Te Tiriti-informed", "Governance-expert"],
    expertise: ["Mana whenua governance", "Te Tiriti compliance", "Iwi authority", "Access management", "Rights frameworks"],
    starters: ["Te Tiriti compliance review", "Governance framework design", "Mana whenua assessment"],
  },
  {
    id: "kaitiaki", name: "KAITIAKI", designation: "TKR-005",
    role: "Environmental Stewardship",
    tagline: "Environmental stewardship, data guardianship, and kaitiakitanga-driven governance",
    color: "#4AA5A8", sector: "Māori Business Intelligence", pack: "te-kahui-reo", primaryModel: "claude",
    traits: ["Kaitiaki-minded", "Environment-first", "Data-guardian"],
    expertise: ["Environmental stewardship", "Data guardianship", "Kaitiakitanga", "Sustainability", "Environmental monitoring"],
    starters: ["Environmental stewardship plan", "Data guardianship framework", "Kaitiakitanga assessment"],
  },
  {
    id: "taura", name: "TĀURA", designation: "TKR-006",
    role: "Cultural Compliance",
    tagline: "Cultural compliance, community connections, and tikanga governance",
    color: "#4AA5A8", sector: "Māori Business Intelligence", pack: "te-kahui-reo", primaryModel: "claude",
    traits: ["Culturally precise", "Community-connected", "Compliance-driven"],
    expertise: ["Cultural compliance", "Community connections", "Tikanga governance", "Cultural audits", "Network facilitation"],
    starters: ["Cultural compliance audit", "Community connection plan", "Tikanga governance review"],
  },
  {
    id: "whakaaro", name: "WHAKAARO", designation: "TKR-007",
    role: "Strategic Thinking",
    tagline: "Strategic Māori perspectives, long-term planning, and whakaaro-driven governance",
    color: "#4AA5A8", sector: "Māori Business Intelligence", pack: "te-kahui-reo", primaryModel: "claude",
    traits: ["Strategic", "Forward-thinking", "Culturally grounded"],
    expertise: ["Strategic planning", "Long-term vision", "Māori perspectives", "Governance strategy", "Innovation"],
    starters: ["Strategic planning session", "Long-term vision framework", "Innovation strategy"],
  },
  {
    id: "hiringa", name: "HIRINGA", designation: "TKR-008",
    role: "Innovation & Growth",
    tagline: "Strength-based organisational wellbeing, economic prosperity, and Māori enterprise growth",
    color: "#4AA5A8", sector: "Māori Business Intelligence", pack: "te-kahui-reo", primaryModel: "claude",
    traits: ["Strength-based", "Growth-focused", "Resilient"],
    expertise: ["Organisational wellbeing", "Economic prosperity", "Enterprise growth", "Capability building", "Resilience planning"],
    starters: ["Enterprise growth plan", "Organisational wellbeing assessment", "Capability building programme"],
  },
];

// ═══════════════════════════════════════
// KETE 9: TORO — Family Navigator (1 agent)
// ═══════════════════════════════════════

const toroaAgents: Agent[] = [
  {
    id: "toroa", name: "TORO", designation: "TOR-001",
    role: "Family SMS Navigator",
    tagline: "SMS-first AI family navigator — school notices, meals, budgets, reminders, learning, transport",
    color: "#4AA5A8", sector: "Family", pack: "toroa", primaryModel: "gemini",
    traits: ["Whānau-first", "SMS-native", "Culturally warm"],
    expertise: ["School coordination", "Meal planning", "Budget tracking", "Transport info", "Calendar management", "Learning support"],
    starters: ["What's for dinner tonight?", "School pick-up times", "Weekly budget check", "Bus times to Takapuna"],
  },
];

// ═══════════════════════════════════════
// COMBINED EXPORTS
// ═══════════════════════════════════════

export const allAgents: Agent[] = [
  ...sharedCoreAgents,
  ...manaakiAgents,
  ...hangaAgents,
  ...auahaAgents,
  ...pakihiAgents,
  ...wakaAgents,
  ...aratakiAgents,
  ...hangarauAgents,
  ...hauoraAgents,
  ...teKahuiReoAgents,
  ...toroaAgents,
];

export const agentsByPack: Record<string, Agent[]> = {
  core: sharedCoreAgents,
  manaaki: manaakiAgents,
  hanga: hangaAgents,
  waihanga: hangaAgents, // canonical alias
  auaha: auahaAgents,
  pakihi: pakihiAgents,
  waka: wakaAgents,
  arataki: aratakiAgents,
  pikau: wakaAgents, // freight/customs draws from transport pool until fully split
  hangarau: hangarauAgents,
  hauora: hauoraAgents,
  "te-kahui-reo": teKahuiReoAgents,
  toroa: toroaAgents,
};

export const TOTAL_AGENTS = allAgents.length;

/** Lookup agent by id */
export function findAgent(id: string): Agent | undefined {
  return allAgents.find(a => a.id === id);
}

/** Lookup agents by pack slug */
export function agentsForPack(packSlug: string): Agent[] {
  return agentsByPack[packSlug] ?? [];
}

// ═══════════════════════════════════════
// BACKWARD-COMPATIBLE EXPORTS
// ═══════════════════════════════════════

/** @deprecated Use allAgents instead */
export const agents = allAgents;

/** @deprecated ECHO is now in Auaha pack — use findAgent('echo') */
export const echoAgent: Agent = findAgent('echo') ?? allAgents[0];

/** @deprecated Use findAgent or sharedCoreAgents */
export const pilotAgent: Agent = {
  id: "pilot", name: "PILOT", designation: "ASM-099",
  role: "Executive Assistant",
  tagline: "Elite executive assistant, strategic advisor, and operational partner",
  color: "#4AA5A8", sector: "Cross-pack", pack: "core", primaryModel: "claude",
  traits: ["Proactive", "Emotionally intelligent", "Action-oriented"],
  expertise: ["Calendar management", "Email triage", "Meeting summaries", "Content strategy", "Business prioritisation"],
  starters: ["What's the priority today?", "Summarise my meetings this week", "Draft a LinkedIn post"],
};

/** ARIA — public-site Concierge agent. Loaded by /embed/concierge for the floating widget. */
export const conciergeAgent: Agent = {
  id: "concierge", name: "ARIA", designation: "ASM-100",
  role: "Assembl Concierge",
  tagline: "Your guide to assembl — the 8 kete, pricing, governance and evidence packs.",
  color: "#D9BC7A", sector: "Public Site", pack: "core", primaryModel: "google/gemini-2.5-flash",
  traits: ["Warm", "Precise", "NZ-grounded"],
  expertise: [
    "8 industry kete (Manaaki, Waihanga, Auaha, Arataki, Pikau, Hoko, Ako, Tōro)",
    "Pricing tiers (Family, Operator, Leader, Enterprise, Outcome)",
    "Governance pipeline (Kahu → Iho → Tā → Mahara → Mana)",
    "Evidence packs and the draft-only posture",
    "NZ Privacy Act 2020 + IPP 3A, AAAIP, NZISM-informed security",
  ],
  starters: [
    "Which kete is right for my business?",
    "How does assembl pricing work?",
    "What's an evidence pack?",
    "How do you handle the Privacy Act?",
  ],
};

/** @deprecated Use packs instead */
export const sectors = [...new Set(allAgents.map(a => a.sector))];
