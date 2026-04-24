// ═══════════════════════════════════════════════════════════════
// Sovereignty Panel — Integrated into kete dashboards
// Shows Māori data registry, governance gates, and audit trail
// Brand palette: Gold #4AA5A8, Pounamu #3A7D6E/#5AADA0, Navy #1A3A5C, Bone #F5F0E8
// ═══════════════════════════════════════════════════════════════

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Eye, Lock, Globe, AlertTriangle, CheckCircle, XCircle, Clock, ChevronDown, ChevronRight, Database, FileText, Activity } from "lucide-react";
import DashboardGlassCard from "@/components/kete/DashboardGlassCard";
import { useSovereigntyStats } from "@/hooks/useSovereigntyData";

interface SovereigntyPanelProps {
  kete: string;
  accentColor: string;
}

// Mārama brand-compliant status colors
const TAPU_COLOR = "#C85A54";   // Warm red — Mārama earth tone
const NOA_COLOR = "#5AADA0";    // Pounamu teal
const PENDING_COLOR = "#4AA5A8"; // Kōwhai gold

const SovereigntyPanel: React.FC<SovereigntyPanelProps> = ({ kete, accentColor }) => {
  const stats = useSovereigntyStats(kete);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggle = (s: string) => setExpandedSection(prev => prev === s ? null : s);

  const statCards = [
    { label: "Māori Datasets", value: stats.maoriDatasets, icon: Database, color: accentColor },
    { label: "Tapu Classified", value: stats.tapuDatasets, icon: Lock, color: TAPU_COLOR },
    { label: "NZ-Only Storage", value: stats.nzOnlyDatasets, icon: Globe, color: "#3A7D6E" },
    { label: "Pending Gates", value: stats.pendingGates, icon: Clock, color: PENDING_COLOR },
    { label: "Approved Gates", value: stats.approvedGates, icon: CheckCircle, color: NOA_COLOR },
    { label: "Audit Entries", value: stats.totalAuditEntries, icon: Activity, color: "#1A3A5C" },
  ];

  return (
    <DashboardGlassCard accentColor={accentColor} glow className="p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `rgba(${hexToRgb(accentColor)}, 0.15)` }}>
          <Shield size={18} style={{ color: accentColor }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white/90 tracking-wide">Māori Data Sovereignty</h3>
          <p className="text-[10px] text-white/40">Te Mana Raraunga Control Plane</p>
        </div>
        {stats.pendingGates > 0 && (
          <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "rgba(74,165,168,0.2)", color: PENDING_COLOR }}>
            {stats.pendingGates} pending
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {statCards.map(s => (
          <div key={s.label} className="rounded-lg p-2.5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <s.icon size={14} className="mx-auto mb-1" style={{ color: s.color }} />
            <div className="text-lg font-bold text-white/90" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {stats.isLoading ? "—" : s.value}
            </div>
            <div className="text-[9px] text-white/40 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Expandable Sections */}
      <div className="space-y-2">
        <CollapsibleSection
          title="Data Registry"
          icon={Database}
          color={accentColor}
          count={stats.maoriDatasets}
          expanded={expandedSection === "registry"}
          onToggle={() => toggle("registry")}
        >
          {stats.registry.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">No datasets registered yet</p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {stats.registry.slice(0, 10).map(r => (
                <div key={r.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <ClassificationBadge classification={r.tapu_noa_classification} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/80 truncate">{r.dataset_name}</p>
                    <p className="text-[9px] text-gray-400">{r.locality_restriction} · {r.governance_status}</p>
                  </div>
                  <StatusDot status={r.governance_status} />
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          title="Governance Gates"
          icon={FileText}
          color={PENDING_COLOR}
          count={stats.pendingGates}
          expanded={expandedSection === "gates"}
          onToggle={() => toggle("gates")}
        >
          {stats.gates.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">No governance gates created yet</p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {stats.gates.slice(0, 10).map(g => (
                <div key={g.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <GateStatusIcon status={g.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/80 truncate">{g.purpose}</p>
                    <p className="text-[9px] text-gray-400">{g.gate_type} · {new Date(g.created_at).toLocaleDateString("en-NZ")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          title="Audit Trail"
          icon={Eye}
          color="#1A3A5C"
          count={stats.totalAuditEntries}
          expanded={expandedSection === "audit"}
          onToggle={() => toggle("audit")}
        >
          {stats.audit.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">No audit entries yet</p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {stats.audit.slice(0, 15).map(a => (
                <div key={a.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                  {a.decision === "deny" ? (
                    <XCircle size={12} style={{ color: TAPU_COLOR }} />
                  ) : (
                    <CheckCircle size={12} style={{ color: NOA_COLOR }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/80 truncate">{a.action_type}</p>
                    <p className="text-[9px] text-gray-400">
                      {a.agent_code ?? "unknown"} · {a.purpose_declared ?? "no purpose"} · {new Date(a.created_at).toLocaleTimeString("en-NZ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>
      </div>

      {/* Sovereignty Principles Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4 text-[9px] text-white/25">
          <span>Rangatiratanga</span>
          <span>·</span>
          <span>Kaitiakitanga</span>
          <span>·</span>
          <span>Whakapapa</span>
          <span>·</span>
          <span>Manaakitanga</span>
        </div>
      </div>
    </DashboardGlassCard>
  );
};

// ── Sub-components ────────────────────────────────────────────

const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ElementType;
  color: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, icon: Icon, color, count, expanded, onToggle, children }) => (
  <div className="rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
    <button onClick={onToggle} className="w-full flex items-center gap-2 px-3 py-2 text-left">
      <Icon size={13} style={{ color }} />
      <span className="text-xs text-white/70 flex-1">{title}</span>
      <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `rgba(${hexToRgb(color)}, 0.12)`, color }}>
        {count}
      </span>
      {expanded ? <ChevronDown size={12} className="text-gray-400" /> : <ChevronRight size={12} className="text-gray-400" />}
    </button>
    <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden px-3 pb-2"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const ClassificationBadge: React.FC<{ classification: string }> = ({ classification }) => {
  const color = classification === "tapu" ? TAPU_COLOR : classification === "noa" ? NOA_COLOR : "#1A3A5C";
  return (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: `rgba(${hexToRgb(color)}, 0.15)`, color }}>
      {classification.toUpperCase()}
    </span>
  );
};

const StatusDot: React.FC<{ status: string }> = ({ status }) => {
  const color = status === "approved" ? NOA_COLOR : status === "declined" ? TAPU_COLOR : status === "expired" ? "#1A3A5C" : PENDING_COLOR;
  return <div className="w-2 h-2 rounded-full" style={{ background: color }} />;
};

const GateStatusIcon: React.FC<{ status: string }> = ({ status }) => {
  if (status === "approved" || status === "approved_with_conditions") return <CheckCircle size={12} style={{ color: NOA_COLOR }} />;
  if (status === "declined") return <XCircle size={12} style={{ color: TAPU_COLOR }} />;
  if (status === "pending") return <Clock size={12} style={{ color: PENDING_COLOR }} />;
  return <AlertTriangle size={12} style={{ color: "#1A3A5C" }} />;
};

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export default SovereigntyPanel;
