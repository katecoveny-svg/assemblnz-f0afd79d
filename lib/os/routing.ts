/**
 * Model & Capability Router — which intelligence for which piece of work.
 *
 * (Kate's routing brief, 2026-07-13.) Every task declares TaskRequirements;
 * the router picks a ladder of models by considering capability fit, tenant
 * policy, privacy ceiling, latency and quality preference, price, provider
 * availability, MEASURED performance on real Assembl workflows
 * (model_workflow_stats — never published benchmarks alone), and previous
 * failure rates. Experimental providers are excluded from production
 * ladders until the evals show them beating a production model on that
 * specific workflow.
 *
 * Pure logic — stats and failure rates are injected, so routing decisions
 * are deterministic and unit-testable. The live wrapper that loads
 * measurements is lib/os/routing-live.ts.
 */

export type TaskCapability =
  | 'reasoning'
  | 'coding'
  | 'vision'
  | 'realtime_voice'
  | 'long_context'
  | 'tool_use'
  | 'browser_use'
  | 'structured_output'
  | 'media_generation';

export type TaskRequirements = {
  capabilities: TaskCapability[];
  riskLevel: 'low' | 'medium' | 'high';
  latencyPreference: 'realtime' | 'fast' | 'standard' | 'background';
  qualityPreference: 'economy' | 'balanced' | 'maximum';
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  estimatedValue: 'low' | 'medium' | 'high';
  requiresIndependentVerification: boolean;
};

const CLASSIFICATION_RANK = { public: 0, internal: 1, confidential: 2, restricted: 3 } as const;
const LATENCY_RANK = { realtime: 0, fast: 1, standard: 2 } as const;

export type ModelCandidate = {
  id: string;
  provider: 'anthropic' | 'openai' | 'google' | 'groq' | 'xai' | 'ollama';
  label: string;
  capabilities: TaskCapability[];
  /** Fastest tier this model comfortably serves. */
  latency: keyof typeof LATENCY_RANK;
  /** Intrinsic quality tier 1–5 — a prior only; measurements outrank it. */
  quality: 1 | 2 | 3 | 4 | 5;
  /** Rough blended NZD per 1M tokens — a prior for cost scoring. */
  costPerMTokensNzd: number;
  /** Highest data classification this provider may see under our terms. */
  maxDataClassification: keyof typeof CLASSIFICATION_RANK;
  status: 'production' | 'fallback' | 'experimental';
  /** Env var(s) whose presence makes the provider available. */
  envKeys: string[];
};

const CORE: TaskCapability[] = ['reasoning', 'long_context', 'tool_use', 'structured_output'];

/** The candidate registry. Adding a provider = one entry here plus a rung
 *  builder in lib/ai/router.ts — no provider code anywhere else. */
