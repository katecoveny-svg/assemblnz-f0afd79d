export interface Template {
  icon: string;
  title: string;
  description: string;
  timeSaved: string;
  prompt: string;
}

export const agentTemplates: Record<string, Template[]> = {
  aura: [
    { icon: "📋", title: "Food Control Plan", description: "Generate a food safety programme outline for your business type", timeSaved: "~2 hours", prompt: "I need help creating a Food Control Plan. Let's start — what type of food business do I have?" },
    { icon: "👥", title: "Staff Roster Checker", description: "Check your roster against Holidays Act and employment law", timeSaved: "~30 min", prompt: "I'd like you to check my staff roster for compliance. What information do you need from me?" },
    { icon: "✅", title: "Event Compliance Checklist", description: "Compliance checklist for hosting an event", timeSaved: "~1 hour", prompt: "Help me create an event compliance checklist. What type of event am I planning?" },
    { icon: "💰", title: "Public Holiday Pay Calculator", description: "Calculate correct public holiday pay rates", timeSaved: "~20 min", prompt: "I need to calculate public holiday pay. Let me tell you about the staff member and the day worked." },
  ],
  apex: [
    { icon: "🦺", title: "Site Safety Plan", description: "Generate a site-specific safety plan for your project", timeSaved: "~3 hours", prompt: "I need a site safety plan. Let's start — what type of construction project is this?" },
    { icon: "💵", title: "Payment Claim", description: "Draft a payment claim under the Construction Contracts Act", timeSaved: "~1 hour", prompt: "I need to prepare a payment claim under the CCA. What details do you need?" },
    { icon: "📢", title: "Toolbox Talk", description: "Generate a toolbox talk on a specific safety topic", timeSaved: "~30 min", prompt: "I need a toolbox talk. What safety topic should we cover?" },
    { icon: "✅", title: "Practical Completion Checklist", description: "Checklist for practical completion of a build", timeSaved: "~1 hour", prompt: "Help me create a practical completion checklist. What type of building project?" },
    { icon: "🔍", title: "Defect Report", description: "Document and categorise building defects", timeSaved: "~45 min", prompt: "I need to create a defect report. Tell me about the defects you've found." },
  ],
  terra: [
    { icon: "🌿", title: "Farm Environment Plan", description: "Outline a farm environment plan for freshwater compliance", timeSaved: "~4 hours", prompt: "I need a farm environment plan outline. What type of farming operation do you have?" },
    { icon: "💧", title: "Freshwater Compliance Audit", description: "Audit your farm against freshwater regulations", timeSaved: "~2 hours", prompt: "Let's do a freshwater compliance audit. What region is your farm in?" },
    { icon: "👷", title: "RSE Checklist", description: "Checklist for RSE seasonal worker scheme compliance", timeSaved: "~1 hour", prompt: "I need an RSE scheme checklist. Are you currently an accredited employer?" },
  ],
  pulse: [
    { icon: "↩️", title: "Returns Policy", description: "Generate a returns policy compliant with NZ consumer law", timeSaved: "~1 hour", prompt: "I need a returns policy for my business. What type of products do you sell?" },
    { icon: "🔒", title: "Privacy Policy", description: "Create a Privacy Act 2020 compliant privacy policy", timeSaved: "~2 hours", prompt: "Let's create a privacy policy. What type of business are you and what data do you collect?" },
    { icon: "📦", title: "Product Listing Checker", description: "Check your product listings for Fair Trading Act compliance", timeSaved: "~30 min", prompt: "I'd like to check my product listings for compliance. Share a product listing and I'll review it." },
    { icon: "📧", title: "Email Compliance Check", description: "Ensure your email marketing is legally compliant", timeSaved: "~20 min", prompt: "Let's check your email marketing compliance. Tell me about your email setup." },
  ],
  forge: [
    { icon: "📝", title: "Vehicle Sale Disclosure", description: "Generate a vehicle sale disclosure form", timeSaved: "~30 min", prompt: "I need a vehicle sale disclosure. Tell me about the vehicle being sold." },
    { icon: "🔧", title: "Workshop Job Card", description: "Create a structured job card for a repair", timeSaved: "~15 min", prompt: "Let's create a workshop job card. What vehicle and what work is being done?" },
    { icon: "✅", title: "WoF Prep Checklist", description: "Pre-WoF inspection checklist", timeSaved: "~20 min", prompt: "I need a WoF prep checklist. What type of vehicle?" },
    { icon: "🦺", title: "Workshop H&S Audit", description: "Health and safety audit for your workshop", timeSaved: "~2 hours", prompt: "Let's do a workshop health and safety audit. Tell me about your workshop setup." },
  ],
  arc: [
    { icon: "📄", title: "Resource Consent Outline", description: "Outline a resource consent application", timeSaved: "~3 hours", prompt: "I need help with a resource consent outline. What are you planning to build?" },
    { icon: "✅", title: "Building Code Checklist", description: "Building Code compliance checklist for your project", timeSaved: "~2 hours", prompt: "Let's create a Building Code checklist. What type of project?" },
    { icon: "📋", title: "Client Brief", description: "Structure a comprehensive client brief", timeSaved: "~1 hour", prompt: "I need to create a client brief for an architecture project. What are the key requirements?" },
    { icon: "💰", title: "Fee Proposal", description: "Draft an architecture fee proposal", timeSaved: "~2 hours", prompt: "I need to prepare a fee proposal. Tell me about the project scope." },
  ],
  flux: [
    { icon: "📝", title: "Proposal Writer", description: "Generate a professional business proposal", timeSaved: "~3 hours", prompt: "I need to write a business proposal. Who is the client and what are you proposing?" },
    { icon: "📧", title: "Cold Outreach Emails", description: "Create a sequence of outreach emails", timeSaved: "~1 hour", prompt: "Let's create cold outreach emails. Who is your target audience?" },
    { icon: "📊", title: "Sales Pipeline", description: "Design a sales pipeline for your business", timeSaved: "~2 hours", prompt: "I need to build a sales pipeline. What does your business sell and to whom?" },
    { icon: "🏛️", title: "GETS Tender Response", description: "Structure a government tender response", timeSaved: "~4 hours", prompt: "I need help with a GETS tender response. What is the tender for?" },
    { icon: "📋", title: "Meeting Prep Brief", description: "Prepare a comprehensive meeting brief", timeSaved: "~30 min", prompt: "I need a meeting prep brief. What is the meeting about and with whom?" },
  ],
  nexus: [
    { icon: "📦", title: "Import Entry Processor", description: "Process a commercial invoice for import entry", timeSaved: "~2 hours", prompt: "I need to process an import entry. Upload the commercial invoice or provide the details." },
    { icon: "📤", title: "Export Entry Processor", description: "Prepare export documentation", timeSaved: "~1.5 hours", prompt: "I need to prepare export documentation. What goods are you exporting and to where?" },
    { icon: "🔍", title: "Tariff Classifier", description: "Classify goods under the NZ Working Tariff", timeSaved: "~30 min", prompt: "I need to classify a product under the NZ Tariff. Describe the goods in detail." },
    { icon: "🌍", title: "FTA Checker", description: "Check if a Free Trade Agreement rate applies", timeSaved: "~20 min", prompt: "I need to check FTA eligibility. What goods and from which country?" },
    { icon: "💰", title: "Duty Calculator", description: "Calculate duty and GST on an import", timeSaved: "~15 min", prompt: "I need to calculate duty and GST. What are you importing and from where?" },
  ],
  axis: [
    { icon: "📄", title: "Project Charter", description: "Create a project charter document", timeSaved: "~2 hours", prompt: "I need a project charter. What is the project about?" },
    { icon: "⚠️", title: "Risk Register", description: "Build a comprehensive risk register", timeSaved: "~3 hours", prompt: "I need to create a risk register. What type of project?" },
    { icon: "👥", title: "Stakeholder Analysis", description: "Map and analyse project stakeholders", timeSaved: "~1 hour", prompt: "Let's do a stakeholder analysis. Tell me about your project and key people involved." },
    { icon: "📊", title: "Status Report", description: "Generate a project status report", timeSaved: "~45 min", prompt: "I need a project status report. What are the key updates?" },
    { icon: "📋", title: "Better Business Case", description: "Outline a Better Business Case for government", timeSaved: "~4 hours", prompt: "I need a Better Business Case outline. What is the initiative?" },
  ],
  legal: [
    { icon: "📝", title: "Employment Agreement", description: "Draft an employment agreement outline", timeSaved: "~2 hours", prompt: "I need to create an employment agreement. Let's start — is this full-time, part-time, or casual?" },
    { icon: "🔒", title: "Privacy Policy", description: "Create a Privacy Act 2020 compliant policy", timeSaved: "~2 hours", prompt: "I need a privacy policy. What type of organisation and what data do you handle?" },
    { icon: "🤝", title: "Contractor Agreement", description: "Draft a contractor agreement outline", timeSaved: "~1.5 hours", prompt: "I need a contractor agreement. What work will the contractor be doing?" },
    { icon: "💔", title: "Separation Checklist", description: "Comprehensive separation checklist", timeSaved: "~1 hour", prompt: "I need a separation checklist. Have you recently separated or are you planning to?" },
    { icon: "👶", title: "Child Support Estimator", description: "Estimate child support obligations", timeSaved: "~20 min", prompt: "I need to estimate child support. Let me ask you some questions about the care arrangements." },
    { icon: "📋", title: "Terms & Conditions", description: "Generate T&Cs for your business", timeSaved: "~2 hours", prompt: "I need Terms & Conditions. What type of business and what services do you provide?" },
    { icon: "🦺", title: "H&S Policy", description: "Create a health and safety policy", timeSaved: "~3 hours", prompt: "I need a health and safety policy. What type of workplace?" },
  ],
  accounting: [
    { icon: "💰", title: "GST Calculator", description: "Calculate GST obligations and returns", timeSaved: "~20 min", prompt: "I need help with GST calculations. What is your GST filing basis and period?" },
    { icon: "🧾", title: "Invoice Generator", description: "Generate a compliant tax invoice", timeSaved: "~10 min", prompt: "I need to create a tax invoice. What are the details?" },
    { icon: "📊", title: "Expense Categoriser", description: "Categorise business expenses for tax", timeSaved: "~1 hour", prompt: "I need help categorising my business expenses. List them and I'll sort them." },
    { icon: "📅", title: "Tax Calendar", description: "Key tax dates for your business", timeSaved: "~15 min", prompt: "I need a tax calendar for my business. What type of entity and what's your balance date?" },
    { icon: "💵", title: "Provisional Tax Calculator", description: "Calculate provisional tax payments", timeSaved: "~30 min", prompt: "I need to calculate provisional tax. What was your residual income tax last year?" },
    { icon: "✅", title: "Year-End Checklist", description: "End-of-year accounting checklist", timeSaved: "~2 hours", prompt: "I need a year-end accounting checklist. What type of business and what's your balance date?" },
  ],
  property: [
    { icon: "🏠", title: "Healthy Homes Audit", description: "Audit against Healthy Homes Standards", timeSaved: "~1.5 hours", prompt: "I need a Healthy Homes audit. Tell me about the rental property." },
    { icon: "📈", title: "Rent Increase Notice", description: "Generate a compliant rent increase notice", timeSaved: "~20 min", prompt: "I need to prepare a rent increase notice. What are the current rent details?" },
    { icon: "🔍", title: "Property Inspection Report", description: "Structure a property inspection report", timeSaved: "~1 hour", prompt: "I need a property inspection report template. Is this a routine or pre-tenancy inspection?" },
    { icon: "💰", title: "Rental Yield Calculator", description: "Calculate gross and net rental yield", timeSaved: "~15 min", prompt: "I need to calculate rental yield. What are the property details?" },
    { icon: "📊", title: "Brightline Calculator", description: "Check Brightline test applicability", timeSaved: "~10 min", prompt: "I need to check the Brightline test. When did you acquire the property?" },
  ],
  immigration: [
    { icon: "📋", title: "Visa Document Checklist", description: "Document checklist for visa applications", timeSaved: "~1 hour", prompt: "I need a visa document checklist. What type of visa are you applying for?" },
    { icon: "📊", title: "SMC Points Calculator", description: "Calculate Skilled Migrant Category points", timeSaved: "~30 min", prompt: "I need to calculate my SMC points. Let me ask you about your qualifications and experience." },
    { icon: "✅", title: "Employer Accreditation Checklist", description: "Checklist for employer accreditation", timeSaved: "~1 hour", prompt: "I need an employer accreditation checklist. What type of accreditation?" },
    { icon: "💑", title: "Relationship Evidence Guide", description: "Guide for partnership visa evidence", timeSaved: "~45 min", prompt: "I need help with relationship evidence for a partnership visa. How long have you been together?" },
  ],
  operations: [
    { icon: "🍽️", title: "Meal Plan", description: "Weekly meal plan with shopping list", timeSaved: "~1 hour", prompt: "Create a weekly meal plan for my family. How many people and any dietary requirements?" },
    { icon: "💰", title: "Budget Calculator", description: "Set up a household budget", timeSaved: "~1 hour", prompt: "Help me set up a household budget. What's your approximate household income?" },
    { icon: "🏠", title: "House Manual", description: "Generate a household manual", timeSaved: "~3 hours", prompt: "I want to create a house manual. Let's start with the basics about your home." },
    { icon: "📦", title: "Moving Checklist", description: "Comprehensive moving checklist for NZ", timeSaved: "~1 hour", prompt: "I'm moving house. Help me create a moving checklist. When is your moving date?" },
    { icon: "📄", title: "School Newsletter Parser", description: "Extract dates and actions from newsletters", timeSaved: "~15 min", prompt: "Upload a school newsletter and I'll extract all the key dates, deadlines, and action items." },
  ],
  maritime: [
    { icon: "🐟", title: "Fishing Rules Lookup", description: "Check bag limits and rules for your region", timeSaved: "~10 min", prompt: "I need to check fishing rules. What region are you fishing in and what species?" },
    { icon: "⛵", title: "Pre-Trip Safety Check", description: "Safety checklist before heading out", timeSaved: "~15 min", prompt: "I'm heading out on the water. Let's do a pre-trip safety check. What size is your vessel?" },
    { icon: "🔧", title: "Seasonal Maintenance", description: "Boat maintenance checklist by season", timeSaved: "~30 min", prompt: "I need a boat maintenance checklist. What season and what type of vessel?" },
    { icon: "🌊", title: "Forecast Interpreter", description: "Explain a marine forecast in plain English", timeSaved: "~5 min", prompt: "Can you interpret today's marine forecast for me? Paste or describe the forecast." },
  ],
  energy: [
    { icon: "☀️", title: "Solar Assessment", description: "Assess solar viability for your property", timeSaved: "~1 hour", prompt: "I'm considering solar panels. Tell me about your property and energy usage." },
    { icon: "📊", title: "Carbon Footprint Calculator", description: "Calculate your business carbon footprint", timeSaved: "~2 hours", prompt: "I need to calculate our business carbon footprint. What type of business?" },
    { icon: "💡", title: "Energy Efficiency Audit", description: "Audit your business energy usage", timeSaved: "~1.5 hours", prompt: "I want to reduce our energy costs. Tell me about your business premises." },
  ],
  style: [
    { icon: "👗", title: "Capsule Wardrobe Builder", description: "Build a capsule wardrobe for NZ", timeSaved: "~1 hour", prompt: "Help me build a capsule wardrobe. What's your lifestyle and budget?" },
    { icon: "👔", title: "Work Wardrobe Planner", description: "Plan a professional NZ work wardrobe", timeSaved: "~45 min", prompt: "I need help with my work wardrobe. What's your industry and dress code?" },
  ],
  travel: [
    { icon: "🗺️", title: "Road Trip Planner", description: "Plan a NZ road trip itinerary", timeSaved: "~2 hours", prompt: "I want to plan a road trip. Where are you starting from and how many days?" },
    { icon: "✈️", title: "International Trip Planner", description: "Plan an international trip from NZ", timeSaved: "~3 hours", prompt: "I'm planning an international trip. Where do you want to go and what's your budget?" },
  ],
  wellbeing: [
    { icon: "🧘", title: "Self-Care Routine", description: "Build a personalised self-care routine", timeSaved: "~30 min", prompt: "Help me build a self-care routine. Tell me about your current lifestyle." },
    { icon: "😴", title: "Sleep Improvement Plan", description: "Improve your sleep habits", timeSaved: "~20 min", prompt: "I want to improve my sleep. Tell me about your current sleep patterns." },
  ],
  fitness: [
    { icon: "💪", title: "Workout Plan", description: "Create a personalised workout plan", timeSaved: "~1 hour", prompt: "Create a workout plan for me. What's your fitness level and what equipment do you have?" },
    { icon: "🏃", title: "Race Training Plan", description: "Training plan for a NZ running event", timeSaved: "~1 hour", prompt: "I want to train for a running event. Which event and what's your current fitness level?" },
  ],
  nutrition: [
    { icon: "🥗", title: "Meal Plan", description: "Weekly meal plan for NZ families", timeSaved: "~1 hour", prompt: "Create a weekly meal plan. How many people, budget, and dietary needs?" },
    { icon: "🛒", title: "Budget Shopping List", description: "Create a budget-friendly shopping list", timeSaved: "~30 min", prompt: "Help me create a budget shopping list. How many people and what's your weekly food budget?" },
  ],
  beauty: [
    { icon: "✨", title: "Skincare Routine", description: "Build a skincare routine for NZ conditions", timeSaved: "~30 min", prompt: "Help me build a skincare routine. What's your skin type and main concerns?" },
    { icon: "🧴", title: "Product Recommendations", description: "NZ beauty product recommendations", timeSaved: "~20 min", prompt: "I need product recommendations. What's your budget and what are you looking for?" },
  ],
  social: [
    { icon: "🎂", title: "Party Planner", description: "Plan a party or celebration", timeSaved: "~1 hour", prompt: "I need to plan a party. What's the occasion, how many guests, and what's your budget?" },
    { icon: "💑", title: "Date Night Ideas", description: "Creative date night suggestions for NZ", timeSaved: "~10 min", prompt: "I need date night ideas. What city are you in and what do you both enjoy?" },
  ],
  nonprofit: [
    { icon: "📋", title: "Charity Registration", description: "Guide through charity registration process", timeSaved: "~3 hours", prompt: "I want to register a charity. What is the charitable purpose?" },
    { icon: "💰", title: "Grant Application", description: "Structure a funding application", timeSaved: "~4 hours", prompt: "I need to write a grant application. Which fund and what is the project?" },
  ],
  education: [
    { icon: "📋", title: "Programme Approval", description: "NZQA programme approval checklist", timeSaved: "~3 hours", prompt: "I need to apply for NZQA programme approval. What type of programme?" },
    { icon: "🌏", title: "Pastoral Care Audit", description: "Audit against the Pastoral Care Code", timeSaved: "~2 hours", prompt: "I need a pastoral care audit. Do you have international students?" },
  ],
  it: [
    { icon: "🔒", title: "Cyber Security Checklist", description: "Cybersecurity checklist for NZ SMEs", timeSaved: "~1 hour", prompt: "I need a cybersecurity checklist. How many staff and what systems do you use?" },
    { icon: "🚨", title: "Breach Response Plan", description: "Create a data breach response plan", timeSaved: "~2 hours", prompt: "I need a data breach response plan. What type of data does your business handle?" },
  ],
};
