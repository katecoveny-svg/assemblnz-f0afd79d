import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Zap, ArrowLeft, ToggleLeft, ToggleRight, ChevronRight, Plus, Users, Home, Trophy, Handshake, MessageSquare, BarChart3, AlertTriangle } from "lucide-react";
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
}

const WORKFLOW_ICONS: Record<string, any> = {
  "New Employee Onboarding": Users,
  "Property Acquired": Home,
  "Tender Won": Trophy,
  "Deal Closed": Handshake,
  "Website Inquiry": MessageSquare,
  "Monthly Business Review": BarChart3,
  "Compliance Alert": AlertTriangle,
};

const glassCard: React.CSSProperties = {
  background: "rgba(14,14,26,0.7)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.06)",
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
          <h1 className="font-syne font-extrabold text-2xl">Symbiotic Workflows</h1>
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
                      <span className="font-syne font-bold text-sm text-foreground">{w.name}</span>
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
                    <div className="pt-3 space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Trigger: {w.trigger_agent} → {w.trigger_event.replace(/_/g, " ")}
                      </p>
                      {w.steps.map((step: any, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
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
