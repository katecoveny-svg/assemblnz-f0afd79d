/**
 * Compliance RAG Gate — Pre-finalization legislation check.
 * Runs against NZ legislation (HSWA 2015, Privacy Act 2020, Building Act 2004,
 * Customs & Excise Act 2018) before any document can be signed off.
 * Renders inline above the HITL Sign-Off button.
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle2, AlertTriangle, XCircle, Loader2, FileSearch } from "lucide-react";
import { agentChat } from "@/lib/agentChat";

/* ─── Legislation corpus (simulated vector DB) ──────── */

const NZ_LEGISLATION_CORPUS: Record<string, { title: string; sections: string[] }> = {
  hswa_2015: {
    title: "Health & Safety at Work Act 2015",
    sections: [
      "s36 — PCBU must ensure, so far as is reasonably practicable, health & safety of workers",
      "s37 — PCBU must ensure health & safety of others not at risk from work",
      "s44 — Workers must take reasonable care for own health & safety",
      "s45 — Officers must exercise due diligence re: PCBU H&S obligations",
      "s48 — Duty to notify WorkSafe of notifiable events",
      "s56 — Worker engagement & participation requirements",
    ],
  },
  privacy_2020: {
    title: "Privacy Act 2020",
    sections: [
      "IPP 1 — Purpose of collection must be lawful and directly related",
      "IPP 3 — Collection of information from subject, not third parties",
      "IPP 5 — Storage and security of personal information",
      "IPP 6 — Access to personal information by individual",
      "IPP 11 — Limits on disclosure of personal information",
      "IPP 12 — Cross-border disclosure restrictions",
      "s112 — Mandatory breach notification to Privacy Commissioner",
    ],
  },
  building_2004: {
    title: "Building Act 2004",
    sections: [
      "s14A — Building consent required before building work",
      "s17 — All building work must comply with Building Code",
      "s90 — Code compliance certificate requirements",
      "s94 — Compliance schedule for specified systems",
      "s362A — Restricted building work by licensed practitioners",
    ],
  },
  customs_2018: {
    title: "Customs and Excise Act 2018",
    sections: [
      "s95 — Obligation to make entry of imported goods",
      "s108 — Obligation to make export entry",
      "s131 — Prohibited imports",
      "s220 — Power to examine and detain goods",
      "s382 — Offences related to false declarations",
    ],
  },
};

/* ─── Types ──────────────────────────────────────────── */

export interface ComplianceFlag {
  id: string;
  legislation: string;
  section: string;
  severity: "pass" | "caution" | "breach";
  message: string;
}

export interface ComplianceResult {
  overallStatus: "clear" | "caution" | "breach";
  flags: ComplianceFlag[];
  checkedAt: string;
  legislationChecked: string[];
}

interface Props {
  content: string;
  documentType: "hs_report" | "customs_declaration" | "building_consent" | "privacy_assessment" | "general";
  kete: string;
  onResult?: (result: ComplianceResult) => void;
  /** If true, blocks HITL sign-off until check passes */
  required?: boolean;
}

/* ─── Legislation selector by doc type ──────────────── */

function relevantLegislation(docType: Props["documentType"]): string[] {
  switch (docType) {
    case "hs_report": return ["hswa_2015", "privacy_2020"];
    case "customs_declaration": return ["customs_2018", "privacy_2020"];
    case "building_consent": return ["building_2004", "hswa_2015"];
    case "privacy_assessment": return ["privacy_2020"];
    default: return ["privacy_2020"];
  }
}

/* ─── Component ──────────────────────────────────────── */

