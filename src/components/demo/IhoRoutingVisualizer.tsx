import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Shield, Zap, ArrowRight, Search, CheckCircle2, AlertTriangle } from "lucide-react";
import { useIhoRouter } from "@/hooks/useIhoRouter";
import type { RoutingResult } from "@/data/agentSkillConfig";

const EXAMPLE_QUERIES = [
  "Help me write a restaurant health & safety plan",
  "I need a building consent application reviewed",
  "Design a social media campaign for my brand",
  "Create a quarterly financial forecast",
  "Track my fleet vehicles across Auckland",
  "Review my API deployment checklist",
  "Draft a whānau engagement strategy",
  "Plan next week's family meals and school runs",
  "Build a rugby league training programme",
];

interface StepState {
  step: number;
  label: string;
  active: boolean;
  complete: boolean;
  detail?: string;
}

const STEP_LABELS = [
  "Intent Classification",
  "Target Kete",
  "Shared Foundation",
  "Kete Tools",
  "Agent Skills",
  "Governance",
  "Execute",
];

const IhoRoutingVisualizer = () => {
  const { route } = useIhoRouter();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<RoutingResult | null>(null);
  const [steps, setSteps] = useState<StepState[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<number[]>([]);

  const clearTimers = () => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  };

  const runVisualization = useCallback((input: string) => {
    if (!input.trim() || isAnimating) return;
    clearTimers();
    setIsAnimating(true);
    setResult(null);

    const routing = route(input);
    const keteLabel = routing.targetKete?.name ?? "GOVERNANCE";
    const agentLabel = routing.targetAgentName ?? "NOVA";
    const govLabels = routing.governanceCheckpoints.length > 0
      ? routing.governanceCheckpoints.join(", ")
      : "No flags";

    const stepDetails = [
      `Analyzing: "${input.slice(0, 50)}${input.length > 50 ? '…' : ''}"`,
      `→ ${keteLabel} (${routing.targetKete?.purpose ?? 'General operations'})`,
      `${routing.skills.filter(s => s.category === 'core' || s.category === 'productivity' || s.category === 'documents' || s.category === 'brand').length} foundation skills loaded`,
      `${routing.targetKete?.keteSkills.length ?? 0} kete-specific skills`,
      `Agent: ${agentLabel}`,
      govLabels,
      `Ready — ${routing.skills.length} skills · ${routing.mcps.length} MCPs`,
    ];

    const initial: StepState[] = STEP_LABELS.map((label, i) => ({
      step: i,
      label,
      active: false,
      complete: false,
      detail: stepDetails[i],
    }));
    setSteps(initial);

    STEP_LABELS.forEach((_, i) => {
      const t1 = window.setTimeout(() => {
        setSteps(prev => prev.map((s, j) => ({
          ...s,
          active: j === i,
          complete: j < i,
        })));
      }, 400 + i * 500);
      timerRef.current.push(t1);
    });

    const tFinal = window.setTimeout(() => {
      setSteps(prev => prev.map(s => ({ ...s, active: false, complete: true })));
      setResult(routing);
      setIsAnimating(false);
    }, 400 + STEP_LABELS.length * 500);
    timerRef.current.push(tFinal);
  }, [route, isAnimating]);

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="relative mb-8">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--muted-foreground))' }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && runVisualization(query)}
          placeholder="Type a question to see how Iho routes it…"
          className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-body outline-none transition-all duration-300 focus:ring-1"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'hsl(var(--foreground))',
          }}
        />
        <button
          onClick={() => runVisualization(query)}
          disabled={isAnimating || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-[11px] font-display font-bold transition-all disabled:opacity-30"
          style={{ background: '#3A7D6E', color: '#3D4250' }}
        >
          Route
        </button>
      </div>

      {/* Example Queries */}
      <div className="flex flex-wrap gap-1.5 mb-8">
        {EXAMPLE_QUERIES.map(q => (
          <button
            key={q}
            onClick={() => { setQuery(q); runVisualization(q); }}
            disabled={isAnimating}
            className="text-[10px] font-body px-2.5 py-1 rounded-full transition-all hover:bg-white/[0.06] disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.03)', color: 'hsl(var(--muted-foreground))', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {q.length > 45 ? q.slice(0, 45) + '…' : q}
          </button>
        ))}
      </div>

      {/* Pipeline Steps */}
      <AnimatePresence mode="wait">
        {steps.length > 0 && (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {steps.map((s, i) => {
              const icons = [Search, Layers, Layers, Zap, Layers, Shield, ArrowRight];
              const Icon = icons[i] ?? Zap;
              const accent = s.active ? '#3A7D6E' : s.complete ? '#22C55E' : 'rgba(255,255,255,0.2)';

              return (
                <motion.div
                  key={s.step}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300"
                  style={{
                    background: s.active ? 'rgba(58,125,110,0.08)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${s.active ? 'rgba(58,125,110,0.25)' : 'rgba(255,255,255,0.04)'}`,
                    boxShadow: s.active ? '0 0 20px rgba(58,125,110,0.08)' : 'none',
                  }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${accent}20`, color: accent }}>
                    {s.complete ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-xs" style={{ color: s.active || s.complete ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>
                      {s.label}
                    </p>
                    {(s.active || s.complete) && s.detail && (
                      <motion.p
                        className="font-mono text-[10px] mt-0.5 truncate"
                        style={{ color: 'hsl(var(--muted-foreground))' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {s.detail}
                      </motion.p>
                    )}
                  </div>
                  {s.active && (
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: '#3A7D6E' }}
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Summary */}
      <AnimatePresence>
        {result && (
          <motion.div
            className="mt-6 rounded-xl p-5"
            style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={14} style={{ color: '#22C55E' }} />
              <p className="font-display font-bold text-sm" style={{ color: '#22C55E' }}>Routing Complete</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Kete', value: result.targetKete?.name ?? 'GOVERNANCE' },
                { label: 'Agent', value: result.targetAgentName ?? 'NOVA' },
                { label: 'Skills', value: `${result.skills.length}` },
                { label: 'MCPs', value: `${result.mcps.length}` },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>{item.label}</p>
                  <p className="font-display font-bold text-sm mt-0.5" style={{ color: 'hsl(var(--foreground))' }}>{item.value}</p>
                </div>
              ))}
            </div>
            {result.governanceCheckpoints.length > 0 && (
              <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <AlertTriangle size={12} style={{ color: '#EAB308' }} />
                <p className="font-mono text-[10px]" style={{ color: '#EAB308' }}>
                  Governance: {result.governanceCheckpoints.join(' → ')}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IhoRoutingVisualizer;
