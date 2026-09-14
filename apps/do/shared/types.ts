/**
 * DO Agent OS v0 — shared types.
 * Working name: DO. Behaviour: See something → ✦ make agent.
 * Core spine (channel-agnostic): context + intent → AgentSpec → tools → permissions → outcome
 */

import type { DoEvidence, RuntimeLane, ToolPlan } from './pipeline';
import type { WatchSnapshot } from './watch';
import type { ApprovalChainStep } from './approval-chain';

export type AgentPrimitive = 'watch' | 'find' | 'extract' | 'prepare' | 'compare';

export type AgentStatus = 'needs_you' | 'working' | 'done';

/** Consequential verbs that ALWAYS require human approval. Server-enforced. */
export type ConsequentialVerb =
  | 'buy'
  | 'book'
  | 'send'
  | 'post'
  | 'submit'
  | 'pay'
  | 'sign';

export interface PageContext {
  url: string;
  title: string;
  selectedText?: string;
  /** Truncated page text (server enforces max length). */
  pageText?: string;
}

export interface AgentSpec {
  id: string;
  name: string;
  /** What the agent watches (URL, feed, fixture key, etc.). */
  watches: string[];
  /** What it looks for (change signals, keywords, fields). */
  looks_for: string[];
  /** Safe actions it may take without asking. Never consequential. */
  can_do_without_asking: string[];
  /** Actions that need a human yes before proceeding. */
  must_ask_before: string[];
  /** Hard never-list. */
  never: string[];
  primitive: AgentPrimitive;
  /** Human brief that compiled this agent. */
  brief: string;
  /** Optional page context at compile time. */
  page?: PageContext;
  status: AgentStatus;
  /** True when this agent was seeded from a DEMO template. */
  demo: boolean;
  createdAt: string;
  updatedAt: string;
  /** Pending approval items waiting under "needs you". */
  pendingApprovals: PendingApproval[];
  /** Latest working note / receipt (plain English). */
  lastNote?: string;
  /** Runtime lane chosen by router (local vs Astra-class). */
  lane?: RuntimeLane;
  /** Tool plan from router. */
  toolPlan?: ToolPlan;
  /** Last watch snapshots for change detection. */
  watchSnapshots?: WatchSnapshot[];
  /** Evidence receipt when an outcome completes. */
  evidence?: DoEvidence;
}

export interface PendingApproval {
  id: string;
  action: string;
  reason: string;
  /** Why this was classified as needing approval (policy, not model). */
  policyHit: ConsequentialVerb | 'policy';
  createdAt: string;
  /** Major-decision chain only (specialist → skeptic → decision → human). */
  chain?: ApprovalChainStep[];
}

export interface CompileRequest {
  brief: string;
  page?: PageContext;
  /** Optional template id to seed from. */
  templateId?: string;
  /** Launch surface that produced this compile. */
  surface?: string;
}

export interface CompileResponse {
  spec: AgentSpec;
  /** Honesty banner for DEMO surfaces. */
  honesty: string;
}

export interface DemoTemplate {
  id: string;
  name: string;
  summary: string;
  brief: string;
  primitive: AgentPrimitive;
  /** Fixture key when the template does not scrape a live locked site. */
  fixture?: string;
  watches: string[];
  looks_for: string[];
  can_do_without_asking: string[];
  must_ask_before: string[];
  never: string[];
}