export default function ComplianceRAGGate({ content, documentType, kete, onResult, required = true }: Props) {
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runCheck = useCallback(async () => {
    setLoading(true);
    try {
      const legIds = relevantLegislation(documentType);
      const legContext = legIds
        .map((id) => {
          const leg = NZ_LEGISLATION_CORPUS[id];
          if (!leg) return "";
          return `## ${leg.title}\n${leg.sections.map((s) => `- ${s}`).join("\n")}`;
        })
        .join("\n\n");

      const prompt = `You are a NZ Compliance Auditor. Check this document against NZ legislation and flag any potential breaches or cautions.

LEGISLATION CONTEXT:
${legContext}

DOCUMENT TO CHECK (${documentType.replace(/_/g, " ")}):
---
${content.slice(0, 3000)}
---

Return ONLY valid JSON (no markdown fences):
{
  "overallStatus": "clear" | "caution" | "breach",
  "flags": [
    {
      "legislation": "Act name",
      "section": "Section reference",
      "severity": "pass" | "caution" | "breach",
      "message": "Brief explanation"
    }
  ]
}

Rules:
- Flag missing safety plans, undisclosed PII collection, unsigned declarations
- "pass" = compliant, "caution" = potential issue needs review, "breach" = likely non-compliant
- Be specific to NZ law. Reference actual section numbers.
- If document is broadly compliant, still list 2-3 pass items showing what was checked.`;

      const response = await agentChat({
        agentId: "compliance-rag",
        packId: kete,
        message: prompt,
        systemPrompt: "You are a NZ legislative compliance checker. Return ONLY valid JSON. Be precise about NZ statute references.",
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse compliance result");

      const parsed = JSON.parse(jsonMatch[0]);
      const compResult: ComplianceResult = {
        overallStatus: parsed.overallStatus || "caution",
        flags: (parsed.flags || []).map((f: any, i: number) => ({
          id: `flag-${i}`,
          legislation: f.legislation || "Unknown",
          section: f.section || "",
          severity: f.severity || "caution",
          message: f.message || "",
        })),
        checkedAt: new Date().toISOString(),
        legislationChecked: legIds.map((id) => NZ_LEGISLATION_CORPUS[id]?.title || id),
      };

      setResult(compResult);
      onResult?.(compResult);
    } catch (e: any) {
      // Fallback: manual review required
      const fallback: ComplianceResult = {
        overallStatus: "caution",
        flags: [{
          id: "fallback",
          legislation: "System",
          section: "",
          severity: "caution",
          message: `Automated check failed (${e.message}). Manual compliance review required before sign-off.`,
        }],
        checkedAt: new Date().toISOString(),
        legislationChecked: [],
      };
      setResult(fallback);
      onResult?.(fallback);
    } finally {
      setLoading(false);
    }
  }, [content, documentType, kete, onResult]);

  const statusColor = {
    clear: "#00A86B",
    caution: "#4AA5A8",
    breach: "#E53935",
  };

  const statusIcon = {
    clear: CheckCircle2,
    caution: AlertTriangle,
    breach: XCircle,
  };

  return (
    <div className="mt-3 space-y-2">
      {/* Run check button */}
      {!result && !loading && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={runCheck}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] w-full justify-center"
          style={{
            background: "rgba(0,168,107,0.08)",
            border: "1px solid rgba(0,168,107,0.2)",
            color: "#00A86B",
          }}
        >
          <FileSearch className="w-4 h-4" />
          Run Compliance Check
          {required && <span className="text-[9px] uppercase tracking-wider opacity-60 ml-1">Required</span>}
        </motion.button>
      )}

      {/* Loading */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Loader2 className="w-4 h-4 animate-spin text-[#00A86B]" />
          <div>
            <p className="text-xs font-medium text-white/70">Checking against NZ legislation…</p>
            <p className="text-[10px] text-white/40">HSWA 2015 · Privacy Act 2020 · Building Act 2004 · CEA 2018</p>
          </div>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${statusColor[result.overallStatus]}33`,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderBottom: `1px solid ${statusColor[result.overallStatus]}20` }}
            >
              {(() => {
                const Icon = statusIcon[result.overallStatus];
                return (
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${statusColor[result.overallStatus]}15` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: statusColor[result.overallStatus] }} />
                  </div>
                );
              })()}
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: statusColor[result.overallStatus] }}>
                  {result.overallStatus === "clear" && "Compliance Clear"}
                  {result.overallStatus === "caution" && "Caution — Review Required"}
                  {result.overallStatus === "breach" && "Potential Breach Detected"}
                </p>
                <p className="text-[10px] text-white/40">
                  Checked: {result.legislationChecked.join(" · ")}
                </p>
              </div>
              <Shield className="w-5 h-5" style={{ color: `${statusColor[result.overallStatus]}60` }} />
            </div>

            {/* Flags */}
            <div className="px-4 py-2 space-y-1.5 max-h-48 overflow-y-auto">
              {result.flags.map((flag) => (
                <div key={flag.id} className="flex items-start gap-2 py-1.5">
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    style={{ background: statusColor[flag.severity] || statusColor.caution }}
                  />
                  <div className="min-w-0">
                    <p className="text-[11px] text-white/70">
                      <span className="font-medium text-white/90">{flag.legislation}</span>
                      {flag.section && <span className="text-white/40"> · {flag.section}</span>}
                    </p>
                    <p className="text-[10px] text-gray-500">{flag.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Re-check */}
            <div className="px-4 py-2 border-t border-white/[0.04]">
              <button
                onClick={runCheck}
                className="text-[10px] text-white/40 hover:text-white/60 transition-colors"
              >
                Re-run check →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
