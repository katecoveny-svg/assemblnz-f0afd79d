// ============================================================================
// ASSEMBL AGENT SKILL WIRING SYSTEM
// Single source of truth for all agent capabilities, skills, and MCP integrations
// ============================================================================

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'wired' | 'gap';
}

export interface MCPConnector {
  id: string;
  name: string;
  provider: string;
  tools: string[];
  connectionStatus: 'connected' | 'available' | 'beta';
}

export interface AgentSkillConfig {
  id: string;
  name: string;
  kete: string;
  purpose: string;
  skills: Skill[];
  mcps: MCPConnector[];
  gaps: string[];
}

export interface KeteSkillConfig {
  id: string;
  name: string;
  accent: string;
  purpose: string;
  agents: string[];
  keteSkills: Skill[];
  keteMCPs: MCPConnector[];
  gradientAccent?: { from: string; via: string; to: string };
}

export interface SharedFoundationConfig {
  coreSkills: Skill[];
  productivitySkills: Skill[];
  documentProcessing: Skill[];
  defaultMCPs: MCPConnector[];
  brandVoice: Skill[];
}

// ============================================================================
// SHARED FOUNDATION — available to all kete
// ============================================================================

export const SHARED_FOUNDATION: SharedFoundationConfig = {
  coreSkills: [
    { id: 'tikanga-compliance', name: 'Tikanga Compliance', category: 'core', description: 'Enforce NZ cultural and compliance guidelines', status: 'wired' },
    { id: 'elite-copywriter', name: 'Elite Copywriter', category: 'core', description: 'High-quality content generation', status: 'wired' },
    { id: 'assembl-brand', name: 'Assembl Brand', category: 'core', description: 'Brand voice and guidelines', status: 'wired' },
    { id: 'nz-privacy-act-2020', name: 'NZ Privacy Act 2020', category: 'core', description: 'NZ Privacy Act compliance', status: 'wired' },
    { id: 'schedule', name: 'Schedule', category: 'core', description: 'Calendar and scheduling integration', status: 'wired' },
    { id: 'iho-brain', name: 'Iho Brain', category: 'core', description: 'Core Iho routing logic', status: 'wired' },
    { id: 'output-to-drive', name: 'Output to Drive', category: 'core', description: 'Google Drive output system', status: 'wired' },
  ],
  productivitySkills: [
    { id: 'enterprise-search', name: 'Enterprise Search', category: 'productivity', description: 'Search, knowledge synthesis, strategy, source management', status: 'wired' },
    { id: 'productivity', name: 'Productivity Suite', category: 'productivity', description: 'Task management, updates, memory management', status: 'wired' },
  ],
  documentProcessing: [
    { id: 'pdf', name: 'PDF Processing', category: 'documents', description: 'PDF import and processing', status: 'wired' },
    { id: 'docx', name: 'Word Documents', category: 'documents', description: 'Word document import and processing', status: 'wired' },
    { id: 'xlsx', name: 'Excel Spreadsheets', category: 'documents', description: 'Excel spreadsheet import and processing', status: 'wired' },
    { id: 'pptx', name: 'PowerPoint', category: 'documents', description: 'PowerPoint import and processing', status: 'wired' },
    { id: 'pdf-viewer', name: 'PDF Viewer', category: 'documents', description: 'PDF viewing and annotation', status: 'wired' },
  ],
  defaultMCPs: [
    { id: 'gmail', name: 'Gmail', provider: 'Google', tools: ['create_draft', 'search_messages', 'read_message', 'read_thread', 'list_labels'], connectionStatus: 'connected' },
    { id: 'google-calendar', name: 'Google Calendar', provider: 'Google', tools: ['list_events', 'find_my_free_time', 'get_event', 'list_calendars'], connectionStatus: 'connected' },
    { id: 'slack', name: 'Slack', provider: 'Slack', tools: ['slack-search', 'find-discussions', 'slack-messaging'], connectionStatus: 'available' },
    { id: 'browser-computer', name: 'Browser & Computer', provider: 'System', tools: ['read_page', 'navigate', 'javascript_tool'], connectionStatus: 'connected' },
  ],
  brandVoice: [
    { id: 'brand-voice', name: 'Brand Voice', category: 'brand', description: 'Brand voice enforcement and guidelines', status: 'wired' },
    { id: 'dispatch-loop', name: 'Dispatch Loop', category: 'brand', description: 'Cross-agent communication and routing', status: 'wired' },
  ],
};

