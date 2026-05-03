import { Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useApprovalStatus, type ApprovalStatus } from "@/hooks/useApprovalStatus";

interface Props {
  approvalId: string | null | undefined;
  /** Compact pill (chat) vs. full card (tender form). */
  variant?: "pill" | "card";
}

const STATUS_META: Record<
  ApprovalStatus,
  { label: string; bg: string; fg: string; icon: typeof Clock }
> = {
  pending: { label: "Pending review", bg: "#C68A3D18", fg: "#9C6A2A", icon: Clock },
  approved: { label: "Approved", bg: "#3A7D6E18", fg: "#3A7D6E", icon: CheckCircle2 },
  rejected: { label: "Rejected", bg: "#B6443018", fg: "#B64430", icon: XCircle },
  expired: { label: "Expired", bg: "#6B728018", fg: "#6B7280", icon: AlertCircle },
  unknown: { label: "Unknown", bg: "#9CA3AF18", fg: "#6B7280", icon: AlertCircle },
};

function formatExpiry(iso: string | null): string | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "expired";
  const hrs = Math.round(ms / (1000 * 60 * 60));
  if (hrs < 24) return `expires in ${hrs}h`;
  const days = Math.round(hrs / 24);
  return `expires in ${days}d`;
}

export function ApprovalStatusBadge({ approvalId, variant = "pill" }: Props) {
  const { record, status, loading } = useApprovalStatus(approvalId ?? null);

  if (!approvalId) return null;

  const meta = STATUS_META[status];
  const Icon = meta.icon;
  const expiryHint = formatExpiry(record?.expires_at ?? null);

  if (variant === "pill") {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium"
        style={{ background: meta.bg, color: meta.fg }}
        title={`Approval ${approvalId}`}
      >
        {loading ? (
          <Loader2 size={10} className="animate-spin" />
        ) : (
          <Icon size={10} />
        )}
        {meta.label}
        <span className="font-mono opacity-70">#{approvalId.slice(0, 6)}</span>
      </span>
    );
  }

  return (
    <div
      className="rounded-2xl border p-3 flex items-start gap-3"
      style={{ background: meta.bg, borderColor: `${meta.fg}30` }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${meta.fg}20` }}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" style={{ color: meta.fg }} />
        ) : (
          <Icon size={14} style={{ color: meta.fg }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[12px] font-semibold" style={{ color: meta.fg }}>
            Approval {meta.label.toLowerCase()}
          </p>
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
            style={{ background: "rgba(255,255,255,0.5)", color: "#6B7280" }}
          >
            ID: {approvalId.slice(0, 8)}
          </span>
        </div>
        <p className="text-[11px] mt-0.5" style={{ color: "#6B7280" }}>
          {status === "pending" &&
            `Held in the approval queue${expiryHint ? ` — ${expiryHint}` : ""}.`}
          {status === "approved" &&
            (record?.decision_reason ?? "Cleared by reviewer — safe to proceed.")}
          {status === "rejected" &&
            (record?.decision_reason ?? "Reviewer declined this submission.")}
          {status === "expired" &&
            "The review window has closed. Resubmit to start a new approval."}
          {status === "unknown" && "Status not yet available."}
        </p>
      </div>
    </div>
  );
}
