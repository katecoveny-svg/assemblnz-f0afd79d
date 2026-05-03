import { motion } from "framer-motion";
import { UserCheck, FileSearch, ArrowRight, Clock, AlertTriangle } from "lucide-react";
import type { AuditPolicyEvaluation } from "./useGovernanceAuditLog";
import { ApprovalStatusBadge } from "./ApprovalStatusBadge";

const POUNAMU = "#3A7D6E";
const TEAL_ACCENT = "#4AA5A8";
const ALERT_AMBER = "#C68A3D";

interface Props {
  action: string;
  reason: string;
  evaluations: AuditPolicyEvaluation[];
  approvalId?: string | null;
  zone?: string | null;
  onCopySummary?: () => void;
}

const ACTION_LABEL: Record<string, string> = {
  chat: "general request",
  site_checkin: "site check-in",
  upload_photo: "photo upload",
  submit_tender: "tender submission",
  escalate_hazard: "hazard escalation",
};

/**
 * Friendly, role-aware explanation of what a reviewer must check
 * for a policy that warned (verdict = needs_human).
 */
function reviewerInstructionFor(policyId: string): string {
  if (policyId.includes("ppe")) return "Confirm every worker on site is in correct PPE for today's tasks.";
  if (policyId.includes("consent")) return "Verify worker consent to AI-assisted reporting is current.";
  if (policyId.includes("tender") || policyId.includes("signoff"))
    return "A nominated human must read and sign off the tender before submission.";
  if (policyId.includes("hazard") || policyId.includes("zone"))
    return "Walk the zone and verify hazard controls before unlocking.";
  if (policyId.includes("headcount") || policyId.includes("cap"))
    return "Confirm the site headcount cap and that inductions are complete.";
  if (policyId.includes("uncertainty"))
    return "Confidence is below threshold — a domain expert must verify the answer before it's relied on.";
  if (policyId.includes("te_reo") || policyId.includes("tikanga"))
    return "Te reo / tikanga reviewer must check accuracy and cultural appropriateness.";
  if (policyId.includes("data_residency") || policyId.includes("sovereignty"))
    return "Data steward must confirm storage and sharing meets sovereignty rules.";
  return "A human reviewer must verify this before proceeding.";
}

export function EscalationMessage({
  action,
  reason,
  evaluations,
  approvalId,
  zone,
  onCopySummary,
}: Props) {
  const failed = evaluations.filter((e) => !e.passed);
  const actionLabel = ACTION_LABEL[action] ?? action.replace(/_/g, " ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl rounded-bl-md overflow-hidden"
      style={{
        background: `${ALERT_AMBER}08`,
        border: `1px solid ${ALERT_AMBER}30`,
      }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: `${ALERT_AMBER}25`, background: `${ALERT_AMBER}10` }}
      >
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: `${ALERT_AMBER}20` }}
        >
          <UserCheck size={12} style={{ color: ALERT_AMBER }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold" style={{ color: ALERT_AMBER }}>
            Human review required
          </p>
          <p className="text-[10px]" style={{ color: "#6B7280" }}>
            Compliance verdict: needs_human · {actionLabel}
          </p>
        </div>
        {approvalId && <ApprovalStatusBadge approvalId={approvalId} variant="pill" />}
      </div>

      <div className="px-3 py-2.5 space-y-2.5">
        {/* Why */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle size={10} style={{ color: ALERT_AMBER }} />
            <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "#6B7280" }}>
              Why this needs review
            </span>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: "#3D4250" }}>
            {reason}
          </p>
        </div>

        {/* What a human must check */}
        {failed.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <FileSearch size={10} style={{ color: TEAL_ACCENT }} />
              <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "#6B7280" }}>
                What the reviewer must check
              </span>
            </div>
            <ul className="space-y-1">
              {failed.map((e) => (
                <li
                  key={e.policyId}
                  className="text-[11px] leading-relaxed pl-2 border-l-2"
                  style={{ color: "#3D4250", borderColor: `${ALERT_AMBER}40` }}
                >
                  <span className="font-mono text-[9px]" style={{ color: "#9CA3AF" }}>
                    {e.policyId}
                  </span>
                  <br />
                  {reviewerInstructionFor(e.policyId)}
                  {e.message && e.message !== reviewerInstructionFor(e.policyId) && (
                    <span className="block text-[10px] mt-0.5" style={{ color: "#6B7280" }}>
                      Detail: {e.message}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next steps for the user */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowRight size={10} style={{ color: POUNAMU }} />
            <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "#6B7280" }}>
              What to do next
            </span>
          </div>
          <ol className="space-y-0.5 text-[11px] leading-relaxed" style={{ color: "#3D4250" }}>
            <li>1. Notify your nominated supervisor{zone ? ` (zone: ${zone})` : ""}.</li>
            <li>2. Share the request and the items above for review.</li>
            <li>3. Once approved in the supervisor controls, send your message again.</li>
          </ol>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-[10px]" style={{ color: "#9CA3AF" }}>
            <Clock size={9} />
            Held in approval queue — no action taken
          </div>
          {onCopySummary && (
            <button
              onClick={onCopySummary}
              className="text-[10px] font-medium px-2 py-1 rounded-md transition-colors"
              style={{ background: `${POUNAMU}12`, color: POUNAMU }}
            >
              Copy for reviewer
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export interface EscalationPayload {
  action: string;
  reason: string;
  evaluations: AuditPolicyEvaluation[];
  approvalId?: string | null;
  zone?: string | null;
}

/** Plain-text version for clipboard / handoff messaging. */
export function escalationToText(p: EscalationPayload): string {
  const failed = p.evaluations.filter((e) => !e.passed);
  const lines = [
    "WAIHANGA — Human review required",
    `Action: ${ACTION_LABEL[p.action] ?? p.action}`,
    p.zone ? `Zone: ${p.zone}` : null,
    p.approvalId ? `Approval ID: ${p.approvalId}` : null,
    "",
    `Reason: ${p.reason}`,
    "",
    "Reviewer checklist:",
    ...failed.map((e) => `  • [${e.policyId}] ${reviewerInstructionFor(e.policyId)}`),
    "",
    "Next steps:",
    "  1. Reviewer verifies the items above.",
    "  2. Update supervisor controls with the approval.",
    "  3. Resend the original request.",
  ].filter(Boolean);
  return lines.join("\n");
}
