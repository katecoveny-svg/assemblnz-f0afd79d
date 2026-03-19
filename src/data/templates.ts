export interface Template {
  icon: string; // emoji for template tab, key into ICON_MAP for legacy modal
  title: string;
  description: string;
  timeSaved: string;
  prompt: string;
  emoji?: string; // emoji to display in template tab cards
}

// Agents with a dedicated Templates tab
export const TEMPLATE_TAB_AGENTS = [
  "nexus", "apex", "accounting", "legal", "property", "immigration", "prism", "flux", "operations",
];

export const agentTemplates: Record<string, Template[]> = {
  nexus: [
    { icon: "box", emoji: "📦", title: "Import Entry Processor", description: "Upload a commercial invoice and I'll extract all line items into lodgement-ready data with tariff codes, duty, and GST calculations.", timeSaved: "~45 min per entry", prompt: "I need to process an import entry. Upload the commercial invoice or provide the details and I'll extract all line items into lodgement-ready data with tariff codes, duty, and GST calculations." },
    { icon: "upload", emoji: "📤", title: "Export Entry Processor", description: "Upload export documents and I'll prepare structured export entry data for TSW lodgement.", timeSaved: "~30 min per entry", prompt: "I need to prepare an export entry. Upload your export documents and I'll prepare structured export entry data for TSW lodgement." },
    { icon: "search", emoji: "🔍", title: "Tariff Classifier", description: "Describe your product and I'll suggest the correct NZ Tariff classification with duty rates.", timeSaved: "~20 min per item", prompt: "I need to classify a product under the NZ Tariff. Let me ask you some questions to determine the correct classification. First, can you describe the product in detail?" },
    { icon: "globe", emoji: "🌐", title: "FTA Savings Checker", description: "Check if a Free Trade Agreement can reduce your import duty based on the country of origin.", timeSaved: "~15 min per check", prompt: "I'll check if a Free Trade Agreement can reduce your import duty. First, what is the product you're importing — do you have an HS code, or can you describe it?" },
    { icon: "coin", emoji: "💰", title: "Duty & GST Calculator", description: "Calculate total import charges: customs duty, GST, and fees for your shipment.", timeSaved: "~15 min per calculation", prompt: "I'll calculate the total import charges for your shipment. First, what is the tariff/HS code for your goods? If you're unsure, describe the product and I'll help classify it." },
    { icon: "clipboard", emoji: "📋", title: "Import Compliance Checklist", description: "Get a complete compliance checklist for your specific import — permits, biosecurity, labelling, and more.", timeSaved: "~1 hour", prompt: "I'll generate a complete import compliance checklist for your shipment. First, what type of product are you importing?" },
  ],
  apex: [
    { icon: "safetyVest", emoji: "🦺", title: "Site Safety Plan", description: "Generate a site-specific safety plan with hazard register, emergency procedures, and sign-off sheets.", timeSaved: "~6 hours", prompt: "I'll generate a site-specific safety plan for your project. Let me collect some details — first, what type of construction project is this (e.g. residential new build, commercial fitout, civil works)?" },
    { icon: "coin", emoji: "📝", title: "Payment Claim (CCA)", description: "Generate a Construction Contracts Act compliant payment claim ready to serve.", timeSaved: "~2 hours", prompt: "I'll generate a CCA-compliant payment claim. Let me ask you some questions. First, what is the contract reference or project name?" },
    { icon: "megaphone", emoji: "🔨", title: "Toolbox Talk", description: "Generate a 5-minute toolbox talk on any construction safety topic with sign-off sheet.", timeSaved: "~30 min", prompt: "I'll generate a toolbox talk for your site. What safety topic would you like to cover (e.g. working at heights, excavation, manual handling)?" },
    { icon: "checkmark", emoji: "✅", title: "Practical Completion Checklist", description: "Generate a comprehensive practical completion inspection checklist for your building type.", timeSaved: "~3 hours", prompt: "I'll generate a practical completion checklist. First, what type of building is this (residential, commercial, or industrial)?" },
    { icon: "search", emoji: "📊", title: "Building Consent Document List", description: "Get the exact list of documents you need for your specific building consent application.", timeSaved: "~2 hours", prompt: "I'll generate the document list for your building consent. First, can you briefly describe the project?" },
    { icon: "wrench", emoji: "🔧", title: "Defect Report", description: "Generate a structured defect report with severity rating and remediation recommendations.", timeSaved: "~45 min", prompt: "I'll generate a structured defect report. Can you describe the defect you've found?" },
    { icon: "document", emoji: "📐", title: "Variation Notice", description: "Draft an NZS 3910 compliant variation notice for contract changes.", timeSaved: "~1 hour", prompt: "I'll draft an NZS 3910 compliant variation notice. First, what is the contract reference?" },
  ],
  accounting: [
    { icon: "coin", emoji: "📊", title: "GST Return Calculator", description: "Upload your sales and expenses summary and I'll calculate your GST return figures.", timeSaved: "~2 hours", prompt: "I'll calculate your GST return. Let me collect some details. First, what GST period is this for, and what filing basis are you on (payments, invoice, or hybrid)?" },
    { icon: "receipt", emoji: "🧾", title: "Tax Invoice Generator", description: "Generate a GST-compliant tax invoice with correct formatting and required fields.", timeSaved: "~10 min per invoice", prompt: "I'll generate a GST-compliant tax invoice. First, what are your business/supplier details (business name, GST number, address)?" },
    { icon: "calendar", emoji: "📅", title: "Tax Filing Calendar", description: "Get a personalised calendar of every IRD due date for your specific business type.", timeSaved: "~1 hour", prompt: "I'll create a personalised tax filing calendar. First, what is your business structure (sole trader, company, partnership, or trust)?" },
    { icon: "coin", emoji: "💼", title: "Provisional Tax Calculator", description: "Calculate your provisional tax obligations under standard, estimation, or AIM methods.", timeSaved: "~30 min", prompt: "I'll calculate your provisional tax. First, what was your residual income tax (RIT) for the previous year?" },
    { icon: "chart", emoji: "📂", title: "Expense Categoriser", description: "Upload a bank statement or expense list and I'll categorise everything for tax purposes.", timeSaved: "~3 hours per month", prompt: "I'll categorise your expenses for tax purposes. Upload a bank statement or expense list, or paste the data." },
    { icon: "checkmark", emoji: "📋", title: "Year-End Checklist", description: "Get a complete year-end accounting checklist tailored to your business type.", timeSaved: "~2 hours", prompt: "I'll generate a year-end accounting checklist. First, what type of business are you (sole trader, company, partnership)?" },
    { icon: "coin", emoji: "🚗", title: "FBT Calculator", description: "Calculate your Fringe Benefit Tax liability for vehicles, low-interest loans, or other benefits.", timeSaved: "~1 hour", prompt: "I'll calculate your Fringe Benefit Tax liability. First, what type of fringe benefit are you providing (vehicle, low-interest loan, other)?" },
  ],
  legal: [
    { icon: "pen", emoji: "📄", title: "Employment Agreement", description: "Generate a compliant NZ employment agreement — individual, fixed-term, or casual.", timeSaved: "~3 hours", prompt: "I'll generate a compliant NZ employment agreement. I'll ask about 20 questions one at a time. First, is this role full-time, part-time, fixed-term, or casual?" },
    { icon: "heart", emoji: "👨‍👩‍👧", title: "Separation Action Plan", description: "Get a personalised step-by-step plan for your separation — covering children, property, finances, and support services.", timeSaved: "~2 hours of lawyer consultation", prompt: "I'll create a personalised separation action plan. I'll ask some questions to understand your situation. First, are you married or in a de facto relationship, and how long have you been together?" },
    { icon: "child", emoji: "💰", title: "Child Support Estimator", description: "Estimate child support payments based on both parents' incomes and care arrangements.", timeSaved: "~30 min", prompt: "I'll estimate child support payments. First, what is the paying parent's gross annual income?" },
    { icon: "lock", emoji: "🔒", title: "Privacy Policy Generator", description: "Generate an NZ Privacy Act 2020 compliant privacy policy for your website or business.", timeSaved: "~4 hours", prompt: "I'll generate a Privacy Act 2020 compliant privacy policy. First, what type of business or organisation is this for?" },
    { icon: "clipboard", emoji: "📋", title: "Terms & Conditions Generator", description: "Generate terms and conditions covering NZ consumer law for your products or services.", timeSaved: "~4 hours", prompt: "I'll generate terms and conditions for your business. First, what type of business are you — do you sell products, services, or both?" },
    { icon: "handshake", emoji: "🤝", title: "Contractor Agreement Outline", description: "Get a contractor agreement outline with contractor-vs-employee analysis included.", timeSaved: "~3 hours", prompt: "I'll create a contractor agreement outline. First, what is the nature of the engagement — what work will the contractor be doing?" },
    { icon: "safetyVest", emoji: "🦺", title: "H&S Policy Generator", description: "Generate a Health and Safety at Work Act compliant policy for your workplace.", timeSaved: "~5 hours", prompt: "I'll generate an H&S policy for your workplace. First, what industry are you in?" },
  ],
  property: [
    { icon: "home", emoji: "🏠", title: "Healthy Homes Audit", description: "Check your rental property against every Healthy Homes Standard and get a gap report with fix recommendations.", timeSaved: "~3 hours", prompt: "I'll audit your property against the Healthy Homes Standards. I'll ask about 12 questions. First, what type of property is this (house, apartment, unit, townhouse)?" },
    { icon: "increase", emoji: "📈", title: "Rent Increase Notice", description: "Generate a compliant rent increase notice with correct notice period and format.", timeSaved: "~30 min", prompt: "I'll generate a compliant rent increase notice. First, what is the current weekly rent?" },
    { icon: "search", emoji: "🔍", title: "Property Inspection Report", description: "Generate a structured property inspection report with room-by-room checklist.", timeSaved: "~2 hours", prompt: "I'll generate a property inspection report. First, what is the property address?" },
    { icon: "coin", emoji: "💰", title: "Rental Yield Calculator", description: "Calculate gross and net rental yield, plus monthly cash flow analysis.", timeSaved: "~30 min", prompt: "I'll calculate rental yield and cash flow. First, what is the purchase price (or current value) of the property?" },
    { icon: "chart", emoji: "📊", title: "Brightline Test Calculator", description: "Determine if the Brightline test applies to your property sale and estimate tax liability.", timeSaved: "~30 min", prompt: "I'll check if the Brightline test applies to your property. First, when did you purchase the property (date)?" },
    { icon: "clipboard", emoji: "📋", title: "Bond Lodgement Checklist", description: "Step-by-step guide to correctly lodging a bond with Tenancy Services.", timeSaved: "~20 min", prompt: "I'll guide you through bond lodgement. First, what is the bond amount?" },
    { icon: "checkmark", emoji: "🏗️", title: "Landlord Compliance Checklist", description: "Complete compliance checklist covering every landlord obligation under NZ law.", timeSaved: "~2 hours", prompt: "I'll create a landlord compliance checklist. First, what type of rental property is this?" },
  ],
  immigration: [
    { icon: "clipboard", emoji: "📋", title: "Visa Document Checklist", description: "Get the complete document checklist for your specific visa category.", timeSaved: "~2 hours", prompt: "I'll generate a visa document checklist. First, what type of visa are you applying for (AEWV, SMC, Student, Partner, Visitor, etc.)?" },
    { icon: "chart", emoji: "📊", title: "SMC Points Calculator", description: "Calculate your Skilled Migrant Category points and see where you stand.", timeSaved: "~30 min", prompt: "I'll calculate your SMC points. Let me ask some questions. First, what is your age?" },
    { icon: "checkmark", emoji: "✅", title: "Employer Accreditation Checklist", description: "Get the complete checklist for standard, high-volume, or franchise employer accreditation.", timeSaved: "~3 hours", prompt: "I'll generate an employer accreditation checklist. First, what type of accreditation are you applying for (standard, high-volume, or franchise)?" },
    { icon: "couple", emoji: "💍", title: "Relationship Evidence Guide", description: "Get a personalised guide on what evidence to provide for your partnership visa.", timeSaved: "~3 hours", prompt: "I'll create a relationship evidence guide for your partnership visa. First, how long have you been in this relationship?" },
    { icon: "calendar", emoji: "📅", title: "Visa Pathway Timeline", description: "Map out your visa pathway from current status to residence with key dates and milestones.", timeSaved: "~1 hour", prompt: "I'll map out your visa pathway to residence. First, what is your current visa type?" },
    { icon: "document", emoji: "📝", title: "Job Check Preparation", description: "Prepare all the information needed for an AEWV job check application.", timeSaved: "~2 hours", prompt: "I'll help you prepare for a job check application. First, what is the job title?" },
  ],
  prism: [
    { icon: "calendar", emoji: "📅", title: "30-Day Content Calendar", description: "Generate a complete month of social media posts with copy, hashtags, and posting times.", timeSaved: "~6 hours", prompt: "I'll generate a 30-day content calendar. First, what type of business are you?" },
    { icon: "checkmark", emoji: "✅", title: "Ad Compliance Check", description: "Check your ad copy against ASA Advertising Standards Code before publishing.", timeSaved: "~30 min", prompt: "I'll check your ad copy for ASA compliance. Please paste the ad copy you'd like me to review." },
    { icon: "sparkle", emoji: "🎨", title: "Brand Guidelines Outline", description: "Generate a brand guidelines document covering voice, tone, visual rules, and dos/don'ts.", timeSaved: "~8 hours", prompt: "I'll generate brand guidelines. First, what is your business name?" },
    { icon: "document", emoji: "📰", title: "Press Release Writer", description: "Generate an NZ-style press release with headline, body, quotes placeholder, and media distribution tips.", timeSaved: "~2 hours", prompt: "I'll write a press release. First, what is the news or announcement?" },
    { icon: "chart", emoji: "📊", title: "Marketing Plan Generator", description: "Generate a 12-month marketing plan with budget allocation, channels, and campaign calendar.", timeSaved: "~12 hours", prompt: "I'll generate a 12-month marketing plan. First, what type of business are you?" },
    { icon: "pen", emoji: "📝", title: "Campaign Brief", description: "Generate a creative brief for designers or agencies with objectives, audience, deliverables, and timeline.", timeSaved: "~2 hours", prompt: "I'll generate a campaign brief. First, what is the campaign name or working title?" },
  ],
  flux: [
    { icon: "pen", emoji: "📄", title: "Proposal Writer", description: "Upload an RFP or tender brief and I'll generate a structured proposal response.", timeSaved: "~6 hours", prompt: "I'll generate a structured proposal. First, can you upload the RFP or tender brief, or describe the opportunity?" },
    { icon: "mail", emoji: "✉️", title: "Cold Outreach Sequence", description: "Generate 5 personalised outreach emails compliant with NZ anti-spam law.", timeSaved: "~2 hours", prompt: "I'll create a cold outreach email sequence. First, what industry are you targeting?" },
    { icon: "chart", emoji: "📊", title: "Sales Pipeline Builder", description: "Generate a custom sales pipeline with stages, actions, KPIs, and CRM setup recommendations.", timeSaved: "~3 hours", prompt: "I'll build a sales pipeline for your business. First, what type of business are you and what do you sell?" },
    { icon: "building", emoji: "📋", title: "GETS Tender Response", description: "Upload a government tender from GETS and I'll generate a response structure with compliance matrix.", timeSaved: "~5 hours", prompt: "I'll help structure a GETS tender response. Upload the tender document or describe the opportunity." },
    { icon: "clipboard", emoji: "🤝", title: "Meeting Prep Brief", description: "Get a one-page brief for your next prospect meeting with company research, talking points, and questions.", timeSaved: "~45 min", prompt: "I'll prepare a meeting brief. First, what is the prospect company name?" },
    { icon: "mail", emoji: "📧", title: "Follow-Up Sequence", description: "Generate a 5-email follow-up sequence with optimal timing for NZ business culture.", timeSaved: "~1 hour", prompt: "I'll create a follow-up email sequence. First, what is the context — post-meeting, post-proposal, re-engagement, or event follow-up?" },
  ],
  operations: [
    { icon: "document", emoji: "📋", title: "School Newsletter Parser", description: "Upload a photo of any school notice and I'll extract every date, fee, and action item.", timeSaved: "~20 min per newsletter", prompt: "Upload a school newsletter and I'll extract every date, fee, and action item for you." },
    { icon: "fork", emoji: "🍽️", title: "Weekly Meal Plan", description: "Get a 7-day meal plan with grocery list, estimated costs, and meal prep strategy.", timeSaved: "~2 hours per week", prompt: "I'll create a weekly meal plan. First, how many people are you cooking for?" },
    { icon: "coin", emoji: "💰", title: "Household Budget", description: "Set up a complete household budget with NZ-specific categories and savings goals.", timeSaved: "~3 hours", prompt: "I'll set up a household budget. First, what is your approximate combined household income (before tax)?" },
    { icon: "home", emoji: "🏠", title: "House Manual", description: "Generate a complete house manual for babysitters, house-sitters, or Airbnb guests.", timeSaved: "~4 hours", prompt: "I'll generate a house manual. First, what is the main purpose — for babysitters, house-sitters, or Airbnb guests?" },
    { icon: "box", emoji: "📦", title: "Moving House Checklist", description: "Get a NZ-specific moving checklist covering utilities, address changes, schools, and everything else.", timeSaved: "~3 hours", prompt: "I'll create a moving checklist. First, when is your moving date?" },
    { icon: "wrench", emoji: "🚗", title: "Vehicle Admin Tracker", description: "Set up tracking for WoF, rego, RUC, insurance, and service dates for all your vehicles.", timeSaved: "~30 min setup", prompt: "I'll set up vehicle admin tracking. First, how many vehicles do you need to track?" },
  ],
  // Legacy templates for agents without a dedicated tab
  aura: [
    { icon: "clipboard", title: "Food Control Plan", description: "Generate a food safety programme outline for your business type", timeSaved: "~2 hours", prompt: "I need help creating a Food Control Plan. Let's start — what type of food business do I have?" },
    { icon: "team", title: "Staff Roster Checker", description: "Check your roster against Holidays Act and employment law", timeSaved: "~30 min", prompt: "I'd like you to check my staff roster for compliance. What information do you need from me?" },
    { icon: "checkmark", title: "Event Compliance Checklist", description: "Compliance checklist for hosting an event", timeSaved: "~1 hour", prompt: "Help me create an event compliance checklist. What type of event am I planning?" },
    { icon: "coin", title: "Public Holiday Pay Calculator", description: "Calculate correct public holiday pay rates", timeSaved: "~20 min", prompt: "I need to calculate public holiday pay. Let me tell you about the staff member and the day worked." },
  ],
  terra: [
    { icon: "seedling", title: "Farm Environment Plan", description: "Outline a farm environment plan for freshwater compliance", timeSaved: "~4 hours", prompt: "I need a farm environment plan outline. What type of farming operation do you have?" },
    { icon: "wave", title: "Freshwater Compliance Audit", description: "Audit your farm against freshwater regulations", timeSaved: "~2 hours", prompt: "Let's do a freshwater compliance audit. What region is your farm in?" },
    { icon: "team", title: "RSE Checklist", description: "Checklist for RSE seasonal worker scheme compliance", timeSaved: "~1 hour", prompt: "I need an RSE scheme checklist. Are you currently an accredited employer?" },
  ],
  pulse: [
    { icon: "return", title: "Returns Policy", description: "Generate a returns policy compliant with NZ consumer law", timeSaved: "~1 hour", prompt: "I need a returns policy for my business. What type of products do you sell?" },
    { icon: "lock", title: "Privacy Policy", description: "Create a Privacy Act 2020 compliant privacy policy", timeSaved: "~2 hours", prompt: "Let's create a privacy policy. What type of business are you and what data do you collect?" },
    { icon: "box", title: "Product Listing Checker", description: "Check your product listings for Fair Trading Act compliance", timeSaved: "~30 min", prompt: "I'd like to check my product listings for compliance. Share a product listing and I'll review it." },
    { icon: "mail", title: "Email Compliance Check", description: "Ensure your email marketing is legally compliant", timeSaved: "~20 min", prompt: "Let's check your email marketing compliance. Tell me about your email setup." },
  ],
  forge: [
    { icon: "pen", title: "Vehicle Sale Disclosure", description: "Generate a vehicle sale disclosure form", timeSaved: "~30 min", prompt: "I need a vehicle sale disclosure. Tell me about the vehicle being sold." },
    { icon: "wrench", title: "Workshop Job Card", description: "Create a structured job card for a repair", timeSaved: "~15 min", prompt: "Let's create a workshop job card. What vehicle and what work is being done?" },
    { icon: "checkmark", title: "WoF Prep Checklist", description: "Pre-WoF inspection checklist", timeSaved: "~20 min", prompt: "I need a WoF prep checklist. What type of vehicle?" },
    { icon: "safetyVest", title: "Workshop H&S Audit", description: "Health and safety audit for your workshop", timeSaved: "~2 hours", prompt: "Let's do a workshop health and safety audit. Tell me about your workshop setup." },
  ],
  arc: [
    { icon: "document", title: "Resource Consent Outline", description: "Outline a resource consent application", timeSaved: "~3 hours", prompt: "I need help with a resource consent outline. What are you planning to build?" },
    { icon: "checkmark", title: "Building Code Checklist", description: "Building Code compliance checklist for your project", timeSaved: "~2 hours", prompt: "Let's create a Building Code checklist. What type of project?" },
    { icon: "clipboard", title: "Client Brief", description: "Structure a comprehensive client brief", timeSaved: "~1 hour", prompt: "I need to create a client brief for an architecture project. What are the key requirements?" },
    { icon: "coin", title: "Fee Proposal", description: "Draft an architecture fee proposal", timeSaved: "~2 hours", prompt: "I need to prepare a fee proposal. Tell me about the project scope." },
  ],
  axis: [
    { icon: "document", title: "Project Charter", description: "Create a project charter document", timeSaved: "~2 hours", prompt: "I need a project charter. What is the project about?" },
    { icon: "warning", title: "Risk Register", description: "Build a comprehensive risk register", timeSaved: "~3 hours", prompt: "I need to create a risk register. What type of project?" },
    { icon: "team", title: "Stakeholder Analysis", description: "Map and analyse project stakeholders", timeSaved: "~1 hour", prompt: "Let's do a stakeholder analysis. Tell me about your project and key people involved." },
    { icon: "chart", title: "Status Report", description: "Generate a project status report", timeSaved: "~45 min", prompt: "I need a project status report. What are the key updates?" },
    { icon: "clipboard", title: "Better Business Case", description: "Outline a Better Business Case for government", timeSaved: "~4 hours", prompt: "I need a Better Business Case outline. What is the initiative?" },
  ],
  maritime: [
    { icon: "fish", title: "Fishing Rules Lookup", description: "Check bag limits and rules for your region", timeSaved: "~10 min", prompt: "I need to check fishing rules. What region are you fishing in and what species?" },
    { icon: "sailboat", title: "Pre-Trip Safety Check", description: "Safety checklist before heading out", timeSaved: "~15 min", prompt: "I'm heading out on the water. Let's do a pre-trip safety check. What size is your vessel?" },
    { icon: "wrench", title: "Seasonal Maintenance", description: "Boat maintenance checklist by season", timeSaved: "~30 min", prompt: "I need a boat maintenance checklist. What season and what type of vessel?" },
    { icon: "wave", title: "Forecast Interpreter", description: "Explain a marine forecast in plain English", timeSaved: "~5 min", prompt: "Can you interpret today's marine forecast for me? Paste or describe the forecast." },
  ],
  energy: [
    { icon: "sun", title: "Solar Assessment", description: "Assess solar viability for your property", timeSaved: "~1 hour", prompt: "I'm considering solar panels. Tell me about your property and energy usage." },
    { icon: "chart", title: "Carbon Footprint Calculator", description: "Calculate your business carbon footprint", timeSaved: "~2 hours", prompt: "I need to calculate our business carbon footprint. What type of business?" },
    { icon: "bulb", title: "Energy Efficiency Audit", description: "Audit your business energy usage", timeSaved: "~1.5 hours", prompt: "I want to reduce our energy costs. Tell me about your business premises." },
  ],
  style: [
    { icon: "dress", title: "Capsule Wardrobe Builder", description: "Build a capsule wardrobe for NZ", timeSaved: "~1 hour", prompt: "Help me build a capsule wardrobe. What's your lifestyle and budget?" },
    { icon: "tie", title: "Work Wardrobe Planner", description: "Plan a professional NZ work wardrobe", timeSaved: "~45 min", prompt: "I need help with my work wardrobe. What's your industry and dress code?" },
  ],
  travel: [
    { icon: "map", title: "Road Trip Planner", description: "Plan a NZ road trip itinerary", timeSaved: "~2 hours", prompt: "I want to plan a road trip. Where are you starting from and how many days?" },
    { icon: "plane", title: "International Trip Planner", description: "Plan an international trip from NZ", timeSaved: "~3 hours", prompt: "I'm planning an international trip. Where do you want to go and what's your budget?" },
  ],
  wellbeing: [
    { icon: "yoga", title: "Self-Care Routine", description: "Build a personalised self-care routine", timeSaved: "~30 min", prompt: "Help me build a self-care routine. Tell me about your current lifestyle." },
    { icon: "sleep", title: "Sleep Improvement Plan", description: "Improve your sleep habits", timeSaved: "~20 min", prompt: "I want to improve my sleep. Tell me about your current sleep patterns." },
  ],
  fitness: [
    { icon: "fitness", title: "Workout Plan", description: "Create a personalised workout plan", timeSaved: "~1 hour", prompt: "Create a workout plan for me. What's your fitness level and what equipment do you have?" },
    { icon: "running", title: "Race Training Plan", description: "Training plan for a NZ running event", timeSaved: "~1 hour", prompt: "I want to train for a running event. Which event and what's your current fitness level?" },
  ],
  nutrition: [
    { icon: "salad", title: "Meal Plan", description: "Weekly meal plan for NZ families", timeSaved: "~1 hour", prompt: "Create a weekly meal plan. How many people, budget, and dietary needs?" },
    { icon: "cart", title: "Budget Shopping List", description: "Create a budget-friendly shopping list", timeSaved: "~30 min", prompt: "Help me create a budget shopping list. How many people and what's your weekly food budget?" },
  ],
  beauty: [
    { icon: "sparkle", title: "Skincare Routine", description: "Build a skincare routine for NZ conditions", timeSaved: "~30 min", prompt: "Help me build a skincare routine. What's your skin type and main concerns?" },
    { icon: "bottle", title: "Product Recommendations", description: "NZ beauty product recommendations", timeSaved: "~20 min", prompt: "I need product recommendations. What's your budget and what are you looking for?" },
  ],
  social: [
    { icon: "party", title: "Party Planner", description: "Plan a party or celebration", timeSaved: "~1 hour", prompt: "I need to plan a party. What's the occasion, how many guests, and what's your budget?" },
    { icon: "couple", title: "Date Night Ideas", description: "Creative date night suggestions for NZ", timeSaved: "~10 min", prompt: "I need date night ideas. What city are you in and what do you both enjoy?" },
  ],
  nonprofit: [
    { icon: "clipboard", title: "Charity Registration", description: "Guide through charity registration process", timeSaved: "~3 hours", prompt: "I want to register a charity. What is the charitable purpose?" },
    { icon: "coin", title: "Grant Application", description: "Structure a funding application", timeSaved: "~4 hours", prompt: "I need to write a grant application. Which fund and what is the project?" },
  ],
  education: [
    { icon: "clipboard", title: "Programme Approval", description: "NZQA programme approval checklist", timeSaved: "~3 hours", prompt: "I need to apply for NZQA programme approval. What type of programme?" },
    { icon: "globe", title: "Pastoral Care Audit", description: "Audit against the Pastoral Care Code", timeSaved: "~2 hours", prompt: "I need a pastoral care audit. Do you have international students?" },
  ],
  it: [
    { icon: "lock", title: "Cyber Security Checklist", description: "Cybersecurity checklist for NZ SMEs", timeSaved: "~1 hour", prompt: "I need a cybersecurity checklist. How many staff and what systems do you use?" },
    { icon: "siren", title: "Breach Response Plan", description: "Create a data breach response plan", timeSaved: "~2 hours", prompt: "I need a data breach response plan. What type of data does your business handle?" },
  ],
};
