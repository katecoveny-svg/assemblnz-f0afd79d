/**
 * assembl — capability registry (the truth model)
 * -----------------------------------------------
 * One central place that declares what every journey capability actually is:
 * its honest status, where its data comes from, whether an external system is
 * connected, whether output is simulated, the authority it needs, its known
 * limitations, and the plain-language disclosure shown publicly.
 *
 * UI never invents a capability label — it reads from here. Env-dependent
 * statuses (model connected? DB connected?) are resolved from runtime
 * configuration via `resolveCapabilityStatus`, so a status reflects reality
 * rather than intent.
 */

import type { AuthorityLevel, StatusTreatment } from './types';

/** The brief's capability-status vocabulary (alias of the journey's status treatment). */
export type CapabilityStatus = StatusTreatment;

export type CapabilityDataSource =
  | 'deterministic'
  | 'mock_catalogue'
  | 'seed_genome'
  | 'model'
  | 'supabase'
  | 'none';

export type Capability = {
  id: string;
  name: string;
  /** Declared status when no runtime signal overrides it. */
  status: CapabilityStatus;
  dataSource: CapabilityDataSource;
  /** True only when a real external system is wired and reachable. */
  externalConnected: boolean;
  /** True when the output is prepared/illustrative, not actually carried out. */
  simulated: boolean;
  requiredAuthority: AuthorityLevel;
  limitations: string[];
  /** Plain-language public disclosure — no fine print. */
  disclosure: string;
};

export const CAPABILITY_REGISTRY: Capability[] = [
  {
    id: 'intent_structuring',
    name: 'Understand the request',
    status: 'simulated',
    dataSource: 'deterministic',
    externalConnected: false,
    simulated: true,
    requiredAuthority: 'recommend',
    limitations: ['Deterministic parser unless a model key is configured.'],
    disclosure: 'We turn your words into a structured request. In this sandbox that is done on-device with rules; with a model key it uses a language model, server-side.',
  },
  {
    id: 'context_gathering',
    name: 'Ask only what matters',
    status: 'simulated',
    dataSource: 'deterministic',
    externalConnected: false,
    simulated: true,
    requiredAuthority: 'recommend',
    limitations: ['Question set is fixed for the grocery journey.'],
    disclosure: 'We ask the smallest useful set of questions and never re-ask what you already told us.',
  },
  {
    id: 'plan_generation',
    name: 'Assemble the plan',
    status: 'simulated',
    dataSource: 'mock_catalogue',
    externalConnected: false,
    simulated: true,
    requiredAuthority: 'recommend',
    limitations: ['Uses an illustrative catalogue, not a live retailer feed.'],
    disclosure: 'Meals and a basket are assembled from an illustrative catalogue. Prices are demonstration values, not live pricing.',
  },
  {
    id: 'basket_assembly',
    name: 'Prepare the basket',
    status: 'simulated',
    dataSource: 'mock_catalogue',
    externalConnected: false,
    simulated: true,
    requiredAuthority: 'act_with_approval',
    limitations: ['Prepares only; nothing is ordered.'],
    disclosure: 'The basket is prepared for your approval. No order is placed.',
  },
  {
    id: 'value_analysis',
    name: 'Find value options',
    status: 'simulated',
    dataSource: 'mock_catalogue',
    externalConnected: false,
    simulated: true,
    requiredAuthority: 'recommend',
    limitations: ['Never presents a real promotion.'],
    disclosure: 'We suggest cheaper swaps from the illustrative catalogue. We never invent a live offer or discount.',
  },
  {
    id: 'resolution',
    name: 'Handle exceptions',
    status: 'proposed',
    dataSource: 'mock_catalogue',
    externalConnected: false,
    simulated: true,
    requiredAuthority: 'act_with_approval',
    limitations: ['Swaps require approval; escalates when rules cannot resolve.'],
    disclosure: 'If an item is out of stock or the basket is over budget, we propose a fix for your approval, or hand to a person.',
  },
  {
    id: 'wait_state',
    name: 'Useful wait',
    status: 'simulated',
    dataSource: 'deterministic',
    externalConnected: false,
    simulated: true,
    requiredAuthority: 'draft',
    limitations: ['Describes real work; timing is compressed for the demo.'],
    disclosure: 'While the shop assembles we show the real work happening. Timing is compressed for the demonstration.',
  },
  {
    id: 'genome_read',
    name: 'Read the Business Genome',
    status: 'sandbox',
    dataSource: 'seed_genome',
    externalConnected: false,
    simulated: true,
    requiredAuthority: 'observe',
    limitations: ['Grocery genome is fictional seed data.'],
    disclosure: 'The business facts used here are illustrative seed data for a fictional grocery, not a real business.',
  },
  {
    id: 'place_order',
    name: 'Place an order with a retailer',
    status: 'unavailable',
    dataSource: 'none',
    externalConnected: false,
    simulated: false,
    requiredAuthority: 'act_within_limits',
    limitations: ['No retailer connector is wired.'],
    disclosure: 'No retailer is connected. An order cannot be placed from this demonstration.',
  },
  {
    id: 'run_persistence',
    name: 'Save the journey',
    status: 'sandbox',
    dataSource: 'supabase',
    externalConnected: false,
    simulated: true,
    requiredAuthority: 'act_with_approval',
    limitations: ['Falls back to in-memory when no database is configured; not durable in the sandbox.'],
    disclosure: 'Your run is kept only for this session in the sandbox. With a database configured it persists; you can always remove what was saved.',
  },
  {
    id: 'proof',
    name: 'Prove the result',
    status: 'simulated',
    dataSource: 'deterministic',
    externalConnected: false,
    simulated: true,
    requiredAuthority: 'observe',
    limitations: ['Time-saved figures are estimates, not measurements.'],
    disclosure: 'The Proof Card reports what happened in the run. Time-saved figures are clearly-labelled estimates, not measured.',
  },
];

const BY_ID = new Map(CAPABILITY_REGISTRY.map((c) => [c.id, c]));

export function getCapability(id: string): Capability | undefined {
  return BY_ID.get(id);
}

/**
 * Resolve the live status of a capability from runtime configuration. Called
 * server-side (has access to non-public env). On the client it returns the
 * declared status, since secrets are never exposed there.
 */
export function resolveCapabilityStatus(id: string): CapabilityStatus {
  const cap = BY_ID.get(id);
  if (!cap) return 'unavailable';
  const hasModel = typeof process !== 'undefined' && !!process.env?.ANTHROPIC_API_KEY;
  const hasDb =
    typeof process !== 'undefined' &&
    !!process.env?.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env?.SUPABASE_SERVICE_ROLE_KEY;

  if (id === 'intent_structuring') return hasModel ? 'connected' : 'simulated';
  if (id === 'run_persistence') return hasDb ? 'connected' : 'sandbox';
  return cap.status;
}

/** A serialisable snapshot of resolved statuses, safe to pass to the client. */
export function capabilitySnapshot(): Record<string, CapabilityStatus> {
  const out: Record<string, CapabilityStatus> = {};
  for (const c of CAPABILITY_REGISTRY) out[c.id] = resolveCapabilityStatus(c.id);
  return out;
}
