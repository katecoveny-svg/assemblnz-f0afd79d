/**
 * Human-in-the-Loop Sign-Off — "Verify & Sign-Off" button
 * Legally defensible timestamp for WorkSafe/Customs audits.
 * Now includes Compliance RAG Gate — pre-finalization legislation check.
 */
import { useState } from "react";

function safeBase64(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return btoa(str.replace(/[^\x00-\xFF]/g, "?"));
  }
}
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, User, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ComplianceRAGGate, { type ComplianceResult } from "@/components/ComplianceRAGGate";

interface Props {
  outputId: string;
  outputType: string;
  agentName: string;
  content: string;
  /** Kete context for compliance check */
  kete?: string;
  /** Document type for targeted legislation check */
  documentType?: "hs_report" | "customs_declaration" | "building_consent" | "privacy_assessment" | "general";
  /** Require compliance check before sign-off (default: true for H&S/Customs) */
  requireComplianceCheck?: boolean;
  onSigned?: (signoff: SignOffRecord) => void;
}

export interface SignOffRecord {
  signedBy: string;
  signedAt: string;
  outputType: string;
  agentName: string;
  userId: string;
}

const GLASS = {
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.08)",
};

export default function HITLSignOff({ outputId, outputType, agentName, content, kete = "general", documentType = "general", requireComplianceCheck, onSigned }: Props) {
  const { user, profile } = useAuth();
  const [signed, setSigned] = useState<SignOffRecord | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);

  // Auto-detect if compliance check is required
  const needsCompliance = requireComplianceCheck ?? 
    ["hs_report", "customs_declaration", "building_consent", "privacy_assessment"].includes(documentType);

  const complianceBlocking = needsCompliance && (!complianceResult || complianceResult.overallStatus === "breach");

  const handleSignOff = async () => {
    if (!user) {
      toast.error("You must be logged in to sign off");
      return;
    }
    setLoading(true);
    try {
      const now = new Date().toISOString();
      const displayName = profile?.full_name || user.email || "Unknown";
      const record: SignOffRecord = {
        signedBy: displayName,
        signedAt: now,
        outputType,
        agentName,
        userId: user.id,
      };

      // Store in agent_memory for audit trail
      await supabase.from("agent_memory").insert({
        user_id: user.id,
        agent_id: `hitl-${agentName}`,
        memory_key: `signoff-${outputId}`,
        memory_value: {
          ...record,
          contentHash: safeBase64(content.slice(0, 200)).slice(0, 32),
          contentPreview: content.slice(0, 300),
        } as any,
      });

      setSigned(record);
      setConfirming(false);
      onSigned?.(record);
      toast.success("Output verified & signed off");
    } catch (e: any) {
      toast.error(e.message || "Sign-off failed");
    } finally {
      setLoading(false);
    }
  };

  const formatNZDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-NZ", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      timeZoneName: "short",
    });
  };

  if (signed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl p-4 mt-3"
        style={{ ...GLASS, borderColor: "rgba(0,168,107,0.3)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00A86B]/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-[#00A86B]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#00A86B]">Verified & Signed Off</p>
            <p className="text-xs text-gray-500">
              Certified by <span className="text-white/80 font-medium">{signed.signedBy}</span>
            </p>
            <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              {formatNZDate(signed.signedAt)}
            </p>
          </div>
          <ShieldCheck className="w-6 h-6 text-[#00A86B]/60" />
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      {needsCompliance && (
        <ComplianceRAGGate
          content={content}
          documentType={documentType}
          kete={kete}
          onResult={setComplianceResult}
          required={needsCompliance}
        />
      )}

      <AnimatePresence mode="wait">
        {!confirming ? (
          <motion.button
            key="trigger"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !complianceBlocking && setConfirming(true)}
            disabled={complianceBlocking}
            className="mt-3 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            style={{ ...GLASS, color: "#D4A843" }}
          >
            <ShieldCheck className="h-4 w-4" />
            Verify & Sign-Off
          </motion.button>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 space-y-3 rounded-xl p-4"
            style={{ ...GLASS, borderColor: "rgba(212,168,67,0.3)" }}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#D4A843]" />
              <p className="text-xs text-white/70">
                By signing off, you certify this AI-generated output has been reviewed and is accurate.
                Your name and timestamp will be recorded for compliance auditing.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-white/40" />
              <span className="text-sm text-white/60">
                Signing as: <span className="font-medium text-foreground">{profile?.full_name || user?.email}</span>
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSignOff}
                disabled={loading}
                className="flex-1 rounded-lg bg-[#00A86B] py-2 text-sm font-semibold text-foreground transition-all hover:bg-[#00A86B]/90 disabled:opacity-50"
              >
                {loading ? "Signing…" : "Confirm Sign-Off"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-lg px-4 py-2 text-sm text-gray-500 transition-colors hover:text-white/80"
                style={GLASS}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
