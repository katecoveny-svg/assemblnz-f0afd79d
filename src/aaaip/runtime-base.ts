// ═══════════════════════════════════════════════════════════════
// AAAIP — Shared runtime interface
// Both useAaaipRuntime (clinic) and useRobotRuntime (HRC) return
// objects that satisfy AaaipRuntimeBase. The dashboard chrome
// (KPIs, approvals, metrics, policies) talks to this interface
// only — domain-specific live views read the concrete `world`.
// ═══════════════════════════════════════════════════════════════

import type { ComplianceEngine } from "./policy/engine";
import type { AuditEntry, AuditLog } from "./metrics/audit";
import type { AaaipExportError, AaaipExportResponse } from "./api/export";

/**
 * UI-level domain key — distinct from `Domain` in policy/types.ts.
 * These match the canonical Assembl Kete names (Waihanga, Manaaki,
 * Pikau, Auaha) plus the demo / research pilots.
 */
export type RuntimeDomainKey =
  | "clinic"
  | "robot"
  | "science"
  | "community"
  | "waihanga"
  | "pikau"
  | "manaaki"
  | "auaha"
  | "toro";

export interface AaaipRuntimeBase {
  domain: RuntimeDomainKey;
  /** Human-readable label of the pilot — surfaced in the export payload. */
  pilotLabel: string;
  /** Domain-specific world snapshot — narrowed by the live view. */
  world: unknown;
  audit: AuditEntry[];
  pendingApprovals: AuditEntry[];
  isRunning: boolean;
  tickCount: number;
  policies: ReturnType<ComplianceEngine["describePolicies"]>;
  metrics: ReturnType<AuditLog["aggregates"]>;
  start: () => void;
  pause: () => void;
  step: () => unknown;
  reset: () => void;
  approve: (entryId: string) => void;
  reject: (entryId: string) => void;
  exportJson: () => string;
  /** POST the audit log to the aaaip-audit-export edge function. */
  submitToAaaip: () => Promise<AaaipExportResponse | AaaipExportError>;
  /** Domain-specific scenario buttons rendered in the header. */
  scenarioActions: Array<{
    id: string;
    label: string;
    onTrigger: () => void;
  }>;
}
