// ═══════════════════════════════════════════════════════════════
// First-run / empty-state for the workspace dashboard.
// Shows when the user has no workflows in their plan yet.
// Inspires action with suggested workflows + a "Load sample data" toggle.
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Plug, Play, FileText, ArrowRight, ToggleLeft, ToggleRight } from "lucide-react";

export interface EmptyWorkspaceStateProps {
  accent: string;
  keteKey: string; // e.g. "MANAAKI"
  keteLabel: string;
  /** Called when user toggles sample data on/off */
  onSampleDataChange?: (enabled: boolean) => void;
}

type Suggestion = {
  title: string;
  desc: string;
  saving: string;
  href: string;
  icon: React.ComponentType<any>;
};

const SUGGESTIONS: Record<string, Suggestion[]> = {
  MANAAKI: [
    { title: "Booking compliance check", desc: "Allergens, alcohol licence, duty manager — verified before guest arrival.", saving: "1.5 hrs/wk", href: "/manaaki", icon: FileText },
    { title: "Food safety pack", desc: "Daily Food Control Plan checks logged automatically.", saving: "2 hrs/wk", href: "/manaaki", icon: FileText },
    { title: "Guest review reply drafts", desc: "Brand-tone responses ready for your sign-off.", saving: "45 min/wk", href: "/manaaki", icon: FileText },
  ],
  WAIHANGA: [
    { title: "Subbie onboarding pack", desc: "Insurance, SWMS, induction logs collected and verified.", saving: "3 hrs/wk", href: "/waihanga/about", icon: FileText },
    { title: "Daily site diary", desc: "Weather, hazards, deliveries — captured by voice and signed off.", saving: "2.5 hrs/wk", href: "/waihanga/about", icon: FileText },
    { title: "Payment claim discipline", desc: "CCA-2002 compliant claims, retention ledger, dispute timeline.", saving: "4 hrs/wk", href: "/waihanga/about", icon: FileText },
  ],
  AUAHA: [
    { title: "Campaign approval pack", desc: "FTA claim review, brand consistency, platform briefs.", saving: "2 hrs/wk", href: "/auaha/about", icon: FileText },
    { title: "Brand-tone copy drafts", desc: "Social, email, ad copy — ready for your edit.", saving: "3 hrs/wk", href: "/auaha/ads", icon: FileText },
    { title: "Visual asset generation", desc: "On-brand images and video with watermark + evidence pack.", saving: "5 hrs/wk", href: "/auaha/generate", icon: FileText },
  ],
  ARATAKI: [
    { title: "Vehicle delivery checklist", desc: "WoF/CoF, MVSA disclosures, customer guarantees on handover.", saving: "1 hr/wk", href: "/arataki", icon: FileText },
    { title: "Fleet fuel & route economy", desc: "Anomaly detection on fuel cards and route times.", saving: "2 hrs/wk", href: "/arataki", icon: FileText },
    { title: "Driver compliance log", desc: "Licence currency, work-time records, incident summaries.", saving: "1.5 hrs/wk", href: "/arataki", icon: FileText },
  ],
  PIKAU: [
    { title: "Customs entry pack", desc: "HS codes, MPI biosecurity standards, landed-cost workings.", saving: "2.5 hrs/wk", href: "/pikau", icon: FileText },
    { title: "Carrier rate audit", desc: "Invoices vs quoted rates with discrepancy flags.", saving: "3 hrs/wk", href: "/pikau", icon: FileText },
    { title: "Shipment exception alerts", desc: "Delays surfaced to the right person before customers ask.", saving: "2 hrs/wk", href: "/pikau", icon: FileText },
  ],
  HOKO: [
    { title: "Property compliance pack", desc: "Healthy Homes, smoke alarms, insurance — bundled by property.", saving: "2 hrs/wk", href: "/hoko", icon: FileText },
    { title: "Tenant communications", desc: "Notices, rent reviews, repair updates — from one inbox.", saving: "1.5 hrs/wk", href: "/hoko", icon: FileText },
    { title: "End-of-tenancy bond pack", desc: "Photos, ledger, condition report packaged for Tenancy Tribunal.", saving: "3 hrs/wk", href: "/hoko", icon: FileText },
  ],
  AKO: [
    { title: "Lesson-plan compliance", desc: "Curriculum mapping, learner outcomes, evidence logged.", saving: "2 hrs/wk", href: "/ako", icon: FileText },
    { title: "Family communications", desc: "Brand-tone updates and incident notes ready to send.", saving: "1.5 hrs/wk", href: "/ako", icon: FileText },
    { title: "Compliance review pack", desc: "ERO-ready bundle drawn from your everyday records.", saving: "4 hrs/wk", href: "/ako", icon: FileText },
  ],
};

