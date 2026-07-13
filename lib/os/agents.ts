/**
 * OS agent registry — agents as roles in the business.
 *
 * (docs/AGENTIC-OS-ARCHITECTURE.md §B.2, brief §4.) Each agent declares its
 * responsibilities, the genome domains it may read, the capabilities it may
 * request, and its safety envelope. The orchestrator only ever works with
 * these definitions; the large marketplace registry
 * (lib/marketplace/agents.ts) remains the prompt/persona catalogue behind
 * chat surfaces and is scheduled for rehoming here.
 *
 * Agents are assembled per business: recommendStartingTeam() proposes a
 * small team from the vertical, never the whole catalogue (brief §4).
 */
import type { GenomeSection } from '@/lib/customers/auckland-dog-trainer/genome';

export type OsAgent = {
  id: string;
  name: string;
  role: string;
  responsibilities: string[];
  /** Capability keys from lib/os/capabilities.ts. */
  capabilities: string[];
  /** Genome sections this agent may read. */
  genomeDomains: GenomeSection[];
  /** What the agent remembers between tasks. */
  memoryPolicy: 'task-only' | 'tenant-history';
  escalation: string;
  approvalRequirements: string;
  /** Model tier hint for the router (primary stays Claude). */
  modelTier: 'cheap' | 'mid' | 'premium';
  /** Soft per-task spend ceiling. */
  costLimitNzd: number;
  evidenceRequirements: string[];
};

export const OS_AGENTS: Record<string, OsAgent> = {
  desk: {
    id: 'desk',
    name: 'The Desk',
    role: 'Customer communications',
    responsibilities: [
      'answer enquiries from the Business Genome',
      'draft replies for the owner to approve',
      'never commit to prices, times or promises outside confirmed facts',
    ],
    capabilities: ['read_genome', 'send_customer_email', 'create_task', 'suggest_genome_fact'],
    genomeDomains: ['identity', 'services', 'team', 'knowledge', 'proof', 'operations'],
    memoryPolicy: 'task-only',
    escalation: 'anything ambiguous or out-of-genome goes to the owner as a question, not a guess',
    approvalRequirements: 'every outbound message is approved by a named operator',
    modelTier: 'mid',
    costLimitNzd: 0.5,
    evidenceRequirements: ['model_call', 'draft', 'approval'],
  },
  operations: {
    id: 'operations',
    name: 'Operations',
    role: 'Bookings & delivery',
    responsibilities: [
      'triage booking requests against the booking rules',
      'keep the day runnable — flag conflicts before they bite',
    ],
    capabilities: ['read_genome', 'create_task', 'create_calendar_event'],
    genomeDomains: ['services', 'operations', 'team'],
    memoryPolicy: 'tenant-history',
    escalation: 'conflicts and exceptions are surfaced on Today, never resolved silently',
    approvalRequirements: 'bookings stay requested until a person confirms',
    modelTier: 'cheap',
    costLimitNzd: 0.25,
    evidenceRequirements: ['record_change'],
  },
  knowledge: {
    id: 'knowledge',
    name: 'Knowledge',
    role: 'Institutional memory',
    responsibilities: [
      'notice recurring questions and propose new genome facts',
      'flag stale or conflicting facts for review',
    ],
    capabilities: ['read_genome', 'search_knowledge', 'suggest_genome_fact', 'create_task'],
    genomeDomains: ['knowledge', 'services', 'operations'],
    memoryPolicy: 'tenant-history',
    escalation: 'suggestions land as unverified facts — a human confirms or discards',
    approvalRequirements: 'may never mark its own suggestions as confirmed',
    modelTier: 'cheap',
    costLimitNzd: 0.25,
    evidenceRequirements: ['note'],
  },
};

/**
 * The small starting team for a new business (brief §4: recommend, don't
 * overwhelm). Every vertical starts with the same three roles today;
 * industry specialists join in Phase 4.
 */
export function recommendStartingTeam(_vertical?: string): OsAgent[] {
  return [OS_AGENTS.desk, OS_AGENTS.operations, OS_AGENTS.knowledge];
}

export function getOsAgent(id: string): OsAgent | undefined {
  return OS_AGENTS[id];
}
