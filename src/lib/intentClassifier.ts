// ── Intent Classifier for Smart Select ──
// Maps natural language queries to kete and agents

export type IntentCategory =
  | 'compliance' | 'design' | 'finance' | 'hr' | 'legal'
  | 'construction' | 'health' | 'transport' | 'tech' | 'creative'
  | 'sales' | 'family' | 'operations' | 'marketing' | 'maori'
  | 'hospitality' | 'food' | 'property' | 'education' | 'care';

interface IntentKeywordMap {
  category: IntentCategory;
  keywords: string[];
  keteIds: string[];
}

const INTENT_MAP: IntentKeywordMap[] = [
  { category: 'design', keywords: ['logo', 'design', 'brand', 'visual', 'graphic', 'colour', 'color', 'style', 'identity', 'creative brief'], keteIds: ['auaha'] },
  { category: 'creative', keywords: ['content', 'copy', 'write', 'blog', 'video', 'podcast', 'photo', 'image', 'animation', 'social media', 'campaign', 'ad'], keteIds: ['auaha'] },
  { category: 'marketing', keywords: ['marketing', 'seo', 'email campaign', 'newsletter', 'audience', 'funnel', 'leads', 'conversion', 'ads', 'promotion'], keteIds: ['auaha'] },
  { category: 'finance', keywords: ['payroll', 'invoice', 'tax', 'gst', 'acc', 'budget', 'cashflow', 'accounting', 'profit', 'loss', 'expense', 'revenue'], keteIds: ['arataki'] },
  { category: 'hr', keywords: ['hire', 'recruit', 'staff', 'employee', 'onboard', 'payroll', 'leave', 'kiwisaver', 'employment', 'contract', 'performance review'], keteIds: ['arataki'] },
  { category: 'legal', keywords: ['contract', 'agreement', 'terms', 'compliance', 'regulation', 'act', 'legislation', 'legal', 'dispute', 'liability'], keteIds: ['arataki'] },
  { category: 'compliance', keywords: ['health and safety', 'h&s', 'worksafe', 'audit', 'inspection', 'certification', 'resource consent', 'building consent', 'rma'], keteIds: ['waihanga', 'arataki'] },
  { category: 'construction', keywords: ['build', 'site', 'construction', 'project', 'tender', 'safety', 'concrete', 'scaffold', 'bim', 'plan', 'checkin', 'iot', 'sensor'], keteIds: ['waihanga'] },
  { category: 'hospitality', keywords: ['hotel', 'motel', 'lodge', 'restaurant', 'café', 'cafe', 'bar', 'reservation', 'booking', 'guest', 'accommodation', 'room'], keteIds: ['manaaki'] },
  { category: 'food', keywords: ['food', 'menu', 'kitchen', 'chef', 'wine', 'dining', 'recipe', 'food safety', 'fcp', 'allergen', 'dietary'], keteIds: ['manaaki'] },
  { category: 'transport', keywords: ['vehicle', 'fleet', 'truck', 'ship', 'freight', 'logistics', 'maritime', 'ais', 'route', 'delivery', 'transport'], keteIds: ['pikau'] },
  { category: 'tech', keywords: ['code', 'app', 'software', 'api', 'database', 'server', 'deploy', 'devops', 'security', 'cyber', 'network', 'cloud'], keteIds: ['auaha'] },
  { category: 'family', keywords: ['family', 'whānau', 'whanau', 'kids', 'school', 'children', 'reunion', 'event', 'meal plan', 'grocery', 'schedule', 'smart home', 'alexa'], keteIds: ['toroa'] },
  { category: 'property', keywords: ['property', 'rental', 'tenant', 'landlord', 'maintenance', 'lease', 'bond', 'inspection'], keteIds: ['arataki'] },
  { category: 'health', keywords: ['fitness', 'sport', 'health', 'wellbeing', 'exercise', 'travel', 'trip', 'holiday', 'itinerary'], keteIds: ['toro'] },
  { category: 'sales', keywords: ['sales', 'crm', 'pipeline', 'deal', 'quote', 'proposal', 'lead', 'prospect', 'client'], keteIds: ['arataki'] },
  { category: 'maori', keywords: ['te reo', 'māori', 'maori', 'tikanga', 'iwi', 'hapū', 'hapu', 'whakapapa', 'kaupapa', 'whenua'], keteIds: ['arataki'] },
  { category: 'care', keywords: ['elderly', 'senior', 'caregiver', 'aged care', 'check-in', 'medication', 'wellbeing'], keteIds: ['toro'] },
  { category: 'operations', keywords: ['workflow', 'automation', 'process', 'efficiency', 'operations', 'integrate', 'system'], keteIds: ['auaha', 'arataki'] },
  { category: 'education', keywords: ['teach', 'learn', 'course', 'training', 'workshop', 'curriculum'], keteIds: ['arataki'] },
];

