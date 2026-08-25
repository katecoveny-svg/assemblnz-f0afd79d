export const OPPORTUNITY_LIFECYCLE = [
  { key: 'POLICY_PROPOSED', label: 'Policy proposed' },
  { key: 'CABINET_DECIDED', label: 'Cabinet decides' },
  { key: 'MONEY_ALLOCATED', label: 'Money allocated' },
  { key: 'DELIVERY_OBLIGATION', label: 'Delivery obligation' },
  { key: 'PROCUREMENT_FORECAST', label: 'Procurement forecast' },
  { key: 'MARKET_ENGAGEMENT', label: 'Market engagement' },
  { key: 'RFX_OPEN', label: 'RFx open' },
  { key: 'AWARD', label: 'Award' },
  { key: 'CUSTOMER_JOURNEY_CHANGE', label: 'Customer journey changes' },
] as const;

export type OpportunityStage = (typeof OPPORTUNITY_LIFECYCLE)[number]['key'];
export type AuthorityTier = 'A' | 'B' | 'C' | 'D';
export type OpportunityUrgency = 'ACT_THIS_WEEK' | 'ACT_THIS_MONTH' | 'WATCH' | 'WINDOW_PASSED';

type JsonObject = Record<string, unknown>;

export type OpportunitySourceContext = {
  id: string;
  name: string;
  url: string;
  category: string;
  authorityTier: number;
  authorityWeight: number;
  provenance: string | null;
  status: string | null;
  lastCheckedAt: string | null;
  config: JsonObject | null;
};

export type OpportunityDocumentContext = {
  id: string;
  title: string;
  url: string | null;
  content: string;
  publishedAt: string | null;
  insertedAt: string;
  metadata: JsonObject | null;
};

export type OpportunityScoreComponent = {
  label: string;
  points: number;
};

export type OpportunityHorizonItem = {
  id: string;
  title: string;
  url: string | null;
  excerpt: string;
  stage: OpportunityStage;
  stageLabel: string;
  stageIndex: number;
  sourceClass: string;
  sourceName: string;
  sourceUrl: string;
  publisherOrg: string | null;
  buyerOrg: string | null;
  authorityTier: AuthorityTier;
  authorityLabel: string;
  confidence: number;
  commercialOpening: string;
  likelyRoute: string;
  urgency: OpportunityUrgency;
  urgencyReason: string;
  likelyToSayYesQuickly: number;
  scoreBreakdown: OpportunityScoreComponent[];
  publishedAt: string | null;
  detectedAt: string;
  deadlineAt: string | null;
  evidence: Array<{
    title: string;
    url: string | null;
    publisher: string | null;
    sourceName: string;
    authorityTier: AuthorityTier;
    publishedAt: string | null;
    detectedAt: string;
  }>;
  limitations: string[];
};

const STAGE_OPENING: Record<OpportunityStage, string> = {
  POLICY_PROPOSED: 'Map the affected customer journey and test a bounded wait before requirements harden.',
  CABINET_DECIDED: 'Turn the decision into an implementation-ready customer journey and evidence plan.',
  MONEY_ALLOCATED: 'Approach the funded organisation with a scoped journey sprint tied to the funded outcome.',
  DELIVERY_OBLIGATION: 'Prototype the participant journey, human handoff and evidence pack before delivery design settles.',
  PROCUREMENT_FORECAST: 'Seek early market engagement before the RFx specification hardens.',
  MARKET_ENGAGEMENT: 'Bring a concrete journey map, demonstrator and measurable pilot boundary into market engagement.',
  RFX_OPEN: 'Qualify the formal requirement and pursue only where a focused pilot or partner role still fits.',
  AWARD: 'Approach the appointed provider only where implementation or customer-journey work remains open.',
  CUSTOMER_JOURNEY_CHANGE: 'Offer a bounded redesign of the affected wait, human handoff and proof layer.',
};

const STAGE_ROUTE: Record<OpportunityStage, string> = {
  POLICY_PROPOSED: 'policy discovery or consultation response',
  CABINET_DECIDED: 'direct implementation discovery',
  MONEY_ALLOCATED: 'direct funded-programme discovery',
  DELIVERY_OBLIGATION: 'provider or commissioning-team pilot',
  PROCUREMENT_FORECAST: 'early market engagement, then formal procurement',
  MARKET_ENGAGEMENT: 'RFI, ROI or supplier briefing',
  RFX_OPEN: 'formal RFx or delivery partner',
  AWARD: 'appointed supplier or implementation partner',
  CUSTOMER_JOURNEY_CHANGE: 'direct customer-journey sprint',
};