// ============================================================================
// SHARED CORE AGENTS (8 Foundation agents)
// ============================================================================

export const SHARED_CORE_AGENTS: AgentSkillConfig[] = [
  { id: 'charter', name: 'CHARTER', kete: 'governance', purpose: 'Manage compliance, legal governance, and regulatory oversight', skills: [
    { id: 'compliance-tracking', name: 'Compliance Tracking', category: 'operations', description: 'Track regulatory obligations and deadlines', status: 'wired' },
    { id: 'legal-all', name: 'Legal Suite', category: 'legal', description: 'Full legal review, risk assessment, contract analysis', status: 'wired' },
  ], mcps: [], gaps: [] },
  { id: 'arbiter', name: 'ARBITER', kete: 'governance', purpose: 'Mediate disputes, escalations, and conflict resolution', skills: [
    { id: 'legal-risk-assessment', name: 'Legal Risk Assessment', category: 'legal', description: 'Assess legal risk for disputes', status: 'wired' },
    { id: 'customer-escalation', name: 'Customer Escalation', category: 'support', description: 'Handle escalated customer issues', status: 'wired' },
  ], mcps: [], gaps: [] },
  { id: 'shield', name: 'SHIELD', kete: 'governance', purpose: 'Protect privacy, security, and data governance', skills: [
    { id: 'signal-security', name: 'Signal Security', category: 'security', description: 'Advanced security and encryption expertise', status: 'wired' },
    { id: 'compliance-check', name: 'Compliance Check', category: 'legal', description: 'Privacy and compliance verification', status: 'wired' },
  ], mcps: [], gaps: [] },
  { id: 'anchor', name: 'ANCHOR', kete: 'governance', purpose: 'Support non-profit organisations with grants and compliance', skills: [
    { id: 'grant-hunter', name: 'Grant Hunter', category: 'operations', description: 'Monthly grant discovery and application generation', status: 'wired' },
    { id: 'process-doc', name: 'Process Documentation', category: 'operations', description: 'Create operational process docs', status: 'wired' },
  ], mcps: [], gaps: [] },
  { id: 'aroha-core', name: 'AROHA', kete: 'governance', purpose: 'Human resources, employment, and people management', skills: [
    { id: 'hr-specialist', name: 'HR Specialist', category: 'hr', description: 'Full HR management and people operations', status: 'wired' },
    { id: 'employment-hero', name: 'Employment Hero', category: 'hr', description: 'Employment Hero integration', status: 'wired' },
  ], mcps: [], gaps: [] },
  { id: 'pulse', name: 'PULSE', kete: 'governance', purpose: 'Employment law, policy, and labour compliance', skills: [
    { id: 'policy-lookup', name: 'Policy Lookup', category: 'hr', description: 'Employment policy search and reference', status: 'wired' },
    { id: 'legal-response', name: 'Legal Response', category: 'legal', description: 'Employment law response drafting', status: 'wired' },
  ], mcps: [], gaps: [] },
  { id: 'scholar', name: 'SCHOLAR', kete: 'governance', purpose: 'Research synthesis, knowledge management, and learning', skills: [
    { id: 'synthesize-research', name: 'Research Synthesis', category: 'research', description: 'Synthesize research from multiple sources', status: 'wired' },
  ], mcps: [], gaps: [] },
  { id: 'nova', name: 'NOVA', kete: 'governance', purpose: 'Core operations, project management, and dispatch', skills: [
    { id: 'kaupapa-project-mgmt', name: 'Kaupapa Project Mgmt', category: 'operations', description: 'Māori-centred project management', status: 'wired' },
    { id: 'operations-core', name: 'Operations Core', category: 'operations', description: 'Process docs, runbooks, status reports', status: 'wired' },
  ], mcps: [], gaps: [] },
];

// ============================================================================
// 5 KETE — Complete skill and MCP configuration (Manaaki · Waihanga · Auaha · Arataki · Pikau)
// ============================================================================

