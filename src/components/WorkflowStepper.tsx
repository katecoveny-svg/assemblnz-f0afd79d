import { motion } from "framer-motion";
import { Check, SkipForward, AlertTriangle } from "lucide-react";
import * as LucideIcons from "lucide-react";

const KOWHAI = "#4AA5A8";
const POUNAMU = "#3A7D6E";

export interface WorkflowStep {
  id: string;
  label: string;
  labelMi?: string;
  agentName?: string;
  agentIcon?: string;
  status: "completed" | "active" | "pending" | "skipped";
}

interface Props {
  steps: WorkflowStep[];
  title: string;
  onStepClick?: (stepId: string) => void;
  onSkip?: (stepId: string) => void;
}

const WorkflowStepper = ({ steps, title, onStepClick, onSkip }: Props) => {
  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon size={12} /> : null;
  };

  return (
    <div className="rounded-2xl border p-5 mb-6" style={{
      background: "linear-gradient(145deg, rgba(255,255,255,0.78), rgba(255,255,255,0.62))",
      borderColor: "rgba(255,255,255,0.5)",
    }}>
      <h3 className="text-sm font-bold text-foreground mb-4" style={{ fontFamily: "'Lato', sans-serif" }}>
        {title}
      </h3>

      <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <div key={step.id} className="flex items-center shrink-0">
              <motion.button
                onClick={() => onStepClick?.(step.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] transition-all relative group"
                style={{
                  background:
                    step.status === "active" ? "rgba(212,168,67,0.15)" :
                    step.status === "completed" ? "rgba(58,125,110,0.12)" :
                    step.status === "skipped" ? "rgba(255,255,255,0.5)" :
                    "rgba(255,255,255,0.5)",
                  border: `1px solid ${
                    step.status === "active" ? "rgba(212,168,67,0.3)" :
                    step.status === "completed" ? "rgba(58,125,110,0.2)" :
                    "rgba(255,255,255,0.5)"
                  }`,
                  color:
                    step.status === "active" ? KOWHAI :
                    step.status === "completed" ? POUNAMU :
                    "rgba(255,255,255,0.35)",
                }}
                whileHover={{ scale: 1.02 }}
              >
                {step.status === "completed" && <Check size={12} />}
                {step.status === "skipped" && <SkipForward size={10} />}
                {step.status === "active" && (
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: KOWHAI }} />
                )}
                {step.agentIcon && getIcon(step.agentIcon)}
                <span className="font-medium whitespace-nowrap">{step.label}</span>

                {step.status === "pending" && onSkip && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onSkip(step.id); }}
                    className="hidden group-hover:flex items-center gap-1 text-[9px] text-yellow-500/60 hover:text-yellow-500 ml-1"
                    title="Skip — some data may be incomplete"
                  >
                    <AlertTriangle size={9} /> Skip
                  </button>
                )}
              </motion.button>

              {!isLast && (
                <div className="w-4 h-px mx-0.5" style={{
                  background: step.status === "completed" ? POUNAMU : "rgba(255,255,255,0.1)"
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowStepper;
