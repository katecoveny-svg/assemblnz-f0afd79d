import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired" | "unknown";

export interface ApprovalRecord {
  id: string;
  status: ApprovalStatus;
  action_type: string | null;
  expires_at: string | null;
  decided_at: string | null;
  decision_reason: string | null;
}

interface UseApprovalStatusResult {
  record: ApprovalRecord | null;
  status: ApprovalStatus;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Poll the approval_queue for the current status of a queued action
 * (e.g. a tender submission awaiting human sign-off).
 *
 * - Refreshes every `pollIntervalMs` while the record is still `pending`.
 * - Stops polling once the record reaches a terminal state.
 * - Treats an `expires_at` in the past on a still-`pending` row as `expired`
 *   so the UI surfaces stale approvals even before the backend cron flips them.
 */
export function useApprovalStatus(
  approvalId: string | null | undefined,
  pollIntervalMs = 8000,
): UseApprovalStatusResult {
  const [record, setRecord] = useState<ApprovalRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOnce = async () => {
    if (!approvalId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: qErr } = await supabase
        .from("approval_queue")
        .select("id,status,action_type,expires_at,decided_at,decision_reason")
        .eq("id", approvalId)
        .maybeSingle();
      if (qErr) throw qErr;
      if (!data) {
        setRecord(null);
      } else {
        const rawStatus = (data.status ?? "pending") as ApprovalStatus;
        const isExpired =
          rawStatus === "pending" &&
          data.expires_at !== null &&
          new Date(data.expires_at).getTime() < Date.now();
        setRecord({
          id: data.id,
          status: isExpired ? "expired" : rawStatus,
          action_type: data.action_type ?? null,
          expires_at: data.expires_at ?? null,
          decided_at: data.decided_at ?? null,
          decision_reason: data.decision_reason ?? null,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load approval status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!approvalId) {
      setRecord(null);
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      if (cancelled) return;
      await fetchOnce();
      if (cancelled) return;
      // Continue polling only while pending.
      const current = record?.status ?? "pending";
      if (current === "pending") {
        timer = setTimeout(tick, pollIntervalMs);
      }
    };

    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalId, pollIntervalMs]);

  const status: ApprovalStatus = record?.status ?? (approvalId ? "pending" : "unknown");

  return { record, status, loading, error, refetch: fetchOnce };
}
