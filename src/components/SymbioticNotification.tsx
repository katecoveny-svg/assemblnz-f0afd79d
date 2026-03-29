import { useState, useEffect } from "react";
import { X, ExternalLink, Zap, Check, Loader2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { agents, echoAgent } from "@/data/agents";

const ALL_AGENTS = [echoAgent, ...agents];
const agentColorMap: Record<string, string> = {};
ALL_AGENTS.forEach((a) => { agentColorMap[a.name.toUpperCase()] = a.color; });

interface TriggerStep {
  target: string;
  action: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: string;
}

interface WorkflowNotification {
  workflowName: string;
  steps: TriggerStep[];
  startedAt: string;
}

interface Props {
  agentColor: string;
  notification: WorkflowNotification | null;
  onDismiss: () => void;
  onViewAll: () => void;
}

const SymbioticNotification = ({ agentColor, notification, onDismiss, onViewAll }: Props) => {
  if (!notification) return null;

  const completedCount = notification.steps.filter((s) => s.status === "completed").length;
  const totalCount = notification.steps.length;

  return (
    <div
      className="mx-3 mt-2 rounded-xl border p-3 animate-in slide-in-from-top-2"
      style={{
        background: "rgba(14,14,26,0.85)",
        backdropFilter: "blur(16px)",
        borderColor: agentColor + "30",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap size={14} style={{ color: agentColor }} />
          <span className="font-syne font-bold text-xs text-foreground">SYMBIOTIC: {notification.workflowName}</span>
        </div>
        <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
      </div>

      <div className="space-y-1.5">
        {notification.steps.map((step, i) => {
          const color = agentColorMap[step.target] || agentColor;
          return (
            <div key={i} className="flex items-center gap-2 text-[11px]">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="font-bold" style={{ color }}>{step.target}</span>
              <span className="text-muted-foreground truncate flex-1">{step.action.substring(0, 60)}...</span>
              {step.status === "completed" && <Check size={12} className="text-green-400 shrink-0" />}
              {step.status === "processing" && <Loader2 size={12} className="animate-spin shrink-0" style={{ color }} />}
              {step.status === "pending" && <Clock size={12} className="text-muted-foreground/40 shrink-0" />}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t" style={{ borderColor: agentColor + "15" }}>
        <span className="text-[10px] text-muted-foreground">{completedCount}/{totalCount} steps done</span>
        <div className="flex gap-2">
          <button onClick={onViewAll} className="text-[10px] font-medium px-2 py-1 rounded-md hover:opacity-80" style={{ color: agentColor, border: `1px solid ${agentColor}30` }}>
            View All Outputs
          </button>
          <button onClick={onDismiss} className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1">Dismiss</button>
        </div>
      </div>
    </div>
  );
};

export default SymbioticNotification;
