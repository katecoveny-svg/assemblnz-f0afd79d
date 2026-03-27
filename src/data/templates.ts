export interface Template {
  icon: string; // emoji for template tab, key into ICON_MAP for legacy modal
  title: string;
  description: string;
  timeSaved: string;
  prompt: string;
}

// Agents with a dedicated Templates tab
export const TEMPLATE_TAB_AGENTS = [
  "customs", "construction", "accounting", "legal", "property", "immigration", "marketing", "sales", "operations",
];

export const agentTemplates: Record<string, Template[]> = {
  customs: [
  ],
  construction: [
  ],
  accounting: [
  ],
  legal: [
  ],
  property: [
  ],
  immigration: [
  ],
  marketing: [
    { icon: "📱", title: "Social Media Strategy", description: "Build a 30-day social media content plan with post types, hooks, and scheduling", timeSaved: "~3 hours", prompt: "I need a 30-day social media strategy. Let's start — what industry are you in and which platforms do you use?" },
    { icon: "✍️", title: "Brand Voice Guide", description: "Define your brand's tone, personality, and messaging pillars", timeSaved: "~2 hours", prompt: "Let's build your brand voice guide. First, describe your business and who your ideal customer is." },
    { icon: "📧", title: "Email Campaign Sequence", description: "Create a nurture email sequence with subject lines and body copy", timeSaved: "~2 hours", prompt: "I'll help you create an email campaign sequence. What's the goal — lead nurture, onboarding, or re-engagement?" },
    { icon: "🎯", title: "Ad Copy Generator", description: "Generate LinkedIn and Instagram ad copy with hooks, CTAs, and targeting", timeSaved: "~1 hour", prompt: "Let's create some ad copy. What product or service are you promoting, and who's your target audience?" },
    { icon: "📊", title: "Content Calendar", description: "Plan a month of content across blog, social, email, and video", timeSaved: "~4 hours", prompt: "I'll build your content calendar. What channels do you publish on, and what are your key topics?" },
    { icon: "🔍", title: "SEO Content Brief", description: "Generate an SEO-optimised content brief with keywords and structure", timeSaved: "~1 hour", prompt: "Let's create an SEO content brief. What topic or keyword do you want to rank for?" },
    { icon: "📰", title: "Press Release Draft", description: "Write a media-ready press release for your announcement", timeSaved: "~1.5 hours", prompt: "I'll draft a press release. What's the news or announcement you want to share?" },
    { icon: "🎨", title: "Campaign Brief", description: "Create a creative brief for your next marketing campaign", timeSaved: "~2 hours", prompt: "Let's build a campaign brief. What's the campaign objective and who are you targeting?" },
  ],
  sales: [
  ],
  operations: [
  ],
  // Legacy templates for agents without a dedicated tab
  hospitality: [
    { icon: "clipboard", title: "Food Control Plan", description: "Generate a food safety programme outline for your business type", timeSaved: "~2 hours", prompt: "I need help creating a Food Control Plan. Let's start — what type of food business do I have?" },
    { icon: "team", title: "Staff Roster Checker", description: "Check your roster against Holidays Act and employment law", timeSaved: "~30 min", prompt: "I'd like you to check my staff roster for compliance. What information do you need from me?" },
    { icon: "checkmark", title: "Event Compliance Checklist", description: "Compliance checklist for hosting an event", timeSaved: "~1 hour", prompt: "Help me create an event compliance checklist. What type of event am I planning?" },
    { icon: "coin", title: "Public Holiday Pay Calculator", description: "Calculate correct public holiday pay rates", timeSaved: "~20 min", prompt: "I need to calculate public holiday pay. Let me tell you about the staff member and the day worked." },
  ],
  agriculture: [
    { icon: "seedling", title: "Farm Environment Plan", description: "Outline a farm environment plan for freshwater compliance", timeSaved: "~4 hours", prompt: "I need a farm environment plan outline. What type of farming operation do you have?" },
    { icon: "wave", title: "Freshwater Compliance Audit", description: "Audit your farm against freshwater regulations", timeSaved: "~2 hours", prompt: "Let's do a freshwater compliance audit. What region is your farm in?" },
    { icon: "team", title: "RSE Checklist", description: "Checklist for RSE seasonal worker scheme compliance", timeSaved: "~1 hour", prompt: "I need an RSE scheme checklist. Are you currently an accredited employer?" },
  ],
  retail: [
    { icon: "return", title: "Returns Policy", description: "Generate a returns policy compliant with NZ consumer law", timeSaved: "~1 hour", prompt: "I need a returns policy for my business. What type of products do you sell?" },
    { icon: "lock", title: "Privacy Policy", description: "Create a Privacy Act 2020 compliant privacy policy", timeSaved: "~2 hours", prompt: "Let's create a privacy policy. What type of business are you and what data do you collect?" },
    { icon: "box", title: "Product Listing Checker", description: "Check your product listings for Fair Trading Act compliance", timeSaved: "~30 min", prompt: "I'd like to check my product listings for compliance. Share a product listing and I'll review it." },
    { icon: "mail", title: "Email Compliance Check", description: "Ensure your email marketing is legally compliant", timeSaved: "~20 min", prompt: "Let's check your email marketing compliance. Tell me about your email setup." },
  ],
  automotive: [
    { icon: "pen", title: "Vehicle Sale Disclosure", description: "Generate a vehicle sale disclosure form", timeSaved: "~30 min", prompt: "I need a vehicle sale disclosure. Tell me about the vehicle being sold." },
    { icon: "wrench", title: "Workshop Job Card", description: "Create a structured job card for a repair", timeSaved: "~15 min", prompt: "Let's create a workshop job card. What vehicle and what work is being done?" },
    { icon: "checkmark", title: "WoF Prep Checklist", description: "Pre-WoF inspection checklist", timeSaved: "~20 min", prompt: "I need a WoF prep checklist. What type of vehicle?" },
    { icon: "safetyVest", title: "Workshop H&S Audit", description: "Health and safety audit for your workshop", timeSaved: "~2 hours", prompt: "Let's do a workshop health and safety audit. Tell me about your workshop setup." },
  ],
  architecture: [
    { icon: "document", title: "Resource Consent Outline", description: "Outline a resource consent application", timeSaved: "~3 hours", prompt: "I need help with a resource consent outline. What are you planning to build?" },
    { icon: "checkmark", title: "Building Code Checklist", description: "Building Code compliance checklist for your project", timeSaved: "~2 hours", prompt: "Let's create a Building Code checklist. What type of project?" },
    { icon: "clipboard", title: "Client Brief", description: "Structure a comprehensive client brief", timeSaved: "~1 hour", prompt: "I need to create a client brief for an architecture project. What are the key requirements?" },
    { icon: "coin", title: "Fee Proposal", description: "Draft an architecture fee proposal", timeSaved: "~2 hours", prompt: "I need to prepare a fee proposal. Tell me about the project scope." },
  ],
  pm: [
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
