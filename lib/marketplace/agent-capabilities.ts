import type { PublicMarketplaceAgent } from './agents';
import { CATEGORY_LABELS } from './agents';
import { isVoiceAgent } from '@/lib/voice/agent-voice';

/**
 * Pick-and-mix capability layer — metadata keyed by existing agent slug.
 *
 * This is NOT a second registry. lib/marketplace/agents.ts stays the single
 * source of truth for who an agent is; this file only describes what an agent
 * can be configured to do — which channels it can live on, what knowledge it
 * can be grounded in, which business actions it could take through the
 * connector layer, and how it should be packaged.
 *
 * Honesty contract (matches the runtime's own trust rules):
 *   - a capability listed here means "can be configured", never "is live";
 *   - anything that would take a real-world action is connector-gated and
 *     human-approved (drafts only — the same draft-mode the chat enforces);
 *   - `recommendedTier` maps to the LIVE pricing ladder (individual /
 *     operator / enterprise / outcome). No parallel package names, no
 *     invented prices.
 */

export type AgentChannel =
  | 'chat' // /agents/[slug]/chat — live today for every live agent
  | 'voice_ready' // voice pipeline exists, enabled per-pilot (flag off by default)
  | 'web_widget' // embeddable site widget — configured per pilot
  | 'shareable_link' // /agents/[slug] + /for/[slug] magic links — live today
  | 'pwa_mini_app' // installable chat (per-agent manifest + icons) — live today
  | 'phone_ready' // phone number via provider setup — pilot scope
  | 'sms_ready' // SMS via provider setup — pilot scope
  | 'email'; // per-agent mailbox — scaffolded, external go-live pending

export type AgentKnowledgeCapability =
  | 'business_profile'
  | 'faqs'
  | 'uploaded_files'
  | 'website_text'
  | 'policies'
  | 'pricing'
  | 'locations'
  | 'tone_of_voice'
  | 'supabase_knowledge' // grounded in assembl's NZ knowledge base (live)
  | 'tier_a_sources' // cites live official sources w/ retrieval dates (live)
  | 'manual_setup'; // knowledge shaped with the assembl team during a pilot

export type AgentToolCapability =
  | 'send_email'
  | 'create_lead'
  | 'add_sheet_row'
  | 'book_calendar'
  | 'create_task'
  | 'send_sms'
  | 'human_handoff'
  | 'webhook'
  | 'connector_ready'
  | 'mcp_ready_later';

export type AgentDeploymentOption =
  | 'marketplace'
  | 'agent_chat'
  | 'website_widget'
  | 'shareable_link'
  | 'mini_app'
  | 'voice_agent'
  | 'phone_agent'
  | 'admin_console';

/** Maps to the live ladder — never a parallel package name. */
export type RecommendedTier = 'individual' | 'operator' | 'enterprise' | 'outcome';

export type AgentCapabilityProfile = {
  slug: string;
  channels: AgentChannel[];
  knowledge: AgentKnowledgeCapability[];
  tools: AgentToolCapability[];
  deployment: AgentDeploymentOption[];
  /** Always true — a named person approves before anything ships. */
  humanReviewRequired: boolean;
  pilotReady: boolean;
  voiceReady: boolean;
  bestFor: string[];
  setupComplexity: 'low' | 'medium' | 'high';
  recommendedTier: RecommendedTier;
};

/** Channels every LIVE agent genuinely has today. */
const LIVE_CHANNELS: AgentChannel[] = ['chat', 'shareable_link', 'pwa_mini_app'];
const LIVE_DEPLOYMENT: AgentDeploymentOption[] = ['marketplace', 'agent_chat', 'shareable_link', 'mini_app'];

/**
 * Curated first batch — richer profiles for the agents most likely to anchor
 * a pilot conversation. Everything not listed falls back to safe defaults.
 */