export const KETE_SKILL_DATA: KeteSkillConfig[] = [
  {
    id: 'manaaki', name: 'MANAAKI', accent: '#E8A87C',
    purpose: 'Hospitality and customer-focused services',
    agents: ['aura', 'saffron', 'cellar', 'luxe', 'moana', 'coast', 'kura', 'pau', 'summit', 'menu', 'aroha-core'],
    keteSkills: [
      { id: 'nz-hospitality-compliance', name: 'NZ Hospitality Compliance', category: 'compliance', description: 'Food safety, health codes, licensing', status: 'wired' },
      { id: 'kaupapa-project-mgmt', name: 'Kaupapa Project Mgmt', category: 'operations', description: 'Māori-centred project management', status: 'wired' },
      { id: 'manaaki-operations', name: 'Operations', category: 'operations', description: 'Process docs, runbooks, compliance tracking', status: 'wired' },
      { id: 'manaaki-marketing', name: 'Marketing', category: 'marketing', description: 'Content drafting, email sequences', status: 'wired' },
      { id: 'manaaki-data', name: 'Data Analytics', category: 'data', description: 'Data analysis and visualization', status: 'wired' },
      { id: 'manaaki-support', name: 'Customer Support', category: 'support', description: 'Response drafting, customer research', status: 'wired' },
      { id: 'manaaki-allergen', name: 'Allergen & Dietary Matrix', category: 'compliance', description: '14-allergen NZ matrix, dietary planning, cross-contamination SOPs', status: 'wired' },
      { id: 'manaaki-hr', name: 'HR & People (AROHA)', category: 'hr', description: 'Hospitality rosters, employment, holidays act', status: 'wired' },
      { id: 'social-media-manager', name: 'Social Media Manager', category: 'marketing', description: 'Content and community management', status: 'wired' },
      { id: 'theme-factory', name: 'Theme Factory', category: 'design', description: 'Custom theme generation', status: 'gap' },
    ],
    keteMCPs: [
      { id: 'canva-manaaki', name: 'Canva (Full Suite)', provider: 'Canva', tools: ['generate-design', 'export-design', 'create-design-from-candidate', 'search-designs', 'list-brand-kits', 'upload-asset-from-url'], connectionStatus: 'available' },
    ],
  },
  {
    id: 'waihanga', name: 'WAIHANGA', accent: '#3A7D6E',
    purpose: 'Construction, building, and infrastructure',
    agents: ['ata', 'ārai', 'kaupapa', 'rawa', 'whakaaē', 'pai', 'arc', 'terra', 'pinnacle', 'aroha-core'],
    keteSkills: [
      { id: 'arai-site-safety', name: 'Ārai Site Safety', category: 'safety', description: 'Site safety, hazard management, compliance', status: 'wired' },
      { id: 'waihanga-kaupapa', name: 'Kaupapa Project Mgmt', category: 'operations', description: 'Māori-centred project management', status: 'wired' },
      { id: 'waihanga-operations', name: 'Operations', category: 'operations', description: 'Process docs, runbooks, change requests, risk assessment, vendor review', status: 'wired' },
      { id: 'waihanga-arc', name: 'Architecture & Building Code (ARC)', category: 'compliance', description: 'NZ Building Code, design review, specification writing', status: 'wired' },
      { id: 'waihanga-data', name: 'Data Analytics', category: 'data', description: 'Data analysis and visualization', status: 'wired' },
      { id: 'waihanga-legal', name: 'Legal', category: 'legal', description: 'Contract review, vendor checks', status: 'wired' },
      { id: 'waihanga-hr', name: 'HR & People (AROHA)', category: 'hr', description: 'Site crew employment, subbie agreements, fatigue policy', status: 'wired' },
      { id: 'waihanga-pdf-viewer', name: 'PDF Viewer Pro', category: 'documents', description: 'PDF annotation and digital signatures', status: 'gap' },
    ],
    keteMCPs: [
      { id: 'canva-waihanga', name: 'Canva (Signage & Safety)', provider: 'Canva', tools: ['generate-design', 'export-design'], connectionStatus: 'available' },
    ],
  },
  {
    id: 'auaha', name: 'AUAHA', accent: '#B794F4',
    purpose: 'Creative design, content, and artistic services',
    agents: ['prism', 'muse', 'pixel', 'verse', 'echo', 'flux', 'chromatic', 'rhythm', 'market', 'aroha-core'],
    keteSkills: [
      { id: 'canvas-design', name: 'Canvas Design', category: 'design', description: 'Advanced Canva design operations', status: 'wired' },
      { id: 'auaha-design', name: 'Design', category: 'design', description: 'UX research, design systems, critique, handoff, accessibility', status: 'wired' },
      { id: 'auaha-theme-factory', name: 'Theme Factory', category: 'design', description: 'Custom theme and design system generation', status: 'wired' },
      { id: 'algorithmic-art', name: 'Algorithmic Art', category: 'design', description: 'Generative and algorithmic art creation', status: 'gap' },
      { id: 'auaha-social-media', name: 'Social Media Manager', category: 'marketing', description: 'Content creation and community engagement', status: 'wired' },
      { id: 'auaha-marketing', name: 'Marketing', category: 'marketing', description: 'Content drafting, SEO audit, brand review', status: 'wired' },
      { id: 'auaha-hr', name: 'HR & People (AROHA)', category: 'hr', description: 'Studio team rosters, freelance contracts, retainer agreements', status: 'wired' },
      { id: 'skill-creator', name: 'Skill Creator', category: 'system', description: 'Create and design new agent skills', status: 'gap' },
    ],
    keteMCPs: [
      { id: 'canva-auaha', name: 'Canva (Full Creative Suite)', provider: 'Canva', tools: ['generate-design', 'generate-design-structured', 'create-design-from-candidate', 'export-design', 'editing-transactions', 'search-designs', 'list-brand-kits', 'upload-asset-from-url', 'get-design-pages', 'list-comments'], connectionStatus: 'connected' },
    ],
  },
  {
    id: 'pakihi', name: 'PAKIHI', accent: '#4AA5A8',
    purpose: 'Business, sales, finance, and commercial operations',
    agents: ['ledger', 'vault', 'catalyst', 'compass', 'haven', 'counter', 'gateway', 'harvest', 'grove', 'sage', 'ascend', 'aroha-core'],
    keteSkills: [
      { id: 'pakihi-finance', name: 'Finance', category: 'finance', description: 'Budgeting, forecasting, analysis, reporting, tax planning', status: 'wired' },
      { id: 'pakihi-sales', name: 'Sales', category: 'sales', description: 'Pipeline review, call summary, forecasting, competitive intelligence', status: 'wired' },
      { id: 'pakihi-data', name: 'Data Analytics', category: 'data', description: 'Statistical analysis, visualization, dashboards, SQL', status: 'wired' },
      { id: 'pakihi-marketing', name: 'Marketing', category: 'marketing', description: 'Campaign planning, competitive briefs, performance reports', status: 'wired' },
      { id: 'pakihi-product-mgmt', name: 'Product Management', category: 'product', description: 'Metrics review, competitive analysis', status: 'wired' },
      { id: 'pakihi-operations', name: 'Operations', category: 'operations', description: 'Status reporting, process documentation', status: 'wired' },
      { id: 'pakihi-legal', name: 'Legal', category: 'legal', description: 'Contract review, vendor checks, compliance', status: 'wired' },
      { id: 'common-room', name: 'Common Room', category: 'sales', description: 'Account research, weekly briefing, outreach', status: 'gap' },
      { id: 'apollo', name: 'Apollo', category: 'sales', description: 'Lead enrichment, prospecting, sequences', status: 'gap' },
    ],
    keteMCPs: [
      { id: 'canva-pakihi', name: 'Canva (Sales & Business)', provider: 'Canva', tools: ['generate-design', 'export-design', 'search-designs'], connectionStatus: 'available' },
    ],
  },
  {
    id: 'waka', name: 'WAKA', accent: '#6B8FA3',
    purpose: 'Transport, logistics, and fleet management',
    agents: ['motor', 'transit', 'mariner', 'aroha-core'],
    keteSkills: [
      { id: 'waka-kaupapa', name: 'Kaupapa Project Mgmt', category: 'operations', description: 'Māori-centred project management', status: 'wired' },
      { id: 'waka-operations', name: 'Operations', category: 'operations', description: 'Process docs, runbooks, compliance, capacity planning', status: 'wired' },
      { id: 'waka-data', name: 'Data Analytics', category: 'data', description: 'Data analysis and visualization', status: 'wired' },
      { id: 'nz-media-scanner-waka', name: 'NZ Media Scanner', category: 'monitoring', description: 'Transport and logistics news monitoring', status: 'wired' },
    ],
    keteMCPs: [],
  },
  {
    id: 'arataki', name: 'ARATAKI', accent: '#E8E8E8',
    purpose: 'Automotive, fleet, drivers, and route intelligence',
    agents: ['axis', 'drive', 'flux-arataki', 'axis-fleet', 'motor', 'aroha-core'],
    keteSkills: [
      { id: 'arataki-fuel-oracle', name: 'FuelOracle', category: 'operations', description: 'Live NZ fuel pricing across Z, BP, Mobil, Gull, Waitomo', status: 'wired' },
      { id: 'arataki-tco', name: 'Vehicle Economy / TCO', category: 'finance', description: 'Real per-km cost incl. RUC, depreciation, maintenance, insurance', status: 'wired' },
      { id: 'arataki-route', name: 'Route Intelligence', category: 'operations', description: 'Live NZ weather, roadworks, closures integrated into trip planning', status: 'wired' },
      { id: 'arataki-driver-compliance', name: 'Driver Compliance', category: 'compliance', description: 'WoF/CoF expiry, RUC balance, licence class, logbook prompts', status: 'wired' },
      { id: 'arataki-evidence', name: 'Evidence & Insurance Packs', category: 'compliance', description: 'Contemporaneous trip logs as insurance and claim-defence artefacts', status: 'wired' },
      { id: 'arataki-sales-pipeline', name: 'Sales & Lead Pipeline (FLUX)', category: 'sales', description: 'Test drive → sale → service → loyalty pipeline with no handoff dropped', status: 'wired' },
      { id: 'arataki-driver-wellbeing', name: 'Driver Wellbeing (DRIVE)', category: 'hr', description: 'Fatigue rules, rest breaks, wellbeing check-ins, H&S evidence', status: 'wired' },
      { id: 'arataki-fleet-finance', name: 'Fleet Finance (AXIS)', category: 'finance', description: 'Lease vs buy, replacement cycles, fleet P&L', status: 'wired' },
      { id: 'arataki-hr', name: 'HR & People (AROHA)', category: 'hr', description: 'Driver employment agreements, restructuring, holidays act', status: 'wired' },
    ],
    keteMCPs: [],
  },
  {
    id: 'pikau', name: 'PIKAU', accent: '#5AADA0',
    purpose: 'Freight, customs, biosecurity, and border compliance',
    agents: ['gateway', 'transit', 'mariner', 'aroha-core'],
    keteSkills: [
      { id: 'pikau-customs-entries', name: 'Customs Entries', category: 'compliance', description: 'NZ Customs declarations, HS code lookup, duties calculation', status: 'wired' },
      { id: 'pikau-freight-quotes', name: 'Freight Quotes', category: 'operations', description: 'Multi-modal freight quote comparisons (sea, air, road)', status: 'wired' },
      { id: 'pikau-dangerous-goods', name: 'Dangerous Goods Checks', category: 'compliance', description: 'IMDG, IATA, NZS 5433 dangerous goods classification', status: 'wired' },
      { id: 'pikau-biosecurity', name: 'Biosecurity (MPI)', category: 'compliance', description: 'MPI standards, biosecurity clearances, IHS lookups', status: 'wired' },
      { id: 'pikau-evidence', name: 'Border Evidence Pack', category: 'compliance', description: 'Contemporaneous customs evidence packs for audit', status: 'wired' },
      { id: 'pikau-hr', name: 'HR & People (AROHA)', category: 'hr', description: 'Yard crew, drivers, freight forwarder employment', status: 'wired' },
    ],
    keteMCPs: [],
  },
  {
    id: 'hangarau', name: 'HANGARAU', accent: '#3A7D6E',
    purpose: 'Technology, engineering, and digital innovation',
    agents: ['spark', 'sentinel', 'nexus-t', 'cipher', 'relay', 'matrix', 'forge', 'oracle', 'ember', 'reef', 'patent', 'foundry', 'aroha-core'],
    keteSkills: [
      { id: 'sentinel', name: 'Sentinel', category: 'security', description: 'Security monitoring and threat detection', status: 'wired' },
      { id: 'signal-security-specialist', name: 'Signal Security', category: 'security', description: 'Advanced security and encryption', status: 'wired' },
      { id: 'hangarau-engineering', name: 'Engineering', category: 'engineering', description: 'Architecture, code review, testing, deployment, debugging, incident response', status: 'wired' },
      { id: 'hangarau-operations', name: 'Operations', category: 'operations', description: 'Process docs, runbooks, change requests, compliance', status: 'wired' },
      { id: 'hangarau-data', name: 'Data Engineering', category: 'data', description: 'SQL queries, data analysis, validation', status: 'wired' },
      { id: 'mcp-builder', name: 'MCP Builder', category: 'system', description: 'Create and manage MCP integrations', status: 'gap' },
      { id: 'hangarau-skill-creator', name: 'Skill Creator', category: 'system', description: 'Design and implement new agent skills', status: 'gap' },
      { id: 'hangarau-product-mgmt', name: 'Product Management', category: 'product', description: 'Spec writing, sprint planning', status: 'wired' },
      { id: 'hangarau-legal', name: 'Legal', category: 'legal', description: 'Contract review for tech agreements', status: 'wired' },
      { id: 'hangarau-enterprise-search', name: 'Enterprise Search', category: 'search', description: 'Advanced search and knowledge retrieval', status: 'wired' },
    ],
    keteMCPs: [],
  },
  {
    id: 'te-kahui-reo', name: 'TE KĀHUI REO', accent: '#4AA5A8',
    purpose: 'Māori business intelligence and community engagement',
    agents: ['whānau', 'rohe', 'kaupapa-m', 'mana', 'kaitiaki', 'tāura', 'whakaaro', 'hiringa', 'aroha-core'],
    keteSkills: [
      { id: 'nz-media-scanner-reo', name: 'NZ Media Scanner', category: 'monitoring', description: 'NZ news and media monitoring', status: 'wired' },
      { id: 'te-kahui-kaupapa', name: 'Kaupapa Project Mgmt', category: 'operations', description: 'Māori-centred project management', status: 'wired' },
      { id: 'te-kahui-operations', name: 'Operations', category: 'operations', description: 'Process documentation, compliance tracking', status: 'wired' },
      { id: 'te-kahui-marketing', name: 'Marketing', category: 'marketing', description: 'Content drafting for te ao Māori', status: 'wired' },
      { id: 'te-kahui-social-media', name: 'Social Media Manager', category: 'marketing', description: 'Māori community engagement', status: 'wired' },
      { id: 'te-kahui-elite-copywriter', name: 'Elite Copywriter (Te Reo)', category: 'content', description: 'High-quality Māori-language content', status: 'gap' },
      { id: 'te-kahui-legal', name: 'Legal', category: 'legal', description: 'Compliance checks, NDA triage', status: 'wired' },
    ],
    keteMCPs: [],
    gradientAccent: { from: '#4AA5A8', via: '#3A7D6E', to: '#1A3A5C' },
  },
  {
    id: 'toroa', name: 'TORO', accent: '#E8D5B7',
    purpose: 'Family and personal agent (SMS-first, $29/month)',
    agents: ['toroa', 'aroha-core'],
    keteSkills: [
      { id: 'toroa-kaupapa', name: 'Kaupapa Project Mgmt', category: 'operations', description: 'Family project management', status: 'wired' },
      { id: 'toroa-schedule', name: 'Schedule', category: 'operations', description: 'Family calendar and event scheduling', status: 'wired' },
      { id: 'toroa-nz-media-scanner', name: 'NZ Media Scanner', category: 'monitoring', description: 'Personal news and interests', status: 'wired' },
      { id: 'toroa-support', name: 'Customer Support', category: 'support', description: 'KB articles, response drafting', status: 'wired' },
      { id: 'toroa-productivity', name: 'Productivity Suite', category: 'productivity', description: 'All productivity features', status: 'wired' },
      { id: 'toroa-data', name: 'Data Visualization', category: 'data', description: 'Family metrics and visualization', status: 'wired' },
      { id: 'toroa-social-media', name: 'Social Media Manager', category: 'marketing', description: 'Personal and family social content', status: 'wired' },
      { id: 'toroa-theme-factory', name: 'Theme Factory', category: 'design', description: 'Personal theme customization', status: 'gap' },
      { id: 'toroa-operations', name: 'Operations', category: 'operations', description: 'Personal process documentation', status: 'wired' },
    ],
    keteMCPs: [
      { id: 'canva-toroa', name: 'Canva (Family)', provider: 'Canva', tools: ['generate-design', 'export-design'], connectionStatus: 'available' },
    ],
  },
  {
    id: 'hauora', name: 'HAUORA', accent: '#7BC8A4',
    purpose: 'Health, wellness, fitness, and lifestyle',
    agents: ['turf', 'league', 'vitals', 'remedy', 'vitae', 'radiance', 'palette', 'odyssey', 'aroha-core'],
    keteSkills: [
      { id: 'hauora-operations', name: 'Operations', category: 'operations', description: 'Process documentation, runbooks', status: 'wired' },
      { id: 'hauora-data', name: 'Data Analytics', category: 'data', description: 'Health metrics analysis and visualization', status: 'wired' },
      { id: 'hauora-marketing', name: 'Marketing', category: 'marketing', description: 'Content drafting, email sequences', status: 'wired' },
      { id: 'hauora-design', name: 'Design', category: 'design', description: 'Accessibility review for health content', status: 'wired' },
      { id: 'hauora-support', name: 'Customer Support', category: 'support', description: 'KB articles, response drafting', status: 'wired' },
      { id: 'hauora-elite-copywriter', name: 'Elite Copywriter', category: 'content', description: 'Health and wellness content creation', status: 'wired' },
      { id: 'hauora-social-media', name: 'Social Media Manager', category: 'marketing', description: 'Health and community engagement', status: 'wired' },
    ],
    keteMCPs: [],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Get all foundation skills (shared across all agents) */
export function getFoundationSkills(): Skill[] {
  return [
    ...SHARED_FOUNDATION.coreSkills,
    ...SHARED_FOUNDATION.productivitySkills,
    ...SHARED_FOUNDATION.documentProcessing,
    ...SHARED_FOUNDATION.brandVoice,
  ];
}

/** Get kete config by ID */
export function getKeteById(keteId: string): KeteSkillConfig | undefined {
  return KETE_SKILL_DATA.find(k => k.id === keteId);
}

/** Get all skills for an agent (foundation + kete + agent-specific) */
export function getAgentFullSkillSet(agentId: string): { foundation: Skill[]; kete: Skill[]; agent: Skill[]; mcps: MCPConnector[] } {
  const foundation = getFoundationSkills();
  const kete = KETE_SKILL_DATA.find(k => k.agents.includes(agentId));
  const coreAgent = SHARED_CORE_AGENTS.find(a => a.id === agentId);

  return {
    foundation,
    kete: kete?.keteSkills ?? [],
    agent: coreAgent?.skills ?? [],
    mcps: [...SHARED_FOUNDATION.defaultMCPs, ...(kete?.keteMCPs ?? [])],
  };
}

/** Get wired/gap counts across all kete */
export function getSkillCoverage(): { keteId: string; name: string; accent: string; wired: number; gap: number; total: number }[] {
  return KETE_SKILL_DATA.map(k => {
    const wired = k.keteSkills.filter(s => s.status === 'wired').length;
    const gap = k.keteSkills.filter(s => s.status === 'gap').length;
    return { keteId: k.id, name: k.name, accent: k.accent, wired, gap, total: wired + gap };
  });
}

/** Get global totals */
export function getGlobalSkillStats() {
  const allKeteSkills = KETE_SKILL_DATA.flatMap(k => k.keteSkills);
  const foundationSkills = getFoundationSkills();
  const coreAgentSkills = SHARED_CORE_AGENTS.flatMap(a => a.skills);
  const allSkills = [...foundationSkills, ...allKeteSkills, ...coreAgentSkills];
  return {
    totalSkills: allSkills.length,
    wired: allSkills.filter(s => s.status === 'wired').length,
    gap: allSkills.filter(s => s.status === 'gap').length,
    totalMCPs: SHARED_FOUNDATION.defaultMCPs.length + KETE_SKILL_DATA.reduce((sum, k) => sum + k.keteMCPs.length, 0),
    totalAgents: 8 + KETE_SKILL_DATA.reduce((sum, k) => sum + k.agents.length, 0),
  };
}

// ============================================================================
// IHO ROUTING ENGINE
// ============================================================================

export interface RoutingResult {
  targetKete: KeteSkillConfig | null;
  targetAgentId: string | null;
  targetAgentName: string | null;
  skills: Skill[];
  mcps: MCPConnector[];
  governanceCheckpoints: string[];
  classifiedKeteId: string;
}

const INTENT_KEYWORDS: Record<string, RegExp> = {
  manaaki:       /hospitality|hotel|restaurant|bar|cafe|venue|guest|menu|booking|allergen|dietary/i,
  waihanga:      /construction|building|site|contractor|scaffold|concrete|consent|safety|bim|architect|building code/i,
  hanga:         /construction|building|site|contractor|scaffold|concrete|consent|safety|bim/i,
  auaha:         /design|creative|art|content|campaign|brand|logo|video|podcast/i,
  pakihi:        /business|finance|sales|pipeline|budget|invoice|tax|accounting|lead/i,
  arataki:       /automotive|fleet|vehicle|car|ute|truck|driver|wof|cof|ruc|fuel|test drive|dealership/i,
  pikau:         /customs|freight|biosecurity|hs code|tariff|shipment|import|export|mpi|border/i,
  waka:          /transport|logistics|fleet|vehicle|driver|freight|shipping|maritime/i,
  hangarau:      /technology|engineering|code|software|system|security|api|server|deploy/i,
  'te-kahui-reo':/māori|reo|whānau|kaupapa|rohe|iwi|hapū|tikanga|kaitiaki/i,
  toroa:         /family|personal|home|tōroa|school|kids|meal|grocery|budget/i,
  hauora:        /health|fitness|wellness|sports|vitals|medical|gym|rugby|league/i,
};

export class IhoRouter {
  /** Classify intent and return full routing result */
  route(intent: string): RoutingResult {
    const keteId = this.classifyIntent(intent);
    const kete = KETE_SKILL_DATA.find(k => k.id === keteId) || null;
    const agentId = kete ? this.selectAgent(kete, intent) : null;

    const foundationSkills = getFoundationSkills();
    const keteSkills = kete?.keteSkills ?? [];
    const agentSkills = agentId
      ? (SHARED_CORE_AGENTS.find(a => a.id === agentId)?.skills ?? [])
      : [];

    return {
      targetKete: kete,
      targetAgentId: agentId,
      targetAgentName: agentId?.toUpperCase() ?? null,
      skills: [...foundationSkills, ...keteSkills, ...agentSkills],
      mcps: [...SHARED_FOUNDATION.defaultMCPs, ...(kete?.keteMCPs ?? [])],
      governanceCheckpoints: this.determineGovernance(intent),
      classifiedKeteId: keteId,
    };
  }

  classifyIntent(intent: string): string {
    for (const [keteId, regex] of Object.entries(INTENT_KEYWORDS)) {
      if (regex.test(intent)) return keteId;
    }
    return 'governance'; // default → NOVA
  }

  private selectAgent(kete: KeteSkillConfig, intent: string): string {
    // Simple first-agent selection; expand with NLP scoring in production
    return kete.agents[0];
  }

  private determineGovernance(intent: string): string[] {
    const checks: string[] = [];
    if (/personal|privacy|data|information|pii/i.test(intent)) checks.push('SHIELD');
    if (/legal|compliance|contract|regulation|act\b/i.test(intent)) checks.push('CHARTER');
    if (/dispute|escalat|conflict|complaint/i.test(intent)) checks.push('ARBITER');
    return checks;
  }
}

/** Singleton router instance */
export const ihoRouter = new IhoRouter();
