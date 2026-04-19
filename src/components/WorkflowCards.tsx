import { useState } from "react";
import { motion } from "framer-motion";
import { Play, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import WorkflowStepper, { type WorkflowStep } from "./WorkflowStepper";

const KOWHAI = "#4AA5A8";
const POUNAMU = "#3A7D6E";

export interface WorkflowDef {
  id: string;
  title: string;
  titleMi?: string;
  description: string;
  icon: string;
  steps: Omit<WorkflowStep, "status">[];
  packId: string;
}

const HANGA_WORKFLOWS: WorkflowDef[] = [
  {
    id: "hanga-new-project", title: "New Project Setup", titleMi: "Kaupapa Hou",
    description: "Create project → Budget → Team → SSSP → Schedule → QR codes → Induction → Notifications",
    icon: "FolderPlus",
    steps: [
      { id: "create", label: "Create project", agentName: "KAUPAPA", agentIcon: "GanttChart" },
      { id: "budget", label: "Set budget", agentName: "KAUPAPA", agentIcon: "GanttChart" },
      { id: "team", label: "Assign team", agentName: "RAWA", agentIcon: "HardHat" },
      { id: "sssp", label: "Generate SSSP", agentName: "ĀRAI", agentIcon: "ShieldAlert" },
      { id: "schedule", label: "Create schedule", agentName: "KAUPAPA", agentIcon: "GanttChart" },
      { id: "qr", label: "Site QR codes", labelMi: "Tae Mai" },
      { id: "induction", label: "Induction pack", agentName: "ĀRAI", agentIcon: "ShieldAlert" },
      { id: "notify", label: "Notify team", labelMi: "Kōrero" },
    ],
    packId: "waihanga",
  },
  {
    id: "hanga-daily", title: "Daily Site Operations", titleMi: "Mahi o te Rā",
    description: "Check-ins → Hazards → Payment deadlines → Daily briefing → SMS toolbox talk",
    icon: "Sun",
    steps: [
      { id: "checkins", label: "Review check-ins", agentName: "IHO", agentIcon: "Brain" },
      { id: "hazards", label: "Hazard register", agentName: "ĀRAI", agentIcon: "ShieldAlert" },
      { id: "payments", label: "Payment deadlines", agentName: "KAUPAPA", agentIcon: "GanttChart" },
      { id: "briefing", label: "Daily briefing", agentName: "IHO", agentIcon: "Brain" },
      { id: "toolbox", label: "Toolbox talk SMS", labelMi: "Kōrero Haumarutanga" },
    ],
    packId: "waihanga",
  },
  {
    id: "hanga-payment", title: "Payment Claim Cycle", titleMi: "Tono Utu",
    description: "Pull progress → Generate CCA claim → Review → Submit → Track response → Escalate",
    icon: "DollarSign",
    steps: [
      { id: "progress", label: "Pull progress data", agentName: "KAUPAPA", agentIcon: "GanttChart" },
      { id: "generate", label: "Generate CCA claim", agentName: "KAUPAPA", agentIcon: "GanttChart" },
      { id: "review", label: "Review & edit" },
      { id: "submit", label: "Submit claim" },
      { id: "track", label: "Track response (5 days)" },
      { id: "escalate", label: "Escalation if needed", agentName: "KAHU", agentIcon: "FileText" },
    ],
    packId: "waihanga",
  },
  {
    id: "hanga-incident", title: "Incident Response", titleMi: "Ōhorere",
    description: "Capture details → Assess severity → WorkSafe check → Notify → Update register → Investigate",
    icon: "AlertTriangle",
    steps: [
      { id: "capture", label: "Capture details", agentName: "ĀRAI", agentIcon: "ShieldAlert" },
      { id: "assess", label: "Assess severity", agentName: "ĀRAI", agentIcon: "ShieldAlert" },
      { id: "worksafe", label: "WorkSafe notifiable?", agentName: "ĀRAI", agentIcon: "ShieldAlert" },
      { id: "notify", label: "Generate notification" },
      { id: "register", label: "Update risk register" },
      { id: "investigate", label: "Investigation report" },
      { id: "followup", label: "Schedule follow-up" },
    ],
    packId: "waihanga",
  },
];

const MANAAKI_WORKFLOWS: WorkflowDef[] = [
  {
    id: "manaaki-setup", title: "New Venue Setup", titleMi: "Whakatū Whare",
    description: "Business details → Food control plan → Alcohol licence → Staff training → H&S → Calendar",
    icon: "Building",
    steps: [
      { id: "details", label: "Business details" },
      { id: "fcp", label: "Food control plan", agentName: "KAI", agentIcon: "UtensilsCrossed" },
      { id: "alcohol", label: "Alcohol licence", agentName: "KAI", agentIcon: "UtensilsCrossed" },
      { id: "training", label: "Staff training matrix" },
      { id: "hs", label: "H&S register", agentName: "ĀRAI", agentIcon: "ShieldAlert" },
      { id: "calendar", label: "Compliance calendar" },
    ],
    packId: "manaaki",
  },
  {
    id: "manaaki-daily", title: "Daily Operations", titleMi: "Mahi o te Rā",
    description: "Temperature checks → Roster → Allergens → Reviews → Compliance checklist",
    icon: "ClipboardCheck",
    steps: [
      { id: "temps", label: "Temperature checks" },
      { id: "roster", label: "Staff roster" },
      { id: "allergens", label: "Allergen updates", agentName: "KAI", agentIcon: "UtensilsCrossed" },
      { id: "reviews", label: "Guest reviews" },
      { id: "checklist", label: "Daily compliance" },
    ],
    packId: "manaaki",
  },
  {
    id: "manaaki-audit", title: "Audit Preparation", titleMi: "Arotake",
    description: "Identify audit type → Evidence checklist → Gap review → Documentation → Mock audit",
    icon: "Search",
    steps: [
      { id: "type", label: "Audit type (MPI/DLC)" },
      { id: "evidence", label: "Evidence checklist", agentName: "KAI", agentIcon: "UtensilsCrossed" },
      { id: "gaps", label: "Compliance gaps" },
      { id: "docs", label: "Prepare documents" },
      { id: "brief", label: "Staff briefing" },
      { id: "mock", label: "Mock audit walkthrough" },
    ],
    packId: "manaaki",
  },
];

export const ALL_WORKFLOWS: Record<string, WorkflowDef[]> = {
  hanga: HANGA_WORKFLOWS,
  waihanga: HANGA_WORKFLOWS,
  manaaki: MANAAKI_WORKFLOWS,
};

interface WorkflowCardsProps {
  packId: string;
}

const WorkflowCards = ({ packId }: WorkflowCardsProps) => {
  const workflows = ALL_WORKFLOWS[packId] || [];
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [workflowStates, setWorkflowStates] = useState<Record<string, Record<string, WorkflowStep["status"]>>>({});

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon size={18} /> : null;
  };

  const startWorkflow = (wfId: string) => {
    const wf = workflows.find(w => w.id === wfId);
    if (!wf) return;
    const states: Record<string, WorkflowStep["status"]> = {};
    wf.steps.forEach((s, i) => { states[s.id] = i === 0 ? "active" : "pending"; });
    setWorkflowStates(prev => ({ ...prev, [wfId]: states }));
    setActiveWorkflow(wfId);
  };

  const advanceStep = (wfId: string, stepId: string) => {
    setWorkflowStates(prev => {
      const wf = workflows.find(w => w.id === wfId);
      if (!wf) return prev;
      const current = { ...prev[wfId] };
      const stepIdx = wf.steps.findIndex(s => s.id === stepId);
      current[stepId] = "completed";
      if (stepIdx < wf.steps.length - 1) {
        current[wf.steps[stepIdx + 1].id] = "active";
      }
      return { ...prev, [wfId]: current };
    });
  };

  const skipStep = (wfId: string, stepId: string) => {
    setWorkflowStates(prev => {
      const wf = workflows.find(w => w.id === wfId);
      if (!wf) return prev;
      const current = { ...prev[wfId] };
      const stepIdx = wf.steps.findIndex(s => s.id === stepId);
      current[stepId] = "skipped";
      if (stepIdx < wf.steps.length - 1) {
        current[wf.steps[stepIdx + 1].id] = "active";
      }
      return { ...prev, [wfId]: current };
    });
  };

  if (workflows.length === 0) return null;

  return (
    <div>
      {/* Active workflow stepper */}
      {activeWorkflow && workflowStates[activeWorkflow] && (() => {
        const wf = workflows.find(w => w.id === activeWorkflow)!;
        const steps: WorkflowStep[] = wf.steps.map(s => ({
          ...s,
          status: workflowStates[activeWorkflow][s.id] || "pending",
        }));
        return (
          <WorkflowStepper
            title={`${wf.title} — ${wf.titleMi || ""}`}
            steps={steps}
            onStepClick={(id) => advanceStep(activeWorkflow, id)}
            onSkip={(id) => skipStep(activeWorkflow, id)}
          />
        );
      })()}

      {/* Workflow cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {workflows.map((wf, i) => {
          const isActive = activeWorkflow === wf.id;
          const state = workflowStates[wf.id];
          const completedCount = state ? Object.values(state).filter(s => s === "completed").length : 0;
          const totalSteps = wf.steps.length;

          return (
            <motion.div
              key={wf.id}
              className="rounded-2xl border p-5 cursor-pointer transition-all group"
              style={{
                background: isActive
                  ? "linear-gradient(135deg, rgba(212,168,67,0.08), rgba(58,125,110,0.06))"
                  : "rgba(255,255,255,0.65)",
                borderColor: isActive ? "rgba(212,168,67,0.25)" : "rgba(255,255,255,0.5)",
                boxShadow: isActive ? "0 0 30px rgba(212,168,67,0.08)" : "8px 8px 24px rgba(166,166,180,0.28), -6px -6px 18px rgba(255,255,255,0.95)",
              }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              onClick={() => !state ? startWorkflow(wf.id) : setActiveWorkflow(wf.id)}
              whileHover={{ boxShadow: "0 0 40px rgba(212,168,67,0.12)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: isActive ? "rgba(212,168,67,0.15)" : "rgba(255,255,255,0.5)",
                      color: isActive ? KOWHAI : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {getIcon(wf.icon)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{wf.title}</h4>
                    {wf.titleMi && (
                      <p className="text-[10px]" style={{ color: "rgba(212,168,67,0.5)" }}>{wf.titleMi}</p>
                    )}
                  </div>
                </div>
                {state ? (
                  <div className="flex items-center gap-1.5 text-[10px]" style={{ color: completedCount === totalSteps ? POUNAMU : "rgba(255,255,255,0.35)" }}>
                    {completedCount === totalSteps ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {completedCount}/{totalSteps}
                  </div>
                ) : (
                  <Play size={14} className="text-white/20 group-hover:text-gray-500 transition-colors" />
                )}
              </div>

              <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                {wf.description}
              </p>

              {state && (
                <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.5)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${POUNAMU}, ${KOWHAI})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedCount / totalSteps) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowCards;