export const MODEL_CANDIDATES: readonly ModelCandidate[] = [
  {
    id: 'claude-sonnet-5',
    provider: 'anthropic',
    label: 'Claude Sonnet 5',
    capabilities: [...CORE, 'coding', 'vision'],
    latency: 'fast',
    quality: 5,
    costPerMTokensNzd: 12,
    maxDataClassification: 'restricted',
    status: 'production',
    envKeys: ['ANTHROPIC_API_KEY'],
  },
  {
    id: 'claude-opus-4-8',
    provider: 'anthropic',
    label: 'Claude Opus 4.8 (selective)',
    capabilities: [...CORE, 'coding', 'vision'],
    latency: 'standard',
    quality: 5,
    costPerMTokensNzd: 45,
    maxDataClassification: 'restricted',
    status: 'production',
    envKeys: ['ANTHROPIC_API_KEY'],
  },
  {
    id: 'claude-sonnet-4-6',
    provider: 'anthropic',
    label: 'Claude Sonnet 4.6',
    capabilities: [...CORE, 'coding', 'vision'],
    latency: 'fast',
    quality: 4,
    costPerMTokensNzd: 9,
    maxDataClassification: 'restricted',
    status: 'production',
    envKeys: ['ANTHROPIC_API_KEY'],
  },
  {
    id: 'gpt-5.6-terra',
    provider: 'openai',
    label: 'GPT-5.6 Terra (second production provider)',
    capabilities: [...CORE, 'coding', 'vision'],
    latency: 'fast',
    quality: 4,
    costPerMTokensNzd: 11,
    maxDataClassification: 'confidential',
    status: 'production',
    envKeys: ['OPENAI_API_KEY'],
  },
  {
    id: 'gemini-3.5-flash',
    provider: 'google',
    label: 'Gemini 3.5 Flash (Workspace + media)',
    capabilities: [...CORE, 'vision', 'media_generation'],
    latency: 'fast',
    quality: 3,
    costPerMTokensNzd: 2,
    maxDataClassification: 'internal',
    status: 'production',
    envKeys: ['GEMINI_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY'],
  },
  {
    id: 'gpt-live',
    provider: 'openai',
    label: 'GPT-Live (spoken Chief of Staff prototype)',
    capabilities: ['reasoning', 'realtime_voice', 'tool_use'],
    latency: 'realtime',
    quality: 3,
    costPerMTokensNzd: 20,
    maxDataClassification: 'internal',
    status: 'experimental',
    envKeys: ['OPENAI_API_KEY'],
  },
  {
    id: 'grok-4',
    provider: 'xai',
    label: 'Grok (experimental until it wins a workflow)',
    capabilities: [...CORE],
    latency: 'fast',
    quality: 3,
    costPerMTokensNzd: 8,
    maxDataClassification: 'internal',
    status: 'experimental',
    envKeys: ['XAI_API_KEY'],
  },
  {
    id: 'groq:llama-3.3-70b-versatile',
    provider: 'groq',
    label: 'Groq Llama 3.3 (availability fallback)',
    capabilities: ['reasoning', 'tool_use', 'structured_output'],
    latency: 'realtime',
    quality: 2,
    costPerMTokensNzd: 1.5,
    maxDataClassification: 'internal',
    status: 'fallback',
    envKeys: ['GROQ_API_KEY'],
  },
  {
    id: 'ollama:llama3.3',
    provider: 'ollama',
    label: 'Local Llama (last-resort fallback)',
    capabilities: ['reasoning', 'structured_output'],
    latency: 'standard',
    quality: 1,
    costPerMTokensNzd: 0,
    maxDataClassification: 'restricted',
    status: 'fallback',
    envKeys: ['OLLAMA_BASE_URL'],
  },
] as const;

/** Measured performance on ONE Assembl workflow (from model_workflow_stats). */
export type WorkflowStat = {
  model: string;
  workflow: string;
  accuracy: number; // 0..1
  toolSuccess: number | null; // 0..1
  hallucinationRate: number | null; // 0..1 (lower is better)
  avgLatencyMs: number | null;
  avgCostNzd: number | null;
};

export type TenantModelPolicy = {
  /** Providers this tenant permits. Absent = all. */
  allowedProviders?: ModelCandidate['provider'][];
};

export type RouteInput = {
  requirements: TaskRequirements;
  /** The Assembl workflow key, e.g. 'enquiry-reply' — joins the eval stats. */
  workflow?: string;
  stats?: WorkflowStat[];
  /** model id → recent failure ratio 0..1 (from model_calls). */
  failureRates?: Record<string, number>;
  tenantPolicy?: TenantModelPolicy;
  /** Availability probe — injected for tests; defaults to env presence. */
  isAvailable?: (candidate: ModelCandidate) => boolean;
};

export type RouteDecision = {
  /** Ordered ladder of model ids: primary first, then fallbacks. */
  ladder: string[];
  /** Why, in human words, one line per considered candidate. */
  rationale: string[];
};

function envAvailable(c: ModelCandidate): boolean {
  return c.envKeys.some((k) => Boolean(process.env[k] && String(process.env[k]).length > 0));
}

