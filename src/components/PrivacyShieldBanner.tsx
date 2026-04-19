import { useState } from "react";
import { Shield, ShieldCheck, ShieldAlert, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { scrubPII, type RedactionResult } from "@/lib/privacyShield";

interface Props {
  originalText: string;
  onApprove: (scrubbedText: string) => void;
  onSkip: () => void;
  agentColor?: string;
}

const RISK_CONFIG = {
  none: { icon: ShieldCheck, label: "No PII detected", bg: "rgba(0, 168, 107, 0.08)", border: "rgba(0, 168, 107, 0.2)", color: "#00A86B" },
  low: { icon: Shield, label: "Minor PII found", bg: "rgba(74,165,168, 0.08)", border: "rgba(74,165,168, 0.2)", color: "#4AA5A8" },
  medium: { icon: ShieldAlert, label: "PII detected", bg: "rgba(212, 120, 67, 0.08)", border: "rgba(212, 120, 67, 0.2)", color: "#D47843" },
  high: { icon: ShieldAlert, label: "Sensitive data found", bg: "rgba(200, 90, 84, 0.08)", border: "rgba(200, 90, 84, 0.2)", color: "#C85A54" },
};

const PrivacyShieldBanner = ({ originalText, onApprove, onSkip, agentColor = "#00A86B" }: Props) => {
  const [result] = useState<RedactionResult>(() => scrubPII(originalText));
  const [showDetails, setShowDetails] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const config = RISK_CONFIG[result.riskLevel];
  const Icon = config.icon;

  if (result.riskLevel === "none") {
    // Auto-approve if no PII
    setTimeout(() => onSkip(), 0);
    return null;
  }

  return (
    <div
      className="rounded-xl overflow-hidden my-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={{
        background: config.bg,
        backdropFilter: "blur(16px)",
        border: `1px solid ${config.border}`,
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${config.color}15`, border: `1px solid ${config.color}30` }}
          >
            <Icon size={16} style={{ color: config.color }} />
          </div>
          <div>
            <span className="text-xs font-display uppercase tracking-[3px] block" style={{ color: config.color }}>
              Privacy Shield
            </span>
            <span className="text-[10px] font-body text-gray-500">
              {config.label} — {result.redactions.length} item{result.redactions.length !== 1 ? "s" : ""} flagged
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-1.5 rounded-lg transition-all hover:bg-white/5"
          style={{ color: config.color }}
        >
          {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="px-4 pb-3 space-y-2" style={{ borderTop: `1px solid ${config.border}` }}>
          <div className="pt-2 space-y-1.5">
            {result.redactions.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] font-body">
                <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-medium"
                  style={{ background: `${config.color}15`, color: config.color }}>
                  {r.type}
                </span>
                <span className="text-white/40 font-mono text-[10px]">
                  {r.original.substring(0, 20)}{r.original.length > 20 ? "…" : ""}
                </span>
                <span className="text-white/20">→</span>
                <span className="text-white/60 font-mono text-[10px]">[REDACTED]</span>
              </div>
            ))}
          </div>

          {/* Preview toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1.5 text-[10px] font-body text-white/40 hover:text-white/60 transition-colors mt-1"
          >
            {showPreview ? <EyeOff size={10} /> : <Eye size={10} />}
            {showPreview ? "Hide" : "Preview"} scrubbed text
          </button>

          {showPreview && (
            <div
              className="rounded-lg p-3 text-[11px] font-mono leading-relaxed max-h-32 overflow-y-auto"
              style={{ background: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.6)" }}
            >
              {result.scrubbed}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-2.5 flex items-center justify-end gap-2" style={{ borderTop: `1px solid ${config.border}` }}>
        <button
          onClick={onSkip}
          className="px-3 py-1.5 rounded-lg text-[11px] font-body font-medium text-white/40 hover:text-white/60 transition-all hover:bg-white/5"
        >
          Send Original
        </button>
        <button
          onClick={() => onApprove(result.scrubbed)}
          className="px-4 py-1.5 rounded-lg text-[11px] font-body font-medium transition-all hover:brightness-110"
          style={{
            background: `linear-gradient(135deg, ${config.color}, ${config.color}CC)`,
            color: "#3D4250",
            boxShadow: `0 2px 8px ${config.color}30`,
          }}
        >
          <Shield size={10} className="inline mr-1.5" />
          Send Scrubbed
        </button>
      </div>
    </div>
  );
};

export default PrivacyShieldBanner;
