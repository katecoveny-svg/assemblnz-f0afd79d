import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Zap, ArrowLeft, ToggleLeft, ToggleRight, ChevronRight, Plus, Users, Home, Trophy, Handshake, MessageSquare, BarChart3, AlertTriangle, FileText, CalendarClock, HardHat, Receipt, Ship, Building2, ShieldCheck, Eye, Route, BookOpen, Layers, Scale, Package, Hash, PenTool, FileCheck, Forward, FileDigit, Ban } from "lucide-react";
import ParticleField from "@/components/ParticleField";
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
  background: "rgba(14,14,26,0.7)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(74,165,168,0.15)",
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
    // System workflows can't be toggled by non-owners, but we allow toggling display
    setWorkflows((prev) => prev.map((w) => w.id === id ? { ...w, is_active: !current } : w));
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <ParticleField />
      <BrandNav />
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24 pb-20">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Zap size={24} className="text-[#5AADA0]" />
          <h1 className="font-display font-light text-2xl">Symbiotic Workflows</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8">When one agent acts, others follow automatically. Configure your agent chain reactions.</p>

        <div className="space-y-3">
          {workflows.map((w) => {
            const Icon = WORKFLOW_ICONS[w.name] || Zap;
            const isExpanded = expanded === w.id;

            return (
              <div key={w.id} className="rounded-xl overflow-hidden" style={glassCard}>
                <button
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : w.id)}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#5AADA015" }}>
                    <Icon size={18} className="text-[#5AADA0]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-foreground">{w.name}</span>
                      {w.is_system && <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#5AADA015] text-[#5AADA0] font-medium">SYSTEM</span>}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{w.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleActive(w.id, w.is_active); }}
                      className="transition-colors"
                    >
                      {w.is_active ? (
                        <ToggleRight size={24} className="text-[#5AADA0]" />
                      ) : (
                        <ToggleLeft size={24} className="text-muted-foreground/40" />
                      )}
                    </button>
                    <ChevronRight size={16} className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-white/[0.04]">
                    <div className="pt-3 space-y-4">
                      {/* Pipeline trace */}
                      <div>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Pipeline</p>
                        <div className="flex items-center gap-1">
                          {PIPELINE_STAGES.map((stage, i) => {
                            const StageIcon = stage.icon;
                            return (
                              <div key={stage.key} className="flex items-center gap-1">
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#5AADA008] border border-[#5AADA020]">
                                  <StageIcon size={12} className="text-[#5AADA0]" />
                                  <div>
                                    <span className="text-[10px] font-bold text-foreground block leading-tight">{stage.label}</span>
                                    <span className="text-[8px] text-muted-foreground leading-tight">{stage.desc}</span>
                                  </div>
                                </div>
                                {i < PIPELINE_STAGES.length - 1 && <span className="text-[10px] text-muted-foreground/40">→</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Relevant Acts */}
                      {w.relevant_acts && w.relevant_acts.length > 0 && (
                        <div>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Legislation checked at Mana gate</p>
                          <div className="flex flex-wrap gap-1.5">
                            {w.relevant_acts.map((act) => (
                              <span key={act} className="text-[9px] px-2 py-0.5 rounded-full bg-[#5AADA010] border border-[#5AADA020] text-[#5AADA0] font-medium">
                                {act}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mana gate enforcement */}
                      <div className="rounded-lg p-3" style={{ background: "rgba(220, 38, 38, 0.04)", border: "1px solid rgba(220, 38, 38, 0.12)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Ban size={12} className="text-red-400" />
                          <p className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Kete refuses to close pack if Mana gate fails</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {MANA_GATE_CHECKS.map((check) => (
                            <div key={check.label} className="text-center">
                              <span className="text-[10px] font-bold text-foreground block">{check.label}</span>
                              <span className="text-[8px] text-muted-foreground">{check.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Evidence pack output */}
                      <div>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Output → Evidence pack</p>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { icon: PenTool, label: "Signed" },
                            { icon: Hash, label: "SHA-256 hashed" },
                            { icon: FileCheck, label: "Sourced" },
                            { icon: Package, label: "File-able (.zip)" },
                            { icon: Forward, label: "Forward-able" },
                            { icon: FileDigit, label: "Footnote-able" },
                          ].map(({ icon: Ico, label }) => (
                            <span key={label} className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-[#D4A01215] border border-[#D4A01230] text-[#D4A012] font-medium">
                              <Ico size={10} /> {label}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Trigger + Steps */}
                      <div>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                          Trigger: {w.trigger_agent} → {w.trigger_event.replace(/_/g, " ")}
                        </p>
                        {w.steps.map((step: any, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-xs mb-1.5">
                            <div className="w-5 h-5 rounded-full bg-[#5AADA015] flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-[9px] font-bold text-[#5AADA0]">{i + 1}</span>
                            </div>
                            <div>
                              <span className="font-bold text-foreground">{step.target}</span>
                              <span className="text-muted-foreground ml-1">{step.action}</span>
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
    </div>
  );
};

export default WorkflowSettings;