export function routeModel(input: RouteInput): RouteDecision {
  const { requirements: req } = input;
  const isAvailable = input.isAvailable ?? envAvailable;
  const statFor = (id: string) =>
    input.stats?.find((s) => s.model === id && (!input.workflow || s.workflow === input.workflow));
  const rationale: string[] = [];

  const scored = MODEL_CANDIDATES.filter((c) => {
    // Hard filters — never scored around.
    if (!req.capabilities.every((cap) => c.capabilities.includes(cap))) return false;
    if (CLASSIFICATION_RANK[c.maxDataClassification] < CLASSIFICATION_RANK[req.dataClassification]) {
      rationale.push(`${c.label}: excluded — cannot handle ${req.dataClassification} data`);
      return false;
    }
    if (input.tenantPolicy?.allowedProviders && !input.tenantPolicy.allowedProviders.includes(c.provider)) {
      rationale.push(`${c.label}: excluded — tenant policy disallows ${c.provider}`);
      return false;
    }
    if (req.latencyPreference === 'realtime' && LATENCY_RANK[c.latency] > LATENCY_RANK.realtime) {
      return false;
    }
    if (!isAvailable(c)) {
      rationale.push(`${c.label}: excluded — provider not configured`);
      return false;
    }
    // Experimental models earn production traffic only by measurement.
    if (c.status === 'experimental') {
      const stat = statFor(c.id);
      const bestProduction = Math.max(
        0,
        ...MODEL_CANDIDATES.filter((p) => p.status === 'production')
          .map((p) => statFor(p.id)?.accuracy ?? 0),
      );
      if (!stat || stat.accuracy <= bestProduction) {
        rationale.push(`${c.label}: excluded — experimental and not yet winning this workflow`);
        return false;
      }
    }
    return true;
  }).map((c) => {
    let score = 0;
    const why: string[] = [];

    // Measured performance outranks everything (never benchmarks alone).
    const stat = statFor(c.id);
    if (stat) {
      score += stat.accuracy * 100;
      why.push(`measured accuracy ${(stat.accuracy * 100).toFixed(0)}% on this workflow`);
      if (stat.hallucinationRate != null) score -= stat.hallucinationRate * 60;
      if (stat.toolSuccess != null) score += stat.toolSuccess * 20;
    } else {
      score += c.quality * 8; // prior only, worth far less than measurement
      why.push('no Assembl measurements yet — using quality prior');
    }

    // Previous failures on the ledger.
    const failure = input.failureRates?.[c.id] ?? 0;
    score -= failure * 50;
    if (failure > 0.05) why.push(`recent failure rate ${(failure * 100).toFixed(0)}%`);

    // Quality preference vs cost.
    if (req.qualityPreference === 'maximum') score += c.quality * 6;
    if (req.qualityPreference === 'economy') score -= Math.log1p(c.costPerMTokensNzd) * 8;
    if (req.qualityPreference === 'balanced') score += c.quality * 3 - Math.log1p(c.costPerMTokensNzd) * 4;
    // High-value or high-risk work deserves the strongest model.
    if (req.estimatedValue === 'high' || req.riskLevel === 'high') score += c.quality * 4;

    // Latency preference.
    if (req.latencyPreference === 'fast' && c.latency !== 'standard') score += 6;
    if (req.latencyPreference === 'realtime' && c.latency === 'realtime') score += 10;
    if (req.latencyPreference === 'background') score += Math.log1p(1 / (c.costPerMTokensNzd + 0.1)) * 2;

    if (c.status === 'fallback') score -= 30; // availability net, not first choice

    return { c, score, why };
  });

  scored.sort((a, b) => b.score - a.score);
  for (const s of scored) rationale.push(`${s.c.label}: score ${s.score.toFixed(0)} — ${s.why.join('; ')}`);

  let ladder = scored.map((s) => s.c.id);

  // Independent verification needs a second, different provider in the
  // ladder — reorder so the first two rungs never share a provider.
  if (req.requiresIndependentVerification && ladder.length > 1) {
    const first = scored[0].c.provider;
    const otherIdx = scored.findIndex((s, i) => i > 0 && s.c.provider !== first);
    if (otherIdx > 1) {
      const [other] = scored.splice(otherIdx, 1);
      scored.splice(1, 0, other);
      ladder = scored.map((s) => s.c.id);
      rationale.push(`verification: promoted ${other.c.label} as an independent second provider`);
    }
  }

  return { ladder: ladder.slice(0, 4), rationale };
}