// Agent registry with kete mapping
interface AgentEntry {
  id: string;
  name: string;
  keteId: string;
  keywords: string[];
  specialisation: string;
  performanceScore: number; // 0-100
}

const AGENT_REGISTRY: AgentEntry[] = [
  // AUAHA
  { id: 'prism', name: 'PRISM', keteId: 'auaha', keywords: ['brand', 'identity', 'logo', 'design', 'colour', 'visual'], specialisation: 'Brand DNA & Visual Identity', performanceScore: 94 },
  { id: 'muse', name: 'MUSE', keteId: 'auaha', keywords: ['copy', 'write', 'blog', 'content', 'storytelling', 'caption'], specialisation: 'Copywriting & Content', performanceScore: 91 },
  { id: 'pixel', name: 'PIXEL', keteId: 'auaha', keywords: ['image', 'photo', 'graphic', 'visual', 'design', 'illustration'], specialisation: 'Image Generation & Editing', performanceScore: 88 },
  { id: 'verse', name: 'VERSE', keteId: 'auaha', keywords: ['video', 'animation', 'motion', 'film', 'edit', 'reel'], specialisation: 'Video Production', performanceScore: 85 },
  { id: 'echo', name: 'ECHO', keteId: 'auaha', keywords: ['podcast', 'audio', 'voice', 'sound', 'recording', 'interview'], specialisation: 'Podcast & Audio', performanceScore: 87 },
  { id: 'flux', name: 'FLUX', keteId: 'auaha', keywords: ['social', 'post', 'schedule', 'publish', 'engage', 'audience'], specialisation: 'Social Media Management', performanceScore: 89 },
  { id: 'chromatic', name: 'CHROMATIC', keteId: 'auaha', keywords: ['colour', 'palette', 'scheme', 'mood', 'aesthetic'], specialisation: 'Colour & Aesthetic Design', performanceScore: 82 },
  { id: 'rhythm', name: 'RHYTHM', keteId: 'auaha', keywords: ['campaign', 'calendar', 'plan', 'strategy', 'content plan'], specialisation: 'Campaign Planning', performanceScore: 86 },
  { id: 'market', name: 'MARKET', keteId: 'auaha', keywords: ['ad', 'advertising', 'facebook', 'google ads', 'meta', 'targeting'], specialisation: 'Paid Advertising', performanceScore: 88 },

  // WAIHANGA
  { id: 'ata', name: 'ATA', keteId: 'waihanga', keywords: ['bim', '3d model', 'plan', 'building', 'ifc', 'revit'], specialisation: 'BIM & 3D Modelling', performanceScore: 92 },
  { id: 'arai', name: 'ĀRAI', keteId: 'waihanga', keywords: ['safety', 'h&s', 'worksafe', 'hazard', 'risk', 'ppe', 'audit'], specialisation: 'Health & Safety', performanceScore: 97 },
  { id: 'kaupapa', name: 'KAUPAPA', keteId: 'waihanga', keywords: ['project', 'plan', 'schedule', 'gantt', 'milestone', 'deadline'], specialisation: 'Project Management', performanceScore: 90 },
  { id: 'rawa', name: 'RAWA', keteId: 'waihanga', keywords: ['materials', 'procurement', 'order', 'supply', 'stock', 'inventory'], specialisation: 'Materials & Procurement', performanceScore: 85 },
  { id: 'whakaae', name: 'WHAKAAĒ', keteId: 'waihanga', keywords: ['consent', 'resource consent', 'building consent', 'council', 'rma'], specialisation: 'Consents & Compliance', performanceScore: 88 },
  { id: 'pai', name: 'PAI', keteId: 'waihanga', keywords: ['quality', 'inspection', 'defect', 'snag', 'check', 'standard'], specialisation: 'Quality Assurance', performanceScore: 86 },
  { id: 'arc', name: 'ARC', keteId: 'waihanga', keywords: ['architecture', 'design', 'draft', 'elevation', 'floor plan'], specialisation: 'Architectural Design', performanceScore: 84 },
  { id: 'terra', name: 'TERRA', keteId: 'waihanga', keywords: ['survey', 'gis', 'land', 'topography', 'map', 'site'], specialisation: 'Surveying & GIS', performanceScore: 82 },
  { id: 'pinnacle', name: 'PINNACLE', keteId: 'waihanga', keywords: ['tender', 'bid', 'proposal', 'rfp', 'pricing', 'estimate'], specialisation: 'Tender Writing', performanceScore: 91 },

  // MANAAKI
  { id: 'aura', name: 'AURA', keteId: 'manaaki', keywords: ['hotel', 'lodge', 'accommodation', 'guest', 'hospitality', 'room', 'booking'], specialisation: 'Property Operations', performanceScore: 93 },
  { id: 'saffron', name: 'SAFFRON', keteId: 'manaaki', keywords: ['food', 'menu', 'kitchen', 'recipe', 'food safety', 'fcp', 'allergen'], specialisation: 'Food Safety & Kitchen', performanceScore: 95 },
  { id: 'cellar', name: 'CELLAR', keteId: 'manaaki', keywords: ['wine', 'beverage', 'bar', 'cocktail', 'spirits', 'sommelier'], specialisation: 'Beverage & Wine', performanceScore: 87 },
  { id: 'luxe', name: 'LUXE', keteId: 'manaaki', keywords: ['luxury', 'vip', 'concierge', 'premium', 'experience', 'exclusive'], specialisation: 'Premium Guest Experience', performanceScore: 89 },
  { id: 'moana', name: 'MOANA', keteId: 'manaaki', keywords: ['marine', 'coastal', 'boat', 'cruise', 'harbour', 'water'], specialisation: 'Marine & Coastal Tourism', performanceScore: 84 },
  { id: 'coast', name: 'COAST', keteId: 'manaaki', keywords: ['eco', 'sustainability', 'green', 'carbon', 'conservation'], specialisation: 'Sustainability & Eco', performanceScore: 86 },
  { id: 'kura', name: 'KURA', keteId: 'manaaki', keywords: ['event', 'conference', 'function', 'wedding', 'venue', 'catering'], specialisation: 'Events & Functions', performanceScore: 88 },
  { id: 'pau', name: 'PAU', keteId: 'manaaki', keywords: ['spa', 'wellness', 'massage', 'treatment', 'relaxation'], specialisation: 'Spa & Wellness', performanceScore: 83 },
  { id: 'summit', name: 'SUMMIT', keteId: 'manaaki', keywords: ['revenue', 'yield', 'pricing', 'occupancy', 'forecast', 'adr'], specialisation: 'Revenue Management', performanceScore: 90 },

  // PAKIHI
  { id: 'ledger', name: 'LEDGER', keteId: 'pakihi', keywords: ['accounting', 'bookkeeping', 'journal', 'ledger', 'financial'], specialisation: 'Accounting & Bookkeeping', performanceScore: 92 },
  { id: 'vault', name: 'VAULT', keteId: 'pakihi', keywords: ['payroll', 'wages', 'salary', 'kiwisaver', 'paye', 'leave'], specialisation: 'Payroll & Compliance', performanceScore: 94 },
  { id: 'catalyst', name: 'CATALYST', keteId: 'pakihi', keywords: ['strategy', 'growth', 'plan', 'business plan', 'advisor'], specialisation: 'Business Strategy', performanceScore: 88 },
  { id: 'compass', name: 'COMPASS', keteId: 'pakihi', keywords: ['compliance', 'regulation', 'act', 'legislation', 'governance'], specialisation: 'Compliance & Governance', performanceScore: 91 },
  { id: 'haven', name: 'HAVEN', keteId: 'pakihi', keywords: ['property', 'rental', 'tenant', 'landlord', 'lease', 'bond'], specialisation: 'Property Management', performanceScore: 89 },
  { id: 'counter', name: 'COUNTER', keteId: 'pakihi', keywords: ['invoice', 'quote', 'billing', 'payment', 'receipt'], specialisation: 'Invoicing & Billing', performanceScore: 90 },
  { id: 'gateway', name: 'GATEWAY', keteId: 'pakihi', keywords: ['import', 'export', 'customs', 'trade', 'international'], specialisation: 'Trade & Customs', performanceScore: 83 },
  { id: 'harvest', name: 'HARVEST', keteId: 'pakihi', keywords: ['crm', 'sales', 'pipeline', 'deal', 'client', 'prospect'], specialisation: 'CRM & Sales', performanceScore: 87 },
  { id: 'grove', name: 'GROVE', keteId: 'pakihi', keywords: ['hr', 'hire', 'recruit', 'employee', 'onboard', 'contract'], specialisation: 'HR & Recruitment', performanceScore: 86 },
  { id: 'sage', name: 'SAGE', keteId: 'pakihi', keywords: ['legal', 'contract', 'agreement', 'terms', 'dispute', 'nda'], specialisation: 'Legal & Contracts', performanceScore: 85 },
  { id: 'ascend', name: 'ASCEND', keteId: 'pakihi', keywords: ['kpi', 'dashboard', 'report', 'analytics', 'performance'], specialisation: 'Analytics & Reporting', performanceScore: 89 },

  // WAIHANGARAU
  { id: 'spark', name: 'SPARK', keteId: 'hangarau', keywords: ['app', 'build', 'no-code', 'prototype', 'mvp', 'tool'], specialisation: 'No-Code App Builder', performanceScore: 93 },
  { id: 'sentinel', name: 'SENTINEL', keteId: 'hangarau', keywords: ['security', 'cyber', 'threat', 'firewall', 'audit', 'vulnerability'], specialisation: 'Cybersecurity', performanceScore: 91 },
  { id: 'nexus-t', name: 'NEXUS-T', keteId: 'hangarau', keywords: ['integration', 'api', 'connect', 'webhook', 'automation'], specialisation: 'Integration & APIs', performanceScore: 90 },
  { id: 'cipher', name: 'CIPHER', keteId: 'hangarau', keywords: ['data', 'encrypt', 'privacy', 'gdpr', 'compliance'], specialisation: 'Data Privacy', performanceScore: 88 },
  { id: 'relay', name: 'RELAY', keteId: 'hangarau', keywords: ['message', 'notification', 'email', 'sms', 'communication'], specialisation: 'Messaging & Comms', performanceScore: 87 },
  { id: 'matrix', name: 'MATRIX', keteId: 'hangarau', keywords: ['database', 'query', 'sql', 'data model', 'schema'], specialisation: 'Database & Data', performanceScore: 86 },
  { id: 'forge', name: 'FORGE', keteId: 'hangarau', keywords: ['devops', 'deploy', 'ci/cd', 'pipeline', 'server', 'cloud'], specialisation: 'DevOps & Cloud', performanceScore: 85 },
  { id: 'oracle', name: 'ORACLE', keteId: 'hangarau', keywords: ['ai', 'ml', 'model', 'train', 'predict', 'llm'], specialisation: 'AI & ML', performanceScore: 92 },
  { id: 'ember', name: 'EMBER', keteId: 'hangarau', keywords: ['iot', 'sensor', 'device', 'edge', 'hardware', 'monitor'], specialisation: 'IoT & Edge', performanceScore: 84 },
  { id: 'reef', name: 'REEF', keteId: 'hangarau', keywords: ['network', 'infrastructure', 'dns', 'ssl', 'hosting'], specialisation: 'Network & Infrastructure', performanceScore: 83 },
  { id: 'patent', name: 'PATENT', keteId: 'hangarau', keywords: ['ip', 'patent', 'trademark', 'copyright', 'protection'], specialisation: 'IP & Patents', performanceScore: 80 },
  { id: 'foundry', name: 'FOUNDRY', keteId: 'hangarau', keywords: ['code', 'develop', 'software', 'react', 'typescript', 'debug'], specialisation: 'Software Development', performanceScore: 91 },

  // WAKA
  { id: 'motor', name: 'MOTOR', keteId: 'waka', keywords: ['vehicle', 'fleet', 'car', 'truck', 'maintenance', 'wof', 'rego'], specialisation: 'Fleet Management', performanceScore: 87 },
  { id: 'transit', name: 'TRANSIT', keteId: 'waka', keywords: ['freight', 'logistics', 'delivery', 'shipping', 'courier', 'tracking'], specialisation: 'Freight & Logistics', performanceScore: 85 },
  { id: 'mariner', name: 'MARINER', keteId: 'waka', keywords: ['maritime', 'ship', 'boat', 'port', 'ais', 'navigation', 'marine'], specialisation: 'Maritime Operations', performanceScore: 89 },

  // TE KĀHUI REO
  { id: 'whanau-reo', name: 'WHĀNAU', keteId: 'te-kahui-reo', keywords: ['whānau', 'whanau', 'family', 'iwi', 'hapū', 'whakapapa'], specialisation: 'Whānau & Iwi', performanceScore: 90 },
  { id: 'rohe', name: 'ROHE', keteId: 'te-kahui-reo', keywords: ['region', 'rohe', 'whenua', 'land', 'place', 'geography'], specialisation: 'Regional Intelligence', performanceScore: 85 },
  { id: 'kaupapa-m', name: 'KAUPAPA-M', keteId: 'te-kahui-reo', keywords: ['kaupapa', 'policy', 'tikanga', 'protocol', 'cultural'], specialisation: 'Policy & Tikanga', performanceScore: 88 },
  { id: 'mana-reo', name: 'MANA', keteId: 'te-kahui-reo', keywords: ['governance', 'leadership', 'mana', 'authority', 'board'], specialisation: 'Governance & Leadership', performanceScore: 87 },
  { id: 'kaitiaki', name: 'KAITIAKI', keteId: 'te-kahui-reo', keywords: ['environment', 'kaitiaki', 'conservation', 'sustainability', 'biodiversity'], specialisation: 'Environmental Stewardship', performanceScore: 86 },
  { id: 'taura', name: 'TĀURA', keteId: 'te-kahui-reo', keywords: ['data', 'statistics', 'census', 'research', 'analysis'], specialisation: 'Data & Research', performanceScore: 84 },
  { id: 'whakaaro', name: 'WHAKAARO', keteId: 'te-kahui-reo', keywords: ['strategy', 'think', 'plan', 'vision', 'future'], specialisation: 'Strategic Thinking', performanceScore: 83 },
  { id: 'hiringa', name: 'HIRINGA', keteId: 'te-kahui-reo', keywords: ['innovation', 'enterprise', 'startup', 'māori business'], specialisation: 'Māori Enterprise', performanceScore: 85 },

  // TORO
  { id: 'toroa', name: 'TORO', keteId: 'toroa', keywords: ['family', 'whānau', 'schedule', 'school', 'kids', 'meal', 'grocery', 'smart home', 'alexa', 'traffic'], specialisation: 'Family AI Navigator', performanceScore: 95 },

  // HAUORA
  { id: 'turf', name: 'TURF', keteId: 'hauora', keywords: ['sport', 'fitness', 'team', 'game', 'league', 'training', 'competition'], specialisation: 'Sports & Fitness', performanceScore: 88 },
  { id: 'league', name: 'LEAGUE', keteId: 'hauora', keywords: ['league', 'competition', 'tournament', 'draw', 'fixture'], specialisation: 'League Management', performanceScore: 85 },
  { id: 'vitals', name: 'VITALS', keteId: 'hauora', keywords: ['health', 'monitor', 'vitals', 'blood pressure', 'heart rate'], specialisation: 'Health Monitoring', performanceScore: 84 },
  { id: 'remedy', name: 'REMEDY', keteId: 'hauora', keywords: ['wellness', 'mental health', 'stress', 'anxiety', 'mindfulness'], specialisation: 'Wellness & Mental Health', performanceScore: 83 },
  { id: 'vitae', name: 'VITAE', keteId: 'hauora', keywords: ['care', 'elderly', 'senior', 'aged', 'caregiver'], specialisation: 'Aged Care Journeys', performanceScore: 86 },
  { id: 'radiance', name: 'RADIANCE', keteId: 'hauora', keywords: ['beauty', 'skin', 'cosmetic', 'grooming', 'self-care'], specialisation: 'Beauty & Self-Care', performanceScore: 81 },
  { id: 'palette', name: 'PALETTE', keteId: 'hauora', keywords: ['nutrition', 'diet', 'meal', 'calorie', 'macro', 'food plan'], specialisation: 'Nutrition & Diet', performanceScore: 82 },
  { id: 'odyssey', name: 'ODYSSEY', keteId: 'hauora', keywords: ['travel', 'trip', 'holiday', 'itinerary', 'destination', 'flight', 'accommodation'], specialisation: 'Travel Planning', performanceScore: 90 },

  // SHARED CORE
  { id: 'charter', name: 'CHARTER', keteId: 'shared', keywords: ['onboard', 'setup', 'configure', 'start', 'begin', 'new'], specialisation: 'Onboarding & Setup', performanceScore: 92 },
  { id: 'arbiter', name: 'ARBITER', keteId: 'shared', keywords: ['dispute', 'mediate', 'resolve', 'conflict', 'escalate'], specialisation: 'Dispute Resolution', performanceScore: 88 },
  { id: 'shield', name: 'SHIELD', keteId: 'shared', keywords: ['privacy', 'security', 'data protection', 'nzism', 'encrypt'], specialisation: 'Privacy & Security', performanceScore: 94 },
  { id: 'anchor', name: 'ANCHOR', keteId: 'shared', keywords: ['backup', 'recover', 'restore', 'archive', 'continuity'], specialisation: 'Business Continuity', performanceScore: 86 },
  { id: 'aroha', name: 'AROHA', keteId: 'shared', keywords: ['hr', 'people', 'culture', 'engagement', 'wellbeing'], specialisation: 'People & Culture', performanceScore: 91 },
  { id: 'pulse', name: 'PULSE', keteId: 'shared', keywords: ['monitor', 'health check', 'status', 'uptime', 'performance'], specialisation: 'System Monitoring', performanceScore: 90 },
  { id: 'scholar', name: 'SCHOLAR', keteId: 'shared', keywords: ['research', 'learn', 'knowledge', 'document', 'wiki'], specialisation: 'Knowledge & Research', performanceScore: 87 },
  { id: 'nova', name: 'NOVA', keteId: 'shared', keywords: ['innovate', 'experiment', 'beta', 'test', 'new feature'], specialisation: 'Innovation Lab', performanceScore: 85 },
];

