import { useState, useEffect } from "react";
import { agents } from "@/data/agents";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Circle, XCircle, RefreshCw } from "lucide-react";
import type { WorkflowStep } from "@/engine/self-healing";

interface WorkflowVisualiserProps {
  steps: { agentId: string; action: string; status: string }[];
  compact?: boolean;
  className?: string;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  success: <CheckCircle2 size={14} />,
  running: <Loader2 size={14} className="animate-spin" />,
  retrying: <RefreshCw size={14} className="animate-spin" />,
  healed: <CheckCircle2 size={14} />,
  failed: <XCircle size={14} />,
  pending: <Circle size={14} />,
};

const STATUS_LABEL: Record<string, string> = {
  success: "Done",
  running: "Running",
  retrying: "Retrying",
  healed: "Healed",
  failed: "Failed",
  pending: "Pending",
};

const WorkflowVisualiser = ({ steps, compact = false, className = "" }: WorkflowVisualiserProps) => {
  return (
    <div className={`${className}`}>
      <div className={`flex items-start ${compact ? "gap-2 overflow-x-auto pb-2 scrollbar-hide" : "gap-1 overflow-x-auto pb-3 scrollbar-hide"}`}>
        {steps.map((step, i) => {
          const agent = agents.find((a) => a.id === step.agentId || a.name.toUpperCase() === step.agentId.toUpperCase());
          const color = agent?.color || "#888";
          const isActive = step.status === "running" || step.status === "retrying";
          const isDone = step.status === "success" || step.status === "healed";
          const isFailed = step.status === "failed";

          return (
            <div key={i} className="flex items-center shrink-0">
              {/* Node */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.15, duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <div
                  className={`${compact ? "w-10 h-10" : "w-12 h-12"} rounded-full flex items-center justify-center relative transition-all duration-500`}
                  style={{
                    backgroundColor: isDone ? color + "25" : isActive ? color + "15" : "rgba(255,255,255,0.04)",
                    border: `2px solid ${isDone ? color : isActive ? color + "80" : "rgba(255,255,255,0.08)"}`,
                    boxShadow: isActive ? `0 0 20px ${color}40` : isDone ? `0 0 12px ${color}20` : "none",
                  }}
                >
                  {/* Pulse ring for active */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: `2px solid ${color}` }}
                      animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  <span
                    style={{
                      color: isDone || isActive ? color : isFailed ? "#FF4D6A" : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {STATUS_ICON[step.status] || STATUS_ICON.pending}
                  </span>
                </div>
                <span
                  className={`${compact ? "text-[8px]" : "text-[9px]"} font-bold mt-1.5 font-mono tracking-wider`}
                  style={{ color: isDone || isActive ? color : "rgba(255,255,255,0.3)" }}
                >
                  {agent?.name || step.agentId}
                </span>
                {!compact && (
                  <span className="text-[8px] text-muted-foreground/50 mt-0.5 max-w-[80px] truncate text-center">
                    {step.action}
                  </span>
                )}
                {!compact && (
                  <span
                    className="text-[7px] mt-0.5 font-medium"
                    style={{
                      color: isDone ? "#5AADA0" : isActive ? color : isFailed ? "#FF4D6A" : "rgba(255,255,255,0.2)",
                    }}
                  >
                    {STATUS_LABEL[step.status] || "Pending"}
                  </span>
                )}
              </motion.div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className={`${compact ? "w-6" : "w-10"} h-[2px] relative mx-0.5`}>
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: isDone
                        ? `linear-gradient(90deg, ${color}, ${
                            agents.find((a) => a.id === steps[i + 1].agentId || a.name.toUpperCase() === steps[i + 1].agentId.toUpperCase())?.color || "#888"
                          })`
                        : "rgba(255,255,255,0.06)",
                    }}
                  />
                  {/* Animated flow for active connections */}
                  {isActive && (
                    <motion.div
                      className="absolute top-0 h-full w-3 rounded-full"
                      style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
                      animate={{ left: ["-12px", "100%"] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowVisualiser;
