import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Zap, ArrowLeft, ToggleLeft, ToggleRight, ChevronRight, Users, Home, Trophy, Handshake, MessageSquare, BarChart3, AlertTriangle, FileText, CalendarClock, HardHat, Receipt, Ship, Building2, ShieldCheck, Route, BookOpen, Layers, Scale, Package, Hash, PenTool, FileCheck, Forward, FileDigit, Ban } from "lucide-react";
import LightPageShell from "@/components/LightPageShell";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  trigger_agent: string;
  trigger_event: string;
  steps: any[];
  is_active: boolean;
  is_system: boolean;
  relevant_acts: string[];
}

const PIPELINE_STAGES = [
  { key: "kahu", label: "Kahu", desc: "PII mask", icon: ShieldCheck },
  { key: "iho", label: "Iho", desc: "Route", icon: Route },
  { key: "ta", label: "Tā", desc: "Audit log", icon: BookOpen },
  { key: "mahara", label: "Mahara", desc: "Memory", icon: Layers },
  { key: "mana", label: "Mana", desc: "Tikanga · Privacy · Sector Acts", icon: Scale },
] as const;

const MANA_GATE_CHECKS = [
  { label: "Tikanga", desc: "Macrons, Te Reo accuracy, cultural respect" },
  { label: "Privacy Act 2020", desc: "PII masked, IPP 3A disclosure" },
  { label: "Sector Acts", desc: "Statutory citations for referenced legislation" },
] as const;

const WORKFLOW_ICONS: Record<string, any> = {
  "New Employee Onboarding": Users,
  "Property Acquired": Home,
  "Tender Won": Trophy,
  "Deal Closed": Handshake,
  "Website Inquiry": MessageSquare,
  "Monthly Business Review": BarChart3,
  "Compliance Alert": AlertTriangle,
  "Quote Requested": FileText,
  "Roster Shift Gap": CalendarClock,
  "Site Induction": HardHat,
  "Payment Claim": Receipt,
  "Customs Entry": Ship,
  "Building Consent": Building2,
};

const glassCard: React.CSSProperties = {
  background: "#FAFBFC",
  boxShadow: `
    6px 6px 16px rgba(166,166,180,0.35),
    -6px -6px 16px rgba(255,255,255,0.85),
    inset 0 1px 0 rgba(255,255,255,0.6)
  `,
};

