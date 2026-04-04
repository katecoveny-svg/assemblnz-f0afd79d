export interface KeteAgent {
  name: string;
  desc: string;
  status?: 'existing' | 'restored' | 'new';
}

export interface KeteData {
  slug: string;
  name: string;
  englishName: string;
  description: string;
  agentCount: number;
  accentColor: string;
  accentLight: string;
  variant: 'standard' | 'dense' | 'organic' | 'tricolor' | 'warm';
  category: 'industry' | 'specialist' | 'whanau';
  badge?: string;
  agents: KeteAgent[];
}

export const SHARED_CORE_AGENTS: KeteAgent[] = [
  { name: 'CHARTER', desc: 'Company governance & director duties', status: 'new' },
  { name: 'ARBITER', desc: 'Dispute resolution & legal remedies', status: 'new' },
  { name: 'SHIELD', desc: 'Privacy Act 2020 & data protection', status: 'new' },
  { name: 'ANCHOR', desc: 'Non-profit, charities & community organisations', status: 'new' },
  { name: 'AROHA', desc: 'HR & employment relations', status: 'existing' },
  { name: 'PULSE', desc: 'Employment law & payroll compliance', status: 'new' },
  { name: 'SCHOLAR', desc: 'Education & training sector compliance', status: 'new' },
  { name: 'NOVA', desc: 'General operations & technical troubleshooting', status: 'new' },
];