const CURATED: Record<string, Partial<AgentCapabilityProfile>> = {
  echo: {
    channels: [...LIVE_CHANNELS, 'web_widget'],
    knowledge: ['business_profile', 'faqs', 'website_text', 'tone_of_voice', 'manual_setup'],
    tools: ['create_lead', 'human_handoff', 'connector_ready'],
    deployment: [...LIVE_DEPLOYMENT, 'website_widget'],
    bestFor: ['website visitors answered', 'leads captured, not lost', 'after-hours questions'],
    setupComplexity: 'low',
  },
  front: {
    channels: [...LIVE_CHANNELS, 'voice_ready', 'phone_ready', 'sms_ready'],
    knowledge: ['business_profile', 'faqs', 'locations', 'pricing', 'manual_setup'],
    tools: ['create_lead', 'book_calendar', 'send_sms', 'human_handoff', 'connector_ready'],
    deployment: [...LIVE_DEPLOYMENT, 'voice_agent', 'phone_agent'],
    voiceReady: true,
    bestFor: ['after-hours phones answered', 'callers qualified and summarised', 'warm handoff to a person'],
    setupComplexity: 'high',
    recommendedTier: 'outcome',
  },
  atlas: {
    knowledge: ['business_profile', 'manual_setup'],
    tools: ['create_task', 'human_handoff'],
    bestFor: ['AI-readiness check', 'first-agent picking', 'team adoption'],
    setupComplexity: 'low',
    recommendedTier: 'individual',
  },
  hui: {
    knowledge: ['business_profile', 'tone_of_voice', 'manual_setup'],
    tools: ['send_email', 'create_task', 'human_handoff', 'connector_ready'],
    bestFor: ['meetings minuted', 'actions captured', 'evidence packs kept'],
    setupComplexity: 'low',
  },
  sweep: {
    channels: [...LIVE_CHANNELS, 'email'],
    knowledge: ['tone_of_voice', 'policies', 'manual_setup'],
    tools: ['send_email', 'create_task', 'human_handoff', 'connector_ready'],
    bestFor: ['inbox triaged into reply-now / later / never'],
    setupComplexity: 'medium',
  },
  roster: {
    knowledge: ['business_profile', 'uploaded_files', 'manual_setup'],
    tools: ['create_lead', 'create_task', 'add_sheet_row', 'human_handoff', 'connector_ready'],
    bestFor: ['CRM kept current', 'follow-ups drafted', 'cold leads flagged'],
    setupComplexity: 'medium',
  },
  counter: {
    knowledge: ['business_profile', 'pricing', 'locations', 'manual_setup'],
    tools: ['add_sheet_row', 'create_task', 'human_handoff', 'connector_ready'],
    bestFor: ['retail ops in one place', 'POS and reorder questions answered'],
    setupComplexity: 'medium',
  },
  arai: {
    knowledge: ['supabase_knowledge', 'tier_a_sources', 'policies', 'uploaded_files'],
    tools: ['create_task', 'webhook', 'human_handoff', 'connector_ready'],
    bestFor: ['site safety under HSWA 2015', 'risk registers drafted', 'WorkSafe calls made correctly'],
    setupComplexity: 'medium',
    recommendedTier: 'operator',
  },
  keeper: {
    knowledge: ['supabase_knowledge', 'business_profile', 'uploaded_files', 'manual_setup'],
    tools: ['create_task', 'human_handoff', 'connector_ready'],
    bestFor: ['animal records drafted', 'welfare notes kept', 'the right specialist found'],
    setupComplexity: 'medium',
    recommendedTier: 'operator',
  },
  pilot: {
    knowledge: ['business_profile', 'manual_setup'],
    tools: ['create_task', 'human_handoff'],
    bestFor: ['your own agent, built step by step'],
    setupComplexity: 'low',
    recommendedTier: 'individual',
  },
  arataki: {
    knowledge: ['supabase_knowledge', 'business_profile', 'uploaded_files', 'policies'],
    tools: ['send_email', 'create_lead', 'create_task', 'book_calendar', 'human_handoff', 'connector_ready'],
    bestFor: ['dealership run end to end', 'WOF and service reminders drafted'],
    setupComplexity: 'high',
    recommendedTier: 'operator',
  },
  pikau: {
    knowledge: ['supabase_knowledge', 'tier_a_sources', 'uploaded_files'],
    tools: ['create_task', 'webhook', 'human_handoff', 'connector_ready'],
    bestFor: ['import entries drafted for a licensed broker', 'tariff questions cited'],
    setupComplexity: 'high',
    recommendedTier: 'operator',
  },
  aroha: {
    knowledge: ['supabase_knowledge', 'tier_a_sources', 'policies'],
    tools: ['create_task', 'human_handoff'],
    bestFor: ['NZ employment law answers, cited', 'HR letters drafted for review'],
    setupComplexity: 'low',
  },
  quill: {
    knowledge: ['uploaded_files', 'manual_setup'],
    tools: ['create_task', 'human_handoff'],
    bestFor: ['clinical notes written while you stay with the patient'],
    setupComplexity: 'medium',
    recommendedTier: 'operator',
  },
  'social-manager': {
    knowledge: ['business_profile', 'tone_of_voice', 'website_text', 'manual_setup'],
    tools: ['create_task', 'human_handoff', 'connector_ready'],
    bestFor: ['a month of posts drafted in your voice', 'comments triaged'],
    setupComplexity: 'low',
  },
};

/** The live ladder, from the agent's own price tier — no parallel packages. */
function defaultTier(agent: PublicMarketplaceAgent): RecommendedTier {
  if (agent.vertical) return 'operator'; // verticals ship via all-access ($250)
  if (agent.priceTier === 'business') return 'operator';
  return 'individual';
}

/**
 * Capability profile for any agent — curated batch merged over safe defaults
 * derived from the registry, so every one of the 59 agents renders honestly
 * without hand-written metadata.
 */
export function capabilityProfileFor(agent: PublicMarketplaceAgent): AgentCapabilityProfile {
  const grounded = agent.nzKnowledge.length > 0;
  const defaults: AgentCapabilityProfile = {
    slug: agent.slug,
    channels: agent.status === 'live' ? LIVE_CHANNELS : ['chat'],
    knowledge: grounded ? ['supabase_knowledge', 'tier_a_sources'] : ['manual_setup'],
    tools: ['human_handoff', 'connector_ready'],
    deployment: agent.status === 'live' ? LIVE_DEPLOYMENT : ['marketplace'],
    humanReviewRequired: true,
    pilotReady: agent.status === 'live',
    voiceReady: isVoiceAgent(agent.slug),
    bestFor: [CATEGORY_LABELS[agent.category].toLowerCase()],
    setupComplexity: agent.vertical ? 'high' : agent.bundle ? 'medium' : 'low',
    recommendedTier: defaultTier(agent),
  };
  const curated = CURATED[agent.slug];
  return curated ? { ...defaults, ...curated, slug: agent.slug, humanReviewRequired: true } : defaults;
}

/** Customer-facing badge labels — the honest vocabulary, nothing else. */
export const CAPABILITY_BADGES = {
  voice: 'voice-ready',
  connector: 'connector-ready',
  knowledge: 'knowledge-backed',
  miniApp: 'mini app',
  pilot: 'pilot-ready',
  humanReview: 'human-reviewed',
} as const;

export const TIER_LABELS: Record<RecommendedTier, string> = {
  individual: 'individual — $9.99 an agent',
  operator: 'operator — collections from $49',
  enterprise: 'enterprise — custom',
  outcome: 'outcome — pilot from $5,000',
};
