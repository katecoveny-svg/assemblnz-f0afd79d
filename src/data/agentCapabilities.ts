// Agent-specific capability bullets for cards + quick actions + starter cards
import { FileText, DollarSign, Calendar, Shield, Utensils, Wine, Users, Building, HardHat, CreditCard, Car, Palette, BarChart3, Globe, Anchor, Ship, Heart, Brain, Scale, Laptop, GraduationCap, Home, MapPin, Leaf, Zap, Shirt, Plane, Dumbbell, Apple, Sparkles, PartyPopper, BookOpen, Building2, TreePine, HandHeart, School, Stethoscope, House, AlertTriangle, Briefcase, Code, Trophy, Megaphone, type LucideIcon } from "lucide-react";

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
};

// Quick action labels (3-4 per agent, shown below chat input)
export const agentQuickActions: Record<string, AgentQuickAction[]> = Object.fromEntries(
  Object.entries(agentCapabilities).map(([id, caps]) => [
    id,
    caps.slice(0, 4).map(c => ({ label: c.title, prompt: c.prompt })),
  ])
);
