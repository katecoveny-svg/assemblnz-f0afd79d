import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Layers, PenTool, Palette, Shield, ArrowRight, CheckCircle2, Loader2, Sparkles, Play } from "lucide-react";

const WORKFLOW_STEPS = [
  {
    agent: "SAGE",
    role: "Business Strategy",
    icon: Layers,
    color: "#1A3A5C",
    action: "Provides topic direction, key points, and audience insight",
    output: "Strategic brief with audience persona and core messaging",
  },
  {
    agent: "MUSE",
    role: "Copywriting",
    icon: PenTool,
    color: "#A8DDDB",
    action: "Writes the script — conversational, not robotic",
    output: "Full episode script with dialogue, transitions, and hooks",
  },
  {
    agent: "KŌRERO",
    role: "Podcast Production",
    icon: Mic,
    color: "#A8DDDB",
    action: "Handles audio structure, intro/outro, music beds, timing",
    output: "Production-ready episode plan with segment breakdowns",
  },
  {
    agent: "PRISM",
    role: "Brand Alignment",
    icon: Palette,
    color: "#A8DDDB",
    action: "Ensures content aligns with brand voice and visual identity",
    output: "Brand-checked script with tone adjustments and social assets",
  },
  {
    agent: "KAHU",
    role: "Compliance Check",
    icon: Shield,
    color: "#3A7D6E",
    action: "Screens for anything that shouldn't be said publicly",
    output: "Compliance report — flagged terms, privacy checks, all clear",
  },
];

interface KoreroWorkflowProps {
  onSendToChat?: (msg: string) => void;
}

export default function KoreroWorkflow({ onSendToChat }: KoreroWorkflowProps) {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const simulateWorkflow = () => {
    setIsRunning(true);
    setCompletedSteps([]);
    setActiveStep(0);

    WORKFLOW_STEPS.forEach((_, i) => {
      setTimeout(() => {
        setActiveStep(i);
        if (i > 0) setCompletedSteps((prev) => [...prev, i - 1]);
      }, i * 1800);
    });

    setTimeout(() => {
      setCompletedSteps([0, 1, 2, 3, 4]);
      setActiveStep(null);
      setIsRunning(false);
    }, WORKFLOW_STEPS.length * 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <p className="font-mono text-[10px] uppercase tracking-[3px] mb-2" style={{ color: "hsl(var(--kowhai))" }}>
          Multi-Agent Workflow
        </p>
        <h3 className="font-display text-lg font-bold text-foreground mb-1">
          5 agents. 1 podcast episode. Under 5 minutes.
        </h3>
        <p className="text-xs text-muted-foreground font-body max-w-md mx-auto">
          KŌRERO orchestrates your specialist team — from strategy to compliance-checked, brand-aligned content.
        </p>
      </div>

      {/* Workflow Pipeline */}
      <div className="relative space-y-3">
        {WORKFLOW_STEPS.map((step, i) => {
          const isActive = activeStep === i;
          const isComplete = completedSteps.includes(i);
          const Icon = step.icon;

          return (
            <motion.div
              key={step.agent}
              className="relative rounded-xl p-4 cursor-pointer transition-all duration-300"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${step.color}12, ${step.color}06)`
                  : "hsl(var(--surface-1) / 0.5)",
                border: `1px solid ${isActive ? `${step.color}40` : isComplete ? `${step.color}20` : "hsl(var(--border) / 0.4)"}`,
                boxShadow: isActive ? `0 0 24px -8px ${step.color}30` : "none",
              }}
              onClick={() => setActiveStep(isActive ? null : i)}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-center gap-3">
                {/* Status indicator */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${step.color}15`,
                    border: `1px solid ${step.color}25`,
                  }}
                >
                  {isComplete ? (
                    <CheckCircle2 size={16} style={{ color: step.color }} />
                  ) : isActive ? (
                    <Loader2 size={16} className="animate-spin" style={{ color: step.color }} />
                  ) : (
                    <Icon size={16} style={{ color: step.color, opacity: 0.7 }} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-xs" style={{ color: step.color }}>
                      {step.agent}
                    </span>
                    <span className="text-[10px] font-body text-muted-foreground/50">
                      {step.role}
                    </span>
                  </div>
                  <p className="text-[11px] font-body text-muted-foreground leading-snug mt-0.5">
                    {step.action}
                  </p>
                </div>

                {/* Arrow connector */}
                {i < WORKFLOW_STEPS.length - 1 && (
                  <ArrowRight
                    size={12}
                    className="shrink-0"
                    style={{ color: isComplete ? step.color : "hsl(var(--muted-foreground) / 0.2)" }}
                  />
                )}
              </div>

              {/* Expanded output */}
              <AnimatePresence>
                {(isActive || isComplete) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="mt-3 pt-3 text-[10px] font-mono text-muted-foreground/60"
                      style={{ borderTop: `1px solid ${step.color}15` }}
                    >
                      <span className="uppercase tracking-wider">Output:</span>{" "}
                      <span className="text-foreground/50">{step.output}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={simulateWorkflow}
          disabled={isRunning}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-display font-bold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, hsl(var(--kowhai)), hsl(var(--kowhai) / 0.8))",
            color: "#0A0A0F",
          }}
        >
          {isRunning ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Running workflow…
            </>
          ) : completedSteps.length === 5 ? (
            <>
              <Sparkles size={14} /> Run again
            </>
          ) : (
            <>
              <Play size={14} /> Demo workflow
            </>
          )}
        </button>

        {onSendToChat && (
          <button
            onClick={() =>
              onSendToChat(
                "Create a complete podcast episode using the multi-agent workflow. Topic: [describe your topic]. Use SAGE for strategy, MUSE for scripting, KŌRERO for production, PRISM for brand alignment, and KAHU for compliance."
              )
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-display font-bold transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: "hsl(var(--surface-2) / 0.5)",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
            }}
          >
            <Mic size={14} /> Start a podcast
          </button>
        )}
      </div>

      {/* Completion state */}
      <AnimatePresence>
        {completedSteps.length === 5 && !isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-4 rounded-xl"
            style={{
              background: "hsl(var(--pounamu) / 0.08)",
              border: "1px solid hsl(var(--pounamu) / 0.2)",
            }}
          >
            <CheckCircle2 size={20} className="mx-auto mb-2" style={{ color: "hsl(var(--pounamu))" }} />
            <p className="text-xs font-display font-bold text-foreground">Workflow complete</p>
            <p className="text-[10px] font-body text-muted-foreground mt-1">
              5 agents collaborated to produce a compliance-checked, brand-aligned podcast episode
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
