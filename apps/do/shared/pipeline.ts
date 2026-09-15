/**
 * DO core pipeline — channel-agnostic.
 *
 * Surface ≠ agent. Chrome extension is ONE launch surface.
 * Spine: context + intent → AgentSpec → tools → permissions → outcome
 */

import type { AgentPrimitive, AgentSpec, PageContext } from './types';

export type LaunchSurface = 'chrome' | 'web' | 'whatsapp' | 'sms' | 'messenger';

export interface DoContext {
  surface: LaunchSurface;
  page?: PageContext;
  /** Channel-native thread / chat id when not from a page. */
  threadId?: string;
  /** Raw attachment / media stubs (v0 unused). */
  attachments?: string[];
}

export interface DoIntent {
  brief: string;
  templateId?: string;
}

export type RuntimeLane = 'local' | 'astra' | 'ensemble';

export interface ToolPlan {
  primitive: AgentPrimitive;
  lane: RuntimeLane;
  /** Why this lane was chosen (plain English). */
  reason: string;
  tools: string[];
}

export interface DoEvidenceSource {
  id: string;
  kind: 'page' | 'fixture' | 'snapshot' | 'compare' | 'brief';
  label: string;
  url?: string;
  /** Truncated content hash or excerpt for DEMO honesty. */
  excerpt?: string;
  contentHash?: string;
  capturedAt: string;
}

export interface DoEvidence {
  id: string;
  agentId: string;
  summary: string;
  sources: DoEvidenceSource[];
  /** Why DO recommended this outcome. */
  why: string;
  createdAt: string;
}

export interface DoOutcome {
  agentId: string;
  status: AgentSpec['status'];
  note: string;
  evidence?: DoEvidence;
  changed?: boolean;
}

/** Ingress message shared by surfaces (Chrome, web, future chat stubs). */
export interface DoMessage {
  surface: LaunchSurface;
  intent: DoIntent;
  context: DoContext;
}