const STAGE_POINTS: Record<OpportunityStage, number> = {
  POLICY_PROPOSED: 1.1,
  CABINET_DECIDED: 1.8,
  MONEY_ALLOCATED: 2.3,
  DELIVERY_OBLIGATION: 2.5,
  PROCUREMENT_FORECAST: 2.7,
  MARKET_ENGAGEMENT: 2.8,
  RFX_OPEN: 2.0,
  AWARD: 1.1,
  CUSTOMER_JOURNEY_CHANGE: 1.8,
};

const AUTHORITY: Record<number, { tier: AuthorityTier; label: string; confidence: number; points: number }> = {
  1: { tier: 'A', label: 'primary official record', confidence: 0.96, points: 1.3 },
  2: { tier: 'B', label: 'official agency or regulator', confidence: 0.88, points: 1.1 },
  3: { tier: 'C', label: 'market or issuer record', confidence: 0.72, points: 0.65 },
  4: { tier: 'D', label: 'indicative signal requiring corroboration', confidence: 0.54, points: 0.3 },
};

const JOURNEY_PATTERNS = [
  /\b(customer|consumer|client|participant|applicant|whānau|family|household)\b/i,
  /\b(application|assessment|claim|eligibility|referral|booking|order|delivery|complaint)\b/i,
  /\b(service|support|provider|handoff|contact centre|self-service|portal|case management)\b/i,
  /\b(digital|platform|data sharing|automation|operating model|transformation)\b/i,
  /\b(pilot|prototype|trial|implementation|programme|rollout)\b/i,
];

function objectValue(value: unknown): JsonObject {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {};
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
}

function opportunityMetadata(source: OpportunitySourceContext, document: OpportunityDocumentContext): JsonObject {
  const sourceOpportunity = objectValue(objectValue(source.config).opportunity);
  const documentOpportunity = objectValue(objectValue(document.metadata).opportunity);
  return { ...sourceOpportunity, ...documentOpportunity };
}

function isStage(value: unknown): value is OpportunityStage {
  return OPPORTUNITY_LIFECYCLE.some((stage) => stage.key === value);
}

export function inferOpportunityStage(corpus: string, fallback: OpportunityStage): OpportunityStage {
  if (/\b(future procurement opportunit(?:y|ies)|\bFPO\b|advance notice of procurement)\b/i.test(corpus)) {
    return 'PROCUREMENT_FORECAST';
  }
  if (/\b(contract|supplier|provider|tender)\s+(?:has been\s+)?awarded\b|\bpreferred supplier\b/i.test(corpus)) {
    return 'AWARD';
  }
  if (/\b(request for information|request for registration of interest|market engagement|supplier briefing|\bRFI\b|\bROI\b)\b/i.test(corpus)) {
    return 'MARKET_ENGAGEMENT';
  }
  if (/\b(request for proposal|request for tender|request for quote|\bRFP\b|\bRFT\b|\bRFQ\b|\bRFx\b)\b/i.test(corpus)) {
    return 'RFX_OPEN';
  }
  if (/\b(funded provider|commissioned service|delivery obligation|contracted to deliver)\b/i.test(corpus)) {
    return 'DELIVERY_OBLIGATION';
  }
  if (/\b(appropriation|budget initiative|funding (?:has been |is )?allocated|investment of NZ?\$)\b/i.test(corpus)) {
    return 'MONEY_ALLOCATED';
  }
  if (/\b(cabinet (?:agreed|decided|minute|decision)|approved by cabinet)\b/i.test(corpus)) {
    return 'CABINET_DECIDED';
  }
  if (/\b(regulatory analysis summary|regulatory impact statement|consultation|proposed policy)\b/i.test(corpus)) {
    return 'POLICY_PROPOSED';
  }
  return fallback;
}