const DEFAULT_SUGGESTIONS = SUGGESTIONS.MANAAKI;

export default function EmptyWorkspaceState({ accent, keteKey, keteLabel, onSampleDataChange }: EmptyWorkspaceStateProps) {
  const [sampleData, setSampleData] = useState(false);
  const suggestions = SUGGESTIONS[keteKey] ?? DEFAULT_SUGGESTIONS;

  function toggleSample() {
    const next = !sampleData;
    setSampleData(next);
    onSampleDataChange?.(next);
  }

  return (
    <div className="space-y-4">
      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${accent}10 0%, rgba(255,255,255,0.6) 60%)`,
          border: `1px solid ${accent}25`,
        }}
      >
        <div
          className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-30 blur-3xl"
          style={{ background: accent }}
        />
        <div className="relative">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] tracking-[2px] uppercase mb-4"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              background: "rgba(255,255,255,0.7)",
              color: accent,
              border: `1px solid ${accent}30`,
            }}
          >
            <Sparkles size={10} /> Welcome to your workspace
          </div>
          <h2 className="text-[22px] font-light leading-tight mb-2" style={{ color: "#3D4250" }}>
            Let's run your first {keteLabel.toLowerCase()} workflow.
          </h2>
          <p className="text-sm mb-5" style={{ color: "#6B7280" }}>
            Pick a suggested workflow below, or explore with sample data so you can see what an evidence pack looks like before you connect any tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              to="/workspace/connections"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium"
              style={{ background: accent, color: "#fff" }}
            >
              <Plug size={12} /> Connect your first tool <ArrowRight size={11} />
            </Link>
            <button
              onClick={toggleSample}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium"
              style={{
                background: "rgba(255,255,255,0.75)",
                color: "#3D4250",
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              {sampleData ? <ToggleRight size={14} style={{ color: accent }} /> : <ToggleLeft size={14} />}
              Sample data {sampleData ? "on" : "off"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Suggested workflows */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5"
        style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,165,168,0.15)" }}
      >
        <h3 className="text-sm font-semibold mb-1 flex items-center gap-2" style={{ color: "#3D4250" }}>
          <Play size={15} style={{ color: accent }} /> Suggested workflows for {keteLabel.toLowerCase()}
        </h3>
        <p className="text-[11px] mb-4" style={{ color: "#9CA3AF" }}>
          Hand-picked starting points based on what works for similar NZ businesses.
        </p>
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <Link
              key={i}
              to={s.href}
              className="block p-3 rounded-xl group transition-all hover:-translate-y-0.5"
              style={{
                background: sampleData ? `${accent}08` : "rgba(255,255,255,0.55)",
                border: `1px solid ${sampleData ? `${accent}20` : "rgba(0,0,0,0.04)"}`,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                    style={{ background: `${accent}12` }}
                  >
                    <s.icon size={14} style={{ color: accent }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium" style={{ color: "#3D4250" }}>
                      {s.title}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: "#6B7280" }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded shrink-0"
                    style={{ background: `${accent}15`, color: accent }}
                  >
                    ~{s.saving}
                  </span>
                  <ArrowRight
                    size={12}
                    className="opacity-40 group-hover:opacity-100 transition-opacity"
                    style={{ color: accent }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {sampleData && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 text-center"
          style={{ background: `${accent}06`, border: `1px dashed ${accent}40` }}
        >
          <p className="text-[12px]" style={{ color: "#6B7280" }}>
            <Sparkles size={12} className="inline mr-1" style={{ color: accent }} />
            Sample data loaded. Open any suggested workflow to see a fully-populated evidence pack.
          </p>
        </motion.div>
      )}
    </div>
  );
}
