// Agent-specific capability bullets for cards + quick actions + starter cards
import { FileText, DollarSign, Calendar, Shield, Utensils, Wine, Users, Building, HardHat, CreditCard, Car, Palette, BarChart3, Globe, Anchor, Ship, Heart, Brain, Scale, Laptop, GraduationCap, Home, MapPin, Leaf, Zap, Shirt, Plane, Dumbbell, Apple, Sparkles, PartyPopper, BookOpen, Building2, TreePine, HandHeart, School, Stethoscope, House, AlertTriangle, Briefcase, Code, Trophy, Megaphone, Phone, type LucideIcon } from "lucide-react";
// All icons used across agent capabilities

export interface AgentCapability {
  bullet: string;
  icon: LucideIcon;
  title: string;
  description: string;
  prompt: string;
}

export interface AgentQuickAction {
  label: string;
  prompt: string;
}

export const agentCapabilities: Record<string, AgentCapability[]> = {
  sports: [
    { bullet: "Generate compliant constitutions", icon: FileText, title: "Generate Constitution", description: "Create a compliant constitution for your club", prompt: "Generate a compliant constitution for my sports club under the Incorporated Societies Act 2022. Include all required clauses." },
    { bullet: "Draft grant applications", icon: DollarSign, title: "Grant Application", description: "Draft a funding application for NZCT or Lion Foundation", prompt: "Help me write a grant application for NZCT funding for our sports club. I need to cover facility upgrades and youth development programmes." },
    { bullet: "Plan season fixtures", icon: Calendar, title: "Season Draw", description: "Build a fixture schedule for your competition", prompt: "Create a season fixture draw for our 12-team Saturday morning competition. We have home and away games over 22 weeks." },
    { bullet: "Check club compliance", icon: Shield, title: "Compliance Check", description: "Check your club meets Incorporated Societies Act requirements", prompt: "Run a compliance check for my sports club against the Incorporated Societies Act 2022. What do we need to have in place before the April 2026 deadline?" },
  ],
  hospitality: [
    { bullet: "Food safety documentation", icon: Utensils, title: "Food Safety Plan", description: "Generate a Food Control Plan compliant with Food Act 2014", prompt: "Create a Food Control Plan for my café compliant with the Food Act 2014. Include temperature logs, cleaning schedules, and allergen management." },
    { bullet: "Alcohol licence management", icon: Wine, title: "Licence Application", description: "Prepare your alcohol licence application", prompt: "Help me prepare an on-licence application under the Sale and Supply of Alcohol Act 2012. What documents do I need and what's the process?" },
    { bullet: "Staff rostering & compliance", icon: Users, title: "Weekly Roster", description: "Generate a compliant roster with breaks and penal rates", prompt: "Create a weekly staff roster for my restaurant. I have 3 FOH staff and 4 BOH. Include break requirements under NZ law and penal rates for weekend shifts." },
    { bullet: "Menu costing & engineering", icon: BarChart3, title: "Menu Costing", description: "Analyse your menu items for profitability", prompt: "Help me do a menu engineering analysis using the BCG matrix. I'll give you my menu items with costs and sales data." },
  ],
  construction: [
    { bullet: "Building consent applications", icon: Building, title: "Consent Application", description: "Prepare building consent documentation", prompt: "Help me prepare a building consent application under the Building Act 2004. What documentation do I need and what are the key Building Code clauses to address?" },
    { bullet: "H&S safety plans", icon: HardHat, title: "Safety Plan", description: "Generate a site-specific safety plan compliant with HSWA", prompt: "Create a comprehensive site-specific safety plan for a residential build compliant with the Health and Safety at Work Act 2015." },
    { bullet: "Payment claims under CCA 2002", icon: CreditCard, title: "Payment Claim", description: "Draft a payment claim under the Construction Contracts Act", prompt: "Draft a payment claim under the Construction Contracts Act 2002. Include the required notice period and all mandatory information." },
    { bullet: "Tender response writing", icon: FileText, title: "Tender Response", description: "Write a competitive tender response with pricing", prompt: "Help me write a tender response for a commercial building project. Include methodology, programme, pricing schedule, and H&S approach." },
  ],
  automotive: [
    { bullet: "F&I disclosure compliance", icon: CreditCard, title: "F&I Disclosure", description: "Generate CCCFA-compliant finance documents", prompt: "Generate a CCCFA-compliant finance disclosure document for a vehicle sale." },
    { bullet: "Vehicle listing optimisation", icon: Car, title: "Listing Creator", description: "Create optimised vehicle listings for TradeMe", prompt: "Create an optimised vehicle listing for TradeMe. I'll give you the vehicle details." },
    { bullet: "GST margin scheme calculator", icon: DollarSign, title: "Margin Scheme", description: "Calculate GST under margin scheme vs invoice basis", prompt: "Calculate the GST payable on a used vehicle sale under the margin scheme vs invoice basis. Purchase price $15,000, sale price $22,000." },
    { bullet: "Warranty claims tracking", icon: Shield, title: "Warranty Claim", description: "Log and track warranty claims with audit trail", prompt: "Help me draft a warranty claim for submission to the manufacturer." },
  ],
  marketing: [
    { bullet: "Brand strategy & DNA", icon: Palette, title: "Brand Strategy", description: "Build a complete brand strategy with positioning", prompt: "Build a complete brand strategy for my NZ business. Include positioning, target audience, brand voice, and visual identity guidelines." },
    { bullet: "Social media campaigns", icon: Megaphone, title: "Content Calendar", description: "Generate a 7-day content calendar across platforms", prompt: "Create a 7-day social media content calendar for my business across Instagram, LinkedIn, and Facebook." },
    { bullet: "AI image generation", icon: Sparkles, title: "Generate Visuals", description: "Create professional marketing imagery and brand assets", prompt: "Generate a professional social media graphic for my business." },
    { bullet: "Ad campaign creation", icon: BarChart3, title: "Ad Campaign", description: "Build a Meta/Google ad campaign with targeting", prompt: "Create a complete Meta Ads campaign brief for my NZ business." },
  ],
  property: [
    { bullet: "Development site screening", icon: Home, title: "Site Screening", description: "Screen a site for viability and planning risk", prompt: "Screen a development site for viability. I'll give you the address." },
    { bullet: "Healthy Homes compliance", icon: Shield, title: "Healthy Homes", description: "Check your rental meets all 6 standards", prompt: "Run a Healthy Homes Standards compliance check for my rental property." },
    { bullet: "Investment yield analysis", icon: DollarSign, title: "Yield Analysis", description: "Model yield scenarios for your investment property", prompt: "Analyse yield scenarios for my investment property. Purchase price $650,000, current rent $550/week." },
    { bullet: "Tenancy Tribunal guidance", icon: Scale, title: "Tribunal Guide", description: "Navigate Tenancy Tribunal processes", prompt: "I need help preparing for a Tenancy Tribunal hearing." },
  ],
  hr: [
    { bullet: "Employment agreements", icon: FileText, title: "Draft Agreement", description: "Generate a compliant employment agreement", prompt: "Draft an individual employment agreement for a full-time employee compliant with the Employment Relations Act 2000." },
    { bullet: "Holiday pay calculations", icon: DollarSign, title: "Holiday Pay", description: "Calculate leave entitlements under Holidays Act", prompt: "Calculate holiday pay for my employee under the Holidays Act 2003." },
    { bullet: "Disciplinary processes", icon: Shield, title: "Disciplinary Plan", description: "Create a fair, legally defensible process", prompt: "Create a disciplinary process plan for an employee performance issue." },
    { bullet: "Recruitment pipeline", icon: Users, title: "Recruitment", description: "Build a recruitment process with job ads", prompt: "Help me build a recruitment process for a new role." },
  ],
  operations: [
    { bullet: "Family calendar management", icon: Calendar, title: "Weekly Planner", description: "Organise your family's entire week in one view", prompt: "Help me plan our family's week. I have 2 school-age children." },
    { bullet: "Budget tracking & goals", icon: DollarSign, title: "Family Budget", description: "Build a household budget with savings goals", prompt: "Help me create a family budget with savings goals for a house deposit." },
    { bullet: "Meal planning & groceries", icon: Apple, title: "Meal Planner", description: "Generate a weekly meal plan with grocery list", prompt: "Create a weekly meal plan for a family of 4 on a budget of $200/week." },
    { bullet: "School newsletter parsing", icon: FileText, title: "Newsletter Parser", description: "Upload a newsletter and extract key dates", prompt: "I'm going to upload my child's school newsletter. Extract all the key dates and action items." },
  ],
  sales: [
    { bullet: "Sales pipeline management", icon: BarChart3, title: "Build Pipeline", description: "Set up a pipeline with stages and scoring", prompt: "Build a complete sales pipeline for my business with BANT scoring." },
    { bullet: "Proposal auto-generation", icon: FileText, title: "Write Proposal", description: "Generate an executive-ready sales proposal", prompt: "Write a professional sales proposal for a $50K deal." },
    { bullet: "Follow-up sequences", icon: Calendar, title: "Follow-Up Sequence", description: "Create a multi-touch follow-up email sequence", prompt: "Create a 5-touch follow-up email sequence for warm leads." },
    { bullet: "Deal forecasting & velocity", icon: DollarSign, title: "Sales Forecast", description: "Calculate sales velocity and forecast revenue", prompt: "Help me calculate my sales velocity and forecast next quarter." },
  ],
  customs: [
    { bullet: "Invoice-to-entry automation", icon: FileText, title: "Process Invoice", description: "Extract data from a commercial invoice", prompt: "Process this commercial invoice for an NZ import entry." },
    { bullet: "Tariff classification", icon: Globe, title: "Classify Tariff", description: "Classify a product under the NZ Working Tariff", prompt: "Classify this product under the NZ Working Tariff to 8-digit level." },
    { bullet: "Landed cost calculation", icon: DollarSign, title: "Landed Cost", description: "Calculate complete landed cost with all fees", prompt: "Calculate the complete landed cost for an import from China." },
    { bullet: "FTA origin analysis", icon: Shield, title: "FTA Check", description: "Check if goods qualify for preferential rates", prompt: "Check if my goods qualify for preferential FTA duty rates." },
  ],
  pm: [
    { bullet: "Project plan generation", icon: FileText, title: "Project Plan", description: "Generate a plan with milestones and dependencies", prompt: "Create a comprehensive project plan for my project." },
    { bullet: "Risk register building", icon: Shield, title: "Risk Register", description: "Build a risk matrix with mitigations", prompt: "Build a risk register for my project with mitigations." },
    { bullet: "Freight & logistics tracking", icon: Ship, title: "Track Shipment", description: "Track vessels and containers at NZ ports", prompt: "Track freight vessels arriving at NZ ports this week." },
    { bullet: "SOP documentation", icon: FileText, title: "Write SOP", description: "Auto-generate standard operating procedures", prompt: "Write a standard operating procedure for a key business process." },
  ],
  nonprofit: [
    { bullet: "Grant application writing", icon: DollarSign, title: "Write Grant", description: "Draft a complete funding application", prompt: "Write a grant application for Lotteries funding." },
    { bullet: "Governance frameworks", icon: Shield, title: "Governance Check", description: "Assess governance against best practice", prompt: "Run a governance health check for our charity." },
    { bullet: "Impact reporting", icon: BarChart3, title: "Impact Report", description: "Generate a Theory of Change framework", prompt: "Create an impact measurement framework for our charity." },
    { bullet: "Re-registration support", icon: FileText, title: "Re-registration", description: "Guide through Inc. Societies Act re-registration", prompt: "Guide us through the Incorporated Societies Act 2022 re-registration." },
  ],
  maritime: [
    { bullet: "Live vessel tracking", icon: Ship, title: "Track Vessel", description: "Track any vessel by name or MMSI in NZ waters", prompt: "Track vessels near Auckland port right now." },
    { bullet: "Trip planning with GPS", icon: MapPin, title: "Plan Trip", description: "Plan a boating trip with waypoints and weather", prompt: "Plan a fishing trip in the Hauraki Gulf this weekend." },
    { bullet: "Compliance documentation", icon: Shield, title: "Safety Checklist", description: "Generate a vessel safety compliance checklist", prompt: "Generate a complete vessel safety compliance checklist." },
    { bullet: "Fishing rules by region", icon: Anchor, title: "Fishing Rules", description: "Check bag limits for any NZ fishing region", prompt: "What are the recreational fishing rules for snapper in Auckland?" },
  ],
  spark: [
    { bullet: "Build web apps from text", icon: Code, title: "Build App", description: "Describe what you want and get a working app", prompt: "Build me a quote calculator for my painting business." },
    { bullet: "Create business calculators", icon: DollarSign, title: "Calculator", description: "Generate interactive calculators and tools", prompt: "Build a GST calculator that can add or remove GST." },
    { bullet: "Design client forms", icon: FileText, title: "Client Form", description: "Build professional intake forms with validation", prompt: "Create a professional client intake form for my law firm." },
    { bullet: "Generate dashboards", icon: BarChart3, title: "Dashboard", description: "Create data dashboards with charts", prompt: "Build a business dashboard with revenue and expense charts." },
  ],
  accounting: [
    { bullet: "GST return preparation", icon: DollarSign, title: "GST Return", description: "Calculate and prepare your GST return", prompt: "Help me prepare my GST return." },
    { bullet: "PAYE & payroll compliance", icon: Users, title: "PAYE Calculator", description: "Calculate PAYE, KiwiSaver, and ACC", prompt: "Calculate full payroll cost for an employee earning $65,000/year." },
    { bullet: "Provisional tax planning", icon: Calendar, title: "Tax Planning", description: "Plan your provisional tax payments", prompt: "Help me plan my provisional tax." },
    { bullet: "Cashflow forecasting", icon: BarChart3, title: "Cashflow Forecast", description: "Build a 12-month cashflow forecast", prompt: "Build a 12-month cashflow forecast for my business." },
  ],
  legal: [
    { bullet: "Contract & NDA drafting", icon: FileText, title: "Draft Contract", description: "Generate a commercial contract or NDA", prompt: "Draft a commercial services agreement for my business." },
    { bullet: "Employment dispute navigation", icon: Scale, title: "Dispute Guide", description: "Navigate an employment dispute step by step", prompt: "I have an employment dispute. Guide me through the process." },
    { bullet: "Privacy policy generation", icon: Shield, title: "Privacy Policy", description: "Create a Privacy Act 2020 compliant policy", prompt: "Generate a privacy policy for my NZ business website." },
    { bullet: "2026 legislation tracking", icon: BookOpen, title: "Law Changes", description: "Stay updated on 2026 NZ legal changes", prompt: "What are the key legal changes in 2026 that affect NZ businesses?" },
  ],
  it: [
    { bullet: "Cybersecurity assessments", icon: Shield, title: "Security Audit", description: "Run a cybersecurity assessment for your business", prompt: "Run a cybersecurity assessment for my NZ small business." },
    { bullet: "Breach response planning", icon: AlertTriangle, title: "Breach Response", description: "Create a data breach response plan", prompt: "Create a data breach response plan for my business." },
    { bullet: "Cloud migration planning", icon: Globe, title: "Cloud Migration", description: "Plan a cloud migration for your team", prompt: "Help me plan a cloud migration for my small team." },
    { bullet: "IT policy generation", icon: FileText, title: "IT Policy", description: "Generate IT security and acceptable use policies", prompt: "Generate a comprehensive IT security policy for my NZ business." },
  ],
  tourism: [
    { bullet: "International visitor marketing", icon: Globe, title: "Tourism Marketing", description: "Create a strategy to attract international visitors", prompt: "Create a marketing strategy to attract US visitors during shoulder season." },
    { bullet: "Qualmark certification", icon: Trophy, title: "Qualmark Prep", description: "Prepare for Qualmark certification assessment", prompt: "Help me prepare for Qualmark certification." },
    { bullet: "Adventure activity compliance", icon: Shield, title: "Safety System", description: "Build a safety management system", prompt: "Create a safety management system for my adventure activity." },
    { bullet: "Booking platform optimisation", icon: BarChart3, title: "Listing Optimiser", description: "Optimise your Booking.com or Airbnb listing", prompt: "Optimise my accommodation listing for Booking.com." },
  ],
  agriculture: [
    { bullet: "Freshwater Farm Plans", icon: Leaf, title: "Farm Plan", description: "Create a compliant Freshwater Farm Plan", prompt: "Help me create a Freshwater Farm Plan compliant with NPS-FM 2020." },
    { bullet: "GHG emission calculations", icon: BarChart3, title: "Emissions Report", description: "Calculate your farm's greenhouse gas emissions", prompt: "Calculate my farm's greenhouse gas emissions for my dairy farm." },
    { bullet: "Biosecurity management", icon: Shield, title: "Biosecurity Plan", description: "Build a biosecurity response plan", prompt: "Create a biosecurity management plan for my farm." },
    { bullet: "Satellite crop monitoring", icon: Globe, title: "Crop Monitor", description: "Check crop health via satellite imagery", prompt: "Help me monitor my crop health using satellite data." },
  ],
  echo: [
    { bullet: "Answer business calls warmly", icon: Phone, title: "Answer Calls", description: "Professional call answering with lead qualification", prompt: "Answer my business calls — set up call answering with warm greetings and BANT lead qualification for my business." },
    { bullet: "Qualify leads from inbox", icon: Briefcase, title: "Qualify Leads", description: "Score and triage inbound leads using BANT", prompt: "Qualify leads from my inbox — score each inquiry 1-100 using BANT criteria and flag hot leads for immediate follow-up." },
    { bullet: "Draft email responses", icon: FileText, title: "Draft Responses", description: "Triage and draft professional email replies", prompt: "Draft responses to my emails — triage my inbox by urgency and generate professional replies for each message." },
    { bullet: "Schedule meetings", icon: Calendar, title: "Schedule Meeting", description: "Coordinate calendars and book meetings", prompt: "Schedule a meeting with a prospect — suggest time options, draft the agenda, and prepare a calendar invite." },
  ],
  clinic: [
    { bullet: "APC renewal tracking", icon: Stethoscope, title: "APC Tracker", description: "Track practising certificate renewal dates", prompt: "When is my Annual Practising Certificate due for renewal? Help me track all my registration deadlines." },
    { bullet: "Patient recall system", icon: Calendar, title: "Patient Recall", description: "Generate recall messages for overdue patients", prompt: "Draft a patient recall message for patients overdue for their 6-month check-up." },
    { bullet: "ACC dental claims", icon: FileText, title: "ACC Claim", description: "Draft ACC treatment injury documentation", prompt: "Help me with an ACC dental claim — walk me through the treatment injury claim process and help draft the documentation." },
    { bullet: "Practice audit checklist", icon: Shield, title: "Practice Audit", description: "Generate a comprehensive practice audit checklist", prompt: "Generate a practice audit checklist covering infection control, radiation safety, and clinical records compliance." },
  ],
  pristine: [
    { bullet: "Cleaning quote calculator", icon: DollarSign, title: "Quote Calculator", description: "Generate accurate commercial cleaning quotes", prompt: "Quote a 500m² office clean, 3x per week — include labour, consumables, and travel." },
    { bullet: "Multi-site roster", icon: Calendar, title: "Staff Roster", description: "Generate rosters across multiple cleaning sites", prompt: "Generate a cleaning roster for 4 sites with travel time between locations." },
    { bullet: "Chemical safety records", icon: Shield, title: "Chemical Safety", description: "SDS register and chemical compliance tracking", prompt: "What chemical safety records do I need to keep under HSNO Act? Help me set up an SDS register." },
    { bullet: "Cleaning contract drafting", icon: FileText, title: "Draft Contract", description: "Generate a commercial cleaning contract", prompt: "Draft a commercial cleaning contract with scope of work, schedule, pricing, and termination clauses." },
  ],
  network: [
    { bullet: "Franchise feasibility", icon: BarChart3, title: "Feasibility Check", description: "Assess if your business model is franchisable", prompt: "Is my business franchisable? Assess systemisability, teachability, profitability, and scalability." },
    { bullet: "Franchise agreement drafting", icon: FileText, title: "Draft Agreement", description: "Generate a complete franchise agreement", prompt: "Draft a franchise agreement including territory, fees, operations manual compliance, and termination provisions." },
    { bullet: "Franchisee recruitment", icon: Users, title: "Recruitment Pack", description: "Create a franchisee information pack", prompt: "Create a franchisee recruitment pack with investment details, support structure, and application process." },
    { bullet: "Network benchmarking", icon: BarChart3, title: "Benchmark", description: "Compare franchisee performance across network", prompt: "Benchmark my franchisee performance — compare revenue, cost ratios, and profitability across locations." },
  ],
  health: [
    { bullet: "ACC claims navigation", icon: Stethoscope, title: "ACC Claims", description: "Navigate ACC provider registration and claims", prompt: "Guide me through ACC provider registration and the claims process for my health practice." },
    { bullet: "HDC complaint response", icon: Shield, title: "HDC Response", description: "Draft a response to a Health & Disability Commissioner complaint", prompt: "Help me draft a response to a Health and Disability Commissioner complaint." },
    { bullet: "Practice setup guidance", icon: Building, title: "Practice Setup", description: "Set up a health practice in NZ from scratch", prompt: "How do I set up a health practice in NZ? Walk me through registration, premises, and compliance requirements." },
    { bullet: "Clinical governance frameworks", icon: FileText, title: "Governance Plan", description: "Build a clinical governance framework", prompt: "Create a clinical governance framework for my health practice including quality, safety, and consumer engagement." },
  ],
  retail: [
    { bullet: "Consumer Guarantees Act compliance", icon: Shield, title: "CGA Compliance", description: "Check your obligations under the CGA", prompt: "What are my obligations under the Consumer Guarantees Act? I run a retail store in NZ." },
    { bullet: "Sales campaign creation", icon: Megaphone, title: "Sales Campaign", description: "Build a seasonal sales campaign", prompt: "Create a Boxing Day sales campaign for my retail store including email, social, and in-store promotions." },
    { bullet: "Loyalty programme design", icon: Heart, title: "Loyalty Programme", description: "Design a customer loyalty programme", prompt: "Design a customer loyalty programme for my NZ retail business with tiers and rewards." },
    { bullet: "Inventory management", icon: BarChart3, title: "Stock Planner", description: "Optimise inventory and reorder points", prompt: "Help me optimise my inventory with reorder points and seasonal demand forecasting." },
  ],
  architecture: [
    { bullet: "Fee proposal generation", icon: DollarSign, title: "Fee Proposal", description: "Generate a professional fee proposal", prompt: "Generate a fee proposal for a residential architecture project including stages and deliverables." },
    { bullet: "Building consent prep", icon: FileText, title: "Consent Docs", description: "Prepare building consent documentation", prompt: "Create a building consent documentation checklist for a new residential build under the Building Act 2004." },
    { bullet: "Design narrative writing", icon: Palette, title: "Design Statement", description: "Write a design narrative for your project", prompt: "Write a design narrative for a contemporary residential project that responds to its NZ landscape context." },
    { bullet: "Code compliance checking", icon: Shield, title: "Code Check", description: "Check compliance with NZ Building Code", prompt: "Check my residential design against NZ Building Code requirements — H1 energy efficiency, E2 weathertightness, and B1 structure." },
  ],
  finance: [
    { bullet: "Mortgage rate comparison", icon: DollarSign, title: "Rate Compare", description: "Compare fixed vs floating mortgage rates", prompt: "Compare current NZ fixed vs floating mortgage rates and recommend the best option for my situation." },
    { bullet: "KiwiSaver optimisation", icon: BarChart3, title: "KiwiSaver Check", description: "Optimise your KiwiSaver contributions and fund", prompt: "Help me optimise my KiwiSaver — am I in the right fund, contribution rate, and getting the full Government contribution?" },
    { bullet: "First Home Grant eligibility", icon: Home, title: "First Home Check", description: "Check your First Home Grant eligibility", prompt: "Am I eligible for the First Home Grant? Walk me through income caps, KiwiSaver requirements, and house price caps." },
    { bullet: "Take-home pay calculation", icon: DollarSign, title: "Pay Calculator", description: "Calculate your actual take-home pay", prompt: "Calculate my take-home pay after PAYE, ACC, and KiwiSaver on a salary of $85,000." },
  ],
  insurance: [
    { bullet: "Claims dispute navigation", icon: Shield, title: "Dispute Claims", description: "Challenge a denied insurance claim", prompt: "My insurance claim was denied. Walk me through the dispute process including IFSO scheme and options." },
    { bullet: "Sum insured calculator", icon: DollarSign, title: "Sum Insured", description: "Calculate the right sum insured for your home", prompt: "Calculate the correct sum insured for my home — include rebuild costs, demolition, and professional fees for NZ." },
    { bullet: "EQC process guidance", icon: AlertTriangle, title: "EQC Guide", description: "Navigate the EQC claims process", prompt: "Guide me through the EQC claims process for earthquake damage to my property." },
    { bullet: "Policy comparison", icon: FileText, title: "Compare Policies", description: "Compare insurance policies side by side", prompt: "Help me compare house insurance policies — what should I look for and what are the key differences between NZ insurers?" },
  ],
  banking: [
    { bullet: "Payment gateway comparison", icon: DollarSign, title: "Gateway Compare", description: "Compare payment gateway fees for NZ businesses", prompt: "Compare payment gateway fees for my NZ business — Stripe, Windcave, POLi, and Afterpay." },
    { bullet: "AML/CFT compliance", icon: Shield, title: "AML Check", description: "Check your AML/CFT obligations", prompt: "What are my AML/CFT obligations as a NZ business? Help me set up a compliance programme." },
    { bullet: "FX rate optimisation", icon: Globe, title: "FX Optimiser", description: "Find the best FX rates for imports/exports", prompt: "What are the best FX options for importing goods from China? Compare bank rates, OFX, and Wise." },
    { bullet: "Working capital planning", icon: BarChart3, title: "Capital Planner", description: "Plan your business working capital needs", prompt: "Help me plan my business working capital requirements for the next 12 months." },
  ],
  immigration: [
    { bullet: "AEWV process navigation", icon: FileText, title: "AEWV Guide", description: "Navigate the Accredited Employer Work Visa process", prompt: "Walk me through the AEWV process for hiring a migrant worker — employer accreditation, job check, and visa application." },
    { bullet: "Visa pathway mapping", icon: MapPin, title: "Visa Pathways", description: "Map your pathway from work visa to residence", prompt: "Map the pathway from my current work visa to NZ residence — what are my options and timeframes?" },
    { bullet: "Employer accreditation", icon: Shield, title: "Accreditation", description: "Prepare for employer accreditation", prompt: "Help me prepare for employer accreditation — what documentation and standards do I need to meet?" },
    { bullet: "Document checklist generation", icon: FileText, title: "Doc Checklist", description: "Generate a visa application document checklist", prompt: "Generate a complete document checklist for my visa application." },
  ],
  energy: [
    { bullet: "Carbon footprint calculation", icon: Leaf, title: "Carbon Calculator", description: "Calculate your business carbon footprint", prompt: "Calculate my business carbon footprint including Scope 1, 2, and 3 emissions." },
    { bullet: "Solar ROI analysis", icon: DollarSign, title: "Solar ROI", description: "Analyse the return on solar panel investment", prompt: "Should I install solar panels on my NZ business premises? Calculate the ROI including buy-back rates." },
    { bullet: "ETS compliance", icon: Shield, title: "ETS Compliance", description: "Check your Emissions Trading Scheme obligations", prompt: "What are my ETS obligations and how do I comply with the NZ Emissions Trading Scheme?" },
    { bullet: "Climate disclosure writing", icon: FileText, title: "Climate Report", description: "Prepare climate-related financial disclosures", prompt: "Help me prepare climate-related financial disclosures for my NZ business." },
  ],
  style: [
    { bullet: "Capsule wardrobe building", icon: Shirt, title: "Capsule Wardrobe", description: "Build a versatile capsule wardrobe for NZ", prompt: "Build a capsule wardrobe for NZ weather — cover work, casual, and outdoor activities across all seasons." },
    { bullet: "Wedding & event styling", icon: PartyPopper, title: "Event Outfit", description: "Style advice for NZ events and occasions", prompt: "What should I wear to a NZ summer wedding? Give me options for different budgets." },
    { bullet: "NZ brand curation", icon: Sparkles, title: "NZ Brands", description: "Discover sustainable NZ fashion brands", prompt: "Recommend sustainable NZ fashion brands for everyday wear and special occasions." },
    { bullet: "Season-smart styling", icon: Calendar, title: "Seasonal Style", description: "Dress for NZ's unpredictable weather", prompt: "Help me dress for NZ's four-seasons-in-one-day weather — layering strategies and must-haves." },
  ],
  travel: [
    { bullet: "Road trip planning", icon: MapPin, title: "Road Trip", description: "Plan a NZ road trip with stops and activities", prompt: "Plan a family road trip through the South Island — 10 days, must-see stops, accommodation, and budget." },
    { bullet: "Great Walk bookings", icon: Leaf, title: "Great Walk", description: "Choose and plan a Great Walk adventure", prompt: "Which Great Walk should I do and when? Compare difficulty, scenery, booking windows, and costs." },
    { bullet: "Family holiday planning", icon: Plane, title: "Family Holiday", description: "Plan a family-friendly holiday from NZ", prompt: "Plan a family holiday from NZ — budget-friendly international destinations with kids." },
    { bullet: "Freedom camping guidance", icon: Home, title: "Freedom Camp", description: "Know the rules for freedom camping in NZ", prompt: "What are the freedom camping rules in NZ? Where can I legally camp and what do I need?" },
  ],
  wellbeing: [
    { bullet: "Stress management toolkit", icon: Heart, title: "Stress Relief", description: "Build a personalised stress management plan", prompt: "I'm feeling overwhelmed — help me build a practical stress management plan with daily techniques." },
    { bullet: "NZ support service finder", icon: Stethoscope, title: "Find Support", description: "Find mental health support services near you", prompt: "What mental health support services are available in NZ? Include free options and crisis lines." },
    { bullet: "Self-care routine builder", icon: Sparkles, title: "Self-Care Plan", description: "Create a sustainable self-care routine", prompt: "Help me build a realistic self-care routine that fits into a busy NZ lifestyle." },
    { bullet: "Work-life balance planning", icon: Calendar, title: "Balance Check", description: "Assess and improve your work-life balance", prompt: "Help me assess my work-life balance and create a plan to improve it." },
  ],
  fitness: [
    { bullet: "Custom workout planning", icon: Dumbbell, title: "Workout Plan", description: "Build a personalised workout programme", prompt: "Build me a beginner-friendly workout plan — 3 days per week, mix of strength and cardio." },
    { bullet: "Marathon training", icon: Trophy, title: "Race Training", description: "Train for a running event in NZ", prompt: "Create a 12-week training plan for the Auckland Marathon — I'm a casual runner doing about 5km currently." },
    { bullet: "Home workout generation", icon: Zap, title: "Home Workout", description: "No-equipment workouts you can do at home", prompt: "Give me a 30-minute home workout with no equipment — full body, suitable for a small lounge." },
    { bullet: "Outdoor fitness planning", icon: Leaf, title: "Outdoor Fitness", description: "Make the most of NZ's outdoor spaces", prompt: "Plan an outdoor fitness routine using NZ parks and trails near me." },
  ],
  nutrition: [
    { bullet: "Weekly meal planning", icon: Apple, title: "Meal Plan", description: "Generate a budget-friendly weekly meal plan", prompt: "Create a weekly meal plan for a family of 4 on a $200/week grocery budget using NZ seasonal produce." },
    { bullet: "School lunch ideas", icon: GraduationCap, title: "School Lunches", description: "Creative school lunch ideas for Kiwi kids", prompt: "Give me a week of school lunch ideas that are nut-free, budget-friendly, and kids will actually eat." },
    { bullet: "Seasonal produce guide", icon: Leaf, title: "Seasonal Guide", description: "Know what's in season in NZ right now", prompt: "What fruits and vegetables are in season in NZ right now? Include recipe suggestions." },
    { bullet: "Dietary requirement planning", icon: FileText, title: "Diet Planner", description: "Plan meals around dietary requirements", prompt: "Help me plan meals for my family — one vegetarian, one gluten-free, and two kids who are picky eaters." },
  ],
  beauty: [
    { bullet: "Skincare routine building", icon: Sparkles, title: "Skin Routine", description: "Build a skincare routine for NZ conditions", prompt: "Build a skincare routine for NZ conditions — high UV, variable humidity, and outdoor lifestyle." },
    { bullet: "UV protection advice", icon: Shield, title: "UV Guide", description: "Protect your skin from NZ's intense UV", prompt: "NZ has some of the highest UV levels in the world — what SPF and sun protection do I really need?" },
    { bullet: "NZ beauty brand recommendations", icon: Heart, title: "NZ Brands", description: "Discover NZ-made beauty and skincare", prompt: "Recommend NZ-made skincare and beauty brands — clean ingredients and sustainable packaging preferred." },
    { bullet: "Ingredient analysis", icon: FileText, title: "Check Ingredients", description: "Analyse ingredients in your beauty products", prompt: "Analyse the ingredients list on my skincare product — what's good, what's questionable, and what should I avoid?" },
  ],
  social: [
    { bullet: "Party planning", icon: PartyPopper, title: "Plan Party", description: "Plan a memorable event or celebration", prompt: "Plan a kids' birthday party in Auckland for a 7-year-old — venue options, themes, food, and budget." },
    { bullet: "Matariki celebration ideas", icon: Sparkles, title: "Matariki Ideas", description: "Ideas for celebrating Matariki", prompt: "Give me Matariki celebration ideas for our family — activities, food, and ways to learn about the stars." },
    { bullet: "Wedding planning", icon: Heart, title: "Wedding Planner", description: "Plan a NZ wedding step by step", prompt: "Help me plan my NZ wedding — timeline, venue options, budget breakdown, and vendor checklist." },
    { bullet: "Cultural event guide", icon: Calendar, title: "Events Guide", description: "Discover cultural events happening in NZ", prompt: "What cultural events and festivals are coming up in NZ? Include family-friendly options." },
  ],
  tiriti: [
    { bullet: "Te Tiriti obligations mapping", icon: BookOpen, title: "Tiriti Obligations", description: "Understand your Te Tiriti obligations", prompt: "What are my Te Tiriti obligations as a NZ business? Map them clearly with practical steps." },
    { bullet: "Iwi engagement guidance", icon: Users, title: "Iwi Engagement", description: "Engage meaningfully with local iwi", prompt: "How do I engage with local iwi for a development project? Guide me through tikanga-appropriate processes." },
    { bullet: "Te reo in business", icon: Globe, title: "Te Reo Guide", description: "Use te reo Māori correctly in business", prompt: "Guide me on the correct use of te reo Māori in my business branding and communications." },
    { bullet: "Māori governance frameworks", icon: Shield, title: "Māori Governance", description: "Build governance aligned with tikanga", prompt: "Help me build a governance framework that aligns with tikanga Māori for our organisation." },
  ],
  govtsector: [
    { bullet: "Government procurement", icon: FileText, title: "Procurement Guide", description: "Navigate NZ Government Procurement Rules", prompt: "How do Government Procurement Rules work? Help me respond to a government tender." },
    { bullet: "OIA response drafting", icon: FileText, title: "OIA Response", description: "Draft an Official Information Act response", prompt: "Draft an OIA response — walk me through timeframes, grounds for refusal, and best practice." },
    { bullet: "Business case building", icon: BarChart3, title: "Business Case", description: "Build a Better Business Case", prompt: "Help me build a Better Business Case using the NZ Treasury framework — strategic, economic, commercial, financial, and management cases." },
    { bullet: "Cabinet paper framework", icon: BookOpen, title: "Cabinet Paper", description: "Structure a Cabinet paper submission", prompt: "Help me structure a Cabinet paper submission following the Department of PM and Cabinet guidelines." },
  ],
  environment: [
    { bullet: "Resource consent navigation", icon: FileText, title: "Resource Consent", description: "Navigate the resource consent process", prompt: "Walk me through the resource consent application process under the RMA — what do I need and how long does it take?" },
    { bullet: "Freshwater compliance", icon: Leaf, title: "Freshwater Check", description: "Check NES freshwater compliance", prompt: "Check my project against NES freshwater regulations — what activities require consent?" },
    { bullet: "Impact assessment building", icon: Shield, title: "Impact Assessment", description: "Prepare an environmental impact assessment", prompt: "Help me prepare an Assessment of Environmental Effects (AEE) for my development project." },
    { bullet: "DOC concession guidance", icon: TreePine, title: "DOC Concession", description: "Apply for a DOC concession", prompt: "Guide me through applying for a DOC concession for a commercial activity on conservation land." },
  ],
  welfare: [
    { bullet: "Benefits eligibility check", icon: DollarSign, title: "Benefits Check", description: "Check what benefits you're entitled to", prompt: "What benefits am I entitled to? Check my eligibility for all MSD payments including Working for Families, accommodation supplement, and winter energy." },
    { bullet: "Housing application guide", icon: Home, title: "Housing Help", description: "Apply for emergency or public housing", prompt: "How do I apply for emergency housing in NZ? Walk me through the process and what I need." },
    { bullet: "Disability services navigation", icon: Heart, title: "Disability Support", description: "Navigate disability support services", prompt: "What disability support services are available in NZ? Include funded supports, equipment, and advocacy." },
    { bullet: "Community funding finder", icon: HandHeart, title: "Find Funding", description: "Find community grants and assistance", prompt: "Help me find community grants and emergency assistance available in my region." },
  ],
  moe: [
    { bullet: "NCEA explained simply", icon: GraduationCap, title: "NCEA Explained", description: "Understand NCEA in plain English", prompt: "How does NCEA work? Explain it simply — levels, credits, endorsements, and university entrance." },
    { bullet: "Learning support navigation", icon: Heart, title: "Learning Support", description: "Get support for a child with learning needs", prompt: "My child has learning needs — what support is available through the school and Ministry of Education?" },
    { bullet: "School zoning & enrolment", icon: MapPin, title: "School Zones", description: "Find your school zone and enrol", prompt: "How do school zones work in NZ? How do I find my zone and what if I want to go out-of-zone?" },
    { bullet: "Kura kaupapa guidance", icon: BookOpen, title: "Kura Kaupapa", description: "Learn about Māori-medium education", prompt: "Tell me about kura kaupapa Māori — what is it, how does it work, and how do I enrol my child?" },
  ],
  publichealth: [
    { bullet: "GP enrolment help", icon: Stethoscope, title: "Find a GP", description: "Find and enrol with a GP near you", prompt: "How do I enrol with a GP in NZ? What if I can't find one accepting new patients?" },
    { bullet: "Free health services guide", icon: Heart, title: "Free Health", description: "Know which health services are free in NZ", prompt: "What health services are free in NZ? Include GP visits, prescriptions, and hospital care." },
    { bullet: "Mental health pathways", icon: Brain, title: "Mental Health", description: "Find mental health support near you", prompt: "I need mental health support — what are my options in NZ from free to funded to private?" },
    { bullet: "Maternity rights advice", icon: Shield, title: "Maternity Rights", description: "Know your maternity and parental leave rights", prompt: "What are my maternity and parental leave rights in NZ? Include paid leave, keeping-in-touch days, and returning to work." },
  ],
  housing: [
    { bullet: "Public housing application", icon: Home, title: "Apply Housing", description: "Apply for public housing in NZ", prompt: "How do I apply for public housing in NZ? Walk me through the Housing Register and priority assessment." },
    { bullet: "First Home Grant check", icon: DollarSign, title: "First Home Grant", description: "Check First Home Grant eligibility", prompt: "Am I eligible for the First Home Grant? Check income caps, KiwiSaver requirements, and regional house price caps." },
    { bullet: "Tenancy rights defence", icon: Scale, title: "Tenancy Rights", description: "Know your rights as a tenant", prompt: "What are my rights as a tenant in NZ? My landlord wants to increase rent and hasn't fixed maintenance issues." },
    { bullet: "Healthy Homes audit", icon: Shield, title: "Healthy Homes", description: "Check your rental meets Healthy Homes Standards", prompt: "Does my rental meet the Healthy Homes Standards? Check heating, insulation, ventilation, moisture, drainage, and draught stopping." },
  ],
  emergency: [
    { bullet: "Earthquake preparedness", icon: AlertTriangle, title: "Earthquake Prep", description: "Get your household earthquake-ready", prompt: "Create an earthquake preparedness checklist for my family — supplies, plan, and practice drills." },
    { bullet: "Tsunami zone checking", icon: MapPin, title: "Tsunami Zone", description: "Check if you're in a tsunami evacuation zone", prompt: "Am I in a tsunami evacuation zone? What should I do if a tsunami warning is issued?" },
    { bullet: "Emergency kit building", icon: Shield, title: "Emergency Kit", description: "Build a complete emergency survival kit", prompt: "What should be in my emergency kit? Build a complete list for a family of 4 for 7 days." },
    { bullet: "Civil defence planning", icon: FileText, title: "Emergency Plan", description: "Create a household emergency plan", prompt: "Create a household emergency plan — meeting points, communication plan, essential documents, and evacuation routes." },
  ],
};

// Quick action labels (3-4 per agent, shown below chat input)
export const agentQuickActions: Record<string, AgentQuickAction[]> = Object.fromEntries(
  Object.entries(agentCapabilities).map(([id, caps]) => [
    id,
    caps.slice(0, 4).map(c => ({ label: c.title, prompt: c.prompt })),
  ])
);