function labelledBuyer(corpus: string): string | null {
  const match = corpus.match(
    /\b(?:organisation|purchasing agency|buyer organisation)\s*:?\s*([A-Z][A-Za-zĀ-ž0-9&'().,\- ]{2,100}?)(?=\s+(?:Tender|Close|Open|RFx|Reference|Project|$))/i,
  );
  return match?.[1]?.replace(/\s+/g, ' ').trim() ?? null;
}

function extractDeadline(corpus: string, now: Date): Date | null {
  const matches = corpus.match(/\b\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+20\d{2}\b/gi) ?? [];
  const dates = matches
    .map((value) => new Date(value))
    .filter((value) => Number.isFinite(value.getTime()))
    .sort((a, b) => Math.abs(a.getTime() - now.getTime()) - Math.abs(b.getTime() - now.getTime()));
  return dates[0] ?? null;
}

function urgencyFor(stage: OpportunityStage, deadline: Date | null, now: Date): {
  urgency: OpportunityUrgency;
  reason: string;
  points: number;
} {
  if (deadline) {
    const days = Math.ceil((deadline.getTime() - now.getTime()) / 86_400_000);
    if (days < 0) return { urgency: 'WINDOW_PASSED', reason: `stated date passed ${Math.abs(days)} days ago`, points: 0 };
    if (days <= 14) return { urgency: 'ACT_THIS_WEEK', reason: `stated date is ${days} days away`, points: 1 };
    if (days <= 45) return { urgency: 'ACT_THIS_MONTH', reason: `stated date is ${days} days away`, points: 0.8 };
  }
  if (stage === 'PROCUREMENT_FORECAST' || stage === 'MARKET_ENGAGEMENT') {
    return { urgency: 'ACT_THIS_WEEK', reason: 'the useful pre-specification window is open', points: 0.9 };
  }
  if (stage === 'MONEY_ALLOCATED' || stage === 'DELIVERY_OBLIGATION' || stage === 'CABINET_DECIDED') {
    return { urgency: 'ACT_THIS_MONTH', reason: 'implementation design is likely forming now', points: 0.7 };
  }
  if (stage === 'RFX_OPEN') {
    return { urgency: 'ACT_THIS_WEEK', reason: 'a formal response window may already be running', points: 0.8 };
  }
  return { urgency: 'WATCH', reason: 'corroborate the signal and watch for the next lifecycle event', points: 0.35 };
}

function excerptFor(content: string, query?: string): string {
  const plain = content.replace(/[#*_`>\[\]()]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!plain) return '';
  const needle = query?.trim().toLowerCase();
  const index = needle ? plain.toLowerCase().indexOf(needle) : -1;
  const start = index > 100 ? index - 100 : 0;
  const excerpt = plain.slice(start, start + 320).trim();
  return `${start > 0 ? '…' : ''}${excerpt}${start + 320 < plain.length ? '…' : ''}`;
}

export function shouldIncludeOpportunity(
  source: OpportunitySourceContext,
  document: OpportunityDocumentContext,
): boolean {
  const metadata = opportunityMetadata(source, document);
  if (!stringValue(metadata.source_class)) return false;
  const keywords = stringArray(metadata.include_keywords);
  if (!keywords.length) return true;
  const corpus = `${document.title}\n${document.content}`.toLowerCase();
  return keywords.some((keyword) => corpus.includes(keyword.toLowerCase()));
}

export function normalizeOpportunity(args: {
  source: OpportunitySourceContext;
  document: OpportunityDocumentContext;
  query?: string;
  now?: Date;
}): OpportunityHorizonItem {
  const { source, document, query } = args;
  const now = args.now ?? new Date();
  const metadata = opportunityMetadata(source, document);
  const configuredStage = isStage(metadata.default_stage) ? metadata.default_stage : 'POLICY_PROPOSED';
  const corpus = `${document.title}\n${document.content}`;
  const stage = inferOpportunityStage(corpus, configuredStage);
  const stageIndex = OPPORTUNITY_LIFECYCLE.findIndex((item) => item.key === stage);
  const authority = AUTHORITY[source.authorityTier] ?? AUTHORITY[4];
  const extractionScope = stringValue(metadata.extraction_scope) ?? 'item';
  const explicitBuyer = stringValue(metadata.buyer_org);
  const buyerOrg = explicitBuyer ?? (extractionScope === 'item' ? labelledBuyer(corpus) : null);
  const publisherOrg = stringValue(metadata.publisher_org);
  const deadline = extractDeadline(corpus, now);
  const urgency = urgencyFor(stage, deadline, now);
  const journeyMatches = JOURNEY_PATTERNS.filter((pattern) => pattern.test(corpus)).length;
  const journeyPoints = Math.min(2.2, journeyMatches * 0.5);
  const routePoints = ['PROCUREMENT_FORECAST', 'MARKET_ENGAGEMENT', 'DELIVERY_OBLIGATION'].includes(stage)
    ? 1.1
    : ['CABINET_DECIDED', 'MONEY_ALLOCATED', 'CUSTOMER_JOURNEY_CHANGE'].includes(stage) ? 0.8 : 0.45;
  const detected = new Date(document.insertedAt);
  const ageDays = Number.isFinite(detected.getTime()) ? (now.getTime() - detected.getTime()) / 86_400_000 : 999;
  const freshnessPoints = ageDays <= 30 ? 0.6 : ageDays <= 120 ? 0.35 : 0.1;
  const buyerPoints = buyerOrg ? 0.8 : 0;
  const components: OpportunityScoreComponent[] = [
    { label: 'lifecycle timing', points: STAGE_POINTS[stage] },
    { label: 'source authority', points: authority.points },
    { label: 'customer-journey evidence', points: journeyPoints },
    { label: 'route openness', points: routePoints },
    { label: 'urgency', points: urgency.points },
    { label: 'named buyer or organisation', points: buyerPoints },
    { label: 'signal recency', points: freshnessPoints },
  ];
  const score = Math.min(10, components.reduce((sum, component) => sum + component.points, 0));
  const confidencePenalty = (extractionScope === 'listing_page' ? 0.07 : 0) + (source.status === 'error' ? 0.08 : 0);
  const confidence = Math.max(0.35, Math.min(0.99, authority.confidence - confidencePenalty + (explicitBuyer ? 0.02 : 0)));
  const limitations: string[] = [];
  if (extractionScope === 'listing_page') limitations.push('Listing-level signal; inspect the linked primary record before outreach.');
  if (!buyerOrg) limitations.push('No buyer is named in the extracted evidence.');
  if (source.authorityTier >= 3) limitations.push('Commercial interpretation is an inference and needs corroboration.');
  if (source.status === 'error') limitations.push('The latest scheduled source check failed; this evidence may be stale.');

  return {
    id: document.id,
    title: document.title,
    url: document.url,
    excerpt: excerptFor(document.content, query),
    stage,
    stageLabel: OPPORTUNITY_LIFECYCLE[stageIndex]?.label ?? stage,
    stageIndex,
    sourceClass: stringValue(metadata.source_class) ?? 'unknown',
    sourceName: source.name,
    sourceUrl: source.url,
    publisherOrg,
    buyerOrg,
    authorityTier: authority.tier,
    authorityLabel: authority.label,
    confidence: Number(confidence.toFixed(2)),
    commercialOpening: stringValue(metadata.commercial_opening) ?? STAGE_OPENING[stage],
    likelyRoute: stringValue(metadata.likely_route) ?? STAGE_ROUTE[stage],
    urgency: urgency.urgency,
    urgencyReason: urgency.reason,
    likelyToSayYesQuickly: Number(score.toFixed(1)),
    scoreBreakdown: components.map((component) => ({ ...component, points: Number(component.points.toFixed(2)) })),
    publishedAt: document.publishedAt,
    detectedAt: document.insertedAt,
    deadlineAt: deadline?.toISOString() ?? null,
    evidence: [{
      title: document.title,
      url: document.url,
      publisher: publisherOrg,
      sourceName: source.name,
      authorityTier: authority.tier,
      publishedAt: document.publishedAt,
      detectedAt: document.insertedAt,
    }],
    limitations,
  };
}

export function sortOpportunities(items: OpportunityHorizonItem[]): OpportunityHorizonItem[] {
  return [...items].sort((a, b) => {
    return b.likelyToSayYesQuickly - a.likelyToSayYesQuickly ||
      (Date.parse(b.publishedAt ?? b.detectedAt) || 0) - (Date.parse(a.publishedAt ?? a.detectedAt) || 0);
  });
}