const WorkflowSettings = () => {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("workflow_templates")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setWorkflows(data as any);
      });
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    setWorkflows((prev) => prev.map((w) => w.id === id ? { ...w, is_active: !current } : w));
  };

  return (
    <LightPageShell>
      <BrandNav />
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24 pb-20">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs text-[#3D4250]/50 hover:text-[#3D4250]/80 mb-6">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Zap size={24} className="text-[#4AA5A8]" />
          <h1 className="font-display font-light text-2xl text-[#3D4250]">Symbiotic Workflows</h1>
        </div>
        <p className="text-sm text-[#3D4250]/50 mb-8">When one agent acts, others follow automatically. Configure your agent chain reactions.</p>

        <div className="space-y-3">
          {workflows.map((w) => {
            const Icon = WORKFLOW_ICONS[w.name] || Zap;
            const isExpanded = expanded === w.id;

            return (
              <div key={w.id} className="rounded-xl overflow-hidden" style={glassCard}>
                <button
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#4AA5A8]/[0.03] transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : w.id)}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(74,165,168,0.08)" }}>
                    <Icon size={18} className="text-[#4AA5A8]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-[#3D4250]">{w.name}</span>
                      {w.is_system && <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#4AA5A8]/10 text-[#4AA5A8] font-medium">SYSTEM</span>}
                    </div>
                    <p className="text-[11px] text-[#3D4250]/50 mt-0.5 truncate">{w.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleActive(w.id, w.is_active); }}
                      className="transition-colors"
                    >
                      {w.is_active ? (
                        <ToggleRight size={24} className="text-[#4AA5A8]" />
                      ) : (
                        <ToggleLeft size={24} className="text-[#3D4250]/25" />
                      )}
                    </button>
                    <ChevronRight size={16} className={`text-[#3D4250]/30 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-[#4AA5A8]/[0.08]">
                    <div className="pt-3 space-y-4">
                      {/* Pipeline trace */}
                      <div>
                        <p className="text-[9px] font-bold text-[#3D4250]/40 uppercase tracking-wider mb-2">Pipeline</p>
                        <div className="flex items-center gap-1 flex-wrap">
                          {PIPELINE_STAGES.map((stage, i) => {
                            const StageIcon = stage.icon;
                            return (
                              <div key={stage.key} className="flex items-center gap-1">
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#4AA5A8]/[0.05] border border-[#4AA5A8]/[0.1]">
                                  <StageIcon size={12} className="text-[#4AA5A8]" />
                                  <div>
                                    <span className="text-[10px] font-bold text-[#3D4250] block leading-tight">{stage.label}</span>
                                    <span className="text-[8px] text-[#3D4250]/40 leading-tight">{stage.desc}</span>
                                  </div>
                                </div>
                                {i < PIPELINE_STAGES.length - 1 && <span className="text-[10px] text-[#3D4250]/25">→</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Relevant Acts */}
                      {w.relevant_acts && w.relevant_acts.length > 0 && (
                        <div>
                          <p className="text-[9px] font-bold text-[#3D4250]/40 uppercase tracking-wider mb-1.5">Legislation checked at Mana gate</p>
                          <div className="flex flex-wrap gap-1.5">
                            {w.relevant_acts.map((act) => (
                              <span key={act} className="text-[9px] px-2 py-0.5 rounded-full bg-[#4AA5A8]/[0.06] border border-[#4AA5A8]/[0.12] text-[#3A7D6E] font-medium">
                                {act}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mana gate enforcement */}
                      <div className="rounded-lg p-3" style={{ background: "rgba(220, 38, 38, 0.04)", border: "1px solid rgba(220, 38, 38, 0.10)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Ban size={12} className="text-red-500" />
                          <p className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Kete refuses to close pack if Mana gate fails</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {MANA_GATE_CHECKS.map((check) => (
                            <div key={check.label} className="text-center">
                              <span className="text-[10px] font-bold text-[#3D4250] block">{check.label}</span>
                              <span className="text-[8px] text-[#3D4250]/40">{check.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Evidence pack output */}
                      <div>
                        <p className="text-[9px] font-bold text-[#3D4250]/40 uppercase tracking-wider mb-1.5">Output → Evidence pack</p>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { icon: PenTool, label: "Signed" },
                            { icon: Hash, label: "SHA-256 hashed" },
                            { icon: FileCheck, label: "Sourced" },
                            { icon: Package, label: "File-able (.zip)" },
                            { icon: Forward, label: "Forward-able" },
                            { icon: FileDigit, label: "Footnote-able" },
                          ].map(({ icon: Ico, label }) => (
                            <span key={label} className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-[#4AA5A8]/[0.08] border border-[#4AA5A8]/[0.15] text-[#B8860B] font-medium">
                              <Ico size={10} /> {label}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Trigger + Steps */}
                      <div>
                        <p className="text-[9px] font-bold text-[#3D4250]/40 uppercase tracking-wider mb-2">
                          Trigger: {w.trigger_agent} → {w.trigger_event.replace(/_/g, " ")}
                        </p>
                        {w.steps.map((step: any, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-xs mb-1.5">
                            <div className="w-5 h-5 rounded-full bg-[#4AA5A8]/10 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-[9px] font-bold text-[#4AA5A8]">{i + 1}</span>
                            </div>
                            <div>
                              <span className="font-bold text-[#3D4250]">{step.target}</span>
                              <span className="text-[#3D4250]/50 ml-1">{step.action}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <BrandFooter />
    </LightPageShell>
  );
};

export default WorkflowSettings;
