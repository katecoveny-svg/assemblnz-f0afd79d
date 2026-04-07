// ═══════════════════════════════════════════════════════════════
// AAAIP — Metrics & Audit Log
// In-memory store of every agent decision and human override.
// Provides aggregates for the dashboard and a JSON export hook
// for AAAIP researchers (Supabase / S3 / Slack via Lovable).
// ═══════════════════════════════════════════════════════════════

import type { ComplianceDecision } from "../policy/types";

export interface AuditEntry {
  id: string;
  at: number;
  decision: ComplianceDecision;
  applied: boolean;
  humanOverride?: "approved" | "rejected";
  notes?: string;
}

export interface AggregateMetrics {
  total: number;
  allowed: number;
  blocked: number;
  needsHuman: number;
  applied: number;
  policyHits: Record<string, number>;
  /** % of decisions that were either auto-allowed or human-approved. */
  complianceRate: number;
  /** % of needs_human decisions a human approved. */
  humanApprovalRate: number;
}

let entryCounter = 0;
const nextId = () => `audit-${++entryCounter}`;

export class AuditLog {
  private entries: AuditEntry[] = [];
  private listeners: Array<(entries: AuditEntry[]) => void> = [];

  record(decision: ComplianceDecision, applied: boolean, notes?: string): AuditEntry {
    const entry: AuditEntry = {
      id: nextId(),
      at: decision.action.proposedAt,
      decision,
      applied,
      notes,
    };
    this.entries = [entry, ...this.entries].slice(0, 500);
    this.notify();
    return entry;
  }

  override(id: string, override: "approved" | "rejected") {
    this.entries = this.entries.map((e) =>
      e.id === id ? { ...e, humanOverride: override, applied: override === "approved" } : e,
    );
    this.notify();
  }

  list(): AuditEntry[] {
    return this.entries;
  }

  pendingApprovals(): AuditEntry[] {
    return this.entries.filter(
      (e) => e.decision.verdict === "needs_human" && !e.humanOverride,
    );
  }

  aggregates(): AggregateMetrics {
    const total = this.entries.length;
    const allowed = this.entries.filter((e) => e.decision.verdict === "allow").length;
    const blocked = this.entries.filter((e) => e.decision.verdict === "block").length;
    const needsHuman = this.entries.filter((e) => e.decision.verdict === "needs_human").length;
    const applied = this.entries.filter((e) => e.applied).length;

    const policyHits: Record<string, number> = {};
    for (const e of this.entries) {
      for (const ev of e.decision.evaluations) {
        if (!ev.passed) policyHits[ev.policyId] = (policyHits[ev.policyId] ?? 0) + 1;
      }
    }

    const humanReviewed = this.entries.filter(
      (e) => e.decision.verdict === "needs_human" && e.humanOverride,
    );
    const humanApproved = humanReviewed.filter((e) => e.humanOverride === "approved").length;

    return {
      total,
      allowed,
      blocked,
      needsHuman,
      applied,
      policyHits,
      complianceRate: total === 0 ? 1 : (allowed + humanApproved) / total,
      humanApprovalRate:
        humanReviewed.length === 0 ? 0 : humanApproved / humanReviewed.length,
    };
  }

  /**
   * Subscribe to changes — used by the dashboard React hook.
   * Returns an unsubscribe function.
   */
  subscribe(fn: (entries: AuditEntry[]) => void): () => void {
    this.listeners.push(fn);
    fn(this.entries);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  /**
   * Export the log as a JSON string. Wired into the dashboard's
   * "Send to AAAIP researchers" button — also the seam where a
   * Supabase / S3 connector would live.
   */
  exportJson(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        entries: this.entries,
        aggregates: this.aggregates(),
      },
      null,
      2,
    );
  }

  reset() {
    this.entries = [];
    this.notify();
  }

  private notify() {
    for (const l of this.listeners) l(this.entries);
  }
}
