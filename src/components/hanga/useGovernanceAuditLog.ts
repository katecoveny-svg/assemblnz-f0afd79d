import { useCallback, useEffect, useState } from "react";

export type AuditVerdict = "allow" | "block" | "needs_human";

export interface AuditPolicyEvaluation {
  policyId: string;
  passed: boolean;
  severity: "block" | "warn";
  message: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string; // ISO
  kete: string; // e.g. "WAIHANGA"
  agentName: string;
  action: string; // chat | site_checkin | upload_photo | submit_tender | escalate_hazard
  zone: string | null;
  verdict: AuditVerdict;
  rationale: string;
  evaluations: AuditPolicyEvaluation[];
  context: {
    ppeConfirmed?: boolean;
    workerConsent?: boolean;
    containsWorkers?: boolean;
    humanSignoff?: boolean;
    headcount?: number;
    headcountCap?: number;
    criticalHazardZones?: string[];
  };
  userMessagePreview: string;
  approvalId?: string | null;
  durationMs?: number;
}

const STORAGE_KEY = "assembl.waihanga.audit-log.v1";
const MAX_ENTRIES = 200;

/**
 * Lightweight client-side governed-action audit log.
 * Persists to localStorage so supervisors can review across sessions.
 * Authoritative server-side audit lives in `audit_log` / `aaaip_audit_exports`.
 */
export function useGovernanceAuditLog(kete: string) {
  const [entries, setEntries] = useState<AuditEntry[]>(() => {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}.${kete}`);
      return raw ? (JSON.parse(raw) as AuditEntry[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}.${kete}`, JSON.stringify(entries));
    } catch {
      // quota exceeded — drop oldest half
      const trimmed = entries.slice(0, Math.floor(MAX_ENTRIES / 2));
      setEntries(trimmed);
    }
  }, [entries, kete]);

  const record = useCallback((entry: Omit<AuditEntry, "id" | "timestamp">) => {
    const full: AuditEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    setEntries((prev) => [full, ...prev].slice(0, MAX_ENTRIES));
    return full;
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  return { entries, record, clear };
}

// ── Export helpers ────────────────────────────────────────────

export function entriesToJson(entries: AuditEntry[]): string {
  return JSON.stringify(entries, null, 2);
}

export function entriesToCsv(entries: AuditEntry[]): string {
  const header = [
    "timestamp",
    "kete",
    "agent",
    "action",
    "zone",
    "verdict",
    "rationale",
    "policies_failed",
    "ppe_confirmed",
    "worker_consent",
    "contains_workers",
    "human_signoff",
    "headcount",
    "headcount_cap",
    "critical_hazard_zones",
    "approval_id",
    "duration_ms",
    "user_message_preview",
  ];

  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };

  const rows = entries.map((e) => [
    e.timestamp,
    e.kete,
    e.agentName,
    e.action,
    e.zone ?? "",
    e.verdict,
    e.rationale,
    e.evaluations.filter((p) => !p.passed).map((p) => `${p.policyId}:${p.message}`).join(" | "),
    e.context.ppeConfirmed ?? "",
    e.context.workerConsent ?? "",
    e.context.containsWorkers ?? "",
    e.context.humanSignoff ?? "",
    e.context.headcount ?? "",
    e.context.headcountCap ?? "",
    (e.context.criticalHazardZones ?? []).join(";"),
    e.approvalId ?? "",
    e.durationMs ?? "",
    e.userMessagePreview,
  ].map(escape).join(","));

  return [header.join(","), ...rows].join("\n");
}

export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Mirror of supabase/functions/_shared/waihanga-compliance.ts
 * `deriveActionFromMessage` — used client-side so we can label allowed
 * turns with the same action kind the server inferred.
 */
export function deriveActionKind(text: string, ctxKind?: string): string {
  if (ctxKind) return ctxKind;
  const lower = text.toLowerCase();
  if (/\b(check ?in|sign ?in|on ?site)\b/.test(lower)) return "site_checkin";
  if (/\b(upload|attach|post)\b.*\b(photo|image|picture)\b/.test(lower)) return "upload_photo";
  if (/\b(submit|send|file)\b.*\btender\b/.test(lower)) return "submit_tender";
  if (/\b(escalate|notifiable|critical hazard|near miss)\b/.test(lower)) return "escalate_hazard";
  return "chat";
}