export const KETE_DATA: KeteData[] = [
  {
    slug: 'manaaki',
    name: 'Manaaki',
    englishName: 'Hospitality & Tourism',
    description: 'Your venue runs itself. Food safety, liquor licensing, guest experience, luxury lodging, adventure tourism.',
    agentCount: 9,
    accentColor: '#D4A843',
    accentLight: '#F0D078',
    variant: 'standard',
    category: 'industry',
    agents: [
      { name: 'AURA', desc: 'Front-of-house operations & guest experience', status: 'existing' },
      { name: 'SAFFRON', desc: 'Food safety & Food Act 2014 compliance', status: 'restored' },
      { name: 'CELLAR', desc: 'Liquor licensing & Sale of Alcohol Act', status: 'restored' },
      { name: 'LUXE', desc: 'Luxury lodging & premium hospitality', status: 'new' },
      { name: 'MOANA', desc: 'Tourism operations & adventure compliance', status: 'existing' },
      { name: 'COAST', desc: 'Coastal & marine tourism', status: 'existing' },
      { name: 'KURA', desc: 'Cultural tourism & Māori hospitality', status: 'existing' },
      { name: 'PAU', desc: 'Event catering & temporary food operations', status: 'existing' },
      { name: 'SUMMIT', desc: 'Tourism & adventure activities regulation', status: 'restored' },
    ],
  },
  {
    slug: 'hanga',
    name: 'Hanga',
    englishName: 'Construction',
    description: 'Site to sign-off. Safety, BIM, consenting, project management, architecture, awards, tenders.',
    agentCount: 9,
    accentColor: '#3A7D6E',
    accentLight: '#5AADA0',
    variant: 'standard',
    category: 'industry',
    agents: [
      { name: 'ATA', desc: 'Building Information Modelling (BIM)', status: 'existing' },
      { name: 'ĀRAI', desc: 'Site safety & H&S compliance (WorkSafe)', status: 'existing' },
      { name: 'KAUPAPA', desc: 'Project management & contract administration', status: 'existing' },
      { name: 'RAWA', desc: 'Resources, procurement & supply chain', status: 'existing' },
      { name: 'WHAKAAĒ', desc: 'Resource consent & planning compliance', status: 'existing' },
      { name: 'PAI', desc: 'Quality assurance & building standards', status: 'existing' },
      { name: 'ARC', desc: 'Architecture & NZ Building Code compliance', status: 'restored' },
      { name: 'TERRA', desc: 'Property & land management (RMA)', status: 'restored' },
      { name: 'PINNACLE', desc: 'Construction awards, tenders & application writing', status: 'new' },
    ],
  },
  {
    slug: 'auaha',
    name: 'Auaha',
    englishName: 'Creative & Media',
    description: 'Brief to published. Copy, image, video, podcast, ads, analytics — the full creative pipeline.',
    agentCount: 9,
    accentColor: '#F0D078',
    accentLight: '#D4A843',
    variant: 'standard',
    category: 'industry',
    agents: [
      { name: 'PRISM', desc: 'Creative design & brand development', status: 'existing' },
      { name: 'MUSE', desc: 'Content creation & copywriting', status: 'existing' },
      { name: 'PIXEL', desc: 'Visual design & digital media', status: 'existing' },
      { name: 'VERSE', desc: 'Narrative design & storytelling', status: 'existing' },
      { name: 'ECHO', desc: 'Technical production & platform setup', status: 'existing' },
      { name: 'FLUX', desc: 'Image generation & design innovation', status: 'existing' },
      { name: 'CHROMATIC', desc: 'Colour, brand aesthetics & visual identity', status: 'existing' },
      { name: 'RHYTHM', desc: 'Audio, podcast & media production', status: 'existing' },
      { name: 'MARKET', desc: 'Marketing & advertising compliance (Fair Trading)', status: 'restored' },
    ],
  },
  {
    slug: 'pakihi',
    name: 'Pakihi',
    englishName: 'Business & Commerce',
    description: 'Accounting, insurance, retail, trade, agriculture, real estate, immigration. The engine of NZ commerce.',
    agentCount: 11,
    accentColor: '#5AADA0',
    accentLight: '#3A7D6E',
    variant: 'dense',
    category: 'industry',
    agents: [
      { name: 'LEDGER', desc: 'Accounting & tax compliance (IRD, GST)', status: 'existing' },
      { name: 'VAULT', desc: 'Business insurance & risk management', status: 'restored' },
      { name: 'CATALYST', desc: 'Recruitment & talent management', status: 'restored' },
      { name: 'COMPASS', desc: 'Immigration & visa guidance', status: 'restored' },
      { name: 'HAVEN', desc: 'Real estate & property management', status: 'restored' },
      { name: 'COUNTER', desc: 'Retail operations & consumer guarantees', status: 'restored' },
      { name: 'GATEWAY', desc: 'Customs brokerage & border compliance', status: 'restored' },
      { name: 'HARVEST', desc: 'Agriculture & farming compliance', status: 'restored' },
      { name: 'GROVE', desc: 'Horticulture & viticulture export', status: 'restored' },
      { name: 'SAGE', desc: 'Business analytics & insights', status: 'existing' },
      { name: 'ASCEND', desc: 'Growth strategy & performance', status: 'existing' },
    ],
  },
  {
    slug: 'waka',
    name: 'Waka',
    englishName: 'Transport & Vehicles',
    description: 'Automotive, maritime, trucking, logistics. Dealership compliance to heavy vehicle logbooks.',
    agentCount: 3,
    accentColor: '#6B8FA3',
    accentLight: '#3A6A9C',
    variant: 'standard',
    category: 'industry',
    agents: [
      { name: 'MOTOR', desc: 'Automotive industry & dealership compliance', status: 'restored' },
      { name: 'TRANSIT', desc: 'Transport & logistics regulations (NZTA)', status: 'restored' },
      { name: 'MARINER', desc: 'Maritime compliance & vessel operations', status: 'restored' },
    ],
  },
  {
    slug: 'hangarau',
    name: 'Hangarau',
    englishName: 'Technology',
    description: 'Your in-house tech team. Security, DevOps, infrastructure, monitoring, environment, manufacturing, IP.',
    agentCount: 12,
    accentColor: '#3A6A9C',
    accentLight: '#1A3A5C',
    variant: 'standard',
    category: 'industry',
    agents: [
      { name: 'SPARK', desc: 'Cloud infrastructure & platform engineering', status: 'existing' },
      { name: 'SENTINEL', desc: 'Security monitoring & alert systems', status: 'existing' },
      { name: 'NEXUS-T', desc: 'API integration & tech compliance', status: 'existing' },
      { name: 'CIPHER', desc: 'Cybersecurity & encryption', status: 'existing' },
      { name: 'RELAY', desc: 'Communication systems & messaging', status: 'existing' },
      { name: 'MATRIX', desc: 'Data architecture & management', status: 'existing' },
      { name: 'FORGE', desc: 'DevOps, CI/CD & deployment automation', status: 'existing' },
      { name: 'ORACLE', desc: 'Predictive analytics & AI systems', status: 'existing' },
      { name: 'EMBER', desc: 'Energy efficiency & carbon reporting', status: 'existing' },
      { name: 'REEF', desc: 'Environmental compliance & RMA', status: 'existing' },
      { name: 'PATENT', desc: 'Intellectual property & IP registration', status: 'existing' },
      { name: 'FOUNDRY', desc: 'Manufacturing & industrial compliance', status: 'existing' },
    ],
  },
  {
    slug: 'hauora',
    name: 'Hauora',
    englishName: 'Health, Wellbeing, Sport & Lifestyle',
    description: 'Sport, health, beauty, nutrition, interior design, travel. Everything that keeps people well.',
    agentCount: 8,
    accentColor: '#A87D4A',
    accentLight: '#D4A843',
    variant: 'organic',
    category: 'industry',
    agents: [
      { name: 'TURF', desc: 'Sports & recreation governance (Inc Societies Act)', status: 'restored' },
      { name: 'LEAGUE', desc: 'Competition & events management', status: 'restored' },
      { name: 'VITALS', desc: 'Workplace health & safety (HSWA)', status: 'restored' },
      { name: 'REMEDY', desc: 'Healthcare practice compliance (HPCAA)', status: 'restored' },
      { name: 'VITAE', desc: 'Nutrition & dietary compliance', status: 'new' },
      { name: 'RADIANCE', desc: 'Beauty & wellness industry compliance', status: 'new' },
      { name: 'PALETTE', desc: 'Interior design & space planning', status: 'new' },
      { name: 'ODYSSEY', desc: 'Travel planning & tourism regulations', status: 'new' },
    ],
  },
  {
    slug: 'te-kahui-reo',
    name: 'Te Kāhui Reo',
    englishName: 'Māori Business Intelligence',
    description: 'Data sovereignty, whānau governance, iwi reporting, kaupapa Māori — built from the ground up.',
    agentCount: 8,
    accentColor: '#D4A843',
    accentLight: '#3A7D6E',
    variant: 'tricolor',
    category: 'specialist',
    agents: [
      { name: 'WHĀNAU', desc: 'Whānau governance', status: 'existing' },
      { name: 'ROHE', desc: 'Regional coordination', status: 'existing' },
      { name: 'KAUPAPA-M', desc: 'Kaupapa Māori frameworks', status: 'existing' },
      { name: 'MANA', desc: 'Access & permissions', status: 'existing' },
      { name: 'KAITIAKI', desc: 'Data guardianship', status: 'existing' },
      { name: 'TĀURA', desc: 'Cultural compliance', status: 'existing' },
      { name: 'WHAKAARO', desc: 'Strategic thinking', status: 'existing' },
      { name: 'HIRINGA', desc: 'Innovation & growth', status: 'existing' },
    ],
  },
  {
    slug: 'toroa',
    name: 'Tōroa',
    englishName: 'Family Navigator',
    description: 'SMS-first. No app, no login. Just text. School notices, meals, budgets, reminders, learning.',
    agentCount: 1,
    accentColor: '#D4A843',
    accentLight: '#F0D078',
    variant: 'warm',
    badge: 'CONSUMER · $29/MO',
    category: 'whanau',
    agents: [
      { name: 'TŌROA', desc: 'Family SMS navigator', status: 'existing' },
    ],
  },
];

export const TOTAL_AGENTS = SHARED_CORE_AGENTS.length + KETE_DATA.reduce((s, k) => s + k.agentCount, 0);
