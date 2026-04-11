// Agent-specific capability bullets for cards + quick actions + starter cards
import { FileText, DollarSign, Calendar, Shield, Utensils, Wine, Users, Building, HardHat, CreditCard, Car, Palette, BarChart3, Globe, Anchor, Ship, Heart, Layers, Scale, Laptop, GraduationCap, Home, MapPin, Leaf, Zap, Shirt, Plane, Dumbbell, Apple, Sparkles, PartyPopper, BookOpen, Building2, TreePine, HandHeart, School, Stethoscope, House, AlertTriangle, Briefcase, Code, Trophy, Megaphone, Phone, type LucideIcon } from "lucide-react";
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
    { bullet: "Employment agreement generation", icon: FileText, title: "Employment Agreement", description: "Generate a NZ-compliant employment agreement", prompt: "Draft an individual employment agreement for a permanent full-time role. Include all mandatory ERA s65 clauses, trial period options (Feb 2026 rules), and KiwiSaver 3.5%." },
    { bullet: "True employment cost calculator", icon: DollarSign, title: "True Cost Calculator", description: "Calculate the real cost of hiring an employee", prompt: "Calculate the true employment cost for a $75,000 salary including KiwiSaver 3.5%, ACC levy, leave loading, and all on-costs." },
    { bullet: "Compliance gap scan", icon: Shield, title: "HR Compliance Scan", description: "Audit your HR setup against NZ employment law", prompt: "Run a compliance gap scan on my HR setup. Check employment agreements, Privacy Act 2020 (IPP 3A), Holidays Act, KiwiSaver April 2026 changes, and H&S compliance." },
    { bullet: "Personal grievance workflow", icon: Scale, title: "Personal Grievance", description: "Navigate the personal grievance process step by step", prompt: "An employee has raised a personal grievance for unjustified dismissal. Walk me through the process, 90-day timeline, and mediation preparation." },
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
    { bullet: "Build web apps from text", icon: Code, title: "Build App", description: "Describe what you want — get a working app", prompt: "Build me a quote calculator for my painting business. Include labour, materials, and GST." },
    { bullet: "Create business calculators", icon: DollarSign, title: "Calculator", description: "Interactive calculators for any industry", prompt: "Build a GST calculator that can add or remove GST from any amount." },
    { bullet: "Design client intake forms", icon: FileText, title: "Client Form", description: "Professional forms with validation", prompt: "Create a professional client intake form for my law firm with contact details, matter type, and conflict check." },
    { bullet: "Generate compliance checklists", icon: Shield, title: "Compliance App", description: "Interactive compliance tools for NZ regulations", prompt: "Build a Healthy Homes compliance checklist app covering all 6 standards with pass/fail tracking." },
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
    { bullet: "Match you with the right agent", icon: Brain, title: "Agent Matcher", description: "Tell me your industry and I'll recommend your ideal tools", prompt: "Which Assembl agent is right for my business? I'll tell you about my industry and needs." },
    { bullet: "Troubleshoot platform issues", icon: Shield, title: "Fix Issues", description: "Patient step-by-step technical troubleshooting", prompt: "I'm having a technical issue with the platform — can you help me troubleshoot?" },
    { bullet: "Get started with Assembl", icon: Sparkles, title: "Onboarding Guide", description: "Personalised setup checklist for your business", prompt: "Help me get started with Assembl — walk me through the onboarding process for my business." },
    { bullet: "Discover features on your plan", icon: Zap, title: "Plan Features", description: "Learn what your current plan can do", prompt: "What can I do on my current plan? Show me features I might not have discovered yet." },
  ],
  pilot: [
    { bullet: "Plan today's priorities", icon: Calendar, title: "Daily Priority", description: "What's the ONE thing that moves the needle today?", prompt: "What's the priority today? Help me plan my day." },
    { bullet: "Summarise meetings", icon: FileText, title: "Meeting Notes", description: "Structured notes with decisions and action items", prompt: "Summarise my last meeting — generate structured notes with key decisions and action items." },
    { bullet: "Draft LinkedIn content", icon: Megaphone, title: "LinkedIn Post", description: "Draft posts in Kate's voice, lead with problems not AI", prompt: "Draft a LinkedIn post for this week — lead with a business problem, not AI." },
    { bullet: "Track grants & funding", icon: DollarSign, title: "Grant Tracker", description: "Track applications, deadlines, and draft sections", prompt: "What grants should I be applying for? Help me track deadlines and draft application sections." },
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
  netsec: [
    { bullet: "Security audit checklist", icon: Shield, title: "Security Audit", description: "Run a web application or cloud infrastructure security audit", prompt: "Run a comprehensive security audit checklist for my web application. Cover authentication, authorisation, data protection, injection prevention, API security, logging, and dependencies." },
    { bullet: "Incident response plan", icon: AlertTriangle, title: "Incident Response", description: "Create an incident response plan for your business", prompt: "Create a complete incident response plan for my NZ business. Include detection, containment, eradication, recovery, and Privacy Act 2020 breach notification procedures." },
    { bullet: "NZISM compliance check", icon: FileText, title: "NZISM Compliance", description: "Assess your security posture against NZISM", prompt: "Assess my organisation's security posture against the NZ Information Security Manual (NZISM). What level are we at and what gaps need closing?" },
    { bullet: "Security policy generation", icon: Briefcase, title: "Security Policies", description: "Generate NZ-compliant security policy documents", prompt: "Generate a comprehensive Information Security Policy for my NZ business. Include access control, encryption, authentication, incident response, business continuity, and compliance sections." },
  ],
  podcast: [
    { bullet: "Multi-agent podcast workflow", icon: Zap, title: "Episode Workflow", description: "Orchestrate SAGE → MUSE → KŌRERO → PRISM → KAHU for a full episode", prompt: "Create a complete podcast episode about [topic]. Use the multi-agent workflow: SAGE provides strategy, MUSE writes the script, you handle production, PRISM checks brand voice, and KAHU screens compliance." },
    { bullet: "Full episode scripting", icon: FileText, title: "Episode Script", description: "Generate a complete podcast episode script with dialogue", prompt: "Write a full podcast episode script about [topic] for my business. Include intro, main segments, transitions, and outro. Make it conversational and engaging." },
    { bullet: "Series planning & calendar", icon: Calendar, title: "Series Plan", description: "Plan a multi-episode podcast series with content calendar", prompt: "Plan a 12-episode podcast series for my NZ business. Include episode titles, descriptions, guest suggestions, and a publishing calendar." },
    { bullet: "Guest prep & research", icon: Users, title: "Guest Prep Sheet", description: "Research brief and interview questions for podcast guests", prompt: "Create a guest preparation sheet for an upcoming podcast interview. Include background research, 10 interview questions, and talking points." },
  ],
  // ── SHARED CORE ──
  charter: [
    { bullet: "Company governance guidance", icon: Shield, title: "Governance Check", description: "Check your company governance obligations", prompt: "What are my director duties under the Companies Act 1993?" },
    { bullet: "Board governance frameworks", icon: FileText, title: "Board Framework", description: "Build a board governance framework", prompt: "Help me set up a proper board governance framework for my company." },
    { bullet: "Annual return preparation", icon: Calendar, title: "Annual Return", description: "Prepare your annual return", prompt: "Help me prepare my company annual return — what's required?" },
    { bullet: "Shareholder agreements", icon: Scale, title: "Shareholder Agreement", description: "Draft a shareholder agreement", prompt: "Draft a shareholder agreement for my company with 3 directors." },
  ],
  arbiter: [
    { bullet: "Dispute resolution guidance", icon: Scale, title: "Resolve Dispute", description: "Navigate dispute resolution options", prompt: "I have a business dispute — what are my resolution options?" },
    { bullet: "Mediation preparation", icon: FileText, title: "Mediation Prep", description: "Prepare for mediation", prompt: "Help me prepare for a mediation session." },
    { bullet: "Disputes Tribunal guidance", icon: Shield, title: "Tribunal Guide", description: "Navigate the Disputes Tribunal", prompt: "Guide me through the Disputes Tribunal process." },
    { bullet: "Contract dispute analysis", icon: Briefcase, title: "Contract Dispute", description: "Analyse a contract dispute", prompt: "Analyse my contract dispute and suggest the best resolution path." },
  ],
  shield: [
    { bullet: "Privacy policy generation", icon: Shield, title: "Privacy Policy", description: "Create a Privacy Act 2020 compliant policy", prompt: "Generate a privacy policy for my NZ business website." },
    { bullet: "Data breach response", icon: AlertTriangle, title: "Breach Response", description: "Handle a data breach", prompt: "We've had a data breach — walk me through the notification process." },
    { bullet: "Privacy impact assessment", icon: FileText, title: "PIA", description: "Conduct a privacy impact assessment", prompt: "Help me conduct a privacy impact assessment for our new project." },
    { bullet: "Cross-border data transfers", icon: Globe, title: "Data Transfers", description: "Comply with cross-border data rules", prompt: "We need to transfer data overseas — what are the rules under the Privacy Act?" },
  ],
  anchor: [
    { bullet: "Grant application writing", icon: DollarSign, title: "Write Grant", description: "Draft a complete funding application", prompt: "Write a grant application for Lotteries funding." },
    { bullet: "Governance frameworks", icon: Shield, title: "Governance Check", description: "Assess governance against best practice", prompt: "Run a governance health check for our charity." },
    { bullet: "Impact reporting", icon: BarChart3, title: "Impact Report", description: "Generate a Theory of Change framework", prompt: "Create an impact measurement framework for our charity." },
    { bullet: "Re-registration support", icon: FileText, title: "Re-registration", description: "Guide through Inc. Societies Act re-registration", prompt: "Guide us through the Incorporated Societies Act 2022 re-registration." },
  ],
  pulse: [
    { bullet: "Holiday pay calculation", icon: DollarSign, title: "Holiday Pay", description: "Calculate holiday pay correctly", prompt: "Calculate holiday pay for my employee under the Holidays Act." },
    { bullet: "KiwiSaver obligations", icon: Shield, title: "KiwiSaver Check", description: "Check employer KiwiSaver obligations", prompt: "What are my KiwiSaver employer obligations with the April 2026 changes?" },
    { bullet: "PAYE & payroll setup", icon: FileText, title: "Payroll Setup", description: "Set up a compliant payroll system", prompt: "Help me set up a payroll system compliant with NZ tax obligations." },
    { bullet: "Parental leave administration", icon: Calendar, title: "Parental Leave", description: "Manage parental leave entitlements", prompt: "An employee is going on parental leave — what are the rules and my obligations?" },
  ],
  scholar: [
    { bullet: "NZQA compliance check", icon: GraduationCap, title: "NZQA Compliance", description: "Check NZQA framework requirements", prompt: "What are our NZQA compliance requirements as a training provider?" },
    { bullet: "Training programme design", icon: FileText, title: "Programme Design", description: "Design a compliant training programme", prompt: "Help me design a training programme that meets NZQA standards." },
    { bullet: "Education Act guidance", icon: Shield, title: "Education Act", description: "Understand Education Act obligations", prompt: "What are our obligations under the Education and Training Act?" },
    { bullet: "Micro-credential framework", icon: Trophy, title: "Micro-credentials", description: "Develop micro-credentials", prompt: "Help me develop a micro-credential programme for our industry." },
  ],
  nova: [
    { bullet: "Workflow optimisation", icon: Zap, title: "Optimise Workflow", description: "Streamline your business processes", prompt: "Help me optimise this workflow — it's taking too long." },
    { bullet: "Technical troubleshooting", icon: Code, title: "Troubleshoot", description: "Fix a technical issue", prompt: "I'm having a technical issue — can you help me troubleshoot?" },
    { bullet: "Productivity audit", icon: BarChart3, title: "Productivity Audit", description: "Audit your team's productivity", prompt: "Run a productivity audit on our current processes." },
    { bullet: "Tool integration advice", icon: Globe, title: "Tool Integration", description: "Connect and integrate business tools", prompt: "What tools should I integrate to streamline my business?" },
  ],

  // ── MANAAKI (new agents) ──
  aura: [
    { bullet: "Guest experience workflows", icon: Users, title: "Guest Workflow", description: "Design guest welcome and service workflows", prompt: "Create a guest welcome workflow for my accommodation business." },
    { bullet: "Staff training matrices", icon: FileText, title: "Staff Training", description: "Build a staff training and rostering matrix", prompt: "Create a staff training plan for my hospitality team." },
    { bullet: "Revenue management", icon: DollarSign, title: "Revenue Strategy", description: "Optimise pricing and occupancy", prompt: "Help me with revenue management — optimise our pricing and occupancy rates." },
    { bullet: "Food safety compliance", icon: Shield, title: "Food Safety", description: "Food Act 2014 compliance checking", prompt: "Create a Food Control Plan for my café compliant with the Food Act 2014." },
  ],
  saffron: [
    { bullet: "Food control plans", icon: Utensils, title: "Food Control Plan", description: "Generate a Food Act 2014 compliant plan", prompt: "Create a Food Control Plan for my restaurant compliant with the Food Act 2014." },
    { bullet: "Temperature monitoring", icon: Shield, title: "Temp Logs", description: "Set up temperature monitoring", prompt: "Set up a temperature monitoring system for our kitchen." },
    { bullet: "Allergen management", icon: AlertTriangle, title: "Allergens", description: "Build an allergen management system", prompt: "Help me build an allergen management system for our menu." },
    { bullet: "MPI audit preparation", icon: FileText, title: "MPI Audit", description: "Prepare for MPI food safety audit", prompt: "Help me prepare for an MPI food safety audit." },
  ],
  cellar: [
    { bullet: "Liquor licence applications", icon: Wine, title: "Licence Application", description: "Prepare your alcohol licence application", prompt: "Help me prepare an on-licence application under the Sale of Alcohol Act." },
    { bullet: "Duty manager certification", icon: Shield, title: "Duty Manager", description: "Duty manager certificate requirements", prompt: "What do I need for a duty manager's certificate?" },
    { bullet: "Host responsibility policy", icon: FileText, title: "Host Responsibility", description: "Create a host responsibility policy", prompt: "Create a host responsibility policy for my bar." },
    { bullet: "DLC submission preparation", icon: FileText, title: "DLC Submission", description: "Prepare a DLC submission", prompt: "Help me prepare my District Licensing Committee submission." },
  ],
  luxe: [
    { bullet: "VIP guest management", icon: Users, title: "VIP Management", description: "Design premium guest experiences", prompt: "Design a VIP guest experience programme for my luxury lodge." },
    { bullet: "Premium pricing strategy", icon: DollarSign, title: "Pricing Strategy", description: "Develop luxury pricing strategy", prompt: "Help me develop a premium pricing strategy for my boutique accommodation." },
    { bullet: "Concierge service design", icon: Sparkles, title: "Concierge", description: "Build a concierge service offering", prompt: "Design a concierge service offering for our luxury lodge." },
    { bullet: "Loyalty programme design", icon: Heart, title: "Loyalty Programme", description: "Create a premium loyalty programme", prompt: "Create a loyalty programme for our premium guests." },
  ],
  moana: [
    { bullet: "Tour operator compliance", icon: Shield, title: "Tour Compliance", description: "Ensure tour operation compliance", prompt: "Check my tour operation against NZ compliance requirements." },
    { bullet: "Adventure risk assessment", icon: AlertTriangle, title: "Risk Assessment", description: "Conduct an adventure activity risk assessment", prompt: "Create a risk assessment for my kayaking tour operation." },
    { bullet: "Itinerary design", icon: MapPin, title: "Design Itinerary", description: "Create tourism itineraries", prompt: "Design a 3-day adventure tourism itinerary in Queenstown." },
    { bullet: "Seasonal planning", icon: Calendar, title: "Seasonal Plan", description: "Plan for tourism seasons", prompt: "Help me plan for the upcoming tourism season." },
  ],
  kura: [
    { bullet: "Cultural experience design", icon: Globe, title: "Cultural Experience", description: "Design tikanga-aligned cultural tourism", prompt: "Design a cultural tourism experience aligned with tikanga Māori." },
    { bullet: "Māori hospitality protocols", icon: Users, title: "Māori Hospitality", description: "Implement Māori hospitality protocols", prompt: "Help me implement proper Māori hospitality protocols for visitors." },
    { bullet: "Pōwhiri guidance", icon: BookOpen, title: "Pōwhiri Guide", description: "Guide through pōwhiri protocols", prompt: "Guide me through the correct pōwhiri protocol for our tourism operation." },
    { bullet: "Cultural narrative development", icon: FileText, title: "Cultural Story", description: "Develop cultural narratives", prompt: "Help me develop cultural narratives for our tourism experience." },
  ],
  pau: [
    { bullet: "Event catering compliance", icon: Utensils, title: "Catering Compliance", description: "Ensure event catering meets food safety", prompt: "Create a food safety plan for our event catering operation." },
    { bullet: "Large-scale food service", icon: Users, title: "Large Events", description: "Plan large-scale food service", prompt: "Plan food service for a 500-person conference." },
    { bullet: "Temporary food registration", icon: FileText, title: "Temp Registration", description: "Register a temporary food stall", prompt: "Help me register a temporary food stall for the local market." },
    { bullet: "Run sheet creation", icon: Calendar, title: "Run Sheet", description: "Create an event run sheet", prompt: "Create a detailed run sheet for our wedding reception catering." },
  ],
  summit: [
    { bullet: "Adventure Activities Register", icon: Shield, title: "AAR Application", description: "Apply for Adventure Activities Register", prompt: "Help me apply for the Adventure Activities Register." },
    { bullet: "Safety audit preparation", icon: FileText, title: "Safety Audit", description: "Prepare for a safety audit", prompt: "Prepare us for an adventure activity safety audit." },
    { bullet: "Operator certification", icon: Trophy, title: "Certification", description: "Get operator certified", prompt: "What do I need for adventure activity operator certification?" },
    { bullet: "Risk management systems", icon: AlertTriangle, title: "Risk Systems", description: "Build a risk management system", prompt: "Build a risk management system for my bungy operation." },
  ],

  // ── HANGA (new agents) ──
  ata: [
    { bullet: "BIM model analysis", icon: Building, title: "BIM Analysis", description: "Analyse a BIM model for issues", prompt: "Upload a plan for BIM analysis." },
    { bullet: "Clash detection", icon: AlertTriangle, title: "Clash Detection", description: "Run clash detection across trades", prompt: "Run clash detection across MEP and structural trades." },
    { bullet: "4D scheduling", icon: Calendar, title: "4D Schedule", description: "Generate a 4D construction schedule", prompt: "Generate a 4D schedule from our BIM model." },
    { bullet: "3D walkthroughs", icon: Globe, title: "3D Walkthrough", description: "Create a 3D walkthrough", prompt: "Generate a 3D walkthrough from our building model." },
  ],
  arai: [
    { bullet: "Site safety plans", icon: HardHat, title: "Safety Plan", description: "Generate a site-specific safety plan", prompt: "Create a site safety plan for our residential build." },
    { bullet: "Hazard identification", icon: AlertTriangle, title: "Hazard Register", description: "Build a hazard register for your site", prompt: "Build a hazard register for our construction site." },
    { bullet: "SWMS generation", icon: FileText, title: "SWMS", description: "Generate a Safe Work Method Statement", prompt: "Generate a SWMS for working at height." },
    { bullet: "Incident investigation", icon: Shield, title: "Incident Report", description: "Investigate and report an incident", prompt: "Help me investigate a workplace incident and prepare the report." },
  ],
  kaupapa: [
    { bullet: "Project charter creation", icon: FileText, title: "Project Charter", description: "Create a construction project charter", prompt: "Create a project charter for our commercial building project." },
    { bullet: "NZS 3910 contract admin", icon: Scale, title: "Contract Admin", description: "NZS 3910 contract administration", prompt: "Help with NZS 3910 variation notice and payment claim review." },
    { bullet: "Payment claim review", icon: DollarSign, title: "Payment Claim", description: "Draft or review a payment claim", prompt: "Draft a payment claim under the Construction Contracts Act 2002." },
    { bullet: "Programme scheduling", icon: Calendar, title: "Programme", description: "Build a construction programme", prompt: "Build a construction programme with milestones and critical path." },
  ],
  rawa: [
    { bullet: "Procurement planning", icon: FileText, title: "Procurement Plan", description: "Create a procurement plan", prompt: "Create a procurement plan for our building project." },
    { bullet: "Vendor assessment", icon: Users, title: "Vendor Review", description: "Assess and compare vendors", prompt: "Help me assess and compare subcontractor tenders." },
    { bullet: "Supply chain risk review", icon: AlertTriangle, title: "Supply Risk", description: "Review supply chain risks", prompt: "Review our supply chain risks and suggest mitigations." },
    { bullet: "Cost control analysis", icon: DollarSign, title: "Cost Control", description: "Analyse project costs", prompt: "Analyse our project costs and identify savings opportunities." },
  ],
  "whakaaē": [
    { bullet: "Resource consent applications", icon: FileText, title: "Resource Consent", description: "Prepare a resource consent application", prompt: "Help me prepare a resource consent application." },
    { bullet: "Building consent prep", icon: Building, title: "Building Consent", description: "Prepare building consent documentation", prompt: "Prepare building consent documentation for our residential build." },
    { bullet: "CCC preparation", icon: Shield, title: "CCC Checklist", description: "Prepare for Code Compliance Certificate", prompt: "Create a CCC preparation checklist for our build." },
    { bullet: "Council liaison guidance", icon: Users, title: "Council Liaison", description: "Navigate council processes", prompt: "Help me navigate the council consent process." },
  ],
  pai: [
    { bullet: "Quality control checklists", icon: Shield, title: "QC Checklist", description: "Generate quality control checklists", prompt: "Generate a quality control checklist for our concrete pour." },
    { bullet: "Defect identification", icon: AlertTriangle, title: "Defect Report", description: "Document and track defects", prompt: "Help me document defects and create a remediation plan." },
    { bullet: "Punch list management", icon: FileText, title: "Punch List", description: "Build a practical completion punch list", prompt: "Create a punch list for practical completion inspection." },
    { bullet: "Producer statements", icon: FileText, title: "PS Tracking", description: "Track producer statements", prompt: "Help me track all producer statements required for CCC." },
  ],
  arc: [
    { bullet: "Building Code compliance", icon: Building, title: "Code Compliance", description: "Check NZ Building Code compliance", prompt: "Check my design against NZ Building Code H1, E2, and B1." },
    { bullet: "Specification writing", icon: FileText, title: "Specifications", description: "Write building specifications", prompt: "Help me write specifications for our residential project." },
    { bullet: "Design review", icon: Palette, title: "Design Review", description: "Review an architectural design", prompt: "Review my residential design for compliance and buildability." },
    { bullet: "BRANZ guidance", icon: BookOpen, title: "BRANZ Guide", description: "Access BRANZ guidance", prompt: "What does BRANZ recommend for our weathertightness detail?" },
  ],
  terra: [
    { bullet: "RMA compliance", icon: Shield, title: "RMA Check", description: "Check Resource Management Act compliance", prompt: "Check our development against RMA requirements." },
    { bullet: "Land use assessment", icon: MapPin, title: "Land Assessment", description: "Assess land use compliance", prompt: "Assess the land use compliance for our proposed subdivision." },
    { bullet: "Environmental assessment", icon: Leaf, title: "Environmental", description: "Conduct an environmental assessment", prompt: "Conduct an environmental assessment for our development site." },
    { bullet: "LINZ requirements", icon: FileText, title: "LINZ", description: "Navigate LINZ requirements", prompt: "What LINZ requirements apply to our property transaction?" },
  ],
  pinnacle: [
    { bullet: "GETS tender responses", icon: FileText, title: "Tender Response", description: "Write a competitive GETS tender", prompt: "Write a tender response for a government construction project on GETS." },
    { bullet: "Award submissions", icon: Trophy, title: "Award Entry", description: "Write an award submission", prompt: "Write an award submission for the NZ Construction Awards." },
    { bullet: "Case study development", icon: BookOpen, title: "Case Study", description: "Develop a construction case study", prompt: "Develop a case study showcasing our latest completed project." },
    { bullet: "Competitive positioning", icon: BarChart3, title: "Positioning", description: "Position against competitors", prompt: "Help me position our firm competitively for this tender." },
  ],

  // ── PAKIHI (new agents) ──
  ledger: [
    { bullet: "GST return preparation", icon: DollarSign, title: "GST Return", description: "Calculate and prepare your GST return", prompt: "Help me prepare my GST return." },
    { bullet: "PAYE & payroll compliance", icon: Users, title: "PAYE Calculator", description: "Calculate PAYE, KiwiSaver, and ACC", prompt: "Calculate full payroll cost for an employee earning $65,000/year." },
    { bullet: "Provisional tax planning", icon: Calendar, title: "Tax Planning", description: "Plan your provisional tax payments", prompt: "Help me plan my provisional tax." },
    { bullet: "Cashflow forecasting", icon: BarChart3, title: "Cashflow Forecast", description: "Build a 12-month cashflow forecast", prompt: "Build a 12-month cashflow forecast for my business." },
  ],
  vault: [
    { bullet: "Insurance policy comparison", icon: Shield, title: "Compare Policies", description: "Compare insurance policies", prompt: "Help me compare business insurance policies." },
    { bullet: "Claims dispute navigation", icon: Scale, title: "Dispute Claim", description: "Challenge a denied insurance claim", prompt: "My insurance claim was denied — what are my options?" },
    { bullet: "EQC guidance", icon: AlertTriangle, title: "EQC Guide", description: "Navigate EQC claims", prompt: "Guide me through the EQC claims process." },
    { bullet: "Risk assessment", icon: BarChart3, title: "Risk Assessment", description: "Assess business risks", prompt: "Run a risk assessment for my business insurance needs." },
  ],
  catalyst: [
    { bullet: "Job listing creation", icon: FileText, title: "Job Listing", description: "Create an optimised job listing", prompt: "Create a job listing for a senior developer role." },
    { bullet: "Interview frameworks", icon: Users, title: "Interview Guide", description: "Build an interview framework", prompt: "Build an interview framework with competency-based questions." },
    { bullet: "Candidate assessment", icon: Shield, title: "Assess Candidate", description: "Assess candidate fit", prompt: "Help me assess this candidate against our requirements." },
    { bullet: "Onboarding checklists", icon: FileText, title: "Onboarding", description: "Create an onboarding checklist", prompt: "Create a comprehensive onboarding checklist for new hires." },
  ],
  compass: [
    { bullet: "AEWV process navigation", icon: FileText, title: "AEWV Guide", description: "Navigate the AEWV process", prompt: "Walk me through the AEWV process for hiring a migrant worker." },
    { bullet: "Visa pathway mapping", icon: MapPin, title: "Visa Pathways", description: "Map visa to residence pathways", prompt: "Map the pathway from work visa to residence." },
    { bullet: "Employer accreditation", icon: Shield, title: "Accreditation", description: "Prepare for employer accreditation", prompt: "Help me prepare for employer accreditation." },
    { bullet: "Document checklist", icon: FileText, title: "Doc Checklist", description: "Generate visa document checklist", prompt: "Generate a complete document checklist for my visa application." },
  ],
  haven: [
    { bullet: "Healthy Homes compliance", icon: Home, title: "Healthy Homes", description: "Check your rental meets all 6 standards", prompt: "Run a Healthy Homes Standards compliance check for my rental." },
    { bullet: "Tenancy agreement drafting", icon: FileText, title: "Tenancy Agreement", description: "Draft a compliant tenancy agreement", prompt: "Draft a residential tenancy agreement." },
    { bullet: "Investment yield analysis", icon: DollarSign, title: "Yield Analysis", description: "Model yield scenarios", prompt: "Analyse yield scenarios for my investment property." },
    { bullet: "Tenancy Tribunal guidance", icon: Scale, title: "Tribunal Guide", description: "Navigate Tenancy Tribunal", prompt: "Help me prepare for a Tenancy Tribunal hearing." },
  ],
  counter: [
    { bullet: "Consumer Guarantees Act", icon: Shield, title: "CGA Compliance", description: "Check CGA obligations", prompt: "What are my obligations under the Consumer Guarantees Act?" },
    { bullet: "Sales campaigns", icon: Megaphone, title: "Sales Campaign", description: "Build a retail sales campaign", prompt: "Create a seasonal sales campaign for my store." },
    { bullet: "Loyalty programmes", icon: Heart, title: "Loyalty Programme", description: "Design a customer loyalty programme", prompt: "Design a loyalty programme for my retail business." },
    { bullet: "Inventory management", icon: BarChart3, title: "Stock Planner", description: "Optimise inventory levels", prompt: "Help me optimise my inventory with reorder points." },
  ],
  gateway: [
    { bullet: "Tariff classification", icon: Globe, title: "Classify Tariff", description: "Classify under NZ Working Tariff", prompt: "Classify this product under the NZ Working Tariff to 8-digit level." },
    { bullet: "Landed cost calculation", icon: DollarSign, title: "Landed Cost", description: "Calculate complete landed cost", prompt: "Calculate the complete landed cost for an import from China." },
    { bullet: "FTA origin analysis", icon: Shield, title: "FTA Check", description: "Check FTA preferential rates", prompt: "Check if my goods qualify for preferential FTA duty rates." },
    { bullet: "MPI biosecurity", icon: AlertTriangle, title: "MPI Check", description: "Check biosecurity requirements", prompt: "What MPI biosecurity requirements apply to my import?" },
  ],
  harvest: [
    { bullet: "Freshwater Farm Plans", icon: Leaf, title: "Farm Plan", description: "Create a Freshwater Farm Plan", prompt: "Help me create a Freshwater Farm Plan compliant with NPS-FM 2020." },
    { bullet: "GHG emission calculations", icon: BarChart3, title: "Emissions", description: "Calculate farm emissions", prompt: "Calculate my farm's greenhouse gas emissions." },
    { bullet: "Biosecurity management", icon: Shield, title: "Biosecurity", description: "Build a biosecurity plan", prompt: "Create a biosecurity management plan for my farm." },
    { bullet: "MPI compliance", icon: FileText, title: "MPI Compliance", description: "Check MPI requirements", prompt: "What MPI compliance requirements apply to my dairy farm?" },
  ],
  grove: [
    { bullet: "Export compliance", icon: Globe, title: "Export Compliance", description: "Meet export requirements", prompt: "What export compliance requirements apply to our wine exports?" },
    { bullet: "Phytosanitary certification", icon: Shield, title: "Phyto Cert", description: "Get phytosanitary certification", prompt: "Help me with phytosanitary certification for our kiwifruit exports." },
    { bullet: "Wine industry regulations", icon: Wine, title: "Wine Regs", description: "Navigate wine industry rules", prompt: "What regulations apply to my NZ winery?" },
    { bullet: "Orchard management", icon: Leaf, title: "Orchard Mgmt", description: "Optimise orchard operations", prompt: "Help me optimise my orchard management practices." },
  ],
  sage: [
    { bullet: "Market research & analysis", icon: BarChart3, title: "Market Research", description: "Conduct market research", prompt: "Conduct market research for my industry in NZ." },
    { bullet: "Competitive analysis", icon: Users, title: "Competitor Analysis", description: "Analyse your competitors", prompt: "Analyse my top 5 competitors and identify opportunities." },
    { bullet: "SWOT analysis", icon: Shield, title: "SWOT Analysis", description: "Run a SWOT analysis", prompt: "Run a SWOT analysis for my business." },
    { bullet: "Data-driven strategy", icon: Globe, title: "Strategy", description: "Build a data-driven strategy", prompt: "Help me build a data-driven growth strategy." },
  ],
  ascend: [
    { bullet: "Growth planning", icon: Zap, title: "Growth Plan", description: "Create a growth strategy", prompt: "Create a 12-month growth plan for my business." },
    { bullet: "KPI/OKR frameworks", icon: BarChart3, title: "KPIs & OKRs", description: "Set up KPIs and OKRs", prompt: "Help me set up meaningful KPIs and OKRs for my team." },
    { bullet: "Scaling strategy", icon: Globe, title: "Scaling", description: "Plan business scaling", prompt: "How should I scale my business to the next level?" },
    { bullet: "Performance optimisation", icon: Trophy, title: "Performance", description: "Optimise team performance", prompt: "Help me optimise my team's performance metrics." },
  ],

  // ── WAKA ──
  motor: [
    { bullet: "F&I disclosure compliance", icon: DollarSign, title: "F&I Disclosure", description: "CCCFA-compliant finance documents", prompt: "Generate a CCCFA-compliant finance disclosure document for a vehicle sale." },
    { bullet: "Vehicle listing optimisation", icon: Car, title: "Listing Creator", description: "Optimise vehicle listings", prompt: "Create an optimised vehicle listing for TradeMe." },
    { bullet: "GST margin scheme", icon: DollarSign, title: "Margin Scheme", description: "Calculate GST under margin scheme", prompt: "Calculate GST under the margin scheme for a used vehicle sale." },
    { bullet: "Warranty tracking", icon: Shield, title: "Warranty Claim", description: "Track and process warranty claims", prompt: "Help me draft a warranty claim for the manufacturer." },
  ],
  transit: [
    { bullet: "Heavy vehicle compliance", icon: Car, title: "Heavy Vehicle", description: "NZTA heavy vehicle compliance", prompt: "Check my heavy vehicle fleet against NZTA compliance requirements." },
    { bullet: "RUC calculations", icon: DollarSign, title: "RUC Calculator", description: "Calculate road user charges", prompt: "Calculate road user charges for my truck fleet." },
    { bullet: "Driver logbooks", icon: FileText, title: "Logbooks", description: "Set up driver logbook system", prompt: "Set up a compliant driver logbook system for our fleet." },
    { bullet: "Chain rule compliance", icon: Shield, title: "Chain Rule", description: "Understand chain rule obligations", prompt: "What are my chain rule obligations as a transport operator?" },
  ],
  mariner: [
    { bullet: "Vessel safety compliance", icon: Ship, title: "Vessel Safety", description: "Maritime safety compliance check", prompt: "Run a safety compliance check for my vessel." },
    { bullet: "Maritime Transport Act", icon: Shield, title: "Maritime Law", description: "Navigate maritime regulations", prompt: "What Maritime Transport Act requirements apply to my charter boat?" },
    { bullet: "Trip planning", icon: MapPin, title: "Trip Plan", description: "Plan a marine trip with safety", prompt: "Plan a fishing trip in the Hauraki Gulf with safety requirements." },
    { bullet: "Live vessel tracking", icon: Ship, title: "Track Vessel", description: "Track vessels in NZ waters", prompt: "Track vessels near Auckland port." },
  ],

  // ── HANGARAU ──
  "spark-cloud": [
    { bullet: "Build web apps from text", icon: Code, title: "Build App", description: "Describe what you want — get a working app", prompt: "Build me a quote calculator for my painting business." },
    { bullet: "Cloud migration planning", icon: Globe, title: "Cloud Migration", description: "Plan a cloud migration", prompt: "Help me plan a cloud migration for my team." },
    { bullet: "System architecture", icon: Building, title: "Architecture", description: "Design system architecture", prompt: "Design the system architecture for our new platform." },
    { bullet: "Infrastructure setup", icon: Code, title: "Infrastructure", description: "Set up cloud infrastructure", prompt: "Set up cloud infrastructure for our SaaS product." },
  ],
  sentinel: [
    { bullet: "Security monitoring", icon: Shield, title: "Security Monitor", description: "Set up security monitoring", prompt: "Set up a security monitoring system for our web application." },
    { bullet: "NZISM compliance", icon: FileText, title: "NZISM Check", description: "Check NZISM compliance", prompt: "Assess our security posture against NZISM." },
    { bullet: "Incident response", icon: AlertTriangle, title: "Incident Response", description: "Create incident response plan", prompt: "Create an incident response plan for our organisation." },
    { bullet: "Security policies", icon: Briefcase, title: "Security Policy", description: "Generate security policies", prompt: "Generate a comprehensive security policy for our NZ business." },
  ],
  "nexus-t": [
    { bullet: "API integration design", icon: Code, title: "API Integration", description: "Design API integrations", prompt: "Design an API integration architecture for our systems." },
    { bullet: "Webhook configuration", icon: Globe, title: "Webhooks", description: "Configure webhooks", prompt: "Help me configure webhooks between our systems." },
    { bullet: "Middleware design", icon: Building, title: "Middleware", description: "Design middleware architecture", prompt: "Design middleware to connect our legacy and modern systems." },
    { bullet: "Data flow mapping", icon: BarChart3, title: "Data Flow", description: "Map data flows across systems", prompt: "Map the data flows between our business systems." },
  ],
  cipher: [
    { bullet: "Cybersecurity assessment", icon: Shield, title: "Cyber Audit", description: "Run a cybersecurity assessment", prompt: "Run a cybersecurity assessment for my NZ business." },
    { bullet: "Penetration testing guidance", icon: AlertTriangle, title: "Pen Test Guide", description: "Guide penetration testing", prompt: "Guide me through penetration testing our web application." },
    { bullet: "Encryption standards", icon: Code, title: "Encryption", description: "Implement encryption standards", prompt: "What encryption standards should we implement?" },
    { bullet: "OWASP compliance", icon: Shield, title: "OWASP Check", description: "Check OWASP compliance", prompt: "Check our application against OWASP Top 10." },
  ],
  relay: [
    { bullet: "Email infrastructure", icon: Phone, title: "Email Setup", description: "Set up email infrastructure", prompt: "Set up a reliable email infrastructure for our business." },
    { bullet: "SMS/push notifications", icon: Phone, title: "Notifications", description: "Implement notification systems", prompt: "Implement an SMS and push notification system." },
    { bullet: "Communication architecture", icon: Building, title: "Comms Architecture", description: "Design communication systems", prompt: "Design our internal and external communication architecture." },
    { bullet: "Messaging platform", icon: Globe, title: "Messaging", description: "Set up messaging platforms", prompt: "Help me choose and set up a business messaging platform." },
  ],
  matrix: [
    { bullet: "Database design", icon: Code, title: "Database Design", description: "Design a database schema", prompt: "Design a database schema for our new application." },
    { bullet: "ETL pipeline planning", icon: BarChart3, title: "ETL Pipeline", description: "Plan ETL data pipelines", prompt: "Plan an ETL pipeline for our data warehouse." },
    { bullet: "Data warehouse architecture", icon: Building, title: "Data Warehouse", description: "Design a data warehouse", prompt: "Design a data warehouse architecture for our analytics." },
    { bullet: "Data governance", icon: Shield, title: "Data Governance", description: "Implement data governance", prompt: "Help me implement a data governance framework." },
  ],
  forge: [
    { bullet: "CI/CD pipeline design", icon: Code, title: "CI/CD Pipeline", description: "Design CI/CD pipelines", prompt: "Design a CI/CD pipeline for our development team." },
    { bullet: "Docker/Kubernetes", icon: Building, title: "Containers", description: "Set up container infrastructure", prompt: "Help me set up Docker and Kubernetes for our applications." },
    { bullet: "Infrastructure as code", icon: FileText, title: "IaC", description: "Implement infrastructure as code", prompt: "Implement infrastructure as code with Terraform." },
    { bullet: "Deployment automation", icon: Zap, title: "Deploy Automation", description: "Automate deployments", prompt: "Automate our deployment process with GitHub Actions." },
  ],
  oracle: [
    { bullet: "Predictive analytics", icon: BarChart3, title: "Predictions", description: "Build predictive models", prompt: "Help me build a predictive analytics model for our sales data." },
    { bullet: "ML model guidance", icon: Brain, title: "ML Models", description: "Guide ML implementation", prompt: "Guide me through implementing a machine learning model." },
    { bullet: "AI implementation strategy", icon: Sparkles, title: "AI Strategy", description: "Plan AI implementation", prompt: "Create an AI implementation strategy for our business." },
    { bullet: "Metric tracking", icon: BarChart3, title: "Metrics", description: "Set up metric tracking", prompt: "Set up comprehensive metric tracking for our product." },
  ],
  ember: [
    { bullet: "Carbon footprint calculation", icon: Leaf, title: "Carbon Calculator", description: "Calculate your carbon footprint", prompt: "Calculate my business carbon footprint." },
    { bullet: "ETS compliance", icon: Shield, title: "ETS Compliance", description: "Check ETS obligations", prompt: "What are my ETS obligations?" },
    { bullet: "Solar ROI analysis", icon: DollarSign, title: "Solar ROI", description: "Analyse solar investment ROI", prompt: "Should I install solar panels? Calculate the ROI." },
    { bullet: "Climate disclosure", icon: FileText, title: "Climate Report", description: "Prepare climate disclosures", prompt: "Prepare climate-related financial disclosures for my business." },
  ],
  reef: [
    { bullet: "Resource consent navigation", icon: FileText, title: "Resource Consent", description: "Navigate resource consent", prompt: "Walk me through the resource consent process under the RMA." },
    { bullet: "Environmental impact assessment", icon: Leaf, title: "EIA", description: "Prepare an environmental assessment", prompt: "Prepare an Assessment of Environmental Effects." },
    { bullet: "Discharge consent", icon: Shield, title: "Discharge Consent", description: "Apply for discharge consent", prompt: "Help me apply for a discharge consent." },
    { bullet: "EPA requirements", icon: FileText, title: "EPA Guide", description: "Navigate EPA requirements", prompt: "What EPA requirements apply to my activity?" },
  ],
  patent: [
    { bullet: "Patent applications", icon: FileText, title: "Patent Application", description: "File a patent with IPONZ", prompt: "Guide me through filing a patent application with IPONZ." },
    { bullet: "Trademark registration", icon: Shield, title: "Trademark", description: "Register a trademark", prompt: "Help me register a trademark for my brand." },
    { bullet: "IP strategy", icon: Briefcase, title: "IP Strategy", description: "Build an IP strategy", prompt: "Build an intellectual property strategy for my business." },
    { bullet: "Copyright protection", icon: Shield, title: "Copyright", description: "Protect your copyright", prompt: "How do I protect my copyright in NZ?" },
  ],
  foundry: [
    { bullet: "Manufacturing compliance", icon: Building, title: "Manufacturing", description: "Check manufacturing compliance", prompt: "Check our manufacturing operation against NZ compliance requirements." },
    { bullet: "Lean production", icon: Zap, title: "Lean Production", description: "Implement lean manufacturing", prompt: "Help me implement lean manufacturing principles." },
    { bullet: "Industrial safety", icon: HardHat, title: "Industrial Safety", description: "Industrial H&S compliance", prompt: "Create an industrial safety plan for our factory." },
    { bullet: "Quality management", icon: Shield, title: "Quality Mgmt", description: "Implement quality management", prompt: "Implement a quality management system for our manufacturing." },
  ],

  // ── HAUORA ──
  turf: [
    { bullet: "Club constitution generation", icon: FileText, title: "Generate Constitution", description: "Create a compliant constitution", prompt: "Generate a compliant constitution for my sports club under the Incorporated Societies Act 2022." },
    { bullet: "Grant application writing", icon: DollarSign, title: "Grant Application", description: "Draft a funding application", prompt: "Help me write a grant application for NZCT funding for our sports club." },
    { bullet: "Season fixture planning", icon: Calendar, title: "Season Draw", description: "Build a fixture schedule", prompt: "Create a season fixture draw for our 12-team competition." },
    { bullet: "Compliance checking", icon: Shield, title: "Compliance Check", description: "Check Inc Societies Act compliance", prompt: "Run a compliance check against the Incorporated Societies Act 2022." },
  ],
  league: [
    { bullet: "Tournament draw generation", icon: Trophy, title: "Tournament Draw", description: "Generate a tournament draw", prompt: "Generate a tournament draw for our 16-team knockout competition." },
    { bullet: "Event planning", icon: Calendar, title: "Event Plan", description: "Plan a sporting event", prompt: "Plan our annual sports tournament — logistics, scheduling, and compliance." },
    { bullet: "League management", icon: BarChart3, title: "League Manager", description: "Manage a league competition", prompt: "Help me manage our league competition — fixtures, results, and standings." },
    { bullet: "Venue coordination", icon: MapPin, title: "Venue", description: "Coordinate venue bookings", prompt: "Help me coordinate venue bookings for our season." },
  ],
  vitals: [
    { bullet: "HSWA compliance checking", icon: Shield, title: "HSWA Check", description: "Check workplace H&S compliance", prompt: "Run a Health and Safety at Work Act compliance check for my workplace." },
    { bullet: "ACC claims navigation", icon: FileText, title: "ACC Claims", description: "Navigate ACC claims", prompt: "Guide me through the ACC claims process for a workplace injury." },
    { bullet: "Workplace injury management", icon: AlertTriangle, title: "Injury Mgmt", description: "Manage workplace injuries", prompt: "An employee has been injured — what do I need to do?" },
    { bullet: "Safety system design", icon: HardHat, title: "Safety System", description: "Design a safety management system", prompt: "Design a workplace safety management system for my business." },
  ],
  remedy: [
    { bullet: "APC renewal tracking", icon: Stethoscope, title: "APC Tracker", description: "Track practising certificate renewals", prompt: "Track my Annual Practising Certificate renewal dates." },
    { bullet: "Practice audit checklists", icon: Shield, title: "Practice Audit", description: "Generate practice audit checklists", prompt: "Generate a practice audit checklist covering infection control and clinical records." },
    { bullet: "HDC complaint response", icon: FileText, title: "HDC Response", description: "Respond to HDC complaints", prompt: "Help me draft a response to a Health & Disability Commissioner complaint." },
    { bullet: "Clinical governance", icon: Stethoscope, title: "Clinical Governance", description: "Build clinical governance", prompt: "Create a clinical governance framework for my practice." },
  ],
  vitae: [
    { bullet: "Weekly meal planning", icon: Apple, title: "Meal Plan", description: "Generate a budget-friendly meal plan", prompt: "Create a weekly meal plan for a family of 4 on $200/week." },
    { bullet: "Dietary requirement planning", icon: FileText, title: "Diet Planner", description: "Plan meals around requirements", prompt: "Help me plan meals for dietary requirements." },
    { bullet: "Seasonal produce guide", icon: Leaf, title: "Seasonal Guide", description: "What's in season right now", prompt: "What fruits and vegetables are in season in NZ right now?" },
    { bullet: "Nutritional analysis", icon: BarChart3, title: "Nutrition Check", description: "Analyse nutritional content", prompt: "Analyse the nutritional content of my meal plan." },
  ],
  radiance: [
    { bullet: "Skincare routine building", icon: Sparkles, title: "Skin Routine", description: "Build a skincare routine for NZ", prompt: "Build a skincare routine for NZ's high UV conditions." },
    { bullet: "NZ beauty brand guide", icon: Heart, title: "NZ Brands", description: "Discover NZ beauty brands", prompt: "Recommend NZ-made skincare and beauty brands." },
    { bullet: "Ingredient analysis", icon: Shield, title: "Check Ingredients", description: "Analyse beauty product ingredients", prompt: "Analyse the ingredients list on my skincare product." },
    { bullet: "UV protection advice", icon: Shield, title: "UV Guide", description: "NZ UV protection guidance", prompt: "What SPF and sun protection do I need in NZ?" },
  ],
  palette: [
    { bullet: "Space planning", icon: Home, title: "Space Plan", description: "Plan your interior space", prompt: "Help me plan the layout for my new office space." },
    { bullet: "Interior styling guidance", icon: Palette, title: "Interior Style", description: "Get interior design advice", prompt: "Give me interior styling advice for my living room." },
    { bullet: "Renovation planning", icon: Building, title: "Renovation Plan", description: "Plan a renovation project", prompt: "Help me plan my kitchen renovation — budget and design." },
    { bullet: "Design trend analysis", icon: Sparkles, title: "Design Trends", description: "Current NZ design trends", prompt: "What are the current interior design trends in NZ?" },
  ],
  odyssey: [
    { bullet: "Road trip planning", icon: MapPin, title: "Road Trip", description: "Plan a NZ road trip", prompt: "Plan a South Island road trip — 10 days, must-see stops." },
    { bullet: "Great Walk guidance", icon: Leaf, title: "Great Walk", description: "Plan a Great Walk", prompt: "Which Great Walk should I do? Compare difficulty and bookings." },
    { bullet: "Family holiday planning", icon: Plane, title: "Family Holiday", description: "Plan a family holiday", prompt: "Plan a family holiday from NZ — budget-friendly destinations." },
    { bullet: "Freedom camping rules", icon: Home, title: "Freedom Camp", description: "NZ freedom camping rules", prompt: "What are the freedom camping rules in NZ?" },
  ],

  // ── TE KĀHUI REO ──
  whanau: [
    { bullet: "Whānau governance frameworks", icon: Users, title: "Whānau Governance", description: "Build a whānau governance framework", prompt: "Help me build a whānau governance framework for our trust." },
    { bullet: "Data sovereignty assessment", icon: Shield, title: "Data Sovereignty", description: "Assess data sovereignty practices", prompt: "Run a data sovereignty assessment for our iwi organisation." },
    { bullet: "Hapū coordination", icon: Users, title: "Hapū Support", description: "Coordinate hapū activities", prompt: "Help me coordinate activities across our hapū." },
    { bullet: "Enterprise insights", icon: BarChart3, title: "Enterprise Insights", description: "Generate enterprise insights", prompt: "Generate enterprise insights for our Māori business." },
  ],
  rohe: [
    { bullet: "Regional governance", icon: MapPin, title: "Regional Governance", description: "Build regional governance", prompt: "Help me build a regional governance framework for our rohe." },
    { bullet: "Community reporting", icon: BarChart3, title: "Community Report", description: "Generate community reports", prompt: "Generate a community impact report for our rohe." },
    { bullet: "Cross-rohe analysis", icon: Globe, title: "Cross-Rohe", description: "Analyse across regions", prompt: "Conduct a cross-rohe analysis of our programmes." },
    { bullet: "Local governance advice", icon: Shield, title: "Local Governance", description: "Advise on local governance", prompt: "Advise on best practice local governance structures." },
  ],
  "kaupapa-m": [
    { bullet: "Kaupapa Māori alignment", icon: BookOpen, title: "Kaupapa Māori", description: "Align with kaupapa Māori", prompt: "Check our project alignment with kaupapa Māori principles." },
    { bullet: "Cultural integrity assessment", icon: Shield, title: "Cultural Integrity", description: "Assess cultural integrity", prompt: "Run a cultural integrity assessment on our programme." },
    { bullet: "Tikanga alignment", icon: Globe, title: "Tikanga Check", description: "Check tikanga alignment", prompt: "Check our practices against tikanga Māori standards." },
    { bullet: "Mātauranga application", icon: BookOpen, title: "Mātauranga", description: "Apply mātauranga Māori", prompt: "Help me apply mātauranga Māori to our research project." },
  ],
  "mana-bi": [
    { bullet: "Te Tiriti obligations mapping", icon: BookOpen, title: "Tiriti Obligations", description: "Map Te Tiriti obligations", prompt: "What are my Te Tiriti obligations as a NZ business?" },
    { bullet: "Iwi engagement guidance", icon: Users, title: "Iwi Engagement", description: "Engage with local iwi", prompt: "How do I engage with local iwi for a development project?" },
    { bullet: "Te reo in business", icon: Globe, title: "Te Reo Guide", description: "Use te reo correctly in business", prompt: "Guide me on using te reo Māori correctly in my business." },
    { bullet: "Māori governance", icon: Shield, title: "Māori Governance", description: "Build tikanga-aligned governance", prompt: "Help me build a governance framework aligned with tikanga Māori." },
  ],
  kaitiaki: [
    { bullet: "Environmental stewardship", icon: Leaf, title: "Kaitiakitanga", description: "Environmental stewardship guidance", prompt: "Help me implement kaitiakitanga principles in our operations." },
    { bullet: "Taonga management", icon: Shield, title: "Taonga", description: "Manage cultural taonga", prompt: "How should we manage our cultural taonga?" },
    { bullet: "Conservation guidance", icon: TreePine, title: "Conservation", description: "Environmental conservation", prompt: "Guide me on environmental conservation for our land." },
    { bullet: "Cultural heritage protection", icon: BookOpen, title: "Heritage", description: "Protect cultural heritage", prompt: "How do we protect cultural heritage on our development site?" },
  ],
  taura: [
    { bullet: "Community network building", icon: Users, title: "Network Building", description: "Build community networks", prompt: "Help me build a community network for our kaupapa." },
    { bullet: "Support service coordination", icon: Heart, title: "Support Services", description: "Coordinate support services", prompt: "Coordinate support services for our community." },
    { bullet: "Partnership development", icon: Users, title: "Partnerships", description: "Develop partnerships", prompt: "Help me develop partnerships with other Māori organisations." },
    { bullet: "Relationship management", icon: Globe, title: "Relationships", description: "Manage key relationships", prompt: "Help me manage our key stakeholder relationships." },
  ],
  whakaaro: [
    { bullet: "Strategic planning", icon: BarChart3, title: "Strategic Plan", description: "Strategic planning with Māori lens", prompt: "Develop a strategic plan with a Māori-informed perspective." },
    { bullet: "Long-term vision", icon: Globe, title: "Vision Framework", description: "Build a long-term vision", prompt: "Help me build a long-term vision for our organisation." },
    { bullet: "Policy analysis", icon: FileText, title: "Policy Analysis", description: "Analyse policy impacts", prompt: "Analyse the impact of this policy on Māori communities." },
    { bullet: "Governance advisory", icon: Shield, title: "Governance Advisory", description: "Strategic governance advice", prompt: "Provide strategic governance advice for our board." },
  ],
  hiringa: [
    { bullet: "Organisational resilience", icon: Zap, title: "Resilience", description: "Build organisational resilience", prompt: "Help me build organisational resilience for our Māori enterprise." },
    { bullet: "Innovation frameworks", icon: Sparkles, title: "Innovation", description: "Develop innovation frameworks", prompt: "Develop an innovation framework for our organisation." },
    { bullet: "Enterprise growth", icon: BarChart3, title: "Growth Plan", description: "Plan enterprise growth", prompt: "Create a growth plan for our Māori enterprise." },
    { bullet: "Capability building", icon: Users, title: "Capability", description: "Build organisational capability", prompt: "Help me build capability in our team." },
  ],

  // ── TŌROA ──
  toroa: [
    { bullet: "Family calendar management", icon: Calendar, title: "Weekly Planner", description: "Organise your family's entire week", prompt: "Help me plan our family's week." },
    { bullet: "Budget tracking & goals", icon: DollarSign, title: "Family Budget", description: "Build a household budget", prompt: "Help me create a family budget." },
    { bullet: "Meal planning & groceries", icon: Apple, title: "Meal Planner", description: "Generate a weekly meal plan", prompt: "Create a weekly meal plan for a family of 4." },
    { bullet: "School newsletter parsing", icon: FileText, title: "Newsletter Parser", description: "Extract key dates from newsletters", prompt: "I'm uploading my child's school newsletter. Extract key dates." },
  ],
};

// Quick action labels (3-4 per agent, shown below chat input)
export const agentQuickActions: Record<string, AgentQuickAction[]> = Object.fromEntries(
  Object.entries(agentCapabilities).map(([id, caps]) => [
    id,
    caps.slice(0, 4).map(c => ({ label: c.title, prompt: c.prompt })),
  ])
);