const KETE_META: Record<string, { name: string; accent: string }> = {
  'manaaki': { name: 'MANAAKI', accent: '#4AA5A8' },
  'waihanga': { name: 'WAIHANGA', accent: '#3A7D6E' },
  'auaha': { name: 'AUAHA', accent: '#A8DDDB' },
  'arataki': { name: 'ARATAKI', accent: '#C65D4E' },
  'pikau': { name: 'PIKAU', accent: '#5AADA0' },
  'toro': { name: 'TŌRO', accent: '#4AA5A8' },
  'toroa': { name: 'TŌRO', accent: '#4AA5A8' },
  'shared': { name: 'SHARED CORE', accent: '#4AA5A8' },
};

export interface AlternativeMatch {
  agentId: string;
  agentName: string;
  keteId: string;
  keteName: string;
  keteAccent: string;
  confidence: number;
  reason: string;
}

export interface IntentMatch {
  query: string;
  keteId: string;
  keteName: string;
  keteAccent: string;
  agentId: string;
  agentName: string;
  specialisation: string;
  confidence: number;
  reasoning: string[];
  matchedIntents: IntentCategory[];
  alternatives: AlternativeMatch[];
}

function extractIntents(query: string): { category: IntentCategory; score: number }[] {
  const q = query.toLowerCase();
  const results: { category: IntentCategory; score: number }[] = [];

  for (const mapping of INTENT_MAP) {
    let matchCount = 0;
    for (const kw of mapping.keywords) {
      if (q.includes(kw)) matchCount++;
    }
    if (matchCount > 0) {
      results.push({ category: mapping.category, score: matchCount / mapping.keywords.length });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

function scoreAgent(agent: AgentEntry, query: string, intentScores: Map<string, number>): number {
  const q = query.toLowerCase();
  let skillMatch = 0;
  for (const kw of agent.keywords) {
    if (q.includes(kw)) skillMatch += 1;
  }
  skillMatch = Math.min(skillMatch / 3, 1); // normalise

  const performance = agent.performanceScore / 100;

  // Kete match from intents
  let keteMatch = 0;
  for (const [, mapping] of Object.entries(INTENT_MAP)) {
    if (mapping.keteIds.includes(agent.keteId)) {
      const score = intentScores.get(mapping.category) || 0;
      keteMatch = Math.max(keteMatch, score);
    }
  }

  return (skillMatch * 0.4) + (performance * 0.4) + (keteMatch * 0.2);
}

export function classifyIntent(query: string): IntentMatch | null {
  if (!query.trim()) return null;

  const intents = extractIntents(query);
  if (intents.length === 0) {
    // Fallback: try word matching against agents
    const q = query.toLowerCase();
    const fallback = AGENT_REGISTRY.find(a =>
      a.keywords.some(kw => q.includes(kw))
    );
    if (!fallback) return null;
    const meta = KETE_META[fallback.keteId] || { name: 'UNKNOWN', accent: '#888' };
    return {
      query,
      keteId: fallback.keteId,
      keteName: meta.name,
      keteAccent: meta.accent,
      agentId: fallback.id,
      agentName: fallback.name,
      specialisation: fallback.specialisation,
      confidence: 65,
      reasoning: ['Keyword match'],
      matchedIntents: [],
      alternatives: [],
    };
  }

  const intentScores = new Map(intents.map(i => [i.category, i.score]));

  // Score all agents
  const scored = AGENT_REGISTRY.map(agent => ({
    agent,
    score: scoreAgent(agent, query, intentScores),
  })).sort((a, b) => b.score - a.score);

  const top = scored[0];
  if (!top) return null;

  const meta = KETE_META[top.agent.keteId] || { name: 'UNKNOWN', accent: '#888' };

  // Build reasoning chips
  const reasoning: string[] = [];
  const matchedIntents = intents.slice(0, 3).map(i => i.category);
  if (matchedIntents.length > 0) reasoning.push(`Intent: ${matchedIntents[0]}`);
  reasoning.push(`Match: ${top.agent.specialisation.toLowerCase()}`);
  reasoning.push(`Performance: ${top.agent.performanceScore}%`);

  // Get alternatives (next 2)
  const alternatives: AlternativeMatch[] = scored.slice(1, 3).map(s => {
    const m = KETE_META[s.agent.keteId] || { name: 'UNKNOWN', accent: '#888' };
    return {
      agentId: s.agent.id,
      agentName: s.agent.name,
      keteId: s.agent.keteId,
      keteName: m.name,
      keteAccent: m.accent,
      confidence: Math.round(s.score * 100),
      reason: s.agent.specialisation,
    };
  });

  return {
    query,
    keteId: top.agent.keteId,
    keteName: meta.name,
    keteAccent: meta.accent,
    agentId: top.agent.id,
    agentName: top.agent.name,
    specialisation: top.agent.specialisation,
    confidence: Math.round(top.score * 100),
    reasoning,
    matchedIntents,
    alternatives,
  };
}

// Demo data for quick select
export const DEMO_QUERIES: { query: string; result: IntentMatch }[] = [
  {
    query: "Design a logo for my café",
    result: {
      query: "Design a logo for my café",
      keteId: 'auaha', keteName: 'AUAHA', keteAccent: '#B794F4',
      agentId: 'prism', agentName: 'PRISM', specialisation: 'Brand DNA & Visual Identity',
      confidence: 94,
      reasoning: ['Intent: design', 'Match: visual specialisation', 'Performance: 94%'],
      matchedIntents: ['design', 'creative'],
      alternatives: [
        { agentId: 'pixel', agentName: 'PIXEL', keteId: 'auaha', keteName: 'AUAHA', keteAccent: '#B794F4', confidence: 82, reason: 'Image Generation & Editing' },
        { agentId: 'chromatic', agentName: 'CHROMATIC', keteId: 'auaha', keteName: 'AUAHA', keteAccent: '#B794F4', confidence: 76, reason: 'Colour & Aesthetic Design' },
      ],
    },
  },
  {
    query: "Set up payroll for 12 staff",
    result: {
      query: "Set up payroll for 12 staff",
      keteId: 'pakihi', keteName: 'PAKIHI', keteAccent: '#4AA5A8',
      agentId: 'vault', agentName: 'VAULT', specialisation: 'Payroll & Compliance',
      confidence: 91,
      reasoning: ['Intent: finance', 'Match: payroll specialisation', 'Performance: 94%'],
      matchedIntents: ['finance', 'hr'],
      alternatives: [
        { agentId: 'aroha', agentName: 'AROHA', keteId: 'shared', keteName: 'SHARED CORE', keteAccent: '#4AA5A8', confidence: 85, reason: 'People & Culture' },
        { agentId: 'grove', agentName: 'GROVE', keteId: 'pakihi', keteName: 'PAKIHI', keteAccent: '#4AA5A8', confidence: 68, reason: 'HR & Recruitment' },
      ],
    },
  },
  {
    query: "Plan a site safety audit",
    result: {
      query: "Plan a site safety audit",
      keteId: 'waihanga', keteName: 'WAIHANGA', keteAccent: '#3A7D6E',
      agentId: 'arai', agentName: 'ĀRAI', specialisation: 'Health & Safety',
      confidence: 97,
      reasoning: ['Intent: compliance', 'Match: H&S specialisation', 'Performance: 97%'],
      matchedIntents: ['compliance', 'construction'],
      alternatives: [
        { agentId: 'kaupapa', agentName: 'KAUPAPA', keteId: 'waihanga', keteName: 'WAIHANGA', keteAccent: '#3A7D6E', confidence: 79, reason: 'Project Management' },
        { agentId: 'vitals', agentName: 'VITALS', keteId: 'hauora', keteName: 'HAUORA', keteAccent: '#7BC8A4', confidence: 62, reason: 'Health Monitoring' },
      ],
    },
  },
  {
    query: "Create social media content",
    result: {
      query: "Create social media content",
      keteId: 'auaha', keteName: 'AUAHA', keteAccent: '#B794F4',
      agentId: 'market', agentName: 'MARKET', specialisation: 'Paid Advertising',
      confidence: 88,
      reasoning: ['Intent: marketing', 'Match: advertising specialisation', 'Performance: 88%'],
      matchedIntents: ['marketing', 'creative'],
      alternatives: [
        { agentId: 'muse', agentName: 'MUSE', keteId: 'auaha', keteName: 'AUAHA', keteAccent: '#B794F4', confidence: 81, reason: 'Copywriting & Content' },
        { agentId: 'radiance', agentName: 'RADIANCE', keteId: 'hauora', keteName: 'HAUORA', keteAccent: '#7BC8A4', confidence: 72, reason: 'Beauty & Self-Care' },
      ],
    },
  },
  {
    query: "Plan a whānau reunion",
    result: {
      query: "Plan a whānau reunion",
      keteId: 'toroa', keteName: 'TORO', keteAccent: '#E8D5B7',
      agentId: 'toroa', agentName: 'TORO', specialisation: 'Family AI Navigator',
      confidence: 95,
      reasoning: ['Intent: family', 'Match: whānau specialisation', 'Performance: 95%'],
      matchedIntents: ['family'],
      alternatives: [
        { agentId: 'whanau-reo', agentName: 'WHĀNAU', keteId: 'te-kahui-reo', keteName: 'TE KĀHUI REO', keteAccent: '#4AA5A8', confidence: 78, reason: 'Whānau & Iwi' },
        { agentId: 'kura', agentName: 'KURA', keteId: 'manaaki', keteName: 'MANAAKI', keteAccent: '#E8A87C', confidence: 65, reason: 'Events & Functions' },
      ],
    },
  },
];
